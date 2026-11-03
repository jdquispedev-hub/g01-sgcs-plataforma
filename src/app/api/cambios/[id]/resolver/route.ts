import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { EstadoCambio, RolUsuario } from '@prisma/client';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: { id: string };
}

const resolverSchema = z.object({
  decision: z.enum(['APROBADA', 'RECHAZADA'], {
    errorMap: () => ({ message: 'La decisión debe ser APROBADA o RECHAZADA' }),
  }),
  justificacion: z
    .string()
    .min(5, 'La justificación formal del dictamen debe tener al menos 5 caracteres'),
});

// -------------------------------------------------------------
// POST: Dictamen formal del comité aprobador (RF-14, RNF-02, RNF-10)
// -------------------------------------------------------------
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    // Verificación estricta de rol en servidor (RNF-02, RF-14)
    const rolesPermitidos: RolUsuario[] = [RolUsuario.SUPERADMIN, RolUsuario.ADMINISTRADOR, RolUsuario.APROBADOR];
    if (!rolesPermitidos.includes(session.rol)) {
      return NextResponse.json(
        { success: false, message: 'Permiso denegado: solo el Responsable de Aprobación o Administrador puede dictaminar cambios' },
        { status: 403 }
      );
    }

    const { id: solicitudId } = params;
    const body = await request.json();
    const validation = resolverSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Datos de dictamen inválidos', errors: validation.error.format() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Verificar existencia y pertenencia
    const solicitud = await prisma.solicitudCambio.findFirst({
      where: {
        id: solicitudId,
        ecs: {
          proyecto: {
            organizacion_id: session.organizacionId,
          },
        },
      },
      include: {
        evaluacion: true,
      },
    });

    if (!solicitud) {
      return NextResponse.json(
        { success: false, message: 'Solicitud de Cambio no encontrada o no pertenece a su organización' },
        { status: 404 }
      );
    }

    if (solicitud.estado === EstadoCambio.IMPLEMENTADA) {
      return NextResponse.json(
        { success: false, message: 'La solicitud ya ha sido implementada y su dictamen es definitivo' },
        { status: 400 }
      );
    }

    const nuevoEstado = data.decision === 'APROBADA' ? EstadoCambio.APROBADA : EstadoCambio.RECHAZADA;

    // Transacción ACID (RNF-08)
    const solicitudActualizada = await prisma.$transaction(async (tx) => {
      const updated = await tx.solicitudCambio.update({
        where: { id: solicitudId },
        data: {
          estado: nuevoEstado,
          resolutor_id: session.userId,
          resolucion_justificacion: data.justificacion.trim(),
          fecha_resolucion: new Date(),
        },
      });

      // Registro de auditoría (RNF-10)
      await tx.auditoriaLog.create({
        data: {
          usuario_id: session.userId,
          accion: `DICTAMEN_${data.decision}_CAMBIO`,
          entidad: 'SOLICITUD_CAMBIO',
          entidad_id: solicitudId,
          datos_nuevos: {
            codigo: updated.codigo,
            decision: data.decision,
            justificacion: data.justificacion.trim(),
            fecha_resolucion: updated.fecha_resolucion,
          },
          ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
          user_agent: request.headers.get('user-agent') || 'desconocido',
        },
      });

      return updated;
    });

    return NextResponse.json({
      success: true,
      message: `Solicitud de Cambio dictaminada como ${data.decision} exitosamente`,
      data: solicitudActualizada,
    });
  } catch (error) {
    console.error('Error al dictaminar Solicitud de Cambio:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno al emitir el dictamen formal' },
      { status: 500 }
    );
  }
}
