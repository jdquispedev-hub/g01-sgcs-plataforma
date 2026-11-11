'use client';

import { useEffect, useState, useMemo } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  AlertTriangle,
  GitPullRequest,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  LogOut,
  LayoutDashboard,
  Filter,
  User,
  Calendar,
  Lock,
} from 'lucide-react';
import NavbarPrincipal from '@/components/NavbarPrincipal';

interface VersionPendiente {
  id: string;
  numero_version: string;
  descripcion: string;
  archivo_url: string;
  estado: string;
  created_at: string;
  autor?: { nombre_completo: string; email: string };
  ecs: {
    id: string;
    codigo: string;
    nombre: string;
    tipo: string;
    proyecto: { id: string; codigo: string; nombre: string };
  };
}

interface SolicitudPendiente {
  id: string;
  codigo: string;
  descripcion: string;
  justificacion: string;
  estado: string;
  created_at: string;
  solicitante: { nombre_completo: string; email: string };
  ecs: {
    id: string;
    codigo: string;
    nombre: string;
    proyecto: { codigo: string; nombre: string };
  };
  evaluacion?: {
    impacto: 'ALTO' | 'MEDIO' | 'BAJO';
  } | null;
}

interface UserSession {
  nombreCompleto: string;
  email: string;
  rol: string;
  organizacionNombre: string;
}

