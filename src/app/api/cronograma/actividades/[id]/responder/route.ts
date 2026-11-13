import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { EstadoAsignacion } from '@prisma/client';

export const dynamic = 'force-dynamic';

const responderActividadSchema = z.object({
  accion: z.enum(['ACEPTAR', 'RECHAZAR']),
  motivo: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const actividadId = params.id;
    const body = await request.json();
    const validation = responderActividadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Datos de respuesta inválidos', errors: validation.error.format() },
        { status: 400 }
      );
    }

    const { accion, motivo } = validation.data;

    // Buscar actividad y verificar que pertenezca a la organización
    const actividad = await prisma.actividadCronograma.findFirst({
      where: {
        id: actividadId,
        proyecto: {
          organizacion_id: session.organizacionId,
        },
      },
      include: {
        proyecto: true,
      },
    });

    if (!actividad) {
      return NextResponse.json(
        { success: false, message: 'Actividad de cronograma no encontrada' },
        { status: 404 }
      );
    }

    // Validar que el usuario sea el asignado o un administrador
    const esAsignado = actividad.responsable_id === session.userId;
    const esAdmin = ['SUPERADMIN', 'ADMINISTRADOR'].includes(session.rol);

    if (!esAsignado && !esAdmin) {
      return NextResponse.json(
        { success: false, message: 'Solo el usuario asignado o el administrador pueden responder a esta actividad' },
        { status: 403 }
      );
    }

    if (accion === 'RECHAZAR' && (!motivo || motivo.trim().length < 5)) {
      return NextResponse.json(
        { success: false, message: 'Para rechazar una actividad debe ingresar un motivo justificado (mínimo 5 caracteres)' },
        { status: 400 }
      );
    }

    const nuevoEstado =
      accion === 'ACEPTAR' ? EstadoAsignacion.ACEPTADA : EstadoAsignacion.RECHAZADA;

    const actividadActualizada = await prisma.actividadCronograma.update({
      where: { id: actividadId },
      data: {
        estado_asignacion: nuevoEstado,
        motivo_rechazo: accion === 'RECHAZAR' ? motivo?.trim() : null,
        fecha_respuesta: new Date(),
      },
      include: {
        responsable: { select: { id: true, nombre_completo: true, email: true } },
        ecs: true,
        etapa: true,
      },
    });

    // Auditoría inmutable
    await prisma.auditoriaLog.create({
      data: {
        usuario_id: session.userId,
        accion: accion === 'ACEPTAR' ? 'ACEPTAR_ACTIVIDAD_CRONOGRAMA' : 'RECHAZAR_ACTIVIDAD_CRONOGRAMA',
        entidad: 'ACTIVIDAD_CRONOGRAMA',
        entidad_id: actividadActualizada.id,
        datos_anteriores: {
          estado: actividad.estado_asignacion,
        },
        datos_nuevos: {
          estado: actividadActualizada.estado_asignacion,
          motivo_rechazo: actividadActualizada.motivo_rechazo,
          fecha_respuesta: actividadActualizada.fecha_respuesta,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message:
        accion === 'ACEPTAR'
          ? 'Has aceptado la asignación de trabajo exitosamente. Ahora figura formalmente a tu nombre.'
          : 'Has rechazado la asignación. El administrador ha sido notificado para su reasignación.',
      data: actividadActualizada,
    });
  } catch (error: any) {
    console.error('Error al responder actividad:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
