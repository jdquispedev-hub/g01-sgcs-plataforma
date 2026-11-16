'use client';

import React, { useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Search,
  Layers,
  Tag,
  ExternalLink,
  FolderGit2,
} from 'lucide-react';
import { useSgcsTheme } from '@/components/ThemeProvider';
import { SlideOverItem } from '@/components/NotionSlideOver';

export interface WorkspaceEcsItem {
  id: string;
  codigo: string;
  nombre: string;
  tipo: string;
  descripcion: string | null;
  ubicacion: string;
  codigo_caso_uso?: string | null;
  etapa_sugerida?: string | null;
  responsable?: { id: string; nombre_completo: string; email?: string; cargo?: string | null } | null;
  versiones?: { id: string; numero_version: string; estado: string; created_at: string }[];
}

export interface WorkspaceActividad {
  id: string;
  titulo: string;
  codigo_caso_uso?: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  estado_asignacion: string;
  responsable?: { id: string; nombre_completo: string; email?: string; cargo?: string | null } | null;
  ecs?: WorkspaceEcsItem | null;
}

export interface WorkspaceEtapa {
  id: string;
  nombre: string;
  fase: string;
  orden: number;
  actividades?: WorkspaceActividad[];
}

interface GridRow {
  id: string;
  codigo: string;
  nombre: string;
  tipo: string;
  codigo_caso_uso: string | null;
  responsableNombre: string;
  responsableInitials: string;
  estadoLabel: string;
  estadoTone: 'emerald' | 'amber' | 'rose' | 'slate';
  versionLabel: string;
  plazoLabel: string;
  rawEcs: SlideOverItem | null;
}

interface EntregablesDataGridProps {
  metodologia: string;
  etapas: WorkspaceEtapa[];
  elementosConfig: WorkspaceEcsItem[];
  onSelectItem: (item: SlideOverItem) => void;
}

