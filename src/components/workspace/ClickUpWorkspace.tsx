'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Inbox,
  ListTree,
  Kanban,
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
  Sparkles,
} from 'lucide-react';
import { useSgcsTheme } from '@/components/ThemeProvider';
import BandejaAsignacionesUsuario from '@/components/BandejaAsignacionesUsuario';
import EntregablesDataGrid, {
  WorkspaceEcsItem,
  WorkspaceEtapa,
} from '@/components/workspace/EntregablesDataGrid';
import JiraBoardView from '@/components/workspace/JiraBoardView';
import CronogramaTimelineView from '@/components/workspace/CronogramaTimelineView';
import ReporteTrazabilidadCasoUso from '@/components/ReporteTrazabilidadCasoUso';
import NotionSlideOver, { SlideOverItem } from '@/components/NotionSlideOver';

export type WorkspaceTab = 'BANDEJA' | 'LISTA' | 'TABLERO' | 'CRONOGRAMA' | 'TRAZABILIDAD';

interface ProyectoResumen {
  id: string;
  codigo: string;
  nombre: string;
  cliente_nombre?: string;
  estado?: string;
}

interface ProyectoDetalle extends ProyectoResumen {
  metodologia: string;
  etapas: WorkspaceEtapa[];
  actividades_cronograma?: any[];
  elementos_config: WorkspaceEcsItem[];
  lineas_base: any[];
  reuniones: any[];
}

interface ClickUpWorkspaceProps {
  user: {
    userId: string;
    nombreCompleto: string;
    rol: string;
    rubro: string;
  };
  proyectos: ProyectoResumen[];
  selectedProyectoId: string;
  onSelectProyecto: (id: string) => void;
  stats: {
    totalEcs: number;
    versionesPendientes: number;
    lineasVigentes: number;
    rfcPendientes: number;
    bloqueosActivos: number;
  };
  onOpenCrearProyecto: () => void;
  onOpenAgendarReunion: () => void;
}

