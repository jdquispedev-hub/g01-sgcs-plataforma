import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { EstadoAsignacion } from '@prisma/client';

export const dynamic = 'force-dynamic';

const crearActividadSchema = z.object({
  proyecto_id: z.string().uuid(),
  etapa_id: z.string().uuid().optional().nullable(),
  titulo: z.string().min(3).max(200),
  descripcion: z.string().optional(),
  codigo_caso_uso: z.string().max(50).optional(),
  fecha_inicio: z.string(),
  fecha_fin: z.string(),
  responsable_id: z.string().uuid().optional().nullable(),
  ecs_id: z.string().uuid().optional().nullable(),
});

// GET: Listar actividades del cronograma
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const proyectoId = searchParams.get('proyectoId');
    const misAsignaciones = searchParams.get('misAsignaciones') === 'true';

    const where: any = {};

    if (misAsignaciones) {
      where.responsable_id = session.userId;
    }

    if (proyectoId) {
      where.proyecto_id = proyectoId;
    }

    // Filtrar por proyectos que pertenezcan a la organización
    where.proyecto = {
      organizacion_id: session.organizacionId,
    };

    const actividades = await prisma.actividadCronograma.findMany({
      where,
      include: {
        etapa: true,
        ecs: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            tipo: true,
          },
        },
        responsable: {
          select: {
            id: true,
            nombre_completo: true,
            email: true,
            cargo: true,
          },
        },
        proyecto: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            metodologia: true,
          },
        },
      },
      orderBy: { fecha_inicio: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: actividades,
    });
  } catch (error) {
    console.error('Error al listar actividades del cronograma:', error);
    return NextResponse.json({ success: false, message: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST: Registrar y asignar una actividad en el cronograma
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    if (!['SUPERADMIN', 'ADMINISTRADOR'].includes(session.rol)) {
      return NextResponse.json(
        { success: false, message: 'Solo los administradores pueden asignar actividades en el cronograma' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = crearActividadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Datos de actividad inválidos', errors: validation.error.format() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Verificar que el proyecto pertenezca a la organización
    const proyecto = await prisma.proyectoCaso.findFirst({
      where: { id: data.proyecto_id, organizacion_id: session.organizacionId },
    });

    if (!proyecto) {
      return NextResponse.json({ success: false, message: 'Proyecto no encontrado' }, { status: 404 });
    }

    const nuevaActividad = await prisma.actividadCronograma.create({
      data: {
        proyecto_id: data.proyecto_id,
        etapa_id: data.etapa_id || null,
        titulo: data.titulo.trim(),
        descripcion: data.descripcion?.trim() || null,
        codigo_caso_uso: data.codigo_caso_uso?.trim().toUpperCase() || 'CU01',
        fecha_inicio: new Date(data.fecha_inicio),
        fecha_fin: new Date(data.fecha_fin),
        responsable_id: data.responsable_id || null,
        ecs_id: data.ecs_id || null,
        // Al asignar, nace como PENDIENTE_ACEPTACION según la regla del docente
        estado_asignacion: data.responsable_id
          ? EstadoAsignacion.PENDIENTE_ACEPTACION
          : EstadoAsignacion.PENDIENTE_ACEPTACION,
      },
      include: {
        responsable: {
          select: { id: true, nombre_completo: true, email: true },
        },
        ecs: true,
      },
    });

    // Auditoría
    await prisma.auditoriaLog.create({
      data: {
        usuario_id: session.userId,
        accion: 'CREAR_ACTIVIDAD_CRONOGRAMA',
        entidad: 'ACTIVIDAD_CRONOGRAMA',
        entidad_id: nuevaActividad.id,
        datos_nuevos: {
          titulo: nuevaActividad.titulo,
          responsable_id: nuevaActividad.responsable_id,
          estado_asignacion: nuevaActividad.estado_asignacion,
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Actividad registrada en el cronograma exitosamente',
        data: nuevaActividad,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error al registrar actividad en cronograma:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
