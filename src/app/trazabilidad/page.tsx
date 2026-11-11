'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitCommit,
  Layers,
  Lock,
  GitPullRequest,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Search,
  Filter,
  ShieldCheck,
  FolderGit2,
  AlertTriangle,
  FileCheck2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Activity,
  Network,
  Table,
  Loader2,
  Compass,
  Printer,
} from 'lucide-react';
import AppShell from '@/components/AppShell';

interface SolicitudTrazabilidad {
  id: string;
  codigo: string;
  estado: string;
  descripcion: string;
  impacto: string | null;
  version_resultante: string | null;
}

interface LineaBaseTrazabilidad {
  id: string;
  codigo: string;
  nombre: string;
  estado: string;
  created_at: string;
}

interface VersionTrazabilidad {
  id: string;
  numero_version: string;
  descripcion: string;
  estado: string;
  archivo_url: string | null;
  fecha_aprobacion: string | null;
  autor: string;
  aprobador: string | null;
  lineas_base: LineaBaseTrazabilidad[];
  solicitudes_cambio: SolicitudTrazabilidad[];
}

interface EcsTrazabilidad {
  id: string;
  codigo: string;
  nombre: string;
  tipo: string;
  ubicacion: string;
  responsable: string;
  tiene_aprobada: boolean;
  esta_congelado: boolean;
  versiones: VersionTrazabilidad[];
}

interface ProyectoTrazabilidad {
  id: string;
  codigo: string;
  nombre: string;
  cliente: string;
  estado: string;
  metricas: {
    total_ecs: number;
    total_versiones: number;
    versiones_aprobadas: number;
    ecs_con_aprobacion: number;
    porcentaje_aprobacion: number;
    ecs_congelados: number;
    porcentaje_congelado: number;
    lineas_base_total: number;
    lineas_base_vigentes: number;
    rfcs_totales: number;
    rfcs_pendientes: number;
    rfcs_aprobadas: number;
    rfcs_implementadas: number;
  };
  elementos_config: EcsTrazabilidad[];
}

interface ProyectoAux {
  id: string;
  codigo: string;
  nombre: string;
}

