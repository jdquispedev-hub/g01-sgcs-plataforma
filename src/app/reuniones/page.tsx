'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import AgendarReunionModal from '@/components/AgendarReunionModal';
import {
  Calendar as CalendarIcon,
  Users,
  Briefcase,
  Plus,
  Search,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Lock,
  GitPullRequest,
  Loader2,
  Handshake,
  Building,
  User,
  Scale,
  MessageSquare,
  Target,
  Sparkles,
  List,
  CalendarDays,
  X,
  ArrowUpRight,
  Filter,
  Printer,
} from 'lucide-react';

interface ReunionItem {
  id: string;
  proyecto_id: string;
  convocante_id?: string | null;
  titulo: string;
  tipo: 'CLIENTE' | 'EQUIPO_INTERNO' | 'COMITE_CAMBIOS';
  fecha: string;
  hora?: string | null;
  participantes: string;
  temas_tratados: string;
  acuerdos: string;
  proximo_paso?: string | null;
  created_at: string;
  proyecto: {
    id: string;
    codigo: string;
    nombre: string;
    cliente_nombre: string;
    estado: string;
  };
  convocante?: {
    id: string;
    nombre_completo: string;
    email: string;
    rol: string;
  } | null;
}

interface ProyectoAux {
  id: string;
  codigo: string;
  nombre: string;
  cliente_nombre?: string;
}

interface UsuarioAux {
  id: string;
  nombre_completo: string;
  email: string;
  rol: string;
}

