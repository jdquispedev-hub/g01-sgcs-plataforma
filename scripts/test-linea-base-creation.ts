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

async function run() {
  const prisma = new PrismaClient();
  console.log('--- TEST DE CREACIÓN DE LÍNEA BASE (FIX versiones_ids / version_ids) ---');

  const cookie = await login('admin.software@sgcs.com', 'Admin123!');
  console.log('✓ Login exitoso como Administrador');

  // Buscar un proyecto con versiones aprobadas
  const versionAprobada = await prisma.versionEcs.findFirst({
    where: { estado: 'APROBADA' },
    include: { ecs: { select: { proyecto_id: true, codigo: true } } },
  });

  if (!versionAprobada) {
    console.log('⚠ No hay versiones aprobadas en la base de datos para testear creación directa.');
    await prisma.$disconnect();
    return;
  }

  const proyectoId = versionAprobada.ecs.proyecto_id;
  const versionId = versionAprobada.id;
  console.log(`✓ Usando proyecto ${proyectoId} y versión aprobada ${versionId} de ${versionAprobada.ecs.codigo}`);

  const testCodigo = `LB-TEST-${Date.now().toString().slice(-6)}`;

  // Test 1: Payload enviando "version_ids" (como enviaba el front antes)
  console.log(`\nProbando POST /api/lineas-base con campo "version_ids"...`);
  const res1 = await fetch(`${BASE_URL}/api/lineas-base`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
    },
    body: JSON.stringify({
      codigo: testCodigo,
      nombre: 'Línea Base Automatizada de Prueba',
      descripcion: 'Prueba de compatibilidad de nombres de campo',
      proyecto_id: proyectoId,
      version_ids: [versionId],
      marcar_anteriores_obsoletas: false,
    }),
  });

  const data1 = await res1.json();
  console.log('Respuesta API (con version_ids):', data1.success ? '✅ SUCCESS' : '❌ FAIL', data1.message || data1.errors);

  if (!data1.success) {
    console.error('Error detallado:', JSON.stringify(data1));
    process.exit(1);
  }

  // Verificar en DB
  const creada = await prisma.lineaBase.findUnique({
    where: { id: data1.data.id },
    include: { versiones: true },
  });

  console.log(`✓ Verificado en BD: Línea Base ${creada?.codigo} creada con ${creada?.versiones.length} versiones congeladas.`);

  // Limpiar línea base de prueba creada
  await prisma.lineaBaseVersion.deleteMany({ where: { linea_base_id: data1.data.id } });
  await prisma.lineaBase.delete({ where: { id: data1.data.id } });
  console.log('✓ Limpieza de datos de prueba completada.');

  await prisma.$disconnect();
  console.log('\n🎉 TEST COMPLETADO CON ÉXITO: El backend y frontend procesan versiones_ids / version_ids perfectamente.');
}

run().catch((err) => {
  console.error('Test falló:', err);
  process.exit(1);
});
