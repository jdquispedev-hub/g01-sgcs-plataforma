'use client';

import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Home, FileText, Activity, Briefcase } from 'lucide-react';

interface AccesoRestringidoProps {
  modulo?: string;
  user?: {
    nombreCompleto?: string;
    rol?: string;
    cargo?: string | null;
  } | null;
  rolRequerido?: string;
}

export default function AccesoRestringido({
  modulo = 'Administración',
  user,
  rolRequerido = 'Administrador de Empresa',
}: AccesoRestringidoProps) {
  return (
    <div className="min-h-screen bg-[#13151A] text-slate-100 flex flex-col items-center justify-center p-4 antialiased">
      <div className="max-w-md w-full bg-[#1A1D25] rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Icono con badge institucional */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8 text-amber-400" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 inline-block">
            RNF-02 • Control de Acceso RBAC
          </span>
          <h2 className="text-xl font-bold text-white">
            Acceso Restringido (403)
          </h2>
          <p className="text-xs font-semibold text-slate-300">
            El módulo <strong className="text-amber-300">"{modulo}"</strong> requiere privilegios de {rolRequerido}.
          </p>
        </div>

        {/* Ficha del usuario actual */}
        <div className="bg-[#14161E] rounded-xl p-4 border border-white/10 text-left space-y-1.5 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Sesión Identificada:
          </span>
          <p className="font-bold text-white">
            {user?.nombreCompleto || 'Colaborador Registrado'}
          </p>
          <div className="flex items-center gap-2 flex-wrap pt-0.5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
              Rol: {user?.rol || 'SOLICITANTE'}
            </span>
            {user?.cargo && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-purple-400" />
                  {user.cargo}
                </span>
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
            Por políticas de gobernanza SGCS, solo los perfiles autorizados pueden realizar modificaciones en este apartado.
          </p>
        </div>

        {/* Acciones de Navegación Segura */}
        <div className="pt-2 space-y-2">
          <Link
            href="/dashboard"
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-upt-gold to-amber-400 hover:brightness-110 text-slate-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-2 active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Volver a mi Panel Principal</span>
          </Link>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/bitacora"
              className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs transition flex items-center justify-center gap-1.5 border border-white/10"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Bitácora</span>
            </Link>
            <Link
              href="/ecs"
              className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs transition flex items-center justify-center gap-1.5 border border-white/10"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Entregables</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
