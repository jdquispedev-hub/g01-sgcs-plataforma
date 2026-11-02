import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const resolucionSchema = z.object({
  decision: z.enum(['APROBAR', 'RECHAZAR'], {
    errorMap: () => ({ message: 'La decisión debe ser APROBAR o RECHAZAR' }),
  }),
  justificacion: z.string().optional(),
});

// -------------------------------------------------------------
// PATCH: Aprobar o Rechazar formalmente una versión (RF-08)
// Exclusivo para rol APROBADOR, ADMINISTRADOR o SUPERADMIN (RF-03, RNF-02)
// -------------------------------------------------------------
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; versionId: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    // Validación de permisos por rol en servidor (RNF-02, RF-08)
    const rolesAutorizados = ['SUPERADMIN', 'ADMINISTRADOR', 'APROBADOR'];
    if (!rolesAutorizados.includes(session.rol)) {
      return NextResponse.json(
        { success: false, message: 'Acceso denegado: solo el Responsable de Aprobación puede dictaminar versiones' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = resolucionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Datos de decisión inválidos', errors: validation.error.format() },
        { status: 400 }
      );
    }

    // Verificar que la versión pertenezca a la organización
    const version = await prisma.versionEcs.findFirst({
      where: {
        id: params.versionId,
        ecs_id: params.id,
        ecs: { proyecto: { organizacion_id: session.organizacionId } },
      },
      include: { ecs: true },
    });

    if (!version) {
      return NextResponse.json({ success: false, message: 'Versión no encontrada' }, { status: 404 });
    }

    const nuevoEstado = validation.data.decision === 'APROBAR' ? 'APROBADA' : 'RECHAZADA';

    // Transacción ACID (RNF-08, RNF-10)
    const versionActualizada = await prisma.$transaction(async (tx) => {
      const v = await tx.versionEcs.update({
        where: { id: params.versionId },
        data: {
          estado: nuevoEstado,
          aprobador_id: session.userId,
          fecha_aprobacion: new Date(),
        },
      });

      // Registro inmutable de auditoría (RF-08, RNF-10)
      await tx.auditoriaLog.create({
        data: {
          usuario_id: session.userId,
          accion: nuevoEstado === 'APROBADA' ? 'APROBAR_VERSION' : 'RECHAZAR_VERSION',
          entidad: 'VERSION_ECS',
          entidad_id: v.id,
          datos_anteriores: { estado: version.estado },
          datos_nuevos: {
            estado: v.estado,
            aprobador_id: session.userId,
            fecha_aprobacion: v.fecha_aprobacion,
            justificacion: validation.data.justificacion,
          },
          ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
          user_agent: request.headers.get('user-agent') || 'desconocido',
        },
      });

      return v;
    });

    return NextResponse.json({
      success: true,
      message: `Versión ${nuevoEstado.toLowerCase()} con éxito`,
      data: versionActualizada,
    });
  } catch (error) {
    console.error('Error al dictaminar versión:', error);
    return NextResponse.json({ success: false, message: 'Error interno del servidor' }, { status: 500 });
  }
}
