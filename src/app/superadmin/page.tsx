'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, LogOut, Building, Layers, GraduationCap } from 'lucide-react';

interface UserData {
  userId: string;
  nombreCompleto: string;
  email: string;
  rol: string;
  organizacionNombre: string;
  rubro: string;
}

export default function SuperAdminPage() {
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
        <p className="text-sm font-semibold text-upt-navy-600 animate-pulse">Cargando panel maestro...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navbar UPT Style */}
      <header className="bg-upt-navy-700 text-white border-b-2 border-upt-gold shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-upt-navy-600 flex items-center justify-center text-upt-gold border border-upt-gold/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight">Panel SuperAdmin</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-upt-gold/20 text-upt-gold font-bold border border-upt-gold/40">
                  Nivel 0
                </span>
              </div>
              <span className="text-[11px] text-slate-300">Administración Global SGCS</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="hidden sm:block text-right">
              <p className="font-bold text-white">{user?.nombreCompleto}</p>
              <p className="text-upt-gold text-[11px]">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-upt-navy-600 hover:bg-upt-garnet-500 text-white font-semibold transition flex items-center gap-1.5 border border-white/10"
            >
              <LogOut className="w-4 h-4" /> Salir
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-upt-gold-600 uppercase tracking-widest mb-1">
              <GraduationCap className="w-4 h-4" /> Entorno Multi-Tenant
            </div>
            <h1 className="text-2xl font-black text-upt-navy-700">Gestión de Organizaciones y Rubros</h1>
            <p className="text-sm text-slate-600">
              Control centralizado de empresas cliente, usuarios y plantillas operativas de industria.
            </p>
          </div>
        </div>

        {/* Tarjetas de Organizaciones */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
              <div className="w-11 h-11 rounded-2xl bg-upt-navy-50 text-upt-navy-600 flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                Activo
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-base">DevCraft Software Solutions</h3>
            <p className="text-xs text-slate-500 mt-1">Rubro: Software • Sprints, ECS y Commits</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                Activo
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-base">Clínica Veterinaria San Francisco</h3>
            <p className="text-xs text-slate-500 mt-1">Rubro: Veterinaria • Casos, Exámenes y Pacientes</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                Activo
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-base">Constructora Los Andes</h3>
            <p className="text-xs text-slate-500 mt-1">Rubro: Construcción • Obras, Planos y Partes Diarios</p>
          </div>
        </div>
      </main>
    </div>
  );
}
