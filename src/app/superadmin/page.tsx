'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, LogOut, Building, User, Layers, ArrowLeft } from 'lucide-react';

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
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Cargando panel maestro...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navbar */}
      <header className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight">Panel SuperAdmin</span>
              <span className="ml-2 text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Nivel 0
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="hidden sm:block text-right">
              <p className="font-semibold">{user?.nombreCompleto}</p>
              <p className="text-slate-400">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-red-600 text-white font-medium transition flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" /> Salir
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Gestión Global de Organizaciones</h1>
            <p className="text-sm text-slate-600">
              Administración centralizada de empresas cliente y asignación de plantillas de industria.
            </p>
          </div>
        </div>

        {/* Tarjetas de Organizaciones Sembradas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                Activo
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-base">DevCraft Software Solutions</h3>
            <p className="text-xs text-slate-500 mt-1">Rubro: Software • Plantilla Sprints/ECS</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                Activo
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-base">Clínica Veterinaria San Francisco</h3>
            <p className="text-xs text-slate-500 mt-1">Rubro: Veterinaria • Plantilla Casos/Pacientes</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                Activo
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-base">Constructora Los Andes</h3>
            <p className="text-xs text-slate-500 mt-1">Rubro: Construcción • Plantilla Obras/Planos</p>
          </div>
        </div>
      </main>
    </div>
  );
}
