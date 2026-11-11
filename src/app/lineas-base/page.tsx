'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTerminologia } from '@/lib/terminologia';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Bookmark,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ChevronRight,
  User,
  FolderGit2,
  Layers,
  Lock,
  Archive,
  Calendar,
  AlertCircle,
  FileCheck2,
  Loader2,
  Sparkles,
} from 'lucide-react';
import NavbarPrincipal from '@/components/NavbarPrincipal';

interface LineaBaseItem {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  estado: 'VIGENTE' | 'OBSOLETA';
  created_at: string;
  proyecto: {
    id: string;
    codigo: string;
    nombre: string;
  };
  autor: {
    id: string;
    nombre_completo: string;
    email: string;
    rol: string;
  };
  _count: {
    versiones: number;
  };
}

interface ProyectoAux {
  id: string;
  codigo: string;
  nombre: string;
}

export default function LineasBasePage() {
  const [lineasBase, setLineasBase] = useState<LineaBaseItem[]>([]);
  const [proyectos, setProyectos] = useState<ProyectoAux[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [proyectoFiltro, setProyectoFiltro] = useState('');
  const [rubro, setRubro] = useState<string>('CONSTRUCCION');

  const loadData = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/lineas-base', window.location.origin);
      if (search) url.searchParams.set('search', search);
      if (estadoFiltro) url.searchParams.set('estado', estadoFiltro);
      if (proyectoFiltro) url.searchParams.set('proyectoId', proyectoFiltro);

      const [resLineas, resAux, resMe] = await Promise.all([
        fetch(url.toString()),
        fetch('/api/auxiliares'),
        fetch('/api/auth/me'),
      ]);

      const dataLineas = await resLineas.json();
      const dataAux = await resAux.json();
      const dataMe = await resMe.json();

      if (dataMe?.success && dataMe?.user?.rubro) {
        setRubro(dataMe.user.rubro);
      }

      if (dataLineas.success) setLineasBase(dataLineas.data);
      if (dataAux.success) setProyectos(dataAux.data.proyectos);
    } catch (err) {
      console.error('Error al cargar líneas base:', err);
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

  const totalVigentes = lineasBase.filter((lb) => lb.estado === 'VIGENTE').length;
  const totalObsoletas = lineasBase.filter((lb) => lb.estado === 'OBSOLETA').length;
  const terminologia = getTerminologia(rubro);

  return (
    <div className="min-h-screen bg-[#13151A] text-slate-100 flex flex-col antialiased selection:bg-upt-gold selection:text-slate-950">
      {/* Navbar Global Unificado */}
      <NavbarPrincipal />

      {/* Sub-Header Mobile-First */}
      <div className="bg-[#16181D] border-b border-white/10">
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
                  {terminologia.lineaBaseLabel}
                </span>
                <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-upt-gold/20 text-upt-gold border border-upt-gold/30 font-bold uppercase tracking-wider shrink-0">
                  Paso 4: Congelamiento de Alcance
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                {terminologia.lineaBaseSubtitulo}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-1 sm:pt-0 border-t border-white/10 sm:border-t-0">
            <Link
              href="/ecs"
              className="px-2.5 py-1.5 text-xs font-bold rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition flex items-center gap-1.5 border border-white/10"
            >
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span>Entregables</span>
            </Link>
            <Link
              href="/lineas-base/nueva"
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-upt-gold to-amber-400 hover:brightness-110 text-slate-950 font-bold text-xs sm:text-sm shadow-xs transition flex items-center gap-1.5 shrink-0 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3] text-slate-950" />
              <span className="hidden sm:inline">Congelar Nuevo Hito</span>
              <span className="sm:hidden font-bold">Nuevo Hito</span>
            </Link>
          </div>

        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6">
        
        {/* Banner Explicativo */}
        <div
          className="bg-[#1A1D25] rounded-3xl p-5 sm:p-7 text-white shadow-xl border border-white/10 relative overflow-hidden"
        >
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-upt-gold/20 text-upt-gold border border-upt-gold/40 text-[11px] font-black uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5" />
                <span>Paso 4 del Proceso Oficial</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                {terminologia.lineaBaseLabel}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {terminologia.lineaBaseExplicacion}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 shrink-0">
              <div className="bg-[#14161E] p-3.5 rounded-2xl border border-white/10 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-black block">Líneas Vigentes</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-400">{totalVigentes}</span>
              </div>
              <div className="bg-[#14161E] p-3.5 rounded-2xl border border-white/10 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-black block">Históricas</span>
                <span className="text-xl sm:text-2xl font-black text-slate-400">{totalObsoletas}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Consola de Búsqueda y Filtros de Alto Contraste */}
        <div
          className="bg-[#1A1D25] p-4 sm:p-5 rounded-3xl border border-white/10 shadow-md space-y-3 sm:space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Search className="w-4 h-4 text-slate-400" />
              <span>Buscador y Filtros de Líneas Base</span>
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-slate-300 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
              {lineasBase.length} registradas
            </span>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por código (ej. LB-PRJ-01) o título de la línea base..."
                className="w-full pl-11 pr-4 py-2.5 bg-[#14161E] border border-white/10 rounded-2xl text-xs sm:text-sm font-semibold text-white placeholder:text-slate-500 focus:border-sky-400 transition"
              />
            </div>

            <div className="sm:w-56">
              <select
                value={proyectoFiltro}
                onChange={(e) => setProyectoFiltro(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#14161E] border border-white/10 rounded-2xl text-xs sm:text-sm font-bold text-white focus:border-sky-400 transition cursor-pointer"
              >
                <option value="">Todos los Proyectos</option>
                {proyectos.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#1A1D25] text-white">
                    {p.codigo} - {p.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:w-44">
              <select
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#14161E] border border-white/10 rounded-2xl text-xs sm:text-sm font-bold text-white focus:border-sky-400 transition cursor-pointer"
              >
                <option value="">Todos los Estados</option>
                <option value="VIGENTE">Vigente (Activa)</option>
                <option value="OBSOLETA">Obsoleta (Histórica)</option>
              </select>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-black text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-1.5 shrink-0 border border-white/10 active:scale-95"
            >
              <Search className="w-4 h-4" />
              <span>Buscar</span>
            </button>
          </form>
        </div>

        {/* Grilla de Líneas Base con Borde y Sombras de Alta Visibilidad */}
        {loading ? (
          <div className="p-16 text-center bg-[#1A1D25] rounded-3xl border border-white/10 shadow-md">
            <Loader2 className="w-10 h-10 animate-spin text-upt-gold mx-auto mb-3" />
            <p className="text-xs font-black text-slate-300 uppercase tracking-wider">
              Consultando registro de Líneas Base...
            </p>
          </div>
        ) : lineasBase.length === 0 ? (
          <div className="bg-[#1A1D25] rounded-3xl border-2 border-dashed border-white/10 p-10 sm:p-12 text-center shadow-md">
            <div className="w-14 h-14 rounded-2xl bg-white/5 text-upt-gold flex items-center justify-center mx-auto mb-3 border border-white/10">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="font-black text-white text-base">
              No se encontraron Líneas Base
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
              Aún no se ha establecido ninguna línea base. Para crear una, los artefactos del proyecto deben tener al menos una versión aprobada.
            </p>
            <Link
              href="/lineas-base/nueva"
              className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-upt-gold to-amber-400 text-slate-950 font-black text-xs shadow-md transition hover:brightness-110"
            >
              <Plus className="w-4 h-4 text-slate-950" /> Establecer la Primera Línea Base
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {lineasBase.map((lb) => {
              const esVigente = lb.estado === 'VIGENTE';

              return (
                <div
                  key={lb.id}
                  className={`bg-[#1A1D25] rounded-3xl border border-white/10 border-l-4 ${
                    esVigente ? 'border-l-emerald-500' : 'border-l-slate-500'
                  } shadow-md hover:border-white/20 transition-all duration-200 flex flex-col justify-between overflow-hidden group`}
                >
                    <div>
                      {/* Header de la Tarjeta */}
                      <div className="p-4 sm:p-5 pb-3 border-b border-white/10 bg-[#14161E] flex items-start justify-between gap-2.5">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                            <span className="font-mono text-xs font-black text-upt-gold bg-white/10 px-2.5 py-0.5 rounded-lg border border-white/10 flex items-center gap-1">
                              <Lock className="w-3.5 h-3.5 text-upt-gold" />
                              {lb.codigo}
                            </span>
                            <span className="text-[10px] font-black text-slate-300 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                              {lb.proyecto.codigo}
                            </span>
                          </div>
                          
                          <h3 className="font-black text-white text-sm sm:text-base group-hover:text-sky-300 transition leading-snug">
                            {lb.nombre}
                          </h3>
                        </div>

                        {/* Badge de Estado */}
                        <div className="shrink-0">
                          {esVigente ? (
                            <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] px-2.5 py-1 rounded-xl uppercase tracking-wider bg-emerald-600 text-white font-black border border-emerald-500 shadow-sm">
                              <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                              <span>Vigente</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] px-2.5 py-1 rounded-xl uppercase tracking-wider bg-slate-200 text-slate-700 font-black border border-slate-300">
                              <Archive className="w-3 h-3" />
                              <span>Obsoleta</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Cuerpo de la Tarjeta */}
                      <div className="p-4 sm:p-5 py-4 space-y-3.5">
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {lb.descripcion || 'Sin justificación técnica o notas descriptivas registradas.'}
                        </p>

                        <div className="bg-[#14161E] rounded-2xl p-3 border border-white/10 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 text-slate-300 font-bold">
                            <FileCheck2 className="w-4 h-4 text-sky-400" />
                            <span>Artefactos Congelados:</span>
                          </div>
                          <span className="font-black text-white bg-white/10 px-2.5 py-0.5 rounded-md border border-white/10 shadow-xs">
                            {lb._count.versiones} {lb._count.versiones === 1 ? 'ECS' : 'ECSs'}
                          </span>
                        </div>

                        <div className="flex flex-col gap-1 pt-1 text-[11px] text-slate-400 font-medium">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="truncate">
                              Establecida por: <strong className="text-slate-200 font-bold">{lb.autor.nombre_completo}</strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>
                              {new Date(lb.created_at).toLocaleDateString('es-PE', {
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

                    {/* Botón de Acción */}
                    <div className="p-4 pt-0">
                      <Link
                        href={`/lineas-base/${lb.id}`}
                        className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white hover:text-amber-300 font-bold text-xs transition flex items-center justify-between group/btn shadow-xs active:scale-98 border border-white/10"
                      >
                        <span>Inspeccionar Acta Oficial Inmutable</span>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover/btn:translate-x-1.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </main>
    </div>
  );
}
