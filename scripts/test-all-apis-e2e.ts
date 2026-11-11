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
  console.log('--- TEST E2E INTEGRAL DE APIS (AUTO-GENERACIÓN DE CÓDIGOS Y PREVENCIÓN DE "codigo: Required") ---');

  const adminCookie = await login('admin.software@sgcs.com', 'Admin123!');
  console.log('✓ Login exitoso como Administrador');

  // Buscar datos de prueba existentes
  const version = await prisma.versionEcs.findFirst({
    include: { ecs: { include: { proyecto: true } } },
  });

  if (!version) {
    throw new Error('No se encontró versión ECS en la BD para testear.');
  }

  const ecs = version.ecs;
  const proyecto = ecs.proyecto;
  const usuario = await prisma.usuario.findFirst({ where: { organizacion_id: proyecto.organizacion_id } });

  console.log(`✓ Contexto: Proyecto=${proyecto.codigo}, ECS=${ecs.codigo}, Versión=${version.numero_version}`);

  // 1. Probar POST /api/cambios SIN CÓDIGO (Exactamente el payload del usuario)
  console.log('\n[TEST 1] POST /api/cambios SIN CÓDIGO (Payload de usuario):');
  const userPayload = {
    descripcion: 'Modificación técnica de prueba automatizada',
    ecs_id: ecs.id,
    justificacion: 'Requerimiento de actualización de arquitectura',
    version_base_id: version.id,
  };

  const resRfc = await fetch(`${BASE_URL}/api/cambios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify(userPayload),
  });
  const dataRfc = await resRfc.json();
  console.log('  Resultado RFC:', dataRfc.success ? '✅ PASSED' : '❌ FAILED', 'Código asignado:', dataRfc.data?.codigo || dataRfc.message);

  if (!dataRfc.success) {
    console.error('  Detalles del error:', JSON.stringify(dataRfc));
    process.exit(1);
  }

  // 2. Probar POST /api/ecs SIN CÓDIGO (Debe auto-generar PLN-... o DOC-...)
  console.log('\n[TEST 2] POST /api/ecs SIN CÓDIGO:');
  const ecsPayload = {
    proyecto_id: proyecto.id,
    nombre: 'Plano o Protocolo de Prueba Auto-Code',
    tipo: 'DISENO',
    ubicacion: 'https://repositorio.sgcs.com/test-auto',
    responsable_id: usuario!.id,
    descripcion: 'Entregable de prueba para auto-código',
  };

  const resEcs = await fetch(`${BASE_URL}/api/ecs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify(ecsPayload),
  });
  const dataEcs = await resEcs.json();
  console.log('  Resultado ECS:', dataEcs.success ? '✅ PASSED' : '❌ FAILED', 'Código asignado:', dataEcs.data?.codigo || dataEcs.message);

  if (!dataEcs.success) {
    console.error('  Detalles del error:', JSON.stringify(dataEcs));
    process.exit(1);
  }

  // 3. Probar POST /api/proyectos SIN CÓDIGO (Debe auto-generar PRY-YYYY-XX)
  console.log('\n[TEST 3] POST /api/proyectos SIN CÓDIGO:');
  const proyPayload = {
    nombre: 'Proyecto de Prueba Auto-Code',
    cliente_nombre: 'Cliente de Prueba SA',
    descripcion: 'Proyecto generado automáticamente',
  };

  const resProy = await fetch(`${BASE_URL}/api/proyectos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify(proyPayload),
  });
  const dataProy = await resProy.json();
  console.log('  Resultado Proyecto:', dataProy.success ? '✅ PASSED' : '❌ FAILED', 'Código asignado:', dataProy.data?.codigo || dataProy.message);

  if (!dataProy.success) {
    console.error('  Detalles del error:', JSON.stringify(dataProy));
    process.exit(1);
  }

  // Limpiar entidades de prueba
  console.log('\nLimpiando datos de prueba creados...');
  await prisma.solicitudCambio.delete({ where: { id: dataRfc.data.id } });
  await prisma.ecs.delete({ where: { id: dataEcs.data.id } });
  await prisma.proyectoCaso.delete({ where: { id: dataProy.data.id } });
  console.log('✓ Datos de prueba limpiados exitosamente.');

  await prisma.$disconnect();
  console.log('\n🎉 TODAS LAS APIS FUERON TESTEADAS Y FUNCIONAN PERFECTAMENTE SIN EXIGIR CÓDIGOS MANUALES.');
}

run().catch((err) => {
  console.error('Error durante la ejecución del test:', err);
  process.exit(1);
});