export default function AprobacionesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'versiones' | 'cambios'>('versiones');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // SWR: Caché en memoria (Stale-While-Revalidate) para navegación instantánea (0ms)
  const { data: dataMe, error: errorMe } = useSWR('/api/auth/me', fetcher, { revalidateOnFocus: false });
  const { data: dataEcs, mutate: mutateEcs } = useSWR('/api/ecs', fetcher, { revalidateOnFocus: false });
  const { data: dataCambios, mutate: mutateCambios } = useSWR('/api/cambios', fetcher, { revalidateOnFocus: false });

  const user = dataMe?.success ? (dataMe.data.user as UserSession) : null;
  const isInitialLoading = (!dataMe && !errorMe) || (!dataEcs && !dataCambios);

  useEffect(() => {
    if (dataMe && !dataMe.success) {
      router.push('/login');
    }
    if (errorMe) {
      router.push('/login');
    }
  }, [dataMe, errorMe, router]);

  // Filtrar versiones que estén pendientes de aprobación técnica (RF-08)
  const versiones: VersionPendiente[] = useMemo(() => {
    if (!dataEcs?.success || !Array.isArray(dataEcs.data)) return [];
    const pendientes: VersionPendiente[] = [];
    dataEcs.data.forEach((ecs: any) => {
      if (Array.isArray(ecs.versiones)) {
        ecs.versiones.forEach((v: any) => {
          if (v.estado === 'PENDIENTE') {
            pendientes.push({
              id: v.id,
              numero_version: v.numero_version,
              descripcion: v.descripcion || 'Sin descripción',
              archivo_url: v.archivo_url || '',
              estado: v.estado,
              created_at: v.created_at,
              autor: v.autor,
              ecs: {
                id: ecs.id,
                codigo: ecs.codigo,
                nombre: ecs.nombre,
                tipo: ecs.tipo,
                proyecto: ecs.proyecto,
              },
            });
          }
        });
      }
    });
    return pendientes;
  }, [dataEcs]);

  // Filtrar solicitudes de cambio pendientes de evaluación / resolución (RF-13, RF-14)
  const solicitudes: SolicitudPendiente[] = useMemo(() => {
    if (!dataCambios?.success || !Array.isArray(dataCambios.data)) return [];
    return dataCambios.data.filter(
      (c: any) => c.estado === 'PENDIENTE_EVALUACION' || c.estado === 'EN_EVALUACION'
    );
  }, [dataCambios]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const handleDictaminarVersion = async (
    ecsId: string,
    versionId: string,
    decision: 'APROBAR' | 'RECHAZAR'
  ) => {
    if (!confirm(`¿Confirmas ${decision === 'APROBAR' ? 'APROBAR' : 'RECHAZAR'} esta versión formalmente?`)) {
      return;
    }

    setActionLoadingId(versionId);
    try {
      const res = await fetch(`/api/ecs/${ecsId}/versiones/${versionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      });
      const data = await res.json();
      if (data.success) {
        await mutateEcs();
      } else {
        alert(data.message || 'Error al dictaminar versión');
      }
    } catch {
      alert('Error de conexión al procesar el dictamen');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#13151A] text-slate-200 gap-3 p-4">
        <div className="w-14 h-14 rounded-2xl bg-[#1A1D25] text-upt-gold border border-white/10 flex items-center justify-center shadow-lg animate-pulse">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <p className="text-sm font-bold text-slate-300">Cargando Bandeja de Aprobaciones...</p>
      </div>
    );
  }

  const totalPendientes = versiones.length + solicitudes.length;

  return (
    <div className="min-h-screen bg-[#13151A] text-slate-100 flex flex-col antialiased selection:bg-upt-gold selection:text-slate-950">
      {/* Navbar Global Unificado */}
      <NavbarPrincipal user={user} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6">
        {/* Banner de Estado de Bandeja */}
        <div className="bg-[#1A1D25] rounded-3xl p-6 text-white shadow-xl border border-white/10 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-upt-gold/20 text-upt-gold border border-upt-gold/40 text-[11px] font-black uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Paso 3: Dictamen Técnico y Aprobación</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Centro de Dictamen y Control de Cambios
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Como especialista técnico, tu función es evaluar la viabilidad de nuevos artefactos de software y solicitudes de cambio antes de que pasen a producción o a una Línea Base.
              </p>
            </div>

            {/* Contadores Clave */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div className="bg-[#14161E] p-4 rounded-2xl border border-white/10 text-center min-w-[120px]">
                <span className="text-[10px] text-slate-400 uppercase font-black block">Versiones ECS</span>
                <span className="text-2xl font-black text-upt-gold">{versiones.length}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Por dictaminar</span>
              </div>
              <div className="bg-[#14161E] p-4 rounded-2xl border border-white/10 text-center min-w-[120px]">
                <span className="text-[10px] text-slate-400 uppercase font-black block">Cambios (RFC)</span>
                <span className="text-2xl font-black text-amber-400">{solicitudes.length}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Por evaluar</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selector de Pestañas */}
        <div className="flex border-b border-white/10 gap-2">
          <button
            onClick={() => setActiveTab('versiones')}
            className={`pb-3 px-4 font-black text-xs sm:text-sm transition flex items-center gap-2 border-b-2 -mb-[1px] ${
              activeTab === 'versiones'
                ? 'border-upt-gold text-upt-gold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4 text-sky-400" />
            <span>Versiones de ECS Pendientes ({versiones.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('cambios')}
            className={`pb-3 px-4 font-black text-xs sm:text-sm transition flex items-center gap-2 border-b-2 -mb-[1px] ${
              activeTab === 'cambios'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <GitPullRequest className="w-4 h-4 text-amber-400" />
            <span>Solicitudes de Cambio RFC ({solicitudes.length})</span>
          </button>
        </div>

        {/* Contenido Pestaña 1: Versiones de ECS */}
        {activeTab === 'versiones' && (
          <div className="space-y-4">
            {versiones.length === 0 ? (
              <div className="bg-[#1A1D25] rounded-3xl border border-white/10 p-12 text-center shadow-md space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="font-black text-white text-base">
                  ¡No hay versiones de artefactos pendientes de aprobación!
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Todos los Elementos de Configuración (ECS) cuentan con dictamen técnico al día.
                </p>
                <Link
                  href="/ecs"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-upt-gold to-amber-400 text-slate-950 font-bold text-xs shadow hover:brightness-110 transition"
                >
                  <span>Explorar Catálogo ECS</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {versiones.map((v) => (
                  <div
                    key={v.id}
                    className="bg-[#1A1D25] rounded-3xl border border-white/10 border-l-4 border-l-amber-400 shadow-md hover:border-white/20 transition-all duration-200 p-6 flex flex-col justify-between group space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            <span className="font-mono text-xs font-black text-sky-300 bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                              {v.ecs.codigo}
                            </span>
                            <span className="font-mono text-xs font-black text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-400/30">
                              v{v.numero_version}
                            </span>
                          </div>
                          <h3 className="font-black text-white text-sm leading-snug group-hover:text-sky-300 transition">
                            {v.ecs.nombre}
                          </h3>
                          <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                            Proyecto: {v.ecs.proyecto.codigo}
                          </span>
                        </div>
                        <span className="text-[10px] font-black px-2 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider shrink-0 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          Pendiente
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                            Descripción del Cambio / Release:
                          </span>
                          <p className="text-xs text-slate-300 leading-relaxed bg-[#14161E] p-2.5 rounded-xl border border-white/10">
                            {v.descripcion}
                          </p>
                        </div>

                        {v.archivo_url && (
                          <div className="text-[11px] font-mono text-slate-300 bg-[#14161E] px-2.5 py-1.5 rounded-xl border border-white/10 truncate flex items-center gap-1.5">
                            <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                            <a
                              href={v.archivo_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sky-400 hover:underline truncate"
                            >
                              {v.archivo_url}
                            </a>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>
                            {new Date(v.created_at).toLocaleDateString('es-PE', {
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

                    <div className="pt-4 border-t border-white/10 space-y-2">
                      {user?.rol === 'SOLICITANTE' ? (
                        <div className="py-2 px-3 rounded-xl bg-white/5 text-slate-400 font-medium text-[11px] text-center border border-white/10 flex items-center justify-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Dictamen reservado para el Especialista Aprobador</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            disabled={actionLoadingId === v.id}
                            onClick={() => handleDictaminarVersion(v.ecs.id, v.id, 'APROBAR')}
                            className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow transition flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Aprobar</span>
                          </button>
                          <button
                            disabled={actionLoadingId === v.id}
                            onClick={() => handleDictaminarVersion(v.ecs.id, v.id, 'RECHAZAR')}
                            className="py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow transition flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Rechazar</span>
                          </button>
                        </div>
                      )}

                      <Link
                        href={`/ecs/${v.ecs.id}`}
                        className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 font-bold text-xs transition flex items-center justify-between border border-white/10"
                      >
                        <span>Ver Ficha Completa del ECS</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contenido Pestaña 2: Solicitudes de Cambio */}
        {activeTab === 'cambios' && (
          <div className="space-y-4">
            {solicitudes.length === 0 ? (
              <div className="bg-[#1A1D25] rounded-3xl border border-white/10 p-12 text-center shadow-md space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="font-black text-white text-base">
                  ¡No hay solicitudes de cambio (RFC) pendientes!
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Todas las solicitudes de cambio a las Líneas Base han sido evaluadas y dictaminadas.
                </p>
                <Link
                  href="/cambios"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-upt-gold to-amber-400 text-slate-950 font-bold text-xs shadow hover:brightness-110 transition"
                >
                  <span>Ver Historial de Cambios</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {solicitudes.map((rfc) => (
                  <div
                    key={rfc.id}
                    className="bg-[#1A1D25] rounded-3xl border border-white/10 border-l-4 border-l-amber-400 shadow-md hover:border-white/20 transition-all duration-200 p-6 flex flex-col justify-between group space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            <span className="font-mono text-xs font-black text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-400/30">
                              {rfc.codigo}
                            </span>
                            <span className="text-[10px] font-black text-slate-300 bg-white/10 px-2 py-0.5 rounded-md">
                              {rfc.ecs.proyecto.codigo}
                            </span>
                          </div>
                          <h3 className="font-black text-white text-sm leading-snug group-hover:text-amber-300 transition">
                            {rfc.ecs.codigo}: {rfc.ecs.nombre}
                          </h3>
                        </div>
                        <span className="text-[10px] font-black px-2 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider shrink-0 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          {rfc.estado === 'PENDIENTE_EVALUACION' ? 'Por Evaluar' : 'En Evaluación'}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                            Motivo / Justificación:
                          </span>
                          <p className="text-xs text-slate-300 leading-relaxed bg-[#14161E] p-2.5 rounded-xl border border-white/10">
                            {rfc.descripcion}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-slate-400 font-bold">Impacto Estimado:</span>
                          <span
                            className={`px-2 py-0.5 rounded-md font-black text-[11px] border ${
                              rfc.evaluacion?.impacto === 'ALTO'
                                ? 'bg-red-500/20 text-rose-300 border-rose-500/30'
                                : rfc.evaluacion?.impacto === 'MEDIO'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            }`}
                          >
                            {rfc.evaluacion?.impacto || 'POR DETERMINAR'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                          <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>
                            Solicitado por: <strong className="text-slate-200">{rfc.solicitante.nombre_completo}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <Link
                        href={`/cambios/${rfc.id}`}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-upt-gold to-amber-400 hover:brightness-110 text-slate-950 font-black text-xs shadow transition flex items-center justify-between group/btn active:scale-95"
                      >
                        <span>{user?.rol === 'SOLICITANTE' ? 'Consultar Expediente del Cambio' : 'Evaluar Expediente & Resolver Dictamen'}</span>
                        <ChevronRight className="w-4 h-4 text-slate-950 group-hover/btn:translate-x-1.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
