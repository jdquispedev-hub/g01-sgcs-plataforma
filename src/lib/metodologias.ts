import { MetodologiaProyecto, FaseMetodologia, TipoEcs, EstadoAsignacion } from '@prisma/client';
import { prisma } from './prisma';

export interface EntregablePlantilla {
  codigo: string;
  nombre: string;
  tipo: TipoEcs;
  codigo_caso_uso?: string;
  descripcion: string;
  ubicacion: string;
}

export interface EtapaPlantilla {
  nombre: string;
  fase: FaseMetodologia;
  orden: number;
  porcentajeDuracion: number; // Porcentaje del tiempo total del proyecto
  descripcion: string;
  entregables: EntregablePlantilla[];
}

export const PLANTILLAS_METODOLOGIA: Record<MetodologiaProyecto, EtapaPlantilla[]> = {
  RUP: [
    {
      nombre: 'Fase de Inicio (Inception)',
      fase: 'INICIO',
      orden: 1,
      porcentajeDuracion: 0.15,
      descripcion: 'Definición de la visión, alcance, viabilidad técnica y especificación de requisitos iniciales.',
      entregables: [
        {
          codigo: 'ECS-SRS',
          nombre: 'Especificación de Requisitos de Software (SRS)',
          tipo: 'DOCUMENTO',
          codigo_caso_uso: 'CU01',
          descripcion: 'Documento formal SRS con especificación de requisitos funcionales y no funcionales.',
          ubicacion: 'docs/srs/SRS-Sistema-v1.0.pdf',
        },
        {
          codigo: 'ECS-VISION',
          nombre: 'Documento de Visión y Alcance del Proyecto',
          tipo: 'DOCUMENTO',
          codigo_caso_uso: 'CU01',
          descripcion: 'Definición de objetivos de negocio, actores y alcance del sistema.',
          ubicacion: 'docs/vision/Vision-Alcance.pdf',
        },
      ],
    },
    {
      nombre: 'Fase de Elaboración (Elaboration)',
      fase: 'ELABORACION',
      orden: 2,
      porcentajeDuracion: 0.25,
      descripcion: 'Diseño de la arquitectura base, mitigación de riesgos y modelo de casos de uso detallado.',
      entregables: [
        {
          codigo: 'ECS-SAD',
          nombre: 'Documento de Arquitectura de Software (SAD)',
          tipo: 'DOCUMENTO',
          codigo_caso_uso: 'CU01',
          descripcion: 'Vistas arquitecturales 4+1, patrones de diseño y decisiones de infraestructura.',
          ubicacion: 'docs/sad/SAD-Arquitectura-v1.0.pdf',
        },
        {
          codigo: 'ECS-DER',
          nombre: 'Diseño de Base de Datos y Modelo Relacional',
          tipo: 'BASE_DATOS',
          codigo_caso_uso: 'CU01',
          descripcion: 'Esquema relacional de base de datos, diccionario de datos y diagramas entidad-relación.',
          ubicacion: 'database/schema.sql',
        },
      ],
    },
    {
      nombre: 'Fase de Construcción (Construction)',
      fase: 'CONSTRUCCION',
      orden: 3,
      porcentajeDuracion: 0.45,
      descripcion: 'Desarrollo progresivo del código fuente, integración de componentes y pruebas de módulos.',
      entregables: [
        {
          codigo: 'ECS-COD-BACKEND',
          nombre: 'Código Fuente Backend (APIs y Lógica de Negocio)',
          tipo: 'CODIGO_FUENTE',
          codigo_caso_uso: 'CU01',
          descripcion: 'Implementación de controladores, servicios y endpoints de la plataforma.',
          ubicacion: 'src/backend/',
        },
        {
          codigo: 'ECS-COD-FRONTEND',
          nombre: 'Código Fuente Frontend (Interfaz de Usuario)',
          tipo: 'CODIGO_FUENTE',
          codigo_caso_uso: 'CU01',
          descripcion: 'Vistas web, componentes reactivos y experiencia de usuario.',
          ubicacion: 'src/frontend/',
        },
        {
          codigo: 'ECS-CASOS-PRUEBA',
          nombre: 'Matriz de Pruebas Unitarias y de Integración',
          tipo: 'CASO_PRUEBA',
          codigo_caso_uso: 'CU01',
          descripcion: 'Plan y casos de prueba para validación de requisitos y calidad de software.',
          ubicacion: 'tests/matriz-pruebas.xlsx',
        },
      ],
    },
    {
      nombre: 'Fase de Transición (Transition)',
      fase: 'TRANSICION',
      orden: 4,
      porcentajeDuracion: 0.15,
      descripcion: 'Despliegue a producción, capacitación de usuarios y entrega de la línea base final.',
      entregables: [
        {
          codigo: 'ECS-MANUAL-USUARIO',
          nombre: 'Manual de Usuario y Operación',
          tipo: 'DOCUMENTO',
          codigo_caso_uso: 'CU01',
          descripcion: 'Guía práctica para los usuarios finales y administradores del sistema.',
          ubicacion: 'docs/manuales/Manual-Usuario.pdf',
        },
      ],
    },
  ],
  SCRUM: [
    {
      nombre: 'Sprint 0: Product Backlog & Arquitectura',
      fase: 'SPRINT',
      orden: 1,
      porcentajeDuracion: 0.20,
      descripcion: 'Definición de Historias de Usuario, definición de Hecho (DoD) y arquitectura base.',
      entregables: [
        {
          codigo: 'ECS-BACKLOG',
          nombre: 'Product Backlog & Historias de Usuario (SRS Ágil)',
          tipo: 'DOCUMENTO',
          codigo_caso_uso: 'CU01',
          descripcion: 'Pila de producto con historias priorizadas y criterios de aceptación.',
          ubicacion: 'docs/backlog/Product-Backlog.xlsx',
        },
        {
          codigo: 'ECS-ARQUITECTURA-BASE',
          nombre: 'Arquitectura Base y Spike Técnico (SAD Ágil)',
          tipo: 'DISENO',
          codigo_caso_uso: 'CU01',
          descripcion: 'Prototipo arquitectural y configuración de entornos de integración continua.',
          ubicacion: 'docs/architecture/Spike-Architecture.md',
        },
      ],
    },
    {
      nombre: 'Sprint 1: Módulos Core e Implementación',
      fase: 'SPRINT',
      orden: 2,
      porcentajeDuracion: 0.40,
      descripcion: 'Desarrollo de las historias de usuario del Sprint 1 y primeras APIs funcionales.',
      entregables: [
        {
          codigo: 'ECS-SPRINT1-CODIGO',
          nombre: 'Código Fuente Incremento Sprint 1',
          tipo: 'CODIGO_FUENTE',
          codigo_caso_uso: 'CU01',
          descripcion: 'Incremento de software funcional desplegado en ambiente de pruebas.',
          ubicacion: 'src/modules/core/',
        },
      ],
    },
    {
      nombre: 'Sprint 2: Integración y Pruebas',
      fase: 'SPRINT',
      orden: 3,
      porcentajeDuracion: 0.40,
      descripcion: 'Finalización de módulos complementarios, pruebas de aceptación y entrega.',
      entregables: [
        {
          codigo: 'ECS-SPRINT2-RELEASE',
          nombre: 'Release Final de Producción',
          tipo: 'CODIGO_FUENTE',
          codigo_caso_uso: 'CU01',
          descripcion: 'Versión candidata lista para producción con pruebas automatizadas.',
          ubicacion: 'dist/release-v1.0/',
        },
      ],
    },
  ],
  CASCADA: [
    {
      nombre: 'Etapa 1: Análisis de Requisitos',
      fase: 'ANALISIS',
      orden: 1,
      porcentajeDuracion: 0.20,
      descripcion: 'Levantamiento y especificación formal de todos los requisitos del sistema.',
      entregables: [
        {
          codigo: 'ECS-SRS-CASCADA',
          nombre: 'Especificación de Requisitos de Software',
          tipo: 'DOCUMENTO',
          codigo_caso_uso: 'CU01',
          descripcion: 'Documento completo de requisitos bajo estándar IEEE 830.',
          ubicacion: 'docs/srs.pdf',
        },
      ],
    },
    {
      nombre: 'Etapa 2: Diseño de Software',
      fase: 'DISENO',
      orden: 2,
      porcentajeDuracion: 0.20,
      descripcion: 'Diseño estructural, arquitectónico y relacional del sistema.',
      entregables: [
        {
          codigo: 'ECS-SAD-CASCADA',
          nombre: 'Documento de Diseño y Arquitectura',
          tipo: 'DOCUMENTO',
          codigo_caso_uso: 'CU01',
          descripcion: 'Diagramas de clases, secuencias y arquitectura.',
          ubicacion: 'docs/sad.pdf',
        },
      ],
    },
    {
      nombre: 'Etapa 3: Implementación y Codificación',
      fase: 'CONSTRUCCION',
      orden: 3,
      porcentajeDuracion: 0.35,
      descripcion: 'Desarrollo de todo el código de acuerdo al diseño establecido.',
      entregables: [
        {
          codigo: 'ECS-COD-CASCADA',
          nombre: 'Código Fuente del Sistema',
          tipo: 'CODIGO_FUENTE',
          codigo_caso_uso: 'CU01',
          descripcion: 'Base de código completa del sistema.',
          ubicacion: 'src/',
        },
      ],
    },
    {
      nombre: 'Etapa 4: Pruebas y Despliegue',
      fase: 'PRUEBAS',
      orden: 4,
      porcentajeDuracion: 0.25,
      descripcion: 'Validación integral, pruebas de caja negra/blanca y pase a producción.',
      entregables: [
        {
          codigo: 'ECS-QA-CASCADA',
          nombre: 'Informe de Aseguramiento de Calidad',
          tipo: 'CASO_PRUEBA',
          codigo_caso_uso: 'CU01',
          descripcion: 'Matriz de ejecución de pruebas y acta de entrega.',
          ubicacion: 'docs/pruebas.pdf',
        },
      ],
    },
  ],
};