export default function ReunionesPage() {
  const [reuniones, setReuniones] = useState<ReunionItem[]>([]);
  const [proyectos, setProyectos] = useState<ProyectoAux[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioAux[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<string>('TODAS');
  const [proyectoFiltro, setProyectoFiltro] = useState<string>('');
  const [vistaModo, setVistaModo] = useState<'CALENDARIO' | 'LISTA'>('CALENDARIO');

  // Control de mes del calendario (Inicia en Noviembre 2026)
  const [currentDate, setCurrentDate] = useState<Date>(new Date('2026-11-03T12:00:00'));

  // Detalle de reunión seleccionada en modal/drawer
  const [selectedReunion, setSelectedReunion] = useState<ReunionItem | null>(null);

  // Modal nueva reunión
  const [modalOpen, setModalOpen] = useState(false);
  const [formFecha, setFormFecha] = useState('2026-11-03');

  const loadData = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/reuniones', window.location.origin);
      if (search) url.searchParams.set('search', search);
      if (tipoFiltro !== 'TODAS') url.searchParams.set('tipo', tipoFiltro);
      if (proyectoFiltro) url.searchParams.set('proyectoId', proyectoFiltro);

      const [resReuniones, resAux] = await Promise.all([
        fetch(url.toString()),
        fetch('/api/auxiliares'),
      ]);

      const dataReuniones = await resReuniones.json();
      const dataAux = await resAux.json();

      if (dataReuniones.success) setReuniones(dataReuniones.data);
      if (dataAux.success) {
        setProyectos(dataAux.data.proyectos);
        setUsuarios(dataAux.data.usuarios);
      }
    } catch (err) {
      console.error('Error al cargar reuniones:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tipoFiltro, proyectoFiltro]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date('2026-11-03T12:00:00'));
  };

  const handleOpenDayModal = (dateStr: string) => {
    setFormFecha(dateStr);
    setModalOpen(true);
  };

  // Cálculo de los días del mes para el calendario
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0 a 11

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Domingo
    // Ajustar para que Lunes sea el primer día de la semana (0: Lun ... 6: Dom)
    const startOffset = (firstDayIndex + 6) % 7;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Días del mes previo
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, d);
      const dateStr = prevDate.toISOString().split('T')[0];
      days.push({
        date: prevDate,
        dateStr,
        dayNumber: d,
        isCurrentMonth: false,
      });
    }

    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      const thisDate = new Date(year, month, i);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        date: thisDate,
        dateStr,
        dayNumber: i,
        isCurrentMonth: true,
      });
    }

    // Completar hasta múltiplo de 7 (hasta 35 o 42 celdas)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      const dateStr = nextDate.toISOString().split('T')[0];
      days.push({
        date: nextDate,
        dateStr,
        dayNumber: i,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentDate]);

  const monthName = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  const getTipoStyle = (tipo: string) => {
    switch (tipo) {
      case 'CLIENTE':
        return {
          chip: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border-emerald-300',
          badge: 'bg-emerald-700 text-white',
          label: 'Con Cliente',
        };
      case 'EQUIPO_INTERNO':
        return {
          chip: 'bg-blue-50 hover:bg-blue-100 text-blue-950 border-blue-300',
          badge: 'bg-blue-700 text-white',
          label: 'Equipo Técnico',
        };
      case 'COMITE_CAMBIOS':
      default:
        return {
          chip: 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300',
          badge: 'bg-amber-600 text-white font-semibold',
          label: 'Comité RFC',
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col antialiased">
      {/* Top Navbar */}
      <header className="bg-upt-navy-900 text-white border-b-2 border-upt-gold shadow-xl sticky top-0 z-40 print:hidden">
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
                  Calendario de Reuniones y Acuerdos
                </span>
                <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-upt-gold text-upt-navy-950 font-black uppercase tracking-wider shrink-0 shadow-sm">
                  Paso 1: Comunicación
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-300 truncate">
                Agenda oficial: reuniones convocadas por el jefe o el equipo con minutas vinculadas
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-1 sm:pt-0 border-t border-white/10 sm:border-t-0">
            {/* Toggle de Vista */}
            <div className="bg-upt-navy-950 p-1 rounded-xl border border-white/20 flex items-center gap-1">
              <button
                onClick={() => setVistaModo('CALENDARIO')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  vistaModo === 'CALENDARIO'
                    ? 'bg-upt-gold text-upt-navy-950 shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Calendario</span>
              </button>
              <button
                onClick={() => setVistaModo('LISTA')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  vistaModo === 'LISTA'
                    ? 'bg-upt-gold text-upt-navy-950 shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Minutas</span>
              </button>
            </div>

            <button
              onClick={() => {
                setFormFecha('2026-11-03');
                setModalOpen(true);
              }}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-upt-gold to-amber-500 hover:from-amber-400 hover:to-upt-gold text-upt-navy-950 font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition flex items-center gap-1.5 shrink-0 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Agendar Reunión</span>
              <span className="sm:hidden font-bold">Agendar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6 ${selectedReunion ? 'print:hidden' : ''}`}>
        
        {/* Controles de Navegación del Calendario y Filtros */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-slate-300 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Navegación del Mes */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl hover:bg-white text-slate-700 transition shadow-sm"
                title="Mes anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleToday}
                className="px-3 py-1.5 rounded-xl font-bold text-xs bg-white text-slate-800 shadow-sm hover:bg-slate-50 transition border border-slate-200"
              >
                Hoy (Nov 2026)
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl hover:bg-white text-slate-700 transition shadow-sm"
                title="Mes siguiente"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-lg sm:text-2xl font-black text-slate-900 capitalize tracking-tight">
              {monthName}
            </h2>
          </div>

          {/* Filtros de Proyecto y Tipo */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-full sm:w-60">
              <select
                value={proyectoFiltro}
                onChange={(e) => setProyectoFiltro(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:border-upt-navy-700 transition cursor-pointer"
              >
                <option value="">Todos los Proyectos</option>
                {proyectos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.codigo} - {p.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setTipoFiltro('TODAS')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  tipoFiltro === 'TODAS'
                    ? 'bg-upt-navy-900 text-upt-gold shadow'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setTipoFiltro('CLIENTE')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  tipoFiltro === 'CLIENTE'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Handshake className="w-3.5 h-3.5" />
                <span>Clientes</span>
              </button>
              <button
                onClick={() => setTipoFiltro('EQUIPO_INTERNO')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  tipoFiltro === 'EQUIPO_INTERNO'
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Equipo</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================
           VISTA 1: CALENDARIO MENSUAL EN CUADRÍCULA (STYLE GOOGLE CALENDAR)
           ======================================================== */}
        {vistaModo === 'CALENDARIO' ? (
          <div className="bg-white rounded-3xl border-2 border-slate-300 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[650px]">
                {/* Días de la semana Header */}
                <div className="grid grid-cols-7 bg-upt-navy-900 text-white border-b-2 border-upt-gold text-center py-2.5 text-xs font-black uppercase tracking-wider">
                  <span><span className="hidden sm:inline">Lunes</span><span className="sm:hidden">Lun</span></span>
                  <span><span className="hidden sm:inline">Martes</span><span className="sm:hidden">Mar</span></span>
                  <span><span className="hidden sm:inline">Miércoles</span><span className="sm:hidden">Mié</span></span>
                  <span><span className="hidden sm:inline">Jueves</span><span className="sm:hidden">Jue</span></span>
                  <span><span className="hidden sm:inline">Viernes</span><span className="sm:hidden">Vie</span></span>
                  <span className="text-amber-400"><span className="hidden sm:inline">Sábado</span><span className="sm:hidden">Sáb</span></span>
                  <span className="text-amber-400"><span className="hidden sm:inline">Domingo</span><span className="sm:hidden">Dom</span></span>
                </div>

                {/* Grilla de Celdas de Días */}
                <div className="grid grid-cols-7 border-collapse divide-x divide-y divide-slate-200">
              {calendarDays.map((dayItem) => {
                const dayMeetings = reuniones.filter(
                  (r) => r.fecha.split('T')[0] === dayItem.dateStr
                );
                const isToday = dayItem.dateStr === '2026-11-03';

                return (
                  <div
                    key={dayItem.dateStr}
                    onClick={() => handleOpenDayModal(dayItem.dateStr)}
                    className={`min-h-[110px] sm:min-h-[135px] p-1.5 sm:p-2 transition flex flex-col justify-between group cursor-pointer ${
                      !dayItem.isCurrentMonth
                        ? 'bg-slate-50/60 text-slate-400'
                        : isToday
                        ? 'bg-amber-50/60 ring-2 ring-inset ring-upt-gold'
                        : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      {/* Cabecera del Día */}
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-xs sm:text-sm font-black w-6 h-6 rounded-full flex items-center justify-center ${
                            isToday
                              ? 'bg-upt-gold text-upt-navy-950 font-black shadow-sm'
                              : dayItem.isCurrentMonth
                              ? 'text-slate-800'
                              : 'text-slate-400'
                          }`}
                        >
                          {dayItem.dayNumber}
                        </span>
                        {isToday && (
                          <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-200 text-amber-900">
                            HOY
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                          + Agendar
                        </span>
                      </div>

                      {/* Lista de Reuniones de ese día */}
                      <div className="space-y-1">
                        {dayMeetings.map((reunion) => {
                          const style = getTipoStyle(reunion.tipo);
                          return (
                            <div
                              key={reunion.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedReunion(reunion);
                              }}
                              className={`p-1.5 rounded-xl border text-[11px] transition shadow-sm font-semibold truncate ${style.chip}`}
                              title={`${reunion.titulo} (${reunion.hora || '10:00'})`}
                            >
                              <div className="flex items-center gap-1 font-bold">
                                <span className="font-mono text-[10px]">{reunion.hora || '10:00'}</span>
                                <span className="truncate">{reunion.titulo}</span>
                              </div>
                              <div className="text-[9px] text-slate-600 truncate mt-0.5">
                                Con: {reunion.tipo === 'CLIENTE' ? reunion.proyecto.cliente_nombre : 'Equipo'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Footer sutil */}
                    {dayMeetings.length > 0 && (
                      <div className="text-[9px] text-right font-black text-slate-500 pt-1">
                        {dayMeetings.length} {dayMeetings.length === 1 ? 'reunión' : 'reuniones'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    ) : (
          /* ========================================================
             VISTA 2: LISTA DE MINUTAS DETALLADA
             ======================================================== */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {reuniones.map((item) => {
              const style = getTipoStyle(item.tipo);
              const fechaStr = new Date(item.fecha).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border-2 border-slate-300 shadow-md hover:shadow-xl transition-all duration-200 p-5 sm:p-6 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${style.badge}`}>
                            {style.label}
                          </span>
                          <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            {item.proyecto.codigo}
                          </span>
                          <span className="text-xs font-bold text-slate-500 flex items-center gap-1 font-mono">
                            <Clock className="w-3.5 h-3.5" />
                            {item.hora || '10:00'} • {fechaStr}
                          </span>
                        </div>
                        <h3 className="font-black text-slate-900 text-base leading-snug">
                          {item.titulo}
                        </h3>
                        <p className="text-[11px] text-slate-600 font-bold mt-0.5">
                          Cliente: <span className="text-slate-900">{item.proyecto.cliente_nombre}</span>
                        </p>
                      </div>
                    </div>

                    {/* Convocante y Participantes */}
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                        <User className="w-3.5 h-3.5 text-upt-navy-700" />
                        <span>Convocada por:</span>
                        <strong className="text-upt-navy-950 font-black">
                          {item.convocante?.nombre_completo || 'Carlos Mendoza (Jefe)'}
                        </strong>
                      </div>
                      <div className="text-slate-600 pl-5">
                        Asistentes: {item.participantes}
                      </div>
                    </div>

                    {/* Acuerdos */}
                    <div className="bg-emerald-50 rounded-2xl p-3.5 border border-emerald-200 text-xs space-y-1">
                      <span className="font-black text-emerald-950 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Acuerdos Clave:</span>
                      </span>
                      <p className="text-emerald-900 leading-relaxed font-semibold pl-5">
                        {item.acuerdos}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                    <button
                      onClick={() => setSelectedReunion(item)}
                      className="text-xs font-bold text-upt-navy-800 hover:text-upt-gold-600 flex items-center gap-1 transition"
                    >
                      <span>Ver Ficha Completa</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                    <Link
                      href="/ecs"
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1"
                    >
                      <Layers className="w-3.5 h-3.5 text-blue-600" />
                      <span>Ver Entregables</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* ========================================================
         MODAL / DRAWER: DETALLE DE MINUTA SELECCIONADA
         ======================================================== */}
      {selectedReunion && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:static print:bg-white print:p-0 print:overflow-visible">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border-2 border-slate-300 space-y-5 animate-in fade-in zoom-in-95 duration-150 my-6 print:shadow-none print:border-none print:p-6 print:my-0 print:max-w-none">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${getTipoStyle(selectedReunion.tipo).badge}`}>
                    {getTipoStyle(selectedReunion.tipo).label}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                    {selectedReunion.proyecto.codigo}
                  </span>
                  <span className="text-xs font-bold text-slate-500 font-mono">
                    ⏰ {selectedReunion.hora || '10:00'} • {new Date(selectedReunion.fecha).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 leading-snug">
                  {selectedReunion.titulo}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5 font-bold">
                  Proyecto: {selectedReunion.proyecto.nombre} • Cliente: {selectedReunion.proyecto.cliente_nombre}
                </p>
              </div>
              <div className="flex items-center gap-2 print:hidden">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-upt-navy-900 hover:bg-upt-navy-800 text-upt-gold font-black text-xs flex items-center gap-1.5 shadow transition active:scale-95"
                  title="Imprimir / Exportar Acta Oficial en PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Imprimir Acta PDF</span>
                </button>
                <button
                  onClick={() => setSelectedReunion(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Convocante y Participantes */}
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-slate-800">
                <User className="w-4 h-4 text-upt-navy-700" />
                <span>Reunión citada por:</span>
                <strong className="text-upt-navy-950 font-black">
                  {selectedReunion.convocante?.nombre_completo || 'Carlos Mendoza (Gerente / Jefe)'}
                </strong>
              </div>
              <div className="text-slate-600 pl-6">
                <strong>Asistentes:</strong> {selectedReunion.participantes}
              </div>
            </div>

            {/* Temas Tratados */}
            <div className="space-y-1 text-xs">
              <strong className="text-slate-900 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                <span>Temas Discutidos en la Sesión:</span>
              </strong>
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-200">
                {selectedReunion.temas_tratados}
              </p>
            </div>

            {/* Acuerdos Oficiales */}
            <div className="space-y-1 text-xs">
              <strong className="text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Acuerdos y Compromisos Vinculantes:</span>
              </strong>
              <p className="text-emerald-950 leading-relaxed bg-emerald-50 p-3.5 rounded-2xl border border-emerald-300 font-semibold">
                {selectedReunion.acuerdos}
              </p>
            </div>

            {/* Próximo Paso */}
            {selectedReunion.proximo_paso && (
              <div className="text-xs bg-amber-50 p-3 rounded-2xl border border-amber-300 text-amber-950 flex items-start gap-2">
                <Target className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                <span><strong>Siguiente Hito Comprometido:</strong> {selectedReunion.proximo_paso}</span>
              </div>
            )}

            {/* Cuadro de Firmas de Conformidad (Visible en Pantalla e Impresión) */}
            <div className="pt-4 mt-3 border-t-2 border-slate-300">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block text-center mb-4">
                Constancia y Firma de Acuerdos Vinculantes (Anti-teléfono Descompuesto)
              </span>
              <div className="grid grid-cols-2 gap-6 text-center">
                <div className="space-y-1">
                  <div className="border-b-2 border-slate-400 h-12 flex items-end justify-center pb-1">
                    <span className="text-[9px] text-slate-400 italic">(Firma y Sello)</span>
                  </div>
                  <p className="text-xs font-black text-slate-900 leading-tight">
                    {selectedReunion.convocante?.nombre_completo || 'Carlos Mendoza'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold">
                    Jefe de Proyecto / Contratista
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="border-b-2 border-slate-400 h-12 flex items-end justify-center pb-1">
                    <span className="text-[9px] text-slate-400 italic">(Firma de Conformidad)</span>
                  </div>
                  <p className="text-xs font-black text-slate-900 leading-tight">
                    {selectedReunion.proyecto.cliente_nombre || 'Don Juan Pérez'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold">
                    Cliente Oficial / Propietario
                  </p>
                </div>
              </div>
            </div>

            {/* Acciones Conectoras */}
            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 print:hidden">
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                ¿Qué se hace con este acuerdo?
              </span>
              <div className="flex items-center gap-2">
                <Link
                  href="/ecs"
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Crear / Asociar Entregable (ECS)</span>
                </Link>
                <Link
                  href="/cambios/nueva"
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shadow"
                >
                  <GitPullRequest className="w-3.5 h-3.5" />
                  <span>Pedir Cambio (RFC)</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
         MODAL REGISTRAR / AGENDAR NUEVA REUNIÓN
         ======================================================== */}
      <AgendarReunionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={(nuevaReu) => {
          setReuniones((prev) => [nuevaReu, ...prev]);
        }}
        initialProyectoId={proyectoFiltro || (proyectos[0]?.id ?? '')}
        initialFecha={formFecha || '2026-11-03'}
        proyectos={proyectos}
        usuarios={usuarios}
      />
    </div>
  );
}
