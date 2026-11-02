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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-upt-navy-700 text-white border-b-2 border-upt-gold shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 rounded-xl bg-upt-navy-600 hover:bg-upt-navy-500 text-upt-gold transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight">Líneas Base (Baselines)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-upt-gold/20 text-upt-gold font-bold border border-upt-gold/40">
                  RF-09 & RF-10
                </span>
              </div>
              <span className="text-[11px] text-slate-300">Congelamiento formal e inmutable de versiones aprobadas</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/ecs"
              className="hidden sm:inline-flex px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-300 hover:text-white hover:bg-upt-navy-600 transition items-center gap-1.5"
            >
              <Layers className="w-4 h-4" /> Catálogo ECS
            </Link>
            <Link
              href="/lineas-base/nueva"
              className="px-4 py-2 rounded-xl bg-upt-gold hover:bg-upt-gold-600 text-upt-navy-900 font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Establecer Línea Base
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Banner de Concepto Anti-Teléfono Descompuesto */}
        <div className="bg-gradient-to-r from-upt-navy-700 to-upt-navy-900 rounded-3xl p-6 text-white mb-8 border border-upt-navy-500/30 shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-upt-gold/10 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-upt-gold text-xs font-bold uppercase tracking-wider mb-1">
                <Lock className="w-4 h-4" /> Principio de Inmutabilidad Técnica
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Líneas Base Formales del Sistema
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mt-1 leading-relaxed">
                Una Línea Base congela de forma atómica y permanente un conjunto de especificaciones técnicas que cuentan con dictamen técnico formal 
                (<span className="text-emerald-400 font-semibold">APROBADA</span>). Ninguna promesa o cambio posterior puede alterar esta base sin un proceso formal de RFC.
              </p>
            </div>
            <div className="flex sm:flex-col gap-2 shrink-0">
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/10 text-center">
                <span className="text-[10px] text-slate-300 uppercase font-semibold">Líneas Vigentes</span>
                <p className="text-xl font-black text-upt-gold">{totalVigentes}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/10 text-center">
                <span className="text-[10px] text-slate-300 uppercase font-semibold">Históricas</span>
                <p className="text-xl font-black text-slate-300">{totalObsoletas}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por código (ej. LB-PRJ01-v1.0) o nombre de la línea base..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-upt-navy-500 transition"
            />
          </form>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:w-auto">
            {/* Filtro Proyecto */}
            <div className="flex items-center gap-2 flex-1 sm:flex-initial">
              <FolderGit2 className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={proyectoFiltro}
                onChange={(e) => setProyectoFiltro(e.target.value)}
                className="w-full sm:w-48 px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-upt-navy-500 transition"
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
            <div className="flex items-center gap-2 flex-1 sm:flex-initial">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value)}
                className="w-full sm:w-36 px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-upt-navy-500 transition"
              >
                <option value="">Todos los Estados</option>
                <option value="VIGENTE">Vigente</option>
                <option value="OBSOLETA">Obsoleta</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Líneas Base */}
        {loading ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
            <div className="w-8 h-8 border-4 border-upt-navy-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-semibold">Cargando catálogo de Líneas Base...</p>
          </div>
        ) : lineasBase.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300">
            <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 text-base">No se encontraron Líneas Base</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
              Aún no se ha establecido ninguna línea base para el criterio de búsqueda o proyecto seleccionado.
            </p>
            <Link
              href="/lineas-base/nueva"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-upt-navy-700 hover:bg-upt-navy-600 text-upt-gold font-bold text-xs shadow-md transition"
            >
              <Plus className="w-4 h-4" /> Establecer la primera Línea Base
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lineasBase.map((lb) => (
              <div
                key={lb.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-upt-gold/50 transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Encabezado de la Card */}
                  <div className="p-5 pb-3 border-b border-slate-100 flex items-start justify-between gap-3 bg-gradient-to-br from-slate-50/50 to-white">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="font-mono text-xs font-black text-upt-navy-700 bg-upt-navy-50 px-2.5 py-1 rounded-xl border border-upt-navy-200 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-upt-gold" />
                          {lb.codigo}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                          {lb.proyecto.codigo}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-upt-navy-700 transition leading-snug">
                        {lb.nombre}
                      </h3>
                    </div>

                    {lb.estado === 'VIGENTE' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Vigente
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200 shrink-0">
                        <Archive className="w-3 h-3 text-slate-400" /> Obsoleta
                      </span>
                    )}
                  </div>

                  {/* Cuerpo */}
                  <div className="p-5 py-4 space-y-3">
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {lb.descripcion || 'Sin descripción o justificación técnica registrada.'}
                    </p>

                    {/* Resumen de Contenido Congelado */}
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-600">
                        <FileCheck2 className="w-4 h-4 text-upt-gold" />
                        <span className="font-medium">Versiones Congeladas:</span>
                      </div>
                      <span className="font-bold text-upt-navy-700 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                        {lb._count.versiones} {lb._count.versiones === 1 ? 'ECS' : 'ECSs'}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5 pt-1 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          Establecida por <strong className="text-slate-700 font-semibold">{lb.autor.nombre_completo}</strong>
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

                {/* Footer de la Card con enlace al detalle inmutable */}
                <div className="p-4 pt-0">
                  <Link
                    href={`/lineas-base/${lb.id}`}
                    className="w-full py-2.5 px-4 rounded-2xl bg-upt-navy-50 hover:bg-upt-navy-700 text-upt-navy-700 hover:text-upt-gold font-bold text-xs transition flex items-center justify-center gap-1.5 group/btn"
                  >
                    <span>Inspeccionar Acta Inmutable</span>
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
