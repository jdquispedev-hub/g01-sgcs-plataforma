'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, LogOut, Layers, AlertTriangle, Users, FileText, CheckCircle2 } from 'lucide-react';

interface UserData {
  userId: string;
  nombreCompleto: string;
  email: string;
  rol: string;
  organizacionNombre: string;
  rubro: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.data.user);
        } else {
          router.push('/login');
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm font-semibold text-upt-navy-600 animate-pulse">Cargando panel de control...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Institucional con Acento Dorado */}
      <header className="bg-white border-b-2 border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-upt-navy-600 flex items-center justify-center text-upt-gold shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-upt-navy-700 tracking-tight">
                  {user?.organizacionNombre}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-upt-gold-100 text-upt-gold-700 border border-upt-gold-300">
                  {user?.rubro}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Panel Operativo SGCS</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="hidden sm:block text-right">
              <p className="font-bold text-slate-800">{user?.nombreCompleto}</p>
              <p className="text-upt-navy-600 font-semibold">{user?.rol}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-upt-garnet-50 text-slate-700 hover:text-upt-garnet-600 font-bold transition flex items-center gap-1.5 border border-slate-200"
            >
              <LogOut className="w-4 h-4" /> Salir
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-upt-gold-600">
            Control de Requerimientos y Fases
          </span>
          <h1 className="text-2xl font-black text-upt-navy-700 mt-1">Dashboard Gerencial y Técnico</h1>
          <p className="text-sm text-slate-600">
            Líneas base inmutables, pre-factibilidad técnica y reporte diario de bloqueos sin teléfono descompuesto.
          </p>
        </div>

        {/* Métricas Principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:border-upt-navy-500 transition">
            <div className="w-11 h-11 rounded-2xl bg-upt-navy-50 text-upt-navy-600 flex items-center justify-center mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Elementos Activos</p>
            <h3 className="text-2xl font-black text-upt-navy-700 mt-1">12 ECS</h3>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:border-upt-gold transition">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-upt-gold-600 flex items-center justify-center mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Líneas Base</p>
            <h3 className="text-2xl font-black text-upt-navy-700 mt-1">3 Congeladas</h3>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:border-amber-400 transition">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Cambios Pendientes</p>
            <h3 className="text-2xl font-black text-upt-navy-700 mt-1">2 RFCs</h3>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:border-emerald-400 transition">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Personal Activo</p>
            <h3 className="text-2xl font-black text-upt-navy-700 mt-1">8 Miembros</h3>
          </div>
        </div>
      </main>
    </div>
  );
}
