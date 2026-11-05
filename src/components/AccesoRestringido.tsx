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
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col items-center justify-center p-4 antialiased">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-300 shadow-xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Icono con badge institucional */}
        <div className="w-16 h-16 rounded-3xl bg-amber-100 border-2 border-amber-300 text-amber-800 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8 text-amber-700" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300 inline-block">
            RNF-02 • Control de Acceso RBAC
          </span>
          <h2 className="text-xl font-black text-slate-950">
            Acceso Restringido (403)
          </h2>
          <p className="text-xs font-bold text-slate-700">
            El módulo <strong className="text-slate-900">"{modulo}"</strong> requiere privilegios de {rolRequerido}.
          </p>
        </div>

        {/* Ficha del usuario actual */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-1.5 text-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
            Sesión Identificada:
          </span>
          <p className="font-extrabold text-slate-900">
            {user?.nombreCompleto || 'Colaborador Registrado'}
          </p>
          <div className="flex items-center gap-2 flex-wrap pt-0.5">
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300">
              Rol: {user?.rol || 'COLABORADOR'}
            </span>
            {user?.cargo && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-300">
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-purple-700" />
                  {user.cargo}
                </span>
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
            Por políticas de gobernanza SGCS, solo los administradores autorizados pueden gestionar este apartado.
          </p>
        </div>

        {/* Acciones de Navegación Segura */}
        <div className="pt-2 space-y-2">
          <Link
            href="/dashboard"
            className="w-full py-2.5 px-4 rounded-xl bg-upt-navy-900 hover:bg-upt-navy-800 text-upt-gold font-black text-xs shadow-md transition flex items-center justify-center gap-2 border border-upt-gold/40 active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Volver a mi Panel Principal</span>
          </Link>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/bitacora"
              className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center justify-center gap-1.5 border border-slate-300"
            >
              <Activity className="w-3.5 h-3.5 text-teal-600" />
              <span>Bitácora</span>
            </Link>
            <Link
              href="/ecs"
              className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center justify-center gap-1.5 border border-slate-300"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Entregables</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
