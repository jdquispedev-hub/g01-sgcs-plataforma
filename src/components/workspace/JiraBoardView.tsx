'use client';

import React, { useMemo, useState } from 'react';
import {
  Search,
  Tag,
  FileText,
  Code2,
  Database,
  Palette,
  FlaskConical,
  Layers,
  GitCommit,
  CheckCircle2,
  Clock,
  AlertCircle,
  FilterX,
} from 'lucide-react';
import { useSgcsTheme } from '@/components/ThemeProvider';
import {
  WorkspaceEcsItem,
  WorkspaceEtapa,
} from '@/components/workspace/EntregablesDataGrid';
import { SlideOverItem } from '@/components/NotionSlideOver';

type BoardColumnId = 'POR_INICIAR' | 'EN_PROGRESO' | 'EN_DICTAMEN' | 'APROBADO';

interface BoardCard {
  id: string;
  column: BoardColumnId;
  codigo: string;
  nombre: string;
  tipo: string;
  faseLabel: string;
  faseKey: string;
  codigo_caso_uso: string | null;
  responsableId: string | null;
  responsableNombre: string;
  responsableInitials: string;
  versionLabel: string | null;
  plazoLabel: string | null;
  rawEcs: SlideOverItem | null;
}

interface JiraBoardViewProps {
  metodologia: string;
  etapas: WorkspaceEtapa[];
  elementosConfig: WorkspaceEcsItem[];
  onSelectItem: (item: SlideOverItem) => void;
}

const COLUMNS: {
  id: BoardColumnId;
  title: string;
  accentDark: string;
  accentLight: string;
  dot: string;
}[] = [
  {
    id: 'POR_INICIAR',
    title: 'POR INICIAR',
    accentDark: 'text-slate-300',
    accentLight: 'text-slate-600',
    dot: 'bg-slate-400',
  },
  {
    id: 'EN_PROGRESO',
    title: 'EN PROGRESO',
    accentDark: 'text-sky-400',
    accentLight: 'text-blue-600',
    dot: 'bg-sky-500',
  },
  {
    id: 'EN_DICTAMEN',
    title: 'EN DICTAMEN',
    accentDark: 'text-amber-400',
    accentLight: 'text-amber-600',
    dot: 'bg-amber-500',
  },
  {
    id: 'APROBADO',
    title: 'APROBADO',
    accentDark: 'text-emerald-400',
    accentLight: 'text-emerald-600',
    dot: 'bg-emerald-500',
  },
];

