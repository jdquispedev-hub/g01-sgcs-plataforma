import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { RolUsuario } from '@prisma/client';

export const dynamic = 'force-dynamic';

const actualizarUsuarioSchema = z.object({
  rol: z.enum(['ADMINISTRADOR', 'APROBADOR', 'SOLICITANTE']).optional(),
  cargo: z.string().max(100).optional().nullable(),
  activo: z.boolean().optional(),
});

// -------------------------------------------------------------
// PUT: Actualizar Rol o Estado del Usuario (RF-02, RNF-02)
// -------------------------------------------------------------
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    // RNF-02: Solo Administradores
    const rolesAdmin: RolUsuario[] = [RolUsuario.SUPERADMIN, RolUsuario.ADMINISTRADOR];
    if (!rolesAdmin.includes(session.rol as RolUsuario)) {
      return NextResponse.json(
        { success: false, message: 'Acceso denegado: Se requiere rol de Administrador' },
        { status: 403 }
      );
    }

    const { id } = params;

    // Verificar que el usuario pertenezca al mismo tenant
    const usuarioActual = await prisma.usuario.findFirst({
      where: {
        id,
        organizacion_id: session.organizacionId,
      },
    });

    if (!usuarioActual) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado en la empresa' },
        { status: 404 }
      );
    }

    // Evitar que el administrador se desactive a sí mismo
    if (usuarioActual.id === session.userId) {
      const bodyCheck = await request.clone().json();
      if (bodyCheck.activo === false) {
        return NextResponse.json(
          { success: false, message: 'No puede desactivar su propia cuenta en sesión' },
          { status: 400 }
        );
      }
    }

    const body = await request.json();
    const parseResult = actualizarUsuarioSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Datos de actualización inválidos',
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const dataUpdate: any = {};
    if (parseResult.data.rol !== undefined) {
      dataUpdate.rol = parseResult.data.rol as RolUsuario;
    }
    if (parseResult.data.cargo !== undefined) {
      dataUpdate.cargo = parseResult.data.cargo ? parseResult.data.cargo.trim() : null;
    }
    if (parseResult.data.activo !== undefined) {
      dataUpdate.activo = parseResult.data.activo;
    }

    const usuarioModificado = await prisma.$transaction(async (tx) => {
      const u = await tx.usuario.update({
        where: { id },
        data: dataUpdate,
        select: {
          id: true,
          nombre_completo: true,
          email: true,
          rol: true,
          cargo: true,
          activo: true,
          created_at: true,
        },
      });

      await tx.auditoriaLog.create({
        data: {
          usuario_id: session.userId,
          accion: 'ACTUALIZAR_USUARIO',
          entidad: 'USUARIO',
          entidad_id: u.id,
          datos_anteriores: {
            rol: usuarioActual.rol,
            activo: usuarioActual.activo,
          },
          datos_nuevos: {
            rol: u.rol,
            activo: u.activo,
          },
        },
      });

      return u;
    });

    return NextResponse.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: usuarioModificado,
    });
  } catch (error: any) {
    console.error('Error al actualizar usuario:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno al actualizar usuario' },
      { status: 500 }
    );
  }
}
