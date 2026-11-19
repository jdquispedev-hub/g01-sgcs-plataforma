'use client';

import React, { useMemo, useState } from 'react';
import {
  Kanban,
  Inbox,
  Network,
  Plus,
  Handshake,
  Loader2,
  FolderGit2,
  Zap,
} from 'lucide-react';
import { useSgcsTheme } from '@/components/ThemeProvider';
import BandejaAsignacionesUsuario from '@/components/BandejaAsignacionesUsuario';
import {
  WorkspaceEcsItem,
  WorkspaceEtapa,
} from '@/components/workspace/EntregablesDataGrid';
import JiraBoardView from '@/components/workspace/JiraBoardView';
import ModalNuevaActividad from '@/components/workspace/ModalNuevaActividad';
import ReporteTrazabilidadCasoUso from '@/components/ReporteTrazabilidadCasoUso';
import { SlideOverItem } from '@/components/NotionSlideOver';

export type ScrumWorkspaceTab = 'TABLERO' | 'BANDEJA' | 'TRAZABILIDAD';
export type SprintFilter = 'TODOS' | 'SPRINT_0' | 'SPRINT_1' | 'SPRINT_2';

export interface ScrumProyectoDetalle {
  id: string;
  codigo: string;
  nombre: string;
  cliente_nombre?: string;
  estado?: string;
  metodologia: string;
  etapas: WorkspaceEtapa[];
  actividades_cronograma?: any[];
  elementos_config: WorkspaceEcsItem[];
  lineas_base?: any[];
  reuniones?: any[];
}

export interface ScrumWorkspaceProps {
  user: {
    userId: string;
    nombreCompleto: string;
    rol: string;
    rubro: string;
  };
  proyectoDetalle: ScrumProyectoDetalle | null;
  loadingDetalle: boolean;
  stats: {
    totalEcs: number;
    versionesPendientes: number;
    lineasVigentes: number;
    rfcPendientes: number;
    bloqueosActivos: number;
  };
  onOpenCrearProyecto: () => void;
  onOpenAgendarReunion: () => void;
  onOpenDrawer: (item: SlideOverItem) => void;
  onRefreshProyecto: () => void;
}

const SPRINT_FILTERS: { id: SprintFilter; label: string; token: string }[] = [
  { id: 'TODOS', label: 'Todos', token: '' },
  { id: 'SPRINT_0', label: 'Sprint 0', token: 'SPRINT 0' },
  { id: 'SPRINT_1', label: 'Sprint 1', token: 'SPRINT 1' },
  { id: 'SPRINT_2', label: 'Sprint 2', token: 'SPRINT 2' },
];

function matchesSprint(value: string | null | undefined, filter: SprintFilter): boolean {
  if (filter === 'TODOS') return true;
  if (!value) return false;
  const normalized = value.toUpperCase().replace(/[_-]+/g, ' ');
  const target = SPRINT_FILTERS.find((s) => s.id === filter)?.token || '';
  return target ? normalized.includes(target) : true;
}

