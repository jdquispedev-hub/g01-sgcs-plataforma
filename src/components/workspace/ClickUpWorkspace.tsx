'use client';

import React, { useEffect, useState } from 'react';
import { FolderGit2, Plus } from 'lucide-react';
import { useSgcsTheme } from '@/components/ThemeProvider';
import { ActiveProjectSummary, useActiveProject } from '@/components/ProjectContext';
import NotionSlideOver, { SlideOverItem } from '@/components/NotionSlideOver';
import ScrumWorkspace, { ScrumProyectoDetalle } from '@/components/workspace/ScrumWorkspace';
import RupWorkspace, { RupProyectoDetalle } from '@/components/workspace/RupWorkspace';

export type WorkspaceTab = 'BANDEJA' | 'LISTA' | 'TABLERO' | 'CRONOGRAMA' | 'TRAZABILIDAD';

type ProyectoDetalle = ScrumProyectoDetalle & RupProyectoDetalle;

export interface ClickUpWorkspaceProps {
  user: {
    userId: string;
    nombreCompleto: string;
    rol: string;
    rubro: string;
  };
  proyectos: ActiveProjectSummary[];
  selectedProyectoId: string;
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
  stats,
  onOpenCrearProyecto,
  onOpenAgendarReunion,
}: ClickUpWorkspaceProps) {
  const { theme } = useSgcsTheme();
  const isLight = theme === 'light';
  const isAdmin = user.rol === 'ADMINISTRADOR' || user.rol === 'SUPERADMIN';
  const { selectedProyecto } = useActiveProject();

  const [proyectoDetalle, setProyectoDetalle] = useState<ProyectoDetalle | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);

  // SlideOver Drawer compartido entre metodologías
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

  const handleRefreshProyecto = () => {
    setReloadTick((t) => t + 1);
  };

  if (proyectos.length === 0) {
    return (
      <div
        className={`rounded-2xl border p-8 sm:p-10 text-center flex flex-col items-center justify-center gap-3 ${
          isLight
            ? 'bg-white border-slate-200 text-slate-600 shadow-xs'
            : 'bg-[#181B22] border-white/10 text-slate-300'
        }`}
      >
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
            isLight
              ? 'bg-blue-50 border-blue-200 text-blue-600'
              : 'bg-amber-400/10 border-amber-400/20 text-amber-400'
          }`}
        >
          <FolderGit2 className="w-6 h-6" />
        </div>
        <div className="space-y-1 max-w-md">
          <h2 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            No hay proyectos registrados
          </h2>
          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            {isAdmin
              ? 'Crea tu primer proyecto para habilitar las vistas de trabajo RUP o SCRUM, entregables y trazabilidad.'
              : 'Aún no tienes proyectos activos asignados. Solicita a un administrador crear o asignarte un proyecto.'}
          </p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={onOpenCrearProyecto}
            className={`mt-1 px-4 py-2 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 ${
              isLight
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>+ Nuevo Proyecto</span>
          </button>
        )}
      </div>
    );
  }

  const activeMetodologia =
    proyectoDetalle?.id === selectedProyectoId
      ? proyectoDetalle.metodologia
      : selectedProyecto?.metodologia || proyectoDetalle?.metodologia;

  const detalleActual =
    proyectoDetalle?.id === selectedProyectoId ? proyectoDetalle : null;

  return (
    <>
      {activeMetodologia === 'SCRUM' ? (
        <ScrumWorkspace
          user={user}
          proyectoDetalle={detalleActual}
          loadingDetalle={loadingDetalle}
          stats={stats}
          onOpenCrearProyecto={onOpenCrearProyecto}
          onOpenAgendarReunion={onOpenAgendarReunion}
          onOpenDrawer={handleOpenDrawer}
          onRefreshProyecto={handleRefreshProyecto}
        />
      ) : (
        <RupWorkspace
          user={user}
          proyectoDetalle={detalleActual}
          loadingDetalle={loadingDetalle}
          stats={stats}
          onOpenCrearProyecto={onOpenCrearProyecto}
          onOpenAgendarReunion={onOpenAgendarReunion}
          onOpenDrawer={handleOpenDrawer}
          onRefreshProyecto={handleRefreshProyecto}
        />
      )}

      {/* Drawer Lateral Deslizable */}
      <NotionSlideOver
        item={drawerItem}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        userRol={user.rol}
        onSuccessAction={handleRefreshProyecto}
      />
    </>
  );
}
