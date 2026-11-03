'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Layers,
  Lock,
  GitPullRequest,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ChevronRight,
  Handshake,
  Users,
  Briefcase,
  AlertTriangle,
  FileText,
  Rocket,
  Kanban,
  ListOrdered,
  Plus,
  Loader2,
  Building,
  Check,
  Tag,
  ArrowUpRight,
} from 'lucide-react';

interface TimelineEvent {
  id: string;
  tipo: 'REUNION' | 'ECS_CREADO' | 'VERSION_APROBADA' | 'LINEA_BASE' | 'SOLICITUD_CAMBIO';
  fecha: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  badge: string;
  icono: string;
  metadata?: any;
}

interface ProyectoData {
  id: string;
  codigo: string;
  nombre: string;
  cliente_nombre: string;
  fecha_inicio: string;
  fecha_estimada_fin?: string | null;
  estado: string;
  reuniones: any[];
  elementos_config: any[];
  lineas_base: any[];
}

export default function CronogramaPage() {
  const [proyectos, setProyectos] = useState<{ id: string; codigo: string; nombre: string }[]>([]);
  const [selectedProyectoId, setSelectedProyectoId] = useState<string>('');
  const [proyecto, setProyecto] = useState<ProyectoData | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [solicitudesCambio, setSolicitudesCambio] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'TIMELINE' | 'CANVAS'>('TIMELINE');

  // Cargar lista de proyectos
  useEffect(() => {
    const fetchAux = async () => {
      try {
        const res = await fetch('/api/auxiliares');
        const data = await res.json();
        if (data.success && data.data.proyectos.length > 0) {
          setProyectos(data.data.proyectos);
          setSelectedProyectoId(data.data.proyectos[0].id);
        }
      } catch (err) {
        console.error('Error al cargar proyectos auxiliares:', err);
      }
    };
    fetchAux();
  }, []);

  // Cargar cronograma del proyecto seleccionado
  const loadCronograma = async (projId: string) => {
    if (!projId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/cronograma?proyectoId=${projId}`);
      const data = await res.json();
      if (data.success) {
        setProyecto(data.data.proyecto);
        setTimeline(data.data.timeline);
        setSolicitudesCambio(data.data.solicitudesCambio);
      }
    } catch (err) {
      console.error('Error al cargar cronograma:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProyectoId) {
      loadCronograma(selectedProyectoId);
    }
  }, [selectedProyectoId]);

  const getEventVisuals = (event: TimelineEvent) => {
    switch (event.tipo) {
      case 'REUNION':
        if (event.metadata?.tipo === 'CLIENTE') {
          return {
            dotColor: 'bg-emerald-500 ring-emerald-200',
            badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
            icon: Handshake,
            iconColor: 'text-emerald-700',
          };
        }
        return {
          dotColor: 'bg-blue-500 ring-blue-200',
          badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
          icon: Users,
          iconColor: 'text-blue-700',
        };
      case 'ECS_CREADO':
        return {
          dotColor: 'bg-purple-500 ring-purple-200',
          badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
          icon: FileText,
          iconColor: 'text-purple-700',
        };
      case 'VERSION_APROBADA':
        return {
          dotColor: 'bg-teal-500 ring-teal-200',
          badgeColor: 'bg-teal-100 text-teal-900 border-teal-300',
          icon: CheckCircle2,
          iconColor: 'text-teal-700',
        };
      case 'LINEA_BASE':
        return {
          dotColor: 'bg-amber-500 ring-amber-200',
          badgeColor: 'bg-amber-100 text-amber-950 border-amber-400 font-black',
          icon: Lock,
          iconColor: 'text-amber-700',
        };
      case 'SOLICITUD_CAMBIO':
      default:
        return {
          dotColor: 'bg-rose-500 ring-rose-200',
          badgeColor: 'bg-rose-100 text-rose-950 border-rose-300 font-black',
          icon: GitPullRequest,
          iconColor: 'text-rose-700',
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col antialiased">
      {/* Top Navbar */}
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
                  Línea de Tiempo y Canvas del Proyecto
                </span>
                <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-upt-gold text-upt-navy-950 font-black uppercase tracking-wider shrink-0 shadow-sm">
                  Roadmap & Historia Viva
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-300 truncate">
                De la reunión inicial con el cliente a los hitos congelados y pedidos de cambio
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-1 sm:pt-0 border-t border-white/10 sm:border-t-0">
            <Link
              href="/reuniones"
              className="px-2.5 py-1.5 text-xs font-bold rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition flex items-center gap-1.5"
            >
              <Handshake className="w-3.5 h-3.5 text-upt-gold" />
              <span>Reuniones</span>
            </Link>
            <Link
              href="/ecs"
              className="px-2.5 py-1.5 text-xs font-bold rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-upt-gold" />
              <span>Entregables</span>
            </Link>
            <Link
              href="/lineas-base"
              className="px-2.5 py-1.5 text-xs font-bold rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-upt-gold" />
              <span>Hitos</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        
        {/* Selector de Proyecto y Ficha Resumen */}
        <div className="bg-gradient-to-r from-upt-navy-900 via-slate-900 to-upt-navy-800 rounded-3xl p-6 text-white border-2 border-upt-navy-700 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-upt-gold flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" />
                <span>Proyecto en Inspección</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {proyecto?.nombre || 'Cargando proyecto...'}
              </h2>
              <p className="text-xs text-slate-300">
                Cliente Oficial: <strong className="text-upt-gold">{proyecto?.cliente_nombre}</strong> • Código: <span className="font-mono">{proyecto?.codigo}</span>
              </p>
            </div>

            {/* Selector de Proyecto */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-slate-300 hidden sm:inline">Cambiar Proyecto:</span>
              <select
                value={selectedProyectoId}
                onChange={(e) => setSelectedProyectoId(e.target.value)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-xs sm:text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-upt-gold transition cursor-pointer"
              >
                {proyectos.map((p) => (
                  <option key={p.id} value={p.id} className="text-slate-900">
                    {p.codigo} - {p.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Estadísticas de la Historia del Proyecto */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] text-slate-300 uppercase font-black block">Reuniones</span>
              <span className="text-xl font-black text-emerald-400">{proyecto?.reuniones?.length || 0}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] text-slate-300 uppercase font-black block">Entregables (ECS)</span>
              <span className="text-xl font-black text-blue-400">{proyecto?.elementos_config?.length || 0}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] text-slate-300 uppercase font-black block">Hitos Congelados</span>
              <span className="text-xl font-black text-amber-400">{proyecto?.lineas_base?.length || 0}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] text-slate-300 uppercase font-black block">Cambios (RFC)</span>
              <span className="text-xl font-black text-rose-400">{solicitudesCambio.length}</span>
            </div>
          </div>
        </div>

        {/* Barra de Alternancia de Vistas (Timeline vs Canvas) */}
        <div className="flex items-center justify-between border-b-2 border-slate-300 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('TIMELINE')}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 ${
                viewMode === 'TIMELINE'
                  ? 'bg-upt-navy-900 text-upt-gold shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              <span>Línea de Tiempo Cronológica ({timeline.length} eventos)</span>
            </button>
            <button
              onClick={() => setViewMode('CANVAS')}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 ${
                viewMode === 'CANVAS'
                  ? 'bg-upt-navy-900 text-upt-gold shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              <Kanban className="w-4 h-4" />
              <span>Tablero Canvas por Fases</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <Link
              href="/reuniones"
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 transition flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 text-upt-gold-600" />
              <span>Agendar Reunión</span>
            </Link>
          </div>
        </div>

        {/* Contenido según la vista seleccionada */}
        {loading ? (
          <div className="p-16 text-center bg-white rounded-3xl border-2 border-slate-200 shadow-sm">
            <Loader2 className="w-10 h-10 animate-spin text-upt-navy-700 mx-auto mb-3" />
            <p className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Generando línea de tiempo del proyecto...
            </p>
          </div>
        ) : viewMode === 'TIMELINE' ? (
          /* ========================================================
             VISTA 1: LÍNEA DE TIEMPO VERTICAL CONTINUA
             ======================================================== */
          <div className="bg-white rounded-3xl border-2 border-slate-300 p-6 sm:p-10 shadow-md">
            <div className="relative border-l-4 border-upt-gold/40 ml-4 sm:ml-8 space-y-8 py-2">
              {timeline.map((event, idx) => {
                const visuals = getEventVisuals(event);
                const EventIcon = visuals.icon;
                const fechaStr = new Date(event.fecha).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <div key={event.id} className="relative pl-7 sm:pl-9 group">
                    {/* Punto del Timeline */}
                    <div
                      className={`absolute -left-[14px] top-1.5 w-6 h-6 rounded-full border-4 border-white ${visuals.dotColor} ring-4 shadow-md flex items-center justify-center transition-transform group-hover:scale-125`}
                    />

                    {/* Tarjeta del Evento */}
                    <div className="bg-slate-50 hover:bg-white rounded-2xl border-2 border-slate-200 hover:border-upt-navy-600 p-4 sm:p-5 transition-all shadow-sm hover:shadow-lg space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${visuals.badgeColor}`}>
                            {event.badge}
                          </span>
                          <span className="text-xs font-bold text-slate-500 font-mono flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {fechaStr}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-slate-600 sm:text-right">
                          {event.subtitulo}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                          <EventIcon className={`w-4 h-4 shrink-0 ${visuals.iconColor}`} />
                          <span>{event.titulo}</span>
                        </h4>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {event.descripcion}
                        </p>
                      </div>

                      {/* Links contextuales */}
                      {event.tipo === 'REUNION' && (
                        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-end">
                          <Link
                            href="/reuniones"
                            className="text-xs font-bold text-upt-navy-800 hover:text-upt-gold-600 flex items-center gap-1 transition"
                          >
                            <span>Ver Minuta Completa</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}
                      {event.tipo === 'LINEA_BASE' && (
                        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-end">
                          <Link
                            href="/lineas-base"
                            className="text-xs font-bold text-upt-navy-800 hover:text-upt-gold-600 flex items-center gap-1 transition"
                          >
                            <span>Ver Alcance Congelado</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}
                      {event.tipo === 'SOLICITUD_CAMBIO' && (
                        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-end">
                          <Link
                            href="/cambios"
                            className="text-xs font-bold text-rose-800 hover:text-rose-950 flex items-center gap-1 transition"
                          >
                            <span>Ver Dictamen del Comité</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ========================================================
             VISTA 2: TABLERO CANVAS DE 4 FASES (TIPO KANBAN)
             ======================================================== */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Columna 1: Levantamiento con Cliente */}
            <div className="bg-slate-200/70 rounded-3xl p-4 border-2 border-slate-300 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Handshake className="w-4 h-4 text-emerald-700" />
                    <h3 className="font-black text-xs uppercase tracking-wider text-slate-800">
                      1. Con el Cliente
                    </h3>
                  </div>
                  <span className="text-[10px] font-black bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full border border-emerald-300">
                    {proyecto?.reuniones?.filter((r) => r.tipo === 'CLIENTE').length || 0}
                  </span>
                </div>

                <div className="space-y-3">
                  {proyecto?.reuniones
                    ?.filter((r) => r.tipo === 'CLIENTE')
                    .map((r) => (
                      <div
                        key={r.id}
                        className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5"
                      >
                        <span className="text-[10px] font-mono text-slate-500 block">
                          📅 {new Date(r.fecha).toLocaleDateString()}
                        </span>
                        <h4 className="text-xs font-black text-slate-900 leading-snug">
                          {r.titulo}
                        </h4>
                        <p className="text-[11px] text-slate-600 line-clamp-3">
                          {r.acuerdos}
                        </p>
                      </div>
                    ))}
                </div>
              </div>

              <Link
                href="/reuniones"
                className="w-full mt-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs text-center border border-slate-300 block shadow-sm transition"
              >
                + Registrar Reunión
              </Link>
            </div>

            {/* Columna 2: Planificación de Equipo y Entregables */}
            <div className="bg-slate-200/70 rounded-3xl p-4 border-2 border-slate-300 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-700" />
                    <h3 className="font-black text-xs uppercase tracking-wider text-slate-800">
                      2. Entregables Equipo
                    </h3>
                  </div>
                  <span className="text-[10px] font-black bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full border border-blue-300">
                    {proyecto?.elementos_config?.length || 0}
                  </span>
                </div>

                <div className="space-y-3">
                  {proyecto?.elementos_config?.map((ecs) => (
                    <div
                      key={ecs.id}
                      className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-upt-navy-900 bg-upt-gold/20 px-1.5 py-0.5 rounded">
                          {ecs.codigo}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold">
                          {ecs.tipo}
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-slate-900 leading-snug">
                        {ecs.nombre}
                      </h4>
                      <div className="text-[10px] text-slate-600 font-medium">
                        Versión actual:{' '}
                        <strong>
                          {ecs.versiones?.[ecs.versiones.length - 1]?.numero_version
                            ? `v${ecs.versiones[ecs.versiones.length - 1].numero_version}`
                            : 'Sin versión'}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href="/ecs"
                className="w-full mt-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs text-center border border-slate-300 block shadow-sm transition"
              >
                + Nuevo Entregable
              </Link>
            </div>

            {/* Columna 3: Hito Congelado (Línea Base Oficial) */}
            <div className="bg-slate-200/70 rounded-3xl p-4 border-2 border-slate-300 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-700" />
                    <h3 className="font-black text-xs uppercase tracking-wider text-slate-800">
                      3. Alcance Congelado
                    </h3>
                  </div>
                  <span className="text-[10px] font-black bg-amber-100 text-amber-950 px-2 py-0.5 rounded-full border border-amber-300">
                    {proyecto?.lineas_base?.length || 0}
                  </span>
                </div>

                <div className="space-y-3">
                  {proyecto?.lineas_base?.map((lb) => (
                    <div
                      key={lb.id}
                      className="bg-white p-3.5 rounded-2xl border-2 border-amber-400 shadow-sm space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-amber-950 bg-amber-100 px-1.5 py-0.5 rounded">
                          {lb.codigo}
                        </span>
                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          {lb.estado}
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-slate-900 leading-snug">
                        {lb.nombre}
                      </h4>
                      <p className="text-[11px] text-slate-600">
                        {lb.versiones?.length || 0} artefactos congelados formalmente.
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href="/lineas-base/nueva"
                className="w-full mt-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs text-center border border-slate-300 block shadow-sm transition"
              >
                + Congelar Hito
              </Link>
            </div>

            {/* Columna 4: Nuevos Pedidos del Cliente / Cambios */}
            <div className="bg-slate-200/70 rounded-3xl p-4 border-2 border-slate-300 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <GitPullRequest className="w-4 h-4 text-rose-700" />
                    <h3 className="font-black text-xs uppercase tracking-wider text-slate-800">
                      4. Nuevos Pedidos (RFC)
                    </h3>
                  </div>
                  <span className="text-[10px] font-black bg-rose-100 text-rose-950 px-2 py-0.5 rounded-full border border-rose-300">
                    {solicitudesCambio.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {solicitudesCambio.map((rfc) => (
                    <div
                      key={rfc.id}
                      className="bg-white p-3.5 rounded-2xl border-2 border-rose-300 shadow-sm space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-rose-950 bg-rose-100 px-1.5 py-0.5 rounded">
                          {rfc.codigo}
                        </span>
                        <span className="text-[10px] font-bold text-slate-600">
                          {rfc.estado}
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-slate-900 leading-snug">
                        {rfc.ecs?.nombre}
                      </h4>
                      <p className="text-[11px] text-slate-600 line-clamp-2">
                        {rfc.justificacion}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href="/cambios/nueva"
                className="w-full mt-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs text-center border border-slate-300 block shadow-sm transition"
              >
                + Solicitar Cambio
              </Link>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
