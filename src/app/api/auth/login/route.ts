import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signSessionToken, AUTH_COOKIE_NAME } from '@/lib/auth';

// Esquema de validación estricto (RNF-05)
const loginSchema = z.object({
  email: z.string().email('Debe ingresar un correo electrónico válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Datos de entrada inválidos',
          errors: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Buscar usuario incluyendo su organización (RNF-02, RF-01)
    const usuario = await prisma.usuario.findFirst({
      where: {
        email: email.trim().toLowerCase(),
        activo: true,
      },
      include: {
        organizacion: true,
      },
    });

    // Mensaje genérico de seguridad para no filtrar si falló el correo o la contraseña (RNF-12)
    if (!usuario) {
      return NextResponse.json(
        { success: false, message: 'Credenciales inválidas o cuenta desactivada' },
        { status: 401 }
      );
    }

    // Verificar si la empresa cliente está activa
    if (!usuario.organizacion.activo) {
      return NextResponse.json(
        { success: false, message: 'La organización se encuentra temporalmente inactiva' },
        { status: 403 }
      );
    }

    // Verificar contraseña con bcrypt (RNF-01)
    const passwordMatch = await verifyPassword(password, usuario.password_hash);
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, message: 'Credenciales inválidas o cuenta desactivada' },
        { status: 401 }
      );
    }

    // Generar token JWT
    const payload = {
      userId: usuario.id,
      email: usuario.email,
      nombreCompleto: usuario.nombre_completo,
      rol: usuario.rol,
      organizacionId: usuario.organizacion_id,
      organizacionNombre: usuario.organizacion.nombre,
      rubro: usuario.organizacion.rubro,
    };

    const token = signSessionToken(payload);

    // Auditoría de inicio de sesión (RNF-10)
    await prisma.auditoriaLog.create({
      data: {
        usuario_id: usuario.id,
        accion: 'INICIO_SESION',
        entidad: 'USUARIO',
        entidad_id: usuario.id,
        ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
        user_agent: request.headers.get('user-agent') || 'desconocido',
        datos_nuevos: { email: usuario.email, rol: usuario.rol },
      },
    });

    // Determinar la ruta de destino según el rol del usuario
    let redirectUrl = '/dashboard';
    switch (usuario.rol) {
      case 'SUPERADMIN':
        redirectUrl = '/superadmin';
        break;
      case 'ADMINISTRADOR':
        redirectUrl = '/dashboard';
        break;
      case 'APROBADOR':
        redirectUrl = '/aprobaciones';
        break;
      case 'SOLICITANTE':
        redirectUrl = '/bitacora';
        break;
    }

    const response = NextResponse.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        user: {
          id: usuario.id,
          nombre: usuario.nombre_completo,
          email: usuario.email,
          rol: usuario.rol,
          organizacion: usuario.organizacion.nombre,
          rubro: usuario.organizacion.rubro,
        },
        redirectUrl,
      },
    });

    // Configurar cookie de sesión HttpOnly segura (RNF-02, RNF-03)
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8, // 8 horas
    });

    return response;
  } catch (error) {
    console.error('Error en /api/auth/login:', error);
    // Mensaje seguro sin exponer SQL ni stacktrace (RNF-12)
    return NextResponse.json(
      { success: false, message: 'Ocurrió un error interno al procesar el inicio de sesión' },
      { status: 500 }
    );
  }
}
