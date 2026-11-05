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
  const [dataTrazabilidad, setDataTrazabilidad] = useState<ProyectoTrazabilidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [vistaModo, setVistaModo] = useState<'MAPA' | 'TABLA'>('MAPA');
  const [searchEcs, setSearchEcs] = useState('');

  // 1. Cargar proyectos auxiliares
  useEffect(() => {
    async function loadAux() {
      try {
        const res = await fetch('/api/auxiliares');
        const data = await res.json();
        if (data.success && data.data.proyectos.length > 0) {
          setProyectos(data.data.proyectos);
          setProyectoSeleccionadoId(data.data.proyectos[0].id);
        }
      } catch (err) {
        console.error('Error al cargar auxiliares:', err);
      }
    }
    loadAux();
  }, []);

  // 2. Cargar datos de trazabilidad al cambiar proyecto
  useEffect(() => {
    async function loadTrazabilidad() {
      setLoading(true);
      try {
        const url = proyectoSeleccionadoId
          ? `/api/trazabilidad?proyectoId=${proyectoSeleccionadoId}`
          : '/api/trazabilidad';
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setDataTrazabilidad(data.data);
        }
      } catch (err) {
        console.error('Error al cargar trazabilidad:', err);
      } finally {
        setLoading(false);
      }
    }

    loadTrazabilidad();
  }, [proyectoSeleccionadoId]);

  const proyectoActual = dataTrazabilidad[0] || null;

  // Filtrado de ECS en cliente
  const ecsFiltrados = proyectoActual
    ? proyectoActual.elementos_config.filter(
        (e) =>
          e.codigo.toLowerCase().includes(searchEcs.toLowerCase()) ||
          e.nombre.toLowerCase().includes(searchEcs.toLowerCase())
      )
    : [];

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
                  Matriz de Trazabilidad End-to-End
                </span>
                <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-upt-gold text-upt-navy-950 font-black uppercase tracking-wider shrink-0 shadow-sm">
                  RF-17 • ISO 10007
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-300 truncate">
                Cadena de custodia: Requerimiento ➔ ECS ➔ Versión ➔ Línea Base ➔ RFC
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-1 sm:pt-0 border-t border-white/10 sm:border-t-0 print:hidden">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl bg-upt-gold hover:bg-amber-400 text-upt-navy-950 font-black text-xs flex items-center gap-1.5 shadow transition active:scale-95"
              title="Exportar Matriz RTM a PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>
            <Link
              href="/lineas-base"
              className="px-2.5 py-1.5 text-xs font-bold rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-upt-gold" /> Líneas Base
            </Link>
            <Link
              href="/cambios"
              className="px-2.5 py-1.5 text-xs font-bold rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition flex items-center gap-1.5"
            >
              <GitPullRequest className="w-3.5 h-3.5 text-amber-400" /> Cambios
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6">
        
        {/* Encabezado Oficial solo en Impresión PDF */}
        <div className="hidden print:block mb-6 border-b-2 border-slate-900 pb-3">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-black text-slate-900">SGCS • MATRIZ DE TRAZABILIDAD END-TO-END (RTM)</h1>
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
        <div className="bg-white p-4 sm:p-6 rounded-3xl border-2 border-slate-300 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 text-upt-navy-900 font-black text-sm shrink-0">
              <FolderGit2 className="w-5 h-5 text-upt-gold-600" />
              <span>Proyecto Auditado:</span>
            </div>
            <select
              value={proyectoSeleccionadoId}
              onChange={(e) => setProyectoSeleccionadoId(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:border-upt-navy-700 focus:ring-4 focus:ring-upt-gold/20 transition cursor-pointer"
            >
              {proyectos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.codigo} - {p.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Modo de Visualización (Mapa vs Tabla) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-300 shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setVistaModo('MAPA')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition ${
                vistaModo === 'MAPA'
                  ? 'bg-upt-navy-900 text-upt-gold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Mapa de Flujo</span>
            </button>
            <button
              onClick={() => setVistaModo('TABLA')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition ${
                vistaModo === 'TABLA'
                  ? 'bg-upt-navy-900 text-upt-gold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Matriz Tabular</span>
            </button>
          </div>
        </div>

        {/* Indicadores de Salud de la Configuración (Configuration Status Accounting) */}
        {proyectoActual && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {/* Métrica 1: ECS Registrados */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-slate-300 border-l-[6px] border-l-upt-navy-700 shadow-md">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                1. Inventario Técnico
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-black text-slate-950">
                  {proyectoActual.metricas.total_ecs}
                </span>
                <span className="text-xs font-bold text-slate-600">
                  {proyectoActual.metricas.total_versiones} versiones
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 truncate">Elementos de Configuración (ECS)</p>
            </div>

            {/* Métrica 2: Aprobación Técnica */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-slate-300 border-l-[6px] border-l-emerald-600 shadow-md">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-emerald-800 block">
                2. Pre-Factibilidad
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-black text-emerald-700">
                  {proyectoActual.metricas.porcentaje_aprobacion}%
                </span>
                <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-md">
                  {proyectoActual.metricas.ecs_con_aprobacion} / {proyectoActual.metricas.total_ecs}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 truncate">ECS con versión aprobada</p>
            </div>

            {/* Métrica 3: Congelamiento en Línea Base */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-slate-300 border-l-[6px] border-l-upt-gold shadow-md">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-800 block">
                3. Líneas Base
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-black text-amber-800">
                  {proyectoActual.metricas.porcentaje_congelado}%
                </span>
                <span className="text-xs font-bold text-upt-navy-950 bg-amber-100 px-2 py-0.5 rounded-md">
                  {proyectoActual.metricas.lineas_base_vigentes} vigentes
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 truncate">ECS congelados bajo control</p>
            </div>

            {/* Métrica 4: Solicitudes de Cambio */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-slate-300 border-l-[6px] border-l-amber-500 shadow-md">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-900 block">
                4. Control de Cambios (RFC)
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-black text-slate-950">
                  {proyectoActual.metricas.rfcs_totales}
                </span>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  {proyectoActual.metricas.rfcs_implementadas} cerradas
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 truncate">
                {proyectoActual.metricas.rfcs_pendientes} pendientes de evaluación
              </p>
            </div>
          </div>
        )}

        {/* Buscador de Artefactos dentro del proyecto */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchEcs}
            onChange={(e) => setSearchEcs(e.target.value)}
            placeholder="Filtrar por código de artefacto (ej. ECS-01) o nombre técnico..."
            className="w-full pl-11 pr-4 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-upt-navy-700 focus:ring-4 focus:ring-upt-gold/20 transition shadow-sm"
          />
        </div>

        {/* Contenido Dinámico: Modo Mapa vs Modo Tabla */}
        {loading ? (
          <div className="p-16 text-center bg-white rounded-3xl border-2 border-slate-300 shadow-md">
            <Loader2 className="w-10 h-10 animate-spin text-upt-navy-700 mx-auto mb-3" />
            <p className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Reconstruyendo cadena de custodia y matriz de trazabilidad...
            </p>
          </div>
        ) : ecsFiltrados.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-300 p-12 text-center shadow-md">
            <ShieldCheck className="w-12 h-12 text-slate-400 mx-auto mb-2" />
            <h3 className="font-black text-slate-900 text-base">Sin artefactos registrados en este proyecto</h3>
            <p className="text-xs text-slate-500 mt-1">
              Agrega Elementos de Configuración (ECS) para visualizar la cadena de trazabilidad.
            </p>
          </div>
        ) : vistaModo === 'MAPA' ? (
          /* MODO MAPA DE FLUJO (Horizontal Chain por cada ECS) */
          <div className="space-y-6">
            {ecsFiltrados.map((ecs) => (
              <div
                key={ecs.id}
                className="bg-white rounded-3xl border-2 border-slate-300 border-l-[6px] border-l-upt-navy-700 shadow-md hover:shadow-xl transition-all duration-200 p-5 sm:p-6 space-y-4"
              >
                  {/* Encabezado del ECS */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-black text-upt-navy-950 bg-upt-gold/25 px-2.5 py-0.5 rounded-lg border border-upt-gold/50 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-upt-navy-900" />
                        {ecs.codigo}
                      </span>
                      <h3 className="font-black text-sm sm:text-base text-slate-950">{ecs.nombre}</h3>
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {ecs.tipo}
                      </span>
                    </div>

                    <Link
                      href={`/ecs/${ecs.id}`}
                      className="text-xs font-bold text-upt-navy-700 hover:text-upt-gold-600 flex items-center gap-1 self-start sm:self-auto"
                    >
                      <span>Ver Ficha Técnica</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Cadena de Trazabilidad por Versiones */}
                  <div className="space-y-3">
                    {ecs.versiones.length === 0 ? (
                      <div className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
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
                            className="bg-slate-50/90 rounded-2xl p-4 border border-slate-300 flex flex-col lg:flex-row items-stretch lg:items-center gap-3 lg:gap-4 overflow-x-auto"
                          >
                            {/* Nodo 1: Versión */}
                            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm shrink-0 sm:w-52">
                              <div className="flex items-center justify-between text-xs font-black">
                                <span className="font-mono text-upt-navy-900">v{v.numero_version}</span>
                                {esAprobada ? (
                                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Aprobada
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                    {v.estado}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-600 truncate mt-1">
                                Autor: <strong>{v.autor}</strong>
                              </p>
                              {v.aprobador && (
                                <p className="text-[10px] text-emerald-700 truncate">
                                  Dictaminó: {v.aprobador}
                                </p>
                              )}
                            </div>

                            {/* Conector Flecha */}
                            <div className="hidden lg:flex text-slate-400 shrink-0">
                              <ArrowRight className="w-4 h-4" />
                            </div>

                            {/* Nodo 2: Línea Base donde está congelada */}
                            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm shrink-0 sm:w-56">
                              <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider block mb-1">
                                Línea Base Inmutable
                              </span>
                              {enLineaBase ? (
                                v.lineas_base.map((lb) => (
                                  <Link
                                    key={lb.id}
                                    href={`/lineas-base/${lb.id}`}
                                    className="font-mono text-xs font-black text-upt-navy-900 hover:text-upt-gold-600 flex items-center gap-1 truncate"
                                  >
                                    <Lock className="w-3.5 h-3.5 text-upt-gold shrink-0" />
                                    <span>{lb.codigo}</span>
                                    {lb.estado === 'VIGENTE' && (
                                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 ml-1">
                                        Vigente
                                      </span>
                                    )}
                                  </Link>
                                ))
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">No congelada en LB</span>
                              )}
                            </div>

                            {/* Conector Flecha */}
                            <div className="hidden lg:flex text-slate-400 shrink-0">
                              <ArrowRight className="w-4 h-4" />
                            </div>

                            {/* Nodo 3: Solicitudes de Cambio (RFCs) originadas desde esta versión */}
                            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex-1 min-w-[240px]">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                                Cambios Radicados (RFCs)
                              </span>
                              {tieneRfcs ? (
                                <div className="space-y-1.5">
                                  {v.solicitudes_cambio.map((rfc) => (
                                    <Link
                                      key={rfc.id}
                                      href={`/cambios/${rfc.id}`}
                                      className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-slate-50 hover:bg-upt-gold/10 border border-slate-200 transition"
                                    >
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <GitPullRequest className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                        <span className="font-mono font-black text-slate-900 truncate">
                                          {rfc.codigo}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1 shrink-0">
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-800">
                                          {rfc.estado}
                                        </span>
                                        {rfc.version_resultante && (
                                          <span className="text-[10px] font-black text-purple-800 bg-purple-100 px-1.5 py-0.5 rounded border border-purple-200">
                                            ➔ v{rfc.version_resultante}
                                          </span>
                                        )}
                                      </div>
                                    </Link>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">Sin RFCs radicadas</span>
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
          /* MODO MATRIZ TABULAR (Formal para Auditorías) */
          <div className="bg-white rounded-3xl border-2 border-slate-300 shadow-md overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Matriz Completa de Configuración y Trazabilidad
              </span>
              <span className="text-xs font-bold text-slate-600">{ecsFiltrados.length} artefactos</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 uppercase font-black tracking-wider text-[10px]">
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
                <tbody className="divide-y divide-slate-100">
                  {ecsFiltrados.map((item) => {
                    const ultVer = item.versiones[item.versiones.length - 1];
                    const tieneLb = item.versiones.some((v) => v.lineas_base.length > 0);
                    const totalRfcs = item.versiones.reduce((acc, v) => acc + v.solicitudes_cambio.length, 0);

                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-mono font-black text-upt-navy-900">{item.codigo}</td>
                        <td className="py-3 px-4 font-bold text-slate-950">{item.nombre}</td>
                        <td className="py-3 px-4 text-slate-600 font-medium">{item.tipo}</td>
                        <td className="py-3 px-4 font-mono font-bold">
                          {ultVer ? `v${ultVer.numero_version}` : 'N/A'} ({item.versiones.length})
                        </td>
                        <td className="py-3 px-4">
                          {item.tiene_aprobada ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Aprobado
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                              Pendiente
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {tieneLb ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300">
                              <Lock className="w-3 h-3 text-upt-gold" /> Congelado
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-slate-400">Sin congelar</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {totalRfcs > 0 ? (
                            <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              {totalRfcs} RFC{totalRfcs > 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/ecs/${item.id}`}
                            className="p-1.5 rounded-lg bg-upt-navy-50 hover:bg-upt-navy-100 text-upt-navy-900 font-bold inline-flex items-center gap-1 transition"
                            title="Ver detalle"
                          >
                            <ChevronRight className="w-4 h-4 text-upt-gold" />
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
    </div>
  );
}
