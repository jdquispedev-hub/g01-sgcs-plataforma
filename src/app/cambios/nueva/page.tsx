'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const [ecsId, setEcsId] = useState('');
  const [loadingProyectos, setLoadingProyectos] = useState(true);
  const [loadingEcs, setLoadingEcs] = useState(false);

  // Campos de la RFC
  const [codigo, setCodigo] = useState('');
  const [versionBaseId, setVersionBaseId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [justificacion, setJustificacion] = useState('');

  // Estados de envío y feedback
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Cargar proyectos
  useEffect(() => {
    async function loadAux() {
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
    loadAux();
  }, []);

  // 2. Cargar ECS al cambiar proyecto
  useEffect(() => {
    if (!proyectoId) return;

    async function loadEcsDeProyecto() {
      setLoadingEcs(true);
      setErrorMsg(null);
      try {
        const res = await fetch(`/api/ecs?proyectoId=${proyectoId}`);
        const data = await res.json();
        if (data.success) {
          const items: EcsItem[] = data.data;
          setEcsList(items);

          if (items.length > 0) {
            setEcsId(items[0].id);
            if (items[0].versiones.length > 0) {
              setVersionBaseId(items[0].versiones[0].id);
            } else {
              setVersionBaseId('');
            }
          } else {
            setEcsId('');
            setVersionBaseId('');
          }

          // Generar código sugerido
          const p = proyectos.find((item) => item.id === proyectoId);
          const anio = new Date().getFullYear();
          const correlativo = String(Math.floor(Math.random() * 900) + 100);
          setCodigo(`RFC-${p?.codigo || 'PRJ'}-${anio}-${correlativo}`);
        }
      } catch (err) {
        console.error('Error al cargar ECS:', err);
      } finally {
        setLoadingEcs(false);
      }
    }

    loadEcsDeProyecto();
  }, [proyectoId, proyectos]);

  // 3. Actualizar versiones al cambiar ECS seleccionado
  const handleSelectEcs = (selectedEcsId: string) => {
    setEcsId(selectedEcsId);
    const item = ecsList.find((e) => e.id === selectedEcsId);
    if (item && item.versiones.length > 0) {
      setVersionBaseId(item.versiones[0].id);
    } else {
      setVersionBaseId('');
    }
  };

  const selectedEcs = ecsList.find((e) => e.id === ecsId);

  // 4. Enviar RFC
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!codigo.trim()) {
      setErrorMsg('El código de la Solicitud de Cambio es obligatorio');
      return;
    }
    if (!ecsId) {
      setErrorMsg('Debe seleccionar un Elemento de Configuración (ECS)');
      return;
    }
    if (!versionBaseId) {
      setErrorMsg('Debe seleccionar la versión base que sufrirá la modificación');
      return;
    }
    if (!descripcion.trim() || descripcion.trim().length < 5) {
      setErrorMsg('La descripción técnica del cambio debe tener al menos 5 caracteres');
      return;
    }
    if (!justificacion.trim() || justificacion.trim().length < 5) {
      setErrorMsg('La justificación del cambio debe tener al menos 5 caracteres');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/cambios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo: codigo.trim().toUpperCase(),
          ecs_id: ecsId,
          version_base_id: versionBaseId,
          descripcion: descripcion.trim(),
          justificacion: justificacion.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Error al radicar la Solicitud de Cambio');
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
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-upt-navy-900 text-white border-b-2 border-upt-gold shadow-lg sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
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
                <span className="font-black text-base text-white tracking-tight">
                  Radicar Solicitud de Cambio (RFC)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-upt-gold text-upt-navy-950 font-black uppercase">
                  RF-11 • Registro Formal
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Petición controlada de modificación vinculada a una versión base
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Form */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-100 border-2 border-red-300 text-red-900 text-xs sm:text-sm flex items-start gap-3 shadow-md">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
            <div className="flex-1 font-bold">{errorMsg}</div>
          </div>
        )}

        {/* Banner de Concepto: ¿Por qué radicar una RFC? */}
        <div className="bg-gradient-to-r from-upt-navy-900 to-slate-800 rounded-3xl p-5 text-white border border-upt-navy-700 shadow-md flex items-start gap-3">
          <Info className="w-5 h-5 text-upt-gold shrink-0 mt-0.5" />
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-white">Procedimiento de Cambio Controlado (RF-11):</strong> Toda propuesta de cambio debe especificar con precisión el artefacto afectado y su versión actual. Luego de radicada, el comité técnico evaluará su impacto antes de autorizar cualquier trabajo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card 1: Selección del Artefacto y Versión Base */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-300 shadow-md space-y-6">
            <div className="flex items-center gap-2 text-upt-navy-800 font-black text-base border-b border-slate-200 pb-3">
              <Layers className="w-5 h-5 text-upt-gold-600" />
              <span>1. Identificación del Artefacto y Versión Base</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Proyecto */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  Proyecto / Caso Operativo <span className="text-red-500">*</span>
                </label>
                {loadingProyectos ? (
                  <div className="h-10 bg-slate-100 rounded-2xl animate-pulse" />
                ) : (
                  <select
                    value={proyectoId}
                    onChange={(e) => setProyectoId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:border-upt-navy-700 focus:ring-4 focus:ring-upt-gold/20 transition cursor-pointer"
                  >
                    {proyectos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.codigo} — {p.nombre}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Código de la RFC */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  Código de la Solicitud <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <GitPullRequest className="w-4 h-4 absolute left-3.5 top-3.5 text-upt-gold-600" />
                  <input
                    type="text"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                    placeholder="Ej. RFC-PRJ01-2026-001"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs sm:text-sm font-mono font-black uppercase text-slate-900 focus:bg-white focus:border-upt-navy-700 focus:ring-4 focus:ring-upt-gold/20 transition"
                  />
                </div>
              </div>

              {/* Elemento de Configuración (ECS) */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  Elemento de Configuración (ECS) <span className="text-red-500">*</span>
                </label>
                {loadingEcs ? (
                  <div className="h-10 bg-slate-100 rounded-2xl animate-pulse" />
                ) : ecsList.length === 0 ? (
                  <p className="text-xs text-red-600 font-bold p-2 bg-red-50 rounded-xl">
                    Este proyecto no tiene ECS registrados aún.
                  </p>
                ) : (
                  <select
                    value={ecsId}
                    onChange={(e) => handleSelectEcs(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:border-upt-navy-700 focus:ring-4 focus:ring-upt-gold/20 transition cursor-pointer"
                  >
                    {ecsList.map((item) => (
                      <option key={item.id} value={item.id}>
                        [{item.codigo}] {item.nombre} ({item.tipo})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Versión Base a Modificar */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  Versión Base a Modificar <span className="text-red-500">*</span>
                </label>
                {selectedEcs && selectedEcs.versiones.length > 0 ? (
                  <select
                    value={versionBaseId}
                    onChange={(e) => setVersionBaseId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs sm:text-sm font-mono font-bold text-slate-900 focus:bg-white focus:border-upt-navy-700 focus:ring-4 focus:ring-upt-gold/20 transition cursor-pointer"
                  >
                    {selectedEcs.versiones.map((v) => (
                      <option key={v.id} value={v.id}>
                        v{v.numero_version} (Estado: {v.estado})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-amber-700 font-bold p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                    El ECS seleccionado no cuenta con versiones registradas.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Descripción y Justificación Técnica */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-300 shadow-md space-y-6">
            <div className="flex items-center gap-2 text-upt-navy-800 font-black text-base border-b border-slate-200 pb-3">
              <FileCheck2 className="w-5 h-5 text-upt-gold-600" />
              <span>2. Alcance y Justificación del Cambio Solicitado</span>
            </div>

            <div className="space-y-5">
              {/* Descripción */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  Descripción Técnica Detallada del Cambio <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Detalla qué partes del código, planos o especificaciones deben modificarse, agregarse o eliminarse..."
                  className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-upt-navy-700 focus:ring-4 focus:ring-upt-gold/20 transition"
                />
              </div>

              {/* Justificación */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  Justificación Operativa / de Negocio <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={justificacion}
                  onChange={(e) => setJustificacion(e.target.value)}
                  placeholder="Explica por qué es necesario este cambio (ej. Solicitud directa del cliente, corrección de bug en pasarela de pagos, ajuste normativo, etc.)..."
                  className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-upt-navy-700 focus:ring-4 focus:ring-upt-gold/20 transition"
                />
              </div>
            </div>
          </div>

          {/* Botones de Envío */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
            <Link
              href="/cambios"
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition text-center"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={submitting || !versionBaseId}
              className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-upt-gold hover:bg-upt-gold-600 text-upt-navy-950 font-black text-xs sm:text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
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
