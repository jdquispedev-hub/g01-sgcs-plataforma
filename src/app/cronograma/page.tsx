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
  Sparkles,
} from 'lucide-react';
import NavbarPrincipal from '@/components/NavbarPrincipal';

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
        if (data.success && Array.isArray(data.data.proyectos) && data.data.proyectos.length > 0) {
          setProyectos(data.data.proyectos);
          setSelectedProyectoId(data.data.proyectos[0].id);
        } else {
          setProyectos([]);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error al cargar proyectos auxiliares:', err);
        setLoading(false);
      }
    };
    fetchAux();
  }, []);

  // Cargar datos del proyecto y armar timeline
  useEffect(() => {
    if (!selectedProyectoId) return;

    const fetchProyectoTimeline = async () => {
      setLoading(true);
      try {
        const [resProyecto, resCambios] = await Promise.all([
          fetch(`/api/proyectos?id=${selectedProyectoId}`),
          fetch(`/api/cambios?proyectoId=${selectedProyectoId}`),
        ]);

        const dataProyecto = await resProyecto.json();
        const dataCambios = await resCambios.json();

        if (dataProyecto.success) {
          const proy: ProyectoData = dataProyecto.data;
          setProyecto(proy);

          const rfcs = dataCambios.success ? dataCambios.data : [];
          setSolicitudesCambio(rfcs);

          // Construcción unificada de eventos cronológicos
          const eventos: TimelineEvent[] = [];

          // 1. Reuniones / Minutas
          (proy.reuniones || []).forEach((r) => {
            eventos.push({
              id: `reunion-${r.id}`,
              tipo: 'REUNION',
              fecha: r.fecha,
              titulo: r.titulo,
              subtitulo: r.tipo === 'CLIENTE' ? 'Reunión con Cliente' : 'Reunión Interna del Equipo',
              descripcion: r.acuerdos || 'Sin acuerdos detallados en la minuta.',
              badge: r.tipo === 'CLIENTE' ? 'Minuta Cliente' : 'Minuta Interna',
              icono: 'Handshake',
              metadata: r,
            });
          });

          // 2. Entregables creados y Versiones
          (proy.elementos_config || []).forEach((ecs) => {
            (ecs.versiones || []).forEach((v: any) => {
              if (v.estado === 'APROBADA') {
                eventos.push({
                  id: `ver-${v.id}`,
                  tipo: 'VERSION_APROBADA',
                  fecha: v.fecha_aprobacion || v.created_at,
                  titulo: `${ecs.codigo} v${v.numero_version} Aprobado`,
                  subtitulo: ecs.nombre,
                  descripcion: v.descripcion_cambio || 'Versión formalmente aprobada por el Tech Lead.',
                  badge: 'Aprobación Formal',
                  icono: 'CheckCircle2',
                  metadata: v,
                });
              }
            });
          });

          // 3. Líneas Base (Hitos Congelados)
          (proy.lineas_base || []).forEach((lb) => {
            eventos.push({
              id: `lb-${lb.id}`,
              tipo: 'LINEA_BASE',
              fecha: lb.fecha_congelamiento || lb.created_at,
              titulo: `Línea Base: ${lb.codigo} - ${lb.nombre}`,
              subtitulo: `Alcance Congelado (${lb.versiones?.length || 0} entregables)`,
              descripcion: lb.descripcion || 'Hito auditado y congelado por el Comité.',
              badge: 'Hito Congelado',
              icono: 'Lock',
              metadata: lb,
            });
          });

          // 4. Solicitudes de Cambio (RFCs)
          rfcs.forEach((rfc: any) => {
            eventos.push({
              id: `rfc-${rfc.id}`,
              tipo: 'SOLICITUD_CAMBIO',
              fecha: rfc.created_at,
              titulo: `Solicitud de Cambio: ${rfc.codigo}`,
              subtitulo: `Afecta a: ${rfc.ecs?.codigo} - ${rfc.ecs?.nombre}`,
              descripcion: rfc.justificacion || rfc.descripcion,
              badge: `RFC: ${rfc.estado}`,
              icono: 'GitPullRequest',
              metadata: rfc,
            });
          });

          // Orden cronológico
          eventos.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
          setTimeline(eventos);
        }
      } catch (err) {
        console.error('Error al armar cronograma:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProyectoTimeline();
  }, [selectedProyectoId]);

  const getEventVisuals = (event: TimelineEvent) => {
    switch (event.tipo) {
      case 'REUNION':
        if (event.metadata?.tipo === 'CLIENTE') {
          return {
            dotColor: 'bg-emerald-500 ring-emerald-500/30',
            badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
            icon: Handshake,
            iconColor: 'text-emerald-400',
          };
        }
        return {
          dotColor: 'bg-sky-500 ring-sky-500/30',
          badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
          icon: Users,
          iconColor: 'text-sky-400',
        };
      case 'ECS_CREADO':
        return {
          dotColor: 'bg-purple-500 ring-purple-500/30',
          badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          icon: FileText,
          iconColor: 'text-purple-400',
        };
      case 'VERSION_APROBADA':
        return {
          dotColor: 'bg-teal-500 ring-teal-500/30',
          badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
          icon: CheckCircle2,
          iconColor: 'text-teal-400',
        };
      case 'LINEA_BASE':
        return {
          dotColor: 'bg-amber-400 ring-amber-400/30',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold',
          icon: Lock,
          iconColor: 'text-amber-400',
        };
      case 'SOLICITUD_CAMBIO':
      default:
        return {
          dotColor: 'bg-rose-500 ring-rose-500/30',
          badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold',
          icon: GitPullRequest,
          iconColor: 'text-rose-400',
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#13151A] text-slate-100 flex flex-col antialiased">
      {/* Navbar Global Unificado */}
      <NavbarPrincipal />

      {/* Sub-header contextual */}
      <div className="bg-[#16181D] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Línea de Tiempo y Canvas del Proyecto
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 uppercase tracking-wider">
                  Roadmap & Historia Viva
                </span>
              </div>
              <p className="text-xs text-slate-400">
                De la reunión inicial con el cliente a los hitos congelados y pedidos de cambio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/reuniones"
              className="px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center gap-1.5"
            >
              <Handshake className="w-3.5 h-3.5 text-amber-400" />
              <span>Reuniones</span>
            </Link>
            <Link
              href="/ecs"
              className="px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Entregables</span>
            </Link>
            <Link
              href="/lineas-base"
              className="px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Hitos</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        
        {/* Selector de Proyecto y Ficha Resumen */}
        <div className="bg-[#1A1D25] rounded-2xl p-6 text-white border border-white/10 shadow-lg space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" />
                <span>Proyecto en Inspección</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {proyecto?.nombre || (proyectos.length === 0 ? 'Sin proyectos registrados' : 'Seleccione un proyecto')}
              </h2>
              <p className="text-xs text-slate-400">
                Cliente Oficial: <strong className="text-amber-300">{proyecto?.cliente_nombre || 'Sin cliente asignado'}</strong> • Código: <span className="font-mono text-slate-300">{proyecto?.codigo || '-'}</span>
              </p>
            </div>

            {/* Selector de Proyecto */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-slate-400 hidden sm:inline">Cambiar Proyecto:</span>
              <select
                value={selectedProyectoId}
                onChange={(e) => setSelectedProyectoId(e.target.value)}
                className="px-4 py-2 bg-[#14161E] border border-white/10 rounded-xl text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-amber-400/50 transition cursor-pointer"
              >
                {proyectos.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#1A1D25] text-white">
                    {p.codigo} - {p.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Estadísticas de la Historia del Proyecto */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="bg-[#14161E] p-3.5 rounded-xl border border-white/10 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Reuniones</span>
              <span className="text-xl font-bold text-emerald-400">{proyecto?.reuniones?.length || 0}</span>
            </div>
            <div className="bg-[#14161E] p-3.5 rounded-xl border border-white/10 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Entregables (ECS)</span>
              <span className="text-xl font-bold text-sky-400">{proyecto?.elementos_config?.length || 0}</span>
            </div>
            <div className="bg-[#14161E] p-3.5 rounded-xl border border-white/10 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Hitos Congelados</span>
              <span className="text-xl font-bold text-amber-400">{proyecto?.lineas_base?.length || 0}</span>
            </div>
            <div className="bg-[#14161E] p-3.5 rounded-xl border border-white/10 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Cambios (RFC)</span>
              <span className="text-xl font-bold text-rose-400">{solicitudesCambio.length}</span>
            </div>
          </div>
        </div>

        {proyectos.length === 0 ? (
          <div className="bg-[#1A1D25] rounded-2xl p-10 border border-white/10 text-center space-y-3 shadow-md">
            <div className="w-14 h-14 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">
              No hay proyectos registrados para mostrar en el Cronograma
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Comienza registrando tu primer proyecto desde el Dashboard principal para visualizar aquí la línea de tiempo viva.
            </p>
            <Link
              href="/dashboard"
              className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-upt-gold to-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ir al Dashboard a Registrar Proyecto</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Barra de Alternancia de Vistas (Timeline vs Canvas) */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('TIMELINE')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    viewMode === 'TIMELINE'
                      ? 'bg-amber-400 text-slate-950 shadow-md'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <ListOrdered className="w-4 h-4" />
                  <span>Línea de Tiempo Cronológica ({timeline.length} eventos)</span>
                </button>
                <button
                  onClick={() => setViewMode('CANVAS')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    viewMode === 'CANVAS'
                      ? 'bg-amber-400 text-slate-950 shadow-md'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <Kanban className="w-4 h-4" />
                  <span>Tablero Canvas por Fases</span>
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/reuniones"
                  className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 transition flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Agendar Reunión</span>
                </Link>
              </div>
            </div>

            {/* Contenido según la vista seleccionada */}
            {loading ? (
              <div className="p-16 text-center bg-[#1A1D25] rounded-2xl border border-white/10 shadow-sm">
                <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-3" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Generando línea de tiempo del proyecto...
                </p>
              </div>
            ) : viewMode === 'TIMELINE' ? (
              /* VISTA 1: LÍNEA DE TIEMPO VERTICAL CONTINUA */
              <div className="bg-[#1A1D25] rounded-2xl border border-white/10 p-6 sm:p-8 shadow-md">
                <div className="relative border-l-2 border-amber-400/30 ml-4 sm:ml-8 space-y-8 py-2">
                  {timeline.map((event) => {
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
                          className={`absolute -left-[11px] top-1.5 w-5 h-5 rounded-full border-2 border-[#14161E] ${visuals.dotColor} ring-4 ring-[#14161E] shadow-md flex items-center justify-center transition-transform group-hover:scale-125`}
                        />

                        {/* Tarjeta del Evento */}
                        <div className="bg-[#14161E] hover:border-amber-400/40 rounded-xl border border-white/10 p-4 sm:p-5 transition-all shadow-sm space-y-2.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${visuals.badgeColor}`}>
                                {event.badge}
                              </span>
                              <span className="text-xs font-medium text-slate-400 font-mono flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-slate-500" />
                                {fechaStr}
                              </span>
                            </div>
                            <span className="text-[11px] font-semibold text-slate-400 sm:text-right">
                              {event.subtitulo}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <h4 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                              <EventIcon className={`w-4 h-4 shrink-0 ${visuals.iconColor}`} />
                              <span>{event.titulo}</span>
                            </h4>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              {event.descripcion}
                            </p>
                          </div>

                          {/* Links contextuales */}
                          {event.tipo === 'REUNION' && (
                            <div className="pt-2 border-t border-white/5 flex items-center justify-end">
                              <Link
                                href="/reuniones"
                                className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
                              >
                                <span>Ver Minuta Completa</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          )}
                          {event.tipo === 'LINEA_BASE' && (
                            <div className="pt-2 border-t border-white/5 flex items-center justify-end">
                              <Link
                                href="/lineas-base"
                                className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
                              >
                                <span>Ver Alcance Congelado</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          )}
                          {event.tipo === 'SOLICITUD_CAMBIO' && (
                            <div className="pt-2 border-t border-white/5 flex items-center justify-end">
                              <Link
                                href="/cambios"
                                className="text-xs font-semibold text-rose-300 hover:text-rose-200 flex items-center gap-1 transition"
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
              /* VISTA 2: TABLERO CANVAS DE 4 FASES */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Columna 1: Levantamiento con Cliente */}
                <div className="bg-[#1A1D25] rounded-2xl p-4 border border-white/10 space-y-3 flex flex-col justify-between shadow-md">
                  <div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                      <div className="flex items-center gap-2">
                        <Handshake className="w-4 h-4 text-emerald-400" />
                        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                          1. Con el Cliente
                        </h3>
                      </div>
                      <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        {proyecto?.reuniones?.filter((r) => r.tipo === 'CLIENTE').length || 0}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {proyecto?.reuniones
                        ?.filter((r) => r.tipo === 'CLIENTE')
                        .map((r) => (
                          <div
                            key={r.id}
                            className="bg-[#14161E] p-3.5 rounded-xl border border-white/10 space-y-1.5"
                          >
                            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-500" />
                              <span>{new Date(r.fecha).toLocaleDateString()}</span>
                            </span>
                            <h4 className="text-xs font-bold text-white leading-snug">
                              {r.titulo}
                            </h4>
                            <p className="text-[11px] text-slate-400 line-clamp-3">
                              {r.acuerdos}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>

                  <Link
                    href="/reuniones"
                    className="w-full mt-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 font-bold text-xs text-center border border-white/10 block transition"
                  >
                    + Registrar Reunión
                  </Link>
                </div>

                {/* Columna 2: Planificación de Equipo y Entregables */}
                <div className="bg-[#1A1D25] rounded-2xl p-4 border border-white/10 space-y-3 flex flex-col justify-between shadow-md">
                  <div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-sky-400" />
                        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                          2. Entregables Equipo
                        </h3>
                      </div>
                      <span className="text-[10px] font-bold bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full border border-sky-500/30">
                        {proyecto?.elementos_config?.length || 0}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {proyecto?.elementos_config?.map((ecs) => (
                        <div
                          key={ecs.id}
                          className="bg-[#14161E] p-3.5 rounded-xl border border-white/10 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                              {ecs.codigo}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {ecs.tipo}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-white leading-snug">
                            {ecs.nombre}
                          </h4>
                          <div className="text-[10px] text-slate-400 font-medium">
                            Versión actual:{' '}
                            <strong className="text-slate-200">
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
                    className="w-full mt-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 font-bold text-xs text-center border border-white/10 block transition"
                  >
                    + Nuevo Entregable
                  </Link>
                </div>

                {/* Columna 3: Hito Congelado (Línea Base Oficial) */}
                <div className="bg-[#1A1D25] rounded-2xl p-4 border border-white/10 space-y-3 flex flex-col justify-between shadow-md">
                  <div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-amber-400" />
                        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                          3. Alcance Congelado
                        </h3>
                      </div>
                      <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                        {proyecto?.lineas_base?.length || 0}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {proyecto?.lineas_base?.map((lb) => (
                        <div
                          key={lb.id}
                          className="bg-[#14161E] p-3.5 rounded-xl border border-amber-500/30 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                              {lb.codigo}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                              {lb.estado}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-white leading-snug">
                            {lb.nombre}
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            {lb.versiones?.length || 0} artefactos congelados formalmente.
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link
                    href="/lineas-base/nueva"
                    className="w-full mt-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 font-bold text-xs text-center border border-white/10 block transition"
                  >
                    + Congelar Hito
                  </Link>
                </div>

                {/* Columna 4: Nuevos Pedidos del Cliente / Cambios */}
                <div className="bg-[#1A1D25] rounded-2xl p-4 border border-white/10 space-y-3 flex flex-col justify-between shadow-md">
                  <div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                      <div className="flex items-center gap-2">
                        <GitPullRequest className="w-4 h-4 text-rose-400" />
                        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                          4. Nuevos Pedidos (RFC)
                        </h3>
                      </div>
                      <span className="text-[10px] font-bold bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30">
                        {solicitudesCambio.length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {solicitudesCambio.map((rfc) => (
                        <div
                          key={rfc.id}
                          className="bg-[#14161E] p-3.5 rounded-xl border border-rose-500/30 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-rose-300 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                              {rfc.codigo}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                              {rfc.estado}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-white leading-snug">
                            {rfc.ecs?.nombre}
                          </h4>
                          <p className="text-[11px] text-slate-400 line-clamp-2">
                            {rfc.justificacion}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link
                    href="/cambios/nueva"
                    className="w-full mt-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 font-bold text-xs text-center border border-white/10 block transition"
                  >
                    + Solicitar Cambio
                  </Link>
                </div>

              </div>
            )}
          </>
        )}

      </main>
    </div>
  );
}
