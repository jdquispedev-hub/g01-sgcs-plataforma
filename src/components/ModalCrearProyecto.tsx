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
  rubro?: string;
}

export default function ModalCrearProyecto({
  isOpen,
  onClose,
  onProyectoCreado,
  rubro,
}: ModalCrearProyectoProps) {
  const isConstruccion = rubro === 'CONSTRUCCION';
  const isVeterinaria = rubro === 'VETERINARIA';
  const entidadLabel = isConstruccion ? 'Obra / Proyecto' : isVeterinaria ? 'Caso / Campaña' : 'Proyecto';
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
              {isConstruccion ? 'Nueva Obra / Proyecto' : isVeterinaria ? 'Nuevo Caso / Campaña' : 'Nuevo Proyecto'}
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
                  Nombre de {entidadLabel} *
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder={`Ingrese el nombre de ${entidadLabel.toLowerCase()}`}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0F1115] border border-white/10 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-200 block mb-1.5">
                    Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    value={clienteNombre}
                    onChange={(e) => setClienteNombre(e.target.value)}
                    placeholder="Nombre del cliente o propietario"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0F1115] border border-white/10 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden transition"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-200 block mb-1.5">
                    Código (Opcional)
                  </label>
                  <input
                    type="text"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                    placeholder="Se autogenera si se deja vacío"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0F1115] border border-white/10 font-mono text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden transition"
                  />
                </div>
              </div>

              {/* Selector de Metodología */}
              <div>
                <label className="font-semibold text-slate-200 block mb-2">
                  Metodología del Proyecto * (Genera fases limpias automáticamente)
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
                    <div className="font-bold text-white text-sm">Fases Estructuradas</div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Inicio, Elaboración, Construcción y Transición.
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
                      Sprint 0, Sprint 1 y Sprint 2 por iteraciones.
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
                      Análisis, Diseño, Ejecución y Verificación.
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
                  <span>Fases limpias que se crearán:</span>
                  <span className="text-emerald-400">Metodología {metodologia}</span>
                </div>
                {metodologia === 'RUP' && (
                  <ul className="text-xs text-slate-400 space-y-1.5">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      <strong className="text-slate-200">Fase de Inicio:</strong> Visión, alcance inicial y acuerdos base.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      <strong className="text-slate-200">Fase de Elaboración:</strong> Diseño estructural y planificación técnica.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      <strong className="text-slate-200">Fase de Construcción:</strong> Ejecución de entregables y calidad.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      <strong className="text-slate-200">Fase de Transición:</strong> Validación final y cierre.
                    </li>
                  </ul>
                )}
                {metodologia === 'SCRUM' && (
                  <ul className="text-xs text-slate-400 space-y-1.5">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      <strong className="text-slate-200">Sprint 0:</strong> Planificación inicial y alcance base.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      <strong className="text-slate-200">Sprint 1:</strong> Ejecución principal de entregables.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      <strong className="text-slate-200">Sprint 2:</strong> Integración, revisión y cierre.
                    </li>
                  </ul>
                )}
                {metodologia === 'CASCADA' && (
                  <ul className="text-xs text-slate-400 space-y-1.5">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <strong className="text-slate-200">Etapa 1:</strong> Análisis y levantamiento.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <strong className="text-slate-200">Etapa 2:</strong> Diseño y planificación.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <strong className="text-slate-200">Etapa 3:</strong> Ejecución e implementación.
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
