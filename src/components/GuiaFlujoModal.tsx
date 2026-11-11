'use client';

import { useState, useEffect } from 'react';
import {
  HelpCircle,
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Layers,
  Lock,
  AlertTriangle,
  ShieldCheck,
  Users,
  Briefcase,
} from 'lucide-react';
import { getTerminologia } from '@/lib/terminologia';

interface GuiaFlujoModalProps {
  isOpen: boolean;
  onClose: () => void;
  rubro?: string;
}

const ICON_MAP = {
  Users,
  Layers,
  ShieldCheck,
  Lock,
  AlertTriangle,
};

const COLOR_MAP = [
  'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'text-sky-400 bg-sky-500/10 border-sky-500/30',
  'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'text-purple-400 bg-purple-500/10 border-purple-500/30',
  'text-rose-400 bg-rose-500/10 border-rose-500/30',
];

export default function GuiaFlujoModal({ isOpen, onClose, rubro: initialRubro }: GuiaFlujoModalProps) {
  const [pasoActual, setPasoActual] = useState(0);
  const [rubro, setRubro] = useState(initialRubro || 'CONSTRUCCION');

  useEffect(() => {
    if (initialRubro) {
      setRubro(initialRubro);
      return;
    }
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.user?.rubro) {
          setRubro(data.data.user.rubro);
        }
      })
      .catch(() => {});
  }, [initialRubro]);

  if (!isOpen) return null;

  const terminologia = getTerminologia(rubro);
  const pasos = terminologia.pasosGuia;
  const paso = pasos[pasoActual];
  const Icono = ICON_MAP[paso.iconName] || Layers;
  const colorEstilo = COLOR_MAP[pasoActual] || COLOR_MAP[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1A1D25] rounded-2xl max-w-2xl w-full border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
        {/* Header Modal */}
        <div className="p-5 sm:p-6 bg-[#16181D] text-white border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white">
                  Guía Rápida: Ciclo de Vida SGCS
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                  {terminologia.nombreIndustria}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Flujo operativo de gestión de configuración en 5 pasos sencillos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Pasos */}
        <div className="bg-[#14161E] p-3 sm:p-4 border-b border-white/10 flex items-center justify-between gap-1.5 overflow-x-auto">
          {pasos.map((p, idx) => (
            <button
              key={p.paso}
              onClick={() => setPasoActual(idx)}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 ${
                idx === pasoActual
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : idx < pasoActual
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5'
              }`}
            >
              <span>{p.paso}.</span>
              <span className="hidden sm:inline">{p.badge}</span>
            </button>
          ))}
        </div>

        {/* Contenido del Paso */}
        <div className="p-6 sm:p-8 space-y-5 overflow-y-auto flex-1">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm ${colorEstilo}`}>
              <Icono className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Paso {paso.paso} de {pasos.length} • {paso.subtitulo}
              </span>
              <h4 className="text-xl font-bold text-white mt-0.5">
                {paso.titulo}
              </h4>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-[#14161E] p-4 rounded-xl border border-white/10 font-medium">
            {paso.descripcion}
          </p>

          {/* Ejemplo Realista de la Industria */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <div className="p-1 rounded-lg bg-amber-500/20 text-amber-300 shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                Ejemplo Real ({terminologia.nombreIndustria}):
              </span>
              <p className="text-xs text-slate-300 font-medium mt-0.5 leading-relaxed">
                {paso.ejemploReal}
              </p>
            </div>
          </div>
        </div>

        {/* Footer / Navegación */}
        <div className="p-4 sm:p-6 bg-[#16181D] border-t border-white/10 flex items-center justify-between">
          <button
            disabled={pasoActual === 0}
            onClick={() => setPasoActual((prev) => prev - 1)}
            className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 font-bold text-xs hover:bg-white/5 transition disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <div className="flex items-center gap-1.5">
            {pasos.map((_, idx) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === pasoActual ? 'w-6 bg-amber-400' : 'bg-white/20'
                }`}
              />
            ))}
          </div>

          {pasoActual < pasos.length - 1 ? (
            <button
              onClick={() => setPasoActual((prev) => prev + 1)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs transition flex items-center gap-1.5"
            >
              <span>Siguiente</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-upt-gold to-amber-400 hover:brightness-110 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>¡Entendido! Comenzar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
