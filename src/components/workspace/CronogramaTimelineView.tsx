'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  XCircle,
  Tag,
  Plus,
} from 'lucide-react';
import { useSgcsTheme } from '@/components/ThemeProvider';
import { WorkspaceEcsItem, WorkspaceEtapa, WorkspaceActividad } from '@/components/workspace/EntregablesDataGrid';
import ModalNuevaActividad from '@/components/workspace/ModalNuevaActividad';

interface CronogramaTimelineViewProps {
  proyectoId: string;
  metodologia: string;
  etapas: WorkspaceEtapa[];
  actividadesCronograma?: WorkspaceActividad[];
  elementosConfig: WorkspaceEcsItem[];
  isAdmin: boolean;
  onRefresh: () => void;
}

export default function CronogramaTimelineView({
  proyectoId,
  metodologia,
  etapas,
  actividadesCronograma = [],
  elementosConfig,
  isAdmin,
  onRefresh,
}: CronogramaTimelineViewProps) {
  const { theme } = useSgcsTheme();
  const isLight = theme === 'light';
  const [selectedEtapaId, setSelectedEtapaId] = React.useState<string>('FIRST');
  const [showAll, setShowAll] = React.useState(false);
  const [modalNuevaOpen, setModalNuevaOpen] = React.useState(false);

  const allEtapas = useMemo(() => {
    if (etapas.length > 0) return etapas;
    if (actividadesCronograma.length > 0) {
      return [
        {
          id: 'general-cronograma',
          nombre: 'Actividades del Proyecto',
          fase: metodologia,
          orden: 1,
          actividades: actividadesCronograma,
        },
      ];
    }
    return [];
  }, [etapas, actividadesCronograma, metodologia]);

  const activeEtapaIndex = useMemo(() => {
    if (allEtapas.length === 0) return -1;
    if (selectedEtapaId === 'FIRST') return 0;
    const idx = allEtapas.findIndex((e) => e.id === selectedEtapaId);
    return idx >= 0 ? idx : 0;
  }, [allEtapas, selectedEtapaId]);

  const visibleEtapas = useMemo(() => {
    if (showAll) return allEtapas;
    if (activeEtapaIndex < 0) return [];
    return [allEtapas[activeEtapaIndex]];
  }, [allEtapas, showAll, activeEtapaIndex]);

  // Calcular rango global de fechas para dibujar barras proporcionales tipo Gantt
  const { minTime, totalSpan } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;

    etapas.forEach((e) => {
      (e.actividades || []).forEach((a) => {
        const s = new Date(a.fecha_inicio).getTime();
        const f = new Date(a.fecha_fin).getTime();
        if (!Number.isNaN(s) && s < min) min = s;
        if (!Number.isNaN(f) && f > max) max = f;
      });
    });

    if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
      return { minTime: Date.now(), totalSpan: 1000 * 60 * 60 * 24 * 30 };
    }

    return { minTime: min, totalSpan: max - min };
  }, [etapas]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <CalendarDays className="w-4 h-4 text-sky-500" />
          <span>
            Línea de tiempo por fases de <strong className={isLight ? 'text-slate-800' : 'text-white'}>{metodologia}</strong>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <button
              type="button"
              onClick={() => setModalNuevaOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                isLight
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-amber-400 text-slate-950 hover:bg-amber-300'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Tarea / Asignación</span>
            </button>
          )}
          {etapas.length > 1 && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              {showAll ? 'Una fase a la vez' : 'Ver todas'}
            </button>
          )}
          <Link
            href="/cronograma"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              isLight
                ? 'bg-white border-slate-200 text-blue-600 hover:bg-blue-50'
                : 'bg-white/5 border-white/10 text-amber-300 hover:bg-white/10'
            }`}
          >
            <span>Vista Completa</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {etapas.length > 1 && !showAll && (
        <div
          className={`rounded-xl border p-2 flex flex-wrap items-center justify-between gap-2 ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#181B22] border-white/10'
          }`}
        >
          <div className="flex items-center gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden">
            {etapas.map((et, idx) => {
              const active = idx === activeEtapaIndex;
              return (
                <button
                  key={et.id}
                  type="button"
                  onClick={() => setSelectedEtapaId(et.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    active
                      ? isLight
                        ? 'bg-blue-600 text-white'
                        : 'bg-amber-400 text-slate-950'
                      : isLight
                      ? 'text-slate-600 hover:bg-slate-100'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  {idx + 1}. {et.nombre}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              disabled={activeEtapaIndex <= 0}
              onClick={() => setSelectedEtapaId(etapas[activeEtapaIndex - 1].id)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-white/10 disabled:opacity-35"
            >
              ← Anterior
            </button>
            <button
              type="button"
              disabled={activeEtapaIndex >= etapas.length - 1}
              onClick={() => setSelectedEtapaId(etapas[activeEtapaIndex + 1].id)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-white/10 disabled:opacity-35"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}

      {etapas.length === 0 ? (
        <div
          className={`rounded-xl border p-8 text-center text-xs ${
            isLight ? 'bg-white border-slate-200 text-slate-500' : 'bg-[#181B22] border-white/10 text-slate-400'
          }`}
        >
          No hay etapas de cronograma registradas para este proyecto.
        </div>
      ) : (
        <div className="space-y-3">
          {visibleEtapas.map((etapa) => (
            <div
              key={etapa.id}
              className={`rounded-xl border overflow-hidden ${
                isLight ? 'bg-white border-slate-200' : 'bg-[#181B22] border-white/10'
              }`}
            >
              <div
                className={`px-4 py-2 border-b flex items-center justify-between ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.03] border-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>
                    {etapa.nombre}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-500 border border-sky-500/25">
                    {etapa.fase}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  {(etapa.actividades || []).length} actividad(es)
                </span>
              </div>

              <div className="divide-y divide-white/5">
                {(etapa.actividades || []).length === 0 ? (
                  <p className="px-4 py-3 text-xs text-slate-400">Sin actividades en esta etapa.</p>
                ) : (
                  (etapa.actividades || []).map((act) => {
                    const start = new Date(act.fecha_inicio).getTime();
                    const end = new Date(act.fecha_fin).getTime();
                    const leftPct = Math.max(0, Math.min(90, ((start - minTime) / totalSpan) * 100));
                    const widthPct = Math.max(8, Math.min(100 - leftPct, ((end - start) / totalSpan) * 100));

                    const inicioTxt = new Date(act.fecha_inicio).toLocaleDateString('es-PE', {
                      day: '2-digit',
                      month: 'short',
                    });
                    const finTxt = new Date(act.fecha_fin).toLocaleDateString('es-PE', {
                      day: '2-digit',
                      month: 'short',
                    });

                    const isAceptada =
                      act.estado_asignacion === 'ACEPTADA' ||
                      act.estado_asignacion === 'EN_PROGRESO' ||
                      act.estado_asignacion === 'COMPLETADA';
                    const isRechazada = act.estado_asignacion === 'RECHAZADA';

                    return (
                      <div
                        key={act.id}
                        className={`px-4 py-2.5 grid grid-cols-1 md:grid-cols-12 gap-3 items-center ${
                          isLight ? 'border-slate-100' : 'border-white/5'
                        }`}
                      >
                        <div className="md:col-span-5 flex items-center gap-2 min-w-0">
                          {isAceptada ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ) : isRechazada ? (
                            <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          )}
                          <span className={`text-xs font-medium truncate ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
                            {act.titulo}
                          </span>
                          {act.codigo_caso_uso && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-500/15 text-sky-500 shrink-0">
                              <Tag className="w-2.5 h-2.5" />
                              {act.codigo_caso_uso}
                            </span>
                          )}
                        </div>

                        <div className="md:col-span-2 text-[11px] text-slate-400 truncate">
                          {act.responsable?.nombre_completo || 'Sin asignar'}
                        </div>

                        <div className="md:col-span-5 flex items-center gap-3">
                          <div
                            className={`flex-1 h-2.5 rounded-full relative overflow-hidden ${
                              isLight ? 'bg-slate-100' : 'bg-white/5'
                            }`}
                          >
                            <div
                              className={`absolute top-0 bottom-0 rounded-full ${
                                isAceptada
                                  ? 'bg-emerald-500'
                                  : isRechazada
                                  ? 'bg-rose-500'
                                  : 'bg-amber-500'
                              }`}
                              style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap shrink-0">
                            {inicioTxt} – {finTxt}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ModalNuevaActividad
        isOpen={modalNuevaOpen}
        onClose={() => setModalNuevaOpen(false)}
        proyectoId={proyectoId}
        etapas={etapas}
        elementosConfig={elementosConfig}
        defaultEtapaId={activeEtapaIndex >= 0 ? etapas[activeEtapaIndex].id : undefined}
        onCreated={onRefresh}
      />
    </div>
  );
}
