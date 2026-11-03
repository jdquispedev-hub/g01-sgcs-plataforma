import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { EstadoCambio, RolUsuario } from '@prisma/client';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: { id: string };
}

const implementarSchema = z.object({
  version_resultante_id: z.string().uuid('ID de versión resultante inválido'),
});

// -------------------------------------------------------------
// POST: Registrar implementación de cambio vinculando versión resultante (RF-15)
// -------------------------------------------------------------
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const rolesPermitidos: RolUsuario[] = [RolUsuario.SUPERADMIN, RolUsuario.ADMINISTRADOR, RolUsuario.APROBADOR];
    if (!rolesPermitidos.includes(session.rol)) {
      return NextResponse.json(
        { success: false, message: 'Permiso denegado: solo el Responsable de Aprobación o Administrador puede registrar la implementación' },
        { status: 403 }
      );
    }

    const { id: solicitudId } = params;
    const body = await request.json();
    const validation = implementarSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Datos de implementación inválidos', errors: validation.error.format() },
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
    });

    if (!solicitud) {
      return NextResponse.json(
        { success: false, message: 'Solicitud de Cambio no encontrada o no pertenece a su organización' },
        { status: 404 }
      );
    }

    // Regla de Negocio (RF-15): Solo solicitudes APROBADAS pueden ser implementadas
    if (solicitud.estado !== EstadoCambio.APROBADA) {
      return NextResponse.json(
        { success: false, message: `Solo solicitudes en estado APROBADA pueden marcarse como implementadas. Estado actual: ${solicitud.estado}` },
        { status: 400 }
      );
    }

    // Verificar que la versión resultante pertenezca al ECS del cambio
    const versionResultante = await prisma.versionEcs.findFirst({
      where: {
        id: data.version_resultante_id,
        ecs_id: solicitud.ecs_id,
      },
    });

    if (!versionResultante) {
      return NextResponse.json(
        { success: false, message: 'La versión resultante seleccionada no corresponde al ECS de este cambio' },
        { status: 400 }
      );
    }

    // Transacción ACID: Marcar como IMPLEMENTADA y registrar auditoría
    const solicitudImplementada = await prisma.$transaction(async (tx) => {
      const updated = await tx.solicitudCambio.update({
        where: { id: solicitudId },
        data: {
          estado: EstadoCambio.IMPLEMENTADA,
          version_resultante_id: data.version_resultante_id,
          fecha_implementacion: new Date(),
        },
      });

      await tx.auditoriaLog.create({
        data: {
          usuario_id: session.userId,
          accion: 'IMPLEMENTAR_CAMBIO_ECS',
          entidad: 'SOLICITUD_CAMBIO',
          entidad_id: solicitudId,
          datos_nuevos: {
            codigo: updated.codigo,
            version_resultante_id: data.version_resultante_id,
            version_numero: versionResultante.numero_version,
            fecha_implementacion: updated.fecha_implementacion,
          },
          ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
          user_agent: request.headers.get('user-agent') || 'desconocido',
        },
      });

      return updated;
    });

    return NextResponse.json({
      success: true,
      message: `Cambio implementado con éxito. Vinculado a la versión v${versionResultante.numero_version}`,
      data: solicitudImplementada,
    });
  } catch (error) {
    console.error('Error al implementar cambio:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno al registrar la implementación del cambio' },
      { status: 500 }
    );
  }
}
