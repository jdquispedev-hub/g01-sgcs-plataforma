import { PrismaClient, RubroIndustria, RolUsuario, TipoEcs } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando carga de datos semilla (Seed)...');

  // 1. Crear Organización Maestra (Para SuperAdmin)
  const orgMaestra = await prisma.organizacion.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      nombre: 'Administración Global SGCS',
      rubro: RubroIndustria.SOFTWARE,
      configuracion_terminologia: {
        terminos: {
          proyecto: 'Proyecto Global',
          ecs: 'Elemento de Configuración',
          linea_base: 'Línea Base',
          reporte_diario: 'Bitácora Diaria',
        },
      },
    },
  });

  // 2. Crear Usuario SuperAdmin
  const passwordHash = await bcrypt.hash('Admin123!', 12);
  const superAdmin = await prisma.usuario.upsert({
    where: {
      organizacion_id_email: {
        organizacion_id: orgMaestra.id,
        email: 'superadmin@sgcs.com',
      },
    },
    update: {},
    create: {
      organizacion_id: orgMaestra.id,
      nombre_completo: 'Super Administrador del Sistema',
      email: 'superadmin@sgcs.com',
      password_hash: passwordHash,
      rol: RolUsuario.SUPERADMIN,
      activo: true,
    },
  });
  console.log(`✅ SuperAdmin creado: ${superAdmin.email} (Password: Admin123!)`);

  // 3. Crear Organización Demo: Empresa de Software
  const orgSoftware = await prisma.organizacion.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      nombre: 'DevCraft Software Solutions',
      rubro: RubroIndustria.SOFTWARE,
      configuracion_terminologia: {
        terminos: {
          proyecto: 'Sistema / Sprint',
          ecs: 'Componente / Módulo',
          version: 'Release / Tag Git',
          linea_base: 'Línea Base de Código',
          solicitud_cambio: 'RFC / Ticket de Cambio',
          reporte_diario: 'Daily Standup',
        },
        campos_reporte: [
          { clave: 'commits', etiqueta: 'Cantidad de Commits', tipo: 'numero' },
          { clave: 'endpoints_listos', etiqueta: 'Endpoints completados', tipo: 'texto' },
        ],
      },
    },
  });

  // Usuarios para la Empresa de Software
  const adminSoftware = await prisma.usuario.upsert({
    where: {
      organizacion_id_email: {
        organizacion_id: orgSoftware.id,
        email: 'admin.software@sgcs.com',
      },
    },
    update: {},
    create: {
      organizacion_id: orgSoftware.id,
      nombre_completo: 'Carlos Mendoza (Gerente TI)',
      email: 'admin.software@sgcs.com',
      password_hash: passwordHash,
      rol: RolUsuario.ADMINISTRADOR,
      activo: true,
    },
  });

  const aprobadorSoftware = await prisma.usuario.upsert({
    where: {
      organizacion_id_email: {
        organizacion_id: orgSoftware.id,
        email: 'aprobador.software@sgcs.com',
      },
    },
    update: {},
    create: {
      organizacion_id: orgSoftware.id,
      nombre_completo: 'Ing. Rodrigo Paredes (Tech Lead)',
      email: 'aprobador.software@sgcs.com',
      password_hash: passwordHash,
      rol: RolUsuario.APROBADOR,
      activo: true,
    },
  });

  // Proyecto inicial para Software
  const proyectoSoftware = await prisma.proyectoCaso.upsert({
    where: {
      organizacion_id_codigo: {
        organizacion_id: orgSoftware.id,
        codigo: 'PRY-CURSOS-01',
      },
    },
    update: {},
    create: {
      organizacion_id: orgSoftware.id,
      codigo: 'PRY-CURSOS-01',
      nombre: 'Plataforma Web E-Learning y Pagos',
      cliente_nombre: 'Instituto Continental',
      fecha_inicio: new Date('2026-10-01'),
      estado: 'EN_EJECUCION',
    },
  });

  // ECS Inicial con 2 versiones
  const ecsSoftware = await prisma.ecs.upsert({
    where: {
      proyecto_id_codigo: {
        proyecto_id: proyectoSoftware.id,
        codigo: 'ECS-MOD-PAGOS',
      },
    },
    update: {},
    create: {
      proyecto_id: proyectoSoftware.id,
      codigo: 'ECS-MOD-PAGOS',
      nombre: 'Módulo de Pasarela de Pagos Stripe & PayPal',
      tipo: TipoEcs.CODIGO_FUENTE,
      descripcion: 'Controladores y webhooks para procesamiento seguro de tarjetas y suscripciones.',
      ubicacion: 'https://github.com/ClaraBQuispeChileno/G01/src/modules/payments',
      responsable_id: aprobadorSoftware.id,
    },
  });

  // Versión 1.0.0 Aprobada
  await prisma.versionEcs.upsert({
    where: {
      ecs_id_numero_version: {
        ecs_id: ecsSoftware.id,
        numero_version: '1.0.0',
      },
    },
    update: {},
    create: {
      ecs_id: ecsSoftware.id,
      numero_version: '1.0.0',
      descripcion: 'Integración inicial de Stripe Checkout con webhooks de confirmación.',
      archivo_url: 'https://github.com/ClaraBQuispeChileno/G01/commit/v1.0.0',
      estado: 'APROBADA',
      autor_id: adminSoftware.id,
      aprobador_id: aprobadorSoftware.id,
      fecha_aprobacion: new Date('2026-10-15'),
    },
  });

  // Versión 1.1.0 Pendiente para pruebas de dictamen (RF-08)
  await prisma.versionEcs.upsert({
    where: {
      ecs_id_numero_version: {
        ecs_id: ecsSoftware.id,
        numero_version: '1.1.0',
      },
    },
    update: {},
    create: {
      ecs_id: ecsSoftware.id,
      numero_version: '1.1.0',
      descripcion: 'Soporte adicional para pagos locales con Yape y Plin mediante código QR.',
      archivo_url: 'https://github.com/ClaraBQuispeChileno/G01/commit/v1.1.0-qr',
      estado: 'PENDIENTE',
      autor_id: adminSoftware.id,
    },
  });

  console.log('✅ Proyecto y ECS demo con versiones creado para Software.');
  console.log('✅ Organizaciones y plantillas de industria sembradas exitosamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error en Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
