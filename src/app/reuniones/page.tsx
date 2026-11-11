'use client';

import { useEffect, useState, useMemo } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
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
import NavbarPrincipal from '@/components/NavbarPrincipal';

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
  const [currentUser, setCurrentUser] = useState<{ id?: string; email?: string; nombreCompleto?: string; rol?: string } | null>(null);
  const [soloMisReuniones, setSoloMisReuniones] = useState(false);

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

  // SWR: Caché en memoria (Stale-While-Revalidate) para navegación instantánea (0ms)
  const reunionesUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (tipoFiltro !== 'TODAS') params.set('tipo', tipoFiltro);
    if (proyectoFiltro) params.set('proyectoId', proyectoFiltro);
    const q = params.toString();
    return q ? `/api/reuniones?${q}` : '/api/reuniones';
  }, [search, tipoFiltro, proyectoFiltro]);

  const { data: dataReuniones, mutate: mutateReuniones } = useSWR(reunionesUrl, fetcher, { revalidateOnFocus: false });
  const { data: dataAux } = useSWR('/api/auxiliares', fetcher, { revalidateOnFocus: false });
  const { data: dataMe } = useSWR('/api/auth/me', fetcher, { revalidateOnFocus: false });

  const loading = !dataReuniones && reuniones.length === 0;

  useEffect(() => {
    if (dataReuniones?.success && Array.isArray(dataReuniones.data)) {
      setReuniones(dataReuniones.data);
    }
  }, [dataReuniones]);

  useEffect(() => {
    if (dataAux?.success) {
      if (Array.isArray(dataAux.data.proyectos)) setProyectos(dataAux.data.proyectos);
      if (Array.isArray(dataAux.data.usuarios)) setUsuarios(dataAux.data.usuarios);
    }
  }, [dataAux]);

  useEffect(() => {
    if (dataMe?.success && dataMe.data?.user) {
      setCurrentUser({
        id: dataMe.data.user.userId || dataMe.data.user.id,
        email: dataMe.data.user.email,
        nombreCompleto: dataMe.data.user.nombreCompleto || dataMe.data.user.nombre,
        rol: dataMe.data.user.rol,
      });
    }
  }, [dataMe]);

  const loadData = async () => {
    await mutateReuniones();
  };

  const isUserMeeting = (r: ReunionItem) => {
    if (!currentUser) return false;
    if (r.convocante_id && currentUser.id && r.convocante_id === currentUser.id) return true;
    if (r.convocante?.email && currentUser.email && r.convocante.email.toLowerCase() === currentUser.email.toLowerCase()) return true;
    if (currentUser.nombreCompleto && r.participantes && r.participantes.toLowerCase().includes(currentUser.nombreCompleto.toLowerCase())) return true;
    if (currentUser.email) {
      const prefix = currentUser.email.split('@')[0].toLowerCase();
      if (r.participantes && r.participantes.toLowerCase().includes(prefix)) return true;
    }
    return false;
  };

  const displayedReuniones = useMemo(() => {
    if (!soloMisReuniones) return reuniones;
    return reuniones.filter((r) => isUserMeeting(r));
  }, [reuniones, soloMisReuniones, currentUser]);

  const misReunionesCount = useMemo(() => {
    return reuniones.filter((r) => isUserMeeting(r)).length;
  }, [reuniones, currentUser]);

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
          chip: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md border-l-4 border-l-emerald-300 font-bold',
          badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold',
          cardBorder: 'border-l-emerald-500',
          dotColor: 'bg-emerald-400',
          label: 'Con Cliente',
        };
      case 'EQUIPO_INTERNO':
        return {
          chip: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md border-l-4 border-l-indigo-300 font-bold',
          badge: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold',
          cardBorder: 'border-l-indigo-500',
          dotColor: 'bg-indigo-400',
          label: 'Equipo Interno',
        };
      case 'COMITE_CAMBIOS':
      default:
        return {
          chip: 'bg-amber-600 hover:bg-amber-500 text-white shadow-md border-l-4 border-l-amber-300 font-bold',
          badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold',
          cardBorder: 'border-l-amber-500',
          dotColor: 'bg-amber-400',
          label: 'Comité RFC / CCB',
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#13151A] text-slate-100 flex flex-col antialiased selection:bg-amber-400 selection:text-slate-950">
      {/* Navbar Global Unificado */}
      <NavbarPrincipal />

      {/* Sub-Header de Reuniones y Acciones */}
      <div className="bg-[#191C24] border-b border-white/10 print:hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href="/dashboard"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition border border-white/10"
              title="Volver al Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm sm:text-base text-white tracking-tight truncate">
                  Calendario de Reuniones y Acuerdos
                </span>
                <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold uppercase tracking-wider shrink-0">
                  Paso 1: Comunicación
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                Agenda oficial: reuniones convocadas con minutas contractuales vinculadas
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-1 sm:pt-0 border-t border-white/10 sm:border-t-0">
            {/* Toggle de Vista */}
            <div className="bg-[#13151A] p-1 rounded-xl border border-white/10 flex items-center gap-1">
              <button
                onClick={() => setVistaModo('CALENDARIO')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  vistaModo === 'CALENDARIO'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Calendario</span>
              </button>
              <button
                onClick={() => setVistaModo('LISTA')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  vistaModo === 'LISTA'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
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
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-bold text-xs sm:text-sm shadow-xs transition flex items-center gap-1.5 shrink-0 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3] text-slate-950" />
              <span className="hidden sm:inline">Agendar Reunión</span>
              <span className="sm:hidden font-bold">Agendar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className={`max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6 ${selectedReunion ? 'print:hidden' : ''}`}>
        
        {/* Controles de Navegación del Calendario y Filtros */}
        <div className="bg-[#1A1D25] rounded-3xl p-4 sm:p-5 border border-white/10 shadow-xl space-y-4">
          {/* Fila Superior: Navegación del Mes + Filtro "Mis Reuniones" */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Navegación del Mes */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-[#13151A] p-1 rounded-2xl border border-white/10">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition shadow-sm"
                  title="Mes anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleToday}
                  className="px-3 py-1.5 rounded-xl font-bold text-xs bg-[#242832] text-slate-200 hover:bg-[#2F3543] transition border border-white/10"
                >
                  Hoy (Nov 2026)
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition shadow-sm"
                  title="Mes siguiente"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <h2 className="text-lg sm:text-2xl font-black text-white capitalize tracking-tight">
                {monthName}
              </h2>
            </div>

            {/* Quick Filter: "Mis Reuniones" vs "Todas" */}
            <div className="flex items-center gap-1.5 bg-[#13151A] p-1 rounded-2xl border border-white/10">
              <button
                onClick={() => setSoloMisReuniones(false)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  !soloMisReuniones
                    ? 'bg-[#252A36] text-white shadow border border-white/10'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Todas ({reuniones.length})</span>
              </button>
              <button
                onClick={() => setSoloMisReuniones(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  soloMisReuniones
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                    : 'text-amber-300 hover:text-amber-200 hover:bg-white/5'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>⭐ Mis Reuniones ({misReunionesCount})</span>
              </button>
            </div>
          </div>

          {/* Fila Inferior: Buscador + Filtros de Proyecto y Tipo */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-white/10">
            {/* Buscador en Vivo */}
            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por tema o cliente..."
                className="w-full pl-9 pr-3 py-2 bg-[#232731] border border-white/10 rounded-xl text-xs font-medium text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 transition"
              />
            </form>

            <div className="flex flex-wrap items-center gap-2">
              <div className="w-full sm:w-56">
                <select
                  value={proyectoFiltro}
                  onChange={(e) => setProyectoFiltro(e.target.value)}
                  className="w-full px-3 py-2 bg-[#232731] border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-amber-400 transition cursor-pointer"
                >
                  <option value="" className="bg-[#1A1D25] text-white">Todos los Proyectos</option>
                  {proyectos.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#1A1D25] text-white">
                      {p.codigo} - {p.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setTipoFiltro('TODAS')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    tipoFiltro === 'TODAS'
                      ? 'bg-amber-400 text-slate-950 font-black shadow'
                      : 'bg-[#232731] text-slate-300 hover:text-white border border-white/5'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setTipoFiltro('CLIENTE')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    tipoFiltro === 'CLIENTE'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-[#232731] text-slate-300 hover:text-white border border-white/5'
                  }`}
                >
                  <Handshake className="w-3.5 h-3.5" />
                  <span>Clientes</span>
                </button>
                <button
                  onClick={() => setTipoFiltro('EQUIPO_INTERNO')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    tipoFiltro === 'EQUIPO_INTERNO'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-[#232731] text-slate-300 hover:text-white border border-white/5'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Equipo</span>
                </button>
                <button
                  onClick={() => setTipoFiltro('COMITE_CAMBIOS')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    tipoFiltro === 'COMITE_CAMBIOS'
                      ? 'bg-amber-600 text-white shadow'
                      : 'bg-[#232731] text-slate-300 hover:text-white border border-white/5'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Comité RFC</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
           VISTA 1: CALENDARIO MENSUAL EN CUADRÍCULA (STYLE NOTION / GOOGLE CALENDAR)
           ======================================================== */}
        {vistaModo === 'CALENDARIO' ? (
          <div className="bg-[#181B22] rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[650px]">
                {/* Días de la semana Header */}
                <div className="grid grid-cols-7 bg-[#111319] text-slate-300 border-b border-white/10 text-center py-2.5 text-xs font-black uppercase tracking-wider">
                  <span><span className="hidden sm:inline">Lunes</span><span className="sm:hidden">Lun</span></span>
                  <span><span className="hidden sm:inline">Martes</span><span className="sm:hidden">Mar</span></span>
                  <span><span className="hidden sm:inline">Miércoles</span><span className="sm:hidden">Mié</span></span>
                  <span><span className="hidden sm:inline">Jueves</span><span className="sm:hidden">Jue</span></span>
                  <span><span className="hidden sm:inline">Viernes</span><span className="sm:hidden">Vie</span></span>
                  <span className="text-amber-400"><span className="hidden sm:inline">Sábado</span><span className="sm:hidden">Sáb</span></span>
                  <span className="text-amber-400"><span className="hidden sm:inline">Domingo</span><span className="sm:hidden">Dom</span></span>
                </div>

                {/* Grilla de Celdas de Días */}
                <div className="grid grid-cols-7 border-collapse divide-x divide-y divide-white/10">
                  {calendarDays.map((dayItem) => {
                    const dayMeetings = displayedReuniones.filter(
                      (r) => r.fecha.split('T')[0] === dayItem.dateStr
                    );
                    const isToday = dayItem.dateStr === '2026-11-03';

                    return (
                      <div
                        key={dayItem.dateStr}
                        onClick={() => handleOpenDayModal(dayItem.dateStr)}
                        className={`min-h-[110px] sm:min-h-[135px] p-1.5 sm:p-2 transition flex flex-col justify-between group cursor-pointer ${
                          !dayItem.isCurrentMonth
                            ? 'bg-[#12141A]/50 text-slate-600'
                            : isToday
                            ? 'bg-[#252219] ring-2 ring-inset ring-amber-400/90'
                            : 'bg-[#181B22] hover:bg-[#1E222B]'
                        }`}
                      >
                        <div>
                          {/* Cabecera del Día */}
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className={`text-xs sm:text-sm font-black w-6 h-6 rounded-full flex items-center justify-center ${
                                isToday
                                  ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                                  : dayItem.isCurrentMonth
                                  ? 'text-white'
                                  : 'text-slate-600'
                              }`}
                            >
                              {dayItem.dayNumber}
                            </span>
                            {isToday && (
                              <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-400 text-slate-950">
                                HOY
                              </span>
                            )}
                            <span className="text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                              + Agendar
                            </span>
                          </div>

                          {/* Lista de Reuniones de ese día (Chips sólidos estilo Google Calendar) */}
                          <div className="space-y-1.5">
                            {dayMeetings.map((reunion) => {
                              const style = getTipoStyle(reunion.tipo);
                              const isMine = isUserMeeting(reunion);
                              return (
                                <div
                                  key={reunion.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedReunion(reunion);
                                  }}
                                  className={`p-1.5 rounded-xl text-[11px] transition shadow-md font-semibold truncate cursor-pointer ${style.chip} ${
                                    isMine ? 'ring-2 ring-amber-300 shadow-amber-500/20' : ''
                                  }`}
                                  title={`${reunion.titulo} (${reunion.hora || '10:00'})`}
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="font-mono text-[10px] px-1 py-0.2 rounded bg-black/40 text-white font-extrabold">
                                      {reunion.hora || '10:00'}
                                    </span>
                                    {isMine && (
                                      <span className="text-[9px] px-1 py-0.2 rounded bg-amber-400 text-slate-950 font-black shrink-0 flex items-center gap-0.5">
                                        ⭐ Tuya
                                      </span>
                                    )}
                                  </div>
                                  <div className="truncate text-white font-black mt-1">
                                    {reunion.titulo}
                                  </div>
                                  <div className="text-[10px] text-white/80 font-medium truncate mt-0.5">
                                    {reunion.tipo === 'CLIENTE' ? reunion.proyecto.cliente_nombre : 'Equipo Interno'}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Footer sutil */}
                        {dayMeetings.length > 0 && (
                          <div className="text-[9px] text-right font-black text-slate-400 pt-1">
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
             VISTA 2: LISTA DE MINUTAS DETALLADA (CARPETAS EJECUTIVAS)
             ======================================================== */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {displayedReuniones.length === 0 ? (
              <div className="col-span-full bg-[#1A1D25] rounded-3xl border border-white/10 p-12 text-center space-y-3 shadow-xl">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center border border-amber-400/20">
                  <CalendarDays className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-white">No hay reuniones con los filtros seleccionados</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
                  {soloMisReuniones
                    ? 'No figuras como convocante ni asistente en las reuniones filtradas.'
                    : 'Prueba cambiando el filtro de proyecto o agenda una nueva reunión con el botón superior.'}
                </p>
                <button
                  onClick={() => {
                    setSoloMisReuniones(false);
                    setTipoFiltro('TODAS');
                    setProyectoFiltro('');
                  }}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#252A36] text-amber-300 hover:text-white font-bold text-xs shadow transition active:scale-95 border border-white/10"
                >
                  <span>Restablecer Filtros</span>
                </button>
              </div>
            ) : (
              displayedReuniones.map((item) => {
                const style = getTipoStyle(item.tipo);
                const isMine = isUserMeeting(item);
                const fechaStr = new Date(item.fecha).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                });

                return (
                  <div
                    key={item.id}
                    className={`bg-[#1A1D25] rounded-3xl border border-white/10 border-l-[8px] ${style.cardBorder} shadow-xl hover:shadow-2xl transition-all duration-200 p-5 sm:p-6 flex flex-col justify-between space-y-4`}
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
                        <div className="w-full">
                          <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${style.badge}`}>
                                {style.label}
                              </span>
                              <span className="font-mono text-[11px] font-black text-slate-200 bg-[#232731] px-2.5 py-0.5 rounded-lg border border-white/10">
                                {item.proyecto.codigo}
                              </span>
                              {isMine && (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 flex items-center gap-1 shadow-xs">
                                  ⭐ Tu Reunión
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-black text-slate-300 flex items-center gap-1.5 font-mono bg-[#232731] px-2.5 py-1 rounded-lg border border-white/10">
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              {item.hora || '10:00'} • {fechaStr}
                            </span>
                          </div>
                          <h3 className="font-black text-white text-base sm:text-lg leading-snug">
                            {item.titulo}
                          </h3>
                          <p className="text-xs text-slate-300 font-bold mt-1 flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>Cliente: <strong className="text-white">{item.proyecto.cliente_nombre}</strong></span>
                          </p>
                        </div>
                      </div>

                      {/* Convocante y Participantes */}
                      <div className="bg-[#14161E] rounded-2xl p-3.5 border border-white/10 text-xs space-y-1.5">
                        <div className="flex items-center gap-2 text-slate-300 font-bold">
                          <User className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>Convocada por:</span>
                          <strong className="text-white font-black">
                            {item.convocante?.nombre_completo || 'Carlos Mendoza (Jefe)'}
                          </strong>
                        </div>
                        <div className="text-slate-400 pl-6 font-medium flex items-start gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                          <span><strong>Asistentes:</strong> {item.participantes}</span>
                        </div>
                      </div>

                      {/* Acuerdos Clave */}
                      <div className="bg-[#0F2318] rounded-2xl p-4 border border-emerald-500/40 text-xs space-y-1.5 shadow-2xs">
                        <span className="font-black text-emerald-300 flex items-center gap-2 text-xs">
                          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                          <span>Acuerdos Clave:</span>
                        </span>
                        <p className="text-emerald-100 leading-relaxed font-semibold pl-6 text-[13px]">
                          {item.acuerdos}
                        </p>
                      </div>

                      {/* Siguiente Hito */}
                      {item.proximo_paso && (
                        <div className="bg-[#281F0F] rounded-2xl p-3 border border-amber-500/40 text-xs text-amber-200 flex items-start gap-2 font-medium">
                          <Target className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <span><strong>Próximo Paso:</strong> {item.proximo_paso}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 flex items-center justify-between border-t border-white/10">
                      <button
                        onClick={() => setSelectedReunion(item)}
                        className="px-3 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-black flex items-center gap-1.5 transition active:scale-95"
                      >
                        <span>Ver Acta Completa</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-amber-300" />
                      </button>
                      <Link
                        href="/ecs"
                        className="px-3 py-1.5 rounded-xl bg-[#232731] hover:bg-[#2C323E] text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-white/10"
                      >
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Ver Entregables</span>
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

      </main>

      {/* ========================================================
         MODAL / DRAWER: DETALLE DE MINUTA SELECCIONADA
         ======================================================== */}
      {selectedReunion && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:static print:bg-white print:p-0 print:overflow-visible">
          <div className="bg-[#1A1D25] text-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-white/15 space-y-5 animate-in fade-in zoom-in-95 duration-150 my-6 print:shadow-none print:border-none print:p-6 print:my-0 print:max-w-none print:text-slate-900 print:bg-white">
            <div className="flex items-start justify-between border-b border-white/10 print:border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${getTipoStyle(selectedReunion.tipo).badge}`}>
                    {getTipoStyle(selectedReunion.tipo).label}
                  </span>
                  <span className="font-mono text-xs font-black text-slate-200 bg-[#232731] print:bg-slate-100 print:text-slate-900 px-2 py-0.5 rounded-md border border-white/10 print:border-slate-300">
                    {selectedReunion.proyecto.codigo}
                  </span>
                  <span className="text-xs font-black text-slate-300 print:text-slate-800 font-mono bg-[#232731] print:bg-slate-100 px-2 py-0.5 rounded-md border border-white/10 print:border-slate-200">
                    ⏰ {selectedReunion.hora || '10:00'} • {new Date(selectedReunion.fecha).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-lg font-black text-white print:text-slate-950 leading-snug">
                  {selectedReunion.titulo}
                </h3>
                <p className="text-xs text-slate-400 print:text-slate-700 mt-1 font-bold">
                  Proyecto: <span className="text-white print:text-slate-950">{selectedReunion.proyecto.nombre}</span> • Cliente: <span className="text-white print:text-slate-950">{selectedReunion.proyecto.cliente_nombre}</span>
                </p>
              </div>
              <div className="flex items-center gap-2 print:hidden">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow transition active:scale-95"
                  title="Imprimir / Exportar Acta Oficial en PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Imprimir Acta PDF</span>
                </button>
                <button
                  onClick={() => setSelectedReunion(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Convocante y Participantes */}
            <div className="bg-[#14161E] print:bg-slate-50 rounded-2xl p-3.5 border border-white/10 print:border-slate-300 text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-slate-300 print:text-slate-800">
                <User className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Reunión citada por:</span>
                <strong className="text-white print:text-slate-950 font-black">
                  {selectedReunion.convocante?.nombre_completo || 'Carlos Mendoza (Gerente / Jefe)'}
                </strong>
              </div>
              <div className="text-slate-400 print:text-slate-700 pl-6 font-medium">
                <strong className="text-slate-200 print:text-slate-900">Asistentes:</strong> {selectedReunion.participantes}
              </div>
            </div>

            {/* Temas Tratados */}
            <div className="space-y-1 text-xs">
              <strong className="text-white print:text-slate-950 flex items-center gap-1.5 font-bold">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                <span>Temas Discutidos en la Sesión:</span>
              </strong>
              <p className="text-slate-200 print:text-slate-900 leading-relaxed bg-[#14161E] print:bg-slate-50 p-3.5 rounded-2xl border border-white/10 print:border-slate-300 font-medium">
                {selectedReunion.temas_tratados}
              </p>
            </div>

            {/* Acuerdos Oficiales */}
            <div className="space-y-1 text-xs">
              <strong className="text-emerald-300 print:text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Acuerdos y Compromisos Vinculantes:</span>
              </strong>
              <p className="text-emerald-100 print:text-emerald-950 leading-relaxed bg-[#0F2318] print:bg-emerald-50 p-3.5 rounded-2xl border border-emerald-500/40 print:border-emerald-300 font-semibold">
                {selectedReunion.acuerdos}
              </p>
            </div>

            {/* Próximo Paso */}
            {selectedReunion.proximo_paso && (
              <div className="text-xs bg-[#281F0F] print:bg-amber-50 p-3 rounded-2xl border border-amber-500/40 print:border-amber-300 text-amber-200 print:text-amber-950 flex items-start gap-2">
                <Target className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>Siguiente Hito Comprometido:</strong> {selectedReunion.proximo_paso}</span>
              </div>
            )}

            {/* Cuadro de Firmas de Conformidad (Visible en Pantalla e Impresión) */}
            <div className="pt-4 mt-3 border-t-2 border-white/10 print:border-slate-300">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 print:text-slate-500 block text-center mb-4">
                Constancia y Firma de Acuerdos Vinculantes (Anti-teléfono Descompuesto)
              </span>
              <div className="grid grid-cols-2 gap-6 text-center">
                <div className="space-y-1">
                  <div className="border-b-2 border-slate-600 print:border-slate-400 h-12 flex items-end justify-center pb-1">
                    <span className="text-[9px] text-slate-500 italic">(Firma y Sello)</span>
                  </div>
                  <p className="text-xs font-black text-white print:text-slate-900 leading-tight">
                    {selectedReunion.convocante?.nombre_completo || 'Carlos Mendoza'}
                  </p>
                  <p className="text-[10px] text-slate-400 print:text-slate-500 font-bold">
                    Jefe de Proyecto / Contratista
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="border-b-2 border-slate-600 print:border-slate-400 h-12 flex items-end justify-center pb-1">
                    <span className="text-[9px] text-slate-500 italic">(Firma de Conformidad)</span>
                  </div>
                  <p className="text-xs font-black text-white print:text-slate-900 leading-tight">
                    {selectedReunion.proyecto.cliente_nombre || 'Don Juan Pérez'}
                  </p>
                  <p className="text-[10px] text-slate-400 print:text-slate-500 font-bold">
                    Cliente Oficial / Propietario
                  </p>
                </div>
              </div>
            </div>

            {/* Acciones Conectoras */}
            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 print:hidden">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                ¿Qué se hace con este acuerdo?
              </span>
              <div className="flex items-center gap-2">
                <Link
                  href="/ecs"
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Crear / Asociar Entregable (ECS)</span>
                </Link>
                <Link
                  href="/cambios/nueva"
                  className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shadow"
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
          mutateReuniones();
        }}
        initialProyectoId={proyectoFiltro || (proyectos[0]?.id ?? '')}
        initialFecha={formFecha || '2026-11-03'}
        proyectos={proyectos}
        usuarios={usuarios}
      />
    </div>
  );
}