export default function ScrumWorkspace({
  user,
  proyectoDetalle,
  loadingDetalle,
  onOpenCrearProyecto,
  onOpenAgendarReunion,
  onOpenDrawer,
  onRefreshProyecto,
}: ScrumWorkspaceProps) {
  const { theme } = useSgcsTheme();
  const isLight = theme === 'light';
  const isAdmin = user.rol === 'ADMINISTRADOR' || user.rol === 'SUPERADMIN';

  const [activeTab, setActiveTab] = useState<ScrumWorkspaceTab>(
    user.rol === 'SOLICITANTE' ? 'BANDEJA' : 'TABLERO'
  );
  const [sprintFilter, setSprintFilter] = useState<SprintFilter>('TODOS');
  const [modalNuevaTareaOpen, setModalNuevaTareaOpen] = useState(false);

  const metodologia = proyectoDetalle?.metodologia || 'SCRUM';

  const { filteredEtapas, filteredElementosConfig, defaultEtapaId } = useMemo(() => {
    const etapas = proyectoDetalle?.etapas || [];
    const ecsList = proyectoDetalle?.elementos_config || [];

    if (sprintFilter === 'TODOS') {
      return {
        filteredEtapas: etapas,
        filteredElementosConfig: ecsList,
        defaultEtapaId: etapas[0]?.id,
      };
    }

    const matchingEtapas = etapas.filter(
      (etapa) => matchesSprint(etapa.nombre, sprintFilter) || matchesSprint(etapa.fase, sprintFilter)
    );

    const matchingEcsIds = new Set<string>();
    matchingEtapas.forEach((etapa) => {
      (etapa.actividades || []).forEach((act) => {
        if (act.ecs?.id) matchingEcsIds.add(act.ecs.id);
      });
    });

    const otherSprintEcsIds = new Set<string>();
    etapas.forEach((etapa) => {
      if (matchingEtapas.some((m) => m.id === etapa.id)) return;
      (etapa.actividades || []).forEach((act) => {
        if (act.ecs?.id) otherSprintEcsIds.add(act.ecs.id);
      });
    });

    const matchingEcs = ecsList.filter((ecs) => {
      if (matchingEcsIds.has(ecs.id)) return true;
      if (otherSprintEcsIds.has(ecs.id)) return false;
      return matchesSprint(ecs.etapa_sugerida, sprintFilter);
    });

    return {
      filteredEtapas: matchingEtapas,
      filteredElementosConfig: matchingEcs,
      defaultEtapaId: matchingEtapas[0]?.id || etapas[0]?.id,
    };
  }, [proyectoDetalle, sprintFilter]);

  const tabs: {
    id: ScrumWorkspaceTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'TABLERO', label: 'Tablero Sprint', icon: Kanban },
    { id: 'BANDEJA', label: 'Mi Bandeja & Sprints', icon: Inbox },
    { id: 'TRAZABILIDAD', label: 'Trazabilidad', icon: Network },
  ];

  return (
    <div className="space-y-3">
      {/* Barra Superior Compacta SCRUM */}
      <div
        className={`rounded-2xl border overflow-hidden transition-colors ${
          isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#181B22] border-white/10'
        }`}
      >
        <div className="px-3 sm:px-4 py-2.5 flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
          {/* Proyecto + Badge SCRUM + Filtro rápido de Sprint */}
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 ${
                isLight
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5" />
            </div>

            <span className="text-sm font-bold truncate max-w-[220px] sm:max-w-[320px]">
              {proyectoDetalle ? proyectoDetalle.nombre : 'Proyecto SCRUM'}
            </span>

            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider bg-emerald-500/15 text-emerald-500 border-emerald-500/30 shrink-0">
              <Zap className="w-2.5 h-2.5" />
              SCRUM
            </span>

            {/* Filtro rápido de Sprint */}
            <div
              className={`flex items-center gap-1 p-0.5 rounded-lg border overflow-x-auto [&::-webkit-scrollbar]:hidden ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#13151A] border-white/10'
              }`}
              role="group"
              aria-label="Filtro rápido de Sprint"
            >
              {SPRINT_FILTERS.map((sprint) => {
                const active = sprintFilter === sprint.id;
                return (
                  <button
                    key={sprint.id}
                    type="button"
                    onClick={() => {
                      setSprintFilter(sprint.id);
                      if (activeTab !== 'TABLERO') setActiveTab('TABLERO');
                    }}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors ${
                      active
                        ? isLight
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-emerald-500 text-slate-950 font-bold'
                        : isLight
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    {sprint.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            <button
              type="button"
              disabled={!proyectoDetalle?.id}
              onClick={() => setModalNuevaTareaOpen(true)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 disabled:opacity-40 ${
                isLight
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Tarea</span>
            </button>

            <button
              type="button"
              onClick={onOpenAgendarReunion}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
              }`}
            >
              <Handshake className="w-3.5 h-3.5 text-amber-500" />
              <span>Minuta</span>
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={onOpenCrearProyecto}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  isLight
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo Proyecto</span>
              </button>
            )}
          </div>
        </div>

        {/* 3 Pestañas claras y sin ruido */}
        <div
          className={`px-3 sm:px-4 border-t flex items-center gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden ${
            isLight ? 'border-slate-200 bg-slate-50/60' : 'border-white/10 bg-[#13151A]/60'
          }`}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3 py-2 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  isActive
                    ? isLight
                      ? 'text-blue-600'
                      : 'text-emerald-400'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {isActive && (
                  <span
                    className={`absolute bottom-0 left-2 right-2 h-0.5 rounded-full ${
                      isLight ? 'bg-blue-600' : 'bg-emerald-400'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenido de la pestaña activa */}
      {activeTab === 'TABLERO' &&
        (loadingDetalle ? (
          <div className="py-12 flex items-center justify-center gap-2 text-xs text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            <span>Cargando tablero SCRUM...</span>
          </div>
        ) : (
          <JiraBoardView
            metodologia={metodologia}
            etapas={filteredEtapas}
            elementosConfig={filteredElementosConfig}
            onSelectItem={onOpenDrawer}
          />
        ))}

      {activeTab === 'BANDEJA' && <BandejaAsignacionesUsuario />}

      {activeTab === 'TRAZABILIDAD' && (
        <ReporteTrazabilidadCasoUso
          proyectoId={proyectoDetalle?.id}
          rubro={user.rubro}
        />
      )}

      {/* Modal + Nueva Tarea */}
      {proyectoDetalle?.id && (
        <ModalNuevaActividad
          isOpen={modalNuevaTareaOpen}
          onClose={() => setModalNuevaTareaOpen(false)}
          proyectoId={proyectoDetalle.id}
          etapas={proyectoDetalle.etapas || []}
          elementosConfig={proyectoDetalle.elementos_config || []}
          defaultEtapaId={defaultEtapaId}
          onCreated={onRefreshProyecto}
        />
      )}
    </div>
  );
}