export default function ClickUpWorkspace({
  user,
  proyectos,
  selectedProyectoId,
  onSelectProyecto,
  stats,
  onOpenCrearProyecto,
  onOpenAgendarReunion,
}: ClickUpWorkspaceProps) {
  const { theme } = useSgcsTheme();
  const isLight = theme === 'light';
  const isAdmin = user.rol === 'ADMINISTRADOR' || user.rol === 'SUPERADMIN';

  const [activeTab, setActiveTab] = useState<WorkspaceTab>(
    user.rol === 'SOLICITANTE' ? 'BANDEJA' : 'LISTA'
  );
  const [proyectoDetalle, setProyectoDetalle] = useState<ProyectoDetalle | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);

  // SlideOver Drawer
  const [drawerItem, setDrawerItem] = useState<SlideOverItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!selectedProyectoId) {
      setProyectoDetalle(null);
      return;
    }
    let cancelled = false;
    setLoadingDetalle(true);
    fetch(`/api/proyectos?id=${selectedProyectoId}`)
      .then((r) => r.json())
      .then((res) => {
        if (!cancelled && res?.success && res.data) {
          setProyectoDetalle(res.data);
        }
      })
      .catch((err) => console.error('Error cargando detalle del proyecto:', err))
      .finally(() => {
        if (!cancelled) setLoadingDetalle(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedProyectoId, reloadTick]);

  const handleOpenDrawer = (item: SlideOverItem) => {
    setDrawerItem(item);
    setDrawerOpen(true);
  };

  const metodologia = proyectoDetalle?.metodologia || 'RUP';
  const metodologiaBadgeClass =
    metodologia === 'SCRUM'
      ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
      : metodologia === 'CASCADA'
      ? 'bg-purple-500/15 text-purple-500 border-purple-500/30'
      : 'bg-sky-500/15 text-sky-500 border-sky-500/30';

  const tabs: { id: WorkspaceTab; step: number; label: string; hint: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'BANDEJA', step: 1, label: '1. Mi Bandeja', hint: 'Acepta o rechaza tus asignaciones', icon: Inbox },
    { id: 'LISTA', step: 2, label: '2. Entregables', hint: `Fases paso a paso (${metodologia})`, icon: ListTree },
    { id: 'TABLERO', step: 3, label: '3. Tablero Jira', hint: 'Flujo visual por estado', icon: Kanban },
    { id: 'CRONOGRAMA', step: 4, label: '4. Cronograma', hint: 'Fechas y avance por fase', icon: CalendarDays },
    { id: 'TRAZABILIDAD', step: 5, label: '5. Trazabilidad', hint: 'Informe por Caso de Uso', icon: Network },
  ];

  const activeTabIndex = tabs.findIndex((t) => t.id === activeTab);
  const currentTabInfo = tabs[activeTabIndex] || tabs[0];

  return (
    <div className="space-y-4">
      {/* Cabecera Compacta del Proyecto + Métricas + View Switcher */}
      <div
        className={`rounded-2xl border overflow-hidden transition-colors ${
          isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#181B22] border-white/10'
        }`}
      >
        {/* Fila superior: Selector de proyecto, metodología y acciones */}
        <div className="px-4 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 min-w-0">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${
                isLight
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'bg-amber-400/10 border-amber-400/20 text-amber-400'
              }`}
            >
              <FolderGit2 className="w-4 h-4" />
            </div>

            {proyectos.length > 0 ? (
              <select
                value={selectedProyectoId}
                onChange={(e) => onSelectProyecto(e.target.value)}
                className={`text-sm font-bold rounded-lg px-2.5 py-1.5 border outline-none cursor-pointer max-w-[260px] sm:max-w-[340px] truncate ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'
                    : 'bg-[#13151A] border-white/10 text-white focus:border-amber-400/50'
                }`}
              >
                {proyectos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.codigo} • {p.nombre}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-sm font-bold">Sin proyectos registrados</span>
            )}

            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${metodologiaBadgeClass}`}>
              Metodología: {metodologia}
            </span>

            {proyectoDetalle?.cliente_nombre && (
              <span className="text-xs text-slate-400 hidden sm:inline truncate max-w-[200px]">
                Cliente: <strong className={isLight ? 'text-slate-700' : 'text-slate-200'}>{proyectoDetalle.cliente_nombre}</strong>
              </span>
            )}
          </div>

          {/* Métricas en píldoras discretas + Acciones */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-[11px] mr-1">
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-white/5 border-white/10 text-slate-300'
                }`}
                title="Total de Elementos de Configuración"
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
                <strong>{stats.lineasVigentes}</strong> LB
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
                  {stats.bloqueosActivos} Bloqueo(s)
                </Link>
              )}
            </div>

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
              <span className="hidden sm:inline">Minuta</span>
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={onOpenCrearProyecto}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
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

        {/* Barra de Vistas Superior tipo Stepper Guiado */}
        <div
          className={`px-3 sm:px-4 border-t flex items-center justify-between gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden ${
            isLight ? 'border-slate-200 bg-slate-50/60' : 'border-white/10 bg-[#13151A]/60'
          }`}
        >
          <div className="flex items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-3 py-2.5 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                    isActive
                      ? isLight
                        ? 'text-blue-600'
                        : 'text-amber-400'
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
                        isLight ? 'bg-blue-600' : 'bg-amber-400'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="hidden xl:flex items-center gap-2 text-[11px] text-slate-400 shrink-0">
            <span>{currentTabInfo.hint}</span>
            <button
              type="button"
              disabled={activeTabIndex <= 0}
              onClick={() => setActiveTab(tabs[activeTabIndex - 1].id)}
              className="px-2 py-1 rounded border border-white/10 hover:bg-white/5 disabled:opacity-30 transition"
            >
              ←
            </button>
            <button
              type="button"
              disabled={activeTabIndex >= tabs.length - 1}
              onClick={() => setActiveTab(tabs[activeTabIndex + 1].id)}
              className="px-2 py-1 rounded border border-white/10 hover:bg-white/5 disabled:opacity-30 transition"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Contenido de la Vista Activa */}
      {activeTab === 'BANDEJA' && (
        <BandejaAsignacionesUsuario />
      )}

      {activeTab === 'LISTA' && (
        loadingDetalle ? (
          <div className="py-12 flex items-center justify-center gap-2 text-xs text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            <span>Cargando estructura de metodología ({metodologia})...</span>
          </div>
        ) : (
          <EntregablesDataGrid
            metodologia={metodologia}
            etapas={proyectoDetalle?.etapas || []}
            elementosConfig={proyectoDetalle?.elementos_config || []}
            onSelectItem={handleOpenDrawer}
          />
        )
      )}

      {activeTab === 'TABLERO' && (
        loadingDetalle ? (
          <div className="py-12 flex items-center justify-center gap-2 text-xs text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            <span>Cargando tablero del proyecto ({metodologia})...</span>
          </div>
        ) : (
          <JiraBoardView
            metodologia={metodologia}
            etapas={proyectoDetalle?.etapas || []}
            elementosConfig={proyectoDetalle?.elementos_config || []}
            onSelectItem={handleOpenDrawer}
          />
        )
      )}

      {activeTab === 'CRONOGRAMA' && (
        loadingDetalle ? (
          <div className="py-12 flex items-center justify-center gap-2 text-xs text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            <span>Cargando cronograma ({metodologia})...</span>
          </div>
        ) : (
          <CronogramaTimelineView
            proyectoId={selectedProyectoId}
            metodologia={metodologia}
            etapas={proyectoDetalle?.etapas || []}
            actividadesCronograma={proyectoDetalle?.actividades_cronograma || []}
            elementosConfig={proyectoDetalle?.elementos_config || []}
            isAdmin={isAdmin}
            onRefresh={() => setReloadTick((t) => t + 1)}
          />
        )
      )}

      {activeTab === 'TRAZABILIDAD' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-slate-400">
              Informe de trazabilidad por Caso de Uso (SRS → SAD → Implementación → RFCs)
            </span>
            <div className="flex items-center gap-2">
              <Link
                href="/reportes/caso-uso"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  isLight ? 'bg-white border-slate-200 text-blue-600 hover:bg-blue-50' : 'bg-white/5 border-white/10 text-amber-300 hover:bg-white/10'
                }`}
              >
                Abrir Informe Completo
              </Link>
              <Link
                href="/trazabilidad"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  isLight ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
                }`}
              >
                Matriz RTM
              </Link>
            </div>
          </div>
          <ReporteTrazabilidadCasoUso
            proyectoId={selectedProyectoId}
            rubro={user.rubro}
          />
        </div>
      )}

      {/* Drawer Lateral Deslizable */}
      <NotionSlideOver
        item={drawerItem}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        userRol={user.rol}
        onSuccessAction={() => setReloadTick((t) => t + 1)}
      />
    </div>
  );
}
