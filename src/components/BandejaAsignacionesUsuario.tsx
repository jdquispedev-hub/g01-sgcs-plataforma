'use client';

import { useState, useEffect } from 'react';
import {
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Calendar,
  AlertTriangle,
  Send,
  Loader2,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

interface Actividad {
  id: string;
  titulo: string;
  descripcion?: string | null;
  codigo_caso_uso?: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  estado_asignacion: 'PENDIENTE_ACEPTACION' | 'ACEPTADA' | 'RECHAZADA' | 'EN_PROGRESO' | 'COMPLETADA';
  motivo_rechazo?: string | null;
  fecha_respuesta?: string | null;
  etapa?: {
    nombre: string;
    fase: string;
  } | null;
  ecs?: {
    id: string;
    codigo: string;
    nombre: string;
    tipo: string;
  } | null;
  proyecto?: {
    id: string;
    codigo: string;
    nombre: string;
    metodologia: string;
  } | null;
}

export default function BandejaAsignacionesUsuario() {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'PENDIENTES' | 'ASUMIDAS' | 'TODAS'>('PENDIENTES');

  // Modal Rechazar
  const [rechazarModalId, setRechazarModalId] = useState<string | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [procesandoId, setProcesandoId] = useState<string | null>(null);
  const [mensajeToast, setMensajeToast] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(
    null
  );

  const cargarMisAsignaciones = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/cronograma/actividades?misAsignaciones=true');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setActividades(data.data);
      }
    } catch (e) {
      console.error('Error al cargar mis asignaciones:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMisAsignaciones();
  }, []);

  const handleResponder = async (actividadId: string, accion: 'ACEPTAR' | 'RECHAZAR') => {
    if (accion === 'RECHAZAR' && (!motivoRechazo || motivoRechazo.trim().length < 5)) {
      setMensajeToast({
        tipo: 'error',
        texto: 'Por favor ingrese un motivo justificado para rechazar (mínimo 5 letras).',
      });
      return;
    }

    setProcesandoId(actividadId);
    try {
      const res = await fetch(`/api/cronograma/actividades/${actividadId}/responder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accion,
          motivo: accion === 'RECHAZAR' ? motivoRechazo.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setMensajeToast({ tipo: 'error', texto: data.message || 'Error al procesar la respuesta.' });
        return;
      }

      setMensajeToast({
        tipo: 'success',
        texto:
          accion === 'ACEPTAR'
            ? '¡Excelente! Has asumido formalmente la actividad. Queda registrada a tu nombre.'
            : 'Actividad rechazada. El administrador fue notificado con tu justificación.',
      });

      setRechazarModalId(null);
      setMotivoRechazo('');
      await cargarMisAsignaciones();
    } catch {
      setMensajeToast({ tipo: 'error', texto: 'Error de conexión con el servidor.' });
    } finally {
      setProcesandoId(null);
      setTimeout(() => setMensajeToast(null), 5000);
    }
  };

  const pendientes = actividades.filter((a) => a.estado_asignacion === 'PENDIENTE_ACEPTACION');
  const asumidas = actividades.filter(
    (a) => a.estado_asignacion === 'ACEPTADA' || a.estado_asignacion === 'EN_PROGRESO'
  );

  const listaFiltrada =
    tab === 'PENDIENTES'
      ? pendientes
      : tab === 'ASUMIDAS'
      ? asumidas
      : actividades;

  return (
    <div className="bg-[#1A1D25] rounded-3xl border border-white/10 p-6 sm:p-7 shadow-xl space-y-6">
      {/* Toast Alert */}
      {mensajeToast && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-150 ${
            mensajeToast.tipo === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border border-red-500/30 text-red-300'
          }`}
        >
          {mensajeToast.tipo === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span>{mensajeToast.texto}</span>
        </div>
      )}

      {/* Header de la Bandeja */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <Inbox className="w-3.5 h-3.5" />
              Vista del Desarrollador / Colaborador
            </span>
            {pendientes.length > 0 && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full animate-pulse">
                {pendientes.length} Pendiente(s)
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Bandeja de Entregables Asignados</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Acepta los trabajos para registrarlos formalmente a tu nombre o recházalos con justificación.
          </p>
        </div>

        {/* Tabs de Filtro */}
        <div className="flex items-center gap-1.5 bg-[#14161E] p-1 rounded-2xl border border-white/10 shrink-0">
          <button
            onClick={() => setTab('PENDIENTES')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              tab === 'PENDIENTES'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Por Aceptar</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900/30 font-mono">
              {pendientes.length}
            </span>
          </button>
          <button
            onClick={() => setTab('ASUMIDAS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              tab === 'ASUMIDAS'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Asumidas</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900/30 font-mono">
              {asumidas.length}
            </span>
          </button>
          <button
            onClick={() => setTab('TODAS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              tab === 'TODAS'
                ? 'bg-white/10 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Todas ({actividades.length})</span>
          </button>
        </div>
      </div>

      {/* Contenido de la Lista */}
      {loading ? (
        <div className="p-12 text-center">
          <Loader2 className="w-7 h-7 text-amber-400 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Consultando tus entregables asignados...</p>
        </div>
      ) : listaFiltrada.length === 0 ? (
        <div className="p-10 text-center rounded-2xl bg-[#14161E] border border-white/5 space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
          <h4 className="text-sm font-bold text-white">
            {tab === 'PENDIENTES'
              ? 'No tienes entregables pendientes por aceptar'
              : 'No hay actividades en esta vista'}
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {tab === 'PENDIENTES'
              ? 'Cuando el Gerente o Jefe de Proyecto asigne una nueva actividad a tu nombre, aparecerá aquí con los botones de aceptación.'
              : 'Revisa las otras pestañas para ver tus trabajos en curso o el historial.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {listaFiltrada.map((act) => {
            const isPendiente = act.estado_asignacion === 'PENDIENTE_ACEPTACION';
            const isAceptada =
              act.estado_asignacion === 'ACEPTADA' || act.estado_asignacion === 'EN_PROGRESO';
            const isRechazada = act.estado_asignacion === 'RECHAZADA';
            const isProcesando = procesandoId === act.id;

            return (
              <div
                key={act.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isPendiente
                    ? 'bg-amber-500/5 border-amber-500/30 hover:border-amber-500/50 shadow-md'
                    : isAceptada
                    ? 'bg-[#14161E] border-white/10 hover:border-white/20'
                    : 'bg-red-500/5 border-red-500/20 opacity-80'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Info Principal */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {act.proyecto?.codigo && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300">
                          {act.proyecto.codigo}
                        </span>
                      )}
                      {act.etapa?.nombre && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-300">
                          {act.etapa.nombre}
                        </span>
                      )}
                      {act.codigo_caso_uso && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300">
                          {act.codigo_caso_uso}
                        </span>
                      )}
                      {act.ecs?.codigo && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                          {act.ecs.codigo} ({act.ecs.tipo})
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-white tracking-tight">
                        {act.titulo}
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {act.descripcion || 'Entregable asignado por el Gerente en el cronograma.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        Plazo: {new Date(act.fecha_inicio).toLocaleDateString('es-ES')} al{' '}
                        {new Date(act.fecha_fin).toLocaleDateString('es-ES')}
                      </span>
                    </div>

                    {isRechazada && act.motivo_rechazo && (
                      <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                        <strong>Motivo de rechazo enviado:</strong> {act.motivo_rechazo}
                      </div>
                    )}
                  </div>

                  {/* Botones de Acción (Aceptar / Rechazar) */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-white/5">
                    {isPendiente ? (
                      <>
                        <button
                          type="button"
                          disabled={isProcesando}
                          onClick={() => handleResponder(act.id, 'ACEPTAR')}
                          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
                        >
                          {isProcesando ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                          <span>Aceptar Asignación</span>
                        </button>

                        <button
                          type="button"
                          disabled={isProcesando}
                          onClick={() => {
                            setRechazarModalId(act.id);
                            setMotivoRechazo('');
                          }}
                          className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-300 text-slate-400 font-bold text-xs transition border border-white/10 hover:border-red-500/30 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Rechazar</span>
                        </button>
                      </>
                    ) : isAceptada ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          Trabajo Asumido
                        </span>
                        {act.ecs?.id && (
                          <Link
                            href={`/ecs/${act.ecs.id}`}
                            className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-bold transition flex items-center gap-1"
                          >
                            <span>Subir Versión</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3.5 py-1.5 rounded-full">
                        Rechazada por ti
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para ingresar Motivo de Rechazo */}
      {rechazarModalId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#16181D] border border-white/10 text-slate-100 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
              <h4 className="text-base font-bold text-white">Rechazar Asignación de Entregable</h4>
            </div>

            <p className="text-xs text-slate-300">
              Indica al Gerente el motivo por el cual no puedes asumir esta actividad (sobrecarga, falta de requisitos o cambio de prioridad):
            </p>

            <textarea
              rows={3}
              required
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
              placeholder="Ej: Tengo asignado el módulo de pagos prioritario y no cuento con disponibilidad para este sprint..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F1115] border border-white/10 text-white placeholder-slate-500 text-xs focus:border-red-500 focus:outline-hidden transition"
            />

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRechazarModalId(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-semibold transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={Boolean(procesandoId)}
                onClick={() => handleResponder(rechazarModalId, 'RECHAZAR')}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition flex items-center gap-2 disabled:opacity-50"
              >
                {procesandoId ? 'Enviando...' : 'Confirmar Rechazo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
