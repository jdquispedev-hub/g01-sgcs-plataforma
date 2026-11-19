'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ListTree,
  CalendarDays,
  Network,
  Plus,
  Layers,
  Lock,
  GitPullRequest,
  AlertTriangle,
  Handshake,
  Loader2,
  FolderGit2,
  ArrowRight,
} from 'lucide-react';
import { useSgcsTheme } from '@/components/ThemeProvider';
import EntregablesDataGrid, {
  WorkspaceActividad,
  WorkspaceEcsItem,
  WorkspaceEtapa,
} from '@/components/workspace/EntregablesDataGrid';
import CronogramaTimelineView from '@/components/workspace/CronogramaTimelineView';
import ModalNuevaActividad from '@/components/workspace/ModalNuevaActividad';
import ReporteTrazabilidadCasoUso from '@/components/ReporteTrazabilidadCasoUso';
import { SlideOverItem } from '@/components/NotionSlideOver';

export type RupWorkspaceTab = 'FASES' | 'CRONOGRAMA' | 'TRAZABILIDAD';

export interface RupProyectoDetalle {
  id: string;
  codigo: string;
  nombre: string;
  cliente_nombre?: string;
  estado?: string;
  metodologia: string;
  etapas: WorkspaceEtapa[];
  actividades_cronograma?: WorkspaceActividad[];
  elementos_config: WorkspaceEcsItem[];
  lineas_base: any[];
  reuniones: any[];
}

export interface RupWorkspaceProps {
  user: {
    userId: string;
    nombreCompleto: string;
    rol: string;
    rubro: string;
  };
  proyectoDetalle: RupProyectoDetalle | null;
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

const RUP_TABS: {
  id: RupWorkspaceTab;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'FASES',
    label: 'Fases y Entregables',
    hint: 'Inicio → Elaboración → Construcción → Transición',
    icon: ListTree,
  },
  {
    id: 'CRONOGRAMA',
    label: 'Cronograma y Asignaciones',
    hint: 'Línea de tiempo por fase y responsables',
    icon: CalendarDays,
  },
  {
    id: 'TRAZABILIDAD',
    label: 'Trazabilidad',
    hint: 'Matriz y reporte por Caso de Uso',
    icon: Network,
  },
];

