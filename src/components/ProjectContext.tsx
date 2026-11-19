'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

export type MetodologiaProyecto = 'RUP' | 'SCRUM' | 'CASCADA';

export interface ActiveProjectSummary {
  id: string;
  codigo: string;
  nombre: string;
  metodologia: MetodologiaProyecto;
  cliente_nombre: string;
  estado: string;
  descripcion?: string | null;
}

interface ProjectContextValue {
  proyectos: ActiveProjectSummary[];
  selectedProyectoId: string;
  setSelectedProyectoId: (id: string) => void;
  selectedProyecto: ActiveProjectSummary | null;
  refreshProyectos: () => Promise<void>;
  isLoading: boolean;
}

const STORAGE_KEY = 'sgcs-active-proyecto-id';

const ProjectContext = createContext<ProjectContextValue>({
  proyectos: [],
  selectedProyectoId: '',
  setSelectedProyectoId: () => {},
  selectedProyecto: null,
  refreshProyectos: async () => {},
  isLoading: false,
});

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [selectedProyectoId, setSelectedProyectoIdState] = useState<string>('');
  const [hydrated, setHydrated] = useState(false);

  const { data, isLoading, mutate } = useSWR('/api/proyectos', fetcher, {
    revalidateOnFocus: false,
  });

  const proyectos: ActiveProjectSummary[] = useMemo(() => {
    if (!data?.success || !Array.isArray(data.data)) return [];
    return data.data.map((p: any) => ({
      id: p.id,
      codigo: p.codigo,
      nombre: p.nombre,
      metodologia: (p.metodologia as MetodologiaProyecto) || 'RUP',
      cliente_nombre: p.cliente_nombre || '',
      estado: p.estado || 'ACTIVO',
      descripcion: p.descripcion ?? null,
    }));
  }, [data]);

  // Hidratar selección guardada desde localStorage en cliente
  useEffect(() => {
    try {
      const savedId = window.localStorage.getItem(STORAGE_KEY) || '';
      if (savedId) {
        setSelectedProyectoIdState(savedId);
      }
    } catch {
      // Ignorar errores de localStorage en modo privado
    } finally {
      setHydrated(true);
    }
  }, []);

  // Garantizar que siempre haya un proyecto válido seleccionado si existen proyectos
  useEffect(() => {
    if (!hydrated || proyectos.length === 0) return;
    const exists = proyectos.some((p) => p.id === selectedProyectoId);
    if (!selectedProyectoId || !exists) {
      const fallbackId = proyectos[0].id;
      setSelectedProyectoIdState(fallbackId);
      try {
        window.localStorage.setItem(STORAGE_KEY, fallbackId);
      } catch {
        // Ignorar errores de almacenamiento
      }
    }
  }, [hydrated, proyectos, selectedProyectoId]);

  const setSelectedProyectoId = useCallback((id: string) => {
    setSelectedProyectoIdState(id);
    try {
      if (id) {
        window.localStorage.setItem(STORAGE_KEY, id);
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignorar errores de almacenamiento
    }
  }, []);

  const selectedProyecto = useMemo(() => {
    if (proyectos.length === 0) return null;
    return proyectos.find((p) => p.id === selectedProyectoId) || proyectos[0] || null;
  }, [proyectos, selectedProyectoId]);

  const refreshProyectos = useCallback(async () => {
    await mutate();
  }, [mutate]);

  const value = useMemo(
    () => ({
      proyectos,
      selectedProyectoId: selectedProyecto?.id || selectedProyectoId,
      setSelectedProyectoId,
      selectedProyecto,
      refreshProyectos,
      isLoading,
    }),
    [proyectos, selectedProyecto, selectedProyectoId, setSelectedProyectoId, refreshProyectos, isLoading]
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useActiveProject() {
  return useContext(ProjectContext);
}
