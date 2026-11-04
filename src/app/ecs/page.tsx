'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
  usuarios: { id: string; nombre_completo: string; email: string }[];
}

export default function EcsPage() {
  const [ecsList, setEcsList] = useState<EcsItem[]>([]);
  const [auxData, setAuxData] = useState<AuxData>({ proyectos: [], usuarios: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
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

      const [resEcs, resAux] = await Promise.all([
        fetch(url.toString()),
        fetch('/api/auxiliares'),
      ]);

      const dataEcs = await resEcs.json();
      const dataAux = await resAux.json();

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
                  Entregables de Configuración (ECS)
                </span>
                <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-upt-gold text-upt-navy-950 font-black uppercase tracking-wider shrink-0 shadow-sm">
                  Paso 2: Inventario Técnico
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-300 truncate">
                Control de versiones y especificaciones técnicas aprobadas por el Tech Lead
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-1 sm:pt-0 border-t border-white/10 sm:border-t-0">
            <Link
              href="/aprobaciones"
              className="px-2.5 py-1.5 text-xs font-bold rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-upt-gold" /> Dictaminar
            </Link>
            <Link
              href="/lineas-base"
              className="px-2.5 py-1.5 text-xs font-bold rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-upt-gold" /> Hitos Congelados
            </Link>
            <button
              onClick={() => setModalOpen(true)}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-upt-gold to-amber-500 hover:from-amber-400 hover:to-upt-gold text-upt-navy-950 font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition flex items-center gap-1.5 shrink-0 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Nuevo Entregable</span>
              <span className="sm:hidden font-bold">Nuevo</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        
        {/* Banner de Contexto: ¿Qué es un ECS? */}
        <div className="bg-gradient-to-r from-upt-navy-900 to-slate-800 rounded-3xl p-6 text-white border border-upt-navy-700 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-upt-gold text-xs font-bold uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Paso 2 del Proceso Oficial</span>
            </div>
            <h2 className="text-xl font-black text-white">
              ¿Qué es un Entregable o Componente (ECS)?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Es cualquier pieza clave del proyecto (un módulo de código, una base de datos o un documento de requisitos).
              Cada versión propuesta debe ser revisada y <strong className="text-emerald-400">APROBADA</strong> por el especialista antes de poder incluirse en un Hito Congelado (Línea Base).
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-center shrink-0">
            <span className="text-[10px] text-slate-300 uppercase font-black block">Entregables Activos</span>
            <span className="text-2xl font-black text-upt-gold">{ecsList.length}</span>
          </div>
        </div>

        {/* Consola de Búsqueda y Filtros de Alto Contraste */}
        <div className="bg-white p-5 rounded-3xl border-2 border-slate-300 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Search className="w-4 h-4 text-upt-gold-600" />
              <span>Buscador y Filtros de Artefactos</span>
            </span>
            <span className="text-xs font-bold text-slate-500">
              Mostrando {ecsList.length} elementos encontrados
            </span>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            {/* Input de Búsqueda con Alto Contraste */}
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-3 text-upt-gold-600" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Escribe el código (ej. ECS-MOD-PAGOS) o nombre del artefacto..."
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:border-upt-navy-700 focus:ring-4 focus:ring-upt-gold/20 transition"
              />
            </div>

            {/* Selector de Tipo */}
            <div className="sm:w-60">
              <select
                value={tipoFiltro}
                onChange={(e) => setTipoFiltro(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:border-upt-navy-700 focus:ring-4 focus:ring-upt-gold/20 transition cursor-pointer"
              >
                <option value="">Todos los Tipos de ECS</option>
                <option value="DOCUMENTO">Documentos / Requisitos</option>
                <option value="CODIGO_FUENTE">Código Fuente / Módulos</option>
                <option value="DISENO">Diseño / UI / Planos</option>
                <option value="BASE_DATOS">Base de Datos / Tablas</option>
                <option value="CASO_PRUEBA">Casos de Prueba</option>
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

          {/* Filtros Rápidos por Estado de Aprobación */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-200">
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
              No se encontraron entregables con este filtro
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto leading-relaxed">
              No hay artefactos en esta categoría. Puedes cambiar de pestaña o registrar uno nuevo.
            </p>
            <button
              onClick={() => {
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

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border-2 border-slate-300 border-l-[6px] border-l-upt-navy-700 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.12)] hover:shadow-2xl hover:border-upt-gold/80 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                >
                    <div>
                      {/* Header de la Tarjeta */}
                      <div className="p-4 sm:p-5 pb-3 border-b border-slate-200/80 bg-gradient-to-br from-slate-50 to-white flex items-start justify-between gap-2.5">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                            <span className="font-mono text-xs font-black text-upt-navy-950 bg-upt-gold/25 px-2.5 py-0.5 rounded-lg border border-upt-gold/50 flex items-center gap-1">
                              <Layers className="w-3.5 h-3.5 text-upt-navy-900" />
                              {item.codigo}
                            </span>
                            <span className="text-[10px] font-black text-slate-700 bg-slate-200 px-2 py-0.5 rounded-md">
                              {item.proyecto.codigo}
                            </span>
                          </div>
                          <h3 className="font-black text-slate-950 text-sm sm:text-base group-hover:text-upt-navy-800 transition leading-snug">
                            {item.nombre}
                          </h3>
                        </div>

                        {/* Pill de Tipo */}
                        <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-xl border uppercase shrink-0 shadow-sm ${tipoInfo.color}`}>
                          <TipoIcon className="w-3 h-3" />
                          <span>{tipoInfo.label}</span>
                        </span>
                      </div>

                      {/* Contenido de la Tarjeta */}
                      <div className="p-4 sm:p-5 py-4 space-y-3.5">
                        <p className="text-xs text-slate-800 line-clamp-2 leading-relaxed">
                          {item.descripcion || 'Sin descripción descriptiva registrada.'}
                        </p>

                        <div className="text-[11px] text-slate-600 font-mono bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200 truncate">
                          📍 {item.ubicacion}
                        </div>

                        {/* Estado de la última versión */}
                        <div className="bg-slate-100/90 rounded-2xl p-3 border border-slate-300 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800">Última Versión:</span>
                            {ultimaVersion ? (
                              <span className="font-mono font-black text-upt-navy-950 bg-white px-2 py-0.5 rounded-md border border-slate-300 shadow-sm">
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
                            Responsable: <strong className="text-slate-900 font-bold">{item.responsable.nombre_completo}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer con Enlace a la Ficha y Versiones */}
                    <div className="p-4 pt-0">
                      <Link
                        href={`/ecs/${item.id}`}
                        className="w-full py-2.5 px-4 rounded-xl bg-upt-navy-900 hover:bg-upt-navy-800 text-white hover:text-upt-gold font-black text-xs transition flex items-center justify-between group/btn shadow-md active:scale-98"
                      >
                        <span>Ver Ficha, Versiones y Dictamen</span>
                        <ChevronRight className="w-4 h-4 text-upt-gold group-hover/btn:translate-x-1.5 transition-transform" />
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
                    Registrar Nuevo Entregable (ECS)
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">Paso 2 • Alta de artefacto bajo control de versiones</span>
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
                    Proyecto / Caso <span className="text-red-500">*</span>
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
                    placeholder="Ej. ECS-MOD-AUTH"
                    className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-mono font-black uppercase text-slate-900 focus:bg-white focus:border-upt-navy-700 transition"
                  />
                </div>

                {/* Nombre */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Nombre del Artefacto <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Módulo de Autenticación JWT y Roles RBAC"
                    className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-upt-navy-700 transition"
                  />
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Tipo de Artefacto <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-upt-navy-700 transition"
                  >
                    <option value="DOCUMENTO">Documento / Requisito</option>
                    <option value="CODIGO_FUENTE">Código Fuente</option>
                    <option value="DISENO">Diseño / Plano Arquitectónico</option>
                    <option value="BASE_DATOS">Base de Datos / Esquema</option>
                    <option value="CASO_PRUEBA">Caso de Prueba</option>
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
                        {u.nombre_completo}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ubicación */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Ubicación Física o Enlace de Repositorio <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={ubicacion}
                    onChange={(e) => setUbicacion(e.target.value)}
                    placeholder="Ej. git://github.com/org/repo o Carpeta Servidor /docs/planos"
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
                    placeholder="Especificaciones o alcance de este artefacto..."
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
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Registrando...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Registrar Artefacto (ECS)</span>
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