function getInitials(name?: string | null) {
  if (!name) return 'SG';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

function getFasePillColors(fase: string) {
  const f = fase.toUpperCase();
  if (f.includes('INICIO') || f.includes('ANALISIS')) {
    return 'bg-sky-500/15 text-sky-500 border-sky-500/30';
  }
  if (f.includes('ELABORACION') || f.includes('DISENO')) {
    return 'bg-purple-500/15 text-purple-500 border-purple-500/30';
  }
  if (f.includes('CONSTRUCCION') || f.includes('SPRINT')) {
    return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30';
  }
  if (f.includes('TRANSICION') || f.includes('PRUEBAS') || f.includes('DESPLIEGUE')) {
    return 'bg-amber-500/15 text-amber-500 border-amber-500/30';
  }
  return 'bg-slate-500/15 text-slate-400 border-slate-500/25';
}

function getTipoIcon(tipo: string) {
  switch (tipo) {
    case 'CODIGO_FUENTE':
      return Code2;
    case 'BASE_DATOS':
      return Database;
    case 'DISENO':
      return Palette;
    case 'CASO_PRUEBA':
      return FlaskConical;
    case 'DOCUMENTO':
      return FileText;
    default:
      return Layers;
  }
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

function resolveColumn(ecs?: WorkspaceEcsItem | null, estadoAsignacion?: string): BoardColumnId {
  const latest = ecs?.versiones?.[0];
  if (latest) {
    if (latest.estado === 'APROBADA') return 'APROBADO';
    if (latest.estado === 'PENDIENTE') return 'EN_DICTAMEN';
    if (latest.estado === 'RECHAZADA') return 'EN_PROGRESO';
  }
  if (estadoAsignacion === 'COMPLETADA') return 'APROBADO';
  if (estadoAsignacion === 'ACEPTADA' || estadoAsignacion === 'EN_PROGRESO') return 'EN_PROGRESO';
  if (estadoAsignacion === 'PENDIENTE_ACEPTACION' || estadoAsignacion === 'RECHAZADA') return 'POR_INICIAR';
  return ecs ? 'EN_PROGRESO' : 'POR_INICIAR';
}

export default function JiraBoardView({
  metodologia,
  etapas,
  elementosConfig,
  onSelectItem,
}: JiraBoardViewProps) {
  const { theme } = useSgcsTheme();
  const isLight = theme === 'light';

  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedFase, setSelectedFase] = useState<string>('TODAS');
  const [selectedCU, setSelectedCU] = useState<string>('TODOS');

  // Construir tarjetas combinando etapas/actividades de la metodología + ECS del proyecto
  const cards = useMemo<BoardCard[]>(() => {
    const usedEcsIds = new Set<string>();
    const list: BoardCard[] = [];
    const ecsById = new Map(elementosConfig.map((e) => [e.id, e]));

    (etapas || []).forEach((etapa) => {
      (etapa.actividades || []).forEach((act) => {
        const linkedEcs = act.ecs ? ecsById.get(act.ecs.id) || act.ecs : null;
        if (linkedEcs) usedEcsIds.add(linkedEcs.id);

        const respId = act.responsable?.id || linkedEcs?.responsable?.id || null;
        const respName =
          act.responsable?.nombre_completo || linkedEcs?.responsable?.nombre_completo || 'Sin asignar';
        const latestVersion = linkedEcs?.versiones?.[0];

        const finLabel = act.fecha_fin
          ? new Date(act.fecha_fin).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
          : null;

        list.push({
          id: linkedEcs?.id || act.id,
          column: resolveColumn(linkedEcs, act.estado_asignacion),
          codigo: linkedEcs?.codigo || `ACT-${act.id.slice(0, 4).toUpperCase()}`,
          nombre: linkedEcs?.nombre || act.titulo,
          tipo: linkedEcs?.tipo || 'ACTIVIDAD',
          faseLabel: etapa.nombre.split(':')[0].trim(),
          faseKey: etapa.fase,
          codigo_caso_uso: act.codigo_caso_uso || linkedEcs?.codigo_caso_uso || null,
          responsableId: respId,
          responsableNombre: respName,
          responsableInitials: getInitials(respName),
          versionLabel: latestVersion ? `v${latestVersion.numero_version}` : null,
          plazoLabel: finLabel,
          rawEcs: linkedEcs ? toSlideOverItem(linkedEcs) : null,
        });
      });
    });

    elementosConfig.forEach((ecs) => {
      if (usedEcsIds.has(ecs.id)) return;
      const latestVersion = ecs.versiones?.[0];
      const respId = ecs.responsable?.id || null;
      const respName = ecs.responsable?.nombre_completo || 'Sin asignar';

      list.push({
        id: ecs.id,
        column: resolveColumn(ecs),
        codigo: ecs.codigo,
        nombre: ecs.nombre,
        tipo: ecs.tipo,
        faseLabel: ecs.etapa_sugerida || metodologia,
        faseKey: ecs.etapa_sugerida || 'GENERAL',
        codigo_caso_uso: ecs.codigo_caso_uso || null,
        responsableId: respId,
        responsableNombre: respName,
        responsableInitials: getInitials(respName),
        versionLabel: latestVersion ? `v${latestVersion.numero_version}` : null,
        plazoLabel: null,
        rawEcs: toSlideOverItem(ecs),
      });
    });

    return list;
  }, [etapas, elementosConfig, metodologia]);

  // Avatares únicos para el filtro rápido estilo Jira
  const teamMembers = useMemo(() => {
    const map = new Map<string, { id: string; nombre: string; initials: string }>();
    cards.forEach((c) => {
      if (c.responsableId && !map.has(c.responsableId)) {
        map.set(c.responsableId, {
          id: c.responsableId,
          nombre: c.responsableNombre,
          initials: c.responsableInitials,
        });
      }
    });
    return Array.from(map.values());
  }, [cards]);

  const fasesDisponibles = useMemo(() => {
    const set = new Set(cards.map((c) => c.faseKey).filter(Boolean));
    return Array.from(set);
  }, [cards]);

  const casosUsoDisponibles = useMemo(() => {
    const set = new Set(cards.map((c) => c.codigo_caso_uso).filter((v): v is string => Boolean(v)));
    return Array.from(set).sort();
  }, [cards]);

  const filteredCards = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cards.filter((c) => {
      if (selectedUserId && c.responsableId !== selectedUserId) return false;
      if (selectedFase !== 'TODAS' && c.faseKey !== selectedFase) return false;
      if (selectedCU !== 'TODOS' && c.codigo_caso_uso !== selectedCU) return false;
      if (q) {
        return (
          c.codigo.toLowerCase().includes(q) ||
          c.nombre.toLowerCase().includes(q) ||
          c.responsableNombre.toLowerCase().includes(q) ||
          (c.codigo_caso_uso || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [cards, search, selectedUserId, selectedFase, selectedCU]);

  const hasActiveFilters = Boolean(search || selectedUserId || selectedFase !== 'TODAS' || selectedCU !== 'TODOS');

  return (
    <div className="space-y-3">
      {/* Barra de Herramientas Estilo Jira */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Buscador compacto */}
          <div className="relative w-52 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar en el tablero..."
              className={`w-full pl-8 pr-3 py-1.5 rounded-lg text-xs border outline-none transition ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-900 focus:border-blue-500'
                  : 'bg-[#181B22] border-white/10 text-slate-100 focus:border-amber-400/50'
              }`}
            />
          </div>

          {/* Stack de Avatares del Equipo (Filtro 1-clic estilo Jira) */}
          {teamMembers.length > 0 && (
            <div className="flex items-center -space-x-1.5 pl-1">
              {teamMembers.slice(0, 6).map((m) => {
                const selected = selectedUserId === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedUserId(selected ? '' : m.id)}
                    title={`Filtrar por ${m.nombre}`}
                    className={`w-7 h-7 rounded-full text-[10px] font-bold flex items-center justify-center border-2 transition-transform hover:scale-110 hover:z-10 ${
                      selected
                        ? isLight
                          ? 'bg-blue-600 text-white border-blue-300 ring-2 ring-blue-500 z-10'
                          : 'bg-amber-400 text-slate-950 border-amber-200 ring-2 ring-amber-400 z-10'
                        : isLight
                        ? 'bg-slate-200 text-slate-700 border-white'
                        : 'bg-[#232733] text-slate-200 border-[#13151A]'
                    }`}
                  >
                    {m.initials}
                  </button>
                );
              })}
              {teamMembers.length > 6 && (
                <span
                  className={`w-7 h-7 rounded-full text-[10px] font-bold flex items-center justify-center border-2 ${
                    isLight ? 'bg-slate-100 text-slate-600 border-white' : 'bg-white/10 text-slate-300 border-[#13151A]'
                  }`}
                >
                  +{teamMembers.length - 6}
                </span>
              )}
            </div>
          )}

          {/* Filtro por Fase / Sprint de la Metodología */}
          <select
            value={selectedFase}
            onChange={(e) => setSelectedFase(e.target.value)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border outline-none cursor-pointer ${
              isLight
                ? 'bg-white border-slate-200 text-slate-700'
                : 'bg-[#181B22] border-white/10 text-slate-200'
            }`}
          >
            <option value="TODAS">Fase / Sprint: Todas ({metodologia})</option>
            {fasesDisponibles.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          {/* Filtro por Caso de Uso */}
          {casosUsoDisponibles.length > 0 && (
            <select
              value={selectedCU}
              onChange={(e) => setSelectedCU(e.target.value)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border outline-none cursor-pointer ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-700'
                  : 'bg-[#181B22] border-white/10 text-slate-200'
              }`}
            >
              <option value="TODOS">Caso de Uso: Todos</option>
              {casosUsoDisponibles.map((cu) => (
                <option key={cu} value={cu}>
                  {cu}
                </option>
              ))}
            </select>
          )}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedUserId('');
                setSelectedFase('TODAS');
                setSelectedCU('TODOS');
              }}
              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold text-rose-500 hover:bg-rose-500/10 transition"
            >
              <FilterX className="w-3.5 h-3.5" />
              Limpiar
            </button>
          )}
        </div>

        <span className="text-[11px] text-slate-400">
          Mostrando <strong>{filteredCards.length}</strong> de {cards.length} elementos
        </span>
      </div>

      {/* Tablero de 4 Columnas (Scroll horizontal suave en móvil, Grid 4 cols en desktop) */}
      <div className="flex lg:grid lg:grid-cols-4 gap-3 overflow-x-auto pb-2 snap-x">
        {COLUMNS.map((col) => {
          const colCards = filteredCards.filter((c) => c.column === col.id);

          return (
            <div
              key={col.id}
              className={`min-w-[270px] lg:min-w-0 flex-1 snap-start rounded-xl border p-2.5 flex flex-col gap-2.5 min-h-[360px] ${
                isLight
                  ? 'bg-[#EBECF0]/70 border-slate-200/80'
                  : 'bg-[#161922] border-white/10'
              }`}
            >
              {/* Encabezado de columna */}
              <div className="px-1.5 py-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                  <h3
                    className={`text-[11px] font-bold tracking-wider uppercase ${
                      isLight ? col.accentLight : col.accentDark
                    }`}
                  >
                    {col.title}
                  </h3>
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isLight ? 'bg-white text-slate-700' : 'bg-white/10 text-slate-300'
                  }`}
                >
                  {colCards.length}
                </span>
              </div>

              {/* Tarjetas densas estilo Jira */}
              <div className="space-y-2 flex-1">
                {colCards.length === 0 ? (
                  <div
                    className={`rounded-lg border border-dashed p-4 text-center text-[11px] ${
                      isLight ? 'border-slate-300 text-slate-400' : 'border-white/10 text-slate-500'
                    }`}
                  >
                    Sin elementos aquí
                  </div>
                ) : (
                  colCards.map((card) => {
                    const TipoIcon = getTipoIcon(card.tipo);
                    return (
                      <div
                        key={card.id}
                        onClick={() => {
                          if (card.rawEcs) onSelectItem(card.rawEcs);
                        }}
                        className={`rounded-lg border p-3 space-y-2.5 transition-all ${
                          card.rawEcs ? 'cursor-pointer' : ''
                        } ${
                          isLight
                            ? 'bg-white border-slate-200 hover:border-blue-400 shadow-2xs hover:shadow-sm'
                            : 'bg-[#1E222D] border-white/10 hover:border-amber-400/50 hover:bg-[#232836]'
                        }`}
                      >
                        {/* Título de la tarjeta */}
                        <p
                          className={`text-xs font-semibold leading-snug line-clamp-2 ${
                            isLight ? 'text-slate-800' : 'text-slate-100'
                          }`}
                        >
                          {card.nombre}
                        </p>

                        {/* Etiquetas: Fase/Sprint de Metodología + Caso de Uso */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide ${getFasePillColors(
                              card.faseKey
                            )}`}
                          >
                            {card.faseLabel}
                          </span>
                          {card.codigo_caso_uso && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-500 border border-sky-500/25">
                              <Tag className="w-2.5 h-2.5" />
                              {card.codigo_caso_uso}
                            </span>
                          )}
                        </div>

                        {/* Pie de tarjeta estilo Jira: Icono + Código + Versión + Avatar */}
                        <div className="pt-1 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <TipoIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="font-mono text-[11px] font-bold text-slate-400 truncate">
                              {card.codigo}
                            </span>
                            {card.versionLabel && (
                              <span
                                className={`inline-flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                  isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/5 text-slate-300'
                                }`}
                              >
                                <GitCommit className="w-2.5 h-2.5" />
                                {card.versionLabel}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {col.id === 'APROBADO' && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            )}
                            {col.id === 'EN_DICTAMEN' && (
                              <Clock className="w-3.5 h-3.5 text-amber-500" />
                            )}
                            {col.id === 'POR_INICIAR' && (
                              <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                            )}
                            <span
                              title={card.responsableNombre}
                              className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center ${
                                isLight
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                              }`}
                            >
                              {card.responsableInitials}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
