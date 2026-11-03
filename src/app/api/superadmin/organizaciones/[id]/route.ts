import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const actualizarOrgSchema = z.object({
  activo: z.boolean().optional(),
  nombre: z.string().min(3).max(150).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.rol !== 'SUPERADMIN') {
      return NextResponse.json(
        { success: false, message: 'Acceso no autorizado. Requiere rol SUPERADMIN.' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const validation = actualizarOrgSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Parámetros de actualización inválidos' },
        { status: 400 }
      );
    }

    const organizacion = await prisma.organizacion.findUnique({
      where: { id },
    });

    if (!organizacion) {
      return NextResponse.json(
        { success: false, message: 'Organización no encontrada' },
        { status: 404 }
      );
    }

    // Proteger la Organización Maestra de suspensión
    if (organizacion.id === '00000000-0000-0000-0000-000000000001' && validation.data.activo === false) {
      return NextResponse.json(
        { success: false, message: 'No es posible desactivar la Organización Maestra del sistema' },
        { status: 400 }
      );
    }

    const orgActualizada = await prisma.$transaction(async (tx) => {
      const updated = await tx.organizacion.update({
        where: { id },
        data: validation.data,
      });

      await tx.auditoriaLog.create({
        data: {
          usuario_id: session.userId,
          accion: 'ESTADO_ORGANIZACION_MODIFICADO',
          entidad: 'ORGANIZACION',
          entidad_id: id,
          datos_anteriores: { activo: organizacion.activo, nombre: organizacion.nombre },
          datos_nuevos: { activo: updated.activo, nombre: updated.nombre },
        },
      });

      return updated;
    });

    return NextResponse.json({
      success: true,
      message: `Organización '${orgActualizada.nombre}' actualizada exitosamente`,
      data: orgActualizada,
    });
  } catch (error) {
    console.error('Error en PATCH /api/superadmin/organizaciones/[id]:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno al actualizar la organización' },
      { status: 500 }
    );
  }
}
