export type RubroTipo = 'CONSTRUCCION' | 'SOFTWARE' | 'VETERINARIA';

export interface PasoFlujo {
  paso: number;
  badge: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  ejemploReal: string;
  iconName: 'Users' | 'Layers' | 'ShieldCheck' | 'Lock' | 'AlertTriangle';
}

export interface RubroConfig {
  nombreIndustria: string;
  badgeIndustria: string;
  
  // Entidad principal: Proyecto / Obra / Protocolo
  proyectoLabel: string;
  proyectoLabelPlural: string;
  proyectoPlaceholder: string;
  proyectoCodigoEjemplo: string;
  clienteLabel: string;
  clientePlaceholder: string;

  // Paso 1: Reuniones
  reunionesTitulo: string;
  reunionesSubtitulo: string;
  reunionTipoClienteLabel: string;
  reunionTipoEquipoLabel: string;
  reunionEjemploTema: string;

  // Paso 2: Entregables (ECS)
  ecsLabel: string;
  ecsLabelPlural: string;
  ecsSubtitulo: string;
  ecsTipos: { valor: string; label: string; placeholder: string }[];
  ecsEjemploCodigo: string;
  ecsEjemploNombre: string;

  // Paso 3: Aprobación Técnica
  aprobadorCargo: string;
  aprobadorRolLabel: string;
  aprobacionSubtitulo: string;

  // Paso 4: Línea Base
  lineaBaseLabel: string;
  lineaBaseSubtitulo: string;
  lineaBaseExplicacion: string;
  lineaBaseEjemploCodigo: string;
  lineaBaseEjemploNombre: string;

  // Paso 5: Control de Cambios (RFC)
  cambioLabel: string;
  cambioSubtitulo: string;
  cambioEjemploCodigo: string;
  cambioEjemploDescripcion: string;
  cambioEjemploJustificacion: string;
  cambioEjemploResolucion: string;

  // Bitácora de Campo
  bitacoraLabel: string;
  bitacoraSubtitulo: string;
  bitacoraUnidadAvanzada: string;
  bitacoraMaterialConsumido: string;

  // Matriz de Trazabilidad
  trazabilidadLabel: string;
  trazabilidadSubtitulo: string;

  // Recomendaciones Dinámicas en Dashboard
  recomendaciones: {
    pendientesAprobacion: (n: number) => string;
    sinLineaBase: string;
    lineaBaseVigente: string;
    sinProyectos: string;
  };

  // Guía de 5 Pasos ("¿Cómo funciona?")
  pasosGuia: PasoFlujo[];
}

