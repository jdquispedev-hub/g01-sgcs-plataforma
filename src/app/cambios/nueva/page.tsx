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
  CheckCircle2,
  Network,
  Code2,
  FileText,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import AppShell from '@/components/AppShell';

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

interface ActividadItem {
  id: string;
  titulo: string;
  codigo_caso_uso?: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  estado_asignacion: string;
}

interface Proyecto {
  id: string;
  codigo: string;
  nombre: string;
  metodologia?: string;
}

export default function NuevaRfcPage() {
  const router = useRouter();

  // Estados de datos auxiliares
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [proyectoId, setProyectoId] = useState('');
  const [ecsList, setEcsList] = useState<EcsItem[]>([]);
  const [actividades, setActividades] = useState<ActividadItem[]>([]);
  const [loadingProyectos, setLoadingProyectos] = useState(true);
  const [loadingEcs, setLoadingEcs] = useState(false);
  const [rubro, setRubro] = useState<string>('SOFTWARE');

  // Estados del flujo secuencial (Pizarra del Docente)
  // Paso 1: Actividad y Caso de Uso
  const [actividadId, setActividadId] = useState('');
  const [codigoCasoUso, setCodigoCasoUso] = useState('CU01');

  // Paso 2: Requerimiento analizado
  const [requerimientoAfectado, setRequerimientoAfectado] = useState('RF-01: Autenticación y Control de Accesos');

  // Paso 3: ECS Principal y Objetos Afectados en Cascada
  const [ecsId, setEcsId] = useState('');
  const [versionBaseId, setVersionBaseId] = useState('');
  const [ecsAfectadosIds, setEcsAfectadosIds] = useState<string[]>([]);

  // Paso 4: Detalle del cambio
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

  // Cargar ECS y Actividades cuando cambia el proyecto
  useEffect(() => {
    if (!proyectoId) return;

    async function fetchProyectoDatos() {
      setLoadingEcs(true);
      try {
        const [resEcs, resAct] = await Promise.all([
          fetch(`/api/ecs?proyectoId=${proyectoId}`),
          fetch(`/api/cronograma/actividades?proyectoId=${proyectoId}`),
        ]);

        const dataEcs = await resEcs.json();
        const dataAct = await resAct.json();

        if (dataEcs.success) {
          setEcsList(dataEcs.data);
          if (dataEcs.data.length > 0) {
            setEcsId(dataEcs.data[0].id);
            if (dataEcs.data[0].versiones && dataEcs.data[0].versiones.length > 0) {
              setVersionBaseId(dataEcs.data[0].versiones[dataEcs.data[0].versiones.length - 1].id);
            } else {
              setVersionBaseId('');
            }
          } else {
            setEcsId('');
            setVersionBaseId('');
          }
        }

        if (dataAct.success && Array.isArray(dataAct.data)) {
          setActividades(dataAct.data);
          if (dataAct.data.length > 0) {
            setActividadId(dataAct.data[0].id);
            if (dataAct.data[0].codigo_caso_uso) {
              setCodigoCasoUso(dataAct.data[0].codigo_caso_uso);
            }
          }
        }
      } catch (err) {
        console.error('Error al cargar ECS y actividades:', err);
      } finally {
        setLoadingEcs(false);
      }
    }

    fetchProyectoDatos();
  }, [proyectoId]);

  // Actualizar versión base seleccionada al cambiar el ECS principal
  const handleEcsChange = (newEcsId: string) => {
    setEcsId(newEcsId);
    const item = ecsList.find((e) => e.id === newEcsId);
    if (item && item.versiones && item.versiones.length > 0) {
      setVersionBaseId(item.versiones[item.versiones.length - 1].id);
    } else {
      setVersionBaseId('');
    }
  };

  const handleActividadChange = (newActId: string) => {
    setActividadId(newActId);
    const act = actividades.find((a) => a.id === newActId);
    if (act?.codigo_caso_uso) {
      setCodigoCasoUso(act.codigo_caso_uso);
    }
  };

  const toggleEcsAfectado = (id: string) => {
    setEcsAfectadosIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedEcs = ecsList.find((e) => e.id === ecsId);

  // Enviar el formulario secuencial
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!ecsId) {
      setErrorMsg('Debes seleccionar un Elemento de Configuración principal');
      return;
    }
    if (!versionBaseId) {
      setErrorMsg('Debes seleccionar la versión base que se verá afectada por el cambio');
      return;
    }
    if (!descripcion.trim() || descripcion.trim().length < 5) {
      setErrorMsg('La descripción del cambio debe ser detallada (mínimo 5 caracteres)');
      return;
    }
    if (!justificacion.trim() || justificacion.trim().length < 5) {
      setErrorMsg('La justificación del cambio debe estar debidamente sustentada (mínimo 5 caracteres)');
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
          actividad_cronograma_id: actividadId || null,
          codigo_caso_uso: codigoCasoUso.trim() || null,
          requerimiento_afectado: requerimientoAfectado.trim() || null,
          ecs_afectados_ids: ecsAfectadosIds,
          descripcion: descripcion.trim(),
          justificacion: justificacion.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errorDetalle =
          data.errors?.codigo?._errors?.[0] ||
          data.errors?.descripcion?._errors?.[0] ||
          data.errors?.justificacion?._errors?.[0] ||
          data.errors?.ecs_id?._errors?.[0] ||
          data.message ||
          'Error al registrar la solicitud de cambio';
        setErrorMsg(errorDetalle);
        setSubmitting(false);
        return;
      }

      router.push(`/cambios/${data.data.id}`);
    } catch {
      setErrorMsg('Error de red al comunicarse con el servidor');
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      {/* Sub-header contextual Nivel 3 */}
      <div className="bg-[#16181D] border-b border-white/10 sticky top-14 z-30">
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
                  Gestor de Cambios Secuencial (RFC)
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 uppercase tracking-wider shrink-0">
                  Rúbrica SGCS • 8 Puntos
                </span>
              </div>
              <span className="text-xs text-slate-400 block truncate">
                Flujo guiado: Caso de Uso / Actividad → Requerimiento → Objetos de Software Afectados
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-3 shadow-md animate-in fade-in">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-1 font-semibold">{errorMsg}</div>
          </div>
        )}

        {/* Banner Secuencial Explicativo del Docente */}
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-2xl p-5 text-white shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
            <Network className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-amber-300">
              Protocolo Secuencial de Gestión de Cambios (Estándar SGCS)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              La solicitud vincula el caso de uso analizado con su requerimiento y los objetos de software afectados (SRS, Arquitectura SAD, Código y Base de Datos), garantizando trazabilidad integral bidireccional.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PASO 1: Selección del Proyecto y Caso de Uso / Actividad */}
          <div className="bg-[#1A1D25] p-6 sm:p-7 rounded-2xl border border-white/10 shadow-md space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5 text-white font-bold text-sm sm:text-base">
                <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center">
                  1
                </span>
                <span>Caso de Uso o Actividad del Cronograma</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                Punto de partida del análisis
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Proyecto */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Proyecto <span className="text-amber-400">*</span>
                </label>
                {loadingProyectos ? (
                  <div className="h-10 bg-[#14161E] rounded-xl animate-pulse" />
                ) : (
                  <select
                    value={proyectoId}
                    onChange={(e) => setProyectoId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#14161E] border border-white/10 rounded-xl text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-amber-400/50 transition cursor-pointer"
                  >
                    {proyectos.map((p) => (
                      <option key={p.id} value={p.id} className="bg-[#1A1D25] text-white">
                        {p.codigo} — {p.nombre} {p.metodologia ? `(${p.metodologia})` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Actividad Cronograma */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Actividad del Cronograma
                </label>
                <select
                  value={actividadId}
                  onChange={(e) => handleActividadChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#14161E] border border-white/10 rounded-xl text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-amber-400/50 transition cursor-pointer"
                >
                  <option value="">-- Sin actividad directa vinculada --</option>
                  {actividades.map((a) => (
                    <option key={a.id} value={a.id} className="bg-[#1A1D25] text-white">
                      {a.codigo_caso_uso ? `[${a.codigo_caso_uso}] ` : ''}{a.titulo}
                    </option>
                  ))}
                </select>
              </div>

              {/* Código Caso de Uso */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Código de Caso de Uso (CU)
                </label>
                <input
                  type="text"
                  value={codigoCasoUso}
                  onChange={(e) => setCodigoCasoUso(e.target.value.toUpperCase())}
                  placeholder="Ej. CU01, CU02"
                  className="w-full px-3.5 py-2.5 bg-[#14161E] border border-white/10 rounded-xl text-xs sm:text-sm font-mono font-bold text-amber-300 uppercase focus:outline-none focus:border-amber-400/50 transition"
                />
              </div>
            </div>
          </div>

          {/* PASO 2: Asignación del Requerimiento Afectado */}
          <div className="bg-[#1A1D25] p-6 sm:p-7 rounded-2xl border border-white/10 shadow-md space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5 text-white font-bold text-sm sm:text-base">
                <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center">
                  2
                </span>
                <span>Requerimiento al que Pertenece el Cambio</span>
              </div>
              <span className="text-[11px] font-semibold text-amber-400/80">
                Análisis Funcional
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Requerimiento del Sistema (SRS) <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  value={requerimientoAfectado}
                  onChange={(e) => setRequerimientoAfectado(e.target.value)}
                  placeholder="Ej. RF-01: Control de Acceso y Sesiones Seguras"
                  className="w-full px-4 py-2.5 bg-[#14161E] border border-white/10 rounded-xl text-xs sm:text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50 transition"
                />
              </div>

              {/* Botones de sugerencia rápida */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-slate-400 text-[11px]">Sugerencias:</span>
                {[
                  'RF-01: Autenticación y Tokens JWT',
                  'RF-02: Gestión de Entregables RUP/SCRUM',
                  'RF-03: Handshake Aceptar/Rechazar Actividad',
                  'RF-04: Reporte Matriz Trazabilidad CU01',
                ].map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setRequerimientoAfectado(sug)}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] border border-white/10 transition"
                  >
                    {sug.split(':')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* PASO 3: Selección del ECS Principal y Objetos Afectados */}
          <div className="bg-[#1A1D25] p-6 sm:p-7 rounded-2xl border border-white/10 shadow-md space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5 text-white font-bold text-sm sm:text-base">
                <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center">
                  3
                </span>
                <span>Objetos de Software / ECS Afectados por el Cambio</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                Impacto en Cascada
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ECS Principal */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Elemento de Configuración Principal <span className="text-amber-400">*</span>
                </label>
                {loadingEcs ? (
                  <div className="h-10 bg-[#14161E] rounded-xl animate-pulse" />
                ) : ecsList.length === 0 ? (
                  <p className="text-xs text-amber-400 font-semibold p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
                    Sin artefactos registrados en este proyecto.
                  </p>
                ) : (
                  <select
                    value={ecsId}
                    onChange={(e) => handleEcsChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#14161E] border border-white/10 rounded-xl text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-amber-400/50 transition cursor-pointer"
                  >
                    {ecsList.map((ecs) => (
                      <option key={ecs.id} value={ecs.id} className="bg-[#1A1D25] text-white">
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
                    className="w-full px-3.5 py-2.5 bg-[#14161E] border border-white/10 rounded-xl text-xs sm:text-sm font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-400/50 transition cursor-pointer"
                  >
                    {selectedEcs.versiones.map((v) => (
                      <option key={v.id} value={v.id} className="bg-[#1A1D25] text-white">
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

            {/* Selector de Objetos Adicionales Afectados en Cascada */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                Objetos de Software Adicionales Impactados (Relación de Dependencias):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1">
                {ecsList
                  .filter((e) => e.id !== ecsId)
                  .map((e) => {
                    const isSelected = ecsAfectadosIds.includes(e.id);
                    return (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => toggleEcsAfectado(e.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                            : 'bg-[#14161E] border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border text-[10px] ${
                            isSelected
                              ? 'bg-amber-400 border-amber-400 text-slate-950 font-black'
                              : 'border-white/20'
                          }`}
                        >
                          {isSelected && '✓'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-mono text-xs font-bold text-white truncate">{e.codigo}</p>
                          <p className="text-[11px] truncate">{e.nombre}</p>
                          <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-white/10 text-slate-400 inline-block mt-0.5">
                            {e.tipo}
                          </span>
                        </div>
                      </button>
                    );
                  })}
              </div>
              <p className="text-[11px] text-slate-400">
                Seleccionados: <strong className="text-amber-300">{ecsAfectadosIds.length}</strong> objetos adicionales impactados.
              </p>
            </div>
          </div>

          {/* PASO 4: Alcance y Justificación Técnica */}
          <div className="bg-[#1A1D25] p-6 sm:p-7 rounded-2xl border border-white/10 shadow-md space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5 text-white font-bold text-sm sm:text-base">
                <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center">
                  4
                </span>
                <span>Alcance y Justificación del Cambio Solicitado</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                Sustento del Comité
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Descripción Técnica Detallada del Cambio <span className="text-amber-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describa el cambio solicitado en el caso de uso y en los objetos de software afectados..."
                  className="w-full px-4 py-2.5 bg-[#14161E] border border-white/10 rounded-xl text-xs sm:text-sm font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Justificación Operativa / de Negocio <span className="text-amber-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={justificacion}
                  onChange={(e) => setJustificacion(e.target.value)}
                  placeholder="Justifique por qué es indispensable efectuar esta modificación según el requerimiento..."
                  className="w-full px-4 py-2.5 bg-[#14161E] border border-white/10 rounded-xl text-xs sm:text-sm font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50 transition"
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
                  <span>Radicando Solicitud Secuencial...</span>
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
    </AppShell>
  );
}