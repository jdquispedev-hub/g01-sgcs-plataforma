'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Credenciales incorrectas');
        setLoading(false);
        return;
      }

      if (data.data?.user?.rol === 'SUPERADMIN') {
        router.push('/superadmin');
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('Error de conexión con el servidor de autenticación');
      setLoading(false);
    }
  };

  const fillCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden antialiased">
      {/* Detalle visual superior dorado */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex items-center justify-center gap-3 mb-4 group">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <span className="block font-bold text-2xl text-white tracking-tight leading-none">
              SGCS <span className="text-amber-400">UPT</span>
            </span>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
              Gestión de Configuración
            </span>
          </div>
        </Link>
        <h2 className="text-center text-xl font-bold tracking-tight text-white mt-2">
          Portal de Control Operativo
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Eliminación del Teléfono Descompuesto y Validación Técnica Previa
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-[#0C1527] py-8 px-6 shadow-2xl rounded-2xl border border-white/10 sm:px-10 relative">
          
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-sm flex items-start gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Correo Institucional / Cuenta <span className="text-amber-400">*</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@upt.pe o demo"
                  className="block w-full pl-10 pr-4 py-2.5 text-white bg-[#070D18] border border-white/10 rounded-xl focus:outline-none focus:border-amber-400/50 text-sm placeholder:text-slate-500 transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Contraseña <span className="text-amber-400">*</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-4 py-2.5 text-white bg-[#070D18] border border-white/10 rounded-xl focus:outline-none focus:border-amber-400/50 text-sm placeholder:text-slate-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-lg text-sm font-bold text-slate-950 bg-gradient-to-r from-upt-gold to-amber-400 hover:brightness-110 active:scale-[0.99] disabled:opacity-60 transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-slate-950" /> Autenticando...
                </>
              ) : (
                <>
                  Ingresar al Sistema <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Selector de Acceso Demo */}
          <div className="mt-6 pt-5 border-t border-white/10 space-y-2">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">
              Acceso Rápido de Demostración (1 Clic):
            </span>
            <button
              type="button"
              onClick={() => fillCredentials('admin.construccion@sgcs.com', 'Admin123!')}
              className="w-full text-left px-3 py-2 rounded-xl text-xs bg-[#070D18] hover:bg-white/5 text-slate-200 border border-white/10 transition flex justify-between items-center group shadow-sm"
            >
              <span className="flex items-center gap-2">
                <span>🏗️</span>
                <span><strong>Construcción:</strong> Don Juan Pérez</span>
              </span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold">
                Auto-llenar
              </span>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('admin.software@sgcs.com', 'Admin123!')}
              className="w-full text-left px-3 py-2 rounded-xl text-xs bg-[#070D18] hover:bg-white/5 text-slate-200 border border-white/10 transition flex justify-between items-center group shadow-sm"
            >
              <span className="flex items-center gap-2">
                <span>💻</span>
                <span><strong>Software:</strong> E-Learning</span>
              </span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/30 font-bold">
                Auto-llenar
              </span>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('superadmin@sgcs.com', 'Admin123!')}
              className="w-full text-left px-3 py-2 rounded-xl text-xs bg-[#070D18] hover:bg-white/5 text-slate-200 border border-white/10 transition flex justify-between items-center group shadow-sm"
            >
              <span className="flex items-center gap-2">
                <span>🌐</span>
                <span><strong>SuperAdmin:</strong> Panel Global</span>
              </span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30 font-bold">
                Auto-llenar
              </span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <GraduationCap className="w-4 h-4 text-amber-400" />
          <span>Inspirado en la Identidad Visual de la Universidad Privada de Tacna</span>
        </div>
      </div>
    </div>
  );
}
