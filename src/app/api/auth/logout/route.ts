import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (session) {
      // Registrar salida en auditoría (RNF-10)
      await prisma.auditoriaLog.create({
        data: {
          usuario_id: session.userId,
          accion: 'CIERRE_SESION',
          entidad: 'USUARIO',
          entidad_id: session.userId,
          ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
          user_agent: request.headers.get('user-agent') || 'desconocido',
        },
      });
    }

    const response = NextResponse.json({
      success: true,
      message: 'Sesión cerrada correctamente',
    });

    // Eliminar cookie de sesión
    response.cookies.set(AUTH_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error('Error en /api/auth/logout:', error);
    return NextResponse.json(
      { success: false, message: 'Error al cerrar sesión' },
      { status: 500 }
    );
  }
}
