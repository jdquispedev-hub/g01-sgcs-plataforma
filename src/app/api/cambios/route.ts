import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { EstadoCambio } from '@prisma/client';

export const dynamic = 'force-dynamic';

const crearRfcSchema = z.object({
  ecs_id: z.string().uuid('ID de ECS inválido'),
  version_base_id: z.string().uuid('ID de versión base inválido'),
  codigo: z
    .string()
    .min(3, 'El código debe tener al menos 3 caracteres')
    .max(50, 'El código no puede superar 50 caracteres'),
  descripcion: z
    .string()
    .min(5, 'La descripción técnica del cambio debe tener al menos 5 caracteres'),
  justificacion: z
    .string()
    .min(5, 'La justificación operativa o de negocio debe tener al menos 5 caracteres'),
});

// -------------------------------------------------------------
// GET: Listar Solicitudes de Cambio (RF-12, RNF-04 < 3s)
// -------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const estado = searchParams.get('estado');
    const proyectoId = searchParams.get('proyectoId');

    // Scoping multi-tenant estricto (RNF-02)
    const whereClause: any = {
      ecs: {
        proyecto: {
          organizacion_id: session.organizacionId,
        },
      },
    };

    if (proyectoId) {
      whereClause.ecs.proyecto_id = proyectoId;
    }

    if (estado && Object.values(EstadoCambio).includes(estado as EstadoCambio)) {
      whereClause.estado = estado as EstadoCambio;
    }

    if (search.trim()) {
      whereClause.OR = [
        { codigo: { contains: search.trim(), mode: 'insensitive' } },
        { descripcion: { contains: search.trim(), mode: 'insensitive' } },
        { justificacion: { contains: search.trim(), mode: 'insensitive' } },
        { ecs: { codigo: { contains: search.trim(), mode: 'insensitive' } } },
        { ecs: { nombre: { contains: search.trim(), mode: 'insensitive' } } },
      ];
    }

    const solicitudes = await prisma.solicitudCambio.findMany({
      where: whereClause,
      include: {
        ecs: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            tipo: true,
            proyecto: {
              select: {
                id: true,
                codigo: true,
                nombre: true,
              },
            },
          },
        },
        version_base: {
          select: {
            id: true,
            numero_version: true,
            descripcion: true,
          },
        },
        version_resultante: {
          select: {
            id: true,
            numero_version: true,
          },
        },
        solicitante: {
          select: {
            id: true,
            nombre_completo: true,
            email: true,
            rol: true,
          },
        },
        resolutor: {
          select: {
            id: true,
            nombre_completo: true,
          },
        },
        evaluacion: {
          select: {
            id: true,
            impacto: true,
            observaciones: true,
            created_at: true,
          },
        },
        _count: {
          select: {
            ecs_afectados: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      data: solicitudes,
    });
  } catch (error) {
    console.error('Error al consultar Solicitudes de Cambio:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno al consultar las solicitudes de cambio' },
      { status: 500 }
    );
  }
}

// -------------------------------------------------------------
// POST: Registrar nueva Solicitud de Cambio (RFC) (RF-11, RNF-10)
// -------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const validation = crearRfcSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Datos de entrada inválidos', errors: validation.error.format() },
        { status: 400 }
      );
    }

    const data = validation.data;
    const codigoNormalizado = data.codigo.trim().toUpperCase();

    // 1. Verificar que el ECS pertenezca a la organización
    const ecs = await prisma.ecs.findFirst({
      where: {
        id: data.ecs_id,
        proyecto: {
          organizacion_id: session.organizacionId,
        },
      },
      include: {
        proyecto: true,
      },
    });

    if (!ecs) {
      return NextResponse.json(
        { success: false, message: 'El Elemento de Configuración no pertenece a su organización' },
        { status: 404 }
      );
    }

    // 2. Verificar que la versión base exista y pertenezca al ECS
    const versionBase = await prisma.versionEcs.findFirst({
      where: {
        id: data.version_base_id,
        ecs_id: data.ecs_id,
      },
    });

    if (!versionBase) {
      return NextResponse.json(
        { success: false, message: 'La versión base seleccionada no corresponde a este ECS' },
        { status: 400 }
      );
    }

    // 3. Verificar código único de RFC
    const existingCodigo = await prisma.solicitudCambio.findUnique({
      where: {
        codigo: codigoNormalizado,
      },
    });

    if (existingCodigo) {
      return NextResponse.json(
        { success: false, message: `Ya existe una Solicitud de Cambio con el código "${codigoNormalizado}"` },
        { status: 409 }
      );
    }

    // 4. Transacción ACID: Crear la RFC y registrar auditoría (RNF-08, RNF-10)
    const nuevaSolicitud = await prisma.$transaction(async (tx) => {
      const rfc = await tx.solicitudCambio.create({
        data: {
          codigo: codigoNormalizado,
          ecs_id: data.ecs_id,
          version_base_id: data.version_base_id,
          descripcion: data.descripcion.trim(),
          justificacion: data.justificacion.trim(),
          solicitante_id: session.userId,
          estado: EstadoCambio.PENDIENTE_EVALUACION,
        },
      });

      await tx.auditoriaLog.create({
        data: {
          usuario_id: session.userId,
          accion: 'CREAR_SOLICITUD_CAMBIO',
          entidad: 'SOLICITUD_CAMBIO',
          entidad_id: rfc.id,
          datos_nuevos: {
            codigo: rfc.codigo,
            ecs_id: rfc.ecs_id,
            version_base_id: rfc.version_base_id,
            estado: rfc.estado,
          },
          ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
          user_agent: request.headers.get('user-agent') || 'desconocido',
        },
      });

      return rfc;
    });

    return NextResponse.json(
      {
        success: true,
        message: `Solicitud de Cambio "${nuevaSolicitud.codigo}" radicada exitosamente`,
        data: nuevaSolicitud,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al radicar Solicitud de Cambio:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno al radicar la Solicitud de Cambio' },
      { status: 500 }
    );
  }
}
