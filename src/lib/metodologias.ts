import { MetodologiaProyecto, FaseMetodologia } from '@prisma/client';
import { prisma } from './prisma';

export interface EtapaPlantilla {
  nombre: string;
  fase: FaseMetodologia;
  orden: number;
  porcentajeDuracion: number; // Porcentaje del tiempo total del proyecto
  descripcion: string;
}

export const PLANTILLAS_METODOLOGIA: Partial<Record<MetodologiaProyecto, EtapaPlantilla[]>> = {
  RUP: [
    {
      nombre: 'Fase de Inicio',
      fase: 'INICIO',
      orden: 1,
      porcentajeDuracion: 0.15,
      descripcion: 'Definición de la visión, alcance inicial, viabilidad y acuerdos base del proyecto.',
    },
    {
      nombre: 'Fase de Elaboración',
      fase: 'ELABORACION',
      orden: 2,
      porcentajeDuracion: 0.25,
      descripcion: 'Diseño estructural, planificación técnica, mitigación de riesgos y arquitectura base.',
    },
    {
      nombre: 'Fase de Construcción',
      fase: 'CONSTRUCCION',
      orden: 3,
      porcentajeDuracion: 0.45,
      descripcion: 'Ejecución progresiva de los entregables, integración y verificación de calidad.',
    },
    {
      nombre: 'Fase de Transición',
      fase: 'TRANSICION',
      orden: 4,
      porcentajeDuracion: 0.15,
      descripcion: 'Validación final, entrega formal al cliente y cierre de la línea base.',
    },
  ],
  SCRUM: [
    {
      nombre: 'Sprint 0: Planificación Inicial',
      fase: 'SPRINT',
      orden: 1,
      porcentajeDuracion: 0.20,
      descripcion: 'Levantamiento inicial, priorización de objetivos y definición de criterios de aceptación.',
    },
    {
      nombre: 'Sprint 1: Ejecución Principal',
      fase: 'SPRINT',
      orden: 2,
      porcentajeDuracion: 0.40,
      descripcion: 'Desarrollo de los entregables principales y revisión de avance.',
    },
    {
      nombre: 'Sprint 2: Integración y Cierre',
      fase: 'SPRINT',
      orden: 3,
      porcentajeDuracion: 0.40,
      descripcion: 'Validación integral, pruebas de aceptación y entrega final.',
    },
  ],
};

/**
 * Genera únicamente las fases limpias del proyecto según su metodología y rango de fechas,
 * sin crear entregables automáticos de relleno.
 */
export async function sembrarMetodologiaProyecto(params: {
  proyectoId: string;
  metodologia: MetodologiaProyecto;
  fechaInicio: Date;
  fechaFin?: Date | null;
  adminId?: string;
}) {
  const { proyectoId, metodologia, fechaInicio } = params;
  const plantilla = PLANTILLAS_METODOLOGIA[metodologia] ?? PLANTILLAS_METODOLOGIA.RUP ?? [];

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

    await prisma.etapaProyecto.create({
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
  }
}
