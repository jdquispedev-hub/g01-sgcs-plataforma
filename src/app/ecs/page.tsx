'use client';

import { useEffect, useState } from 'react';
import { getTerminologia } from '@/lib/terminologia';
import Link from 'next/link';
import NavbarPrincipal from '@/components/NavbarPrincipal';
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
  const [ecsList, setEcsList] = useState<EcsItem[]>([]);
  const [auxData, setAuxData] = useState<AuxData>({ proyectos: [], usuarios: [] });
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [filtroAsignacion, setFiltroAsignacion] = useState<'TODOS' | 'MIS_ASIGNACIONES'>('TODOS');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [rubro, setRubro] = useState('CONSTRUCCION');
  const [tabEstado, setTabEstado] = useState<'TODOS' | 'PENDIENTE' | 'APROBADA'>('TODOS');

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

  // Cargar datos
  const loadEcs = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/ecs', window.location.origin);
      if (search) url.searchParams.set('search', search);
      if (tipoFiltro) url.searchParams.set('tipo', tipoFiltro);

      const [resEcs, resAux, resMe] = await Promise.all([
        fetch(url.toString()),
        fetch('/api/auxiliares'),
        fetch('/api/auth/me'),
      ]);

      const dataEcs = await resEcs.json();
      const dataAux = await resAux.json();
      const dataMe = await resMe.json();

      if (dataMe?.success) {
        const u = dataMe.data?.user || dataMe.user;
        if (u) {
          setCurrentUser(u);
          if (u.rubro) setRubro(u.rubro);
          if (u.rol === 'SOLICITANTE') {
            setFiltroAsignacion('MIS_ASIGNACIONES');
          }
        }
      }

      if (dataEcs.success) setEcsList(dataEcs.data);
      if (dataAux.success) {
        setAuxData(dataAux.data);
        if (dataAux.data.proyectos.length > 0 && !proyectoId) {
          setProyectoId(dataAux.data.proyectos[0].id);
        }
        if (dataAux.data.usuarios.length > 0 && !responsableId) {
          setResponsableId(dataAux.data.usuarios[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEcs();
  }, [tipoFiltro]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadEcs();
  };

  const handleCreateEcs = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    try {
      const res = await fetch('/api/ecs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proyecto_id: proyectoId,
          codigo: codigo.trim().toUpperCase(),
          nombre: nombre.trim(),
          tipo,
          descripcion: descripcion.trim() || undefined,
          ubicacion: ubicacion.trim(),
          responsable_id: responsableId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.message || 'Error al registrar el ECS');
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
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col antialiased">
      {/* Navbar Global Unificado */}
      <NavbarPrincipal user={currentUser} />

      {/* Sub-Header y Acciones del Catálogo */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href="/dashboard"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition border border-slate-200"
              title="Volver al Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
                Catálogo de Entregables (ECS)
              </h1>
              <p className="text-xs text-slate-500 truncate">
                {terminologia.ecsSubtitulo} validados técnicamente
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/aprobaciones"
              className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 hover:bg-slate-100 border border-slate-200 transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dictaminar</span>
            </Link>
            <Link
              href="/lineas-base"
              className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 hover:bg-slate-100 border border-slate-200 transition flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-purple-600" />
              <span>Hitos Oficiales</span>
            </Link>
            <button
              onClick={() => setModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Entregable</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6">
        
        {/* Banner de Contexto: ¿Qué es un ECS? */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-sky-600 text-xs font-semibold uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Fase 2: Catálogo de Artefactos de Obra</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              ¿Qué es un Entregable o Componente de Configuración (ECS)?
            </h2>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Es cualquier pieza técnica o entregable auditado (un plano estructural, memoria de cálculo o especificación técnica).
              Cada versión propuesta debe ser revisada y <strong className="text-emerald-700">APROBADA</strong> por el responsable de calidad antes de incluirse en un Hito Oficial (Línea Base).
            </p>
          </div>
          <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 text-center shrink-0">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Entregables Totales</span>
            <span className="text-2xl font-bold text-slate-900">{ecsList.length}</span>
          </div>
        </div>

        {/* Consola de Búsqueda y Filtros de Alto Contraste */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Search className="w-4 h-4 text-slate-400" />
              <span>Búsqueda de Entregables</span>
            </span>
            <span className="text-xs text-slate-500">
              {ecsList.length} resultados encontrados
            </span>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
            {/* Input de Búsqueda */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Escribe el código (ej. PLN-EST-01) o nombre del entregable..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-400 transition"
              />
            </div>

            {/* Selector de Tipo */}
            <div className="sm:w-60">
              <select
                value={tipoFiltro}
                onChange={(e) => setTipoFiltro(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:border-slate-400 transition cursor-pointer"
              >
                <option value="">Todos los Tipos de ECS</option>
                <option value="DOCUMENTO">Documentos / Memorias</option>
                <option value="CODIGO_FUENTE">Código / Módulos</option>
                <option value="DISENO">Planos / Modelos BIM</option>
                <option value="BASE_DATOS">Base de Datos / Tablas</option>
                <option value="CASO_PRUEBA">Ensayos / Pruebas</option>
              </select>
            </div>

            {/* Botón Buscar */}
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shrink-0"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Buscar</span>
            </button>
          </form>

          {/* Pestañas de Asignación Personal */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-200">
            <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-slate-500" /> Vista:
            </span>
            <button
              type="button"
              onClick={() => setFiltroAsignacion('MIS_ASIGNACIONES')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                filtroAsignacion === 'MIS_ASIGNACIONES'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Mis Asignaciones</span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-200 font-semibold">
                {ecsList.filter((e) => e.responsable?.id === currentUser?.userId).length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setFiltroAsignacion('TODOS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                filtroAsignacion === 'TODOS'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Todos los Entregables</span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-200 text-slate-700 font-semibold">
                {ecsList.length}
              </span>
            </button>
          </div>

          {/* Filtros Rápidos por Estado de Aprobación */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-500 mr-1">Filtrar por estado:</span>
            <button
              type="button"
              onClick={() => setTabEstado('TODOS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                tabEstado === 'TODOS'
                  ? 'bg-upt-navy-900 text-upt-gold shadow'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Todos ({ecsList.length})
            </button>
            <button
              type="button"
              onClick={() => setTabEstado('PENDIENTE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                tabEstado === 'PENDIENTE'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Esperando Aprobación ({ecsList.filter((e) => e.versiones[0]?.estado === 'PENDIENTE').length})
            </button>
            <button
              type="button"
              onClick={() => setTabEstado('APROBADA')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                tabEstado === 'APROBADA'
                  ? 'bg-emerald-600 text-white font-black shadow'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Aprobados / Listos ({ecsList.filter((e) => e.versiones[0]?.estado === 'APROBADA').length})
            </button>
          </div>
        </div>

        {/* Grilla de Elementos de Configuración (ECS) */}
        {loading ? (
          <div className="p-16 text-center bg-white rounded-3xl border-2 border-slate-200 shadow-sm">
            <Loader2 className="w-10 h-10 animate-spin text-upt-navy-700 mx-auto mb-3" />
            <p className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Consultando catálogo oficial de entregables...
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
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-300 p-12 text-center shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-upt-navy-50 text-upt-navy-700 flex items-center justify-center mx-auto mb-3 border border-upt-navy-200">
              <Layers className="w-7 h-7" />
            </div>
            <h3 className="font-black text-slate-900 text-base">
              {filtroAsignacion === 'MIS_ASIGNACIONES'
                ? 'No tienes entregables asignados directamente'
                : 'No se encontraron entregables con este filtro'}
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto leading-relaxed">
              {filtroAsignacion === 'MIS_ASIGNACIONES'
                ? 'El Administrador puede asignarte como Responsable Técnico al dar de alta nuevos planos o partidas en la obra.'
                : 'No hay artefactos en esta categoría. Puedes cambiar de pestaña o registrar uno nuevo.'}
            </p>
            <button
              onClick={() => {
                setFiltroAsignacion('TODOS');
                setTabEstado('TODOS');
                setSearch('');
                setTipoFiltro('');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition mr-2"
            >
              Ver Todos los Entregables
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-4 px-5 py-2 rounded-xl bg-upt-navy-700 hover:bg-upt-navy-800 text-upt-gold font-black text-xs shadow-md transition"
            >
              + Registrar Nuevo Entregable
            </button>
          </div>
        ) : (
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

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-3xl border shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group ${
                    isMyEcs
                      ? 'border-slate-300 border-l-4 border-l-sky-600'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                    <div>
                      {/* Header de la Tarjeta */}
                      <div className="p-4 sm:p-5 pb-3 border-b border-slate-100 bg-slate-50/50 flex items-start justify-between gap-2.5">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                            <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 flex items-center gap-1">
                              <Layers className="w-3.5 h-3.5 text-slate-500" />
                              {item.codigo}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                              {item.proyecto.codigo}
                            </span>
                            {isMyEcs && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 flex items-center gap-1 shadow-xs">
                                <UserCheck className="w-3 h-3 text-sky-600" /> A tu cargo
                              </span>
                            )}
                          </div>
                          <h3 className="font-black text-slate-900 text-sm sm:text-base group-hover:text-sky-700 transition leading-snug">
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
                        <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
                          {item.descripcion || 'Sin descripción descriptiva registrada.'}
                        </p>

                        <div className="text-[11px] text-slate-600 font-mono bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200 truncate flex items-center gap-1.5">
                          <FolderGit2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{item.ubicacion}</span>
                        </div>

                        {/* Estado de la última versión */}
                        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-700">Última Versión:</span>
                            {ultimaVersion ? (
                              <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-xs">
                                v{ultimaVersion.numero_version}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Sin versiones</span>
                            )}
                          </div>
                          {ultimaVersion && renderBadgeEstado(ultimaVersion.estado)}
                        </div>

                        {/* Responsable */}
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium pt-1">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">
                            Responsable: <strong className="text-slate-800 font-semibold">{item.responsable.nombre_completo}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer con Enlace a la Ficha y Versiones */}
                    <div className="p-4 pt-0">
                      <Link
                        href={`/ecs/${item.id}`}
                        className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition flex items-center justify-between group/btn shadow-xs active:scale-98 ${
                          isMyEcs && !ultimaVersion
                            ? 'bg-sky-600 hover:bg-sky-700 text-white'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          {isMyEcs && !ultimaVersion ? (
                            <>
                              <Upload className="w-3.5 h-3.5 text-sky-200" />
                              <span>Registrar Versión v1.0.0</span>
                            </>
                          ) : isMyEcs ? (
                            <>
                              <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                              <span>Abrir Mi Entregable y Versiones</span>
                            </>
                          ) : (
                            <span>Ver Ficha, Versiones y Dictamen</span>
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

      {/* Modal Nuevo ECS (RF-04) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border-2 border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-upt-navy-50 text-upt-navy-700 flex items-center justify-center border border-upt-navy-200">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Registrar Nuevo {terminologia.ecsLabel}
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">Paso 2 • Alta técnica bajo control de versiones</span>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateEcs} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Proyecto */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    {terminologia.proyectoLabel} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={proyectoId}
                    onChange={(e) => setProyectoId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-upt-navy-700 transition"
                  >
                    {auxData.proyectos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.codigo} - {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Código */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Código Identificador <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                    placeholder={`Ej. ${terminologia.ecsEjemploCodigo}`}
                    className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-mono font-black uppercase text-slate-900 focus:bg-white focus:border-upt-navy-700 transition"
                  />
                </div>

                {/* Nombre */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Nombre ({terminologia.ecsLabel}) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder={terminologia.ecsEjemploNombre}
                    className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-upt-navy-700 transition"
                  />
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Tipo de {terminologia.ecsLabel} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-upt-navy-700 transition"
                  >
                    {terminologia.ecsTipos.map((t) => (
                      <option key={t.valor} value={t.valor}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Responsable */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Especialista Responsable <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={responsableId}
                    onChange={(e) => setResponsableId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-upt-navy-700 transition"
                  >
                    {auxData.usuarios.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nombre_completo}{u.cargo ? ` (${u.cargo})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ubicación */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    {terminologia.ecsUbicacionLabel} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={ubicacion}
                    onChange={(e) => setUbicacion(e.target.value)}
                    placeholder={terminologia.ecsUbicacionPlaceholder}
                    className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:bg-white focus:border-upt-navy-700 transition"
                  />
                </div>

                {/* Descripción */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Descripción Técnica
                  </label>
                  <textarea
                    rows={2}
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder={terminologia.ecsDescripcionPlaceholder}
                    className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-upt-navy-700 transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-100 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-upt-navy-700 hover:bg-upt-navy-800 text-upt-gold font-black text-xs shadow-md transition flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-upt-gold" />
                      <span>Registrando...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Registrar {terminologia.ecsLabel}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
