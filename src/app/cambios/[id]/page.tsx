'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getTerminologia } from '@/lib/terminologia';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  GitPullRequest,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  GitCommit,
  AlertTriangle,
  FolderGit2,
  Layers,
  FileCheck2,
  Calendar,
  User,
  ExternalLink,
  Loader2,
  Info,
  Check,
  X,
  FileText,
  AlertCircle,
} from 'lucide-react';
import NavbarPrincipal from '@/components/NavbarPrincipal';

interface SolicitudDetalle {
  id: string;
  codigo: string;
  descripcion: string;
  justificacion: string;
  estado: 'PENDIENTE_EVALUACION' | 'EN_EVALUACION' | 'APROBADA' | 'RECHAZADA' | 'IMPLEMENTADA';
  resolucion_justificacion?: string | null;
  fecha_resolucion?: string | null;
  fecha_implementacion?: string | null;
  created_at: string;
  ecs: {
    id: string;
    codigo: string;
    nombre: string;
    tipo: string;
    ubicacion: string;
    proyecto: {
      id: string;
      codigo: string;
      nombre: string;
    };
  };
  version_base: {
    id: string;
    numero_version: string;
    estado: string;
  };
  version_resultante?: {
    id: string;
    numero_version: string;
    descripcion: string;
  } | null;
  solicitante: {
    id: string;
    nombre_completo: string;
    email: string;
    rol: string;
  };
  resolutor?: {
    id: string;
    nombre_completo: string;
    rol: string;
  } | null;
  evaluacion?: {
    id: string;
    impacto: 'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO';
    observaciones: string;
    created_at: string;
    evaluador: {
      id: string;
      nombre_completo: string;
    };
  } | null;
  ecs_afectados: {
    ecs: {
      id: string;
      codigo: string;
      nombre: string;
      tipo: string;
    };
  }[];
}

