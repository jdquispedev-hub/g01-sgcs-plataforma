import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession, hashPassword } from '@/lib/auth';
import { RubroIndustria, TipoEcs, TipoReunion } from '@prisma/client';

// Esquema de validación para nueva organización cliente (RNF-05)
const crearOrganizacionSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(150),
  rubro: z.nativeEnum(RubroIndustria),
  adminNombre: z.string().min(3, 'El nombre del administrador es obligatorio').max(150),
  adminEmail: z.string().email('Debe ingresar un correo electrónico válido'),
  adminPassword: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

// Plantillas de terminología por industria (Arquitectura Multi-Rubro SGCS)
const PLANTILLAS_TERMINOLOGIA: Record<RubroIndustria, any> = {
  SOFTWARE: {
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
  VETERINARIA: {
    terminos: {
      proyecto: 'Caso Clínico / Paciente',
      ecs: 'Ficha / Examen Médico',
      version: 'Resultado / Dosis Actualizada',
      linea_base: 'Estado Pre-Operatorio Aprobado',
      solicitud_cambio: 'Modificación de Tratamiento',
      reporte_diario: 'Evolución Médica del Turno',
    },
    campos_reporte: [
      { clave: 'temperatura', etiqueta: 'Temperatura (°C)', tipo: 'numero' },
      { clave: 'dosis_suministrada', etiqueta: 'Dosis y Medicación', tipo: 'texto' },
    ],
  },
  CONSTRUCCION: {
    terminos: {
      proyecto: 'Obra / Proyecto',
      ecs: 'Plano / Partida de Obra',
      version: 'Revisión de Plano (Rev A, B)',
      linea_base: 'Línea Base Contractual',
      solicitud_cambio: 'Orden de Modificación de Obra',
      reporte_diario: 'Parte Diario de Faena',
    },
    campos_reporte: [
      { clave: 'm2_avanzados', etiqueta: 'Metros Cuadrados Avanzados', tipo: 'numero' },
      { clave: 'sacos_cemento', etiqueta: 'Sacos de Cemento Consumidos', tipo: 'numero' },
    ],
  },
  OTRO: {
    terminos: {
      proyecto: 'Proyecto',
      ecs: 'Elemento de Configuración',
      version: 'Versión del Entregable',
      linea_base: 'Línea Base Aprobada',
      solicitud_cambio: 'Solicitud de Cambio',
      reporte_diario: 'Reporte de Jornada',
    },
    campos_reporte: [
      { clave: 'avance_porcentaje', etiqueta: 'Avance Estimado (%)', tipo: 'numero' },
    ],
  },
};

// GET: Lista de organizaciones con métricas globales en tiempo real (RNF-02, Nivel 0)
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.rol !== 'SUPERADMIN') {
      return NextResponse.json(
        { success: false, message: 'Acceso no autorizado. Requiere rol SUPERADMIN.' },
        { status: 403 }
      );
    }

    const [organizaciones, totalUsuarios, totalProyectos] = await Promise.all([
      prisma.organizacion.findMany({
        orderBy: { created_at: 'asc' },
        include: {
          _count: {
            select: {
              usuarios: true,
              proyectos: true,
            },
          },
          usuarios: {
            where: { rol: 'ADMINISTRADOR' },
            select: {
              id: true,
              nombre_completo: true,
              email: true,
              activo: true,
            },
            take: 1,
          },
        },
      }),
      prisma.usuario.count({ where: { activo: true } }),
      prisma.proyectoCaso.count(),
    ]);

    // Cálculo de métricas
    const totalOrganizaciones = organizaciones.length;
    const organizacionesActivas = organizaciones.filter((o) => o.activo).length;

    return NextResponse.json({
      success: true,
      data: {
        organizaciones,
        metricas: {
          totalOrganizaciones,
          organizacionesActivas,
          totalUsuarios,
          totalProyectos,
        },
      },
    });
  } catch (error) {
    console.error('Error en GET /api/superadmin/organizaciones:', error);
    return NextResponse.json(
      { success: false, message: 'Error al consultar organizaciones' },
      { status: 500 }
    );
  }
}

