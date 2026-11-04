import { PrismaClient, RubroIndustria, RolUsuario, TipoEcs, TipoReunion, EstadoCambio, NivelImpacto } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando carga y separación de datos semilla Multi-Tenant (Seed)...');

  // ============================================================
  // 1. ORGANIZACIÓN MAESTRA (SUPERADMIN GLOBAL)
  // ============================================================
  const orgMaestra = await prisma.organizacion.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {
      nombre: 'Administración Global SGCS',
      rubro: RubroIndustria.SOFTWARE,
    },
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

  // ============================================================
  // 2. EMPRESA CLIENTE 1: SOFTWARE (DevCraft Software Solutions)
  // ============================================================
  const orgSoftware = await prisma.organizacion.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {
      nombre: 'DevCraft Software Solutions',
      rubro: RubroIndustria.SOFTWARE,
    },
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      nombre: 'DevCraft Software Solutions',
      rubro: RubroIndustria.SOFTWARE,
      configuracion_terminologia: {
        terminos: {
          proyecto: 'Sistema / Proyecto TI',
          ecs: 'Componente / Módulo de Código',
          version: 'Release / Tag Git',
          linea_base: 'Línea Base de Código',
          solicitud_cambio: 'RFC / Ticket de Cambio',
          reporte_diario: 'Daily Standup de Desarrollo',
        },
      },
    },
  });

  // Limpiar cualquier residuo de proyectos de construcción que hayan quedado por error en Software
  await prisma.proyectoCaso.deleteMany({
    where: {
      codigo: 'PRY-CASA-01',
      organizacion_id: orgSoftware.id,
    },
  });

  // Usuarios del Equipo de Software
  const adminSoftware = await prisma.usuario.upsert({
    where: {
      organizacion_id_email: {
        organizacion_id: orgSoftware.id,
        email: 'admin.software@sgcs.com',
      },
    },
    update: {
      nombre_completo: 'Carlos Mendoza (Gerente TI / Jefe de Proyecto)',
    },
    create: {
      organizacion_id: orgSoftware.id,
      nombre_completo: 'Carlos Mendoza (Gerente TI / Jefe de Proyecto)',
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
    update: {
      nombre_completo: 'Ing. Rodrigo Paredes (Tech Lead / Arquitecto)',
    },
    create: {
      organizacion_id: orgSoftware.id,
      nombre_completo: 'Ing. Rodrigo Paredes (Tech Lead / Arquitecto)',
      email: 'aprobador.software@sgcs.com',
      password_hash: passwordHash,
      rol: RolUsuario.APROBADOR,
      activo: true,
    },
  });

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

  // PROYECTO SOFTWARE 1: Plataforma Web E-Learning y Pagos
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

  // PROYECTO SOFTWARE 2: App Móvil de Alumnos y Notificaciones
  const proyectoSoftware2 = await prisma.proyectoCaso.upsert({
    where: {
      organizacion_id_codigo: {
        organizacion_id: orgSoftware.id,
        codigo: 'PRY-APP-02',
      },
    },
    update: {},
    create: {
      organizacion_id: orgSoftware.id,
      codigo: 'PRY-APP-02',
      nombre: 'App Móvil de Estudiantes y Notificaciones Push',
      cliente_nombre: 'Corporación Educativa San Marcos',
      fecha_inicio: new Date('2026-10-15'),
      fecha_estimada_fin: new Date('2026-12-10'),
      estado: 'EN_EJECUCION',
    },
  });

  // ECS Proyecto 1 (Software)
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

  // Versiones ECS Software
  const versionSoft100 = await prisma.versionEcs.upsert({
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

  const versionSoft110 = await prisma.versionEcs.upsert({
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

  // Línea Base Software
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
        version_ecs_id: versionSoft100.id,
      },
    },
    update: {},
    create: {
      linea_base_id: lineaBaseSoftware.id,
      version_ecs_id: versionSoft100.id,
    },
  });

  // RFC Software
  const rfcSoftware = await prisma.solicitudCambio.upsert({
    where: { codigo: 'RFC-2026-001' },
    update: {},
    create: {
      codigo: 'RFC-2026-001',
      ecs_id: ecsSoftware.id,
      version_base_id: versionSoft100.id,
      version_resultante_id: versionSoft110.id,
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

  // Reuniones Software
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
    ],
  });

  // ECS Proyecto 2 (Software)
  await prisma.ecs.upsert({
    where: {
      proyecto_id_codigo: {
        proyecto_id: proyectoSoftware2.id,
        codigo: 'ECS-NOTIF-APP',
      },
    },
    update: {},
    create: {
      proyecto_id: proyectoSoftware2.id,
      codigo: 'ECS-NOTIF-APP',
      nombre: 'Servicio de Mensajería Push Firebase & WebSockets',
      tipo: TipoEcs.CODIGO_FUENTE,
      descripcion: 'Microservicio en Node.js para alertas instantáneas de notas y clases en tiempo real.',
      ubicacion: 'https://github.com/ClaraBQuispeChileno/G01/src/services/notifications',
      responsable_id: devBackend.id,
    },
  });

  console.log('✅ Empresa de Software (DevCraft) y sus 2 proyectos de software configurados.');

  // ============================================================
  // 3. EMPRESA CLIENTE 2: CONSTRUCCIÓN (Constructora Los Andes)
  // ============================================================
  const orgConstruccion = await prisma.organizacion.upsert({
    where: { id: '00000000-0000-0000-0000-000000000004' },
    update: {
      nombre: 'Constructora & Proyectos Los Andes',
      rubro: RubroIndustria.CONSTRUCCION,
    },
    create: {
      id: '00000000-0000-0000-0000-000000000004',
      nombre: 'Constructora & Proyectos Los Andes',
      rubro: RubroIndustria.CONSTRUCCION,
      configuracion_terminologia: {
        terminos: {
          proyecto: 'Obra Civil / Edificación',
          ecs: 'Plano Técnico / Memoria Estructural',
          version: 'Revisión de Plano / Enmienda',
          linea_base: 'Hito Congelado / Firma de Planos',
          solicitud_cambio: 'Orden de Modificación de Obra (RFC)',
          reporte_diario: 'Bitácora Diaria de Cuadrilla',
        },
      },
    },
  });

  // Usuarios del Equipo de Construcción
  const adminConstruccion = await prisma.usuario.upsert({
    where: {
      organizacion_id_email: {
        organizacion_id: orgConstruccion.id,
        email: 'admin.construccion@sgcs.com',
      },
    },
    update: {},
    create: {
      organizacion_id: orgConstruccion.id,
      nombre_completo: 'Ing. Roberto Sánchez (Residente de Obra / Gerente)',
      email: 'admin.construccion@sgcs.com',
      password_hash: passwordHash,
      rol: RolUsuario.ADMINISTRADOR,
      activo: true,
    },
  });

  const aprobadorConstruccion = await prisma.usuario.upsert({
    where: {
      organizacion_id_email: {
        organizacion_id: orgConstruccion.id,
        email: 'aprobador.construccion@sgcs.com',
      },
    },
    update: {},
    create: {
      organizacion_id: orgConstruccion.id,
      nombre_completo: 'Arq. María Flores (Arquitecta Estructural / Supervisora)',
      email: 'aprobador.construccion@sgcs.com',
      password_hash: passwordHash,
      rol: RolUsuario.APROBADOR,
      activo: true,
    },
  });

  const maestroObra = await prisma.usuario.upsert({
    where: {
      organizacion_id_email: {
        organizacion_id: orgConstruccion.id,
        email: 'maestro.obra@sgcs.com',
      },
    },
    update: {},
    create: {
      organizacion_id: orgConstruccion.id,
      nombre_completo: 'Maestro Pedro Quispe (Jefe de Cuadrilla & Cimentación)',
      email: 'maestro.obra@sgcs.com',
      password_hash: passwordHash,
      rol: RolUsuario.SOLICITANTE,
      activo: true,
    },
  });

  // PROYECTO CONSTRUCCIÓN 1: Vivienda Don Juan Pérez
  const proyectoConstruccion = await prisma.proyectoCaso.upsert({
    where: {
      organizacion_id_codigo: {
        organizacion_id: orgConstruccion.id,
        codigo: 'PRY-CASA-01',
      },
    },
    update: {
      cliente_nombre: 'Don Juan Pérez (Propietario)',
    },
    create: {
      organizacion_id: orgConstruccion.id,
      codigo: 'PRY-CASA-01',
      nombre: 'Construcción Vivienda Residencial 2 Pisos',
      cliente_nombre: 'Don Juan Pérez (Propietario)',
      fecha_inicio: new Date('2026-10-10'),
      fecha_estimada_fin: new Date('2026-12-15'),
      estado: 'EN_EJECUCION',
    },
  });

  // PROYECTO CONSTRUCCIÓN 2: Edificio Multifamiliar
  const proyectoConstruccion2 = await prisma.proyectoCaso.upsert({
    where: {
      organizacion_id_codigo: {
        organizacion_id: orgConstruccion.id,
        codigo: 'PRY-EDIF-02',
      },
    },
    update: {},
    create: {
      organizacion_id: orgConstruccion.id,
      codigo: 'PRY-EDIF-02',
      nombre: 'Edificio Residencial Multifamiliar 5 Pisos',
      cliente_nombre: 'Inversiones Inmobiliarias El Roble',
      fecha_inicio: new Date('2026-10-05'),
      fecha_estimada_fin: new Date('2027-04-30'),
      estado: 'EN_EJECUCION',
    },
  });

  // ECS Construcción (Planos Estructurales)
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
      responsable_id: aprobadorConstruccion.id,
    },
  });

  // Versión 1.0.0 Aprobada
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
      autor_id: aprobadorConstruccion.id,
      aprobador_id: adminConstruccion.id,
      fecha_aprobacion: new Date('2026-10-20'),
    },
  });

  // Versión 1.1.0 Pendiente (Rediseño con piscina)
  const versionCasa11 = await prisma.versionEcs.upsert({
    where: {
      ecs_id_numero_version: {
        ecs_id: ecsConstruccion.id,
        numero_version: '1.1.0',
      },
    },
    update: {},
    create: {
      ecs_id: ecsConstruccion.id,
      numero_version: '1.1.0',
      descripcion: 'Rediseño con excavación de fosa para piscina 6x3m y refuerzo de muro de contención perimetral.',
      archivo_url: 'Drive://Horizonte/Proyectos/Casa-DonJuan/Planos-Estructurales-v1.1.0-piscina.pdf',
      estado: 'PENDIENTE',
      autor_id: aprobadorConstruccion.id,
    },
  });

  // Línea Base Construcción
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
      autor_id: adminConstruccion.id,
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

  // Solicitud de Cambio (RFC) Construcción: Piscina Adicional
  const rfcCasa = await prisma.solicitudCambio.upsert({
    where: { codigo: 'RFC-CASA-001' },
    update: {},
    create: {
      codigo: 'RFC-CASA-001',
      ecs_id: ecsConstruccion.id,
      version_base_id: versionCasa10.id,
      version_resultante_id: versionCasa11.id,
      descripcion: 'Construcción de piscina temperada de 6x3m en el jardín posterior solicitada por Don Juan.',
      justificacion: 'Solicitud expresa del propietario Don Juan Pérez con aceptación de sobrecosto y ampliación de plazo.',
      estado: EstadoCambio.EN_EVALUACION,
      solicitante_id: adminConstruccion.id,
      created_at: new Date('2026-10-30'),
    },
  });

  await prisma.evaluacionCambio.upsert({
    where: { solicitud_id: rfcCasa.id },
    update: {},
    create: {
      solicitud_id: rfcCasa.id,
      impacto: NivelImpacto.ALTO,
      observaciones: 'El cambio requiere 12 días calendario adicionales para excavación manual y reforzamiento de cimientos vecinos.',
      evaluador_id: aprobadorConstruccion.id,
      created_at: new Date('2026-10-31'),
    },
  });

  // Reuniones Construcción
  await prisma.reunionProyecto.deleteMany({
    where: { proyecto_id: proyectoConstruccion.id },
  });

  await prisma.reunionProyecto.createMany({
    data: [
      {
        proyecto_id: proyectoConstruccion.id,
        convocante_id: adminConstruccion.id,
        titulo: 'Reunión Inicial con Don Juan Pérez: Vivienda Familiar 2 Pisos',
        tipo: TipoReunion.CLIENTE,
        fecha: new Date('2026-10-10'),
        hora: '10:00',
        participantes: 'Ing. Roberto Sánchez (Residente), Don Juan Pérez (Propietario)',
        temas_tratados: 'Don Juan solicita una casa de 2 pisos con 4 dormitorios, cochera techada para 2 camionetas y jardín posterior.',
        acuerdos: 'Se acuerda realizar levantamiento topográfico y elaborar planos estructurales sismorresistentes.',
        proximo_paso: 'Reunión técnica con la arquitecta María Flores para dimensionar zapatas.',
      },
      {
        proyecto_id: proyectoConstruccion.id,
        convocante_id: aprobadorConstruccion.id,
        titulo: 'Sesión de Cálculo Estructural y Distribución de Cochera',
        tipo: TipoReunion.EQUIPO_INTERNO,
        fecha: new Date('2026-10-16'),
        hora: '14:00',
        participantes: 'Arq. María Flores, Ing. Roberto Sánchez, Maestro Pedro Quispe',
        temas_tratados: 'Distribución de vigas peraltadas para permitir espacio libre sin columnas en la cochera techada.',
        acuerdos: 'Elaborar el entregable ECS-PLANO-ESTRUC v1.0.0 y someterlo a dictamen formal.',
        proximo_paso: 'Presentar planos a Don Juan para congelar hito.',
      },
      {
        proyecto_id: proyectoConstruccion.id,
        convocante_id: adminConstruccion.id,
        titulo: 'Reunión en Terreno con Don Juan y Solicitud de Piscina',
        tipo: TipoReunion.CLIENTE,
        fecha: new Date('2026-10-29'),
        hora: '11:00',
        participantes: 'Ing. Roberto Sánchez, Arq. María Flores, Don Juan Pérez',
        temas_tratados: 'Don Juan aprobó el inicio de obra pero solicitó que en el jardín se construya una piscina temperada de 6x3 metros.',
        acuerdos: 'Se le aclara que la piscina no estaba en la Línea Base pactada (LB-CASA-P01). Se acuerda presupuestar el impacto técnico y financiero.',
        proximo_paso: 'Calcular el impacto presupuestal y estructural de la excavación.',
      },
      {
        proyecto_id: proyectoConstruccion.id,
        convocante_id: adminConstruccion.id,
        titulo: 'Presentación de Presupuesto Adicional de Piscina a Don Juan (HOY)',
        tipo: TipoReunion.CLIENTE,
        fecha: new Date('2026-11-03'),
        hora: '16:00',
        participantes: 'Ing. Roberto Sánchez, Arq. María Flores, Don Juan Pérez',
        temas_tratados: 'Presentación de cotización de muros de contención para piscina, cuarto de bombas y cronograma extendido (+12 días).',
        acuerdos: 'Don Juan acepta el sobrecosto. Se redacta la solicitud formal de cambio para congelar la adenda.',
        proximo_paso: 'Comité de cambio el jueves para firma de adenda.',
      },
      {
        proyecto_id: proyectoConstruccion.id,
        convocante_id: aprobadorConstruccion.id,
        titulo: 'Inspección de Vaciado de Zapatas del Primer Piso',
        tipo: TipoReunion.EQUIPO_INTERNO,
        fecha: new Date('2026-11-07'),
        hora: '08:30',
        participantes: 'Arq. María Flores, Maestro Pedro Quispe, Cuadrilla de Cimentación',
        temas_tratados: 'Supervisión de calidad del concreto premezclado y colocación de armaduras de acero.',
        acuerdos: 'Registrar en Bitácora Diaria el avance y verificar probetas a los 7 días.',
        proximo_paso: 'Encofrado de columnas.',
      },
    ],
  });

  // ECS Proyecto 2 (Construcción)
  await prisma.ecs.upsert({
    where: {
      proyecto_id_codigo: {
        proyecto_id: proyectoConstruccion2.id,
        codigo: 'ECS-PLANO-ARQ-EDIF',
      },
    },
    update: {},
    create: {
      proyecto_id: proyectoConstruccion2.id,
      codigo: 'ECS-PLANO-ARQ-EDIF',
      nombre: 'Planos Arquitectónicos de Departamentos Típicos 5 Pisos',
      tipo: TipoEcs.DISENO,
      descripcion: 'Distribución interior de departamentos dúplex y flats con estudio de iluminación natural.',
      ubicacion: 'Drive://Horizonte/Proyectos/Edificio-Roble/Planos-Arquitectura-v1.dwg',
      responsable_id: aprobadorConstruccion.id,
    },
  });

  console.log('✅ Empresa de Construcción (Constructora Los Andes) y el caso Don Juan configurados.');
  console.log('🎉 Separación Multi-Tenant completada con éxito.');
}

main()
  .catch((e) => {
    console.error('❌ Error en Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
