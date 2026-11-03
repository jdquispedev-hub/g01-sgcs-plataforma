import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, signSessionToken, AUTH_COOKIE_NAME, UserSessionPayload } from '@/lib/auth';

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'No autenticado' },
        { status: 401 }
      );
    }

    const masterOrgId = session.originalOrgId || '00000000-0000-0000-0000-000000000001';
    const masterOrg = await prisma.organizacion.findUnique({
      where: { id: masterOrgId },
    });

    // Registrar en auditoría el cierre de supervisión (RNF-10)
    await prisma.auditoriaLog.create({
      data: {
        usuario_id: session.userId,
        accion: 'SUPERADMIN_SUPERVISION_FIN',
        entidad: 'ORGANIZACION',
        entidad_id: session.organizacionId,
        datos_nuevos: {
          superadmin_id: session.userId,
          empresa_auditada: session.organizacionNombre,
        },
      },
    });

    const revertedPayload: UserSessionPayload = {
      userId: session.userId,
      email: session.email,
      nombreCompleto: session.nombreCompleto,
      rol: 'SUPERADMIN',
      organizacionId: masterOrg?.id || masterOrgId,
      organizacionNombre: masterOrg?.nombre || 'Administración Global SGCS',
      rubro: masterOrg?.rubro || 'SOFTWARE',
      isSupervising: false,
    };

    const token = signSessionToken(revertedPayload);

    const response = NextResponse.json({
      success: true,
      message: 'Regresando al panel maestro SuperAdmin',
      redirectUrl: '/superadmin',
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    console.error('Error en POST /api/superadmin/impersonate/revert:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno al regresar a SuperAdmin' },
      { status: 500 }
    );
  }
}
