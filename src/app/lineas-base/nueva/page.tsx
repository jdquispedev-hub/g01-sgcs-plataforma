'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
        const res = await fetch('/api/auxiliares');
        const data = await res.json();
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

  // Cargar ECS y versiones aprobadas al cambiar el proyecto seleccionado
  useEffect(() => {
    if (!proyectoId) return;

    async function fetchVersionesAprobadas() {
      setLoadingEcs(true);
      setErrorMsg(null);
      try {
        const res = await fetch(`/api/proyectos/${proyectoId}/versiones-aprobadas`);
        const data = await res.json();

        if (data.success) {
          const ecsItems: EcsConVersiones[] = data.data.elementos;
          setElementos(ecsItems);

          // Generar código sugerido si no se ha escrito uno
          const p = proyectos.find((item) => item.id === proyectoId);
          if (p) {
            setCodigo(`LB-${p.codigo}-v1.0`);
            setNombre(`Línea Base Oficial - ${p.nombre}`);
          }

          // Preseleccionar la última versión aprobada de cada ECS disponible
          const seleccionInicial: Record<string, string> = {};
          ecsItems.forEach((item) => {
            if (item.versiones.length > 0) {
              seleccionInicial[item.id] = item.versiones[0].id;
            }
          });
          setVersionesSeleccionadas(seleccionInicial);
        } else {
          setErrorMsg(data.message || 'Error al obtener versiones del proyecto');
        }
      } catch (err) {
        console.error('Error al cargar versiones:', err);
        setErrorMsg('Error de conexión al cargar las versiones aprobadas');
      } finally {
        setLoadingEcs(false);
      }
    }

    fetchVersionesAprobadas();
  }, [proyectoId, proyectos]);

  // Manejar toggle o cambio de versión seleccionada para un ECS
  const handleToggleEcs = (ecsId: string, versionId: string) => {
    setVersionesSeleccionadas((prev) => {
      const copy = { ...prev };
      if (copy[ecsId]) {
        delete copy[ecsId];
      } else {
        copy[ecsId] = versionId;
      }
      return copy;
    });
  };

  const handleSelectVersionForEcs = (ecsId: string, versionId: string) => {
    setVersionesSeleccionadas((prev) => ({
      ...prev,
      [ecsId]: versionId,
    }));
  };

  const totalSeleccionadas = Object.keys(versionesSeleccionadas).length;

  // Validación previa antes del modal de confirmación
  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!codigo.trim()) {
      setErrorMsg('El código de la Línea Base es obligatorio (ej. LB-PRJ01-v1.0)');
      return;
    }
    if (!nombre.trim()) {
      setErrorMsg('El nombre descriptivo de la Línea Base es obligatorio');
      return;
    }
    if (totalSeleccionadas === 0) {
      setErrorMsg('Debe seleccionar al menos una versión aprobada para congelar en la Línea Base');
      return;
    }

    setConfirmModalOpen(true);
  };

  // Envío formal a la API transaccional
  const handleConfirmSubmit = async () => {
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        proyecto_id: proyectoId,
        codigo: codigo.trim().toUpperCase(),
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
        versiones_ids: Object.values(versionesSeleccionadas),
        marcar_anteriores_obsoletas: marcarAnterioresObsoletas,
      };

      const res = await fetch('/api/lineas-base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Error al procesar el establecimiento de la Línea Base');
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-upt-navy-700 text-white border-b-2 border-upt-gold shadow-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/lineas-base"
              className="p-2 rounded-xl bg-upt-navy-600 hover:bg-upt-navy-500 text-upt-gold transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight">Establecer Nueva Línea Base</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-upt-gold/20 text-upt-gold font-bold border border-upt-gold/40">
                  Transacción ACID (RNF-08)
                </span>
              </div>
              <span className="text-[11px] text-slate-300">Congelamiento estricto de especificaciones técnicas aprobadas</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Form Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-3 shadow-sm">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
            <div className="flex-1 font-medium">{errorMsg}</div>
          </div>
        )}

        <form onSubmit={handlePreSubmit} className="space-y-6">
          {/* Card 1: Selección del Proyecto y Metadatos */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-upt-navy-700 font-bold text-sm sm:text-base border-b border-slate-100 pb-3">
              <FolderGit2 className="w-5 h-5 text-upt-gold" />
              <span>1. Proyecto y Datos Generales de la Línea Base</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Proyecto */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Proyecto / Caso Operativo <span className="text-red-500">*</span>
                </label>
                {loadingProyectos ? (
                  <div className="h-10 bg-slate-100 rounded-2xl animate-pulse" />
                ) : (
                  <select
                    value={proyectoId}
                    onChange={(e) => setProyectoId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-upt-navy-500 transition"
                  >
                    {proyectos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.codigo} — {p.nombre}
                      </option>
                    ))}
                  </select>
                )}
                <span className="text-[11px] text-slate-500 mt-1 block">
                  La Línea Base pertenecerá exclusivamente a este proyecto.
                </span>
              </div>

              {/* Código */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Código Identificador <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                    placeholder="Ej. LB-PRJ01-v1.0"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-mono font-bold uppercase focus:bg-white focus:ring-2 focus:ring-upt-navy-500 transition"
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Debe ser único dentro del proyecto.
                </span>
              </div>

              {/* Nombre descriptivo */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nombre Descriptivo de la Línea Base <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Línea Base de Requerimientos y Arquitectura de Software v1"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-upt-navy-500 transition"
                />
              </div>

              {/* Justificación / Descripción */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Justificación Técnica / Alcance del Congelamiento
                </label>
                <textarea
                  rows={3}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Detalle el motivo del congelamiento (ej. Hito formal de pase a fase de construcción, aprobación unánime de planos estructurales, etc.)..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-upt-navy-500 transition"
                />
              </div>
            </div>

            {/* Opción de Obsolescencia */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={marcarAnterioresObsoletas}
                  onChange={(e) => setMarcarAnterioresObsoletas(e.target.checked)}
                  className="mt-1 w-4 h-4 text-upt-navy-700 rounded border-slate-300 focus:ring-upt-navy-500"
                />
                <div>
                  <span className="text-xs sm:text-sm font-bold text-slate-800">
                    Marcar líneas base anteriores de este proyecto como <span className="text-slate-500">OBSOLETAS</span>
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Recomendado para mantener únicamente una Línea Base <strong className="text-emerald-600">VIGENTE</strong> activa a la vez por proyecto.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Card 2: Selección de Versiones Aprobadas (RF-09) */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-upt-navy-700 font-bold text-sm sm:text-base">
                <FileCheck2 className="w-5 h-5 text-upt-gold" />
                <span>2. Versiones Aprobadas para Congelar (RF-09)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Seleccionadas:</span>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-upt-gold text-upt-navy-900">
                  {totalSeleccionadas} de {elementos.filter((e) => e.versiones.length > 0).length} disponibles
                </span>
              </div>
            </div>

            {/* Alerta de regla estricta */}
            <div className="bg-upt-gold/10 border border-upt-gold/30 rounded-2xl p-4 flex items-start gap-3">
              <Info className="w-4 h-4 text-upt-gold-600 mt-0.5 shrink-0" />
              <p className="text-xs text-slate-700 leading-relaxed">
                <strong>Regla de Aceptación SGCS (RF-09):</strong> Solo las versiones con dictamen formal 
                <span className="text-emerald-700 font-bold"> APROBADA</span> por el Especialista Técnico 
                pueden formar parte de la Línea Base. Los artefactos con versiones en estado <em>Pendiente</em> o <em>Rechazada</em> no se pueden incorporar hasta su debida aprobación técnica.
              </p>
            </div>

            {/* Listado de ECS y sus versiones aprobadas */}
            {loadingEcs ? (
              <div className="py-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-upt-navy-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">Buscando versiones aprobadas del proyecto...</p>
              </div>
            ) : elementos.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-slate-200 rounded-2xl">
                <p className="text-xs text-slate-500 font-semibold">
                  Este proyecto aún no tiene Elementos de Configuración (ECS) registrados.
                </p>
                <Link
                  href="/ecs"
                  className="mt-3 inline-flex text-xs font-bold text-upt-navy-700 hover:text-upt-gold transition"
                >
                  Ir al catálogo a crear un ECS &rarr;
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {elementos.map((item) => {
                  const tieneAprobadas = item.versiones.length > 0;
                  const estaSeleccionado = !!versionesSeleccionadas[item.id];
                  const versionActualId = versionesSeleccionadas[item.id] || (tieneAprobadas ? item.versiones[0].id : '');

                  return (
                    <div
                      key={item.id}
                      className={`py-4 px-3 sm:px-4 rounded-2xl transition-all ${
                        !tieneAprobadas
                          ? 'opacity-50 bg-slate-50/50 cursor-not-allowed'
                          : estaSeleccionado
                          ? 'bg-upt-navy-50/40 border border-upt-navy-100 shadow-sm'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Selector y metadatos del ECS */}
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            disabled={!tieneAprobadas}
                            checked={estaSeleccionado}
                            onChange={() => {
                              if (tieneAprobadas) {
                                handleToggleEcs(item.id, versionActualId);
                              }
                            }}
                            className="mt-1 w-4 h-4 text-upt-navy-700 rounded border-slate-300 focus:ring-upt-navy-500 cursor-pointer disabled:cursor-not-allowed"
                          />
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs font-bold text-upt-navy-700 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                                {item.codigo}
                              </span>
                              <span className="font-bold text-slate-900 text-xs sm:text-sm">
                                {item.nombre}
                              </span>
                              <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                {item.tipo}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 block mt-0.5">
                              Responsable: {item.responsable.nombre_completo}
                            </span>
                          </div>
                        </div>

                        {/* Versión aprobada a congelar */}
                        <div className="pl-7 sm:pl-0 flex items-center gap-3">
                          {tieneAprobadas ? (
                            <div className="flex items-center gap-2">
                              <label className="text-[11px] font-bold text-slate-600 shrink-0">
                                Versión Aprobada:
                              </label>
                              <select
                                value={versionActualId}
                                disabled={!estaSeleccionado}
                                onChange={(e) => handleSelectVersionForEcs(item.id, e.target.value)}
                                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-emerald-700 focus:ring-2 focus:ring-upt-navy-500 disabled:opacity-50 transition"
                              >
                                {item.versiones.map((v) => (
                                  <option key={v.id} value={v.id}>
                                    v{v.numero_version} (Aprobada {new Date(v.fecha_aprobacion || v.created_at).toLocaleDateString('es-PE')})
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
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
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition text-center"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={submitting || totalSeleccionadas === 0}
              className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-upt-gold hover:bg-upt-gold-600 text-upt-navy-900 font-black text-xs sm:text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Establecer y Congelar Línea Base ({totalSeleccionadas} ECS)</span>
            </button>
          </div>
        </form>

        {/* Modal de Confirmación de Inmutabilidad */}
        {confirmModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-2xl bg-upt-gold/20 text-upt-gold-600 flex items-center justify-center mx-auto border border-upt-gold/40">
                <Lock className="w-6 h-6" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-lg font-black text-slate-900">
                  ¿Confirmar Congelamiento de Línea Base?
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Estás a punto de congelar permanentemente el código <strong className="text-upt-navy-700">{codigo}</strong> con <strong>{totalSeleccionadas} versiones aprobadas</strong>.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
                <div className="flex items-center gap-2 font-bold text-upt-garnet">
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
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-100 transition"
                >
                  Volver a revisar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSubmit}
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-upt-navy-700 hover:bg-upt-navy-800 text-upt-gold font-black text-xs shadow-md transition flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
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
