import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { EstadoLineaBase, RolUsuario } from '@prisma/client';

export const dynamic = 'force-dynamic';

// Esquema de validación para establecer Línea Base (RF-09, RNF-05)
const lineaBaseSchema = z.object({
  proyecto_id: z.string().uuid('ID de proyecto inválido'),
  codigo: z
    .string()
    .min(2, 'El código debe tener al menos 2 caracteres')
    .max(50, 'El código no puede exceder 50 caracteres'),
  nombre: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(200, 'El nombre no puede exceder 200 caracteres'),
  descripcion: z.string().optional().nullable(),
  versiones_ids: z
    .array(z.string().uuid('ID de versión inválido'))
    .min(1, 'Debe seleccionar al menos una versión aprobada para congelar en la línea base'),
  marcar_anteriores_obsoletas: z.boolean().default(true),
});

// -------------------------------------------------------------
// GET: Listar y filtrar Líneas Base (RF-10, RNF-04 < 3s)
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

    // Scoping multi-tenant: solo líneas base de la organización del usuario (RNF-02)
    const whereClause: any = {
      proyecto: {
        organizacion_id: session.organizacionId,
      },
    };

    if (proyectoId) {
      whereClause.proyecto_id = proyectoId;
    }

    if (estado && Object.values(EstadoLineaBase).includes(estado as EstadoLineaBase)) {
      whereClause.estado = estado as EstadoLineaBase;
    }

    if (search.trim()) {
      whereClause.OR = [
        { codigo: { contains: search.trim(), mode: 'insensitive' } },
        { nombre: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const lineasBase = await prisma.lineaBase.findMany({
      where: whereClause,
      include: {
        proyecto: {
          select: { id: true, codigo: true, nombre: true },
        },
        autor: {
          select: { id: true, nombre_completo: true, email: true, rol: true },
        },
        _count: {
          select: { versiones: true },
        },
      },
      orderBy: { created_at: 'desc' },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      data: lineasBase,
    });
  } catch (error) {
    console.error('Error al consultar Líneas Base:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno al consultar las Líneas Base' },
      { status: 500 }
    );
  }
}

// -------------------------------------------------------------
// POST: Establecer nueva Línea Base inmutable (RF-09, RNF-08, RNF-10)
// -------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    // Verificación de rol: Solo Administrador y Aprobador pueden establecer Líneas Base (RF-03, RNF-02)
    const rolesPermitidos: RolUsuario[] = [RolUsuario.SUPERADMIN, RolUsuario.ADMINISTRADOR, RolUsuario.APROBADOR];
    if (!rolesPermitidos.includes(session.rol)) {
      return NextResponse.json(
        { success: false, message: 'Permiso denegado: solo el Responsable de Aprobación o Administrador puede establecer una Línea Base' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = lineaBaseSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Datos de entrada inválidos', errors: validation.error.format() },
        { status: 400 }
      );
    }

    const data = validation.data;
    const codigoNormalizado = data.codigo.trim().toUpperCase();

    // 1. Verificar que el proyecto pertenezca a la organización
    const proyecto = await prisma.proyectoCaso.findFirst({
      where: {
        id: data.proyecto_id,
        organizacion_id: session.organizacionId,
      },
    });

    if (!proyecto) {
      return NextResponse.json(
        { success: false, message: 'El proyecto indicado no pertenece a su organización' },
        { status: 404 }
      );
    }

    // 2. Verificar código único dentro del proyecto
    const existingCodigo = await prisma.lineaBase.findFirst({
      where: {
        proyecto_id: data.proyecto_id,
        codigo: codigoNormalizado,
      },
    });

    if (existingCodigo) {
      return NextResponse.json(
        { success: false, message: `Ya existe una Línea Base con el código "${codigoNormalizado}" en este proyecto` },
        { status: 409 }
      );
    }

    // 3. Regla Estricta (RF-09): Validar que TODAS las versiones seleccionadas existan,
    // pertenezcan al proyecto y tengan estrictamente estado "APROBADA".
    const versionesValidas = await prisma.versionEcs.findMany({
      where: {
        id: { in: data.versiones_ids },
        ecs: {
          proyecto_id: data.proyecto_id,
        },
      },
      select: {
        id: true,
        numero_version: true,
        estado: true,
        ecs: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
          },
        },
      },
    });

    if (versionesValidas.length !== data.versiones_ids.length) {
      return NextResponse.json(
        {
          success: false,
          message: 'Algunas versiones seleccionadas no existen o no corresponden a los ECS de este proyecto',
        },
        { status: 400 }
      );
    }

    const versionesNoAprobadas = versionesValidas.filter((v) => v.estado !== 'APROBADA');
    if (versionesNoAprobadas.length > 0) {
      const detalle = versionesNoAprobadas
        .map((v) => `${v.ecs.codigo} (v${v.numero_version}: ${v.estado})`)
        .join(', ');
      return NextResponse.json(
        {
          success: false,
          message: `Regla de Línea Base violada (RF-09): Solo se pueden congelar versiones en estado APROBADA. Las siguientes versiones no están aprobadas: ${detalle}`,
        },
        { status: 400 }
      );
    }

    // 4. Transacción ACID estricta (RNF-08):
    // - Creación de la línea base
    // - Creación de los vínculos inmutables LineaBaseVersion
    // - Si corresponde, marcar líneas base vigentes anteriores como OBSOLETAS
    // - Registro automático en auditoria_logs (RNF-10)
    const nuevaLineaBase = await prisma.$transaction(async (tx) => {
      // Si se especificó marcar anteriores como obsoletas, actualizar las previas
      if (data.marcar_anteriores_obsoletas) {
        await tx.lineaBase.updateMany({
          where: {
            proyecto_id: data.proyecto_id,
            estado: EstadoLineaBase.VIGENTE,
          },
          data: {
            estado: EstadoLineaBase.OBSOLETA,
          },
        });
      }

      // Crear registro de la Línea Base
      const lineaCreada = await tx.lineaBase.create({
        data: {
          proyecto_id: data.proyecto_id,
          codigo: codigoNormalizado,
          nombre: data.nombre.trim(),
          descripcion: data.descripcion ? data.descripcion.trim() : null,
          autor_id: session.userId,
          estado: EstadoLineaBase.VIGENTE,
        },
      });

      // Crear los registros de congelamiento inmutable
      await tx.lineaBaseVersion.createMany({
        data: data.versiones_ids.map((versionId) => ({
          linea_base_id: lineaCreada.id,
          version_ecs_id: versionId,
        })),
      });

      // Registrar auditoría formal inmutable (RNF-10)
      await tx.auditoriaLog.create({
        data: {
          usuario_id: session.userId,
          accion: 'ESTABLECER_LINEA_BASE',
          entidad: 'LINEA_BASE',
          entidad_id: lineaCreada.id,
          datos_nuevos: {
            codigo: lineaCreada.codigo,
            nombre: lineaCreada.nombre,
            proyecto_id: lineaCreada.proyecto_id,
            total_versiones_congeladas: data.versiones_ids.length,
            marcar_anteriores_obsoletas: data.marcar_anteriores_obsoletas,
          },
          ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
          user_agent: request.headers.get('user-agent') || 'desconocido',
        },
      });

      return lineaCreada;
    });

    return NextResponse.json(
      {
        success: true,
        message: `Línea Base "${nuevaLineaBase.codigo}" establecida y congelada con éxito`,
        data: nuevaLineaBase,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al establecer Línea Base:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno al establecer la Línea Base' },
      { status: 500 }
    );
  }
}