export default function RupWorkspace({
  user,
  proyectoDetalle,
  loadingDetalle,
  stats,
  onOpenCrearProyecto,
  onOpenAgendarReunion,
  onOpenDrawer,
  onRefreshProyecto,
}: RupWorkspaceProps) {
  const { theme } = useSgcsTheme();
  const isLight = theme === 'light';
  const isAdmin = user.rol === 'ADMINISTRADOR' || user.rol === 'SUPERADMIN';

  const [activeTab, setActiveTab] = useState<RupWorkspaceTab>('FASES');
  const [modalNuevaOpen, setModalNuevaOpen] = useState(false);

  const currentTab = RUP_TABS.find((t) => t.id === activeTab) || RUP_TABS[0];
  const metodologia = proyectoDetalle?.metodologia || 'RUP';

  return (
    <div className="space-y-3">
      {/* Barra superior compacta + pestañas RUP */}
      <div
        className={`rounded-xl border overflow-hidden transition-colors ${
          isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#181B22] border-white/10'
        }`}
      >
        <div className="px-3 sm:px-4 py-2.5 flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
          {/* Identidad del proyecto + badge RUP */}
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 ${
                isLight
                  ? 'bg-sky-50 border-sky-200 text-sky-600'
                  : 'bg-sky-500/10 border-sky-500/25 text-sky-400'
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5" />
            </div>

            <div className="min-w-0 flex items-center gap-2">
              <h2
                className={`text-sm font-bold truncate max-w-[210px] sm:max-w-[340px] ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
                title={proyectoDetalle ? `${proyectoDetalle.codigo} • ${proyectoDetalle.nombre}` : 'Proyecto RUP'}
              >
                {proyectoDetalle ? proyectoDetalle.nombre : 'Selecciona un proyecto'}
              </h2>

              {proyectoDetalle?.codigo && (
                <span
                  className={`hidden sm:inline text-[11px] font-mono px-1.5 py-0.5 rounded border ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-600'
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}
                >
                  {proyectoDetalle.codigo}
                </span>
              )}
            </div>

            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider bg-sky-500/15 text-sky-500 border-sky-500/30 shrink-0">
              {metodologia}
            </span>
          </div>

          {/* Métricas esenciales + acciones */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-white/5 border-white/10 text-slate-300'
                }`}
                title="Elementos de Configuración de Software"
              >
                <Layers className="w-3 h-3 text-teal-500" />
                <strong>{stats.totalEcs}</strong> ECS
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-white/5 border-white/10 text-slate-300'
                }`}
                title="Líneas Base Vigentes"
              >
                <Lock className="w-3 h-3 text-purple-500" />
                <strong>{stats.lineasVigentes}</strong> Líneas Base
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-white/5 border-white/10 text-slate-300'
                }`}
                title="Solicitudes de Cambio pendientes"
              >
                <GitPullRequest className="w-3 h-3 text-amber-500" />
                <strong>{stats.rfcPendientes}</strong> RFC
              </span>
              {stats.bloqueosActivos > 0 && (
                <Link
                  href="/bitacora"
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md border bg-rose-500/10 border-rose-500/30 text-rose-500 font-semibold"
                >
                  <AlertTriangle className="w-3 h-3" />
                  {stats.bloqueosActivos}
                </Link>
              )}
            </div>

            {proyectoDetalle && (
              <button
                type="button"
                onClick={() => setModalNuevaOpen(true)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5 ${
                  isLight
                    ? 'bg-sky-600 hover:bg-sky-700 text-white'
                    : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nueva Tarea / Entregable</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenAgendarReunion}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition inline-flex items-center gap-1.5 ${
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
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition inline-flex items-center gap-1.5 ${
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

        {/* Navegación de 3 pestañas RUP */}
        <div
          className={`px-3 sm:px-4 border-t flex items-center justify-between gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden ${
            isLight ? 'border-slate-200 bg-slate-50/70' : 'border-white/10 bg-[#13151A]/70'
          }`}
        >
          <div className="flex items-center gap-1">
            {RUP_TABS.map((tab) => {
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
                        ? 'text-sky-700'
                        : 'text-sky-400'
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
                        isLight ? 'bg-sky-600' : 'bg-sky-400'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <span className="hidden xl:inline text-[11px] text-slate-400 whitespace-nowrap">
            {currentTab.hint}
          </span>
        </div>
      </div>

      {/* Contenido de la pestaña activa */}
      {loadingDetalle ? (
        <div className="py-12 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin text-sky-500" />
          <span>Cargando estructura RUP del proyecto...</span>
        </div>
      ) : !proyectoDetalle ? (
        <div
          className={`rounded-xl border p-8 text-center text-xs ${
            isLight ? 'bg-white border-slate-200 text-slate-500' : 'bg-[#181B22] border-white/10 text-slate-400'
          }`}
        >
          No hay un proyecto RUP seleccionado.
        </div>
      ) : (
        <>
          {activeTab === 'FASES' && (
            <div className="space-y-2.5">
              {/* Flujo formal de fases RUP */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] px-1">
                {['Inicio', 'Elaboración', 'Construcción', 'Transición'].map((fase, idx, arr) => (
                  <React.Fragment key={fase}>
                    <span
                      className={`px-2 py-0.5 rounded-md font-semibold border ${
                        isLight
                          ? 'bg-sky-50 border-sky-200 text-sky-700'
                          : 'bg-sky-500/10 border-sky-500/20 text-sky-300'
                      }`}
                    >
                      {idx + 1}. {fase}
                    </span>
                    {idx < arr.length - 1 && <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />}
                  </React.Fragment>
                ))}
              </div>

              <EntregablesDataGrid
                metodologia={metodologia}
                etapas={proyectoDetalle.etapas || []}
                elementosConfig={proyectoDetalle.elementos_config || []}
                onSelectItem={onOpenDrawer}
              />
            </div>
          )}

          {activeTab === 'CRONOGRAMA' && (
            <CronogramaTimelineView
              proyectoId={proyectoDetalle.id}
              metodologia={metodologia}
              etapas={proyectoDetalle.etapas || []}
              actividadesCronograma={proyectoDetalle.actividades_cronograma || []}
              elementosConfig={proyectoDetalle.elementos_config || []}
              isAdmin={isAdmin}
              onRefresh={onRefreshProyecto}
            />
          )}

          {activeTab === 'TRAZABILIDAD' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-slate-400">
                  Trazabilidad RUP por Caso de Uso (SRS → SAD → Implementación → RFCs)
                </span>
                <div className="flex items-center gap-2">
                  <Link
                    href="/reportes/caso-uso"
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                      isLight
                        ? 'bg-white border-slate-200 text-sky-700 hover:bg-sky-50'
                        : 'bg-white/5 border-white/10 text-sky-300 hover:bg-white/10'
                    }`}
                  >
                    Informe Completo
                  </Link>
                  <Link
                    href="/trazabilidad"
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                      isLight
                        ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    Matriz RTM
                  </Link>
                </div>
              </div>

              <ReporteTrazabilidadCasoUso
                proyectoId={proyectoDetalle.id}
                rubro={user.rubro}
              />
            </div>
          )}

          <ModalNuevaActividad
            isOpen={modalNuevaOpen}
            onClose={() => setModalNuevaOpen(false)}
            proyectoId={proyectoDetalle.id}
            etapas={proyectoDetalle.etapas || []}
            elementosConfig={proyectoDetalle.elementos_config || []}
            onCreated={() => {
              setModalNuevaOpen(false);
              onRefreshProyecto();
            }}
          />
        </>
      )}
    </div>
  );
}
