'use client';

import React, { useEffect } from 'react';
import { 
  X, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
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
  FileSpreadsheet
} from 'lucide-react';

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
  onDictaminar?: (item: SlideOverItem) => void;
  onCrearVersion?: (item: SlideOverItem) => void;
}

export default function NotionSlideOver({
  item,
  isOpen,
  onClose,
  onDictaminar,
  onCrearVersion,
}: NotionSlideOverProps) {
  const [copied, setCopied] = React.useState(false);

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

  const versionActual = item.versiones?.[0];
  const estado = versionActual?.estado || 'PENDIENTE';

  const copyCode = () => {
    navigator.clipboard.writeText(`${item.codigo} - ${item.nombre}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'CODIGO_FUENTE': return <Code2 className="w-4 h-4 text-sky-400" />;
      case 'DISENO': return <Layers className="w-4 h-4 text-purple-400" />;
      case 'BASE_DATOS': return <FileSpreadsheet className="w-4 h-4 text-amber-400" />;
      default: return <FileText className="w-4 h-4 text-slate-300" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-fadeIn">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-xl bg-[#14161E] border-l border-white/10 shadow-2xl h-full flex flex-col z-10 animate-slideInRight overflow-y-auto">
        {/* Banner Superior Estilo Notion */}
        <div className="h-20 bg-gradient-to-r from-slate-900 via-[#1e2230] to-slate-900 border-b border-white/10 relative p-4 flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-[#1A1D25] border border-white/15 shadow-md flex items-center justify-center -bottom-6 absolute left-6">
            {getTipoIcon(item.tipo)}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={copyCode}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white transition text-xs flex items-center gap-1 border border-white/10"
              title="Copiar código y título"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[11px] font-medium">{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white transition border border-white/10"
              title="Cerrar (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="p-6 pt-10 flex-1 space-y-6">
          {/* Título y Código */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                {item.codigo}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {item.proyecto?.nombre || 'Proyecto General'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {item.nombre}
            </h2>
          </div>

          {/* Tabla de Propiedades Estilo Notion */}
          <div className="bg-[#1A1D25] rounded-xl border border-white/10 p-3.5 space-y-2.5 text-xs">
            <div className="grid grid-cols-3 gap-2 py-1 border-b border-white/5">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Tag className="w-3.5 h-3.5" /> Estado
              </span>
              <div className="col-span-2">
                <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[11px] ${
                  estado === 'APROBADA'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : estado === 'RECHAZADA'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {estado === 'APROBADA' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {estado === 'APROBADA' ? 'Aprobada (Apta Línea Base)' : estado === 'RECHAZADA' ? 'Rechazada' : 'Pendiente de Dictamen'}
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
                <span className="text-slate-200 font-medium">{item.responsable?.nombre_completo || 'Sin asignar'}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 py-1 border-b border-white/5">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <GitCommit className="w-3.5 h-3.5" /> Versión
              </span>
              <div className="col-span-2 text-slate-200 font-mono font-medium">
                {versionActual?.numero_version || 'v1.0.0'}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 py-1">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <FolderGit2 className="w-3.5 h-3.5" /> Ubicación
              </span>
              <div className="col-span-2 truncate text-slate-300 font-mono text-[11px] bg-black/30 px-2 py-1 rounded">
                {item.ubicacion || 'No especificada'}
              </div>
            </div>
          </div>

          {/* Descripción / Documento Vivo */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Memoria / Descripción del Entregable</span>
            </h4>
            <div className="bg-[#181A22] rounded-xl border border-white/10 p-4 text-xs text-slate-300 leading-relaxed min-h-[90px] whitespace-pre-line">
              {item.descripcion || 'Sin descripción detallada registrada para este entregable.'}
            </div>
          </div>

          {/* Historial de Versiones */}
          {item.versiones && item.versiones.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Historial de Versiones ({item.versiones.length})</span>
              </h4>
              <div className="space-y-1.5">
                {item.versiones.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-400">{v.numero_version}</span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(v.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      v.estado === 'APROBADA'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {v.estado}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer de Acciones Rápidas */}
        <div className="p-4 border-t border-white/10 bg-[#161820] flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-slate-400">
            Esc para cerrar
          </span>

          <div className="flex items-center gap-2">
            {onCrearVersion && (
              <button
                type="button"
                onClick={() => onCrearVersion(item)}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 font-medium text-xs transition border border-white/10"
              >
                Nueva Versión
              </button>
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