// POST: Registrar nueva empresa cliente con terminología adaptada y admin inicial (RF-01, RF-02)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.rol !== 'SUPERADMIN') {
      return NextResponse.json(
        { success: false, message: 'Acceso no autorizado. Requiere rol SUPERADMIN.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = crearOrganizacionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Datos de organización inválidos',
          errors: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const { nombre, rubro, adminNombre, adminEmail, adminPassword } = validation.data;

    // Verificar unicidad global del correo del administrador
    const emailExistente = await prisma.usuario.findFirst({
      where: { email: adminEmail.trim().toLowerCase() },
    });

    if (emailExistente) {
      return NextResponse.json(
        { success: false, message: `El correo '${adminEmail}' ya está registrado en el sistema` },
        { status: 409 }
      );
    }

    // Hashear contraseña inicial con bcrypt salt 12 (RNF-01)
    const passwordHash = await hashPassword(adminPassword);
    const terminologiaConfig = PLANTILLAS_TERMINOLOGIA[rubro] || PLANTILLAS_TERMINOLOGIA.OTRO;

    // Transacción ACID: Crear Organización + Usuario Administrador + Auditoría Inmutable
    const resultado = await prisma.$transaction(async (tx) => {
      const nuevaOrg = await tx.organizacion.create({
        data: {
          nombre: nombre.trim(),
          rubro,
          configuracion_terminologia: terminologiaConfig,
          activo: true,
        },
      });

      const nuevoAdmin = await tx.usuario.create({
        data: {
          organizacion_id: nuevaOrg.id,
          nombre_completo: adminNombre.trim(),
          email: adminEmail.trim().toLowerCase(),
          password_hash: passwordHash,
          rol: 'ADMINISTRADOR',
          activo: true,
        },
      });

      // Generar automáticamente Proyecto Inicial y Entregables según el Rubro (Arquitectura Multi-Tenant)
      let starterData: {
        codigo: string;
        nombre: string;
        cliente: string;
        ecsCodigo: string;
        ecsNombre: string;
        ecsTipo: TipoEcs;
        ecsDesc: string;
        versionDesc: string;
        lbCodigo: string;
        lbNombre: string;
        reuTitulo: string;
        reuParticipantes: string;
        reuTemas: string;
        reuAcuerdos: string;
      } = {
        codigo: 'PRY-BASE-01',
        nombre: 'Proyecto General de Inicio',
        cliente: 'Cliente Principal',
        ecsCodigo: 'ECS-DOC-01',
        ecsNombre: 'Documento de Especificación Inicial',
        ecsTipo: TipoEcs.DOCUMENTO,
        ecsDesc: 'Requerimientos iniciales formalizados.',
        versionDesc: 'Versión inicial de requisitos.',
        lbCodigo: 'LB-BASE-01',
        lbNombre: 'Línea Base Inicial',
        reuTitulo: 'Reunión de Apertura y Coordinación de Alcance',
        reuParticipantes: `${adminNombre.trim()} (Gerente), Representante del Cliente`,
        reuTemas: 'Definición de objetivos, alcance inicial y entregables requeridos.',
        reuAcuerdos: 'Se formalizan los requerimientos para iniciar la ejecución técnica.',
      };

      if (rubro === RubroIndustria.CONSTRUCCION) {
        starterData = {
          codigo: 'OBRA-RESID-01',
          nombre: 'Construcción y Habilitación de Vivienda 3 Pisos',
          cliente: 'Inversiones Inmobiliarias del Centro',
          ecsCodigo: 'ECS-PLANO-ESTRUC',
          ecsNombre: 'Planos Estructurales de Cimientos y Columnas',
          ecsTipo: TipoEcs.DISENO,
          ecsDesc: 'Planos de zapatas aisladas, vigas peraltadas y losa aligerada sismorresistente.',
          versionDesc: 'Diseño estructural v1.0.0 revisado para suelo con capacidad portante 2.5 kg/cm2.',
          lbCodigo: 'LB-OBRA-01',
          lbNombre: 'Línea Base Oficial: Planos de Cimentación y Estructura',
          reuTitulo: 'Reunión de Inicio de Obra y Revisión Topográfica',
          reuParticipantes: `${adminNombre.trim()} (Residente de Obra), Don Manuel Quispe (Propietario)`,
          reuTemas: 'Revisión de linderos, estudio de suelos y especificaciones de zapatas.',
          reuAcuerdos: 'Congelar la Línea Base de planos de cimentación antes del vaciado de concreto.',
        };
      } else if (rubro === RubroIndustria.SOFTWARE) {
        starterData = {
          codigo: 'PRY-SIST-01',
          nombre: 'Sistema Web de Facturación y Gestión de Clientes',
          cliente: 'Corporación Logística Global',
          ecsCodigo: 'ECS-MOD-AUTH',
          ecsNombre: 'Módulo de Autenticación JWT y Roles de Acceso',
          ecsTipo: TipoEcs.CODIGO_FUENTE,
          ecsDesc: 'Endpoints seguros, control de roles en servidor y middleware con cookies HttpOnly.',
          versionDesc: 'Arquitectura base v1.0.0 con login, refresh token y auditoría.',
          lbCodigo: 'LB-SIST-01',
          lbNombre: 'Línea Base Oficial v1.0.0 de Arquitectura Base',
          reuTitulo: 'Briefing de Requerimientos y Seguridad del Sistema',
          reuParticipantes: `${adminNombre.trim()} (Líder de Proyecto), Ing. Roberto Gómez (Cliente)`,
          reuTemas: 'Estándares de seguridad de datos, flujos de autenticación y pasarelas.',
          reuAcuerdos: 'Pactar la Línea Base inicial tras revisión técnica de los endpoints.',
        };
      } else if (rubro === RubroIndustria.VETERINARIA) {
        starterData = {
          codigo: 'PRY-CLINICA-01',
          nombre: 'Sistema de Historias Clínicas y Control de Vacunación',
          cliente: 'Centro Médico Veterinario San Francisco',
          ecsCodigo: 'ECS-PROT-VAC',
          ecsNombre: 'Protocolo de Triaje y Vacunación Canina/Felina',
          ecsTipo: TipoEcs.DOCUMENTO,
          ecsDesc: 'Formatos estandarizados de anamnesis, consentimiento informado y calendario de vacunas.',
          versionDesc: 'Protocolo v1.0.0 aprobado por el equipo veterinario colegiado.',
          lbCodigo: 'LB-CLINICA-01',
          lbNombre: 'Línea Base Oficial: Protocolos Médicos Estandarizados',
          reuTitulo: 'Coordinación Médica: Flujo de Triaje y Vacunas',
          reuParticipantes: `${adminNombre.trim()} (Director Médico), Dra. Patricia Vega`,
          reuTemas: 'Estandarización de fichas médicas y cadena de frío para biológicos.',
          reuAcuerdos: 'Establecer como Línea Base obligatoria el formato único de triaje.',
        };
      }

      // Crear el proyecto inicial
      const starterProject = await tx.proyectoCaso.create({
        data: {
          organizacion_id: nuevaOrg.id,
          codigo: starterData.codigo,
          nombre: starterData.nombre,
          cliente_nombre: starterData.cliente,
          fecha_inicio: new Date(),
          estado: 'EN_EJECUCION',
        },
      });

      // Crear el ECS inicial
      const starterEcs = await tx.ecs.create({
        data: {
          proyecto_id: starterProject.id,
          codigo: starterData.ecsCodigo,
          nombre: starterData.ecsNombre,
          tipo: starterData.ecsTipo,
          descripcion: starterData.ecsDesc,
          ubicacion: `Repositorio://${nuevaOrg.nombre.toLowerCase().replace(/[^a-z0-9]/g, '-')}/${starterData.codigo}`,
          responsable_id: nuevoAdmin.id,
        },
      });

      // Versión 1.0.0 Aprobada
      const starterVersion = await tx.versionEcs.create({
        data: {
          ecs_id: starterEcs.id,
          numero_version: '1.0.0',
          descripcion: starterData.versionDesc,
          archivo_url: `https://drive.sgcs.com/${starterEcs.codigo}-v1.0.0`,
          estado: 'APROBADA',
          autor_id: nuevoAdmin.id,
          aprobador_id: nuevoAdmin.id,
          fecha_aprobacion: new Date(),
        },
      });

      // Línea Base Oficial
      const starterLb = await tx.lineaBase.create({
        data: {
          proyecto_id: starterProject.id,
          codigo: starterData.lbCodigo,
          nombre: starterData.lbNombre,
          descripcion: `Hito congelado inicial para la empresa ${nuevaOrg.nombre}.`,
          autor_id: nuevoAdmin.id,
          estado: 'VIGENTE',
        },
      });

      await tx.lineaBaseVersion.create({
        data: {
          linea_base_id: starterLb.id,
          version_ecs_id: starterVersion.id,
        },
      });

      // Reunión Inicial Oficial
      await tx.reunionProyecto.create({
        data: {
          proyecto_id: starterProject.id,
          convocante_id: nuevoAdmin.id,
          titulo: starterData.reuTitulo,
          tipo: TipoReunion.CLIENTE,
          fecha: new Date(),
          hora: '10:00',
          participantes: starterData.reuParticipantes,
          temas_tratados: starterData.reuTemas,
          acuerdos: starterData.reuAcuerdos,
          proximo_paso: 'Seguimiento de la ejecución del hito congelado.',
        },
      });

      // Registro de auditoría (RNF-10)
      await tx.auditoriaLog.create({
        data: {
          usuario_id: session.userId,
          accion: 'CREACION_ORGANIZACION',
          entidad: 'ORGANIZACION',
          entidad_id: nuevaOrg.id,
          datos_nuevos: {
            organizacion_id: nuevaOrg.id,
            nombre: nuevaOrg.nombre,
            rubro: nuevaOrg.rubro,
            admin_email: nuevoAdmin.email,
          },
        },
      });

      return {
        organizacion: nuevaOrg,
        admin: {
          id: nuevoAdmin.id,
          nombre_completo: nuevoAdmin.nombre_completo,
          email: nuevoAdmin.email,
          rol: nuevoAdmin.rol,
        },
      };
    });

    return NextResponse.json(
      {
        success: true,
        message: `Organización '${nombre}' y su cuenta administradora creadas exitosamente`,
        data: resultado,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error en POST /api/superadmin/organizaciones:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error interno al registrar la organización' },
      { status: 500 }
    );
  }
}
