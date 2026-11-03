'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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

  const renderBadgeEstado = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE_EVALUACION':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-700" /> Pendiente Evaluación
          </span>
        );
      case 'EN_EVALUACION':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-sky-100 text-sky-900 border border-sky-300">
            <Activity className="w-3.5 h-3.5 text-sky-700" /> En Evaluación Técnica
          </span>
        );
      case 'APROBADA':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Aprobada por Comité
          </span>
        );
      case 'RECHAZADA':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-red-100 text-red-900 border border-red-300">
            <XCircle className="w-3.5 h-3.5 text-red-600" /> Rechazada
          </span>
        );
      case 'IMPLEMENTADA':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-300">
            <GitCommit className="w-3.5 h-3.5 text-purple-700" /> Implementada
          </span>
        );
      default:
        return null;
    }
  };

  const renderBadgeImpacto = (impacto?: string) => {
    switch (impacto) {
      case 'CRITICO':
        return (
          <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-red-600 text-white uppercase">
            Impacto Crítico
          </span>
        );
      case 'ALTO':
        return (
          <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-orange-100 text-orange-900 border border-orange-300 uppercase">
            Impacto Alto
          </span>
        );
      case 'MEDIO':
        return (
          <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 uppercase">
            Impacto Medio
          </span>
        );
      case 'BAJO':
        return (
          <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-blue-100 text-blue-900 border border-blue-300 uppercase">
            Impacto Bajo
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 italic">
            Sin evaluar
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      {/* Top Navbar Unificada */}
      <header className="bg-upt-navy-900 text-white border-b-2 border-upt-gold shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 rounded-xl bg-upt-navy-800 hover:bg-upt-navy-700 text-upt-gold transition border border-upt-gold/30"
              title="Volver al Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base text-white tracking-tight">
                  Gestión de Cambios (RFC)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-upt-gold text-upt-navy-950 font-black uppercase">
                  RF-11 al RF-15
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Control formal de modificaciones, análisis de impacto y dictamen técnico
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/lineas-base"
              className="hidden sm:inline-flex px-3.5 py-1.5 text-xs font-semibold rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition items-center gap-1.5"
            >
              <Lock className="w-4 h-4 text-upt-gold" /> Líneas Base
            </Link>
            <Link
              href="/cambios/nueva"
              className="px-4 py-2 rounded-xl bg-upt-gold hover:bg-upt-gold-600 text-upt-navy-950 font-black text-xs sm:text-sm shadow-md transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Nueva Solicitud (RFC)
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        
        {/* Banner Explicativo: ¿Por qué existe una RFC? */}
        <div className="bg-gradient-to-r from-upt-navy-900 via-upt-navy-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-upt-navy-700 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-upt-gold/15 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-upt-gold/20 text-upt-gold border border-upt-gold/40 text-xs font-bold uppercase tracking-wider">
                <GitPullRequest className="w-3.5 h-3.5" />
                <span>Control de Configuración (ISO 10007 / CMMI)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                ¿Qué es una Solicitud de Cambio (RFC)?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Cuando una especificación ya está congelada en una Línea Base, <strong className="text-white font-bold">ningún cambio puede aplicarse directamente</strong>. 
                Se emite una RFC para que el especialista técnico evalúe su <span className="text-amber-400 font-semibold">impacto en costos, plazos y artefactos colaterales</span> antes de dictaminar formalmente.
              </p>
            </div>

            <div className="flex sm:flex-col gap-2 shrink-0">
              <div className="bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/10 text-center">
                <span className="text-[10px] text-slate-300 uppercase font-black block">Por Evaluar / Resolver</span>
                <span className="text-2xl font-black text-amber-400">{totalPendientes}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/10 text-center">
                <span className="text-[10px] text-slate-300 uppercase font-black block">Aprobadas / Implementadas</span>
                <span className="text-2xl font-black text-emerald-400">{totalAprobadas + totalImplementadas}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Consola de Búsqueda y Filtros de Alto Contraste */}
        <div className="bg-white p-5 rounded-3xl border-2 border-slate-300 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Search className="w-4 h-4 text-upt-gold-600" />
              <span>Buscador y Filtros de Solicitudes de Cambio</span>
            </span>
            <span className="text-xs font-bold text-slate-500">
              {solicitudes.length} solicitudes encontradas
            </span>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            {/* Input de Búsqueda */}
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-3 text-upt-gold-600" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por código (ej. RFC-2026-001), justificación o nombre del ECS..."
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:border-upt-navy-700 focus:ring-4 focus:ring-upt-gold/20 transition"
              />
            </div>

            {/* Filtro Proyecto */}
            <div className="sm:w-56">
              <select
                value={proyectoFiltro}
                onChange={(e) => setProyectoFiltro(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:border-upt-navy-700 focus:ring-4 focus:ring-upt-gold/20 transition cursor-pointer"
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
                className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:border-upt-navy-700 focus:ring-4 focus:ring-upt-gold/20 transition cursor-pointer"
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
              className="px-6 py-2.5 rounded-2xl bg-upt-navy-700 hover:bg-upt-navy-800 text-upt-gold font-black text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>Buscar</span>
            </button>
          </form>
        </div>

        {/* Grilla de Solicitudes (RFC) */}
        {loading ? (
          <div className="p-16 text-center bg-white rounded-3xl border-2 border-slate-200 shadow-sm">
            <Loader2 className="w-10 h-10 animate-spin text-upt-navy-700 mx-auto mb-3" />
            <p className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Consultando registro de Solicitudes de Cambio...
            </p>
          </div>
        ) : solicitudes.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-300 p-12 text-center shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-upt-garnet flex items-center justify-center mx-auto mb-3 border border-red-200">
              <GitPullRequest className="w-7 h-7" />
            </div>
            <h3 className="font-black text-slate-900 text-base">
              No se encontraron Solicitudes de Cambio (RFC)
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto leading-relaxed">
              No hay cambios que coincidan con los filtros aplicados. Puedes registrar una nueva RFC para proponer modificaciones controladas a un artefacto.
            </p>
            <Link
              href="/cambios/nueva"
              className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-upt-navy-700 hover:bg-upt-navy-800 text-upt-gold font-black text-xs shadow-md transition"
            >
              <Plus className="w-4 h-4" /> Radicar Nueva Solicitud (RFC)
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solicitudes.map((rfc) => (
              <div
                key={rfc.id}
                className="bg-white rounded-3xl border-2 border-slate-200 shadow-md hover:border-upt-navy-600 hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Header de la Tarjeta */}
                  <div className="p-5 pb-3 border-b border-slate-100 flex items-start justify-between gap-3 bg-gradient-to-br from-slate-50 to-white">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                        <span className="font-mono text-xs font-black text-upt-navy-900 bg-upt-navy-50 px-2.5 py-1 rounded-xl border border-upt-navy-200 flex items-center gap-1.5">
                          <GitPullRequest className="w-3.5 h-3.5 text-upt-gold-600" />
                          {rfc.codigo}
                        </span>
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                          {rfc.ecs.proyecto.codigo}
                        </span>
                      </div>
                      <h3 className="font-black text-slate-900 text-sm group-hover:text-upt-navy-700 transition leading-snug">
                        {rfc.ecs.codigo}: {rfc.ecs.nombre}
                      </h3>
                    </div>

                    {renderBadgeEstado(rfc.estado)}
                  </div>

                  {/* Cuerpo de la Tarjeta */}
                  <div className="p-5 py-4 space-y-3">
                    <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
                      <strong>Motivo:</strong> {rfc.descripcion}
                    </p>

                    {/* Versión Base & Impacto */}
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <span className="font-bold">Versión Base:</span>
                        <span className="font-mono font-bold text-upt-navy-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                          v{rfc.version_base.numero_version}
                        </span>
                      </div>
                      <div>{renderBadgeImpacto(rfc.evaluacion?.impacto)}</div>
                    </div>

                    {/* ECS Afectados colateralmente */}
                    {rfc._count.ecs_afectados > 0 && (
                      <div className="text-[11px] font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Afecta a {rfc._count.ecs_afectados} artefactos indirectos</span>
                      </div>
                    )}

                    {/* Solicitante y Fecha */}
                    <div className="flex flex-col gap-1 pt-1 text-[11px] text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          Solicitado por: <strong className="text-slate-800 font-bold">{rfc.solicitante.nombre_completo}</strong>
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

                {/* Footer con Enlace al Expediente */}
                <div className="p-4 pt-0">
                  <Link
                    href={`/cambios/${rfc.id}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-upt-navy-50 hover:bg-upt-navy-700 text-upt-navy-900 hover:text-upt-gold font-black text-xs transition flex items-center justify-center gap-1.5 group/btn border border-upt-navy-200"
                  >
                    <span>Inspeccionar Expediente y Dictamen</span>
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
