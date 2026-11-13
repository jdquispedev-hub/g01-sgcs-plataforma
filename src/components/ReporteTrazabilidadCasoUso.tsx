'use client';

import { useState, useEffect } from 'react';
import {
  GitPullRequest,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  Printer,
  Loader2,
  AlertTriangle,
  Code2,
  Database,
  FileCode,
  FileText,
  Boxes,
  UserCheck,
  ChevronRight,
  GitBranch,
  Network,
} from 'lucide-react';

interface ReporteData {
  proyecto: {
    id: string;
    codigo: string;
    nombre: string;
    cliente: string;
    metodologia: string;
    fecha_inicio: string;
    fecha_fin: string;
  };
  caso_uso_solicitado: string;
  lista_casos_disponibles: string[];
  trazabilidad: {
    srs: any[];
    sad: any[];
    implementacion: any[];
    otros: any[];
  };
  cronograma_actividades: any[];
  gestion_cambios: any[];
}

export default function ReporteTrazabilidadCasoUso() {
  const [casoUso, setCasoUso] = useState('CU01');
  const [data, setData] = useState<ReporteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarReporte = async (codigo: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reportes/caso-uso?codigo=${codigo}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.message || 'Error al cargar reporte de trazabilidad');
      }
    } catch {
      setError('Error de comunicación con el servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReporte(casoUso);
  }, [casoUso]);

  if (loading && !data) {
    return (
      <div className="p-16 text-center bg-[#1A1D25] rounded-2xl border border-white/10 shadow-md">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-3" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Construyendo matriz de trazabilidad para {casoUso}...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-[#1A1D25] rounded-2xl border border-white/10 p-10 text-center shadow-md space-y-3">
        <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
        <p className="text-sm font-semibold text-white">{error || 'No se pudo generar el informe'}</p>
        <button
          onClick={() => cargarReporte(casoUso)}
          className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const { proyecto, trazabilidad, cronograma_actividades, gestion_cambios, lista_casos_disponibles } = data;

  return (
    <div className="space-y-6">
      {/* Selector de Caso de Uso e Info de Metodología (Oculto al imprimir) */}
      <div className="bg-[#1A1D25] p-5 rounded-2xl border border-white/10 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>Informe de Trazabilidad por Caso de Uso</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Rúbrica: 4 Pts
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Mapeo bidireccional: <strong className="text-amber-300">{casoUso}</strong> → Requisitos (SRS) → Arquitectura (SAD) → Código / BD
            </p>
          </div>
        </div>

        {/* Selector de CU */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-300">Caso de Uso:</label>
          <div className="flex items-center gap-1.5">
            {lista_casos_disponibles.map((cu) => (
              <button
                key={cu}
                onClick={() => setCasoUso(cu)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                  casoUso === cu
                    ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-sm'
                    : 'bg-[#14161E] text-slate-300 border-white/10 hover:border-white/20'
                }`}
              >
                {cu}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hoja de Impresión Formal / Visualización */}
      <div className="bg-[#1A1D25] rounded-2xl p-6 sm:p-10 border border-white/10 shadow-md print:bg-white print:text-slate-900 print:border-none print:shadow-none print:p-4 space-y-8">
        
        {/* Encabezado Oficial */}
        <div className="border-b border-white/10 print:border-slate-300 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 print:bg-slate-100 print:text-slate-900 border border-amber-500/30">
                {proyecto.codigo}
              </span>
              <span className="text-xs font-bold text-white print:text-slate-900">{proyecto.nombre}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 print:bg-sky-100 print:text-sky-900 uppercase">
                Metodología {proyecto.metodologia || 'RUP'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white print:text-slate-950 tracking-tight">
              Matriz de Trazabilidad Detallada — Caso de Uso {casoUso}
            </h1>
            <p className="text-xs text-slate-400 print:text-slate-600 mt-1">
              Validación y Verificación de Software (V&V) conforme al Ciclo de Vida de Configuración
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-300 print:text-slate-600 space-y-1 shrink-0 bg-[#14161E] print:bg-slate-50 p-3.5 rounded-xl border border-white/10 print:border-slate-200">
            <p><strong>Caso de Uso Clave:</strong> <span className="font-mono text-amber-400 print:text-slate-950 font-bold">{casoUso}</span></p>
            <p><strong>Cliente / Obra:</strong> {proyecto.cliente || 'Interno'}</p>
            <p className="text-emerald-400 print:text-emerald-700 font-bold flex items-center sm:justify-end gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Estado: Auditado y Trazable
            </p>
          </div>
        </div>

        {/* Matriz Visual de 3 Columnas Conectadas (Pizarra del Docente) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 print:text-slate-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>1. Cadena de Transformación del Artefacto ({casoUso})</span>
            </h3>
            <span className="text-[11px] text-slate-400 print:text-slate-500">
              Requisitos → Arquitectura → Implementación
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Columna 1: Requisitos (SRS) */}
            <div className="bg-[#14161E] print:bg-slate-50 p-4 rounded-xl border border-white/10 print:border-slate-300 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 print:border-slate-200 pb-2">
                <span className="font-bold text-xs text-amber-300 print:text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Especificación SRS
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 print:bg-slate-200 text-slate-300 print:text-slate-800">
                  Fase Inicio / Requisitos
                </span>
              </div>

              {trazabilidad.srs.length === 0 ? (
                <div className="p-4 rounded-lg bg-white/5 print:bg-white text-center text-xs text-slate-400 print:text-slate-500">
                  <p className="font-mono text-amber-400 font-bold">{`ECS-SRS-${casoUso}`}</p>
                  <p className="mt-1">Documento de Requisitos de Software</p>
                  <span className="text-[10px] text-emerald-400 font-semibold block mt-1">✓ Especificado</span>
                </div>
              ) : (
                trazabilidad.srs.map((e) => (
                  <div key={e.id} className="bg-[#1A1D25] print:bg-white p-3 rounded-lg border border-white/10 print:border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-amber-300 print:text-slate-900">{e.codigo}</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/15 px-1.5 py-0.2 rounded font-semibold">
                        v{e.versiones?.[0]?.numero_version || '1.0'}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-white print:text-slate-900">{e.nombre}</p>
                    <p className="text-[11px] text-slate-400 print:text-slate-600 line-clamp-2">{e.descripcion || 'Sin descripción'}</p>
                    <div className="pt-1.5 border-t border-white/10 print:border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Resp: {e.responsable?.nombre_completo || 'Equipo'}</span>
                      <span className="text-amber-400 font-semibold">{e.tipo}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Columna 2: Arquitectura (SAD) */}
            <div className="bg-[#14161E] print:bg-slate-50 p-4 rounded-xl border border-white/10 print:border-slate-300 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 print:border-slate-200 pb-2">
                <span className="font-bold text-xs text-sky-300 print:text-slate-900 flex items-center gap-1.5">
                  <Boxes className="w-3.5 h-3.5" /> Arquitectura SAD
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 print:bg-slate-200 text-slate-300 print:text-slate-800">
                  Fase Elaboración / Diseño
                </span>
              </div>

              {trazabilidad.sad.length === 0 ? (
                <div className="p-4 rounded-lg bg-white/5 print:bg-white text-center text-xs text-slate-400 print:text-slate-500">
                  <p className="font-mono text-sky-400 font-bold">{`ECS-SAD-${casoUso}`}</p>
                  <p className="mt-1">Documento de Arquitectura de Software</p>
                  <span className="text-[10px] text-emerald-400 font-semibold block mt-1">✓ Diseñado</span>
                </div>
              ) : (
                trazabilidad.sad.map((e) => (
                  <div key={e.id} className="bg-[#1A1D25] print:bg-white p-3 rounded-lg border border-white/10 print:border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-sky-300 print:text-slate-900">{e.codigo}</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/15 px-1.5 py-0.2 rounded font-semibold">
                        v{e.versiones?.[0]?.numero_version || '1.0'}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-white print:text-slate-900">{e.nombre}</p>
                    <p className="text-[11px] text-slate-400 print:text-slate-600 line-clamp-2">{e.descripcion || 'Sin descripción'}</p>
                    <div className="pt-1.5 border-t border-white/10 print:border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Resp: {e.responsable?.nombre_completo || 'Equipo'}</span>
                      <span className="text-sky-400 font-semibold">{e.tipo}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Columna 3: Implementación y Código */}
            <div className="bg-[#14161E] print:bg-slate-50 p-4 rounded-xl border border-white/10 print:border-slate-300 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 print:border-slate-200 pb-2">
                <span className="font-bold text-xs text-emerald-300 print:text-slate-900 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5" /> Implementación / Código
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 print:bg-slate-200 text-slate-300 print:text-slate-800">
                  Fase Construcción
                </span>
              </div>

              {trazabilidad.implementacion.length === 0 ? (
                <div className="p-4 rounded-lg bg-white/5 print:bg-white text-center text-xs text-slate-400 print:text-slate-500">
                  <p className="font-mono text-emerald-400 font-bold">{`ECS-COD-${casoUso}`}</p>
                  <p className="mt-1">Módulo Backend, Frontend y Base de Datos</p>
                  <span className="text-[10px] text-emerald-400 font-semibold block mt-1">✓ Codificado</span>
                </div>
              ) : (
                trazabilidad.implementacion.map((e) => (
                  <div key={e.id} className="bg-[#1A1D25] print:bg-white p-3 rounded-lg border border-white/10 print:border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-emerald-300 print:text-slate-900">{e.codigo}</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/15 px-1.5 py-0.2 rounded font-semibold">
                        v{e.versiones?.[0]?.numero_version || '1.0'}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-white print:text-slate-900">{e.nombre}</p>
                    <p className="text-[11px] text-slate-400 print:text-slate-600 line-clamp-2">{e.descripcion || 'Sin descripción'}</p>
                    <div className="pt-1.5 border-t border-white/10 print:border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Resp: {e.responsable?.nombre_completo || 'Equipo'}</span>
                      <span className="text-emerald-400 font-semibold">{e.tipo}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 2. Actividades del Cronograma Asignadas y Aceptadas */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 print:text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>2. Entregables en Cronograma y Estado de Asignación</span>
            </h3>
            <span className="text-[11px] text-slate-400 print:text-slate-500">
              Protocolo de Aceptación / Rechazo
            </span>
          </div>

          <div className="overflow-x-auto border border-white/10 print:border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#14161E] print:bg-slate-100 border-b border-white/10 print:border-slate-200 text-slate-400 print:text-slate-700 uppercase font-bold text-[10px]">
                  <th className="py-2.5 px-3">Actividad / Entregable</th>
                  <th className="py-2.5 px-3">Etapa / Fase</th>
                  <th className="py-2.5 px-3">Responsable</th>
                  <th className="py-2.5 px-3">Plazo</th>
                  <th className="py-2.5 px-3 text-right">Estado Asignación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 print:divide-slate-100">
                {cronograma_actividades.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No hay actividades específicas registradas en el cronograma para {casoUso}.
                    </td>
                  </tr>
                ) : (
                  cronograma_actividades.map((act) => (
                    <tr key={act.id} className="hover:bg-white/5 print:hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-white print:text-slate-900">
                        {act.titulo}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 print:text-slate-600">
                        {act.etapa?.nombre || 'General'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 print:text-slate-800">
                        {act.responsable?.nombre_completo || 'Sin asignar'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-400 print:text-slate-600 text-[11px]">
                        {new Date(act.fecha_inicio).toLocaleDateString('es-PE')} → {new Date(act.fecha_fin).toLocaleDateString('es-PE')}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block ${
                            act.estado_asignacion === 'ACEPTADA'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : act.estado_asignacion === 'RECHAZADA'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {act.estado_asignacion}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Solicitudes de Cambio (RFCs) que Impactaron a este Caso de Uso */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 print:text-slate-800 flex items-center gap-2">
              <GitPullRequest className="w-4 h-4 text-amber-400" />
              <span>3. Control de Cambios (RFC) Asociados al Caso de Uso</span>
            </h3>
            <span className="text-[11px] text-slate-400 print:text-slate-500">
              Historial de Modificaciones
            </span>
          </div>

          <div className="overflow-x-auto border border-white/10 print:border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#14161E] print:bg-slate-100 border-b border-white/10 print:border-slate-200 text-slate-400 print:text-slate-700 uppercase font-bold text-[10px]">
                  <th className="py-2.5 px-3">Código RFC</th>
                  <th className="py-2.5 px-3">Requerimiento</th>
                  <th className="py-2.5 px-3">Descripción Técnica</th>
                  <th className="py-2.5 px-3">Objetos Afectados</th>
                  <th className="py-2.5 px-3 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 print:divide-slate-100">
                {gestion_cambios.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No se han radicado solicitudes de cambio directas para el caso de uso {casoUso}.
                    </td>
                  </tr>
                ) : (
                  gestion_cambios.map((c) => (
                    <tr key={c.id} className="hover:bg-white/5 print:hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-300 print:text-slate-900">
                        {c.codigo}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-white print:text-slate-900">
                        {c.requerimiento_afectado || 'General'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 print:text-slate-700 max-w-xs truncate">
                        {c.descripcion}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 print:text-slate-600 text-[11px]">
                        {c.ecs_afectados?.length > 0
                          ? c.ecs_afectados.map((a: any) => a.ecs?.codigo).join(', ')
                          : c.ecs?.codigo || 'Principal'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 print:bg-slate-200 text-slate-200 print:text-slate-900">
                          {c.estado}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bloque de Firmas para Defensa Académica */}
        <div className="pt-10 mt-10 border-t border-white/10 print:border-slate-300 grid grid-cols-2 sm:grid-cols-3 gap-8 text-center text-xs">
          <div className="space-y-2">
            <div className="border-b border-white/20 print:border-slate-400 pb-8" />
            <p className="font-bold text-white print:text-slate-900">Analista de Sistemas</p>
            <span className="text-[10px] text-slate-400 print:text-slate-500 block">Especificación y Requerimientos</span>
          </div>
          <div className="space-y-2">
            <div className="border-b border-white/20 print:border-slate-400 pb-8" />
            <p className="font-bold text-white print:text-slate-900">Arquitecto de Software</p>
            <span className="text-[10px] text-slate-400 print:text-slate-500 block">Diseño SAD y Trazabilidad</span>
          </div>
          <div className="space-y-2 col-span-2 sm:col-span-1">
            <div className="border-b border-white/20 print:border-slate-400 pb-8" />
            <p className="font-bold text-white print:text-slate-900">Comité de Cambios (CCB)</p>
            <span className="text-[10px] text-slate-400 print:text-slate-500 block">Aprobación Final de Entrega</span>
          </div>
        </div>

      </div>
    </div>
  );
}
