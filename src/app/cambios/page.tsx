'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowLeft,
  ChevronRight,
  User,
  FolderGit2,
  Layers,
  Lock,
  GitPullRequest,
  Check,
  Calendar,
  AlertCircle,
  Sparkles,
  Loader2,
  Activity,
  GitCommit,
  Tag,
  ArrowRight,
} from 'lucide-react';
import AppShell from '@/components/AppShell';

interface SolicitudItem {
  id: string;
  codigo: string;
  descripcion: string;
  justificacion: string;
  estado: 'PENDIENTE_EVALUACION' | 'EN_EVALUACION' | 'APROBADA' | 'RECHAZADA' | 'IMPLEMENTADA';
  created_at: string;
  ecs: {
    id: string;
    codigo: string;
    nombre: string;
    tipo: string;
    proyecto: {
      id: string;
      codigo: string;
      nombre: string;
    };
  };
  version_base: {
    id: string;
    numero_version: string;
  };
  version_resultante?: {
    id: string;
    numero_version: string;
  } | null;
  solicitante: {
    id: string;
    nombre_completo: string;
    rol: string;
  };
  resolutor?: {
    id: string;
    nombre_completo: string;
  } | null;
  evaluacion?: {
    id: string;
    impacto: 'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO';
    observaciones: string;
  } | null;
  _count: {
    ecs_afectados: number;
  };
}

interface ProyectoAux {
  id: string;
  codigo: string;
  nombre: string;
}

