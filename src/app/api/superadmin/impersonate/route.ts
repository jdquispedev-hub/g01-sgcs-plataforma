import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, signSessionToken, AUTH_COOKIE_NAME, UserSessionPayload } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.rol !== 'SUPERADMIN') {
      return NextResponse.json(
        { success: false, message: 'Acceso no autorizado. Requiere rol SUPERADMIN.' },
        { status: 403 }
      );
    }

    const { organizacionId } = await request.json();
    if (!organizacionId) {
      return NextResponse.json(
        { success: false, message: 'Se requiere el ID de la organización a supervisar' },
        { status: 400 }
      );
    }

    const targetOrg = await prisma.organizacion.findUnique({
      where: { id: organizacionId },
    });

    if (!targetOrg) {
      return NextResponse.json(
        { success: false, message: 'Organización no encontrada' },
        { status: 404 }
      );
    }

    if (!targetOrg.activo) {
      return NextResponse.json(
        { success: false, message: 'No se puede ingresar a una organización suspendida. Debe activarla primero.' },
        { status: 400 }
      );
    }

    // Registrar en auditoría la sesión de supervisión (RNF-10)
    await prisma.auditoriaLog.create({
      data: {
        usuario_id: session.userId,
        accion: 'SUPERADMIN_SUPERVISION_INICIO',
        entidad: 'ORGANIZACION',
        entidad_id: targetOrg.id,
        datos_nuevos: {
          superadmin_id: session.userId,
          superadmin_email: session.email,
          empresa_auditada: targetOrg.nombre,
        },
      },
    });

    // Crear sesión de supervisión con contexto del tenant auditado
    const newSessionPayload: UserSessionPayload = {
      userId: session.userId,
      email: session.email,
      nombreCompleto: session.nombreCompleto,
      rol: 'SUPERADMIN',
      organizacionId: targetOrg.id,
      organizacionNombre: targetOrg.nombre,
      rubro: targetOrg.rubro,
      isSupervising: true,
      originalOrgId: session.originalOrgId || session.organizacionId,
      originalOrgNombre: session.originalOrgNombre || session.organizacionNombre,
    };

    const token = signSessionToken(newSessionPayload);

    const response = NextResponse.json({
      success: true,
      message: `Modo supervisión activado para '${targetOrg.nombre}'`,
      redirectUrl: '/dashboard',
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 4, // 4 horas
    });

    return response;
  } catch (error) {
    console.error('Error en POST /api/superadmin/impersonate:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno al iniciar supervisión' },
      { status: 500 }
    );
  }
}
