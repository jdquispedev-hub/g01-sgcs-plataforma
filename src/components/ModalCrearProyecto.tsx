'use client';

import { useState } from 'react';
import {
  X,
  Layers,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Flame,
  GitBranch,
  Building,
  User,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { MetodologiaProyecto } from '@prisma/client';

interface ModalCrearProyectoProps {
  isOpen: boolean;
  onClose: () => void;
  onProyectoCreado: (nuevoProyecto: any) => void;
}

export default function ModalCrearProyecto({
  isOpen,
  onClose,
  onProyectoCreado,
}: ModalCrearProyectoProps) {
  const [paso, setPaso] = useState<1 | 2>(1);

  // Form states
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [clienteNombre, setClienteNombre] = useState('');
  const [metodologia, setMetodologia] = useState<MetodologiaProyecto>('RUP');
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
  const [fechaFin, setFechaFin] = useState(
    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !clienteNombre.trim()) {
      setError('Por favor complete el nombre del proyecto y del cliente.');
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
        setLoading(false);
        return;
      }

      onProyectoCreado(data.data);
      onClose();
    } catch {
      setError('Error de conexión con el servidor al registrar el proyecto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#16181D] border border-white/10 text-slate-100 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                Vista de Gerente / Administrador
              </span>
              <span className="text-xs text-slate-400">Paso {paso} de 2</span>
            </div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Nuevo Proyecto & Cronograma Automático
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-sm">
          {paso === 1 ? (
            /* PASO 1: DATOS Y METODOLOGÍA */
            <div className="space-y-4">
              <div>
                <label className="font-semibold text-slate-200 block mb-1.5">
                  Nombre del Proyecto *
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Sistema de Gestión de Configuración de Software"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0F1115] border border-white/10 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-200 block mb-1.5">
                    Cliente / Organización Patrocinadora *
                  </label>
                  <input
                    type="text"
                    required
                    value={clienteNombre}
                    onChange={(e) => setClienteNombre(e.target.value)}
                    placeholder="Ej: Universidad / Empresa Cliente"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0F1115] border border-white/10 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden transition"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-200 block mb-1.5">
                    Código del Proyecto (Opcional)
                  </label>
                  <input
                    type="text"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                    placeholder="Ej: PRY-2026-01 (Auto si está vacío)"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0F1115] border border-white/10 font-mono text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden transition"
                  />
                </div>
              </div>

              {/* Selector de Metodología */}
              <div>
                <label className="font-semibold text-slate-200 block mb-2">
                  Metodología de Desarrollo * (Genera etapas y ECS automáticamente)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Tarjeta RUP */}
                  <div
                    onClick={() => setMetodologia('RUP')}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                      metodologia === 'RUP'
                        ? 'bg-purple-500/10 border-purple-500/50 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500'
                        : 'bg-[#0F1115] border-white/5 hover:border-white/20 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                        RUP
                      </span>
                      {metodologia === 'RUP' && (
                        <CheckCircle2 className="w-4 h-4 text-purple-400" />
                      )}
                    </div>
                    <div className="font-bold text-white text-sm">Rational Unified</div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Fases: Inicio, Elaboración, Construcción, Transición.
                    </p>
                  </div>

                  {/* Tarjeta SCRUM */}
                  <div
                    onClick={() => setMetodologia('SCRUM')}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                      metodologia === 'SCRUM'
                        ? 'bg-cyan-500/10 border-cyan-500/50 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500'
                        : 'bg-[#0F1115] border-white/5 hover:border-white/20 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                        SCRUM
                      </span>
                      {metodologia === 'SCRUM' && (
                        <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      )}
                    </div>
                    <div className="font-bold text-white text-sm">Ágil / Sprints</div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Product Backlog, Sprint 1, Sprint 2 e Incrementos.
                    </p>
                  </div>

                  {/* Tarjeta CASCADA */}
                  <div
                    onClick={() => setMetodologia('CASCADA')}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                      metodologia === 'CASCADA'
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500'
                        : 'bg-[#0F1115] border-white/5 hover:border-white/20 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                        CASCADA
                      </span>
                      {metodologia === 'CASCADA' && (
                        <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                    <div className="font-bold text-white text-sm">Secuencial Clásico</div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Análisis, Diseño, Codificación y Pruebas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* PASO 2: CRONOGRAMA & PREVIEW DE ETAPAS */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Rango del Cronograma del Proyecto
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Fecha de Inicio *</label>
                    <input
                      type="date"
                      required
                      value={fechaInicio}
                      onChange={(e) => setFechaInicio(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#0F1115] border border-white/10 text-white text-xs focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Fecha Estimada de Fin *
                    </label>
                    <input
                      type="date"
                      required
                      value={fechaFin}
                      onChange={(e) => setFechaFin(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#0F1115] border border-white/10 text-white text-xs focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Vista previa de lo que se autogenerará */}
              <div className="rounded-2xl bg-[#0F1115] border border-white/10 p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span>Etapas y Entregables que se sembrarán:</span>
                  <span className="text-emerald-400">Metodología {metodologia}</span>
                </div>
                {metodologia === 'RUP' && (
                  <ul className="text-xs text-slate-400 space-y-1.5">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      <strong className="text-slate-200">Inicio:</strong> ECS-SRS (Requisitos IEEE 830), Visión.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      <strong className="text-slate-200">Elaboración:</strong> ECS-SAD (Arquitectura 4+1), Base de Datos.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      <strong className="text-slate-200">Construcción:</strong> Código Backend, Frontend, Casos de Prueba.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      <strong className="text-slate-200">Transición:</strong> Manual de Usuario y Despliegue.
                    </li>
                  </ul>
                )}
                {metodologia === 'SCRUM' && (
                  <ul className="text-xs text-slate-400 space-y-1.5">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      <strong className="text-slate-200">Sprint 0:</strong> Product Backlog, Spike Arquitectónico.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      <strong className="text-slate-200">Sprint 1:</strong> Módulos Core, APIs y UI Base.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      <strong className="text-slate-200">Sprint 2:</strong> Incremento Final, Testing y Release.
                    </li>
                  </ul>
                )}
                {metodologia === 'CASCADA' && (
                  <ul className="text-xs text-slate-400 space-y-1.5">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <strong className="text-slate-200">Análisis:</strong> SRS y especificaciones.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <strong className="text-slate-200">Diseño:</strong> SAD y Modelado Relacional.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <strong className="text-slate-200">Implementación:</strong> Código Fuente integral.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <strong className="text-slate-200">QA & Despliegue:</strong> Pruebas y Manuales.
                    </li>
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Botones de navegación y Submit */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            {paso === 2 ? (
              <button
                type="button"
                onClick={() => setPaso(1)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Atrás
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                Cancelar
              </button>
              {paso === 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!nombre.trim() || !clienteNombre.trim()) {
                      setError('Por favor complete el nombre y cliente antes de continuar.');
                      return;
                    }
                    setError('');
                    setPaso(2);
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition flex items-center gap-2"
                >
                  Siguiente (Cronograma)
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Generando Proyecto...' : 'Crear Proyecto & Cronograma'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
