'use client';

import { useEffect, useState, useMemo } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { getTerminologia } from '@/lib/terminologia';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { useActiveProject } from '@/components/ProjectContext';
import LifecycleStepper from '@/components/LifecycleStepper';
import NotionSlideOver, { SlideOverItem } from '@/components/NotionSlideOver';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Layers, 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ArrowLeft,
  ChevronRight,
  User,
  UserCheck,
  Upload,
  FolderGit2,
  AlertCircle,
  Loader2,
  Lock,
  Code2,
  FileSpreadsheet,
  Compass,
  Check,
  Tag,
  Info,
  Sparkles,
  GitPullRequest,
  LayoutGrid,
  List,
  Eye,
} from 'lucide-react';

interface EcsItem {
  id: string;
  codigo: string;
  nombre: string;
  tipo: string;
  descripcion: string | null;
  ubicacion: string;
  atributos_personalizados: any;
  proyecto: { id: string; codigo: string; nombre: string };
  responsable: { id: string; nombre_completo: string; email: string };
  versiones: { id: string; numero_version: string; estado: string; created_at: string }[];
}

interface AuxData {
  proyectos: { id: string; codigo: string; nombre: string }[];
  usuarios: { id: string; nombre_completo: string; email: string; cargo?: string | null }[];
}

