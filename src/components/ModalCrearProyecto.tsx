'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useSgcsTheme } from '@/components/ThemeProvider';

interface ModalCrearProyectoProps {
  isOpen: boolean;
  onClose: () => void;
  onProyectoCreado: (nuevoProyecto: any) => void;
  rubro?: string;
}

export default function ModalCrearProyecto({
  isOpen,
  onClose,
  onProyectoCreado,
  rubro,
}: ModalCrearProyectoProps) {
  const { theme } = useSgcsTheme();
  const isLight = theme === 'light';
  const isConstruccion = rubro === 'CONSTRUCCION';
  const isVeterinaria = rubro === 'VETERINARIA';
  const entidadLabel = isConstruccion ? 'Obra / Proyecto' : isVeterinaria ? 'Caso / Campaña' : 'Proyecto';

  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [clienteNombre, setClienteNombre] = useState('');
  const [metodologia, setMetodologia] = useState<'RUP' | 'SCRUM'>('RUP');
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
  const [fechaFin, setFechaFin] = useState(
    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !clienteNombre.trim()) {
      setError('Por favor complete el nombre y el cliente.');
      return;
    }
    if (fechaInicio && fechaFin && new Date(fechaFin) < new Date(fechaInicio)) {
      setError('La fecha estimada de fin no puede ser anterior a la fecha de inicio.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/proyectos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo: codigo.trim().toUpperCase() || undefined,
          nombre: nombre.trim(),
          cliente_nombre: clienteNombre.trim(),
          metodologia,
          fecha_inicio: fechaInicio,
          fecha_estimada_fin: fechaFin,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Error al crear el proyecto');
        return;
      }

      setCodigo('');
      setNombre('');
      setClienteNombre('');
      onProyectoCreado(data.data);
      onClose();
    } catch {
      setError('Error de conexión con el servidor al registrar el proyecto.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full px-3.5 py-2 rounded-xl border text-xs outline-none transition ${
    isLight
      ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500'
      : 'bg-[#0F1115] border-white/10 text-white placeholder-slate-500 focus:border-amber-400/60'
  }`;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div
        className={`rounded-2xl border max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4 my-6 ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#16181D] border-white/10 text-slate-100'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{isConstruccion ? 'Nueva Obra / Proyecto' : isVeterinaria ? 'Nuevo Caso / Campaña' : 'Nuevo Proyecto'}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition"
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold block mb-1">Nombre de {entidadLabel} *</label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder={`Ingrese el nombre de ${entidadLabel.toLowerCase()}`}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1">Cliente *</label>
              <input
                type="text"
                required
                value={clienteNombre}
                onChange={(e) => setClienteNombre(e.target.value)}
                placeholder="Nombre del cliente o propietario"
                className={inputClass}
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Código (Opcional)</label>
              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                placeholder="Se autogenera si se deja vacío"
                className={`${inputClass} font-mono`}
              />
            </div>
          </div>

          {/* Fechas directamente visibles y editables en el mismo paso */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1">Fecha de Inicio *</label>
              <input
                type="date"
                required
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                style={{ colorScheme: isLight ? 'light' : 'dark' }}
                className={inputClass}
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Fecha Estimada de Fin *</label>
              <input
                type="date"
                required
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                style={{ colorScheme: isLight ? 'light' : 'dark' }}
                className={inputClass}
              />
            </div>
          </div>

          {/* Selector de Metodología (Únicamente RUP y SCRUM) */}
          <div>
            <label className="font-semibold block mb-1.5">Metodología del Proyecto *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setMetodologia('RUP')}
                className={`text-left p-3 rounded-xl border transition-all ${
                  metodologia === 'RUP'
                    ? 'bg-indigo-500/15 border-indigo-500 ring-1 ring-indigo-500'
                    : isLight
                    ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    : 'bg-[#0F1115] border-white/10 hover:border-white/25'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">RUP</span>
                  {metodologia === 'RUP' && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                </div>
                <div className="font-bold text-xs">Fases Estructuradas</div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Inicio, Elaboración, Construcción y Transición.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setMetodologia('SCRUM')}
                className={`text-left p-3 rounded-xl border transition-all ${
                  metodologia === 'SCRUM'
                    ? 'bg-emerald-500/15 border-emerald-500 ring-1 ring-emerald-500'
                    : isLight
                    ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    : 'bg-[#0F1115] border-white/10 hover:border-white/25'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">SCRUM</span>
                  {metodologia === 'SCRUM' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
                <div className="font-bold text-xs">Ágil / Sprints</div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Sprint 0, Sprint 1 y Sprint 2 por iteraciones.
                </p>
              </button>
            </div>
          </div>

          {/* Botones */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 font-semibold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 rounded-xl font-bold transition disabled:opacity-50 ${
                isLight ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
              }`}
            >
              {loading ? 'Creando Proyecto...' : 'Crear Proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