export default function TrazabilidadPage() {
  const [proyectos, setProyectos] = useState<ProyectoAux[]>([]);
  const [proyectoSeleccionadoId, setProyectoSeleccionadoId] = useState<string>('');
  const [proyectoActual, setProyectoActual] = useState<ProyectoTrazabilidad | null>(null);
  const [loading, setLoading] = useState(true);
  const [vistaModo, setVistaModo] = useState<'MAPA' | 'TABLA'>('MAPA');
  const [searchEcs, setSearchEcs] = useState('');

  // 1. Cargar Proyectos
  useEffect(() => {
    const fetchProyectos = async () => {
      try {
        const res = await fetch('/api/auxiliares');
        const data = await res.json();
        if (data.success && data.data.proyectos?.length > 0) {
          setProyectos(data.data.proyectos);
          setProyectoSeleccionadoId(data.data.proyectos[0].id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error al cargar proyectos auxiliares:', err);
        setLoading(false);
      }
    };
    fetchProyectos();
  }, []);

  // 2. Cargar Matriz de Trazabilidad del Proyecto
  const loadTrazabilidad = async (proyectoId: string) => {
    if (!proyectoId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/trazabilidad?proyectoId=${proyectoId}`);
      const data = await res.json();
      if (data.success && data.data) {
        const actual = Array.isArray(data.data)
          ? (data.data.find((p: any) => p.id === proyectoId) || data.data[0] || null)
          : data.data;
        setProyectoActual(actual);
      }
    } catch (err) {
      console.error('Error al cargar matriz de trazabilidad:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (proyectoSeleccionadoId) {
      loadTrazabilidad(proyectoSeleccionadoId);
    }
  }, [proyectoSeleccionadoId]);

  // Filtrado de ECS dentro del proyecto
  const ecsFiltrados = (proyectoActual?.elementos_config || []).filter((item) => {
    if (!searchEcs) return true;
    const term = searchEcs.toLowerCase();
    return item.codigo.toLowerCase().includes(term) || item.nombre.toLowerCase().includes(term);
  });

  return (
    <AppShell>
      {/* Sub-header contextual */}
      <div className="bg-[#16181D] border-b border-white/10 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Matriz de Trazabilidad End-to-End
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 uppercase tracking-wider">
                  RF-17 • ISO 10007
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Cadena de custodia: Requerimiento ➔ ECS ➔ Versión ➔ Línea Base ➔ RFC
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-upt-gold to-amber-400 hover:brightness-110 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition"
              title="Exportar Matriz RTM a PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>
            <Link
              href="/lineas-base"
              className="px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Líneas Base</span>
            </Link>
            <Link
              href="/cambios"
              className="px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center gap-1.5"
            >
              <GitPullRequest className="w-3.5 h-3.5 text-amber-400" />
              <span>Cambios</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        
        {/* Encabezado Oficial solo en Impresión PDF */}
        <div className="hidden print:block mb-6 border-b-2 border-slate-900 pb-3">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold text-slate-900">SGCS • MATRIZ DE TRAZABILIDAD END-TO-END (RTM)</h1>
              <p className="text-xs text-slate-700 font-bold">
                Proyecto: {proyectoActual?.codigo} - {proyectoActual?.nombre} • Cliente: {proyectoActual?.cliente}
              </p>
              <p className="text-[10px] text-slate-500">Cadena de custodia de requisitos, entregables, líneas base y cambios aprobados (ISO 10007)</p>
            </div>
            <div className="text-right text-[10px] text-slate-500 font-mono">
              Fecha de Emisión: {new Date().toLocaleDateString('es-ES')}
            </div>
          </div>
        </div>

        {/* Selector de Proyecto y Selector de Vista */}
        <div className="bg-[#1A1D25] p-4 sm:p-5 rounded-2xl border border-white/10 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm shrink-0">
              <FolderGit2 className="w-4 h-4 text-amber-400" />
              <span>Proyecto Auditado:</span>
            </div>
            <select
              value={proyectoSeleccionadoId}
              onChange={(e) => setProyectoSeleccionadoId(e.target.value)}
              className="px-3.5 py-2 bg-[#14161E] border border-white/10 rounded-xl text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-amber-400/50 transition cursor-pointer"
            >
              {proyectos.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#1A1D25] text-white">
                  {p.codigo} - {p.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Modo de Visualización (Mapa vs Tabla) */}
          <div className="flex items-center gap-1 bg-[#14161E] p-1 rounded-xl border border-white/10 shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setVistaModo('MAPA')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                vistaModo === 'MAPA'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Mapa de Flujo</span>
            </button>
            <button
              onClick={() => setVistaModo('TABLA')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                vistaModo === 'TABLA'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Matriz Tabular</span>
            </button>
          </div>
        </div>

        {/* Indicadores de Salud de la Configuración */}
        {proyectoActual && proyectoActual.metricas && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Métrica 1: ECS Registrados */}
            <div className="bg-[#1A1D25] p-4 sm:p-5 rounded-2xl border border-white/10 border-l-4 border-l-sky-500 shadow-md">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                1. Inventario Técnico
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-bold text-white">
                  {proyectoActual.metricas.total_ecs ?? 0}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {proyectoActual.metricas.total_versiones ?? 0} versiones
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 truncate">Elementos de Configuración (ECS)</p>
            </div>

            {/* Métrica 2: Aprobación Técnica */}
            <div className="bg-[#1A1D25] p-4 sm:p-5 rounded-2xl border border-white/10 border-l-4 border-l-emerald-500 shadow-md">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
                2. Pre-Factibilidad
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-bold text-emerald-400">
                  {proyectoActual.metricas.porcentaje_aprobacion ?? 0}%
                </span>
                <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  {proyectoActual.metricas.ecs_con_aprobacion ?? 0} / {proyectoActual.metricas.total_ecs ?? 0}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 truncate">ECS con versión aprobada</p>
            </div>

            {/* Métrica 3: Congelamiento en Línea Base */}
            <div className="bg-[#1A1D25] p-4 sm:p-5 rounded-2xl border border-white/10 border-l-4 border-l-amber-400 shadow-md">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
                3. Líneas Base
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-bold text-amber-400">
                  {proyectoActual.metricas.porcentaje_congelado ?? 0}%
                </span>
                <span className="text-xs font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30">
                  {proyectoActual.metricas.lineas_base_vigentes ?? 0} vigentes
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 truncate">ECS congelados bajo control</p>
            </div>

            {/* Métrica 4: Solicitudes de Cambio */}
            <div className="bg-[#1A1D25] p-4 sm:p-5 rounded-2xl border border-white/10 border-l-4 border-l-rose-500 shadow-md">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-rose-400 block">
                4. Control de Cambios (RFC)
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-bold text-white">
                  {proyectoActual.metricas.rfcs_totales ?? 0}
                </span>
                <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  {proyectoActual.metricas.rfcs_implementadas ?? 0} cerradas
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 truncate">
                {proyectoActual.metricas.rfcs_pendientes ?? 0} pendientes de evaluación
              </p>
            </div>
          </div>
        )}

        {/* Buscador de Artefactos dentro del proyecto */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchEcs}
            onChange={(e) => setSearchEcs(e.target.value)}
            placeholder="Filtrar por código de artefacto (ej. ECS-01) o nombre técnico..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#1A1D25] border border-white/10 rounded-xl text-xs sm:text-sm font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50 transition shadow-sm"
          />
        </div>

        {/* Contenido Dinámico: Modo Mapa vs Modo Tabla */}
        {loading ? (
          <div className="p-16 text-center bg-[#1A1D25] rounded-2xl border border-white/10 shadow-md">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-3" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Reconstruyendo cadena de custodia y matriz de trazabilidad...
            </p>
          </div>
        ) : ecsFiltrados.length === 0 ? (
          <div className="bg-[#1A1D25] rounded-2xl border border-white/10 p-12 text-center shadow-md">
            <ShieldCheck className="w-10 h-10 text-slate-500 mx-auto mb-2" />
            <h3 className="font-bold text-white text-base">Sin artefactos registrados en este proyecto</h3>
            <p className="text-xs text-slate-400 mt-1">
              Agrega Elementos de Configuración (ECS) para visualizar la cadena de trazabilidad.
            </p>
          </div>
        ) : vistaModo === 'MAPA' ? (
          /* MODO MAPA DE FLUJO (Horizontal Chain por cada ECS) */
          <div className="space-y-6">
            {ecsFiltrados.map((ecs) => (
              <div
                key={ecs.id}
                className="bg-[#1A1D25] rounded-2xl border border-white/10 border-l-4 border-l-amber-400 shadow-md hover:border-amber-400/40 transition-all duration-200 p-5 sm:p-6 space-y-4"
              >
                {/* Encabezado del ECS */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-amber-400" />
                      {ecs.codigo}
                    </span>
                    <h3 className="font-bold text-sm sm:text-base text-white">{ecs.nombre}</h3>
                    <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                      {ecs.tipo}
                    </span>
                  </div>

                  <Link
                    href={`/ecs/${ecs.id}`}
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 self-start sm:self-auto"
                  >
                    <span>Ver Ficha Técnica</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Cadena de Trazabilidad por Versiones */}
                <div className="space-y-3">
                  {ecs.versiones.length === 0 ? (
                    <div className="text-xs text-slate-400 italic bg-[#14161E] p-3 rounded-xl border border-white/10 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Este artefacto aún no cuenta con versiones registradas.</span>
                    </div>
                  ) : (
                    ecs.versiones.map((v) => {
                      const esAprobada = v.estado === 'APROBADA';
                      const enLineaBase = v.lineas_base.length > 0;
                      const tieneRfcs = v.solicitudes_cambio.length > 0;

                      return (
                        <div
                          key={v.id}
                          className="bg-[#14161E] rounded-xl p-4 border border-white/10 flex flex-col lg:flex-row items-stretch lg:items-center gap-3 lg:gap-4 overflow-x-auto"
                        >
                          {/* Nodo 1: Versión */}
                          <div className="bg-[#1A1D25] p-3 rounded-xl border border-white/10 shadow-sm shrink-0 sm:w-52">
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span className="font-mono text-amber-300">v{v.numero_version}</span>
                              {esAprobada ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Aprobada
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10">
                                  {v.estado}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-1">
                              Autor: <strong className="text-slate-300">{v.autor}</strong>
                            </p>
                            {v.aprobador && (
                              <p className="text-[10px] text-emerald-400 truncate">
                                Dictaminó: {v.aprobador}
                              </p>
                            )}
                          </div>

                          {/* Conector Flecha */}
                          <div className="hidden lg:flex text-slate-500 shrink-0">
                            <ArrowRight className="w-4 h-4" />
                          </div>

                          {/* Nodo 2: Línea Base donde está congelada */}
                          <div className="bg-[#1A1D25] p-3 rounded-xl border border-white/10 shadow-sm shrink-0 sm:w-56">
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                              Línea Base Inmutable
                            </span>
                            {enLineaBase ? (
                              v.lineas_base.map((lb) => (
                                <Link
                                  key={lb.id}
                                  href={`/lineas-base/${lb.id}`}
                                  className="font-mono text-xs font-bold text-white hover:text-amber-300 flex items-center gap-1 truncate"
                                >
                                  <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                  <span>{lb.codigo}</span>
                                  {lb.estado === 'VIGENTE' && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 ml-1 border border-emerald-500/30">
                                      Vigente
                                    </span>
                                  )}
                                </Link>
                              ))
                            ) : (
                              <span className="text-[11px] text-slate-500 italic">No congelada en LB</span>
                            )}
                          </div>

                          {/* Conector Flecha */}
                          <div className="hidden lg:flex text-slate-500 shrink-0">
                            <ArrowRight className="w-4 h-4" />
                          </div>

                          {/* Nodo 3: Solicitudes de Cambio (RFCs) */}
                          <div className="bg-[#1A1D25] p-3 rounded-xl border border-white/10 shadow-sm flex-1 min-w-[240px]">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                              Cambios Radicados (RFCs)
                            </span>
                            {tieneRfcs ? (
                              <div className="space-y-1.5">
                                {v.solicitudes_cambio.map((rfc) => (
                                  <Link
                                    key={rfc.id}
                                    href={`/cambios/${rfc.id}`}
                                    className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-[#14161E] hover:bg-white/5 border border-white/10 transition"
                                  >
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <GitPullRequest className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                      <span className="font-mono font-bold text-white truncate">
                                        {rfc.codigo}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                                        {rfc.estado}
                                      </span>
                                      {rfc.version_resultante && (
                                        <span className="text-[10px] font-bold text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded border border-purple-500/30">
                                          ➔ v{rfc.version_resultante}
                                        </span>
                                      )}
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-500 italic">Sin RFCs radicadas</span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* MODO MATRIZ TABULAR */
          <div className="bg-[#1A1D25] rounded-2xl border border-white/10 shadow-md overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-white/10 bg-[#16181D] flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Matriz Completa de Configuración y Trazabilidad
              </span>
              <span className="text-xs font-semibold text-slate-400">{ecsFiltrados.length} artefactos</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#14161E] border-b border-white/10 text-slate-400 uppercase font-bold tracking-wider text-[10px]">
                    <th className="py-3 px-4">Código ECS</th>
                    <th className="py-3 px-4">Nombre del Artefacto</th>
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4">Versiones</th>
                    <th className="py-3 px-4">Pre-Factibilidad</th>
                    <th className="py-3 px-4">Línea Base</th>
                    <th className="py-3 px-4">RFCs Activas</th>
                    <th className="py-3 px-4 text-right">Ficha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {ecsFiltrados.map((item) => {
                    const ultVer = item.versiones[item.versiones.length - 1];
                    const tieneLb = item.versiones.some((v) => v.lineas_base.length > 0);
                    const totalRfcs = item.versiones.reduce((acc, v) => acc + v.solicitudes_cambio.length, 0);

                    return (
                      <tr key={item.id} className="hover:bg-white/5 transition">
                        <td className="py-3 px-4 font-mono font-bold text-amber-300">{item.codigo}</td>
                        <td className="py-3 px-4 font-bold text-white">{item.nombre}</td>
                        <td className="py-3 px-4 text-slate-400 font-medium">{item.tipo}</td>
                        <td className="py-3 px-4 font-mono font-medium text-slate-300">
                          {ultVer ? `v${ultVer.numero_version}` : 'N/A'} ({item.versiones.length})
                        </td>
                        <td className="py-3 px-4">
                          {item.tiene_aprobada ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Aprobado
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                              Pendiente
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {tieneLb ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              <Lock className="w-3 h-3 text-amber-400" /> Congelado
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-slate-500">Sin congelar</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {totalRfcs > 0 ? (
                            <span className="font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              {totalRfcs} RFC{totalRfcs > 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px]">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/ecs/${item.id}`}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold inline-flex items-center gap-1 transition"
                            title="Ver detalle"
                          >
                            <ChevronRight className="w-4 h-4 text-amber-400" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </AppShell>
  );
}
