'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NavbarPrincipal from '@/components/NavbarPrincipal';
import { getTerminologia } from '@/lib/terminologia';
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
  UserCheck,
  Upload,
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
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [rubro, setRubro] = useState<string>('CONSTRUCCION');
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
        const u = dataMe.data?.user || dataMe.user;
        setCurrentUser(u);
        setCurrentUserRole(u?.rol || '');
        setCurrentUserId(u?.userId || u?.id || '');
        if (u?.rubro) {
          setRubro(u.rubro);
        }
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
        const errorDetail =
          data.message ||
          data.errors?.archivo_url?._errors?.[0] ||
          data.errors?.descripcion?._errors?.[0] ||
          data.errors?.numero_version?._errors?.[0] ||
          'Error al registrar la versión';
        setVersionError(errorDetail);
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
  const terminologia = getTerminologia(rubro);

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
    <div className="min-h-screen bg-[#F4F6F9] text-slate-900 flex flex-col antialiased">
      {/* Top Navbar Global Unificado */}
      <NavbarPrincipal user={currentUser} />

      {/* Sub-Header y Acciones del Entregable */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href="/ecs"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition border border-slate-200"
              title="Volver al Catálogo ECS"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 shrink-0">
                  {ecs.codigo}
                </span>
                <span className="font-bold text-sm sm:text-base tracking-tight truncate text-slate-900">
                  {ecs.nombre}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 block truncate">
                Expediente de versiones y dictamen técnico
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setModalEditOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs transition flex items-center gap-1.5 border border-slate-200"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Editar Datos</span>
            </button>
            <button
              onClick={() => setModalVersionOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-[#0B2545] hover:bg-[#133A66] text-white font-semibold text-xs shadow-xs transition flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Versión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6">
        {/* Ficha Resumen del ECS */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Tipo de Elemento</p>
              <p className="text-sm font-bold text-slate-900 mt-1">{ecs.tipo}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Proyecto Asociado</p>
              <p className="text-sm font-bold text-slate-900 mt-1">{ecs.proyecto.nombre}</p>
              <span className="font-mono text-[10px] text-slate-400">{ecs.proyecto.codigo}</span>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Responsable Técnico</p>
              <p className="text-sm font-bold text-slate-900 mt-1">{ecs.responsable.nombre_completo}</p>
              <span className="text-[11px] text-slate-500">{ecs.responsable.email}</span>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Ubicación / Repo</p>
              <a
                href={ecs.ubicacion.startsWith('http') ? ecs.ubicacion : '#'}
                target={ecs.ubicacion.startsWith('http') ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="text-xs font-medium text-sky-600 hover:underline mt-1 flex items-center gap-1 truncate"
              >
                <span>{ecs.ubicacion}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>
          </div>

          {ecs.descripcion && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Descripción del Artefacto</p>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">{ecs.descripcion}</p>
            </div>
          )}
        </div>

        {/* Banner Guiado para el Responsable Asignado */}
        {ecs.responsable?.id === currentUserId && (
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-sky-400 flex items-center justify-center shrink-0 shadow-sm">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Eres el Responsable Técnico de este entregable</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800/60">
                    A tu cargo
                  </span>
                </p>
                <p className="text-xs text-slate-300 mt-0.5">
                  {ecs.versiones.length === 0
                    ? 'Aún no has registrado tu primera versión. Haz clic en "Registrar Versión 1.0.0" para entregar tus planos o documentos iniciales.'
                    : 'Tus entregas están registradas en el historial. Puedes proponer nuevas revisiones cuando realices modificaciones.'}
                </p>
              </div>
            </div>
            {ecs.versiones.length === 0 && (
              <button
                onClick={() => setModalVersionOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-sm transition active:scale-95 shrink-0 flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5 text-sky-600" />
                <span>Registrar Versión 1.0.0</span>
              </button>
            )}
          </div>
        )}

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
                  className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-sm transition flex flex-col md:flex-row justify-between gap-4 items-start md:items-center"
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
                  Descripción del Cambio / Motivo <span className="text-upt-garnet-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={descVersion}
                  onChange={(e) => setDescVersion(e.target.value)}
                  placeholder={terminologia.versionEjemploMotivo}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-upt-navy-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enlace Digital o Ubicación del Archivo <span className="text-slate-400 font-normal">(Opcional)</span>
                </label>
                <input
                  type="text"
                  value={archivoUrl}
                  onChange={(e) => setArchivoUrl(e.target.value)}
                  placeholder="Ej. https://drive.google.com/..., enlace web o ruta local (opcional)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-upt-navy-500 font-mono"
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
                  className="px-5 py-2 rounded-xl bg-[#0B2545] hover:bg-[#133A66] text-white font-bold text-xs shadow-xs transition disabled:opacity-60 flex items-center gap-1.5"
                >
                  {savingVersion && <Loader2 className="w-4 h-4 animate-spin text-sky-300" />}
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
            <h3 className="text-lg font-black text-slate-900 mb-1">Actualizar Información ({terminologia.ecsLabel})</h3>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">{terminologia.ecsUbicacionLabel}</label>
                <input
                  type="text"
                  required
                  value={editUbicacion}
                  onChange={(e) => setEditUbicacion(e.target.value)}
                  placeholder={terminologia.ecsUbicacionPlaceholder}
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
