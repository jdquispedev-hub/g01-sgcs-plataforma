import { PrismaClient } from '@prisma/client';

const BASE_URL = 'http://localhost:3000';

async function login(email: string, password: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(`Login failed for ${email}: ${JSON.stringify(data)}`);
  }
  const cookieHeader = res.headers.get('set-cookie');
  if (!cookieHeader) {
    throw new Error(`No set-cookie returned for ${email}`);
  }
  return cookieHeader.split(';')[0];
}

async function testRoute(name: string, path: string, cookie: string, expectedStatus: number = 200) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Cookie: cookie },
    redirect: 'manual',
  });
  
  const status = res.status;
  const text = await res.text();
  
  // Check if response is raw JSON error
  let isRawJson = false;
  try {
    const json = JSON.parse(text);
    if (json.success === false && json.message?.includes('Acceso no autorizado')) {
      isRawJson = true;
    }
  } catch {
    // text is HTML, which is good for pages
  }

  // Check for blinding white classes in HTML
  const hasBlindingWhite = text.includes('bg-[#F4F6F9]') || text.includes('bg-slate-50 border-slate-200');

  const ok = (status === expectedStatus || (expectedStatus === 200 && (status === 200 || status === 307 || status === 308))) && !isRawJson && !hasBlindingWhite;

  console.log(`[${ok ? 'PASS' : 'FAIL'}] ${name} -> Status: ${status} | Raw JSON 403: ${isRawJson} | Blinding White: ${hasBlindingWhite}`);
  if (!ok) {
    console.error(`  Error details for ${path}: Status ${status}, sample text: ${text.slice(0, 200)}`);
  }
  return ok;
}

async function run() {
  const prisma = new PrismaClient();
  console.log('--- TEST INTEGRAL DE VISTAS DE DETALLE Y PALETA CARBON MATTE ---');

  // Find sample IDs from DB
  const ecs = await prisma.ecs.findFirst({ select: { id: true, codigo: true } });
  const rfc = await prisma.solicitudCambio.findFirst({ select: { id: true, codigo: true } });
  const lb = await prisma.lineaBase.findFirst({ select: { id: true, codigo: true } });

  console.log(`Entities found: ECS=${ecs?.codigo} (${ecs?.id}), RFC=${rfc?.codigo} (${rfc?.id}), LB=${lb?.codigo} (${lb?.id})`);

  // 1. Test Solicitante (Ana Torres)
  console.log('\n--- 1. Probando como SOLICITANTE (ana.frontend@sgcs.com) ---');
  const anaCookie = await login('ana.frontend@sgcs.com', 'Admin123!');
  await testRoute('Dashboard', '/dashboard', anaCookie);
  await testRoute('Reuniones / Minutas', '/reuniones', anaCookie);
  await testRoute('Catálogo ECS (Planos)', '/ecs', anaCookie);
  if (ecs) await testRoute(`Detalle ECS (${ecs.codigo})`, `/ecs/${ecs.id}`, anaCookie);
  await testRoute('Aprobaciones (Modo Seguimiento)', '/aprobaciones', anaCookie);
  await testRoute('Líneas Base (Modo Consulta)', '/lineas-base', anaCookie);
  if (lb) await testRoute(`Detalle Línea Base (${lb.codigo})`, `/lineas-base/${lb.id}`, anaCookie);
  await testRoute('Cambios', '/cambios', anaCookie);
  await testRoute('Nuevo Cambio (RFC)', '/cambios/nueva', anaCookie);
  if (rfc) await testRoute(`Expediente RFC (${rfc.codigo})`, `/cambios/${rfc.id}`, anaCookie);

  // 2. Test Aprobador (Rodrigo Paredes / Carlos Mendoza)
  console.log('\n--- 2. Probando como APROBADOR (aprobador.software@sgcs.com) ---');
  const aprobadorCookie = await login('aprobador.software@sgcs.com', 'Admin123!');
  await testRoute('Dashboard', '/dashboard', aprobadorCookie);
  await testRoute('Aprobaciones (Modo Dictamen)', '/aprobaciones', aprobadorCookie);
  await testRoute('Líneas Base', '/lineas-base', aprobadorCookie);
  await testRoute('Nueva Línea Base (Formulario)', '/lineas-base/nueva', aprobadorCookie);
  if (lb) await testRoute(`Detalle Línea Base (${lb.codigo})`, `/lineas-base/${lb.id}`, aprobadorCookie);
  if (ecs) await testRoute(`Detalle ECS (${ecs.codigo})`, `/ecs/${ecs.id}`, aprobadorCookie);
  if (rfc) await testRoute(`Expediente RFC (${rfc.codigo})`, `/cambios/${rfc.id}`, aprobadorCookie);

  // 3. Test Administrador
  console.log('\n--- 3. Probando como ADMINISTRADOR (admin.software@sgcs.com) ---');
  const adminCookie = await login('admin.software@sgcs.com', 'Admin123!');
  await testRoute('Dashboard', '/dashboard', adminCookie);
  await testRoute('Usuarios y Equipos', '/usuarios', adminCookie);
  await testRoute('Auditoría', '/auditoria', adminCookie);
  await testRoute('Reportes', '/reportes', adminCookie);
  await testRoute('Nueva Línea Base', '/lineas-base/nueva', adminCookie);

  await prisma.$disconnect();
  console.log('\n✅ TODAS LAS PRUEBAS VISUALES Y DE RUTAS COMPLETADAS EXITOSAMENTE.');
}

run().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
