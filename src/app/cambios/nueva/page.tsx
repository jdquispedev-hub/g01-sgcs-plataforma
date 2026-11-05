'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getTerminologia } from '@/lib/terminologia';
import Link from 'next/link';
import {
  ArrowLeft,
  GitPullRequest,
  ShieldCheck,
  AlertTriangle,
  FolderGit2,
  Layers,
  FileCheck2,
  Calendar,
  User,
  ExternalLink,
  Loader2,
  Info,
} from 'lucide-react';
import NavbarPrincipal from '@/components/NavbarPrincipal';

interface VersionItem {
  id: string;
  numero_version: string;
  estado: string;
  created_at: string;
}

interface EcsItem {
  id: string;
  codigo: string;
  nombre: string;
  tipo: string;
  proyecto: { id: string; codigo: string; nombre: string };
  versiones: VersionItem[];
}

interface Proyecto {
  id: string;
  codigo: string;
  nombre: string;
}

export default function NuevaRfcPage() {
  const router = useRouter();

  // Estados de datos auxiliares
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [proyectoId, setProyectoId] = useState('');
  const [ecsList, setEcsList] = useState<EcsItem[]>([]);
  const [loadingProyectos, setLoadingProyectos] = useState(true);
  const [loadingEcs, setLoadingEcs] = useState(false);
  const [rubro, setRubro] = useState<string>('CONSTRUCCION');

  // Estados del formulario
  const [ecsId, setEcsId] = useState('');
  const [versionBaseId, setVersionBaseId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [justificacion, setJustificacion] = useState('');

  // Estados de envío
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cargar proyectos y usuario
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
        console.error('Error al cargar datos auxiliares:', err);
      } finally {
        setLoadingProyectos(false);
      }
    }
    fetchAux();
  }, []);

  // Cargar ECS cuando cambia el proyecto
  useEffect(() => {
    if (!proyectoId) return;

    async function fetchEcs() {
      setLoadingEcs(true);
      try {
        const res = await fetch(`/api/ecs?proyectoId=${proyectoId}`);
        const data = await res.json();

        if (data.success) {
          setEcsList(data.data);
          if (data.data.length > 0) {
            const primerEcs = data.data[0];
            setEcsId(primerEcs.id);
            if (primerEcs.versiones && primerEcs.versiones.length > 0) {
              setVersionBaseId(primerEcs.versiones[primerEcs.versiones.length - 1].id);
            } else {
              setVersionBaseId('');
            }
          } else {
            setEcsId('');
            setVersionBaseId('');
          }
        }
      } catch (err) {
        console.error('Error al cargar ECS:', err);
      } finally {
        setLoadingEcs(false);
      }
    }

    fetchEcs();
  }, [proyectoId]);

  // Actualizar versión base seleccionada al cambiar el ECS
  const handleEcsChange = (newEcsId: string) => {
    setEcsId(newEcsId);
    const item = ecsList.find((e) => e.id === newEcsId);
    if (item && item.versiones && item.versiones.length > 0) {
      setVersionBaseId(item.versiones[item.versiones.length - 1].id);
    } else {
      setVersionBaseId('');
    }
  };

  const selectedEcs = ecsList.find((e) => e.id === ecsId);

  // Enviar el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!ecsId) {
      setErrorMsg('Debes seleccionar un Elemento de Configuración');
      return;
    }
    if (!versionBaseId) {
      setErrorMsg('Debes seleccionar la versión base que se verá afectada por el cambio');
      return;
    }
    if (!descripcion.trim() || descripcion.trim().length < 10) {
      setErrorMsg('La descripción del cambio debe ser detallada (mínimo 10 caracteres)');
      return;
    }
    if (!justificacion.trim() || justificacion.trim().length < 10) {
      setErrorMsg('La justificación del cambio debe estar debidamente sustentada (mínimo 10 caracteres)');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/cambios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ecs_id: ecsId,
          version_base_id: versionBaseId,
          descripcion: descripcion.trim(),
          justificacion: justificacion.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Error al registrar la solicitud de cambio');
        setSubmitting(false);
        return;
      }

      router.push(`/cambios/${data.data.id}`);
    } catch {
      setErrorMsg('Error de red al comunicarse con el servidor');
      setSubmitting(false);
    }
  };

  const terminologia = getTerminologia(rubro);

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 flex flex-col antialiased">
      {/* Navbar Global Unificado */}
      <NavbarPrincipal />

      {/* Sub-header contextual */}
      <div className="bg-[#0B1528] border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/cambios"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-amber-400 transition border border-white/10 shrink-0"
              title="Volver a Solicitudes de Cambio"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-bold text-xs sm:text-base text-white tracking-tight truncate">
                  Radicar Solicitud de Cambio (RFC)
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 uppercase tracking-wider shrink-0">
                  RF-11 • Registro Formal
                </span>
              </div>
              <span className="text-xs text-slate-400 block truncate">
                Petición controlada de modificación vinculada a una versión base
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-3 shadow-md">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-1 font-semibold">{errorMsg}</div>
          </div>
        )}

        {/* Banner de Concepto: ¿Por qué radicar una RFC? */}
        <div className="bg-[#0C1527] rounded-2xl p-5 text-white border border-white/10 shadow-md flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-white">Procedimiento de Cambio Controlado (RF-11):</strong> Toda propuesta de cambio debe especificar con precisión el artefacto afectado y su versión actual. Luego de radicada, el comité técnico evaluará su impacto antes de autorizar cualquier trabajo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card 1: Selección del Artefacto y Versión Base */}
          <div className="bg-[#0C1527] p-6 sm:p-8 rounded-2xl border border-white/10 shadow-md space-y-6">
            <div className="flex items-center gap-2 text-white font-bold text-base border-b border-white/10 pb-3">
              <Layers className="w-5 h-5 text-amber-400" />
              <span>1. {terminologia.ecsLabel} Afectado y Versión de Partida</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Proyecto */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {terminologia.proyectoLabel} <span className="text-amber-400">*</span>
                </label>
                {loadingProyectos ? (
                  <div className="h-10 bg-[#070D18] rounded-xl animate-pulse" />
                ) : (
                  <select
                    value={proyectoId}
                    onChange={(e) => setProyectoId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#070D18] border border-white/10 rounded-xl text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-amber-400/50 transition cursor-pointer"
                  >
                    {proyectos.map((p) => (
                      <option key={p.id} value={p.id} className="bg-[#0C1527] text-white">
                        {p.codigo} — {p.nombre}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* ECS Afectado */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {terminologia.ecsLabel} <span className="text-amber-400">*</span>
                </label>
                {loadingEcs ? (
                  <div className="h-10 bg-[#070D18] rounded-xl animate-pulse" />
                ) : ecsList.length === 0 ? (
                  <p className="text-xs text-amber-400 font-semibold p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
                    Sin artefactos en este proyecto.
                  </p>
                ) : (
                  <select
                    value={ecsId}
                    onChange={(e) => handleEcsChange(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#070D18] border border-white/10 rounded-xl text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-amber-400/50 transition cursor-pointer"
                  >
                    {ecsList.map((ecs) => (
                      <option key={ecs.id} value={ecs.id} className="bg-[#0C1527] text-white">
                        {ecs.codigo} — {ecs.nombre} ({ecs.tipo})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Versión Base a Modificar */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Versión Base a Modificar <span className="text-amber-400">*</span>
                </label>
                {selectedEcs && selectedEcs.versiones.length > 0 ? (
                  <select
                    value={versionBaseId}
                    onChange={(e) => setVersionBaseId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#070D18] border border-white/10 rounded-xl text-xs sm:text-sm font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-400/50 transition cursor-pointer"
                  >
                    {selectedEcs.versiones.map((v) => (
                      <option key={v.id} value={v.id} className="bg-[#0C1527] text-white">
                        v{v.numero_version} (Estado: {v.estado})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-amber-400 font-semibold p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
                    El ECS seleccionado no cuenta con versiones registradas.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Descripción y Justificación Técnica */}
          <div className="bg-[#0C1527] p-6 sm:p-8 rounded-2xl border border-white/10 shadow-md space-y-6">
            <div className="flex items-center gap-2 text-white font-bold text-base border-b border-white/10 pb-3">
              <FileCheck2 className="w-5 h-5 text-amber-400" />
              <span>2. Alcance y Justificación del Cambio Solicitado</span>
            </div>

            <div className="space-y-5">
              {/* Descripción */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Descripción Técnica Detallada del Cambio <span className="text-amber-400">*</span>
                </label>
                <textarea
                  rows={4}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder={`Ej. ${terminologia.cambioEjemploDescripcion}`}
                  className="w-full px-4 py-2.5 bg-[#070D18] border border-white/10 rounded-xl text-xs sm:text-sm font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50 transition"
                />
              </div>

              {/* Justificación */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Justificación Operativa / de Negocio <span className="text-amber-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={justificacion}
                  onChange={(e) => setJustificacion(e.target.value)}
                  placeholder={`Ej. ${terminologia.cambioEjemploJustificacion}`}
                  className="w-full px-4 py-2.5 bg-[#070D18] border border-white/10 rounded-xl text-xs sm:text-sm font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50 transition"
                />
              </div>
            </div>
          </div>

          {/* Botones de Envío */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
            <Link
              href="/cambios"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs border border-white/10 transition text-center"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={submitting || !versionBaseId}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-upt-gold to-amber-400 hover:brightness-110 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Radicando Solicitud...</span>
                </>
              ) : (
                <>
                  <GitPullRequest className="w-4 h-4" />
                  <span>Radicar Solicitud de Cambio (RFC)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
