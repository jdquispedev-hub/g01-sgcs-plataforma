'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  X,
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  FolderGit2,
  Tag,
  Sparkles,
  GitCommit,
  Copy,
  Check,
  FileText,
  Code2,
  Layers,
  FileSpreadsheet,
  GitPullRequest,
  Loader2,
} from 'lucide-react';
import { useSgcsTheme } from '@/components/ThemeProvider';

export interface SlideOverItem {
  id: string;
  codigo: string;
  nombre: string;
  tipo: string;
  descripcion: string | null;
  ubicacion: string;
  proyecto?: { id: string; codigo: string; nombre: string };
  responsable?: { id: string; nombre_completo: string; email: string };
  versiones?: { id: string; numero_version: string; estado: string; created_at: string }[];
  atributos_personalizados?: any;
}

interface NotionSlideOverProps {
  item: SlideOverItem | null;
  isOpen: boolean;
  onClose: () => void;
  userRol?: string;
  onDictaminar?: (item: SlideOverItem) => void;
  onCrearVersion?: (item: SlideOverItem) => void;
  onSuccessAction?: () => void;
}

export default function NotionSlideOver({
  item,
  isOpen,
  onClose,
  userRol,
  onDictaminar,
  onCrearVersion,
  onSuccessAction,
}: NotionSlideOverProps) {
  const { theme } = useSgcsTheme();
  const isLight = theme === 'light';
  const [copied, setCopied] = useState(false);
  const [procesandoDecision, setProcesandoDecision] = useState<'APROBAR' | 'RECHAZAR' | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setFeedback(null);
  }, [item?.id, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const canApprove =
    userRol === 'APROBADOR' || userRol === 'ADMINISTRADOR' || userRol === 'SUPERADMIN';
  const versionActual = item.versiones?.[0];
  const isPendienteDictamen = versionActual?.estado === 'PENDIENTE';

  const copyCode = () => {
    navigator.clipboard.writeText(item.codigo);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDictamenRapido = async (decision: 'APROBAR' | 'RECHAZAR') => {
    if (!versionActual) return;
    setProcesandoDecision(decision);
    setFeedback(null);
    try {
      const res = await fetch(`/api/ecs/${item.id}/versiones/${versionActual.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          justificacion:
            decision === 'APROBAR'
              ? 'Aprobado desde vista rápida del Workspace SGCS.'
              : 'Requiere ajustes técnicos antes de su aprobación.',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(decision === 'APROBAR' ? 'Versión aprobada correctamente.' : 'Versión rechazada.');
        onSuccessAction?.();
      } else {
        setFeedback(data.message || 'No se pudo procesar el dictamen.');
      }
    } catch {
      setFeedback('Error de red al dictaminar.');
    } finally {
      setProcesandoDecision(null);
    }
  };

  const getIcon = () => {
    switch (item.tipo) {
      case 'CODIGO_FUENTE':
        return <Code2 className="w-5 h-5 text-sky-500" />;
      case 'BASE_DATOS':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
      case 'DISENO':
        return <Layers className="w-5 h-5 text-amber-500" />;
      default:
        return <FileText className="w-5 h-5 text-purple-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={`relative w-full max-w-lg border-l shadow-2xl flex flex-col h-full transform transition-transform duration-200 ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-[#14161D] border-white/10 text-slate-100'
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between gap-3 shrink-0 ${
            isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-[#181A22]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span
              className={`font-mono text-xs font-bold px-2 py-1 rounded border ${
                isLight
                  ? 'text-blue-700 bg-blue-50 border-blue-200'
                  : 'text-amber-300 bg-amber-400/10 border-amber-400/20'
              }`}
            >
              {item.codigo}
            </span>
            <button
              type="button"
              onClick={copyCode}
              className="p-1 rounded hover:bg-white/10 text-slate-400 transition"
              title="Copiar código ECS"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <Link
              href={`/ecs/${item.id}`}
              className="text-xs font-semibold text-sky-500 hover:underline flex items-center gap-1 ml-1"
            >
              <span>Expediente</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 transition"
            aria-label="Cerrar panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'
              }`}
            >
              {getIcon()}
            </div>
            <div>
              <h2 className={`text-lg font-bold leading-snug ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {item.nombre}
              </h2>
              {item.proyecto && (
                <p className="text-xs text-slate-400 mt-0.5">
                  Proyecto: <span className="font-semibold">{item.proyecto.nombre}</span>
                </p>
              )}
            </div>
          </div>

          {/* Ficha de Propiedades */}
          <div
            className={`rounded-xl border p-4 space-y-2.5 text-xs ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
            }`}
          >
            <div className="grid grid-cols-3 gap-2 py-1 border-b border-white/5">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Tag className="w-3.5 h-3.5" /> Tipo
              </span>
              <div className="col-span-2 font-semibold">{item.tipo}</div>
            </div>

            <div className="grid grid-cols-3 gap-2 py-1 border-b border-white/5">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5" /> Estado
              </span>
              <div className="col-span-2">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    versionActual?.estado === 'APROBADA'
                      ? 'bg-emerald-500/15 text-emerald-500'
                      : versionActual?.estado === 'RECHAZADA'
                      ? 'bg-rose-500/15 text-rose-500'
                      : 'bg-amber-500/15 text-amber-500'
                  }`}
                >
                  {versionActual?.estado || 'PENDIENTE'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 py-1 border-b border-white/5">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <User className="w-3.5 h-3.5" /> Responsable
              </span>
              <div className="col-span-2 flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-[10px]">
                  {item.responsable?.nombre_completo?.charAt(0) || 'U'}
                </div>
                <span className="font-medium">{item.responsable?.nombre_completo || 'Sin asignar'}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 py-1 border-b border-white/5">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <GitCommit className="w-3.5 h-3.5" /> Versión
              </span>
              <div className="col-span-2 font-mono font-semibold">
                {versionActual?.numero_version ? `v${versionActual.numero_version}` : 'Sin versión'}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 py-1">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <FolderGit2 className="w-3.5 h-3.5" /> Ubicación
              </span>
              <div
                className={`col-span-2 truncate font-mono text-[11px] px-2 py-1 rounded ${
                  isLight ? 'bg-white border border-slate-200 text-slate-700' : 'bg-black/30 text-slate-300'
                }`}
              >
                {item.ubicacion || 'No especificada'}
              </div>
            </div>
          </div>

          {feedback && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs font-semibold">
              {feedback}
            </div>
          )}

          {/* Descripción */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Memoria / Descripción del Entregable</span>
            </h4>
            <div
              className={`rounded-xl border p-4 text-xs leading-relaxed min-h-[80px] whitespace-pre-line ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#181A22] border-white/10 text-slate-300'
              }`}
            >
              {item.descripcion || 'Sin descripción detallada registrada para este entregable.'}
            </div>
          </div>

          {/* Historial de Versiones */}
          {item.versiones && item.versiones.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Historial de Versiones ({item.versiones.length})</span>
              </h4>
              <div className="space-y-1.5">
                {item.versiones.map((v) => (
                  <div
                    key={v.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-500">v{v.numero_version}</span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(v.created_at).toLocaleDateString('es-PE')}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        v.estado === 'APROBADA'
                          ? 'bg-emerald-500/20 text-emerald-500'
                          : v.estado === 'RECHAZADA'
                          ? 'bg-rose-500/20 text-rose-500'
                          : 'bg-amber-500/20 text-amber-500'
                      }`}
                    >
                      {v.estado}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer de Acciones Rápidas */}
        <div
          className={`p-4 border-t flex flex-wrap items-center justify-between gap-2 shrink-0 ${
            isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-[#161820]'
          }`}
        >
          <Link
            href={`/cambios/nueva?ecsId=${item.id}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition inline-flex items-center gap-1.5 ${
              isLight
                ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
            }`}
          >
            <GitPullRequest className="w-3.5 h-3.5 text-rose-500" />
            <span>Solicitar Cambio (RFC)</span>
          </Link>

          <div className="flex items-center gap-2">
            {onCrearVersion && (
              <button
                type="button"
                onClick={() => onCrearVersion(item)}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 font-medium text-xs transition border border-white/10"
              >
                Nueva Versión
              </button>
            )}

            {canApprove && isPendienteDictamen && (
              <>
                <button
                  type="button"
                  disabled={procesandoDecision !== null}
                  onClick={() => handleDictamenRapido('RECHAZAR')}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-500 font-bold text-xs transition flex items-center gap-1 border border-rose-500/30 disabled:opacity-50"
                >
                  {procesandoDecision === 'RECHAZAR' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  <span>Rechazar</span>
                </button>
                <button
                  type="button"
                  disabled={procesandoDecision !== null}
                  onClick={() => handleDictamenRapido('APROBAR')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition flex items-center gap-1 disabled:opacity-50"
                >
                  {procesandoDecision === 'APROBAR' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>Aprobar</span>
                </button>
              </>
            )}

            {onDictaminar && (
              <button
                type="button"
                onClick={() => onDictaminar(item)}
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-upt-gold to-amber-400 hover:brightness-110 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                <span>Ir al Dictamen</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