function getInitials(name?: string | null) {
  if (!name) return 'SG';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

function getEstadoFromEcs(
  ecs?: WorkspaceEcsItem | null,
  estadoAsignacion?: string
): {
  label: string;
  tone: 'emerald' | 'amber' | 'rose' | 'slate';
  version: string;
} {
  const latest = ecs?.versiones?.[0];
  if (latest) {
    if (latest.estado === 'APROBADA') {
      return { label: 'Aprobada', tone: 'emerald', version: `v${latest.numero_version}` };
    }
    if (latest.estado === 'RECHAZADA') {
      return { label: 'Rechazada', tone: 'rose', version: `v${latest.numero_version}` };
    }
    return { label: 'En Dictamen', tone: 'amber', version: `v${latest.numero_version}` };
  }

  if (estadoAsignacion === 'ACEPTADA' || estadoAsignacion === 'EN_PROGRESO') {
    return { label: 'Asumida', tone: 'emerald', version: 'Sin versión' };
  }
  if (estadoAsignacion === 'COMPLETADA') {
    return { label: 'Completada', tone: 'emerald', version: 'Cerrada' };
  }
  if (estadoAsignacion === 'RECHAZADA') {
    return { label: 'Rechazada', tone: 'rose', version: 'Devuelta' };
  }
  if (estadoAsignacion === 'PENDIENTE_ACEPTACION') {
    return { label: 'Por Aceptar', tone: 'amber', version: 'Pendiente' };
  }

  return { label: 'Registrado', tone: 'slate', version: 'v0.0' };
}

function toSlideOverItem(ecs: WorkspaceEcsItem): SlideOverItem {
  return {
    id: ecs.id,
    codigo: ecs.codigo,
    nombre: ecs.nombre,
    tipo: ecs.tipo,
    descripcion: ecs.descripcion,
    ubicacion: ecs.ubicacion,
    responsable: ecs.responsable
      ? {
          id: ecs.responsable.id,
          nombre_completo: ecs.responsable.nombre_completo,
          email: ecs.responsable.email || '',
        }
      : undefined,
    versiones: ecs.versiones,
  };
}

export default function EntregablesDataGrid({
  metodologia,
  etapas,
  elementosConfig,
  onSelectItem,
}: EntregablesDataGridProps) {
  const { theme } = useSgcsTheme();
  const isLight = theme === 'light';
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedSectionKey, setSelectedSectionKey] = useState<string>('FIRST');
  const [showAllSections, setShowAllSections] = useState(false);

  // Construir grupos por etapa real de la metodología (RUP / SCRUM / CASCADA)
  const groupedSections = useMemo(() => {
    const usedEcsIds = new Set<string>();
    const sections: { key: string; title: string; fase: string; rows: GridRow[] }[] = [];
    const ecsById = new Map(elementosConfig.map((e) => [e.id, e]));

    (etapas || []).forEach((etapa) => {
      (etapa.actividades || []).forEach((act) => {
        if (act.ecs?.id) usedEcsIds.add(act.ecs.id);
      });
    });

    (etapas || []).forEach((etapa) => {
      const rows: GridRow[] = [];
      (etapa.actividades || []).forEach((act) => {
        const linkedEcs = act.ecs ? ecsById.get(act.ecs.id) || act.ecs : null;
        const estadoInfo = getEstadoFromEcs(linkedEcs, act.estado_asignacion);
        const respName =
          act.responsable?.nombre_completo || linkedEcs?.responsable?.nombre_completo || 'Sin asignar';
        const inicio = act.fecha_inicio
          ? new Date(act.fecha_inicio).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
          : '';
        const fin = act.fecha_fin
          ? new Date(act.fecha_fin).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
          : '';

        rows.push({
          id: linkedEcs?.id || act.id,
          codigo: linkedEcs?.codigo || `ACT-${act.id.slice(0, 4).toUpperCase()}`,
          nombre: linkedEcs?.nombre || act.titulo,
          tipo: linkedEcs?.tipo || 'ACTIVIDAD',
          codigo_caso_uso: act.codigo_caso_uso || linkedEcs?.codigo_caso_uso || null,
          responsableNombre: respName,
          responsableInitials: getInitials(respName),
          estadoLabel: estadoInfo.label,
          estadoTone: estadoInfo.tone,
          versionLabel: estadoInfo.version,
          plazoLabel: inicio && fin ? `${inicio} - ${fin}` : 'Por definir',
          rawEcs: linkedEcs ? toSlideOverItem(linkedEcs) : null,
        });
      });

      elementosConfig.forEach((ecs) => {
        if (!usedEcsIds.has(ecs.id) && ecs.etapa_sugerida === etapa.fase) {
          usedEcsIds.add(ecs.id);
          const estadoInfo = getEstadoFromEcs(ecs);
          const respName = ecs.responsable?.nombre_completo || 'Sin asignar';
          rows.push({
            id: ecs.id,
            codigo: ecs.codigo,
            nombre: ecs.nombre,
            tipo: ecs.tipo,
            codigo_caso_uso: ecs.codigo_caso_uso || null,
            responsableNombre: respName,
            responsableInitials: getInitials(respName),
            estadoLabel: estadoInfo.label,
            estadoTone: estadoInfo.tone,
            versionLabel: estadoInfo.version,
            plazoLabel: 'Catálogo ECS',
            rawEcs: toSlideOverItem(ecs),
          });
        }
      });

      sections.push({
        key: etapa.id,
        title: etapa.nombre,
        fase: etapa.fase,
        rows,
      });
    });

    const remainingEcs = elementosConfig.filter((e) => !usedEcsIds.has(e.id));
    if (remainingEcs.length > 0) {
      sections.push({
        key: 'otros-ecs',
        title: 'Entregables Adicionales del Proyecto',
        fase: 'GENERAL',
        rows: remainingEcs.map((ecs) => {
          const estadoInfo = getEstadoFromEcs(ecs);
          const respName = ecs.responsable?.nombre_completo || 'Sin asignar';
          return {
            id: ecs.id,
            codigo: ecs.codigo,
            nombre: ecs.nombre,
            tipo: ecs.tipo,
            codigo_caso_uso: ecs.codigo_caso_uso || null,
            responsableNombre: respName,
            responsableInitials: getInitials(respName),
            estadoLabel: estadoInfo.label,
            estadoTone: estadoInfo.tone,
            versionLabel: estadoInfo.version,
            plazoLabel: 'Catálogo ECS',
            rawEcs: toSlideOverItem(ecs),
          };
        }),
      });
    }

    return sections;
  }, [etapas, elementosConfig]);

  const activeIndex = useMemo(() => {
    if (groupedSections.length === 0) return -1;
    if (selectedSectionKey === 'FIRST') return 0;
    const idx = groupedSections.findIndex((s) => s.key === selectedSectionKey);
    return idx >= 0 ? idx : 0;
  }, [groupedSections, selectedSectionKey]);

  const visibleSections = useMemo(() => {
    if (showAllSections || globalFilter.trim()) return groupedSections;
    if (activeIndex < 0) return [];
    return [groupedSections[activeIndex]];
  }, [groupedSections, showAllSections, globalFilter, activeIndex]);

  return (
    <div className="space-y-3">
      {/* Barra de filtro rápida */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Filtrar por código, entregable, responsable o CU01..."
            className={`w-full pl-8 pr-3 py-1.5 rounded-lg text-xs border outline-none transition ${
              isLight
                ? 'bg-white border-slate-200 text-slate-900 focus:border-blue-500'
                : 'bg-[#181B22] border-white/10 text-slate-100 focus:border-amber-400/50'
            }`}
          />
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>
            Metodología <strong className={isLight ? 'text-slate-800' : 'text-white'}>{metodologia}</strong>
          </span>
          {groupedSections.length > 1 && (
            <button
              type="button"
              onClick={() => setShowAllSections((v) => !v)}
              className={`ml-1 px-2 py-1 rounded-md text-[11px] font-semibold border transition ${
                showAllSections
                  ? isLight
                    ? 'bg-blue-50 border-blue-200 text-blue-600'
                    : 'bg-amber-400/15 border-amber-400/30 text-amber-300'
                  : isLight
                  ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              {showAllSections ? 'Vista paso a paso' : 'Ver todas las fases'}
            </button>
          )}
        </div>
      </div>

      {/* Stepper Guiado de Fases (evita mostrar todos los bloques a la vez) */}
      {groupedSections.length > 1 && !showAllSections && !globalFilter.trim() && (
        <div
          className={`rounded-xl border p-2 flex flex-wrap items-center justify-between gap-2 ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#181B22] border-white/10'
          }`}
        >
          <div className="flex items-center gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden">
            {groupedSections.map((sec, idx) => {
              const active = idx === activeIndex;
              return (
                <button
                  key={sec.key}
                  type="button"
                  onClick={() => setSelectedSectionKey(sec.key)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition ${
                    active
                      ? isLight
                        ? 'bg-blue-600 text-white'
                        : 'bg-amber-400 text-slate-950'
                      : isLight
                      ? 'text-slate-600 hover:bg-slate-100'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
                      active
                        ? isLight
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-950/20 text-slate-950'
                        : isLight
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="truncate max-w-[160px]">{sec.title}</span>
                  <span className="text-[10px] opacity-75">({sec.rows.length})</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              disabled={activeIndex <= 0}
              onClick={() => setSelectedSectionKey(groupedSections[activeIndex - 1].key)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition disabled:opacity-35 ${
                isLight ? 'border-slate-200 text-slate-700 hover:bg-slate-50' : 'border-white/10 text-slate-300 hover:bg-white/5'
              }`}
            >
              ← Anterior
            </button>
            <button
              type="button"
              disabled={activeIndex >= groupedSections.length - 1}
              onClick={() => setSelectedSectionKey(groupedSections[activeIndex + 1].key)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition disabled:opacity-35 ${
                isLight ? 'border-slate-200 text-slate-700 hover:bg-slate-50' : 'border-white/10 text-slate-300 hover:bg-white/5'
              }`}
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}

      {/* Bloque(s) de Fase/Sprint */}
      {groupedSections.length === 0 ? (
        <div
          className={`rounded-xl border p-8 text-center text-xs ${
            isLight ? 'bg-white border-slate-200 text-slate-500' : 'bg-[#181B22] border-white/10 text-slate-400'
          }`}
        >
          <FolderGit2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
          No hay etapas ni entregables registrados en este proyecto todavía.
        </div>
      ) : (
        <div className="space-y-3">
          {visibleSections.map((section) => (
            <PhaseTableGroup
              key={section.key}
              section={section}
              globalFilter={globalFilter}
              isCollapsed={false}
              onToggle={() => {}}
              onSelectItem={onSelectItem}
              isLight={isLight}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PhaseTableGroup({
  section,
  globalFilter,
  isCollapsed,
  onToggle,
  onSelectItem,
  isLight,
}: {
  section: { key: string; title: string; fase: string; rows: GridRow[] };
  globalFilter: string;
  isCollapsed: boolean;
  onToggle: () => void;
  onSelectItem: (item: SlideOverItem) => void;
  isLight: boolean;
}) {
  const filteredRows = useMemo(() => {
    const q = globalFilter.trim().toLowerCase();
    if (!q) return section.rows;
    return section.rows.filter(
      (r) =>
        r.codigo.toLowerCase().includes(q) ||
        r.nombre.toLowerCase().includes(q) ||
        r.responsableNombre.toLowerCase().includes(q) ||
        (r.codigo_caso_uso || '').toLowerCase().includes(q) ||
        r.estadoLabel.toLowerCase().includes(q)
    );
  }, [section.rows, globalFilter]);

  if (globalFilter.trim() && filteredRows.length === 0) return null;

  return (
    <div
      className={`rounded-xl border overflow-hidden transition-colors ${
        isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-[#181B22] border-white/10'
      }`}
    >
      {/* Cabecera colapsable de la Fase/Sprint */}
      <button
        type="button"
        onClick={onToggle}
        className={`w-full px-3.5 py-2 flex items-center justify-between text-left transition ${
          isLight ? 'bg-slate-50/80 hover:bg-slate-100' : 'bg-white/[0.03] hover:bg-white/[0.06]'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          )}
          <span className={`text-xs font-bold truncate ${isLight ? 'text-slate-800' : 'text-white'}`}>
            {section.title}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
            {section.fase}
          </span>
        </div>
        <span className="text-[11px] font-medium text-slate-400 shrink-0">
          {filteredRows.length} {filteredRows.length === 1 ? 'entregable' : 'entregables'}
        </span>
      </button>

      {/* Tabla compacta (filas ~40px) */}
      {!isCollapsed && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className={`border-y text-[10px] font-bold uppercase tracking-wider ${
                  isLight
                    ? 'border-slate-200 bg-slate-50/40 text-slate-500'
                    : 'border-white/5 bg-black/10 text-slate-500'
                }`}
              >
                <th className="px-3.5 py-1.5 whitespace-nowrap">Código</th>
                <th className="px-3.5 py-1.5 whitespace-nowrap">Entregable / Artefacto</th>
                <th className="px-3.5 py-1.5 whitespace-nowrap">Responsable</th>
                <th className="px-3.5 py-1.5 whitespace-nowrap">Plazo / Origen</th>
                <th className="px-3.5 py-1.5 whitespace-nowrap">Estado</th>
                <th className="px-3.5 py-1.5 whitespace-nowrap" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3.5 py-4 text-center text-xs text-slate-400">
                    Sin entregables asignados en esta fase.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const dotColor =
                    row.estadoTone === 'emerald'
                      ? 'bg-emerald-500'
                      : row.estadoTone === 'amber'
                      ? 'bg-amber-500'
                      : row.estadoTone === 'rose'
                      ? 'bg-rose-500'
                      : 'bg-slate-400';
                  const pillStyle =
                    row.estadoTone === 'emerald'
                      ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/25'
                      : row.estadoTone === 'amber'
                      ? 'text-amber-500 bg-amber-500/10 border-amber-500/25'
                      : row.estadoTone === 'rose'
                      ? 'text-rose-500 bg-rose-500/10 border-rose-500/25'
                      : 'text-slate-400 bg-slate-500/10 border-slate-500/20';

                  return (
                    <tr
                      key={row.id}
                      onClick={() => {
                        if (row.rawEcs) onSelectItem(row.rawEcs);
                      }}
                      className={`h-10 transition-colors ${row.rawEcs ? 'cursor-pointer' : ''} ${
                        isLight
                          ? 'hover:bg-blue-50/40 border-slate-100'
                          : 'hover:bg-white/[0.04] border-white/5'
                      }`}
                    >
                      <td className="px-3.5 py-1.5 align-middle">
                        <span
                          className={`font-mono font-bold text-[11px] px-1.5 py-0.5 rounded border ${
                            isLight
                              ? 'bg-slate-100 border-slate-200 text-slate-700'
                              : 'bg-white/5 border-white/10 text-amber-300'
                          }`}
                        >
                          {row.codigo}
                        </span>
                      </td>
                      <td className="px-3.5 py-1.5 align-middle">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`font-medium text-xs truncate max-w-[260px] ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
                            {row.nombre}
                          </span>
                          {row.codigo_caso_uso && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-500/15 text-sky-500 border border-sky-500/25 shrink-0">
                              <Tag className="w-2.5 h-2.5" />
                              {row.codigo_caso_uso}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3.5 py-1.5 align-middle">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                              isLight ? 'bg-blue-100 text-blue-700' : 'bg-amber-400/15 text-amber-300'
                            }`}
                          >
                            {row.responsableInitials}
                          </span>
                          <span className="text-xs text-slate-400 truncate max-w-[130px]">
                            {row.responsableNombre}
                          </span>
                        </div>
                      </td>
                      <td className="px-3.5 py-1.5 align-middle">
                        <span className="text-[11px] text-slate-400 whitespace-nowrap">{row.plazoLabel}</span>
                      </td>
                      <td className="px-3.5 py-1.5 align-middle">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap ${pillStyle}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                            {row.estadoLabel}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 hidden md:inline">
                            {row.versionLabel}
                          </span>
                        </div>
                      </td>
                      <td className="px-3.5 py-1.5 align-middle text-right">
                        {row.rawEcs && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectItem(row.rawEcs!);
                            }}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold transition ${
                              isLight ? 'text-blue-600 hover:bg-blue-50' : 'text-amber-300 hover:bg-white/10'
                            }`}
                          >
                            <span>Ver</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
