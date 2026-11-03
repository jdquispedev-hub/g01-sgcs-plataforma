'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
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
      estado: string;
    };
    responsable: {
      id: string;
      nombre_completo: string;
      email: string;
    };
  };
  version_base: {
    id: string;
    numero_version: string;
    descripcion: string;
    archivo_url: string | null;
    estado: string;
    fecha_aprobacion: string | null;
    created_at: string;
  };
  version_resultante?: {
    id: string;
    numero_version: string;
    descripcion: string;
    archivo_url: string | null;
    estado: string;
    created_at: string;
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
    email: string;
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
      email: string;
      rol: string;
    };
  } | null;
  ecs_afectados: {
    ecs: {
      id: string;
      codigo: string;
      nombre: string;
      tipo: string;
      ubicacion: string;
      responsable: {
        id: string;
        nombre_completo: string;
      };
    };
  }[];
}

interface EcsAux {
  id: string;
  codigo: string;
  nombre: string;
  tipo: string;
  versiones: { id: string; numero_version: string; estado: string }[];
}

export default function DetalleRfcPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [solicitud, setSolicitud] = useState<SolicitudDetalle | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  // Estados del formulario de Evaluación (RF-13)
  const [impacto, setImpacto] = useState<'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO'>('MEDIO');
  const [observacionesEvaluacion, setObservacionesEvaluacion] = useState('');
  const [afectadosSeleccionados, setAfectadosSeleccionados] = useState<string[]>([]);
  const [todosEcsProyecto, setTodosEcsProyecto] = useState<EcsAux[]>([]);
  const [savingEvaluacion, setSavingEvaluacion] = useState(false);

  // Estados del formulario de Dictamen (RF-14)
  const [justificacionResolucion, setJustificacionResolucion] = useState('');
  const [savingDictamen, setSavingDictamen] = useState(false);

  // Estados del formulario de Implementación (RF-15)
  const [versionResultanteId, setVersionResultanteId] = useState('');
  const [savingImplementacion, setSavingImplementacion] = useState(false);

  // Cargar datos de la RFC y sesión
  const loadDetalle = async () => {
    try {
      const [resRfc, resMe] = await Promise.all([
        fetch(`/api/cambios/${id}`),
        fetch('/api/auth/me'),
      ]);

      const dataRfc = await resRfc.json();
      const dataMe = await resMe.json();

      if (dataMe.success) {
        setUserRole(dataMe.data.user.rol);
      }

      if (dataRfc.success) {
        const item: SolicitudDetalle = dataRfc.data;
        setSolicitud(item);

        if (item.evaluacion) {
          setImpacto(item.evaluacion.impacto);
          setObservacionesEvaluacion(item.evaluacion.observaciones);
        }
        if (item.ecs_afectados) {
          setAfectadosSeleccionados(item.ecs_afectados.map((a) => a.ecs.id));
        }

        // Cargar los demás ECS del proyecto para el selector de afectación colateral
        const resEcs = await fetch(`/api/ecs?proyectoId=${item.ecs.proyecto.id}`);
        const dataEcs = await resEcs.json();
        if (dataEcs.success) {
          setTodosEcsProyecto(dataEcs.data);
          // Si el ECS objetivo tiene versiones aprobadas para implementar, seleccionar la primera
          const target = dataEcs.data.find((e: any) => e.id === item.ecs.id);
          if (target && target.versiones.length > 0) {
            setVersionResultanteId(target.versiones[0].id);
          }
        }
      } else {
        setErrorMsg(dataRfc.message || 'Error al obtener la Solicitud de Cambio');
      }
    } catch {
      setErrorMsg('Error de red al cargar el expediente de la RFC');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadDetalle();
  }, [id]);

  // Manejador de Evaluación Técnica (RF-13)
  const handleGuardarEvaluacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEvaluacion(true);
    setErrorMsg(null);
    setFeedbackSuccess(null);

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
        setErrorMsg(data.message || 'Error al registrar la evaluación técnica');
        setSavingEvaluacion(false);
        return;
      }

      setFeedbackSuccess('Evaluación técnica de impacto guardada exitosamente.');
      loadDetalle();
    } catch {
      setErrorMsg('Error de conexión al guardar la evaluación');
    } finally {
      setSavingEvaluacion(false);
    }
  };

  // Manejador de Dictamen Formal (RF-14)
  const handleEmitirDictamen = async (decision: 'APROBADA' | 'RECHAZADA') => {
    if (!justificacionResolucion.trim()) {
      setErrorMsg('Debe escribir la justificación formal del dictamen antes de resolver');
      return;
    }

    setSavingDictamen(true);
    setErrorMsg(null);
    setFeedbackSuccess(null);

    try {
      const res = await fetch(`/api/cambios/${id}/resolver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          justificacion: justificacionResolucion.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Error al emitir el dictamen formal');
        setSavingDictamen(false);
        return;
      }

      setFeedbackSuccess(`Solicitud dictaminada formalmente como ${decision}.`);
      loadDetalle();
    } catch {
      setErrorMsg('Error de conexión al emitir el dictamen');
    } finally {
      setSavingDictamen(false);
    }
  };

  // Manejador de Implementación (RF-15)
  const handleImplementarCambio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionResultanteId) {
      setErrorMsg('Debe seleccionar la versión resultante implementada');
      return;
    }

    setSavingImplementacion(true);
    setErrorMsg(null);
    setFeedbackSuccess(null);

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

      setFeedbackSuccess('Cambio implementado formalmente y cerrado en el sistema.');
      loadDetalle();
    } catch {
      setErrorMsg('Error de conexión al registrar la implementación');
    } finally {
      setSavingImplementacion(false);
    }
  };

  const puedeDictaminar = ['SUPERADMIN', 'ADMINISTRADOR', 'APROBADOR'].includes(userRole);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <Loader2 className="w-10 h-10 animate-spin text-upt-navy-700 mx-auto" />
          <p className="text-xs font-black text-slate-700 uppercase tracking-wider">
            Cargando expediente técnico de la RFC...
          </p>
        </div>
      </div>
    );
  }

  if (errorMsg && !solicitud) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border-2 border-slate-300 max-w-md w-full text-center shadow-lg space-y-4">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
          <h2 className="text-lg font-black text-slate-900">No se pudo cargar la Solicitud</h2>
          <p className="text-xs text-slate-600">{errorMsg}</p>
          <Link
            href="/cambios"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-upt-navy-700 text-upt-gold font-bold text-xs"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a Solicitudes
          </Link>
        </div>
      </div>
    );
  }

  if (!solicitud) return null;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-upt-navy-900 text-white border-b-2 border-upt-gold shadow-lg sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/cambios"
              className="p-2 rounded-xl bg-upt-navy-800 hover:bg-upt-navy-700 text-upt-gold transition border border-upt-gold/30"
              title="Volver a Solicitudes de Cambio"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-upt-gold bg-upt-navy-800 px-2.5 py-0.5 rounded border border-upt-gold/30">
                  {solicitud.codigo}
                </span>
                <span className="font-black text-base tracking-tight truncate max-w-xs sm:max-w-md text-white">
                  {solicitud.ecs.codigo}: {solicitud.ecs.nombre}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Expediente Técnico de Gestión de Cambios (RF-11 al RF-15)
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        
        {/* Banner de Mensajes de Éxito o Error */}
        {feedbackSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-100 border-2 border-emerald-300 text-emerald-900 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{feedbackSuccess}</span>
          </div>
        )}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-100 border-2 border-red-300 text-red-900 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Timeline Visual de 4 Fases del Cambio */}
        <div className="bg-white p-6 rounded-3xl border-2 border-slate-300 shadow-md">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-4">
            Ciclo de Vida de la Solicitud (RFC)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Paso 1: Radicada */}
            <div className="p-3.5 rounded-2xl border-2 bg-emerald-50 border-emerald-300 text-emerald-950 space-y-1">
              <div className="flex items-center justify-between text-xs font-black">
                <span>1. Radicada</span>
                <Check className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-[11px] text-slate-600">Por {solicitud.solicitante.nombre_completo}</p>
            </div>

            {/* Paso 2: Evaluación Técnica */}
            <div className={`p-3.5 rounded-2xl border-2 space-y-1 ${
              solicitud.evaluacion
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-amber-50 border-amber-300 text-amber-950'
            }`}>
              <div className="flex items-center justify-between text-xs font-black">
                <span>2. Evaluación Impacto</span>
                {solicitud.evaluacion ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-600" />
                )}
              </div>
              <p className="text-[11px] text-slate-600">
                {solicitud.evaluacion ? `Impacto ${solicitud.evaluacion.impacto}` : 'Pendiente de análisis'}
              </p>
            </div>

            {/* Paso 3: Dictamen Formal */}
            <div className={`p-3.5 rounded-2xl border-2 space-y-1 ${
              solicitud.estado === 'APROBADA' || solicitud.estado === 'IMPLEMENTADA'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : solicitud.estado === 'RECHAZADA'
                ? 'bg-red-50 border-red-300 text-red-950'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}>
              <div className="flex items-center justify-between text-xs font-black">
                <span>3. Dictamen Comité</span>
                {solicitud.estado === 'APROBADA' || solicitud.estado === 'IMPLEMENTADA' ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : solicitud.estado === 'RECHAZADA' ? (
                  <X className="w-4 h-4 text-red-600" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <p className="text-[11px] text-slate-600">
                {solicitud.estado === 'APROBADA' || solicitud.estado === 'IMPLEMENTADA'
                  ? 'Aprobada formalmente'
                  : solicitud.estado === 'RECHAZADA'
                  ? 'Rechazada'
                  : 'En espera de dictamen'}
              </p>
            </div>

            {/* Paso 4: Implementación */}
            <div className={`p-3.5 rounded-2xl border-2 space-y-1 ${
              solicitud.estado === 'IMPLEMENTADA'
                ? 'bg-purple-50 border-purple-300 text-purple-950'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}>
              <div className="flex items-center justify-between text-xs font-black">
                <span>4. Implementación</span>
                {solicitud.estado === 'IMPLEMENTADA' ? (
                  <Check className="w-4 h-4 text-purple-600" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <p className="text-[11px] text-slate-600">
                {solicitud.estado === 'IMPLEMENTADA'
                  ? `Cerrada en v${solicitud.version_resultante?.numero_version}`
                  : 'Pendiente de versión final'}
              </p>
            </div>
          </div>
        </div>

        {/* Ficha Principal de la RFC */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-300 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="font-mono text-sm font-black text-upt-navy-900 bg-upt-navy-50 px-3 py-1 rounded-xl border border-upt-navy-200 flex items-center gap-1.5">
                  <GitPullRequest className="w-4 h-4 text-upt-gold-600" />
                  {solicitud.codigo}
                </span>
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                  Proyecto: {solicitud.ecs.proyecto.codigo}
                </span>
              </div>
              <h1 className="text-xl font-black text-slate-900">
                Cambio sobre Artefacto: {solicitud.ecs.codigo} — {solicitud.ecs.nombre}
              </h1>
              <span className="text-xs text-slate-500 font-mono mt-0.5 block">
                Ubicación: {solicitud.ecs.ubicacion}
              </span>
            </div>

            {/* Versión Base Congelada */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs shrink-0 text-center sm:w-48">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                Versión Base Afectada
              </span>
              <span className="font-mono font-black text-base text-upt-navy-900">
                v{solicitud.version_base.numero_version}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">
                Estado: {solicitud.version_base.estado}
              </span>
            </div>
          </div>

          {/* Alcance y Justificación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                Descripción Técnica del Cambio
              </span>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                {solicitud.descripcion}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                Justificación Operativa / Negocio
              </span>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                {solicitud.justificacion}
              </p>
            </div>
          </div>

          {/* Metadatos de Autoría */}
          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-600">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Radicada Por</span>
              <span className="font-bold text-slate-800">{solicitud.solicitante.nombre_completo}</span> ({solicitud.solicitante.rol})
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Fecha de Registro</span>
              <span className="font-bold text-slate-800">
                {new Date(solicitud.created_at).toLocaleString('es-PE')}
              </span>
            </div>
          </div>
        </div>

        {/* Sección 2: Evaluación Técnica de Impacto (RF-13) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-300 shadow-md space-y-6">
          <div className="flex items-center gap-2 text-upt-navy-800 font-black text-base border-b border-slate-200 pb-3">
            <Activity className="w-5 h-5 text-sky-600" />
            <span>Evaluación Técnica de Impacto y ECS Afectados (RF-13)</span>
          </div>

          {solicitud.evaluacion ? (
            /* Vista de Evaluación ya Registrada */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-sky-50/60 p-4 rounded-2xl border border-sky-200 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-sky-800 uppercase block mb-1">Nivel de Impacto</span>
                  <span className={`text-xs font-black px-3 py-1 rounded-lg uppercase inline-block ${
                    solicitud.evaluacion.impacto === 'CRITICO' ? 'bg-red-600 text-white' :
                    solicitud.evaluacion.impacto === 'ALTO' ? 'bg-orange-600 text-white' :
                    solicitud.evaluacion.impacto === 'MEDIO' ? 'bg-amber-500 text-white' :
                    'bg-blue-600 text-white'
                  }`}>
                    {solicitud.evaluacion.impacto}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-sky-800 uppercase block mb-1">Evaluador Técnico</span>
                  <span className="font-bold text-slate-900">{solicitud.evaluacion.evaluador.nombre_completo}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-sky-800 uppercase block mb-1">Fecha de Dictamen de Impacto</span>
                  <span className="font-bold text-slate-900">{new Date(solicitud.evaluacion.created_at).toLocaleDateString('es-PE')}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-black text-slate-800 block mb-1">Observaciones Técnicas:</span>
                <p className="text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200 leading-relaxed font-medium">
                  {solicitud.evaluacion.observaciones}
                </p>
              </div>

              {/* ECS Afectados */}
              <div>
                <span className="text-xs font-black text-slate-800 block mb-2">
                  Artefactos Afectados Colateralmente ({solicitud.ecs_afectados.length}):
                </span>
                {solicitud.ecs_afectados.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No se identificaron afectaciones colaterales en otros ECS.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {solicitud.ecs_afectados.map((item) => (
                      <div key={item.ecs.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                        <div>
                          <span className="font-mono font-bold text-upt-navy-800 block">{item.ecs.codigo}</span>
                          <span className="text-slate-700 font-semibold">{item.ecs.nombre}</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
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
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-900 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <p>
                  Como Especialista Técnico o Administrador, debes clasificar el impacto y verificar si este cambio afecta colateralmente a otros artefactos del proyecto.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Nivel de Impacto Técnico <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={impacto}
                    onChange={(e: any) => setImpacto(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-upt-navy-700 transition"
                  >
                    <option value="BAJO">Bajo (Cambio cosmético o de documentación)</option>
                    <option value="MEDIO">Medio (Ajuste menor de lógica sin afectar contratos)</option>
                    <option value="ALTO">Alto (Modificación de esquemas de BD, contratos o planos)</option>
                    <option value="CRITICO">Crítico (Afectación arquitectónica central o seguridad)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Observaciones Técnicas y Justificación del Impacto <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={observacionesEvaluacion}
                  onChange={(e) => setObservacionesEvaluacion(e.target.value)}
                  placeholder="Detalla qué componentes colaterales sufrirán modificaciones y si se requiere prueba de regresión..."
                  className="w-full px-4 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-upt-navy-700 transition"
                />
              </div>

              {/* Selector de ECS colaterales */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  Seleccionar Artefactos Afectados Colateralmente (Opcional):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  {todosEcsProyecto
                    .filter((e) => e.id !== solicitud.ecs.id)
                    .map((item) => {
                      const isChecked = afectadosSeleccionados.includes(item.id);
                      return (
                        <label key={item.id} className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 text-xs cursor-pointer hover:bg-slate-100 transition">
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
                            className="rounded text-upt-navy-700"
                          />
                          <span className="font-mono font-bold text-upt-navy-800">{item.codigo}:</span>
                          <span className="truncate text-slate-700 font-semibold">{item.nombre}</span>
                        </label>
                      );
                    })}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingEvaluacion}
                  className="px-5 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-black text-xs shadow-md transition flex items-center gap-2"
                >
                  {savingEvaluacion ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                  <span>Guardar Evaluación Técnica de Impacto</span>
                </button>
              </div>
            </form>
          ) : (
            <p className="text-xs text-amber-700 font-bold bg-amber-50 p-4 rounded-xl border border-amber-200">
              Esta solicitud está en espera de que un Especialista Técnico o Administrador registre su evaluación de impacto.
            </p>
          )}
        </div>

        {/* Sección 3: Dictamen Formal del Comité (RF-14) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-300 shadow-md space-y-6">
          <div className="flex items-center gap-2 text-upt-navy-800 font-black text-base border-b border-slate-200 pb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Dictamen Formal del Comité / Aprobador (RF-14)</span>
          </div>

          {solicitud.resolutor ? (
            /* Dictamen ya emitido */
            <div className={`p-5 rounded-2xl border-2 space-y-3 ${
              solicitud.estado === 'APROBADA' || solicitud.estado === 'IMPLEMENTADA'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-red-50 border-red-300 text-red-950'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-black uppercase flex items-center gap-2">
                  {solicitud.estado === 'APROBADA' || solicitud.estado === 'IMPLEMENTADA' ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>Dictamen Favorable: SOLICITUD APROBADA</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span>Dictamen Desfavorable: SOLICITUD RECHAZADA</span>
                    </>
                  )}
                </span>
                <span className="text-xs font-semibold text-slate-600">
                  {solicitud.fecha_resolucion && new Date(solicitud.fecha_resolucion).toLocaleString('es-PE')}
                </span>
              </div>

              <div>
                <span className="text-xs font-black block mb-0.5">Justificación de la Resolución:</span>
                <p className="text-xs leading-relaxed bg-white/80 p-3 rounded-xl border border-slate-200">
                  {solicitud.resolucion_justificacion}
                </p>
              </div>

              <span className="text-[11px] font-bold text-slate-600 block">
                Dictaminado formalmente por: {solicitud.resolutor.nombre_completo} ({solicitud.resolutor.rol})
              </span>
            </div>
          ) : puedeDictaminar ? (
            /* Formulario para emitir dictamen */
            <div className="space-y-4">
              <p className="text-xs text-slate-700 font-medium">
                Como responsable de aprobación, debes emitir una resolución formal sustentada para autorizar o denegar este cambio técnico.
              </p>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Justificación Técnica del Dictamen <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={justificacionResolucion}
                  onChange={(e) => setJustificacionResolucion(e.target.value)}
                  placeholder="Explica la decisión (ej. Se autoriza la modificación del schema para soportar Stripe; o se rechaza por comprometer el sprint actual)..."
                  className="w-full px-4 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-upt-navy-700 transition"
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={savingDictamen}
                  onClick={() => handleEmitirDictamen('RECHAZADA')}
                  className="px-5 py-2.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-800 font-black text-xs border border-red-300 transition flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span>Rechazar Cambio</span>
                </button>
                <button
                  type="button"
                  disabled={savingDictamen}
                  onClick={() => handleEmitirDictamen('APROBADA')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Aprobar Solicitud (RFC)</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">
              Pendiente de resolución por parte del Responsable de Aprobación.
            </p>
          )}
        </div>

        {/* Sección 4: Registro de Implementación (RF-15) */}
        {(solicitud.estado === 'APROBADA' || solicitud.estado === 'IMPLEMENTADA') && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-300 shadow-md space-y-6">
            <div className="flex items-center gap-2 text-upt-navy-800 font-black text-base border-b border-slate-200 pb-3">
              <GitCommit className="w-5 h-5 text-purple-600" />
              <span>Implementación y Cierre del Cambio (RF-15)</span>
            </div>

            {solicitud.estado === 'IMPLEMENTADA' ? (
              <div className="bg-purple-50 border-2 border-purple-300 p-5 rounded-2xl text-purple-950 space-y-2">
                <div className="flex items-center gap-2 font-black text-sm text-purple-900">
                  <CheckCircle2 className="w-5 h-5 text-purple-600" />
                  <span>Cambio Implementado en Versión Resultante v{solicitud.version_resultante?.numero_version}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {solicitud.version_resultante?.descripcion}
                </p>
                <span className="text-[11px] text-slate-500 block pt-1">
                  Fecha de Cierre: {solicitud.fecha_implementacion && new Date(solicitud.fecha_implementacion).toLocaleString('es-PE')}
                </span>
              </div>
            ) : puedeDictaminar ? (
              <form onSubmit={handleImplementarCambio} className="space-y-4">
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  El cambio ha sido <strong>APROBADO</strong>. Una vez que el equipo de desarrollo haya subido la versión con las modificaciones implementadas al catálogo del ECS, selecciónala aquí para cerrar el ciclo formal.
                </p>

                <div className="max-w-md">
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Seleccionar Versión Resultante del ECS <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={versionResultanteId}
                    onChange={(e) => setVersionResultanteId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-upt-navy-700 transition"
                  >
                    {todosEcsProyecto
                      .find((e) => e.id === solicitud.ecs.id)
                      ?.versiones.map((v) => (
                        <option key={v.id} value={v.id}>
                          v{v.numero_version} (Estado: {v.estado})
                        </option>
                      ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={savingImplementacion || !versionResultanteId}
                  className="px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-black text-xs shadow-md transition flex items-center gap-2"
                >
                  {savingImplementacion ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitCommit className="w-4 h-4" />}
                  <span>Cerrar e Implementar Cambio (RF-15)</span>
                </button>
              </form>
            ) : (
              <p className="text-xs text-slate-500 italic">
                En proceso de implementación por el equipo de desarrollo.
              </p>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