/**
 * Genera automáticamente las etapas, ECS estándar y actividades del cronograma
 * para un proyecto según su metodología y rango de fechas.
 */
export async function sembrarMetodologiaProyecto(params: {
  proyectoId: string;
  metodologia: MetodologiaProyecto;
  fechaInicio: Date;
  fechaFin?: Date | null;
  adminId: string;
}) {
  const { proyectoId, metodologia, fechaInicio, adminId } = params;
  const plantilla = PLANTILLAS_METODOLOGIA[metodologia] || PLANTILLAS_METODOLOGIA.RUP;

  const fInicio = new Date(fechaInicio);
  // Si no se proporcionó fecha fin, proyectar a 90 días por defecto
  const fFin = params.fechaFin
    ? new Date(params.fechaFin)
    : new Date(fInicio.getTime() + 90 * 24 * 60 * 60 * 1000);

  const duracionTotalMs = Math.max(fFin.getTime() - fInicio.getTime(), 10 * 24 * 60 * 60 * 1000);

  let acumuladoMs = 0;

  for (const etapaDef of plantilla) {
    const duracionEtapaMs = duracionTotalMs * etapaDef.porcentajeDuracion;
    const etapaInicio = new Date(fInicio.getTime() + acumuladoMs);
    const etapaFin = new Date(etapaInicio.getTime() + duracionEtapaMs);
    acumuladoMs += duracionEtapaMs;

    // 1. Crear la etapa del proyecto
    const etapa = await prisma.etapaProyecto.create({
      data: {
        proyecto_id: proyectoId,
        nombre: etapaDef.nombre,
        fase: etapaDef.fase,
        orden: etapaDef.orden,
        fecha_inicio: etapaInicio,
        fecha_fin: etapaFin,
        descripcion: etapaDef.descripcion,
      },
    });

    // 2. Crear los ECS estándar asociados a esta etapa
    for (const ent of etapaDef.entregables) {
      const ecs = await prisma.ecs.create({
        data: {
          proyecto_id: proyectoId,
          codigo: `${ent.codigo}-${params.proyectoId.slice(0, 4).toUpperCase()}`,
          nombre: ent.nombre,
          tipo: ent.tipo,
          codigo_caso_uso: ent.codigo_caso_uso || 'CU01',
          etapa_sugerida: etapaDef.fase,
          descripcion: ent.descripcion,
          ubicacion: ent.ubicacion,
          responsable_id: adminId,
          versiones: {
            create: {
              numero_version: '1.0',
              descripcion: `Versión base generada automáticamente por plantilla ${metodologia}.`,
              estado: 'APROBADA',
              autor_id: adminId,
              aprobador_id: adminId,
              fecha_aprobacion: new Date(),
            },
          },
        },
      });

      // 3. Crear la Actividad en el Cronograma con estado PENDIENTE_ACEPTACION
      await prisma.actividadCronograma.create({
        data: {
          proyecto_id: proyectoId,
          etapa_id: etapa.id,
          ecs_id: ecs.id,
          titulo: `Elaboración de Entregable: ${ent.nombre}`,
          descripcion: `Actividad asignada dentro de la ${etapaDef.nombre}. Requiere aceptación formal del usuario responsable.`,
          codigo_caso_uso: ent.codigo_caso_uso || 'CU01',
          fecha_inicio: etapaInicio,
          fecha_fin: etapaFin,
          estado_asignacion: EstadoAsignacion.PENDIENTE_ACEPTACION,
          responsable_id: adminId,
        },
      });
    }
  }
}