export default function DetalleRfcPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [solicitud, setSolicitud] = useState<SolicitudDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  // Rol del usuario actual
  const [userRole, setUserRole] = useState<string>('');
  const [rubro, setRubro] = useState<string>('CONSTRUCCION');

  // Formulario Evaluación de Impacto (RF-13)
  const [impacto, setImpacto] = useState<'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO'>('MEDIO');
  const [observacionesEvaluacion, setObservacionesEvaluacion] = useState('');
  const [todosEcsProyecto, setTodosEcsProyecto] = useState<{ id: string; codigo: string; nombre: string; tipo: string; versiones: any[] }[]>([]);
  const [afectadosSeleccionados, setAfectadosSeleccionados] = useState<string[]>([]);
  const [savingEvaluacion, setSavingEvaluacion] = useState(false);

  // Formulario Dictamen del Comité (RF-14)
  const [justificacionResolucion, setJustificacionResolucion] = useState('');
  const [savingDictamen, setSavingDictamen] = useState(false);

  // Formulario Implementación del Cambio (RF-15)
  const [versionResultanteId, setVersionResultanteId] = useState('');
  const [savingImplementacion, setSavingImplementacion] = useState(false);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const [resSol, resMe] = await Promise.all([
        fetch(`/api/cambios/${id}`),
        fetch('/api/auth/me'),
      ]);

      const dataSol = await resSol.json();
      const dataMe = await resMe.json();

      if (dataMe.success) {
        setUserRole(dataMe.data.user.rol);
        if (dataMe.data.user.rubro) setRubro(dataMe.data.user.rubro);
      }

      if (dataSol.success) {
        setSolicitud(dataSol.data);

        // Cargar todos los ECS del proyecto para selector de colaterales
        const resEcs = await fetch(`/api/ecs?proyectoId=${dataSol.data.ecs.proyecto.id}`);
        const dataEcs = await resEcs.json();
        if (dataEcs.success) {
          setTodosEcsProyecto(dataEcs.data);
          const ecsPrincipal = dataEcs.data.find((e: any) => e.id === dataSol.data.ecs.id);
          if (ecsPrincipal && ecsPrincipal.versiones.length > 0) {
            setVersionResultanteId(ecsPrincipal.versiones[ecsPrincipal.versiones.length - 1].id);
          }
        }
      } else {
        setErrorMsg(dataSol.message || 'No se pudo cargar la RFC');
      }
    } catch (err) {
      console.error('Error al cargar solicitud:', err);
      setErrorMsg('Error de red al consultar la RFC');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // Manejador Guardar Evaluación de Impacto (RF-13)
  const handleGuardarEvaluacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEvaluacion(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/cambios/${id}/evaluar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          impacto,
          observaciones: observacionesEvaluacion.trim(),
          ecs_afectados_ids: afectadosSeleccionados,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Error al guardar la evaluación');
        setSavingEvaluacion(false);
        return;
      }

      setFeedbackSuccess('Evaluación técnica de impacto guardada exitosamente');
      loadData();
    } catch {
      setErrorMsg('Error de conexión al guardar la evaluación');
    } finally {
      setSavingEvaluacion(false);
    }
  };

  // Manejador Emitir Dictamen Formal (RF-14: APROBADA / RECHAZADA)
  const handleEmitirDictamen = async (estado: 'APROBADA' | 'RECHAZADA') => {
    if (!justificacionResolucion.trim() || justificacionResolucion.trim().length < 5) {
      setErrorMsg('Debe ingresar una justificación detallada para el dictamen formal');
      return;
    }

    setSavingDictamen(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/cambios/${id}/resolver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado,
          resolucion_justificacion: justificacionResolucion.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Error al emitir el dictamen');
        setSavingDictamen(false);
        return;
      }

      setFeedbackSuccess(`Solicitud dictaminada formalmente como: ${estado}`);
      setJustificacionResolucion('');
      loadData();
    } catch {
      setErrorMsg('Error de conexión al emitir el dictamen');
    } finally {
      setSavingDictamen(false);
    }
  };

  // Manejador Implementar Cambio (RF-15)
  const handleImplementarCambio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionResultanteId) {
      setErrorMsg('Seleccione la versión resultante del catálogo del ECS');
      return;
    }

    setSavingImplementacion(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/cambios/${id}/implementar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version_resultante_id: versionResultanteId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Error al registrar la implementación');
        setSavingImplementacion(false);
        return;
      }

      setFeedbackSuccess('Cambio implementado y cerrado exitosamente en el catálogo');
      loadData();
    } catch {
      setErrorMsg('Error de conexión al registrar implementación');
    } finally {
      setSavingImplementacion(false);
    }
  };

  const puedeDictaminar = ['SUPERADMIN', 'ADMINISTRADOR', 'APROBADOR'].includes(userRole);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070D18] flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <Loader2 className="w-10 h-10 animate-spin text-amber-400 mx-auto" />
          <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Cargando expediente técnico de la RFC...
          </p>
        </div>
      </div>
    );
  }

  if (errorMsg && !solicitud) {
    return (
      <div className="min-h-screen bg-[#070D18] flex items-center justify-center p-4">
        <div className="bg-[#0C1527] p-8 rounded-2xl border border-white/10 max-w-md w-full text-center shadow-lg space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">No se pudo cargar la Solicitud</h2>
          <p className="text-xs text-slate-400">{errorMsg}</p>
          <Link
            href="/cambios"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-upt-gold to-amber-400 text-slate-950 font-bold text-xs"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a Solicitudes
          </Link>
        </div>
      </div>
    );
  }

  if (!solicitud) return null;

  const terminologia = getTerminologia(rubro);

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 flex flex-col antialiased">
      {/* Navbar Global Unificado */}
      <NavbarPrincipal />

      {/* Sub-header contextual */}
      <div className="bg-[#0B1528] border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
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
                <span className="font-mono text-xs font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 shrink-0">
                  {solicitud.codigo}
                </span>
                <span className="font-bold text-xs sm:text-base tracking-tight truncate text-white">
                  {solicitud.ecs.codigo}: {solicitud.ecs.nombre}
                </span>
              </div>
              <span className="text-xs text-slate-400 block truncate">
                Expediente Técnico de Gestión de Cambios (RF-11 al RF-15)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        
        {/* Banner de Mensajes de Éxito o Error */}
        {feedbackSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{feedbackSuccess}</span>
          </div>
        )}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Timeline Visual de 4 Fases del Cambio */}
        <div className="bg-[#0C1527] p-6 rounded-2xl border border-white/10 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-4">
            Ciclo de Vida de la Solicitud (RFC)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Paso 1: Radicada */}
            <div className="p-3.5 rounded-xl border bg-emerald-500/15 border-emerald-500/30 text-emerald-300 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span>1. Radicada</span>
                <Check className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-300">Por {solicitud.solicitante.nombre_completo}</p>
            </div>

            {/* Paso 2: Evaluación Técnica */}
            <div className={`p-3.5 rounded-xl border space-y-1 ${
              solicitud.evaluacion
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
            }`}>
              <div className="flex items-center justify-between text-xs font-bold">
                <span>2. Evaluación Impacto</span>
                {solicitud.evaluacion ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-400" />
                )}
              </div>
              <p className="text-[11px] text-slate-300">
                {solicitud.evaluacion ? `Impacto ${solicitud.evaluacion.impacto}` : 'Pendiente de análisis'}
              </p>
            </div>

            {/* Paso 3: Dictamen Formal */}
            <div className={`p-3.5 rounded-xl border space-y-1 ${
              solicitud.estado === 'APROBADA' || solicitud.estado === 'IMPLEMENTADA'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                : solicitud.estado === 'RECHAZADA'
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                : 'bg-[#070D18] border-white/10 text-slate-400'
            }`}>
              <div className="flex items-center justify-between text-xs font-bold">
                <span>3. Dictamen Comité</span>
                {solicitud.estado === 'APROBADA' || solicitud.estado === 'IMPLEMENTADA' ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : solicitud.estado === 'RECHAZADA' ? (
                  <X className="w-4 h-4 text-rose-400" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-500" />
                )}
              </div>
              <p className="text-[11px] text-slate-300">
                {solicitud.estado === 'APROBADA' || solicitud.estado === 'IMPLEMENTADA'
                  ? 'Aprobada formalmente'
                  : solicitud.estado === 'RECHAZADA'
                  ? 'Rechazada'
                  : 'En espera de dictamen'}
              </p>
            </div>

            {/* Paso 4: Implementación */}
            <div className={`p-3.5 rounded-xl border space-y-1 ${
              solicitud.estado === 'IMPLEMENTADA'
                ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'
                : 'bg-[#070D18] border-white/10 text-slate-400'
            }`}>
              <div className="flex items-center justify-between text-xs font-bold">
                <span>4. Implementación</span>
                {solicitud.estado === 'IMPLEMENTADA' ? (
                  <Check className="w-4 h-4 text-purple-400" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-500" />
                )}
              </div>
              <p className="text-[11px] text-slate-300">
                {solicitud.estado === 'IMPLEMENTADA'
                  ? `Cerrada en v${solicitud.version_resultante?.numero_version}`
                  : 'Pendiente de versión final'}
              </p>
            </div>
          </div>
        </div>

        {/* Ficha Principal de la RFC */}
        <div className="bg-[#0C1527] rounded-2xl p-6 sm:p-8 border border-white/10 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="font-mono text-sm font-bold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20 flex items-center gap-1.5">
                  <GitPullRequest className="w-4 h-4 text-amber-400" />
                  {solicitud.codigo}
                </span>
                <span className="text-xs font-semibold text-slate-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                  Proyecto: {solicitud.ecs.proyecto.codigo}
                </span>
              </div>
              <h1 className="text-xl font-bold text-white">
                Cambio sobre Artefacto: {solicitud.ecs.codigo} — {solicitud.ecs.nombre}
              </h1>
              <span className="text-xs text-slate-400 font-mono mt-0.5 block">
                Ubicación: {solicitud.ecs.ubicacion}
              </span>
            </div>

            {/* Versión Base Congelada */}
            <div className="bg-[#070D18] p-3.5 rounded-xl border border-white/10 text-xs shrink-0 text-center sm:w-48">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                Versión Base Afectada
              </span>
              <span className="font-mono font-bold text-base text-amber-300">
                v{solicitud.version_base.numero_version}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                Estado: {solicitud.version_base.estado}
              </span>
            </div>
          </div>

          {/* Alcance y Justificación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#070D18] p-5 rounded-xl border border-white/10">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Descripción Técnica del Cambio
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {solicitud.descripcion}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Justificación Operativa / Negocio
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {solicitud.justificacion}
              </p>
            </div>
          </div>

          {/* Metadatos de Autoría */}
          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-400">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Radicada Por</span>
              <span className="font-bold text-white">{solicitud.solicitante.nombre_completo}</span> ({solicitud.solicitante.rol})
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Fecha de Registro</span>
              <span className="font-bold text-white">
                {new Date(solicitud.created_at).toLocaleString('es-PE')}
              </span>
            </div>
          </div>
        </div>

        {/* Sección 2: Evaluación Técnica de Impacto (RF-13) */}
        <div className="bg-[#0C1527] rounded-2xl p-6 sm:p-8 border border-white/10 shadow-md space-y-6">
          <div className="flex items-center gap-2 text-white font-bold text-base border-b border-white/10 pb-3">
            <Activity className="w-5 h-5 text-sky-400" />
            <span>Evaluación Técnica de Impacto y ECS Afectados (RF-13)</span>
          </div>

          {solicitud.evaluacion ? (
            /* Vista de Evaluación ya Registrada */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#070D18] p-4 rounded-xl border border-white/10 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nivel de Impacto</span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-lg uppercase inline-block ${
                    solicitud.evaluacion.impacto === 'CRITICO' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                    solicitud.evaluacion.impacto === 'ALTO' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' :
                    solicitud.evaluacion.impacto === 'MEDIO' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                    'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  }`}>
                    {solicitud.evaluacion.impacto}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Evaluador Técnico</span>
                  <span className="font-bold text-white">{solicitud.evaluacion.evaluador.nombre_completo}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Fecha de Dictamen de Impacto</span>
                  <span className="font-bold text-white">{new Date(solicitud.evaluacion.created_at).toLocaleDateString('es-PE')}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-white block mb-1">Observaciones Técnicas:</span>
                <p className="text-xs text-slate-300 bg-[#070D18] p-4 rounded-xl border border-white/10 leading-relaxed font-medium">
                  {solicitud.evaluacion.observaciones}
                </p>
              </div>

              {/* ECS Afectados */}
              <div>
                <span className="text-xs font-bold text-white block mb-2">
                  Artefactos Afectados Colateralmente ({solicitud.ecs_afectados.length}):
                </span>
                {solicitud.ecs_afectados.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No se identificaron afectaciones colaterales en otros ECS.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {solicitud.ecs_afectados.map((item) => (
                      <div key={item.ecs.id} className="p-3 bg-[#070D18] rounded-xl border border-white/10 text-xs flex items-center justify-between">
                        <div>
                          <span className="font-mono font-bold text-amber-300 block">{item.ecs.codigo}</span>
                          <span className="text-slate-200 font-semibold">{item.ecs.nombre}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                          {item.ecs.tipo}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : puedeDictaminar ? (
            /* Formulario para que el especialista evalúe */
            <form onSubmit={handleGuardarEvaluacion} className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl text-xs text-amber-300 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <p>
                  Como Especialista Técnico o Administrador, debes clasificar el impacto y verificar si este cambio afecta colateralmente a otros artefactos del proyecto.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Nivel de Impacto Técnico <span className="text-amber-400">*</span>
                  </label>
                  <select
                    value={impacto}
                    onChange={(e: any) => setImpacto(e.target.value)}
                    className="w-full px-4 py-2 bg-[#070D18] border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-amber-400/50 transition cursor-pointer"
                  >
                    <option value="BAJO" className="bg-[#0C1527]">Bajo (Cambio cosmético o de documentación)</option>
                    <option value="MEDIO" className="bg-[#0C1527]">Medio (Ajuste menor de lógica sin afectar contratos)</option>
                    <option value="ALTO" className="bg-[#0C1527]">Alto (Modificación de esquemas de BD, contratos o planos)</option>
                    <option value="CRITICO" className="bg-[#0C1527]">Crítico (Afectación arquitectónica central o seguridad)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Observaciones Técnicas y Justificación del Impacto <span className="text-amber-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={observacionesEvaluacion}
                  onChange={(e) => setObservacionesEvaluacion(e.target.value)}
                  placeholder="Detalla qué componentes colaterales sufrirán modificaciones y si se requiere prueba de regresión..."
                  className="w-full px-4 py-2 bg-[#070D18] border border-white/10 rounded-xl text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50 transition"
                />
              </div>

              {/* Selector de ECS colaterales */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Seleccionar Artefactos Afectados Colateralmente (Opcional):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-[#070D18] border border-white/10 rounded-xl">
                  {todosEcsProyecto
                    .filter((e) => e.id !== solicitud.ecs.id)
                    .map((item) => {
                      const isChecked = afectadosSeleccionados.includes(item.id);
                      return (
                        <label key={item.id} className="flex items-center gap-2 p-2 rounded-lg bg-[#0C1527] border border-white/10 text-xs cursor-pointer hover:bg-white/5 transition">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setAfectadosSeleccionados(afectadosSeleccionados.filter((id) => id !== item.id));
                              } else {
                                setAfectadosSeleccionados([...afectadosSeleccionados, item.id]);
                              }
                            }}
                            className="rounded text-amber-500 bg-[#070D18] border-white/20"
                          />
                          <span className="font-mono font-bold text-amber-300">{item.codigo}:</span>
                          <span className="truncate text-slate-200 font-semibold">{item.nombre}</span>
                        </label>
                      );
                    })}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingEvaluacion}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 hover:brightness-110 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                >
                  {savingEvaluacion ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                  <span>Guardar Evaluación Técnica de Impacto</span>
                </button>
              </div>
            </form>
          ) : (
            <p className="text-xs text-amber-400 font-semibold bg-amber-500/10 p-4 rounded-xl border border-amber-500/20">
              Esta solicitud está en espera de que un Especialista Técnico o Administrador registre su evaluación de impacto.
            </p>
          )}
        </div>

        {/* Sección 3: Dictamen Formal del Comité (RF-14) */}
        <div className="bg-[#0C1527] rounded-2xl p-6 sm:p-8 border border-white/10 shadow-md space-y-6">
          <div className="flex items-center gap-2 text-white font-bold text-base border-b border-white/10 pb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Dictamen Formal del Comité / Aprobador (RF-14)</span>
          </div>

          {solicitud.resolutor ? (
            /* Dictamen ya emitido */
            <div className={`p-5 rounded-xl border space-y-3 ${
              solicitud.estado === 'APROBADA' || solicitud.estado === 'IMPLEMENTADA'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold uppercase flex items-center gap-2">
                  {solicitud.estado === 'APROBADA' || solicitud.estado === 'IMPLEMENTADA' ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>Dictamen Favorable: SOLICITUD APROBADA</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-rose-400" />
                      <span>Dictamen Desfavorable: SOLICITUD RECHAZADA</span>
                    </>
                  )}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {solicitud.fecha_resolucion && new Date(solicitud.fecha_resolucion).toLocaleString('es-PE')}
                </span>
              </div>

              <div>
                <span className="text-xs font-bold block mb-0.5">Justificación de la Resolución:</span>
                <p className="text-xs leading-relaxed bg-[#070D18] p-3 rounded-xl border border-white/10 text-slate-200">
                  {solicitud.resolucion_justificacion}
                </p>
              </div>

              <span className="text-[11px] font-semibold text-slate-400 block">
                Dictaminado formalmente por: {solicitud.resolutor.nombre_completo} ({solicitud.resolutor.rol})
              </span>
            </div>
          ) : puedeDictaminar ? (
            /* Formulario para emitir dictamen */
            <div className="space-y-4">
              <p className="text-xs text-slate-300 font-medium">
                Como responsable de aprobación, debes emitir una resolución formal sustentada para autorizar o denegar este cambio técnico.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Justificación Técnica del Dictamen <span className="text-amber-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={justificacionResolucion}
                  onChange={(e) => setJustificacionResolucion(e.target.value)}
                  placeholder={`Ej. ${terminologia.cambioEjemploResolucion}`}
                  className="w-full px-4 py-2 bg-[#070D18] border border-white/10 rounded-xl text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50 transition"
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={savingDictamen}
                  onClick={() => handleEmitirDictamen('RECHAZADA')}
                  className="px-5 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs border border-rose-500/40 transition flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>Rechazar Cambio</span>
                </button>
                <button
                  type="button"
                  disabled={savingDictamen}
                  onClick={() => handleEmitirDictamen('APROBADA')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Aprobar Solicitud (RFC)</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              Pendiente de resolución por parte del Responsable de Aprobación.
            </p>
          )}
        </div>

        {/* Sección 4: Registro de Implementación (RF-15) */}
        {(solicitud.estado === 'APROBADA' || solicitud.estado === 'IMPLEMENTADA') && (
          <div className="bg-[#0C1527] rounded-2xl p-6 sm:p-8 border border-white/10 shadow-md space-y-6">
            <div className="flex items-center gap-2 text-white font-bold text-base border-b border-white/10 pb-3">
              <GitCommit className="w-5 h-5 text-purple-400" />
              <span>Implementación y Cierre del Cambio (RF-15)</span>
            </div>

            {solicitud.estado === 'IMPLEMENTADA' ? (
              <div className="bg-purple-500/15 border border-purple-500/30 p-5 rounded-xl text-purple-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-purple-300">
                  <CheckCircle2 className="w-5 h-5 text-purple-400" />
                  <span>Cambio Implementado en Versión Resultante v{solicitud.version_resultante?.numero_version}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {solicitud.version_resultante?.descripcion}
                </p>
                <span className="text-[11px] text-slate-400 block pt-1">
                  Fecha de Cierre: {solicitud.fecha_implementacion && new Date(solicitud.fecha_implementacion).toLocaleString('es-PE')}
                </span>
              </div>
            ) : puedeDictaminar ? (
              <form onSubmit={handleImplementarCambio} className="space-y-4">
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  El cambio ha sido <strong>APROBADO</strong>. Una vez que el equipo de desarrollo haya subido la versión con las modificaciones implementadas al catálogo del ECS, selecciónala aquí para cerrar el ciclo formal.
                </p>

                <div className="max-w-md">
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Seleccionar Versión Resultante del ECS <span className="text-amber-400">*</span>
                  </label>
                  <select
                    value={versionResultanteId}
                    onChange={(e) => setVersionResultanteId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#070D18] border border-white/10 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400/50 transition cursor-pointer"
                  >
                    {todosEcsProyecto
                      .find((e) => e.id === solicitud.ecs.id)
                      ?.versiones.map((v) => (
                        <option key={v.id} value={v.id} className="bg-[#0C1527] text-white">
                          v{v.numero_version} (Estado: {v.estado})
                        </option>
                      ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={savingImplementacion || !versionResultanteId}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                >
                  {savingImplementacion ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitCommit className="w-4 h-4" />}
                  <span>Cerrar e Implementar Cambio (RF-15)</span>
                </button>
              </form>
            ) : (
              <p className="text-xs text-slate-400 italic">
                En proceso de implementación por el equipo de desarrollo.
              </p>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
