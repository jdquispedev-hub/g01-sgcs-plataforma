import { NextRequest, NextResponse } from 'next/server';
import { verifySessionTokenEdge, AUTH_COOKIE_NAME } from '@/lib/auth-edge';

// Rutas protegidas y sus roles permitidos (RNF-02)
const ROUTE_PERMISSIONS: { pattern: RegExp; roles: string[] }[] = [
  { pattern: /^\/superadmin(\/.*)?$/, roles: ['SUPERADMIN'] },
  { pattern: /^\/dashboard(\/.*)?$/, roles: ['SUPERADMIN', 'ADMINISTRADOR', 'APROBADOR', 'SOLICITANTE'] },
  { pattern: /^\/aprobaciones(\/.*)?$/, roles: ['SUPERADMIN', 'ADMINISTRADOR', 'APROBADOR'] },
  { pattern: /^\/bitacora(\/.*)?$/, roles: ['SUPERADMIN', 'ADMINISTRADOR', 'APROBADOR', 'SOLICITANTE'] },
  { pattern: /^\/ecs(\/.*)?$/, roles: ['SUPERADMIN', 'ADMINISTRADOR', 'APROBADOR', 'SOLICITANTE'] },
  { pattern: /^\/lineas-base(\/.*)?$/, roles: ['SUPERADMIN', 'ADMINISTRADOR', 'APROBADOR'] },
  { pattern: /^\/cambios(\/.*)?$/, roles: ['SUPERADMIN', 'ADMINISTRADOR', 'APROBADOR', 'SOLICITANTE'] },
  { pattern: /^\/trazabilidad(\/.*)?$/, roles: ['SUPERADMIN', 'ADMINISTRADOR', 'APROBADOR', 'SOLICITANTE'] },
  { pattern: /^\/reuniones(\/.*)?$/, roles: ['SUPERADMIN', 'ADMINISTRADOR', 'APROBADOR', 'SOLICITANTE'] },
  { pattern: /^\/cronograma(\/.*)?$/, roles: ['SUPERADMIN', 'ADMINISTRADOR', 'APROBADOR', 'SOLICITANTE'] },
  { pattern: /^\/usuarios(\/.*)?$/, roles: ['SUPERADMIN', 'ADMINISTRADOR'] },
  { pattern: /^\/auditoria(\/.*)?$/, roles: ['SUPERADMIN', 'ADMINISTRADOR'] },
  { pattern: /^\/reportes(\/.*)?$/, roles: ['SUPERADMIN', 'ADMINISTRADOR', 'APROBADOR'] },
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir libremente recursos estáticos y favicon
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth/login') ||
    pathname === '/favicon.ico' ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await verifySessionTokenEdge(token) : null;

  // Si intenta acceder al login teniendo ya sesión activa, redirigir a su panel correspondiente
  if (pathname === '/login') {
    if (session) {
      const redirectUrl = session.rol === 'SUPERADMIN' ? '/superadmin' : '/dashboard';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return NextResponse.next();
  }

  // Verificar si la ruta requiere permisos específicos
  for (const route of ROUTE_PERMISSIONS) {
    if (route.pattern.test(pathname)) {
      // 1. Si no hay sesión: Redirigir al login
      if (!session) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }

      // 2. Si hay sesión pero no tiene el rol necesario: 403 Prohibido (RNF-02)
      if (!route.roles.includes(session.rol)) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            message: 'Acceso no autorizado: su rol no cuenta con los permisos necesarios.',
          }),
          {
            status: 403,
            headers: { 'content-type': 'application/json' },
          }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
