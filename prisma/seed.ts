import { PrismaClient, RubroIndustria, RolUsuario, TipoEcs, TipoReunion, EstadoCambio, NivelImpacto } from '@prisma/client';
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

  // 3. Crear Organización Demo: Soluciones de Software & Proyectos
  const orgSoftware = await prisma.organizacion.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      nombre: 'DevCraft Software & Proyectos Integrales',
      rubro: RubroIndustria.SOFTWARE,
      configuracion_terminologia: {
        terminos: {
          proyecto: 'Sistema / Proyecto',
          ecs: 'Entregable / Componente',
          version: 'Versión / Release',
          linea_base: 'Hito Congelado (Línea Base)',
          solicitud_cambio: 'Solicitud de Cambio (RFC)',
          reporte_diario: 'Bitácora de Jornada',
        },
      },
    },
  });

  // ============================================================
  // USUARIOS DEL SISTEMA (Equipo Real de Trabajo)
  // ============================================================
  // 1. El Jefe / Gerente General (quien habla con clientes y convoca)
  const adminSoftware = await prisma.usuario.upsert({
    where: {
      organizacion_id_email: {
        organizacion_id: orgSoftware.id,
        email: 'admin.software@sgcs.com',
      },
    },
    update: {
      nombre_completo: 'Carlos Mendoza (Gerente de Proyecto / Jefe)',
    },
    create: {
      organizacion_id: orgSoftware.id,
      nombre_completo: 'Carlos Mendoza (Gerente de Proyecto / Jefe)',
      email: 'admin.software@sgcs.com',
      password_hash: passwordHash,
      rol: RolUsuario.ADMINISTRADOR,
      activo: true,
    },
  });

  // 2. Tech Lead / Arquitecto Técnico (quien dictamina y aprueba)
  const aprobadorSoftware = await prisma.usuario.upsert({
    where: {
      organizacion_id_email: {
        organizacion_id: orgSoftware.id,
        email: 'aprobador.software@sgcs.com',
      },
    },
    update: {
      nombre_completo: 'Ing. Rodrigo Paredes (Tech Lead / Especialista)',
    },
    create: {
      organizacion_id: orgSoftware.id,
      nombre_completo: 'Ing. Rodrigo Paredes (Tech Lead / Especialista)',
      email: 'aprobador.software@sgcs.com',
      password_hash: passwordHash,
      rol: RolUsuario.APROBADOR,
      activo: true,
    },
  });

  // 3. Desarrolladora Frontend & UI/UX
  const devFrontend = await prisma.usuario.upsert({
    where: {
      organizacion_id_email: {
        organizacion_id: orgSoftware.id,
        email: 'ana.frontend@sgcs.com',
      },
    },
    update: {},
    create: {
      organizacion_id: orgSoftware.id,
      nombre_completo: 'Ana Torres (Desarrolladora Frontend & UX)',
      email: 'ana.frontend@sgcs.com',
      password_hash: passwordHash,
      rol: RolUsuario.SOLICITANTE,
      activo: true,
    },
  });

  // 4. Desarrollador Backend & Bases de Datos
  const devBackend = await prisma.usuario.upsert({
    where: {
      organizacion_id_email: {
        organizacion_id: orgSoftware.id,
        email: 'luis.backend@sgcs.com',
      },
    },
    update: {},
    create: {
      organizacion_id: orgSoftware.id,
      nombre_completo: 'Luis Gómez (Desarrollador Backend & DB)',
      email: 'luis.backend@sgcs.com',
      password_hash: passwordHash,
      rol: RolUsuario.SOLICITANTE,
      activo: true,
    },
  });

  // 5. Arquitecta de Obras & Estructuras
  const arquitectaObras = await prisma.usuario.upsert({
    where: {
      organizacion_id_email: {
        organizacion_id: orgSoftware.id,
        email: 'maria.arquitecta@sgcs.com',
      },
    },
    update: {},
    create: {
      organizacion_id: orgSoftware.id,
      nombre_completo: 'Arq. María Flores (Arquitecta de Obras & Planos)',
      email: 'maria.arquitecta@sgcs.com',
      password_hash: passwordHash,
      rol: RolUsuario.SOLICITANTE,
      activo: true,
    },
  });

  console.log('✅ Usuarios del equipo creados exitosamente (todos con password Admin123!)');

  // ============================================================
  // CASO 1: PROYECTO SOFTWARE (E-LEARNING & PAGOS)
  // ============================================================
  const proyectoSoftware = await prisma.proyectoCaso.upsert({
    where: {
      organizacion_id_codigo: {
        organizacion_id: orgSoftware.id,
        codigo: 'PRY-CURSOS-01',
      },
    },
    update: {
      cliente_nombre: 'Instituto Continental (Elena Ramos)',
    },
    create: {
      organizacion_id: orgSoftware.id,
      codigo: 'PRY-CURSOS-01',
      nombre: 'Plataforma Web E-Learning y Pagos',
      cliente_nombre: 'Instituto Continental (Elena Ramos)',
      fecha_inicio: new Date('2026-10-01'),
      fecha_estimada_fin: new Date('2026-11-20'),
      estado: 'EN_EJECUCION',
    },
  });

  // ECS Software
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
      responsable_id: devBackend.id,
    },
  });

  // Versión 1.0.0 Aprobada
  const version100 = await prisma.versionEcs.upsert({
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
      autor_id: devBackend.id,
      aprobador_id: aprobadorSoftware.id,
      fecha_aprobacion: new Date('2026-10-15'),
    },
  });

  // Versión 1.1.0 Pendiente (fruto del cambio pedido por el cliente)
  const version110 = await prisma.versionEcs.upsert({
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
      descripcion: 'Soporte adicional para pagos locales con Yape y Plin mediante código QR dinámico.',
      archivo_url: 'https://github.com/ClaraBQuispeChileno/G01/commit/v1.1.0-qr',
      estado: 'PENDIENTE',
      autor_id: devFrontend.id,
    },
  });

  // Línea Base Oficial Congelada
  const lineaBaseSoftware = await prisma.lineaBase.upsert({
    where: {
      proyecto_id_codigo: {
        proyecto_id: proyectoSoftware.id,
        codigo: 'LB-CURSOS-01',
      },
    },
    update: {},
    create: {
      proyecto_id: proyectoSoftware.id,
      codigo: 'LB-CURSOS-01',
      nombre: 'Línea Base Oficial v1.0.0 de Pagos',
      descripcion: 'Alcance pactado y congelado formalmente tras la revisión con Instituto Continental.',
      autor_id: adminSoftware.id,
      estado: 'VIGENTE',
      created_at: new Date('2026-10-18'),
    },
  });

  await prisma.lineaBaseVersion.upsert({
    where: {
      linea_base_id_version_ecs_id: {
        linea_base_id: lineaBaseSoftware.id,
        version_ecs_id: version100.id,
      },
    },
    update: {},
    create: {
      linea_base_id: lineaBaseSoftware.id,
      version_ecs_id: version100.id,
    },
  });

  // Solicitud de Cambio (RFC) sobre la Línea Base
  const rfcSoftware = await prisma.solicitudCambio.upsert({
    where: { codigo: 'RFC-2026-001' },
    update: {},
    create: {
      codigo: 'RFC-2026-001',
      ecs_id: ecsSoftware.id,
      version_base_id: version100.id,
      version_resultante_id: version110.id,
      descripcion: 'Agregar pasarela de cobros en moneda nacional mediante código QR de Yape y Plin.',
      justificacion: 'Requerimiento prioritario de la decana Elena Ramos para los alumnos del Perú.',
      estado: EstadoCambio.EN_EVALUACION,
      solicitante_id: adminSoftware.id,
      created_at: new Date('2026-10-26'),
    },
  });

  await prisma.evaluacionCambio.upsert({
    where: { solicitud_id: rfcSoftware.id },
    update: {},
    create: {
      solicitud_id: rfcSoftware.id,
      impacto: NivelImpacto.MEDIO,
      observaciones: 'El cambio requiere 4 días hábiles adicionales y ajustar el webhook de notificaciones bancarias.',
      evaluador_id: aprobadorSoftware.id,
      created_at: new Date('2026-10-27'),
    },
  });

  // Reuniones Software (Con fechas en Octubre y Noviembre 2026, incluyendo HOY 03-Nov)
  await prisma.reunionProyecto.deleteMany({
    where: { proyecto_id: proyectoSoftware.id },
  });

  await prisma.reunionProyecto.createMany({
    data: [
      {
        proyecto_id: proyectoSoftware.id,
        convocante_id: adminSoftware.id,
        titulo: 'Briefing Inicial con Instituto Continental: Necesidades de E-Learning',
        tipo: TipoReunion.CLIENTE,
        fecha: new Date('2026-10-18'),
        hora: '10:00',
        participantes: 'Carlos Mendoza (Gerente TI), Mg. Elena Ramos (Decana Continental)',
        temas_tratados: 'Requerimientos para plataforma de cursos virtuales, emisión de certificados y cobros online seguros para alumnos.',
        acuerdos: 'Se acordó implementar Stripe y PayPal en la fase 1. Se pactó congelar la primera Línea Base tras visto bueno.',
        proximo_paso: 'Reunión de arquitectura con el equipo técnico para desglosar entregables.',
      },
      {
        proyecto_id: proyectoSoftware.id,
        convocante_id: adminSoftware.id,
        titulo: 'Planificación de Sprint: Módulo de Pagos y Arquitectura',
        tipo: TipoReunion.EQUIPO_INTERNO,
        fecha: new Date('2026-10-22'),
        hora: '15:30',
        participantes: 'Carlos Mendoza, Ing. Rodrigo Paredes, Luis Gómez (Backend), Ana Torres (Frontend)',
        temas_tratados: 'Definición del componente ECS-MOD-PAGOS, controladores de Stripe, modelo de base de datos y diseño responsive.',
        acuerdos: 'Luis desarrolla controladores Stripe. Rodrigo revisa y dictamina antes de congelar.',
        proximo_paso: 'Presentar v1.0.0 a la decana para aprobación final.',
      },
      {
        proyecto_id: proyectoSoftware.id,
        convocante_id: adminSoftware.id,
        titulo: 'Reunión de Avance y Nueva Solicitud de Pagos QR (Yape/Plin)',
        tipo: TipoReunion.CLIENTE,
        fecha: new Date('2026-10-28'),
        hora: '11:00',
        participantes: 'Carlos Mendoza (Gerente TI), Mg. Elena Ramos (Decana Continental)',
        temas_tratados: 'Se mostró la versión v1.0.0 funcionando. Elena solicitó agregar pagos con QR de Yape y Plin para el mercado local.',
        acuerdos: 'Como el alcance original ya está congelado en la Línea Base LB-CURSOS-01, se acordó abrir formalmente la Solicitud de Cambio RFC-2026-001.',
        proximo_paso: 'Dictamen de impacto técnico y desarrollo de la versión v1.1.0.',
      },
      {
        proyecto_id: proyectoSoftware.id,
        convocante_id: aprobadorSoftware.id,
        titulo: 'Revisión Técnica de Prototipo QR Yape/Plin (HOY)',
        tipo: TipoReunion.EQUIPO_INTERNO,
        fecha: new Date('2026-11-03'),
        hora: '11:30',
        participantes: 'Ing. Rodrigo Paredes, Ana Torres (Frontend), Luis Gómez (Backend)',
        temas_tratados: 'Evaluación del componente visual de QR generado y webhook de validación de pago en tiempo real.',
        acuerdos: 'Ana ajusta la animación de confirmación. Luis conecta el endpoint de webhook.',
        proximo_paso: 'Demostración de la versión v1.1.0 a Elena Ramos este viernes.',
      },
      {
        proyecto_id: proyectoSoftware.id,
        convocante_id: devFrontend.id,
        titulo: 'Demostración de Interfaz de Cobros con Alumnos de Continental',
        tipo: TipoReunion.CLIENTE,
        fecha: new Date('2026-11-06'),
        hora: '16:00',
        participantes: 'Ana Torres, Carlos Mendoza, Mg. Elena Ramos',
        temas_tratados: 'Validación de usabilidad móvil del flujo de pago con código QR en teléfonos Android y iPhone.',
        acuerdos: 'Recibir feedback directo de los estudiantes y recopilar métricas de éxito.',
        proximo_paso: 'Cierre del ticket de cambio RFC-2026-001.',
      },
      {
        proyecto_id: proyectoSoftware.id,
        convocante_id: adminSoftware.id,
        titulo: 'Comité de Cierre y Nueva Línea Base v1.1.0',
        tipo: TipoReunion.COMITE_CAMBIOS,
        fecha: new Date('2026-11-12'),
        hora: '10:00',
        participantes: 'Carlos Mendoza, Ing. Rodrigo Paredes, Mg. Elena Ramos',
        temas_tratados: 'Dictamen final de implementación del cambio e incorporación a la nueva Línea Base oficial.',
        acuerdos: 'Congelar la Línea Base v1.1.0 e iniciar fase de despliegue a producción.',
        proximo_paso: 'Puesta en marcha final.',
      },
    ],
  });

  // ============================================================
  // CASO 2: PROYECTO CONSTRUCCIÓN (CASA RESIDENCIAL DON JUAN)
  // ============================================================
  const proyectoConstruccion = await prisma.proyectoCaso.upsert({
    where: {
      organizacion_id_codigo: {
        organizacion_id: orgSoftware.id,
        codigo: 'PRY-CASA-01',
      },
    },
    update: {
      cliente_nombre: 'Don Juan Pérez (Propietario)',
    },
    create: {
      organizacion_id: orgSoftware.id,
      codigo: 'PRY-CASA-01',
      nombre: 'Construcción Vivienda Residencial 2 Pisos',
      cliente_nombre: 'Don Juan Pérez (Propietario)',
      fecha_inicio: new Date('2026-10-10'),
      fecha_estimada_fin: new Date('2026-12-15'),
      estado: 'EN_EJECUCION',
    },
  });

  // ECS Construcción
  const ecsConstruccion = await prisma.ecs.upsert({
    where: {
      proyecto_id_codigo: {
        proyecto_id: proyectoConstruccion.id,
        codigo: 'ECS-PLANO-ESTRUC',
      },
    },
    update: {},
    create: {
      proyecto_id: proyectoConstruccion.id,
      codigo: 'ECS-PLANO-ESTRUC',
      nombre: 'Planos Estructurales y Memoria de Cálculo Sísmico',
      tipo: TipoEcs.DISENO,
      descripcion: 'Planos de cimentación, vigas peraltadas y losa aligerada para vivienda de 2 plantas.',
      ubicacion: 'Drive://Horizonte/Proyectos/Casa-DonJuan/Planos-Estructurales-RevA.dwg',
      responsable_id: arquitectaObras.id,
    },
  });

  const versionCasa10 = await prisma.versionEcs.upsert({
    where: {
      ecs_id_numero_version: {
        ecs_id: ecsConstruccion.id,
        numero_version: '1.0.0',
      },
    },
    update: {},
    create: {
      ecs_id: ecsConstruccion.id,
      numero_version: '1.0.0',
      descripcion: 'Diseño estructural inicial aprobado para suelo arenoso de 2.5 kg/cm2.',
      archivo_url: 'Drive://Horizonte/Proyectos/Casa-DonJuan/Planos-Estructurales-v1.0.0.pdf',
      estado: 'APROBADA',
      autor_id: arquitectaObras.id,
      aprobador_id: aprobadorSoftware.id,
      fecha_aprobacion: new Date('2026-10-20'),
    },
  });

  const lineaBaseCasa = await prisma.lineaBase.upsert({
    where: {
      proyecto_id_codigo: {
        proyecto_id: proyectoConstruccion.id,
        codigo: 'LB-CASA-P01',
      },
    },
    update: {},
    create: {
      proyecto_id: proyectoConstruccion.id,
      codigo: 'LB-CASA-P01',
      nombre: 'Línea Base Oficial: Planos y Cimientos Aprobados',
      descripcion: 'Hito congelado con el cliente Don Juan. Prohibido alterar zapatas sin orden formal de cambio.',
      autor_id: adminSoftware.id,
      estado: 'VIGENTE',
      created_at: new Date('2026-10-22'),
    },
  });

  await prisma.lineaBaseVersion.upsert({
    where: {
      linea_base_id_version_ecs_id: {
        linea_base_id: lineaBaseCasa.id,
        version_ecs_id: versionCasa10.id,
      },
    },
    update: {},
    create: {
      linea_base_id: lineaBaseCasa.id,
      version_ecs_id: versionCasa10.id,
    },
  });

  // Reuniones Construcción (Con fechas en Octubre y Noviembre 2026, incluyendo HOY 03-Nov)
  await prisma.reunionProyecto.deleteMany({
    where: { proyecto_id: proyectoConstruccion.id },
  });

  await prisma.reunionProyecto.createMany({
    data: [
      {
        proyecto_id: proyectoConstruccion.id,
        convocante_id: adminSoftware.id,
        titulo: 'Reunión Inicial con Don Juan Pérez: Vivienda Familiar 2 Pisos',
        tipo: TipoReunion.CLIENTE,
        fecha: new Date('2026-10-10'),
        hora: '10:00',
        participantes: 'Carlos Mendoza (Gerente de Obra), Don Juan Pérez (Propietario)',
        temas_tratados: 'Don Juan solicita una casa de 2 pisos con 4 dormitorios, cochera techada para 2 camionetas y jardín posterior.',
        acuerdos: 'Se acuerda realizar levantamiento topográfico y elaborar planos estructurales sismorresistentes.',
        proximo_paso: 'Reunión técnica con la arquitecta María Flores para dimensionar zapatas.',
      },
      {
        proyecto_id: proyectoConstruccion.id,
        convocante_id: arquitectaObras.id,
        titulo: 'Sesión de Cálculo Estructural y Distribución de Cochera',
        tipo: TipoReunion.EQUIPO_INTERNO,
        fecha: new Date('2026-10-16'),
        hora: '14:00',
        participantes: 'Arq. María Flores, Carlos Mendoza, Ing. Rodrigo Paredes',
        temas_tratados: 'Distribución de vigas peraltadas para permitir espacio libre sin columnas en la cochera techada.',
        acuerdos: 'Elaborar el entregable ECS-PLANO-ESTRUC v1.0.0 y someterlo a dictamen formal.',
        proximo_paso: 'Presentar planos a Don Juan para congelar hito.',
      },
      {
        proyecto_id: proyectoConstruccion.id,
        convocante_id: adminSoftware.id,
        titulo: 'Reunión en Terreno con Don Juan y Solicitud de Piscina',
        tipo: TipoReunion.CLIENTE,
        fecha: new Date('2026-10-29'),
        hora: '11:00',
        participantes: 'Carlos Mendoza, Arq. María Flores, Don Juan Pérez',
        temas_tratados: 'Don Juan aprobó el inicio de obra pero solicitó que en el jardín se construya una piscina temperada de 6x3 metros.',
        acuerdos: 'Se le aclara que la piscina no estaba en la Línea Base pactada (LB-CASA-P01). Se acuerda presupuestar el impacto técnico y financiero.',
        proximo_paso: 'Calcular el impacto presupuestal y estructural de la excavación.',
      },
      {
        proyecto_id: proyectoConstruccion.id,
        convocante_id: adminSoftware.id,
        titulo: 'Presentación de Presupuesto Adicional de Piscina a Don Juan (HOY)',
        tipo: TipoReunion.CLIENTE,
        fecha: new Date('2026-11-03'),
        hora: '16:00',
        participantes: 'Carlos Mendoza, Arq. María Flores, Don Juan Pérez',
        temas_tratados: 'Presentación de cotización de muros de contención para piscina, cuarto de bombas y cronograma extendido (+12 días).',
        acuerdos: 'Don Juan acepta el sobrecosto. Se redacta la solicitud formal de cambio para congelar la adenda.',
        proximo_paso: 'Comité de cambio el jueves para firma de adenda.',
      },
      {
        proyecto_id: proyectoConstruccion.id,
        convocante_id: arquitectaObras.id,
        titulo: 'Inspección de Vaciado de Zapatas del Primer Piso',
        tipo: TipoReunion.EQUIPO_INTERNO,
        fecha: new Date('2026-11-07'),
        hora: '08:30',
        participantes: 'Arq. María Flores, Maestro de Obra Roberto, Cuadrilla de Cimentación',
        temas_tratados: 'Supervisión de calidad del concreto premezclado y colocación de armaduras de acero.',
        acuerdos: 'Registrar en Bitácora Diaria el avance y verificar probetas a los 7 días.',
        proximo_paso: 'Encofrado de columnas.',
      },
    ],
  });

  console.log('✅ Base de datos poblada con usuarios del equipo, reuniones de calendario y casos reales.');
}

main()
  .catch((e) => {
    console.error('❌ Error en Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
