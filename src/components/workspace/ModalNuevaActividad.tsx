'use client';

import React, { useEffect, useState } from 'react';
import { X, CalendarPlus, Loader2, AlertTriangle, User, Layers, Tag } from 'lucide-react';
import { useSgcsTheme } from '@/components/ThemeProvider';
import { WorkspaceEcsItem, WorkspaceEtapa } from '@/components/workspace/EntregablesDataGrid';

interface UsuarioOption {
  id: string;
  nombre_completo: string;
  cargo?: string | null;
  rol?: string;
}

interface ModalNuevaActividadProps {
  isOpen: boolean;
  onClose: () => void;
  proyectoId: string;
  etapas: WorkspaceEtapa[];
  elementosConfig: WorkspaceEcsItem[];
  defaultEtapaId?: string;
  onCreated: () => void;
}

export default function ModalNuevaActividad({
  isOpen,
  onClose,
  proyectoId,
  etapas,
  elementosConfig,
  defaultEtapaId,
  onCreated,
}: ModalNuevaActividadProps) {
  const { theme } = useSgcsTheme();
  const isLight = theme === 'light';

  const [etapaId, setEtapaId] = useState(defaultEtapaId || etapas[0]?.id || '');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [responsableId, setResponsableId] = useState('');
  const [ecsId, setEcsId] = useState('');
  const [codigoCasoUso, setCodigoCasoUso] = useState('CU01');
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
  const [fechaFin, setFechaFin] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const [usuarios, setUsuarios] = useState<UsuarioOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setEtapaId(defaultEtapaId || etapas[0]?.id || '');
    setError('');
    fetch('/api/auxiliares')
      .then((r) => r.json())
      .then((res) => {
        if (res?.success && Array.isArray(res.data?.usuarios)) {
          setUsuarios(res.data.usuarios);
        }
      })
      .catch(() => {});
  }, [isOpen, defaultEtapaId, etapas]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      setError('Ingrese el nombre o título de la tarea.');
      return;
    }
    if (new Date(fechaFin) < new Date(fechaInicio)) {
      setError('La fecha de fin no puede ser anterior a la fecha de inicio.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/cronograma/actividades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proyecto_id: proyectoId,
          etapa_id: etapaId || null,
          titulo: titulo.trim(),
          descripcion: descripcion.trim() || undefined,
          codigo_caso_uso: codigoCasoUso.trim().toUpperCase() || 'CU01',
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          responsable_id: responsableId || null,
          ecs_id: ecsId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'No se pudo registrar la tarea.');
        return;
      }

      setTitulo('');
      setDescripcion('');
      setResponsableId('');
      setEcsId('');
      onCreated();
      onClose();
    } catch {
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div
        className={`rounded-2xl border max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 my-6 ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#16181D] border-white/10 text-slate-100'
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <CalendarPlus className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold">Nueva Tarea y Asignación en Cronograma</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {etapas.length > 0 && (
            <div>
              <label className="font-semibold block mb-1">Fase / Etapa del Proyecto</label>
              <select
                value={etapaId}
                onChange={(e) => setEtapaId(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border outline-none ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[#0F1115] border-white/10 text-white'
                }`}
              >
                {etapas.map((et) => (
                  <option key={et.id} value={et.id}>
                    {et.nombre} ({et.fase})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="font-semibold block mb-1">Título de la Tarea / Actividad *</label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Levantamiento de planos eléctricos Piso 1-3"
              className={`w-full px-3 py-2 rounded-xl border outline-none ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[#0F1115] border-white/10 text-white'
              }`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1">Fecha de Inicio *</label>
              <input
                type="date"
                required
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border outline-none ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[#0F1115] border-white/10 text-white'
                }`}
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Fecha Estimada de Fin *</label>
              <input
                type="date"
                required
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border outline-none ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[#0F1115] border-white/10 text-white'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-amber-400" />
                Asignar a Responsable
              </label>
              <select
                value={responsableId}
                onChange={(e) => setResponsableId(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border outline-none ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[#0F1115] border-white/10 text-white'
                }`}
              >
                <option value="">-- Sin asignar por ahora --</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre_completo} {u.cargo ? `(${u.cargo})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-sky-400" />
                Código / Caso de Uso (Opcional)
              </label>
              <input
                type="text"
                value={codigoCasoUso}
                onChange={(e) => setCodigoCasoUso(e.target.value.toUpperCase())}
                placeholder="CU01"
                className={`w-full px-3 py-2 rounded-xl border font-mono outline-none ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[#0F1115] border-white/10 text-white'
                }`}
              />
            </div>
          </div>

          {elementosConfig.length > 0 && (
            <div>
              <label className="font-semibold mb-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-teal-400" />
                Vincular a Entregable ECS (Opcional)
              </label>
              <select
                value={ecsId}
                onChange={(e) => setEcsId(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border outline-none ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[#0F1115] border-white/10 text-white'
                }`}
              >
                <option value="">-- Ninguno / Solo tarea de cronograma --</option>
                {elementosConfig.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.codigo} • {e.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="font-semibold block mb-1">Instrucciones / Descripción (Opcional)</label>
            <textarea
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Detalles para el responsable..."
              className={`w-full px-3 py-2 rounded-xl border outline-none resize-none ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[#0F1115] border-white/10 text-white'
              }`}
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition disabled:opacity-50 ${
                isLight ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
              }`}
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Crear y Asignar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
