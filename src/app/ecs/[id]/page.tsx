'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Layers, 
  FileText, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink, 
  Edit3, 
  User, 
  Calendar, 
  AlertCircle,
  Loader2,
  Check,
  X
} from 'lucide-react';

interface VersionItem {
  id: string;
  numero_version: string;
  descripcion: string;
  archivo_url: string | null;
  estado: string;
  fecha_aprobacion: string | null;
  created_at: string;
  autor: { id: string; nombre_completo: string; email: string };
  aprobador: { id: string; nombre_completo: string; email: string } | null;
}

interface EcsDetail {
  id: string;
  codigo: string;
  nombre: string;
  tipo: string;
  descripcion: string | null;
  ubicacion: string;
  proyecto: { id: string; codigo: string; nombre: string };
  responsable: { id: string; nombre_completo: string; email: string };
  versiones: VersionItem[];
}

export default function EcsDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [ecs, setEcs] = useState<EcsDetail | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Modal nueva versión
  const [modalVersionOpen, setModalVersionOpen] = useState(false);
  const [numeroVersion, setNumeroVersion] = useState('');
  const [descVersion, setDescVersion] = useState('');
  const [archivoUrl, setArchivoUrl] = useState('');
  const [savingVersion, setSavingVersion] = useState(false);
  const [versionError, setVersionError] = useState<string | null>(null);

  // Modal editar ECS
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [editNombre, setEditNombre] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');
  const [editUbicacion, setEditUbicacion] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const [resEcs, resMe] = await Promise.all([
        fetch(`/api/ecs/${params.id}`),
        fetch('/api/auth/me'),
      ]);

      const dataEcs = await resEcs.json();
      const dataMe = await resMe.json();

      if (dataEcs.success) {
        setEcs(dataEcs.data);
        setEditNombre(dataEcs.data.nombre);
        setEditDescripcion(dataEcs.data.descripcion || '');
        setEditUbicacion(dataEcs.data.ubicacion);
      }
      if (dataMe.success) {
        setCurrentUserRole(dataMe.data.user.rol);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [params.id]);

  const handleCreateVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    setVersionError(null);
    setSavingVersion(true);

    try {
      const res = await fetch(`/api/ecs/${params.id}/versiones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numero_version: numeroVersion,
          descripcion: descVersion,
          archivo_url: archivoUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setVersionError(data.message || 'Error al registrar la versión');
        setSavingVersion(false);
        return;
      }

      setModalVersionOpen(false);
      setNumeroVersion('');
      setDescVersion('');
      setArchivoUrl('');
      loadDetail();
    } catch {
      setVersionError('Error al conectar con el servidor');
    } finally {
      setSavingVersion(false);
    }
  };

  const handleDictaminarVersion = async (versionId: string, decision: 'APROBAR' | 'RECHAZAR') => {
    if (!confirm(`¿Está seguro de ${decision.toLowerCase()} esta versión formalmente?`)) return;

    try {
      const res = await fetch(`/api/ecs/${params.id}/versiones/${versionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      });

      const data = await res.json();
      if (data.success) {
        loadDetail();
      } else {
        alert(data.message);
      }
    } catch {
      alert('Error al dictaminar versión');
    }
  };

  const handleUpdateEcs = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEdit(true);

    try {
      const res = await fetch(`/api/ecs/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: editNombre,
          descripcion: editDescripcion,
          ubicacion: editUbicacion,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setModalEditOpen(false);
        loadDetail();
      } else {
        alert(data.message);
      }
    } catch {
      alert('Error al actualizar el ECS');
    } finally {
      setSavingEdit(false);
    }
  };

  const canApprove = ['SUPERADMIN', 'ADMINISTRADOR', 'APROBADOR'].includes(currentUserRole);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-upt-navy-600" />
      </div>
    );
  }

  if (!ecs) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <p className="text-sm font-bold text-slate-700">Elemento de Configuración no encontrado</p>
        <Link href="/ecs" className="mt-3 text-xs text-upt-navy-600 underline">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-upt-navy-900 text-white border-b-2 border-upt-gold shadow-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/ecs"
              className="p-2 rounded-xl bg-upt-navy-800 hover:bg-upt-navy-700 text-upt-gold transition border border-upt-gold/30"
              title="Volver al Catálogo ECS"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-upt-gold bg-upt-navy-800 px-2 py-0.5 rounded border border-upt-gold/30">
                  {ecs.codigo}
                </span>
                <span className="font-black text-base tracking-tight truncate max-w-xs sm:max-w-md text-white">{ecs.nombre}</span>
              </div>
              <span className="text-[11px] text-slate-400">Gestión de versiones y ciclo de vida (RF-07, RF-08)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setModalEditOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center gap-1.5 border border-white/10"
            >
              <Edit3 className="w-4 h-4 text-upt-gold" /> Editar ECS
            </button>
            <button
              onClick={() => setModalVersionOpen(true)}
              className="px-4 py-2 rounded-xl bg-upt-gold hover:bg-upt-gold-600 text-upt-navy-950 font-black text-xs shadow-md transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Nueva Versión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Ficha Resumen del ECS */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-300 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tipo de Elemento</p>
              <p className="text-sm font-bold text-slate-900 mt-1">{ecs.tipo}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Proyecto Asociado</p>
              <p className="text-sm font-bold text-slate-900 mt-1">{ecs.proyecto.nombre}</p>
              <span className="font-mono text-[10px] text-slate-400">{ecs.proyecto.codigo}</span>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Responsable Técnico</p>
              <p className="text-sm font-bold text-slate-900 mt-1">{ecs.responsable.nombre_completo}</p>
              <span className="text-[11px] text-slate-500">{ecs.responsable.email}</span>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Ubicación / Repo</p>
              <a
                href={ecs.ubicacion.startsWith('http') ? ecs.ubicacion : '#'}
                target={ecs.ubicacion.startsWith('http') ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="text-xs font-semibold text-upt-navy-600 hover:text-upt-gold-600 mt-1 flex items-center gap-1 truncate"
              >
                <span>{ecs.ubicacion}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>
          </div>

          {ecs.descripcion && (
            <div className="mt-5 pt-5 border-t border-slate-100">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Descripción del Artefacto</p>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">{ecs.descripcion}</p>
            </div>
          )}
        </div>

        {/* Historial de Versiones (RF-07, RF-08) */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">Historial y Dictamen de Versiones</h2>
              <p className="text-xs text-slate-500">
                Solo las versiones aprobadas pueden formar parte de una Línea Base formal (RF-09).
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
              Total: {ecs.versiones.length} versiones
            </span>
          </div>

          {ecs.versiones.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-10 text-center">
              <p className="text-sm font-bold text-slate-700">Este ECS no cuenta con versiones registradas</p>
              <p className="text-xs text-slate-400 mt-1">Registra la versión inicial (ej. 1.0.0) para empezar.</p>
              <button
                onClick={() => setModalVersionOpen(true)}
                className="mt-3 px-4 py-2 rounded-xl bg-upt-navy-600 hover:bg-upt-navy-700 text-white font-bold text-xs transition"
              >
                Registrar Versión 1.0.0
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {ecs.versiones.map((v) => (
                <div
                  key={v.id}
                  className="bg-white rounded-3xl p-6 border-2 border-slate-300 shadow-md hover:shadow-xl transition flex flex-col md:flex-row justify-between gap-4 items-start md:items-center"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                        v{v.numero_version}
                      </span>
                      {v.estado === 'APROBADA' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Aprobada Formalmente
                        </span>
                      )}
                      {v.estado === 'RECHAZADA' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
                          <XCircle className="w-3.5 h-3.5" /> Rechazada
                        </span>
                      )}
                      {v.estado === 'PENDIENTE' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3.5 h-3.5" /> Pendiente de Aprobación
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">{v.descripcion}</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" /> Autor: {v.autor.nombre_completo}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Fecha: {new Date(v.created_at).toLocaleDateString()}
                      </span>
                      {v.aprobador && (
                        <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Dictaminado por: {v.aprobador.nombre_completo}
                        </span>
                      )}
                      {v.archivo_url && (
                        <a
                          href={v.archivo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-upt-navy-600 hover:text-upt-gold-600 font-semibold"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Ver Archivo/Commit
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Botones de Dictamen para Rol APROBADOR (RF-08, RNF-02) */}
                  {canApprove && v.estado === 'PENDIENTE' && (
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <button
                        onClick={() => handleDictaminarVersion(v.id, 'APROBAR')}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Aprobar
                      </button>
                      <button
                        onClick={() => handleDictaminarVersion(v.id, 'RECHAZAR')}
                        className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Rechazar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal Nueva Versión (RF-07) */}
      {modalVersionOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-slate-900 mb-1">Registrar Nueva Versión</h3>
            <p className="text-xs text-slate-500 mb-4">
              Cada versión debe tener un número correlativo único para este ECS.
            </p>

            {versionError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span>{versionError}</span>
              </div>
            )}

            <form onSubmit={handleCreateVersion} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Número de Versión <span className="text-upt-garnet-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={numeroVersion}
                  onChange={(e) => setNumeroVersion(e.target.value)}
                  placeholder="Ej. 1.0.0 o Rev-B"
                  className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-upt-navy-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Descripción del Cambio <span className="text-upt-garnet-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={descVersion}
                  onChange={(e) => setDescVersion(e.target.value)}
                  placeholder="Explique qué se añadió, corrigió o modificó en esta versión..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-upt-navy-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enlace a Archivo / Commit / Plano
                </label>
                <input
                  type="url"
                  value={archivoUrl}
                  onChange={(e) => setArchivoUrl(e.target.value)}
                  placeholder="https://github.com/.../commit/... o URL de nube"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-upt-navy-500"
                />
              </div>

              <div className="pt-2 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setModalVersionOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingVersion}
                  className="px-5 py-2 rounded-xl bg-upt-navy-600 hover:bg-upt-navy-700 text-white font-bold text-xs shadow-md transition disabled:opacity-60 flex items-center gap-1.5"
                >
                  {savingVersion && <Loader2 className="w-4 h-4 animate-spin text-upt-gold" />}
                  <span>Guardar Versión</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar ECS (RF-06) */}
      {modalEditOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-slate-900 mb-1">Actualizar Información del ECS</h3>
            <p className="text-xs text-slate-500 mb-4">
              El código identificador permanece invariable por trazabilidad (RF-06).
            </p>

            <form onSubmit={handleUpdateEcs} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-upt-navy-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ubicación / Repo</label>
                <input
                  type="text"
                  required
                  value={editUbicacion}
                  onChange={(e) => setEditUbicacion(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-upt-navy-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descripción</label>
                <textarea
                  rows={3}
                  value={editDescripcion}
                  onChange={(e) => setEditDescripcion(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-upt-navy-500"
                ></textarea>
              </div>

              <div className="pt-2 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setModalEditOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-xl bg-upt-navy-600 hover:bg-upt-navy-700 text-white font-bold text-xs shadow-md transition disabled:opacity-60 flex items-center gap-1.5"
                >
                  {savingEdit && <Loader2 className="w-4 h-4 animate-spin text-upt-gold" />}
                  <span>Actualizar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