export const CATALOGO_TERMINOLOGIA: Record<RubroTipo, RubroConfig> = {
  CONSTRUCCION: {
    nombreIndustria: 'Construcción & Obras Civiles',
    badgeIndustria: 'Industria de Construcción y Obras Civiles',

    proyectoLabel: 'Obra Civil / Proyecto de Edificación',
    proyectoLabelPlural: 'Obras Civiles',
    proyectoPlaceholder: 'Ej. Construcción y Habilitación de Campamento Minero y Accesos',
    proyectoCodigoEjemplo: 'OBRA-CAMP-01',
    clienteLabel: 'Propietario / Cliente Contratante',
    clientePlaceholder: 'Ej. Consorcio Minero del Sur S.A. / Don Juan Pérez',

    reunionesTitulo: 'Actas de Coordinación de Obra (Minutas)',
    reunionesSubtitulo: 'Compromisos de campo, metrados e hitos acordados con el cliente y contratista',
    reunionTipoClienteLabel: 'Con Propietario / Cliente (Revisión de Avances y Adicionales)',
    reunionTipoEquipoLabel: 'Con Cuadrilla / Equipo Técnico (Coordinación de Faena)',
    reunionEjemploTema: 'Revisión de zapatas, compactación de terreno y metrado de piscina adicional',

    ecsLabel: 'Plano / Memoria Descriptiva (ECS)',
    ecsLabelPlural: 'Planos y Memorias Técnicas (ECS)',
    ecsSubtitulo: 'Inventario de planos estructurales, sanitarios, eléctricos y memorias de cálculo',
    ecsTipos: [
      { valor: 'DISENO', label: 'Plano Estructural / Arquitectónico', placeholder: 'Ej. Planos de Cimentaciones y Muros de Contención' },
      { valor: 'DOCUMENTO', label: 'Memoria de Cálculo / Estudio de Suelos', placeholder: 'Ej. Estudio Geotécnico de Resistencia y Capacidad Portante' },
      { valor: 'BASE_DATOS', label: 'Hoja de Metrados / Presupuesto Unitario', placeholder: 'Ej. Matriz de Volúmenes de Concreto y Fierro' },
      { valor: 'CASO_PRUEBA', label: 'Control de Calidad (Probetas y Ensayos)', placeholder: 'Ej. Ensayos de Resistencia a la Compresión f’c = 210 kg/cm2' },
      { valor: 'OTRO', label: 'Especificación Técnica Especial', placeholder: 'Ej. Ficha Técnica de Aditivos para Concreto' },
    ],
    ecsEjemploCodigo: 'PLANO-EST-01',
    ecsEjemploNombre: 'Plano Estructural de Cimentaciones y Vigas de Cimentación',

    aprobadorCargo: 'Ingeniero Residente / Supervisor de Obra',
    aprobadorRolLabel: 'Residente / Supervisor de Obra',
    aprobacionSubtitulo: 'Dictamen técnico formal antes de autorizar el vaciado o habilitación en faena',

    lineaBaseLabel: 'Línea Base Contractual (Hito Congelado)',
    lineaBaseSubtitulo: 'Alcance técnico y contractual inmutable acordado formalmente con el cliente',
    lineaBaseExplicacion: 'Congela los planos y especificaciones aprobadas. Cualquier trabajo fuera de esta línea base constituye un adicional de obra y requiere una Orden de Modificación (RFC).',
    lineaBaseEjemploCodigo: 'LB-OBRA-01',
    lineaBaseEjemploNombre: 'Línea Base Contractual: Cimentaciones y Estructuras Principales',

    cambioLabel: 'Orden de Modificación / Adicional de Obra (RFC)',
    cambioSubtitulo: 'Control formal de ampliaciones, deductivos o replanteos solicitados en faena',
    cambioEjemploCodigo: 'MOD-OBRA-01',
    cambioEjemploDescripcion: 'Adición de piscina de 30m2 con sistema de bombeo y recirculación en patio posterior no contemplada en el plano original.',
    cambioEjemploJustificacion: 'Solicitud expresa del propietario Don Juan Pérez tras reunión de coordinación del 3 de noviembre.',
    cambioEjemploResolucion: 'Se autoriza la Orden de Modificación N° 01 con un presupuesto adicional de S/ 18,500 y una ampliación de plazo contractual de 12 días calendario.',

    bitacoraLabel: 'Parte Diario de Faena (Bitácora de Campo)',
    bitacoraSubtitulo: 'Control diario de cuadrillas, vaciado, clima y reporte de bloqueos en obra',
    bitacoraUnidadAvanzada: 'Metros Cuadrados / Metros Cúbicos Avanzados',
    bitacoraMaterialConsumido: 'Bolsas de Cemento / Toneladas de Acero Consumidas',

    trazabilidadLabel: 'Matriz de Trazabilidad Obra - Planos - Cambios',
    trazabilidadSubtitulo: 'Trazabilidad formal bidireccional desde los acuerdos de minuta hasta las órdenes de cambio',

    recomendaciones: {
      pendientesAprobacion: (n) => `Hay ${n} plano(s) o memoria(s) esperando dictamen técnico del Ingeniero Residente.`,
      sinLineaBase: 'Los planos estructurales iniciales están aprobados. El siguiente paso es congelar la Línea Base Contractual con el cliente.',
      lineaBaseVigente: 'Línea Base Contractual vigente. La cuadrilla debe continuar la faena y registrar los partes diarios en la bitácora.',
      sinProyectos: 'Aún no tienes obras civiles registradas. Comienza registrando tu primera obra de edificación o vial.',
    },

    pasosGuia: [
      {
        paso: 1,
        badge: 'Acuerdo Inicial',
        titulo: 'Reunión de Coordinación de Obra',
        subtitulo: 'Minuta con el Propietario o Cliente',
        descripcion: 'Se documenta el alcance acordado con el cliente, requerimientos específicos y metrados pactados.',
        ejemploReal: 'Reunión con Don Juan Pérez donde solicita formalmente la construcción de su vivienda con acabados de primera.',
        iconName: 'Users',
      },
      {
        paso: 2,
        badge: 'Inventario de Ingeniería',
        titulo: 'Planos Estructurales y Memorias (ECS)',
        subtitulo: 'Elementos de Configuración de la Obra',
        descripcion: 'El equipo técnico (arquitectos, topógrafos) sube las revisiones de planos arquitectónicos, zapatas e instalaciones.',
        ejemploReal: 'Carga del plano "PLANO-CIM-01: Cimentaciones y Zapatas" en revisión v1.0.0.',
        iconName: 'Layers',
      },
      {
        paso: 3,
        badge: 'Dictamen Oficial',
        titulo: 'Aprobación del Ingeniero Residente',
        subtitulo: 'Firma Técnica Autorizada',
        descripcion: 'El Residente o Supervisor de Obra evalúa los cálculos estructurales y emite el dictamen de aprobación para faena.',
        ejemploReal: 'El Ingeniero Residente aprueba el plano v1.0.0 indicando conformidad con la norma técnica de sismoresistencia.',
        iconName: 'ShieldCheck',
      },
      {
        paso: 4,
        badge: 'Blindaje Contractual',
        titulo: 'Línea Base Contractual',
        subtitulo: 'Hito Inmutable de Construcción',
        descripcion: 'Se congelan los planos aprobados. A partir de este momento, cualquier modificación no puede hacerse de palabra.',
        ejemploReal: 'Se congela la "LB-CASA-01: Estructura Principal". Todo trabajo posterior se auditará contra este hito.',
        iconName: 'Lock',
      },
      {
        paso: 5,
        badge: 'Control de Modificaciones',
        titulo: 'Orden de Modificación de Obra (RFC)',
        subtitulo: 'Gestión de Adicionales y Deductivos',
        descripcion: 'Si el cliente pide un cambio imprevisto (ej. piscina o muros extras), se evalúa el costo, impacto y ampliación de plazo.',
        ejemploReal: 'Don Juan pide añadir una piscina: se genera la RFC-01, se aprueba el presupuesto adicional de S/ 18,500 y se actualiza el plano a v1.1.0.',
        iconName: 'AlertTriangle',
      },
    ],
  },

  SOFTWARE: {
    nombreIndustria: 'Software & Soluciones Digitales',
    badgeIndustria: 'Industria de Software y Tecnología',

    proyectoLabel: 'Proyecto de Software / Sistema TI',
    proyectoLabelPlural: 'Proyectos de Software',
    proyectoPlaceholder: 'Ej. Plataforma Web SaaS de Cursos y Evaluaciones Online',
    proyectoCodigoEjemplo: 'PRY-SISTEMA-01',
    clienteLabel: 'Stakeholder / Cliente Corporativo',
    clientePlaceholder: 'Ej. Innova Tech Perú / Banco Continental',

    reunionesTitulo: 'Minutas de Requerimientos & Sprints',
    reunionesSubtitulo: 'Acuerdos de arquitectura, historias de usuario y alcances pactados con el Product Owner',
    reunionTipoClienteLabel: 'Con Cliente / Product Owner (Validación de Historias y Demo)',
    reunionTipoEquipoLabel: 'Con Equipo de Desarrollo (Sprint Planning / Daily)',
    reunionEjemploTema: 'Definición de pasarela de pagos Stripe y arquitectura de microservicios',

    ecsLabel: 'Artefacto de Software (ECS)',
    ecsLabelPlural: 'Entregables de Software (ECS)',
    ecsSubtitulo: 'Control de versiones de código fuente, diagramas de base de datos y especificaciones SRS',
    ecsTipos: [
      { valor: 'CODIGO_FUENTE', label: 'Código Fuente / Microservicio', placeholder: 'Ej. Módulo Auth & Facturación en Next.js / NestJS' },
      { valor: 'DOCUMENTO', label: 'Especificación de Requerimientos (SRS)', placeholder: 'Ej. Matriz de Requerimientos Funcionales y No Funcionales IEEE 830' },
      { valor: 'BASE_DATOS', label: 'Script de Base de Datos / Migración', placeholder: 'Ej. Schema Prisma y Script de Migración PostgreSQL' },
      { valor: 'DISENO', label: 'Prototipo UI/UX / Wireframe', placeholder: 'Ej. Flujo de Checkout y Sistema de Diseño en Figma' },
      { valor: 'CASO_PRUEBA', label: 'Suite de Pruebas Automatizadas', placeholder: 'Ej. Pruebas Unitarias y de Integración con Jest / Cypress' },
      { valor: 'OTRO', label: 'Configuración CI/CD y Despliegue', placeholder: 'Ej. Pipeline Docker y GitHub Actions' },
    ],
    ecsEjemploCodigo: 'ECS-AUTH-API',
    ecsEjemploNombre: 'Módulo de Autenticación JWT y Roles RBAC',

    aprobadorCargo: 'Tech Lead / Arquitecto de Software',
    aprobadorRolLabel: 'Tech Lead / Arquitecto',
    aprobacionSubtitulo: 'Revisión técnica de código (Code Review), seguridad y arquitectura antes de mezclar a rama base',

    lineaBaseLabel: 'Línea Base de Release (Hito Congelado)',
    lineaBaseSubtitulo: 'Conjunto inmutable de artefactos de software aprobados para un Release o Sprint',
    lineaBaseExplicacion: 'Congela los entregables aprobados para producción. Cualquier cambio posterior requiere una Solicitud Formal de Cambio (RFC) evaluada por el Comité de Control de Cambios (CCB).',
    lineaBaseEjemploCodigo: 'LB-REL-1.0',
    lineaBaseEjemploNombre: 'Línea Base v1.0: Core de Autenticación y Catálogo de Productos',

    cambioLabel: 'Solicitud Formal de Cambio (RFC)',
    cambioSubtitulo: 'Gestión rigurosa de modificaciones al alcance técnico aprobadas por el CCB',
    cambioEjemploCodigo: 'RFC-PAY-01',
    cambioEjemploDescripcion: 'Integración de pasarela de pagos Stripe para cobros internacionales multimoneda.',
    cambioEjemploJustificacion: 'Requerimiento estratégico de negocio para habilitar suscripciones en dólares.',
    cambioEjemploResolucion: 'Se aprueba la RFC-PAY-01 con un esfuerzo estimado de 24 horas hombre e impacto bajo en arquitectura.',

    bitacoraLabel: 'Bitácora de Despliegue & Operación',
    bitacoraSubtitulo: 'Registro de incidencias, bloqueos técnicos de sprint y métricas de devops',
    bitacoraUnidadAvanzada: 'Puntos de Historia / Tareas Completadas',
    bitacoraMaterialConsumido: 'Horas de Servidor / Créditos Cloud Consumidos',

    trazabilidadLabel: 'Matriz de Trazabilidad de Requisitos (RTV)',
    trazabilidadSubtitulo: 'Trazabilidad bidireccional desde el requerimiento del cliente hasta el commit y caso de prueba',

    recomendaciones: {
      pendientesAprobacion: (n) => `Hay ${n} entregable(s) de código o docs esperando dictamen técnico del Tech Lead.`,
      sinLineaBase: 'Los artefactos del release están aprobados. El siguiente paso es congelar la primera Línea Base de software.',
      lineaBaseVigente: 'Línea Base oficial desplegada. El equipo debe continuar el sprint y reportar avances en la bitácora.',
      sinProyectos: 'Aún no tienes proyectos de software registrados. Registra tu primer sistema o app.',
    },

    pasosGuia: [
      {
        paso: 1,
        badge: 'Levantamiento',
        titulo: 'Reunión con Stakeholders',
        subtitulo: 'Minuta de Sprint o Kickoff',
        descripcion: 'Se documentan las necesidades del usuario, historias de usuario y acuerdos de alcance con el cliente.',
        ejemploReal: 'Reunión de Kickoff donde el cliente define la necesidad de una plataforma de comercio electrónico.',
        iconName: 'Users',
      },
      {
        paso: 2,
        badge: 'Repositorio',
        titulo: 'Artefactos de Software (ECS)',
        subtitulo: 'Código, Arquitectura y Base de Datos',
        descripcion: 'Los desarrolladores versionan el código fuente, endpoints de API y esquemas de base de datos en revisión v1.0.0.',
        ejemploReal: 'Carga del componente "API-PAGOS: Endpoint de Checkout" en versión v1.0.0.',
        iconName: 'Layers',
      },
      {
        paso: 3,
        badge: 'Code Review',
        titulo: 'Dictamen del Tech Lead',
        subtitulo: 'Aprobación de Calidad y Seguridad',
        descripcion: 'El Líder Técnico revisa que el código cumpla estándares, pruebas unitarias y linters antes de aprobarlo.',
        ejemploReal: 'El Tech Lead aprueba la versión v1.0.0 certificando que pasó las pruebas automáticas.',
        iconName: 'ShieldCheck',
      },
      {
        paso: 4,
        badge: 'Congelamiento',
        titulo: 'Línea Base de Release',
        subtitulo: 'Hito Oficial Blindado',
        descripcion: 'Se congelan los artefactos probados formando el Release oficial. El alcance queda protegido de variaciones arbitrarias.',
        ejemploReal: 'Se congela la "LB-PROD-01: MVP de Lanzamiento". Ningún desarrollador puede modificar código directamente.',
        iconName: 'Lock',
      },
      {
        paso: 5,
        badge: 'Control CCB',
        titulo: 'Solicitud Formal de Cambio (RFC)',
        subtitulo: 'Comité de Control de Cambios',
        descripcion: 'Si surge un nuevo requerimiento, el comité técnico evalúa el impacto, deuda técnica y autoriza la versión v1.1.0.',
        ejemploReal: 'El cliente pide soporte para PayPal: se genera la RFC-02, se evalúa y se genera la versión v1.1.0 aprobada.',
        iconName: 'AlertTriangle',
      },
    ],
  },

  VETERINARIA: {
    nombreIndustria: 'Salud & Servicios Veterinarios',
    badgeIndustria: 'Industria de Servicios Veterinarios y Salud Animal',

    proyectoLabel: 'Campaña Clínica / Especialidad Médica',
    proyectoLabelPlural: 'Campañas y Especialidades Clínicas',
    proyectoPlaceholder: 'Ej. Servicio de Cirugía Menor y Protocolos Quirúrgicos Caninos',
    proyectoCodigoEjemplo: 'VET-CIRUGIA-01',
    clienteLabel: 'Propietario / Tutor del Paciente',
    clientePlaceholder: 'Ej. Tutores de Mascotas / Albergue Huellitas Felices',

    reunionesTitulo: 'Juntas Médicas & Entrega de Turno',
    reunionesSubtitulo: 'Discusión de casos clínicos, acuerdos terapéuticos y consentimientos con los tutores',
    reunionTipoClienteLabel: 'Con Propietario / Tutor (Consentimiento Informado y Pronóstico)',
    reunionTipoEquipoLabel: 'Con Equipo Médico (Junta Clínica y Ronda de Pacientes)',
    reunionEjemploTema: 'Discusión de protocolo anestésico y consentimiento para cirugía ortopédica',

    ecsLabel: 'Protocolo / Historia Clínica (ECS)',
    ecsLabelPlural: 'Protocolos y Fichas Clínicas (ECS)',
    ecsSubtitulo: 'Control de versiones de protocolos quirúrgicos, fichas de triaje y esquemas farmacológicos',
    ecsTipos: [
      { valor: 'DOCUMENTO', label: 'Protocolo Quirúrgico / Procedimiento', placeholder: 'Ej. Protocolo de Esterilización y Manejo Anestésico TIVA' },
      { valor: 'DISENO', label: 'Consentimiento Informado / Ficha Clínica', placeholder: 'Ej. Ficha de Triaje de Emergencias y Valoración ASA' },
      { valor: 'BASE_DATOS', label: 'Registro Farmacológico / Dosis Terapéutica', placeholder: 'Ej. Tabla de Dosificación de Analgésicos y Antibióticos' },
      { valor: 'CASO_PRUEBA', label: 'Resultados de Laboratorio / Hemograma', placeholder: 'Ej. Panel Bioquímico y Radiografía de Control' },
      { valor: 'OTRO', label: 'Guía de Cuidados Post-Operatorios', placeholder: 'Ej. Indicaciones de Alimentación y Medicación Domiciliaria' },
    ],
    ecsEjemploCodigo: 'PROT-ANEST-01',
    ecsEjemploNombre: 'Protocolo Anestésico Balanceado para Pacientes Felinos',

    aprobadorCargo: 'Médico Veterinario Jefe / Especialista Cirujano',
    aprobadorRolLabel: 'Médico Veterinario Jefe',
    aprobacionSubtitulo: 'Dictamen médico formal antes de autorizar el procedimiento o prescripción en pacientes',

    lineaBaseLabel: 'Protocolo Clínico Base (Hito Aprobado)',
    lineaBaseSubtitulo: 'Conjunto formal inmutable de pautas médicas aprobadas para la atención del paciente',
    lineaBaseExplicacion: 'Congela el plan terapéutico oficial. Cualquier alteración de dosis o cambio de fármaco requiere una Orden de Modificación Terapéutica (RFC) para resguardar la salud del animal.',
    lineaBaseEjemploCodigo: 'LB-TERAPIA-01',
    lineaBaseEjemploNombre: 'Protocolo Base: Tratamiento Post-Quirúrgico de Fractura Femoral',

    cambioLabel: 'Orden de Modificación de Tratamiento (RFC)',
    cambioSubtitulo: 'Aprobación formal de cambios de medicación, dosis o procedimientos alternativos',
    cambioEjemploCodigo: 'RFC-MED-01',
    cambioEjemploDescripcion: 'Sustitución de antibiótico por cefalosporina de 3ra generación por reacción adversa.',
    cambioEjemploJustificacion: 'El paciente presentó intolerancia gástrica tras la primera administración.',
    cambioEjemploResolucion: 'Se autoriza el cambio inmediato de protocolo terapéutico con monitoreo de enzimas hepáticas.',

    bitacoraLabel: 'Cuaderno de Hospitalización & Triaje',
    bitacoraSubtitulo: 'Seguimiento diario de constantes vitales, medicación administrada y evolución del paciente',
    bitacoraUnidadAvanzada: 'Pacientes Atendidos / Curaciones Realizadas',
    bitacoraMaterialConsumido: 'Ampollas de Fármacos / Insumos Quirúrgicos Consumidos',

    trazabilidadLabel: 'Matriz de Trazabilidad Diagnóstico - Tratamiento - Evolución',
    trazabilidadSubtitulo: 'Trazabilidad bidireccional desde la consulta inicial hasta el alta médica del paciente',

    recomendaciones: {
      pendientesAprobacion: (n) => `Hay ${n} protocolo(s) clínico(s) esperando dictamen del Médico Veterinario Jefe.`,
      sinLineaBase: 'Los protocolos médicos están aprobados. El siguiente paso es congelar el Protocolo Clínico Base.',
      lineaBaseVigente: 'Protocolo Clínico Base vigente. El equipo asistencial debe monitorear y registrar constantes en la bitácora.',
      sinProyectos: 'Aún no tienes campañas o especialidades registradas. Registra tu primer servicio clínico.',
    },

    pasosGuia: [
      {
        paso: 1,
        badge: 'Anamnesis',
        titulo: 'Consulta Médica y Acuerdos',
        subtitulo: 'Minuta con el Tutor del Paciente',
        descripcion: 'Se documenta el motivo de consulta, historial clínico del paciente y acuerdos de tratamiento con el tutor.',
        ejemploReal: 'Consulta con el tutor de "Max" (Canino de 4 años) donde se acuerda realizar una profilaxis y chequeo general.',
        iconName: 'Users',
      },
      {
        paso: 2,
        badge: 'Ficha Clínica',
        titulo: 'Protocolos y Fichas Médicas (ECS)',
        subtitulo: 'Elementos de Configuración del Caso',
        descripcion: 'El equipo médico sube los protocolos de anestesia, consentimientos y fichas de dosificación en versión v1.0.0.',
        ejemploReal: 'Carga del protocolo "PROT-ANEST-01: Anestesia Inhalatoria" en versión v1.0.0.',
        iconName: 'Layers',
      },
      {
        paso: 3,
        badge: 'Visto Bueno',
        titulo: 'Dictamen del Veterinario Jefe',
        subtitulo: 'Aprobación Médica Responsable',
        descripcion: 'El Director Médico o Cirujano Jefe revisa los exámenes de sangre y emite el dictamen que autoriza el procedimiento.',
        ejemploReal: 'El Médico Veterinario evalúa el perfil renal y aprueba el protocolo v1.0.0 con luz verde para cirugía.',
        iconName: 'ShieldCheck',
      },
      {
        paso: 4,
        badge: 'Tratamiento Fijo',
        titulo: 'Protocolo Clínico Base',
        subtitulo: 'Hito Aprobado e Inmutable',
        descripcion: 'Se congela el plan terapéutico oficial del paciente. El equipo auxiliar no puede alterar dosis sin autorización.',
        ejemploReal: 'Se congela la "LB-CIRUGIA-MAX: Protocolo Quirúrgico y Terapéutico". Garantiza seguridad médica absoluta.',
        iconName: 'Lock',
      },
      {
        paso: 5,
        badge: 'Ajuste Terapéutico',
        titulo: 'Modificación de Tratamiento (RFC)',
        subtitulo: 'Gestión Médica de Imprevistos',
        descripcion: 'Si el paciente presenta una respuesta imprevista (ej. fiebre o alergia), se autoriza formalmente la modificación.',
        ejemploReal: 'El paciente presenta vómitos: el médico emite la RFC-01 para cambiar el antiinflamatorio y genera la versión v1.1.0 aprobada.',
        iconName: 'AlertTriangle',
      },
    ],
  },
};

export function getTerminologia(rubro?: string | null): RubroConfig {
  const normalizado = (rubro || '').toUpperCase().trim();
  if (normalizado === 'CONSTRUCCION') {
    return CATALOGO_TERMINOLOGIA.CONSTRUCCION;
  }
  if (normalizado === 'VETERINARIA') {
    return CATALOGO_TERMINOLOGIA.VETERINARIA;
  }
  return CATALOGO_TERMINOLOGIA.SOFTWARE;
}
