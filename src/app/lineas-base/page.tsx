'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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

  const loadData = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/lineas-base', window.location.origin);
      if (search) url.searchParams.set('search', search);
      if (estadoFiltro) url.searchParams.set('estado', estadoFiltro);
      if (proyectoFiltro) url.searchParams.set('proyectoId', proyectoFiltro);

      const [resLineas, resAux] = await Promise.all([
        fetch(url.toString()),
        fetch('/api/auxiliares'),
      ]);

      const dataLineas = await resLineas.json();
      const dataAux = await resAux.json();

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

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      {/* Top Navbar Unificada */}
      <header className="bg-upt-navy-900 text-white border-b-2 border-upt-gold shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 rounded-xl bg-upt-navy-800 hover:bg-upt-navy-700 text-upt-gold transition border border-upt-gold/30"
              title="Volver al Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base text-white tracking-tight">
                  Líneas Base (Baselines)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-upt-gold text-upt-navy-950 font-black uppercase">
                  RF-09 & RF-10
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Congelamiento atómico e inmutable de especificaciones técnicas aprobadas
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/ecs"
              className="hidden sm:inline-flex px-3.5 py-1.5 text-xs font-semibold rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition items-center gap-1.5"
            >
              <Layers className="w-4 h-4 text-upt-gold" /> Catálogo ECS
            </Link>
            <Link
              href="/lineas-base/nueva"
              className="px-4 py-2 rounded-xl bg-upt-gold hover:bg-upt-gold-600 text-upt-navy-950 font-black text-xs sm:text-sm shadow-md transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Establecer Línea Base
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        
        {/* Banner Explicativo: ¿Por qué la Línea Base erradica el teléfono descompuesto? */}
        <div className="bg-gradient-to-r from-upt-navy-900 via-upt-navy-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-upt-navy-700 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-upt-gold/15 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-upt-gold/20 text-upt-gold border border-upt-gold/40 text-xs font-bold uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5" />
                <span>Etapa 3: Inmutabilidad Transaccional (RNF-08)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                ¿Qué hace una Línea Base en este Sistema?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Toma una <strong className="text-white font-bold">«fotografía congelada»</strong> de todos los artefactos aprobados por el especialista técnico. 
                Una vez establecida, nadie en ventas ni en gerencia puede alterar el alcance sin abrir formalmente una 
                <strong className="text-upt-gold"> Solicitud de Cambio (RFC)</strong>.
              </p>
            </div>

            <div className="flex sm:flex-col gap-2 shrink-0">
              <div className="bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/10 text-center">
                <span className="text-[10px] text-slate-300 uppercase font-black block">Líneas Vigentes</span>
                <span className="text-2xl font-black text-emerald-400">{totalVigentes}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/10 text-center">
                <span className="text-[10px] text-slate-300 uppercase font-black block">Históricas / Obsoletas</span>
                <span className="text-2xl font-black text-slate-300">{totalObsoletas}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Consola de Búsqueda y Filtros de Alto Contraste */}
        <div className="bg-white p-5 rounded-3xl border-2 border-slate-300 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Search className="w-4 h-4 text-upt-gold-600" />
              <span>Buscador y Filtros de Líneas Base</span>
            </span>
            <span className="text-xs font-bold text-slate-500">
              {lineasBase.length} líneas base registradas
            </span>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            {/* Input de Búsqueda */}
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-3 text-upt-gold-600" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por código (ej. LB-PRJ-01) o título de la línea base..."
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:border-upt-navy-700 focus:ring-4 focus:ring-upt-gold/20 transition"
              />
            </div>

            {/* Filtro Proyecto */}
            <div className="sm:w-56">
              <select
                value={proyectoFiltro}
                onChange={(e) => setProyectoFiltro(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:border-upt-navy-700 focus:ring-4 focus:ring-upt-gold/20 transition cursor-pointer"
              >
                <option value="">Todos los Proyectos</option>
                {proyectos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.codigo} - {p.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro Estado */}
            <div className="sm:w-44">
              <select
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:border-upt-navy-700 focus:ring-4 focus:ring-upt-gold/20 transition cursor-pointer"
              >
                <option value="">Todos los Estados</option>
                <option value="VIGENTE">Vigente (Activa)</option>
                <option value="OBSOLETA">Obsoleta (Histórica)</option>
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
        </div>

        {/* Grilla de Líneas Base */}
        {loading ? (
          <div className="p-16 text-center bg-white rounded-3xl border-2 border-slate-200 shadow-sm">
            <Loader2 className="w-10 h-10 animate-spin text-upt-navy-700 mx-auto mb-3" />
            <p className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Consultando registro de Líneas Base...
            </p>
          </div>
        ) : lineasBase.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-300 p-12 text-center shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-upt-gold-600 flex items-center justify-center mx-auto mb-3 border border-upt-gold/30">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="font-black text-slate-900 text-base">
              No se encontraron Líneas Base
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto leading-relaxed">
              Aún no se ha establecido ninguna línea base. Para crear una, los artefactos del proyecto deben tener al menos una versión aprobada.
            </p>
            <Link
              href="/lineas-base/nueva"
              className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-upt-navy-700 hover:bg-upt-navy-800 text-upt-gold font-black text-xs shadow-md transition"
            >
              <Plus className="w-4 h-4" /> Establecer la Primera Línea Base
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lineasBase.map((lb) => (
              <div
                key={lb.id}
                className="bg-white rounded-3xl border-2 border-slate-200 shadow-md hover:border-upt-gold hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Header de la Tarjeta */}
                  <div className="p-5 pb-3 border-b border-slate-100 flex items-start justify-between gap-3 bg-gradient-to-br from-slate-50 to-white">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                        <span className="font-mono text-xs font-black text-upt-navy-900 bg-upt-navy-50 px-2.5 py-1 rounded-xl border border-upt-navy-200 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-upt-gold-600" />
                          {lb.codigo}
                        </span>
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                          {lb.proyecto.codigo}
                        </span>
                      </div>
                      <h3 className="font-black text-slate-900 text-sm group-hover:text-upt-gold-700 transition leading-snug">
                        {lb.nombre}
                      </h3>
                    </div>

                    {lb.estado === 'VIGENTE' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Vigente
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 border border-slate-300 shrink-0">
                        <Archive className="w-3.5 h-3.5 text-slate-500" /> Obsoleta
                      </span>
                    )}
                  </div>

                  {/* Cuerpo */}
                  <div className="p-5 py-4 space-y-3">
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {lb.descripcion || 'Sin justificación técnica o notas descriptivas registradas.'}
                    </p>

                    {/* Resumen de Contenido Congelado */}
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-700 font-bold">
                        <FileCheck2 className="w-4 h-4 text-upt-gold-600" />
                        <span>Artefactos Congelados:</span>
                      </div>
                      <span className="font-black text-upt-navy-900 bg-white px-2.5 py-0.5 rounded-lg border border-slate-300 shadow-sm">
                        {lb._count.versiones} {lb._count.versiones === 1 ? 'ECS' : 'ECSs'}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5 pt-1 text-[11px] text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          Establecida por: <strong className="text-slate-800 font-bold">{lb.autor.nombre_completo}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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

                {/* Footer con Enlace al Acta Inmutable */}
                <div className="p-4 pt-0">
                  <Link
                    href={`/lineas-base/${lb.id}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-upt-navy-50 hover:bg-upt-navy-700 text-upt-navy-900 hover:text-upt-gold font-black text-xs transition flex items-center justify-center gap-1.5 group/btn border border-upt-navy-200"
                  >
                    <span>Inspeccionar Acta Oficial Inmutable</span>
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
