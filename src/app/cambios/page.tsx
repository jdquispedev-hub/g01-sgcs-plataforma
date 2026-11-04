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
          badge: 'bg-amber-500 text-slate-950 font-black border border-amber-400 shadow-sm',
          borderAccent: 'border-l-amber-500',
          icon: Clock,
        };
      case 'EN_EVALUACION':
        return {
          label: 'En Evaluación Técnica',
          badge: 'bg-sky-500 text-slate-950 font-black border border-sky-400 shadow-sm',
          borderAccent: 'border-l-sky-500',
          icon: Activity,
        };
      case 'APROBADA':
        return {
          label: 'Aprobada por Comité',
          badge: 'bg-emerald-600 text-white font-black border border-emerald-500 shadow-sm',
          borderAccent: 'border-l-emerald-500',
          icon: CheckCircle2,
        };
      case 'RECHAZADA':
        return {
          label: 'Rechazada',
          badge: 'bg-red-600 text-white font-black border border-red-500 shadow-sm',
          borderAccent: 'border-l-red-500',
          icon: XCircle,
        };
      case 'IMPLEMENTADA':
        return {
          label: 'Implementada',
          badge: 'bg-purple-600 text-white font-black border border-purple-500 shadow-sm',
          borderAccent: 'border-l-purple-500',
          icon: GitCommit,
        };
      default:
        return {
          label: estado,
          badge: 'bg-slate-200 text-slate-800',
          borderAccent: 'border-l-slate-400',
          icon: Clock,
        };
    }
  };

  const renderBadgeImpacto = (impacto?: string) => {
    switch (impacto) {
      case 'CRITICO':
        return (
          <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-red-600 text-white uppercase tracking-wider shadow-sm flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Impacto Crítico
          </span>
        );
      case 'ALTO':
        return (
          <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-orange-500 text-white uppercase tracking-wider shadow-sm flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-white" />
            Impacto Alto
          </span>
        );
      case 'MEDIO':
        return (
          <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 uppercase tracking-wider shadow-sm flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-900" />
            Impacto Medio
          </span>
        );
      case 'BAJO':
        return (
          <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-emerald-600 text-white uppercase tracking-wider shadow-sm flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-white" />
            Impacto Leve
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-200 text-slate-600 italic">
            Sin evaluar
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col antialiased">
      {/* Top Navbar Mobile-First (Sin solapamientos ni desbordes en 360px) */}
      <header className="bg-upt-navy-900 text-white border-b-2 border-upt-gold shadow-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-0 sm:h-16 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
          
          {/* Lado Izquierdo: Botón volver + Título + Subtítulo */}
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
                  Control de Solicitudes de Cambio (RFC - Request for Change)
                </span>
                <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-upt-gold text-upt-navy-950 font-black uppercase tracking-wider shrink-0 shadow-sm">
                  Paso 5: Modificaciones Formales
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-300 truncate">
                Evaluación técnica de impacto antes de autorizar cualquier cambio sobre Líneas Base
              </p>
            </div>
          </div>

          {/* Lado Derecho: Acciones y Botón Nueva Solicitud (Responsive) */}
          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-1 sm:pt-0 border-t border-white/10 sm:border-t-0">
            <Link
              href="/aprobaciones"
              className="px-2.5 py-1.5 text-xs font-bold rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-upt-gold" />
              <span>Evaluar RFC</span>
            </Link>
            <Link
              href="/cambios/nueva"
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-upt-gold to-amber-500 hover:from-amber-400 hover:to-upt-gold text-upt-navy-950 font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition flex items-center gap-1.5 shrink-0 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Nueva Solicitud (RFC)</span>
              <span className="sm:hidden font-bold">Nueva RFC</span>
            </Link>
          </div>

        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6">
        
        {/* Banner Explicativo de Alto Impacto */}
        <div
          className="bg-gradient-to-br from-upt-navy-900 via-slate-900 to-upt-navy-800 rounded-3xl p-5 sm:p-7 text-white shadow-2xl border-2 border-upt-navy-700/80 relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-upt-gold/15 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-upt-gold/20 text-upt-gold border border-upt-gold/40 text-[11px] font-black uppercase tracking-wider">
                <GitPullRequest className="w-3.5 h-3.5" />
                <span>Paso 5 del Proceso Oficial</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                ¿Cuándo se crea una Solicitud de Cambio (RFC)?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Cuando un entregable ya forma parte de un Hito Congelado (Línea Base), <strong className="text-white font-bold">nadie puede modificarlo directamente</strong>. 
                Se registra una RFC para que el comité evalúe su <span className="text-upt-gold font-bold">impacto en costos, cronograma y código</span> antes de autorizar una nueva versión.
              </p>
            </div>

            {/* Contadores Clave */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 shrink-0">
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-center">
                <span className="text-[10px] text-slate-300 uppercase font-black block">Por Evaluar</span>
                <span className="text-xl sm:text-2xl font-black text-amber-400">{totalPendientes}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-center">
                <span className="text-[10px] text-slate-300 uppercase font-black block">Aprobadas / Cierre</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-400">{totalAprobadas + totalImplementadas}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Consola de Búsqueda y Filtros de Alto Contraste */}
        <div
          className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-slate-300 shadow-lg space-y-3 sm:space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Search className="w-4 h-4 text-upt-gold-600" />
              <span>Buscador y Filtros de Solicitudes de Cambio</span>
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              {solicitudes.length} encontradas
            </span>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
            {/* Input de Búsqueda */}
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-3 text-upt-gold-600" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por código (ej. RFC-2026-001), justificación o ECS..."
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-upt-navy-700 focus:ring-4 focus:ring-upt-gold/20 transition shadow-inner"
              />
            </div>

            {/* Filtro Proyecto */}
            <div className="sm:w-56">
              <select
                value={proyectoFiltro}
                onChange={(e) => setProyectoFiltro(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:border-upt-navy-700 focus:ring-4 focus:ring-upt-gold/20 transition cursor-pointer"
              >
                <option value="">Todos los Proyectos</option>
                {proyectos.map((p) => (
                  <option key={p.id} value={p.id}>
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
                className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:border-upt-navy-700 focus:ring-4 focus:ring-upt-gold/20 transition cursor-pointer"
              >
                <option value="">Todos los Estados</option>
                <option value="PENDIENTE_EVALUACION">Pendiente de Evaluación</option>
                <option value="EN_EVALUACION">En Evaluación Técnica</option>
                <option value="APROBADA">Aprobada</option>
                <option value="RECHAZADA">Rechazada</option>
                <option value="IMPLEMENTADA">Implementada</option>
              </select>
            </div>

            {/* Botón Buscar */}
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-upt-navy-900 hover:bg-upt-navy-800 text-upt-gold font-black text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-1.5 shrink-0 active:scale-95"
            >
              <Search className="w-4 h-4" />
              <span>Buscar</span>
            </button>
          </form>
        </div>

        {/* Grilla de Tarjetas RFC de Alto Contraste */}
        {loading ? (
          <div className="p-16 text-center bg-white rounded-3xl border-2 border-slate-300 shadow-md">
            <Loader2 className="w-10 h-10 animate-spin text-upt-navy-700 mx-auto mb-3" />
            <p className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Consultando registro oficial de RFCs...
            </p>
          </div>
        ) : solicitudes.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-300 p-10 sm:p-12 text-center shadow-md">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-upt-garnet flex items-center justify-center mx-auto mb-3 border border-red-200">
              <GitPullRequest className="w-7 h-7" />
            </div>
            <h3 className="font-black text-slate-900 text-base">
              No se encontraron Solicitudes de Cambio (RFC)
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto leading-relaxed">
              No hay cambios registrados que coincidan con la búsqueda. Puedes radicar una nueva RFC para proponer modificaciones controladas a un artefacto.
            </p>
            <Link
              href="/cambios/nueva"
              className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-upt-navy-900 hover:bg-upt-navy-800 text-upt-gold font-black text-xs shadow-md transition"
            >
              <Plus className="w-4 h-4" /> Radicar Nueva Solicitud (RFC)
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {solicitudes.map((rfc) => {
              const visual = getEstadoVisual(rfc.estado);
              const IconEstado = visual.icon;

              return (
                <div
                  key={rfc.id}
                  className={`bg-white rounded-3xl border-2 border-slate-300 border-l-[6px] ${visual.borderAccent} shadow-[0_4px_20px_-4px_rgba(0,0,0,0.12)] hover:shadow-2xl hover:border-upt-gold/80 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between overflow-hidden group`}
                >
                    <div>
                      {/* Header de la Tarjeta */}
                      <div className="p-4 sm:p-5 pb-3 border-b border-slate-200/80 bg-gradient-to-br from-slate-50 to-white flex items-start justify-between gap-2.5">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                            <span className="font-mono text-xs font-black text-upt-navy-950 bg-upt-gold/25 px-2.5 py-0.5 rounded-lg border border-upt-gold/50 flex items-center gap-1">
                              <GitPullRequest className="w-3.5 h-3.5 text-upt-navy-900" />
                              {rfc.codigo}
                            </span>
                            <span className="text-[10px] font-black text-slate-700 bg-slate-200 px-2 py-0.5 rounded-md">
                              {rfc.ecs.proyecto.codigo}
                            </span>
                          </div>
                          
                          <h3 className="font-black text-slate-950 text-sm sm:text-base group-hover:text-upt-navy-800 transition leading-snug">
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

                      {/* Cuerpo de la Tarjeta con Alto Contraste */}
                      <div className="p-4 sm:p-5 py-4 space-y-3.5">
                        <p className="text-xs text-slate-800 line-clamp-2 leading-relaxed">
                          <strong className="text-slate-950 font-black">Motivo:</strong> {rfc.descripcion}
                        </p>

                        {/* Fila de Versión Base & Nivel de Impacto */}
                        <div className="bg-slate-100/90 rounded-2xl p-3 border border-slate-300 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                            <span>Versión Base:</span>
                            <span className="font-mono font-black text-upt-navy-950 bg-white px-2 py-0.5 rounded-md border border-slate-300 shadow-sm">
                              v{rfc.version_base.numero_version}
                            </span>
                          </div>
                          <div>{renderBadgeImpacto(rfc.evaluacion?.impacto)}</div>
                        </div>

                        {/* Artefactos Colaterales Afectados */}
                        {rfc._count.ecs_afectados > 0 && (
                          <div className="text-[11px] font-black text-amber-950 bg-amber-100/80 px-3 py-1.5 rounded-xl border border-amber-300 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                            <span>Afecta a {rfc._count.ecs_afectados} artefactos colaterales</span>
                          </div>
                        )}

                        {/* Solicitante y Fecha */}
                        <div className="flex flex-col gap-1 pt-1 text-[11px] text-slate-600 font-medium">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">
                              Solicitado por: <strong className="text-slate-900 font-bold">{rfc.solicitante.nombre_completo}</strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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

                    {/* Botón de Acción con Alto Contraste y Hover Activo */}
                    <div className="p-4 pt-0">
                      <Link
                        href={`/cambios/${rfc.id}`}
                        className="w-full py-2.5 px-4 rounded-xl bg-upt-navy-900 hover:bg-upt-navy-800 text-white hover:text-upt-gold font-black text-xs transition flex items-center justify-between group/btn shadow-md active:scale-98"
                      >
                        <span>Inspeccionar Expediente y Dictamen</span>
                        <ChevronRight className="w-4 h-4 text-upt-gold group-hover/btn:translate-x-1.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </main>
    </div>
  );
}
