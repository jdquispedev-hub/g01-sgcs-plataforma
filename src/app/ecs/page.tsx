'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
  Loader2
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
    setFormError(null);
    setSaving(true);

    try {
      const res = await fetch('/api/ecs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proyecto_id: proyectoId,
          codigo,
          nombre,
          tipo,
          descripcion,
          ubicacion,
          responsable_id: responsableId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.message || 'Error al registrar el ECS');
        setSaving(false);
        return;
      }

      // Éxito: cerrar modal y recargar lista
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
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Aprobada
          </span>
        );
      case 'RECHAZADA':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3 h-3" /> Rechazada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" /> Pendiente
          </span>
        );
    }
  };

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
                <span className="font-bold text-base tracking-tight">Elementos de Configuración (ECS)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-upt-gold/20 text-upt-gold font-bold border border-upt-gold/40">
                  RF-04 a RF-08
                </span>
              </div>
              <span className="text-[11px] text-slate-300">Catálogo oficial de artefactos, planos y versiones</span>
            </div>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-upt-gold hover:bg-upt-gold-600 text-upt-navy-900 font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Nuevo ECS
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Barra de Filtros y Búsqueda (RNF-04, RF-05) */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por código (ej. ECS-001) o nombre del artefacto..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-upt-navy-500 transition"
            />
          </form>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
              className="w-full md:w-auto px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-upt-navy-500 transition"
            >
              <option value="">Todos los tipos</option>
              <option value="DOCUMENTO">Documentos / Requisitos</option>
              <option value="CODIGO_FUENTE">Código Fuente / Endpoints</option>
              <option value="DISENO">Diseño / UI / Planos</option>
              <option value="BASE_DATOS">Base de Datos / Esquemas</option>
              <option value="CASO_PRUEBA">Casos de Prueba / Analítica</option>
            </select>
          </div>
        </div>

        {/* Tabla / Lista de ECS (RNF-06 Responsive) */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-upt-navy-600 mb-3" />
            <p className="text-sm font-semibold">Consultando catálogo de ECS...</p>
          </div>
        ) : ecsList.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-upt-navy-50 text-upt-navy-600 flex items-center justify-center mx-auto mb-3">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">No se encontraron Elementos de Configuración</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Comienza registrando el primer ECS (documento, módulo o plano) para iniciar el control de versiones formal.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-upt-navy-600 hover:bg-upt-navy-700 text-white font-bold text-xs shadow-md transition"
            >
              Registrar Primer ECS
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Código / Artefacto</th>
                    <th className="py-3.5 px-4">Tipo</th>
                    <th className="py-3.5 px-4">Proyecto / Caso</th>
                    <th className="py-3.5 px-4">Responsable</th>
                    <th className="py-3.5 px-4">Última Versión</th>
                    <th className="py-3.5 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ecsList.map((item) => {
                    const ultimaVersion = item.versiones[0];
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition group">
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-upt-navy-50 text-upt-navy-600 flex items-center justify-center shrink-0 border border-upt-navy-100">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-mono text-xs font-bold text-upt-navy-700 bg-upt-navy-50 px-2 py-0.5 rounded border border-upt-navy-100">
                                {item.codigo}
                              </span>
                              <p className="font-bold text-slate-900 mt-1 text-xs sm:text-sm">{item.nombre}</p>
                              {item.descripcion && (
                                <p className="text-[11px] text-slate-500 line-clamp-1">{item.descripcion}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            {item.tipo}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <p className="font-semibold text-slate-800 text-xs">{item.proyecto.nombre}</p>
                          <span className="font-mono text-[10px] text-slate-400">{item.proyecto.codigo}</span>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{item.responsable.nombre_completo}</span>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          {ultimaVersion ? (
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">
                                v{ultimaVersion.numero_version}
                              </span>
                              {renderBadgeEstado(ultimaVersion.estado)}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Sin versiones</span>
                          )}
                        </td>

                        <td className="py-4 px-4 text-right">
                          <Link
                            href={`/ecs/${item.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-upt-navy-600 hover:text-white text-slate-700 font-bold text-xs transition"
                          >
                            <span>Detalle & Versiones</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modal Nuevo ECS (RF-04, RNF-05) */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-lg font-black text-slate-900">Registrar Elemento de Configuración</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Alta de artefacto, documento o módulo con código único (RF-04)
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateEcs} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Proyecto / Caso Asociado <span className="text-upt-garnet-500">*</span>
                </label>
                <select
                  required
                  value={proyectoId}
                  onChange={(e) => setProyectoId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-upt-navy-500"
                >
                  {auxData.proyectos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.codigo} - {p.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Código Único <span className="text-upt-garnet-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                    placeholder="Ej. ECS-REQ-001"
                    className="w-full px-3 py-2 font-mono uppercase bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-upt-navy-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tipo de Elemento <span className="text-upt-garnet-500">*</span>
                  </label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-upt-navy-500"
                  >
                    <option value="DOCUMENTO">Documento / Especificación</option>
                    <option value="CODIGO_FUENTE">Código Fuente / Módulo</option>
                    <option value="DISENO">Diseño / Plano Arquitectónico</option>
                    <option value="BASE_DATOS">Base de Datos / Script</option>
                    <option value="CASO_PRUEBA">Casos de Prueba / Protocolo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre del Elemento <span className="text-upt-garnet-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Especificación de Requerimientos de Pagos"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-upt-navy-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ubicación Física o Repositorio <span className="text-upt-garnet-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  placeholder="Ej. https://github.com/... o /docs/planos/piso1.dwg"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-upt-navy-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Responsable Asignado <span className="text-upt-garnet-500">*</span>
                </label>
                <select
                  required
                  value={responsableId}
                  onChange={(e) => setResponsableId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-upt-navy-500"
                >
                  {auxData.usuarios.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre_completo} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descripción Detallada</label>
                <textarea
                  rows={2}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Alcance, objetivo e insumos de este elemento de configuración..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-upt-navy-500"
                ></textarea>
              </div>

              <div className="pt-3 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-upt-navy-600 hover:bg-upt-navy-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin text-upt-gold" /> : <Plus className="w-4 h-4" />}
                  <span>Registrar ECS</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