export default function EcsPage() {
  const router = useRouter();
  const [ecsList, setEcsList] = useState<EcsItem[]>([]);
  const [auxData, setAuxData] = useState<AuxData>({ proyectos: [], usuarios: [] });
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [filtroAsignacion, setFiltroAsignacion] = useState<'TODOS' | 'MIS_ASIGNACIONES'>('TODOS');
  const [search, setSearch] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [rubro, setRubro] = useState('CONSTRUCCION');
  const [tabEstado, setTabEstado] = useState<'TODOS' | 'PENDIENTE' | 'APROBADA'>('TODOS');
  const [vista, setVista] = useState<'CARDS' | 'LISTA'>('CARDS');
  const [mostrarOpcionesAvanzadas, setMostrarOpcionesAvanzadas] = useState(false);

  // Slide-over estilo Notion
  const [slideOverItem, setSlideOverItem] = useState<SlideOverItem | null>(null);
  const [slideOverOpen, setSlideOverOpen] = useState(false);

  // Modal nuevo ECS
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Campos formulario nuevo ECS
  const [proyectoId, setProyectoId] = useState('');
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('DOCUMENTO');
  const [descripcion, setDescripcion] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [responsableId, setResponsableId] = useState('');

  const generarCodigoSugerido = () => {
    const prefijo = tipo === 'DISENO' ? 'PLN' : tipo === 'CODIGO_FUENTE' ? 'MOD' : tipo === 'BASE_DATOS' ? 'DB' : 'ENT';
    const num = (ecsList.length + 1).toString().padStart(3, '0');
    const autoCode = `${prefijo}-${num}`;
    setCodigo(autoCode);
    if (!ubicacion) {
      setUbicacion(`/entregables/${autoCode.toLowerCase()}`);
    }
  };

  const { selectedProyectoId } = useActiveProject();

  // SWR: Caché en memoria para navegación instantánea (0ms)
  const ecsUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedProyectoId) params.set('proyectoId', selectedProyectoId);
    if (search.trim()) params.set('search', search.trim());
    if (tipoFiltro) params.set('tipo', tipoFiltro);
    const q = params.toString();
    return q ? `/api/ecs?${q}` : '/api/ecs';
  }, [selectedProyectoId, search, tipoFiltro]);

  const { data: dataEcs, mutate: mutateEcs } = useSWR(ecsUrl, fetcher, { revalidateOnFocus: false });
  const { data: dataAux } = useSWR('/api/auxiliares', fetcher, { revalidateOnFocus: false });
  const { data: dataMe } = useSWR('/api/auth/me', fetcher, { revalidateOnFocus: false });

  const loading = !dataEcs && ecsList.length === 0;

  useEffect(() => {
    if (dataEcs?.success && Array.isArray(dataEcs.data)) {
      setEcsList(dataEcs.data);
    }
  }, [dataEcs]);

  useEffect(() => {
    if (dataAux?.success) {
      setAuxData(dataAux.data);
      if (dataAux.data.proyectos?.length > 0 && !proyectoId) {
        setProyectoId(dataAux.data.proyectos[0].id);
      }
      if (dataAux.data.usuarios?.length > 0 && !responsableId) {
        setResponsableId(dataAux.data.usuarios[0].id);
      }
    }
  }, [dataAux, proyectoId, responsableId]);

  useEffect(() => {
    if (dataMe?.success && dataMe.data?.user) {
      const u = dataMe.data.user;
      setCurrentUser(u);
      if (u.rubro) setRubro(u.rubro);
      if (u.rol === 'SOLICITANTE') {
        setFiltroAsignacion('MIS_ASIGNACIONES');
      }
    }
  }, [dataMe]);

  const loadEcs = async () => {
    await mutateEcs();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutateEcs();
  };

  const handleCreateEcs = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    const finalCodigo = codigo.trim()
      ? codigo.trim().toUpperCase()
      : `ENT-${(ecsList.length + 1).toString().padStart(3, '0')}`;
    const finalUbicacion = ubicacion.trim()
      ? ubicacion.trim()
      : `/entregables/${finalCodigo.toLowerCase()}`;

    try {
      const res = await fetch('/api/ecs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proyecto_id: proyectoId,
          codigo: finalCodigo,
          nombre: nombre.trim(),
          tipo,
          descripcion: descripcion.trim() || undefined,
          ubicacion: finalUbicacion,
          responsable_id: responsableId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        const errDetail =
          data.errors?.codigo?._errors?.[0] ||
          data.errors?.nombre?._errors?.[0] ||
          data.errors?.ubicacion?._errors?.[0] ||
          data.errors?.responsable_id?._errors?.[0] ||
          data.message ||
          'Error al registrar el ECS';
        setFormError(errDetail);
        setSaving(false);
        return;
      }

      setModalOpen(false);
      setCodigo('');
      setNombre('');
      setDescripcion('');
      setUbicacion('');
      loadEcs();
    } catch {
      setFormError('Error de conexión con el servidor');
    } finally {
      setSaving(false);
    }
  };

  const renderBadgeEstado = (estado: string) => {
    switch (estado) {
      case 'APROBADA':
        return (
          <span
            className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-sm"
            title="Aprobada formalmente: Apta para congelar en Línea Base"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Aprobada (Apta Línea Base)
          </span>
        );
      case 'RECHAZADA':
        return (
          <span
            className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-red-100 text-red-900 border border-red-300 shadow-sm"
            title="Rechazada con observaciones técnicas"
          >
            <XCircle className="w-3.5 h-3.5 text-red-600" /> Rechazada
          </span>
        );
      default:
        return (
          <span
            className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 border border-amber-400 shadow-sm"
            title="Pendiente de dictamen técnico del Tech Lead"
          >
            <Clock className="w-3.5 h-3.5 text-amber-700" /> Pendiente Dictamen
          </span>
        );
    }
  };

  const getTipoStyle = (tipo: string) => {
    switch (tipo) {
      case 'CODIGO_FUENTE':
        return { label: 'Código Fuente', color: 'bg-blue-100 text-blue-900 border-blue-300', icon: Code2 };
      case 'DISENO':
        return { label: 'Diseño / Planos', color: 'bg-purple-100 text-purple-900 border-purple-300', icon: Layers };
      case 'BASE_DATOS':
        return { label: 'Base de Datos', color: 'bg-amber-100 text-amber-900 border-amber-300', icon: FileSpreadsheet };
      case 'DOCUMENTO':
      default:
        return { label: 'Documento / Req.', color: 'bg-slate-100 text-slate-800 border-slate-300', icon: FileText };
    }
  };

  const terminologia = getTerminologia(rubro);

  return (
    <AppShell user={currentUser}>
      {/* Sub-Header y Acciones del Catálogo */}
      <div className="bg-[#16181D] border-b border-white/10 h-16 flex items-center shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href="/dashboard"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition border border-white/10"
              title="Volver al Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                Catálogo de Entregables (ECS)
              </h1>
              <p className="text-xs text-slate-400 truncate">
                {terminologia.ecsSubtitulo} validados técnicamente
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/aprobaciones"
              className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-200 hover:bg-white/10 border border-white/15 transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dictaminar</span>
            </Link>
            <Link
              href="/lineas-base"
              className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-200 hover:bg-white/10 border border-white/15 transition flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              <span>Hitos Oficiales</span>
            </Link>
            <button
              onClick={() => setModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-upt-gold to-amber-400 hover:brightness-110 text-slate-950 font-bold text-xs shadow-xs transition flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Nuevo Entregable</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6">
        
        {/* Flujo Guiado de 5 Fases Estilo Notion */}
        <LifecycleStepper
          currentStep={2}
          rubro={rubro}
          counts={{
            ecs: ecsList.length,
            aprobacionesPendientes: ecsList.filter((e) => e.versiones[0]?.estado === 'PENDIENTE').length,
          }}
        />
        
        {/* Metric Strip Estilo Linear */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#1A1D25] rounded-2xl p-4 border border-white/10 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block">Total Entregables</span>
              <span className="text-xl sm:text-2xl font-black text-white">{ecsList.length}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/5 text-sky-400 flex items-center justify-center border border-white/10">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#1A1D25] rounded-2xl p-4 border border-white/10 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block">Aprobados y Listos</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400">
                {ecsList.filter((e) => e.versiones[0]?.estado === 'APROBADA').length}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#1A1D25] rounded-2xl p-4 border border-white/10 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block">En Revisión</span>
              <span className="text-xl sm:text-2xl font-black text-amber-400">
                {ecsList.filter((e) => e.versiones[0]?.estado === 'PENDIENTE').length}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#1A1D25] rounded-2xl p-4 border border-white/10 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block">A tu Cargo</span>
              <span className="text-xl sm:text-2xl font-black text-upt-gold">
                {ecsList.filter((e) => e.responsable?.id === currentUser?.userId).length}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-upt-gold/10 text-upt-gold flex items-center justify-center border border-upt-gold/20">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Consola de Búsqueda, Filtros y Conmutador de Vistas */}
        <div className="bg-[#1A1D25] p-4 sm:p-5 rounded-2xl border border-white/10 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Search className="w-4 h-4 text-slate-400" />
              <span>Explorador de Entregables</span>
            </span>

            {/* Selector de Vista: Tarjetas vs Lista Compacta */}
            <div className="flex items-center gap-1 bg-[#14161E] p-1 rounded-xl border border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => setVista('CARDS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  vista === 'CARDS'
                    ? 'bg-gradient-to-r from-upt-gold to-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Vista en Tarjetas"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Tarjetas</span>
              </button>
              <button
                type="button"
                onClick={() => setVista('LISTA')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  vista === 'LISTA'
                    ? 'bg-gradient-to-r from-upt-gold to-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Vista Lista Compacta (Linear)"
              >
                <List className="w-3.5 h-3.5" />
                <span>Lista Compacta</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
            {/* Input de Búsqueda */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por código (ej. ENT-01), plano o título..."
                className="w-full pl-10 pr-4 py-2 bg-[#14161E] border border-white/10 rounded-xl text-xs sm:text-sm font-medium text-white placeholder:text-slate-500 focus:bg-[#14161E] focus:border-sky-400/50 transition outline-hidden"
              />
            </div>

            {/* Selector de Tipo */}
            <div className="sm:w-60">
              <select
                value={tipoFiltro}
                onChange={(e) => setTipoFiltro(e.target.value)}
                className="w-full px-3 py-2 bg-[#14161E] border border-white/10 rounded-xl text-xs sm:text-sm font-medium text-slate-200 focus:bg-[#14161E] focus:border-sky-400/50 transition cursor-pointer"
              >
                <option value="">Todos los Tipos de Entregable</option>
                <option value="DOCUMENTO">Documentos / Memorias</option>
                <option value="CODIGO_FUENTE">Código / Módulos</option>
                <option value="DISENO">Planos / Diseños BIM</option>
                <option value="BASE_DATOS">Base de Datos / Tablas</option>
                <option value="CASO_PRUEBA">Ensayos / Pruebas</option>
              </select>
            </div>

            {/* Botón Buscar */}
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shrink-0 border border-white/10"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Buscar</span>
            </button>
          </form>

          {/* Pestañas de Asignación y Estados */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setFiltroAsignacion('MIS_ASIGNACIONES')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  filtroAsignacion === 'MIS_ASIGNACIONES'
                    ? 'bg-gradient-to-r from-upt-gold to-amber-400 text-slate-950 shadow-sm'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Mis Asignaciones</span>
                <span className={`text-[10px] px-2 py-0.2 rounded-full font-semibold ${
                  filtroAsignacion === 'MIS_ASIGNACIONES' ? 'bg-slate-900 text-amber-200' : 'bg-white/10 text-slate-300'
                }`}>
                  {ecsList.filter((e) => e.responsable?.id === currentUser?.userId).length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setFiltroAsignacion('TODOS')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  filtroAsignacion === 'TODOS'
                    ? 'bg-gradient-to-r from-upt-gold to-amber-400 text-slate-950 shadow-sm'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Todos ({ecsList.length})</span>
              </button>
            </div>

            {/* Filtros Rápidos por Estado */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setTabEstado('TODOS')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  tabEstado === 'TODOS'
                    ? 'bg-upt-gold text-slate-950 shadow'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setTabEstado('PENDIENTE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  tabEstado === 'PENDIENTE'
                    ? 'bg-amber-400 text-slate-950 font-black shadow'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                En Revisión ({ecsList.filter((e) => e.versiones[0]?.estado === 'PENDIENTE').length})
              </button>
              <button
                type="button"
                onClick={() => setTabEstado('APROBADA')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  tabEstado === 'APROBADA'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Aprobados ({ecsList.filter((e) => e.versiones[0]?.estado === 'APROBADA').length})
              </button>
            </div>
          </div>
        </div>

        {/* Listado de Entregables */}
        {loading ? (
          <div className="p-16 text-center bg-[#1A1D25] rounded-3xl border border-white/10 shadow-sm">
            <Loader2 className="w-10 h-10 animate-spin text-upt-gold mx-auto mb-3" />
            <p className="text-xs font-black text-slate-300 uppercase tracking-wider">
              Cargando entregables del proyecto...
            </p>
          </div>
        ) : ecsList.filter((item) => {
            if (filtroAsignacion === 'MIS_ASIGNACIONES' && item.responsable?.id !== currentUser?.userId) {
              return false;
            }
            if (tabEstado === 'TODOS') return true;
            const u = item.versiones[0];
            if (tabEstado === 'PENDIENTE') return u?.estado === 'PENDIENTE';
            if (tabEstado === 'APROBADA') return u?.estado === 'APROBADA';
            return true;
          }).length === 0 ? (
          <div className="bg-[#1A1D25] rounded-3xl border-2 border-dashed border-white/10 p-12 text-center shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-white/5 text-sky-400 flex items-center justify-center mx-auto mb-3 border border-white/10">
              <Layers className="w-7 h-7" />
            </div>
            <h3 className="font-black text-white text-base">
              {filtroAsignacion === 'MIS_ASIGNACIONES'
                ? 'No tienes entregables asignados directamente'
                : 'No se encontraron entregables con este filtro'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
              {filtroAsignacion === 'MIS_ASIGNACIONES'
                ? 'El Jefe de Proyecto puede asignarte como Responsable al registrar nuevos entregables.'
                : 'No hay elementos con este criterio. Puedes cambiar los filtros o registrar uno nuevo en 3 clics.'}
            </p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                onClick={() => {
                  setFiltroAsignacion('TODOS');
                  setTabEstado('TODOS');
                  setSearch('');
                  setTipoFiltro('');
                }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition border border-white/10"
              >
                Ver Todos
              </button>
              <button
                onClick={() => {
                  generarCodigoSugerido();
                  setModalOpen(true);
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-upt-gold to-amber-400 hover:brightness-110 text-slate-950 font-bold text-xs shadow-xs transition"
              >
                + Registrar Entregable
              </button>
            </div>
          </div>
        ) : vista === 'LISTA' ? (
          /* ======================================================== */
          /* VISTA LISTA COMPACTA ESTILO LINEAR                       */
          /* ======================================================== */
          <div className="bg-[#1A1D25] rounded-2xl border border-white/10 overflow-hidden shadow-md divide-y divide-white/5">
            <div className="px-5 py-3 bg-[#14161E] border-b border-white/10 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <div className="flex items-center gap-3">
                <span>Estado</span>
                <span>Código</span>
                <span>Entregable</span>
              </div>
              <div className="flex items-center gap-6">
                <span className="hidden md:inline">Responsable</span>
                <span className="hidden sm:inline">Versión</span>
                <span>Acción</span>
              </div>
            </div>

            {ecsList
              .filter((item) => {
                if (filtroAsignacion === 'MIS_ASIGNACIONES' && item.responsable?.id !== currentUser?.userId) {
                  return false;
                }
                if (tabEstado === 'TODOS') return true;
                const u = item.versiones[0];
                if (tabEstado === 'PENDIENTE') return u?.estado === 'PENDIENTE';
                if (tabEstado === 'APROBADA') return u?.estado === 'APROBADA';
                return true;
              })
              .map((item) => {
                const ultimaVersion = item.versiones[0];
                const isMyEcs = item.responsable?.id === currentUser?.userId;
                const isAprobada = ultimaVersion?.estado === 'APROBADA';
                const isPendiente = ultimaVersion?.estado === 'PENDIENTE';

                return (
                  <div
                    key={item.id}
                    className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-white/5 transition group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Dot de Estado */}
                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          isAprobada
                            ? 'bg-emerald-400 ring-4 ring-emerald-500/20'
                            : isPendiente
                            ? 'bg-amber-400 animate-pulse ring-4 ring-amber-500/20'
                            : 'bg-slate-500'
                        }`}
                        title={isAprobada ? 'Aprobado' : isPendiente ? 'En Revisión' : 'Borrador'}
                      />

                      {/* Código */}
                      <span className="font-mono text-xs font-bold text-sky-300 bg-white/5 px-2 py-0.5 rounded border border-white/10 shrink-0">
                        {item.codigo}
                      </span>

                      {/* Título */}
                      <div className="min-w-0">
                        <Link
                          href={`/ecs/${item.id}`}
                          className="font-bold text-sm text-white hover:text-sky-300 transition truncate block group-hover:underline"
                        >
                          {item.nombre}
                        </Link>
                        <span className="text-[11px] text-slate-400 truncate block">
                          {item.proyecto.codigo} • {item.tipo}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                      {/* Responsable */}
                      <div className="hidden md:flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-black text-[10px] flex items-center justify-center">
                          {item.responsable.nombre_completo.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs text-slate-300 font-medium max-w-[120px] truncate">
                          {item.responsable.nombre_completo}
                        </span>
                      </div>

                      {/* Versión */}
                      <div className="hidden sm:block">
                        {ultimaVersion ? (
                          <span className="font-mono text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded border border-white/10">
                            v{ultimaVersion.numero_version}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500 italic">v0.0</span>
                        )}
                      </div>

                      {/* Vista Rápida Slide-over */}
                      <button
                        type="button"
                        onClick={() => {
                          setSlideOverItem(item);
                          setSlideOverOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/10 transition flex items-center gap-1 border border-white/5"
                        title="Ficha rápida estilo Notion"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden lg:inline text-[11px]">Ficha</span>
                      </button>

                      {/* Botón Abrir */}
                      <Link
                        href={`/ecs/${item.id}`}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          isMyEcs
                            ? 'bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 border border-sky-400/30'
                            : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10'
                        }`}
                      >
                        <span>Abrir</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          /* ======================================================== */
          /* VISTA TARJETAS MODERNAS ESTILO LINEAR                    */
          /* ======================================================== */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {ecsList
              .filter((item) => {
                if (filtroAsignacion === 'MIS_ASIGNACIONES' && item.responsable?.id !== currentUser?.userId) {
                  return false;
                }
                if (tabEstado === 'TODOS') return true;
                const u = item.versiones[0];
                if (tabEstado === 'PENDIENTE') return u?.estado === 'PENDIENTE';
                if (tabEstado === 'APROBADA') return u?.estado === 'APROBADA';
                return true;
              })
              .map((item) => {
                const tipoInfo = getTipoStyle(item.tipo);
                const TipoIcon = tipoInfo.icon;
                const ultimaVersion = item.versiones[0];
                const isMyEcs = item.responsable?.id === currentUser?.userId;

                // Cálculo de porcentaje y estado visual
                let progresoPct = 20;
                let progresoTexto = 'En Borrador (v0.0)';
                let colorProgreso = 'bg-slate-500';
                if (ultimaVersion?.estado === 'APROBADA') {
                  progresoPct = 100;
                  progresoTexto = '100% Completado y Aprobado';
                  colorProgreso = 'bg-emerald-500';
                } else if (ultimaVersion?.estado === 'PENDIENTE') {
                  progresoPct = 65;
                  progresoTexto = 'En Revisión Técnica';
                  colorProgreso = 'bg-amber-400';
                } else if (ultimaVersion?.estado === 'RECHAZADA') {
                  progresoPct = 40;
                  progresoTexto = 'Observado para corrección';
                  colorProgreso = 'bg-rose-500';
                }

                return (
                  <div
                    key={item.id}
                    className={`bg-[#1A1D25] rounded-3xl border shadow-md hover:border-white/25 transition-all duration-200 flex flex-col justify-between overflow-hidden group ${
                      isMyEcs
                        ? 'border-sky-500/40 ring-1 ring-sky-500/20'
                        : 'border-white/10'
                    }`}
                  >
                    <div>
                      {/* Header de la Tarjeta */}
                      <div className="p-4 sm:p-5 pb-3 border-b border-white/10 bg-[#14161E] flex items-start justify-between gap-2.5">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                            <span className="font-mono text-xs font-bold text-sky-300 bg-white/10 px-2.5 py-0.5 rounded-lg border border-white/10 flex items-center gap-1">
                              <Layers className="w-3.5 h-3.5 text-sky-400" />
                              {item.codigo}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-300 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                              {item.proyecto.codigo}
                            </span>
                            {isMyEcs && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 flex items-center gap-1">
                                <UserCheck className="w-3 h-3 text-sky-400" /> A tu cargo
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-white text-base group-hover:text-sky-300 transition leading-snug">
                            {item.nombre}
                          </h3>
                        </div>

                        {/* Pill de Tipo */}
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-xl border uppercase shrink-0 ${tipoInfo.color}`}>
                          <TipoIcon className="w-3 h-3" />
                          <span>{tipoInfo.label}</span>
                        </span>
                      </div>

                      {/* Contenido de la Tarjeta */}
                      <div className="p-4 sm:p-5 py-4 space-y-3.5">
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {item.descripcion || 'Sin descripción adicional registrada.'}
                        </p>

                        {/* Barra de Progreso Visual */}
                        <div className="space-y-1.5 bg-[#14161E] p-3 rounded-2xl border border-white/10">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 font-semibold">{progresoTexto}</span>
                            <span className="font-mono font-bold text-white">{progresoPct}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${colorProgreso} rounded-full transition-all duration-500`}
                              style={{ width: `${progresoPct}%` }}
                            />
                          </div>
                        </div>

                        {/* Estado y Versión */}
                        <div className="flex items-center justify-between text-xs pt-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 font-semibold text-[11px]">Versión:</span>
                            {ultimaVersion ? (
                              <span className="font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                                v{ultimaVersion.numero_version}
                              </span>
                            ) : (
                              <span className="text-slate-500 text-xs italic">Borrador</span>
                            )}
                          </div>
                          {ultimaVersion && renderBadgeEstado(ultimaVersion.estado)}
                        </div>

                        {/* Responsable con Avatar */}
                        <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                            {item.responsable.nombre_completo.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-xs text-slate-300 font-medium truncate">
                            {item.responsable.nombre_completo}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer con Enlace de Acción Rápida */}
                    <div className="p-4 pt-0 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSlideOverItem(item);
                          setSlideOverOpen(true);
                        }}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition flex items-center justify-center shrink-0"
                        title="Ver ficha lateral estilo Notion"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/ecs/${item.id}`}
                        className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs transition flex items-center justify-between group/btn shadow-xs active:scale-98 ${
                          isMyEcs && !ultimaVersion
                            ? 'bg-sky-600 hover:bg-sky-500 text-white'
                            : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          {isMyEcs && !ultimaVersion ? (
                            <>
                              <Upload className="w-3.5 h-3.5 text-sky-200" />
                              <span>Subir Primer Avance (v1.0)</span>
                            </>
                          ) : isMyEcs ? (
                            <>
                              <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                              <span>Actualizar Mi Entregable</span>
                            </>
                          ) : (
                            <span>Ver Detalles e Historial</span>
                          )}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

      </main>

      {/* Modal Creación Rápida "Fast-Track" (3 Clics) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1A1D25] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-white/10 space-y-5 animate-in fade-in zoom-in-95 duration-150 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-upt-gold to-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-sm">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Registrar Nuevo Entregable
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Crea el producto en 3 clics para que el equipo comience a trabajar
                  </span>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-bold flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateEcs} className="space-y-4">
              {/* Plantillas Rápidas Estilo Notion (Adaptadas al Rubro) */}
              <div className="bg-[#14161E] p-3 rounded-2xl border border-white/10 space-y-2">
                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Plantillas Rápidas ({rubro === 'CONSTRUCCION' ? 'Obra Civil' : rubro === 'VETERINARIA' ? 'Clínica Veterinaria' : 'Software'}):</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {rubro === 'CONSTRUCCION' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setNombre('Plano Estructural de Cimentación y Armaduras');
                          setTipo('DISENO');
                          setDescripcion('Plano técnico acotado con especificación de acero corrugado, zapatas y memoria de cálculo estructural.');
                          generarCodigoSugerido();
                        }}
                        className="text-[11px] font-medium bg-white/5 hover:bg-white/15 text-slate-200 hover:text-white px-2.5 py-1 rounded-lg border border-white/10 transition"
                      >
                        📐 Plano Estructural
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNombre('Memoria de Cálculo y Sismorresistencia');
                          setTipo('DOCUMENTO');
                          setDescripcion('Informe técnico de cargas, análisis sísmico conforme a norma E.030 y especificaciones de concreto.');
                          generarCodigoSugerido();
                        }}
                        className="text-[11px] font-medium bg-white/5 hover:bg-white/15 text-slate-200 hover:text-white px-2.5 py-1 rounded-lg border border-white/10 transition"
                      >
                        📄 Memoria de Cálculo
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNombre('Planilla de Metrados y Presupuesto de Obra');
                          setTipo('BASE_DATOS');
                          setDescripcion('Desglose de partidas, volúmenes de concreto, acero, acabados y cronograma valorizado de obra.');
                          generarCodigoSugerido();
                        }}
                        className="text-[11px] font-medium bg-white/5 hover:bg-white/15 text-slate-200 hover:text-white px-2.5 py-1 rounded-lg border border-white/10 transition"
                      >
                        🏗️ Metrados y Partidas
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNombre('Protocolo de Calidad y Ensayo de Probetas');
                          setTipo('CASO_PRUEBA');
                          setDescripcion('Registro de ensayos de resistencia a la compresión de concreto f\'c=210 kg/cm2 y verificación en obra.');
                          generarCodigoSugerido();
                        }}
                        className="text-[11px] font-medium bg-white/5 hover:bg-white/15 text-slate-200 hover:text-white px-2.5 py-1 rounded-lg border border-white/10 transition"
                      >
                        🧪 Control de Calidad
                      </button>
                    </>
                  ) : rubro === 'VETERINARIA' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setNombre('Historia Clínica y Anamnesis Inicial');
                          setTipo('DOCUMENTO');
                          setDescripcion('Evaluación clínica completa del paciente, signos vitales, peso, temperatura y antecedentes.');
                          generarCodigoSugerido();
                        }}
                        className="text-[11px] font-medium bg-white/5 hover:bg-white/15 text-slate-200 hover:text-white px-2.5 py-1 rounded-lg border border-white/10 transition"
                      >
                        🩺 Historia Clínica
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNombre('Resultados de Hemograma y Perfil Bioquímico');
                          setTipo('CASO_PRUEBA');
                          setDescripcion('Exámenes de laboratorio pre-quirúrgicos con valores hematológicos y evaluación hepática/renal.');
                          generarCodigoSugerido();
                        }}
                        className="text-[11px] font-medium bg-white/5 hover:bg-white/15 text-slate-200 hover:text-white px-2.5 py-1 rounded-lg border border-white/10 transition"
                      >
                        🧪 Análisis Lab.
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNombre('Protocolo Anestésico y Consentimiento Quirúrgico');
                          setTipo('DISENO');
                          setDescripcion('Plan de dosificación anestésica, monitoreo intraoperatorio y consentimiento firmado por el tutor.');
                          generarCodigoSugerido();
                        }}
                        className="text-[11px] font-medium bg-white/5 hover:bg-white/15 text-slate-200 hover:text-white px-2.5 py-1 rounded-lg border border-white/10 transition"
                      >
                        💉 Plan Quirúrgico
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNombre('Registro de Dosis y Evolución Postoperatoria');
                          setTipo('BASE_DATOS');
                          setDescripcion('Tabla de medicación, antibióticos, analgésicos y evolución de signos vitales en recuperación.');
                          generarCodigoSugerido();
                        }}
                        className="text-[11px] font-medium bg-white/5 hover:bg-white/15 text-slate-200 hover:text-white px-2.5 py-1 rounded-lg border border-white/10 transition"
                      >
                        📋 Tratamiento
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setNombre('Especificación de Requerimientos del Sistema (SRS)');
                          setTipo('DOCUMENTO');
                          setDescripcion('Documento formal de requerimientos funcionales, no funcionales e interfaces de usuario conforme a IEEE 830.');
                          generarCodigoSugerido();
                        }}
                        className="text-[11px] font-medium bg-white/5 hover:bg-white/15 text-slate-200 hover:text-white px-2.5 py-1 rounded-lg border border-white/10 transition"
                      >
                        📄 Req. IEEE
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNombre('Módulo de Autenticación y Autorización RBAC');
                          setTipo('CODIGO_FUENTE');
                          setDescripcion('Componentes, middleware y endpoints con tokens JWT en cookies HttpOnly para control de roles.');
                          generarCodigoSugerido();
                        }}
                        className="text-[11px] font-medium bg-white/5 hover:bg-white/15 text-slate-200 hover:text-white px-2.5 py-1 rounded-lg border border-white/10 transition"
                      >
                        💻 Módulo Código
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNombre('Diseño de Arquitectura y Prototipo UI/UX');
                          setTipo('DISENO');
                          setDescripcion('Diagramas de arquitectura en capas y prototipo interactivo de interfaces responsivas.');
                          generarCodigoSugerido();
                        }}
                        className="text-[11px] font-medium bg-white/5 hover:bg-white/15 text-slate-200 hover:text-white px-2.5 py-1 rounded-lg border border-white/10 transition"
                      >
                        🎨 Diseño UI/UX
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNombre('Esquema Relacional y Migración Inicial DDL');
                          setTipo('BASE_DATOS');
                          setDescripcion('Modelo relacional normalizado con integridad referencial, índices y auditoría inmutable.');
                          generarCodigoSugerido();
                        }}
                        className="text-[11px] font-medium bg-white/5 hover:bg-white/15 text-slate-200 hover:text-white px-2.5 py-1 rounded-lg border border-white/10 transition"
                      >
                        🗄️ Base de Datos
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Nombre del Entregable */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    1. ¿Qué producto se va a construir o entregar? <span className="text-upt-gold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Plano Estructural de Cimientos, Módulo de Pagos, etc."
                    className="w-full px-3.5 py-2.5 bg-[#14161E] border border-white/10 rounded-xl text-xs sm:text-sm font-semibold text-white placeholder:text-slate-500 focus:border-upt-gold focus:ring-1 focus:ring-upt-gold/30 transition outline-hidden"
                  />
                </div>

                {/* 2. Responsable */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    2. ¿Quién es el Especialista Responsable? <span className="text-upt-gold">*</span>
                  </label>
                  <select
                    value={responsableId}
                    onChange={(e) => setResponsableId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#14161E] border border-white/10 rounded-xl text-xs sm:text-sm font-bold text-white focus:border-upt-gold transition cursor-pointer"
                  >
                    {auxData.usuarios.map((u) => (
                      <option key={u.id} value={u.id} className="bg-[#1A1D25] text-white">
                        {u.nombre_completo}{u.cargo ? ` — ${u.cargo}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Tipo de Entregable */}
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    3. Tipo de Producto <span className="text-upt-gold">*</span>
                  </label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    className="w-full px-3 py-2 bg-[#14161E] border border-white/10 rounded-xl text-xs font-bold text-white focus:border-upt-gold transition cursor-pointer"
                  >
                    {terminologia.ecsTipos.map((t) => (
                      <option key={t.valor} value={t.valor} className="bg-[#1A1D25] text-white">
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Proyecto */}
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Proyecto <span className="text-upt-gold">*</span>
                  </label>
                  <select
                    value={proyectoId}
                    onChange={(e) => setProyectoId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#14161E] border border-white/10 rounded-xl text-xs font-bold text-white focus:border-upt-gold transition cursor-pointer"
                  >
                    {auxData.proyectos.map((p) => (
                      <option key={p.id} value={p.id} className="bg-[#1A1D25] text-white">
                        {p.codigo} - {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Botón para Desplegar Opciones Técnicas Avanzadas */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setMostrarOpcionesAvanzadas(!mostrarOpcionesAvanzadas)}
                  className="text-xs text-slate-400 hover:text-upt-gold flex items-center gap-1.5 font-semibold transition"
                >
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${mostrarOpcionesAvanzadas ? 'rotate-90' : ''}`} />
                  <span>{mostrarOpcionesAvanzadas ? 'Ocultar Opciones Técnicas Avanzadas' : 'Ver Opciones Avanzadas (Código ISO, Ruta, Descripción)'}</span>
                </button>
              </div>

              {mostrarOpcionesAvanzadas && (
                <div className="p-4 bg-[#14161E] rounded-2xl border border-white/10 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-300">
                      Código Técnico (ECS)
                    </label>
                    <button
                      type="button"
                      onClick={generarCodigoSugerido}
                      className="text-[11px] font-bold text-sky-400 hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Generar Código Automático</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                    placeholder="Dejar en blanco para autogenerar (ej. ENT-001)"
                    className="w-full px-3 py-2 bg-[#1A1D25] border border-white/10 rounded-xl text-xs font-mono font-bold uppercase text-white placeholder:text-slate-500 focus:border-sky-400 transition"
                  />

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Ubicación de Archivo o Repositorio
                    </label>
                    <input
                      type="text"
                      value={ubicacion}
                      onChange={(e) => setUbicacion(e.target.value)}
                      placeholder="Dejar en blanco para ruta automática (/entregables/...)"
                      className="w-full px-3 py-2 bg-[#1A1D25] border border-white/10 rounded-xl text-xs font-mono text-white placeholder:text-slate-500 focus:border-sky-400 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Descripción Técnica
                    </label>
                    <textarea
                      rows={2}
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      placeholder="Detalles sobre lo que se espera en este entregable..."
                      className="w-full px-3 py-2 bg-[#1A1D25] border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:border-sky-400 transition"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-400 font-bold text-xs hover:bg-white/10 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-upt-gold to-amber-400 hover:brightness-110 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-2 active:scale-95"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Creando Entregable...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 text-slate-950" />
                      <span>Crear Entregable</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Slide-over tipo Notion para ficha rápida e interactiva */}
      <NotionSlideOver
        item={slideOverItem}
        isOpen={slideOverOpen}
        onClose={() => setSlideOverOpen(false)}
        onDictaminar={() => router.push('/aprobaciones')}
      />
    </AppShell>
  );
}