export default function CambiosPage() {
  const [solicitudes, setSolicitudes] = useState<SolicitudItem[]>([]);
  const [proyectos, setProyectos] = useState<ProyectoAux[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [proyectoFiltro, setProyectoFiltro] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/cambios', window.location.origin);
      if (search) url.searchParams.set('search', search);
      if (estadoFiltro) url.searchParams.set('estado', estadoFiltro);
      if (proyectoFiltro) url.searchParams.set('proyectoId', proyectoFiltro);

      const [resCambios, resAux] = await Promise.all([
        fetch(url.toString()),
        fetch('/api/auxiliares'),
      ]);

      const dataCambios = await resCambios.json();
      const dataAux = await resAux.json();

      if (dataCambios.success) setSolicitudes(dataCambios.data);
      if (dataAux.success) setProyectos(dataAux.data.proyectos);
    } catch (err) {
      console.error('Error al cargar cambios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [estadoFiltro, proyectoFiltro]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  // Métricas
  const totalPendientes = solicitudes.filter(
    (s) => s.estado === 'PENDIENTE_EVALUACION' || s.estado === 'EN_EVALUACION'
  ).length;
  const totalAprobadas = solicitudes.filter((s) => s.estado === 'APROBADA').length;
  const totalImplementadas = solicitudes.filter((s) => s.estado === 'IMPLEMENTADA').length;

  const getEstadoVisual = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE_EVALUACION':
        return {
          label: 'Pendiente Evaluación',
          badge: 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 shadow-sm',
          borderAccent: 'border-l-amber-500',
          icon: Clock,
        };
      case 'EN_EVALUACION':
        return {
          label: 'En Evaluación Técnica',
          badge: 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40 shadow-sm',
          borderAccent: 'border-l-sky-500',
          icon: Activity,
        };
      case 'APROBADA':
        return {
          label: 'Aprobada por Comité',
          badge: 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 shadow-sm',
          borderAccent: 'border-l-emerald-500',
          icon: CheckCircle2,
        };
      case 'RECHAZADA':
        return {
          label: 'Rechazada',
          badge: 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40 shadow-sm',
          borderAccent: 'border-l-rose-500',
          icon: XCircle,
        };
      case 'IMPLEMENTADA':
        return {
          label: 'Implementada',
          badge: 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40 shadow-sm',
          borderAccent: 'border-l-purple-500',
          icon: GitCommit,
        };
      default:
        return {
          label: estado,
          badge: 'bg-white/10 text-slate-300 border border-white/10',
          borderAccent: 'border-l-slate-600',
          icon: Clock,
        };
    }
  };

  const renderBadgeImpacto = (impacto?: string) => {
    switch (impacto) {
      case 'CRITICO':
        return (
          <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase tracking-wider shadow-sm flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            Impacto Crítico
          </span>
        );
      case 'ALTO':
        return (
          <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-orange-500/20 text-orange-300 border border-orange-500/40 uppercase tracking-wider shadow-sm flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
            Impacto Alto
          </span>
        );
      case 'MEDIO':
        return (
          <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider shadow-sm flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Impacto Medio
          </span>
        );
      case 'BAJO':
        return (
          <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider shadow-sm flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Impacto Leve
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-white/5 text-slate-400 border border-white/10 italic">
            Sin evaluar
          </span>
        );
    }
  };

  return (
    <AppShell>
      {/* Sub-header contextual */}
      <div className="bg-[#16181D] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <GitPullRequest className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Control de Solicitudes de Cambio (RFC)
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 uppercase tracking-wider">
                  Paso 5
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Evaluación técnica de impacto antes de autorizar cualquier modificación sobre Líneas Base
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/aprobaciones"
              className="px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Evaluar Dictamen</span>
            </Link>
            <Link
              href="/cambios/nueva"
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-upt-gold to-amber-400 hover:brightness-110 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Solicitud (RFC)</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6">
        
        {/* Banner Explicativo */}
        <div className="bg-[#1A1D25] rounded-2xl p-5 sm:p-6 text-white border border-white/10 relative overflow-hidden shadow-lg">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px] font-bold uppercase tracking-wider">
                <GitPullRequest className="w-3.5 h-3.5" />
                <span>Paso 5 del Proceso Oficial</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                ¿Cuándo se crea una Solicitud de Cambio (RFC)?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Cuando un entregable ya forma parte de un Hito Congelado (Línea Base), <strong className="text-white font-semibold">nadie puede modificarlo directamente</strong>. 
                Se registra una RFC para que el comité evalúe su <span className="text-amber-400 font-semibold">impacto en costos, cronograma y código</span> antes de autorizar una nueva versión.
              </p>
            </div>

            {/* Contadores Clave */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 shrink-0">
              <div className="bg-[#14161E] p-3.5 rounded-xl border border-white/10 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Por Evaluar</span>
                <span className="text-xl sm:text-2xl font-bold text-amber-400">{totalPendientes}</span>
              </div>
              <div className="bg-[#14161E] p-3.5 rounded-xl border border-white/10 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Aprobadas / Cierre</span>
                <span className="text-xl sm:text-2xl font-bold text-emerald-400">{totalAprobadas + totalImplementadas}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Consola de Búsqueda y Filtros */}
        <div className="bg-[#1A1D25] p-4 sm:p-5 rounded-2xl border border-white/10 shadow-md space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Search className="w-4 h-4 text-amber-400" />
              <span>Buscador y Filtros de Solicitudes de Cambio</span>
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
              {solicitudes.length} encontradas
            </span>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
            {/* Input de Búsqueda */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por código (ej. RFC-2026-001), justificación o ECS..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#14161E] border border-white/10 rounded-xl text-xs sm:text-sm font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50 transition"
              />
            </div>

            {/* Filtro Proyecto */}
            <div className="sm:w-56">
              <select
                value={proyectoFiltro}
                onChange={(e) => setProyectoFiltro(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#14161E] border border-white/10 rounded-xl text-xs sm:text-sm font-medium text-slate-200 focus:outline-none focus:border-amber-400/50 transition cursor-pointer"
              >
                <option value="">Todos los Proyectos</option>
                {proyectos.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#1A1D25] text-white">
                    {p.codigo} - {p.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro Estado */}
            <div className="sm:w-52">
              <select
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#14161E] border border-white/10 rounded-xl text-xs sm:text-sm font-medium text-slate-200 focus:outline-none focus:border-amber-400/50 transition cursor-pointer"
              >
                <option value="">Todos los Estados</option>
                <option value="PENDIENTE_EVALUACION" className="bg-[#1A1D25] text-white">Pendiente de Evaluación</option>
                <option value="EN_EVALUACION" className="bg-[#1A1D25] text-white">En Evaluación Técnica</option>
                <option value="APROBADA" className="bg-[#1A1D25] text-white">Aprobada</option>
                <option value="RECHAZADA" className="bg-[#1A1D25] text-white">Rechazada</option>
                <option value="IMPLEMENTADA" className="bg-[#1A1D25] text-white">Implementada</option>
              </select>
            </div>

            {/* Botón Buscar */}
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/10 transition flex items-center justify-center gap-1.5 shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>Buscar</span>
            </button>
          </form>
        </div>

        {/* Grilla de Tarjetas RFC */}
        {loading ? (
          <div className="p-16 text-center bg-[#1A1D25] rounded-2xl border border-white/10 shadow-md">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-3" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Consultando registro oficial de RFCs...
            </p>
          </div>
        ) : solicitudes.length === 0 ? (
          <div className="bg-[#1A1D25] rounded-2xl border border-white/10 p-10 sm:p-12 text-center shadow-md">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-3 border border-amber-500/20">
              <GitPullRequest className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base">
              No se encontraron Solicitudes de Cambio (RFC)
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
              No hay cambios registrados que coincidan con la búsqueda. Puedes radicar una nueva RFC para proponer modificaciones controladas a un artefacto.
            </p>
            <Link
              href="/cambios/nueva"
              className="mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-upt-gold to-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
            >
              <Plus className="w-4 h-4" /> Radicar Nueva Solicitud (RFC)
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {solicitudes.map((rfc) => {
              const visual = getEstadoVisual(rfc.estado);
              const IconEstado = visual.icon;

              return (
                <div
                  key={rfc.id}
                  className={`bg-[#1A1D25] rounded-2xl border border-white/10 border-l-4 ${visual.borderAccent} hover:border-amber-400/40 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between overflow-hidden group shadow-md`}
                >
                  <div>
                    {/* Header de la Tarjeta */}
                    <div className="p-4 sm:p-5 pb-3 border-b border-white/5 bg-[#16181D] flex items-start justify-between gap-2.5">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                          <span className="font-mono text-xs font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 flex items-center gap-1">
                            <GitPullRequest className="w-3 h-3 text-amber-400" />
                            {rfc.codigo}
                          </span>
                          <span className="text-[10px] font-bold text-slate-300 bg-white/10 px-2 py-0.5 rounded-md">
                            {rfc.ecs.proyecto.codigo}
                          </span>
                        </div>
                        
                        <h3 className="font-bold text-white text-sm sm:text-base group-hover:text-amber-300 transition leading-snug">
                          {rfc.ecs.codigo}: {rfc.ecs.nombre}
                        </h3>
                      </div>

                      {/* Badge de Estado con Icono */}
                      <div className="shrink-0">
                        <span className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] px-2.5 py-1 rounded-xl uppercase tracking-wider ${visual.badge}`}>
                          <IconEstado className="w-3 h-3 stroke-[2.5]" />
                          <span>{visual.label}</span>
                        </span>
                      </div>
                    </div>

                    {/* Cuerpo de la Tarjeta */}
                    <div className="p-4 sm:p-5 py-4 space-y-3.5">
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        <strong className="text-white font-semibold">Motivo:</strong> {rfc.descripcion}
                      </p>

                      {/* Fila de Versión Base & Nivel de Impacto */}
                      <div className="bg-[#14161E] rounded-xl p-3 border border-white/10 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                          <span>Versión Base:</span>
                          <span className="font-mono font-bold text-amber-300 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                            v{rfc.version_base.numero_version}
                          </span>
                        </div>
                        <div>{renderBadgeImpacto(rfc.evaluacion?.impacto)}</div>
                      </div>

                      {/* Artefactos Colaterales Afectados */}
                      {rfc._count.ecs_afectados > 0 && (
                        <div className="text-[11px] font-bold text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>Afecta a {rfc._count.ecs_afectados} artefactos colaterales</span>
                        </div>
                      )}

                      {/* Solicitante y Fecha */}
                      <div className="flex flex-col gap-1 pt-1 text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">
                            Solicitado por: <strong className="text-slate-200">{rfc.solicitante.nombre_completo}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>
                            {new Date(rfc.created_at).toLocaleDateString('es-PE', {
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
                  </div>

                  {/* Botón de Acción */}
                  <div className="p-4 pt-0">
                    <Link
                      href={`/cambios/${rfc.id}`}
                      className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/10 transition flex items-center justify-between group/btn"
                    >
                      <span>Inspeccionar Expediente y Dictamen</span>
                      <ChevronRight className="w-4 h-4 text-amber-400 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </AppShell>
  );
}
