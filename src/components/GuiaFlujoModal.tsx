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
  'text-amber-500 bg-amber-500/10 border-amber-500/30',
  'text-blue-500 bg-blue-500/10 border-blue-500/30',
  'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
  'text-purple-500 bg-purple-500/10 border-purple-500/30',
  'text-rose-500 bg-rose-500/10 border-rose-500/30',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full border-2 border-slate-300 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="p-5 sm:p-6 bg-upt-navy-900 text-white border-b-2 border-upt-gold flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-upt-gold/20 border border-upt-gold/40 flex items-center justify-center text-upt-gold">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-white">
                  Guía Rápida: Ciclo de Vida SGCS
                </h3>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-upt-gold text-upt-navy-950 uppercase tracking-wider">
                  {terminologia.nombreIndustria}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Flujo operativo de gestión de configuración en 5 pasos sencillos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Pasos */}
        <div className="bg-slate-100 p-3 sm:p-4 border-b border-slate-200 flex items-center justify-between gap-1 overflow-x-auto">
          {pasos.map((p, idx) => (
            <button
              key={p.paso}
              onClick={() => setPasoActual(idx)}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 ${
                idx === pasoActual
                  ? 'bg-upt-navy-900 text-white shadow-sm'
                  : idx < pasoActual
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-white text-slate-600 hover:bg-slate-200'
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
            <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center shrink-0 shadow-sm ${colorEstilo}`}>
              <Icono className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Paso {paso.paso} de {pasos.length} • {paso.subtitulo}
              </span>
              <h4 className="text-xl font-black text-slate-900 mt-0.5">
                {paso.titulo}
              </h4>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200 font-medium">
            {paso.descripcion}
          </p>

          {/* Ejemplo Realista de la Industria */}
          <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200/80 flex items-start gap-3">
            <div className="p-1 rounded-lg bg-amber-200 text-amber-900 shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black text-amber-950 uppercase tracking-wider block">
                Ejemplo Real ({terminologia.nombreIndustria}):
              </span>
              <p className="text-xs text-amber-900 font-medium mt-0.5 leading-relaxed">
                {paso.ejemploReal}
              </p>
            </div>
          </div>
        </div>

        {/* Footer / Navegación */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            disabled={pasoActual === 0}
            onClick={() => setPasoActual((prev) => prev - 1)}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <div className="flex items-center gap-1.5">
            {pasos.map((_, idx) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === pasoActual ? 'w-6 bg-upt-navy-900' : 'bg-slate-300'
                }`}
              />
            ))}
          </div>

          {pasoActual < pasos.length - 1 ? (
            <button
              onClick={() => setPasoActual((prev) => prev + 1)}
              className="px-4 py-2 rounded-xl bg-upt-navy-900 hover:bg-upt-navy-800 text-white font-bold text-xs shadow transition flex items-center gap-1.5"
            >
              <span>Siguiente</span>
              <ArrowRight className="w-4 h-4 text-upt-gold" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow transition flex items-center gap-1.5"
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
