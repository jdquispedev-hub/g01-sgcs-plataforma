'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  User,
  Plus,
  FolderGit2,
  ArrowLeft,
  X,
  Send,
  Loader2,
  Clock,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import NavbarPrincipal from '@/components/NavbarPrincipal';

interface ReporteItem {
  id: string;
  fecha: string;
  resumen_actividades: string;
  tiene_bloqueo: boolean;
  detalle_bloqueo: string | null;
  created_at: string;
  proyecto: {
    id: string;
    codigo: string;
    nombre: string;
  };
  usuario: {
    id: string;
    nombre_completo: string;
    email: string;
    rol: string;
  };
}

interface ProyectoAux {
  id: string;
  codigo: string;
  nombre: string;
}

export default function BitacoraPage() {
  const [reportes, setReportes] = useState<ReporteItem[]>([]);
  const [proyectos, setProyectos] = useState<ProyectoAux[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [proyectoFiltro, setProyectoFiltro] = useState('');
  const [soloBloqueos, setSoloBloqueos] = useState(false);

  // Estados del formulario de nuevo reporte
  const [nuevoProyectoId, setNuevoProyectoId] = useState('');
  const [resumen, setResumen] = useState('');
  const [tieneBloqueo, setTieneBloqueo] = useState(false);
  const [detalleBloqueo, setDetalleBloqueo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/bitacora', window.location.origin);
      if (proyectoFiltro) url.searchParams.set('proyectoId', proyectoFiltro);
      if (soloBloqueos) url.searchParams.set('soloBloqueos', 'true');

      const [resBitacora, resAux] = await Promise.all([
        fetch(url.toString()),
        fetch('/api/auxiliares'),
      ]);

      const dataBitacora = await resBitacora.json();
      const dataAux = await resAux.json();

      if (dataBitacora.success) setReportes(dataBitacora.data);
      if (dataAux.success) {
        setProyectos(dataAux.data.proyectos);
        if (dataAux.data.proyectos.length > 0 && !nuevoProyectoId) {
          setNuevoProyectoId(dataAux.data.proyectos[0].id);
        }
      }
    } catch (err) {
      console.error('Error al cargar bitácora:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [proyectoFiltro, soloBloqueos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (tieneBloqueo && (!detalleBloqueo.trim() || detalleBloqueo.trim().length < 5)) {
      setErrorMsg('Debe especificar detalladamente el motivo del bloqueo crítico');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/bitacora', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proyecto_id: nuevoProyectoId,
          resumen_actividades: resumen.trim(),
          tiene_bloqueo: tieneBloqueo,
          detalle_bloqueo: tieneBloqueo ? detalleBloqueo.trim() : null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Error al guardar el reporte');
        setSubmitting(false);
        return;
      }

      setSuccessMsg(data.message);
      setResumen('');
      setTieneBloqueo(false);
      setDetalleBloqueo('');
      setModalOpen(false);
      loadData();
    } catch {
      setErrorMsg('Error de conexión al enviar el reporte');
    } finally {
      setSubmitting(false);
    }
  };

  const totalBloqueosActivos = reportes.filter((r) => r.tiene_bloqueo).length;

  return (
    <div className="min-h-screen bg-[#13151A] text-slate-100 flex flex-col antialiased">
      {/* Navbar Global Unificado */}
      <NavbarPrincipal />

      {/* Sub-header contextual */}
      <div className="bg-[#16181D] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Bitácora Diaria de Campo
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 uppercase tracking-wider">
                  Etapa 4 • Bloqueos
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Reportes diarios de cuadrilla y alerta gerencial inmediata
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-upt-gold to-amber-400 hover:brightness-110 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Reportar Jornada</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6">
        
        {/* Banner de Retroalimentación de Envío */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Banner de Concepto de la Etapa 4 */}
        <div className="bg-[#1A1D25] rounded-2xl p-5 sm:p-6 text-white border border-white/10 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Activity className="w-4 h-4" />
              <span>Etapa 4 del Patrón Universal: Bitácora & Bloqueos</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Cero Sorpresas: Visibilidad en Tiempo Real
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Los técnicos y cuadrillas registran su avance al finalizar el turno. Si un trabajo se detiene por falta de insumos, especificaciones o aprobaciones, se activa la alerta de bloqueo para que la gerencia intervenga de inmediato.
            </p>
          </div>

          <div className="bg-[#14161E] p-4 rounded-xl border border-white/10 shrink-0 text-center sm:w-48">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Bloqueos Registrados</span>
            <span className={`text-2xl font-bold mt-1 block ${totalBloqueosActivos > 0 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
              {totalBloqueosActivos} {totalBloqueosActivos === 1 ? 'Activo' : 'Activos'}
            </span>
          </div>
        </div>

        {/* Filtros Rápidos */}
        <div className="bg-[#1A1D25] p-4 sm:p-5 rounded-2xl border border-white/10 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-amber-400" />
            <select
              value={proyectoFiltro}
              onChange={(e) => setProyectoFiltro(e.target.value)}
              className="px-3 py-1.5 bg-[#14161E] border border-white/10 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-amber-400/50 transition cursor-pointer"
            >
              <option value="">Todos los Proyectos</option>
              {proyectos.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#1A1D25] text-white">
                  {p.codigo} - {p.nombre}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setSoloBloqueos(!soloBloqueos)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border self-start sm:self-auto ${
              soloBloqueos
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{soloBloqueos ? 'Mostrando Solo Bloqueos' : 'Filtrar Solo Bloqueos'}</span>
          </button>
        </div>

        {/* Lista de Tarjetas de Bitácora */}
        {loading ? (
          <div className="p-16 text-center bg-[#1A1D25] rounded-2xl border border-white/10 shadow-md">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-3" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Consultando reportes de bitácora...
            </p>
          </div>
        ) : reportes.length === 0 ? (
          <div className="bg-[#1A1D25] rounded-2xl border border-white/10 p-12 text-center shadow-md">
            <Activity className="w-10 h-10 text-slate-500 mx-auto mb-2" />
            <h3 className="font-bold text-white text-base">No hay reportes de bitácora registrados</h3>
            <p className="text-xs text-slate-400 mt-1">Usa el botón "Reportar Jornada" para registrar el primer parte diario.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reportes.map((rep) => {
              const tieneBloqueo = rep.tiene_bloqueo;

              return (
                <div
                  key={rep.id}
                  className={`bg-[#1A1D25] rounded-2xl border border-white/10 border-l-4 ${
                    tieneBloqueo ? 'border-l-rose-500' : 'border-l-emerald-500'
                  } hover:border-amber-400/40 hover:-translate-y-0.5 transition-all duration-200 p-5 flex flex-col justify-between space-y-4 shadow-md`}
                >
                  <div className="space-y-3">
                    {/* Cabecera con Semáforo Visual */}
                    <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-3">
                      <div>
                        <span className="font-mono text-xs font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          {rep.proyecto.codigo}
                        </span>
                        <h3 className="font-bold text-sm text-white mt-1 leading-snug">
                          {rep.proyecto.nombre}
                        </h3>
                      </div>

                      {tieneBloqueo ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase tracking-wider shrink-0 animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Bloqueo Activo</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Normal</span>
                        </span>
                      )}
                    </div>

                    {/* Resumen de Actividades del Día */}
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {rep.resumen_actividades}
                    </p>

                    {/* Caja de Alerta de Bloqueo si aplica */}
                    {tieneBloqueo && rep.detalle_bloqueo && (
                      <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Motivo del Bloqueo:
                        </span>
                        <p className="text-xs font-semibold leading-relaxed">{rep.detalle_bloqueo}</p>
                      </div>
                    )}
                  </div>

                  {/* Footer con Autor y Fecha */}
                  <div className="pt-3 border-t border-white/5 text-[11px] text-slate-400 space-y-1">
                    <div className="flex items-center gap-1.5 font-medium">
                      <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">
                        Por: <strong className="text-slate-200">{rep.usuario.nombre_completo}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>
                        {new Date(rep.created_at).toLocaleDateString('es-PE', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal / Formulario: Reportar Jornada de Campo */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#1A1D25] rounded-2xl max-w-xl w-full p-5 sm:p-7 shadow-2xl border border-white/10 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">
                  Reportar Jornada de Campo (Bitácora)
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Proyecto */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Proyecto / Cuadrilla <span className="text-amber-400">*</span>
                </label>
                <select
                  value={nuevoProyectoId}
                  onChange={(e) => setNuevoProyectoId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#14161E] border border-white/10 rounded-xl font-medium text-white focus:outline-none focus:border-amber-400/50 transition cursor-pointer"
                >
                  {proyectos.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#1A1D25] text-white">
                      {p.codigo} - {p.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Resumen de Actividades */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Resumen de Avance Diario <span className="text-amber-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={resumen}
                  onChange={(e) => setResumen(e.target.value)}
                  placeholder="Detalla las tareas ejecutadas, avances cuantitativos o pruebas realizadas..."
                  className="w-full px-3.5 py-2.5 bg-[#14161E] border border-white/10 rounded-xl font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50 transition"
                />
              </div>

              {/* Selector de Semáforo de Bloqueo */}
              <div className="pt-2">
                <label className="block font-bold text-slate-300 mb-2">
                  Semáforo Operativo: ¿El trabajo se encuentra detenido o bloqueado?
                </label>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTieneBloqueo(false)}
                    className={`p-3.5 rounded-xl border font-bold flex flex-col items-center justify-center gap-1.5 transition ${
                      !tieneBloqueo
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                        : 'bg-[#14161E] text-slate-400 border-white/10 hover:bg-white/5'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Sin Bloqueos (Normal)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTieneBloqueo(true)}
                    className={`p-3.5 rounded-xl border font-bold flex flex-col items-center justify-center gap-1.5 transition ${
                      tieneBloqueo
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                        : 'bg-[#14161E] text-slate-400 border-white/10 hover:bg-white/5'
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                    <span>Bloqueo Crítico</span>
                  </button>
                </div>
              </div>

              {/* Campo obligatorio si hay bloqueo */}
              {tieneBloqueo && (
                <div className="space-y-1.5 bg-rose-500/10 p-4 rounded-xl border border-rose-500/30 animate-in fade-in duration-200">
                  <label className="block font-bold text-rose-300">
                    Motivo Detallado del Bloqueo <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={detalleBloqueo}
                    onChange={(e) => setDetalleBloqueo(e.target.value)}
                    placeholder="Ej. Faltan especificaciones de la API, no hay aprobación de la RFC-01, o falta credencial..."
                    className="w-full px-3 py-2 bg-[#14161E] border border-rose-500/40 rounded-lg font-medium text-rose-200 placeholder:text-rose-400/50 focus:outline-none focus:border-rose-400"
                  />
                  <span className="text-[10px] text-rose-300/80 font-medium block">
                    Al enviar, se emitirá una alerta gerencial inmediata en el Dashboard.
                  </span>
                </div>
              )}

              {/* Botones de acción */}
              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold border border-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-upt-gold to-amber-400 hover:brightness-110 text-slate-950 font-bold shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Guardando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Enviar Reporte
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
