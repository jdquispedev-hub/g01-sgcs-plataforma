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
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col antialiased">
      {/* Top Navbar Mobile-First */}
      <header className="bg-upt-navy-900 text-white border-b-2 border-upt-gold shadow-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-0 sm:h-16 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
          
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href="/dashboard"
              className="p-2 rounded-xl bg-upt-navy-800 hover:bg-upt-navy-700 text-upt-gold transition border border-upt-gold/30 shrink-0 shadow-sm"
              title="Volver al Dashboard"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-sm sm:text-base text-white tracking-tight truncate">
                  Bitácora Diaria de Campo
                </span>
                <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-upt-gold text-upt-navy-950 font-black uppercase tracking-wider shrink-0 shadow-sm">
                  Etapa 4 • Control de Bloqueos
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-300 truncate">
                Reportes diarios de cuadrilla y alerta gerencial inmediata
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-1 sm:pt-0 border-t border-white/10 sm:border-t-0">
            <button
              onClick={() => setModalOpen(true)}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-upt-gold to-amber-500 hover:from-amber-400 hover:to-upt-gold text-upt-navy-950 font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition flex items-center gap-1.5 shrink-0 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Reportar Jornada</span>
              <span className="sm:hidden font-bold">Reportar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6">
        
        {/* Banner de Retroalimentación de Envío */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-100 border-2 border-emerald-300 text-emerald-900 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Banner de Concepto de la Etapa 4 */}
        <div className="bg-gradient-to-r from-upt-navy-900 to-slate-800 rounded-3xl p-5 sm:p-6 text-white border border-upt-navy-700 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-upt-gold text-xs font-bold uppercase tracking-wider">
              <Activity className="w-4 h-4" />
              <span>Etapa 4 del Patrón Universal: Bitácora & Bloqueos</span>
            </div>
            <h2 className="text-xl font-black text-white">
              Cero Sorpresas: Visibilidad en Tiempo Real
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Los técnicos y cuadrillas registran su avance al finalizar el turno. Si un trabajo se detiene por falta de insumos, planos o aprobaciones, se activa el semáforo rojo para que la gerencia intervenga de inmediato.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0 text-center sm:w-48">
            <span className="text-[10px] font-bold text-slate-300 uppercase block">Bloqueos Registrados</span>
            <span className={`text-2xl font-black mt-1 block ${totalBloqueosActivos > 0 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
              {totalBloqueosActivos} {totalBloqueosActivos === 1 ? 'Activo' : 'Activos'}
            </span>
          </div>
        </div>

        {/* Filtros Rápidos */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-slate-300 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-upt-gold-600" />
            <select
              value={proyectoFiltro}
              onChange={(e) => setProyectoFiltro(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-upt-navy-700 transition"
            >
              <option value="">Todos los Proyectos</option>
              {proyectos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.codigo} - {p.nombre}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setSoloBloqueos(!soloBloqueos)}
            className={`px-3 py-1.5 rounded-2xl text-xs font-black transition flex items-center gap-1.5 border self-start sm:self-auto ${
              soloBloqueos
                ? 'bg-red-600 text-white border-red-500 shadow-md'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{soloBloqueos ? 'Mostrando Solo Bloqueos' : 'Filtrar Solo Bloqueos'}</span>
          </button>
        </div>

        {/* Lista de Tarjetas de Bitácora */}
        {loading ? (
          <div className="p-16 text-center bg-white rounded-3xl border-2 border-slate-300 shadow-md">
            <Loader2 className="w-10 h-10 animate-spin text-upt-navy-700 mx-auto mb-3" />
            <p className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Consultando reportes de bitácora...
            </p>
          </div>
        ) : reportes.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-300 p-12 text-center shadow-md">
            <Activity className="w-12 h-12 text-slate-400 mx-auto mb-2" />
            <h3 className="font-black text-slate-900 text-base">No hay reportes de bitácora registrados</h3>
            <p className="text-xs text-slate-500 mt-1">Usa el botón "Reportar Jornada" para registrar el primer parte diario.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reportes.map((rep) => {
              const tieneBloqueo = rep.tiene_bloqueo;

              return (
                <div
                  key={rep.id}
                  className={`bg-white rounded-3xl border-2 border-slate-300 border-l-[6px] ${
                    tieneBloqueo ? 'border-l-red-600' : 'border-l-emerald-600'
                  } shadow-[0_4px_20px_-4px_rgba(0,0,0,0.12)] hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 p-5 flex flex-col justify-between space-y-4`}
                >
                    <div className="space-y-3">
                      {/* Cabecera de la tarjeta con Semáforo Visual */}
                      <div className="flex items-start justify-between gap-2 border-b border-slate-200/80 pb-3">
                        <div>
                          <span className="font-mono text-xs font-black text-upt-navy-950 bg-upt-gold/25 px-2.5 py-0.5 rounded-lg border border-upt-gold/50">
                            {rep.proyecto.codigo}
                          </span>
                          <h3 className="font-black text-sm text-slate-950 mt-1 leading-snug">
                            {rep.proyecto.nombre}
                          </h3>
                        </div>

                        {tieneBloqueo ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-xl bg-red-600 text-white uppercase tracking-wider shrink-0 shadow-sm animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Bloqueo Activo</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-wider shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Normal</span>
                          </span>
                        )}
                      </div>

                      {/* Resumen de Actividades del Día */}
                      <p className="text-xs text-slate-800 leading-relaxed">
                        {rep.resumen_actividades}
                      </p>

                      {/* Caja de Alerta de Bloqueo si aplica */}
                      {tieneBloqueo && rep.detalle_bloqueo && (
                        <div className="p-3.5 rounded-2xl bg-red-50 border-2 border-red-300 text-red-950 space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-red-700 flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5" /> Motivo del Bloqueo:
                          </span>
                          <p className="text-xs font-bold leading-relaxed">{rep.detalle_bloqueo}</p>
                        </div>
                      )}
                    </div>

                    {/* Footer con Autor y Fecha */}
                    <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                      <div className="flex items-center gap-1.5 font-medium">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          Por: <strong className="text-slate-900">{rep.usuario.nombre_completo}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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

      {/* Modal / Formulario Mobile-First: Reportar Jornada de Campo */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-8 shadow-2xl border-2 border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-upt-gold" />
                <h3 className="font-black text-base text-slate-900">
                  Reportar Jornada de Campo (Bitácora)
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-red-100 border border-red-300 text-red-900 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Proyecto */}
              <div>
                <label className="block font-black text-slate-700 mb-1">
                  Proyecto / Cuadrilla <span className="text-red-500">*</span>
                </label>
                <select
                  value={nuevoProyectoId}
                  onChange={(e) => setNuevoProyectoId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-upt-navy-700 transition"
                >
                  {proyectos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.codigo} - {p.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Resumen de Actividades */}
              <div>
                <label className="block font-black text-slate-700 mb-1">
                  Resumen de Avance Diario <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={resumen}
                  onChange={(e) => setResumen(e.target.value)}
                  placeholder="Detalla las tareas ejecutadas, avances cuantitativos o pruebas realizadas..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-2xl font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-upt-navy-700 transition"
                />
              </div>

              {/* Selector de Semáforo de Bloqueo */}
              <div className="pt-2">
                <label className="block font-black text-slate-700 mb-2">
                  Semáforo Operativo: ¿El trabajo se encuentra detenido o bloqueado?
                </label>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTieneBloqueo(false)}
                    className={`p-3.5 rounded-2xl border-2 font-black flex flex-col items-center justify-center gap-1.5 transition ${
                      !tieneBloqueo
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md ring-4 ring-emerald-100'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>🟢 Sin Bloqueo (Normal)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTieneBloqueo(true)}
                    className={`p-3.5 rounded-2xl border-2 font-black flex flex-col items-center justify-center gap-1.5 transition ${
                      tieneBloqueo
                        ? 'bg-red-600 text-white border-red-500 shadow-md ring-4 ring-red-100'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5" />
                    <span>🔴 ¡Bloqueo Crítico!</span>
                  </button>
                </div>
              </div>

              {/* Campo obligatorio si hay bloqueo */}
              {tieneBloqueo && (
                <div className="space-y-1.5 bg-red-50 p-4 rounded-2xl border-2 border-red-300 animate-in fade-in duration-200">
                  <label className="block font-black text-red-950">
                    Motivo Detallado del Bloqueo <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={detalleBloqueo}
                    onChange={(e) => setDetalleBloqueo(e.target.value)}
                    placeholder="Ej. Faltan planos estructurales actualizados, no hay aprobación de la RFC-01, o falta suministro..."
                    className="w-full px-3 py-2 bg-white border-2 border-red-300 rounded-xl font-bold text-red-950 placeholder:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                  <span className="text-[10px] text-red-700 font-bold block">
                    ⚠️ Al enviar, se emitirá una alerta gerencial roja inmediata en el Dashboard.
                  </span>
                </div>
              )}

              {/* Botones de acción */}
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-upt-navy-900 hover:bg-upt-navy-800 text-upt-gold font-black shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
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
