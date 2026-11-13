'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  CalendarDays, 
  Layers, 
  FileCheck2, 
  Lock, 
  GitPullRequest, 
  ChevronRight, 
  HelpCircle, 
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import { getTerminologia } from '@/lib/terminologia';

interface LifecycleStepperProps {
  currentStep: 1 | 2 | 3 | 4 | 5;
  rubro?: string;
  className?: string;
  counts?: {
    reuniones?: number;
    ecs?: number;
    aprobacionesPendientes?: number;
    lineasBase?: number;
    cambios?: number;
  };
}

export default function LifecycleStepper({
  currentStep,
  rubro = 'SOFTWARE',
  className = '',
  counts,
}: LifecycleStepperProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const terminologia = getTerminologia(rubro);

  const steps = [
    {
      step: 1,
      href: '/reuniones',
      title: 'Minutas de Acuerdo',
      shortTitle: '1. Minutas',
      desc: 'Qué pidió el cliente y qué se prometió formalmente',
      icon: CalendarDays,
      badge: counts?.reuniones !== undefined ? `${counts.reuniones}` : null,
      color: 'amber',
    },
    {
      step: 2,
      href: '/ecs',
      title: terminologia?.ecsLabelPlural || 'Entregables (ECS)',
      shortTitle: '2. Entregables',
      desc: 'Piezas construidas (código, documentos, planos o analíticas)',
      icon: Layers,
      badge: counts?.ecs !== undefined ? `${counts.ecs}` : null,
      color: 'teal',
    },
    {
      step: 3,
      href: '/aprobaciones',
      title: 'Dictamen Tech Lead',
      shortTitle: '3. Dictamen',
      desc: 'Visto bueno del especialista técnico para garantizar calidad',
      icon: FileCheck2,
      badge: counts?.aprobacionesPendientes !== undefined && counts.aprobacionesPendientes > 0 ? `${counts.aprobacionesPendientes} pendientes` : null,
      color: 'emerald',
    },
    {
      step: 4,
      href: '/lineas-base',
      title: 'Línea Base Oficial',
      shortTitle: '4. Línea Base',
      desc: 'Foto oficial congelada (Release) que nadie puede alterar sin permiso',
      icon: Lock,
      badge: counts?.lineasBase !== undefined ? `${counts.lineasBase}` : null,
      color: 'purple',
    },
    {
      step: 5,
      href: '/cambios',
      title: 'Control de Cambios',
      shortTitle: '5. Cambios (RFC)',
      desc: 'Nuevos pedidos o adicionales tras congelar la versión',
      icon: GitPullRequest,
      badge: counts?.cambios !== undefined ? `${counts.cambios}` : null,
      color: 'rose',
    },
  ];

  const currentStepData = steps.find((s) => s.step === currentStep) || steps[0];
  const nextStepData = steps.find((s) => s.step === currentStep + 1);

  return (
    <div className={`bg-[#181B22] rounded-2xl border border-white/10 p-3.5 sm:p-4 shadow-sm ${className}`}>
      {/* Header del Stepper */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-2">
              Flujo de Vida del Proyecto
              <span className="text-[10px] lowercase font-normal px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                Paso {currentStep} de 5: {currentStepData.shortTitle}
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowExplanation(!showExplanation)}
            className="text-[11px] font-medium text-slate-400 hover:text-white flex items-center gap-1 transition px-2 py-1 rounded-lg hover:bg-white/5"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>{showExplanation ? 'Ocultar guía' : '¿Cómo funciona?'}</span>
          </button>

          {nextStepData && (
            <Link
              href={nextStepData.href}
              className="text-[11px] font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded-lg flex items-center gap-1 transition"
            >
              <span>Siguiente: {nextStepData.shortTitle}</span>
              <ArrowRight className="w-3 h-3 text-amber-400" />
            </Link>
          )}
        </div>
      </div>

      {/* Explicación desplegable tipo Notion Callout */}
      {showExplanation && (
        <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2.5 animate-fadeIn">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-200">
              Objetivo de este paso ({currentStepData.title}):
            </p>
            <p className="text-[11px] text-amber-100/80">
              {currentStepData.desc}. Ningún cambio posterior se formaliza sin antes contar con el dictamen y la línea base correspondiente.
            </p>
          </div>
        </div>
      )}

      {/* Grid de 5 Pasos Interactivos */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2.5 mt-3">
        {steps.map((item) => {
          const isCurrent = item.step === currentStep;
          const isPast = item.step < currentStep;
          const Icon = item.icon;

          return (
            <Link
              key={item.step}
              href={item.href}
              className={`group relative rounded-xl p-2.5 transition flex flex-col justify-between border ${
                isCurrent
                  ? 'bg-gradient-to-b from-white/10 to-white/5 border-amber-400/60 shadow-sm'
                  : isPast
                  ? 'bg-white/5 border-white/10 hover:border-white/20 text-slate-300 hover:bg-white/10'
                  : 'bg-black/20 border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
                    isCurrent
                      ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                      : isPast
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold'
                      : 'bg-white/5 text-slate-400'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>

                {isCurrent && (
                  <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950">
                    Activo
                  </span>
                )}
                {isPast && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Listo ✓
                  </span>
                )}
                {!isCurrent && !isPast && (
                  <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-white/5 text-slate-400">
                    Paso {item.step}
                  </span>
                )}
              </div>

              <div>
                <span
                  className={`text-xs font-bold block truncate ${
                    isCurrent ? 'text-amber-300 font-extrabold' : 'text-slate-200'
                  }`}
                >
                  {item.shortTitle}
                </span>
                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                  {item.title}
                </p>
              </div>

              {item.badge && (
                <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[9px] text-slate-400">Registros:</span>
                  <span className="text-[10px] font-bold text-slate-200 bg-white/10 px-1.5 py-0.2 rounded-md">
                    {item.badge}
                  </span>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
