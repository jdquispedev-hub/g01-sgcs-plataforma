'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getTerminologia } from '@/lib/terminologia';
import {
  ArrowLeft,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FolderGit2,
  FileCheck2,
  Calendar,
  User,
  ExternalLink,
  Loader2,
  Info,
} from 'lucide-react';
import NavbarPrincipal from '@/components/NavbarPrincipal';

interface VersionAprobada {
  id: string;
  numero_version: string;
  descripcion: string;
  archivo_url: string | null;
  estado: string;
  fecha_aprobacion: string | null;
  created_at: string;
  autor: { id: string; nombre_completo: string };
  aprobador: { id: string; nombre_completo: string } | null;
}

interface EcsConVersiones {
  id: string;
  codigo: string;
  nombre: string;
  tipo: string;
  ubicacion: string;
  responsable: { id: string; nombre_completo: string; email: string };
  versiones: VersionAprobada[];
}

interface Proyecto {
  id: string;
  codigo: string;
  nombre: string;
}

export default function NuevaLineaBasePage() {
  const router = useRouter();

  // Estados de datos
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [proyectoId, setProyectoId] = useState('');
  const [elementos, setElementos] = useState<EcsConVersiones[]>([]);
  const [loadingProyectos, setLoadingProyectos] = useState(true);
  const [loadingEcs, setLoadingEcs] = useState(false);
  const [rubro, setRubro] = useState<string>('CONSTRUCCION');

  // Estados del formulario
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [marcarAnterioresObsoletas, setMarcarAnterioresObsoletas] = useState(true);

  // Mapa de selección: ecsId -> versionId seleccionada
  const [versionesSeleccionadas, setVersionesSeleccionadas] = useState<Record<string, string>>({});

  // Estados de envío y validación
  const [submitting, setSubmitting] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cargar lista de proyectos
  useEffect(() => {
    async function fetchAux() {
      try {
        const [resAux, resMe] = await Promise.all([
          fetch('/api/auxiliares'),
          fetch('/api/auth/me'),
        ]);
        const data = await resAux.json();
        const dataMe = await resMe.json();

        if (dataMe?.success && dataMe?.data?.user?.rubro) {
          setRubro(dataMe.data.user.rubro);
        }

        if (data.success && data.data.proyectos.length > 0) {
          setProyectos(data.data.proyectos);
          setProyectoId(data.data.proyectos[0].id);
        }
      } catch (err) {
        console.error('Error al cargar proyectos:', err);
      } finally {
        setLoadingProyectos(false);
      }
    }
    fetchAux();
  }, []);

  // Cargar ECS con versiones aprobadas cuando cambia el proyecto
  useEffect(() => {
    if (!proyectoId) return;

    async function fetchEcsAprobados() {
      setLoadingEcs(true);
      setErrorMsg(null);
      try {
        const res = await fetch(`/api/proyectos/${proyectoId}/versiones-aprobadas`);
        const data = await res.json();

        if (data.success) {
          setElementos(data.data.elementos);

          // Preseleccionar por defecto la versión más reciente de cada ECS disponible
          const preseleccion: Record<string, string> = {};
          data.data.elementos.forEach((ecs: EcsConVersiones) => {
            if (ecs.versiones && ecs.versiones.length > 0) {
              preseleccion[ecs.id] = ecs.versiones[0].id; // la primera es la más reciente
            }
          });
          setVersionesSeleccionadas(preseleccion);

          // Generar sugerencia de código (ej. LB-PRY-001-01)
          const p = proyectos.find((proj) => proj.id === proyectoId);
          if (p) {
            const fechaHoy = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            setCodigo(`LB-${p.codigo}-${fechaHoy.slice(2, 6)}`);
          }
        } else {
          setErrorMsg(data.message || 'Error al obtener versiones aprobadas del proyecto');
        }
      } catch (err) {
        console.error('Error al cargar versiones aprobadas:', err);
        setErrorMsg('Error de red al consultar elementos con versiones aprobadas');
      } finally {
        setLoadingEcs(false);
      }
    }

    fetchEcsAprobados();
  }, [proyectoId, proyectos]);

  // Manejador para alternar la selección de un ECS
  const handleToggleEcs = (ecsId: string, defaultVersionId?: string) => {
    setVersionesSeleccionadas((prev) => {
      const nuevo = { ...prev };
      if (nuevo[ecsId]) {
        delete nuevo[ecsId];
      } else if (defaultVersionId) {
        nuevo[ecsId] = defaultVersionId;
      }
      return nuevo;
    });
  };

  // Manejador para cambiar la versión específica de un ECS seleccionado
  const handleSelectVersionForEcs = (ecsId: string, versionId: string) => {
    setVersionesSeleccionadas((prev) => ({
      ...prev,
      [ecsId]: versionId,
    }));
  };

  // Seleccionar todas las versiones aprobadas disponibles
  const handleSelectAll = () => {
    const nuevo: Record<string, string> = {};
    elementos.forEach((ecs) => {
      if (ecs.versiones && ecs.versiones.length > 0) {
        nuevo[ecs.id] = ecs.versiones[0].id;
      }
    });
    setVersionesSeleccionadas(nuevo);
  };

  // Desmarcar todas
  const handleDeselectAll = () => {
    setVersionesSeleccionadas({});
  };

  const totalSeleccionadas = Object.keys(versionesSeleccionadas).length;

  // Validación previa antes de abrir el modal de confirmación
  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!codigo.trim()) {
      setErrorMsg('El código de la línea base es obligatorio');
      return;
    }
    if (!nombre.trim()) {
      setErrorMsg('El nombre descriptivo de la línea base es obligatorio');
      return;
    }
    if (totalSeleccionadas === 0) {
      setErrorMsg('Debes seleccionar al menos una versión aprobada para congelar en la Línea Base (RF-10)');
      return;
    }

    setConfirmModalOpen(true);
  };

  // Envío real a la API con transacción ACID
  const handleConfirmSubmit = async () => {
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const version_ids = Object.values(versionesSeleccionadas);

      const res = await fetch('/api/lineas-base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo: codigo.trim().toUpperCase(),
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
          proyecto_id: proyectoId,
          version_ids,
          marcar_anteriores_obsoletas: marcarAnterioresObsoletas,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Error al establecer la línea base');
        setConfirmModalOpen(false);
        setSubmitting(false);
        return;
      }

      // Éxito: redireccionar a la vista de la línea base recién creada
      router.push(`/lineas-base/${data.data.id}`);
    } catch {
      setErrorMsg('Error de red al comunicarse con el servidor');
      setConfirmModalOpen(false);
      setSubmitting(false);
    }
  };

  const terminologia = getTerminologia(rubro);

  return (
    <div className="min-h-screen bg-[#13151A] text-slate-100 flex flex-col antialiased">
      {/* Navbar Global Unificado */}
      <NavbarPrincipal />

      {/* Sub-header contextual Nivel 3 */}
      <div className="bg-[#16181D] border-b border-white/10 sticky top-14 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/lineas-base"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-amber-400 transition border border-white/10 shrink-0"
              title="Volver a Líneas Base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-bold text-sm sm:text-base text-white tracking-tight truncate">
                  Establecer Nueva {terminologia.lineaBaseLabel}
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 uppercase tracking-wider shrink-0">
                  Transacción ACID (RNF-08)
                </span>
              </div>
              <span className="text-xs text-slate-400 block truncate">
                {terminologia.lineaBaseSubtitulo}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-3 shadow-md">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-1 font-semibold">{errorMsg}</div>
          </div>
        )}

        <form onSubmit={handlePreSubmit} className="space-y-6">
          {/* Card 1: Selección del Proyecto y Metadatos */}
          <div className="bg-[#1A1D25] p-6 sm:p-8 rounded-2xl border border-white/10 shadow-md space-y-6">
            <div className="flex items-center gap-2 text-white font-bold text-base border-b border-white/10 pb-3">
              <FolderGit2 className="w-5 h-5 text-amber-400" />
              <span>1. {terminologia.proyectoLabel} y Datos Generales</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Proyecto */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {terminologia.proyectoLabel} <span className="text-amber-400">*</span>
                </label>
                {loadingProyectos ? (
                  <div className="h-10 bg-[#14161E] rounded-xl animate-pulse" />
                ) : (
                  <select
                    value={proyectoId}
                    onChange={(e) => setProyectoId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#14161E] border border-white/10 rounded-xl text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-amber-400/50 transition cursor-pointer"
                  >
                    {proyectos.map((p) => (
                      <option key={p.id} value={p.id} className="bg-[#1A1D25] text-white">
                        {p.codigo} — {p.nombre}
                      </option>
                    ))}
                  </select>
                )}
                <span className="text-[11px] text-slate-500 mt-1 block">
                  La Línea Base pertenecerá exclusivamente a este registro.
                </span>
              </div>

              {/* Código de la Línea Base */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Código de Identificación Oficial <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                  placeholder="Ej. LB-CONSTR-01"
                  className="w-full px-4 py-2.5 bg-[#14161E] border border-white/10 rounded-xl text-xs sm:text-sm font-mono font-bold text-amber-300 uppercase placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50 transition"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Identificador único inmutable según convención de configuración.
                </span>
              </div>

              {/* Nombre de la Línea Base */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Denominación del Hito / Línea Base <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Línea Base Funcional del Sprint 1 / Cimentación Aprobada"
                  className="w-full px-4 py-2.5 bg-[#14161E] border border-white/10 rounded-xl text-xs sm:text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50 transition"
                />
              </div>

              {/* Descripción */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Descripción y Justificación del Congelamiento
                </label>
                <textarea
                  rows={2}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Detalla el alcance de este hito o los entregables que quedan asegurados contra cambios..."
                  className="w-full px-4 py-2.5 bg-[#14161E] border border-white/10 rounded-xl text-xs sm:text-sm font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50 transition"
                />
              </div>
            </div>

            {/* Checkbox de reemplazo de vigencia */}
            <div className="pt-2 border-t border-white/5">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={marcarAnterioresObsoletas}
                  onChange={(e) => setMarcarAnterioresObsoletas(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-white/20 bg-[#14161E]"
                />
                <div>
                  <span className="text-xs font-bold text-slate-200 block">
                    Marcar líneas base anteriores de este proyecto como OBSOLETAS
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Recomendado: asegura que solo exista una Línea Base VIGENTE de referencia activa (RF-11).
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Card 2: Selección de Versiones Aprobadas (El Corazón de la Línea Base) */}
          <div className="bg-[#1A1D25] p-6 sm:p-8 rounded-2xl border border-white/10 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <div className="flex items-center gap-2 text-white font-bold text-base">
                  <FileCheck2 className="w-5 h-5 text-emerald-400" />
                  <span>2. Selección de {terminologia.ecsLabelPlural} con Versión Aprobada</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Solo se pueden congelar versiones que cuenten con dictamen técnico APROBADO (RF-10).
                </p>
              </div>

              {/* Botones de selección rápida */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-3 py-1 text-xs font-semibold rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition"
                >
                  Seleccionar Todos
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="px-3 py-1 text-xs font-semibold rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10 transition"
                >
                  Deseleccionar
                </button>
                <span className="text-xs font-bold bg-amber-500/20 text-amber-300 px-3 py-1 rounded-xl border border-amber-500/30">
                  {totalSeleccionadas} de {elementos.length} seleccionados
                </span>
              </div>
            </div>

            {loadingEcs ? (
              <div className="py-12 text-center space-y-2">
                <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
                <p className="text-xs font-bold text-slate-400">
                  Buscando artefactos con versiones aprobadas...
                </p>
              </div>
            ) : elementos.length === 0 ? (
              <div className="py-12 text-center space-y-3 bg-[#14161E] rounded-xl border border-white/10 p-6">
                <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
                <h4 className="font-bold text-white text-sm">
                  No hay artefactos con versiones APROBADAS en este proyecto
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Para poder congelar una Línea Base, el Tech Lead debe primero revisar y dictaminar como <strong>APROBADA</strong> al menos una versión en el módulo de Aprobaciones.
                </p>
                <Link
                  href="/aprobaciones"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/10 transition"
                >
                  <span>Ir al Módulo de Dictamen</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {elementos.map((item) => {
                  const estaSeleccionado = !!versionesSeleccionadas[item.id];
                  const tieneAprobadas = item.versiones && item.versiones.length > 0;
                  const versionActualId = versionesSeleccionadas[item.id] || item.versiones?.[0]?.id;

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border transition-all ${
                        estaSeleccionado
                          ? 'bg-[#14161E] border-amber-400/40'
                          : 'bg-[#14161E]/50 border-white/5 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Checkbox y Nombre del ECS */}
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={estaSeleccionado}
                            disabled={!tieneAprobadas}
                            onChange={() => handleToggleEcs(item.id, item.versiones?.[0]?.id)}
                            className="mt-1 w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-white/20 bg-[#14161E] cursor-pointer"
                          />
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                {item.codigo}
                              </span>
                              <span className="font-bold text-white text-xs sm:text-sm">
                                {item.nombre}
                              </span>
                              <span className="text-[10px] uppercase font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                                {item.tipo}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              Responsable: {item.responsable.nombre_completo}
                            </span>
                          </div>
                        </div>

                        {/* Versión aprobada a congelar */}
                        <div className="pl-7 sm:pl-0 flex items-center gap-3">
                          {tieneAprobadas ? (
                            <div className="flex items-center gap-2">
                              <label className="text-[11px] font-semibold text-slate-400 shrink-0">
                                Versión Aprobada:
                              </label>
                              <select
                                value={versionActualId}
                                disabled={!estaSeleccionado}
                                onChange={(e) => handleSelectVersionForEcs(item.id, e.target.value)}
                                className="px-3 py-1.5 bg-[#1A1D25] border border-white/10 rounded-xl text-xs font-bold text-emerald-400 focus:outline-none focus:border-amber-400/50 disabled:opacity-50 transition cursor-pointer"
                              >
                                {item.versiones.map((v) => (
                                  <option key={v.id} value={v.id} className="bg-[#1A1D25] text-white">
                                    v{v.numero_version} (Aprobada {new Date(v.fecha_aprobacion || v.created_at).toLocaleDateString('es-PE')})
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                              Sin versiones aprobadas
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4">
            <Link
              href="/lineas-base"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs border border-white/10 transition text-center"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={submitting || totalSeleccionadas === 0}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-upt-gold to-amber-400 hover:brightness-110 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Establecer y Congelar Línea Base ({totalSeleccionadas} ECS)</span>
            </button>
          </div>
        </form>

        {/* Modal de Confirmación de Inmutabilidad */}
        {confirmModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#1A1D25] rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-white/10 space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
                <Lock className="w-6 h-6" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-white">
                  ¿Confirmar Congelamiento de Línea Base?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Estás a punto de congelar permanentemente el código <strong className="text-amber-300">{codigo}</strong> con <strong>{totalSeleccionadas} versiones aprobadas</strong>.
                </p>
              </div>

              <div className="bg-[#14161E] p-4 rounded-xl border border-white/10 text-xs text-slate-300 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Principio de Inmutabilidad Estricta (RF-10)</span>
                </div>
                <p className="leading-relaxed">
                  Una vez confirmada, esta Línea Base <strong>no podrá ser editada ni eliminada</strong>. Quedará registrada en la bitácora de auditoría inmutable del sistema.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-slate-300 font-bold text-xs hover:bg-white/5 transition"
                >
                  Volver a revisar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSubmit}
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-upt-gold to-amber-400 hover:brightness-110 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Congelando en Base de Datos...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Sí, Congelar Línea Base</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
