import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { TipoEcs } from '@prisma/client';

// Esquema de validación para registrar y actualizar ECS (RNF-05)
const ecsSchema = z.object({
  proyecto_id: z.string().uuid('ID de proyecto inválido'),
  codigo: z.string().min(2, 'El código debe tener al menos 2 caracteres').max(50),
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(200),
  tipo: z.nativeEnum(TipoEcs, {
    errorMap: () => ({ message: 'Tipo de ECS inválido' }),
  }),
  descripcion: z.string().optional(),
  ubicacion: z.string().min(1, 'La ubicación física, enlace o repositorio es requerida'),
  responsable_id: z.string().uuid('ID de responsable inválido'),
  atributos_personalizados: z.record(z.any()).optional().default({}),
});

// -------------------------------------------------------------
// GET: Listar y filtrar ECS (RF-05, RNF-04 < 3s)
// -------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const tipo = searchParams.get('tipo');
    const proyectoId = searchParams.get('proyectoId');

    // Scoping multi-tenant: garantizar que los ECS pertenezcan a la organización del usuario (RNF-02)
    const whereClause: any = {
      proyecto: {
        organizacion_id: session.organizacionId,
      },
    };

    if (proyectoId) {
      whereClause.proyecto_id = proyectoId;
    }

    if (tipo && Object.values(TipoEcs).includes(tipo as TipoEcs)) {
      whereClause.tipo = tipo as TipoEcs;
    }

    if (search.trim()) {
      whereClause.OR = [
        { codigo: { contains: search.trim(), mode: 'insensitive' } },
        { nombre: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    // Consulta con inclusión de relaciones y conteo de versiones
    const ecsList = await prisma.ecs.findMany({
      where: whereClause,
      include: {
        proyecto: { select: { id: true, codigo: true, nombre: true } },
        responsable: { select: { id: true, nombre_completo: true, email: true } },
        versiones: {
          select: {
            id: true,
            numero_version: true,
            estado: true,
            created_at: true,
          },
          orderBy: { created_at: 'desc' },
        },
      },
      orderBy: { created_at: 'desc' },
      take: 100, // Paginación inicial rápida para asegurar RNF-04
    });

    return NextResponse.json({
      success: true,
      data: ecsList,
    });
  } catch (error) {
    console.error('Error al consultar ECS:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno al consultar los Elementos de Configuración' },
      { status: 500 }
    );
  }
}

// -------------------------------------------------------------
// POST: Registrar nuevo ECS (RF-04, RNF-10 Auditoría)
// -------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const validation = ecsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Datos de entrada inválidos', errors: validation.error.format() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Verificar que el proyecto pertenezca a la organización del usuario (RNF-02)
    const proyecto = await prisma.proyectoCaso.findFirst({
      where: {
        id: data.proyecto_id,
        organizacion_id: session.organizacionId,
      },
    });

    if (!proyecto) {
      return NextResponse.json(
        { success: false, message: 'El proyecto indicado no pertenece a su organización' },
        { status: 403 }
      );
    }

    // Verificar código único dentro del proyecto (RF-04)
    const existing = await prisma.ecs.findFirst({
      where: {
        proyecto_id: data.proyecto_id,
        codigo: data.codigo.trim().toUpperCase(),
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: `Ya existe un ECS con el código "${data.codigo.toUpperCase()}" en este proyecto` },
        { status: 409 }
      );
    }

    // Transacción ACID para crear ECS y registrar auditoría (RNF-08, RNF-10)
    const nuevoEcs = await prisma.$transaction(async (tx) => {
      const ecsCreado = await tx.ecs.create({
        data: {
          proyecto_id: data.proyecto_id,
          codigo: data.codigo.trim().toUpperCase(),
          nombre: data.nombre.trim(),
          tipo: data.tipo,
          descripcion: data.descripcion,
          ubicacion: data.ubicacion.trim(),
          responsable_id: data.responsable_id,
          atributos_personalizados: data.atributos_personalizados,
        },
      });

      // Auditoría automática (RNF-10)
      await tx.auditoriaLog.create({
        data: {
          usuario_id: session.userId,
          accion: 'CREAR_ECS',
          entidad: 'ECS',
          entidad_id: ecsCreado.id,
          datos_nuevos: {
            codigo: ecsCreado.codigo,
            nombre: ecsCreado.nombre,
            tipo: ecsCreado.tipo,
            proyecto_id: ecsCreado.proyecto_id,
          },
          ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
          user_agent: request.headers.get('user-agent') || 'desconocido',
        },
      });

      return ecsCreado;
    });

    return NextResponse.json({
      success: true,
      message: 'Elemento de Configuración registrado exitosamente',
      data: nuevoEcs,
    });
  } catch (error) {
    console.error('Error al crear ECS:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno al registrar el Elemento de Configuración' },
      { status: 500 }
    );
  }
}
