'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Lock, Mail, AlertCircle, Loader2, ArrowRight, GraduationCap } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Error al iniciar sesión');
        setLoading(false);
        return;
      }

      router.push(data.data.redirectUrl || '/dashboard');
      router.refresh();
    } catch {
      setError('No se pudo conectar con el servidor. Verifique su conexión.');
      setLoading(false);
    }
  };

  const fillCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Detalle visual superior institucional */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-upt-navy-600 via-upt-gold to-upt-navy-600"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex items-center justify-center gap-3 mb-4 group">
          <div className="w-13 h-13 p-3 rounded-2xl bg-upt-navy-600 flex items-center justify-center text-upt-gold shadow-xl shadow-upt-navy-600/20 border border-upt-gold/30 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-8 h-8 text-upt-gold" />
          </div>
          <div>
            <span className="block font-black text-2xl text-upt-navy-700 tracking-tight leading-none">
              SGCS <span className="text-upt-gold-600">UPT</span>
            </span>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Gestión de Configuración
            </span>
          </div>
        </Link>
        <h2 className="text-center text-xl font-extrabold tracking-tight text-slate-900 mt-2">
          Portal de Control Operativo
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Eliminación del Teléfono Descompuesto y Validación Técnica Previa
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/60 rounded-3xl border border-slate-200/90 sm:px-10 relative">
          
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Correo Institucional / Cuenta <span className="text-upt-garnet-500">*</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@upt.pe o demo"
                  className="block w-full pl-10 pr-4 py-2.5 text-slate-900 bg-slate-50/50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-upt-navy-500 focus:border-upt-navy-500 focus:bg-white text-sm transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Contraseña <span className="text-upt-garnet-500">*</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-4 py-2.5 text-slate-900 bg-slate-50/50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-upt-navy-500 focus:border-upt-navy-500 focus:bg-white text-sm transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-upt-navy-600 hover:bg-upt-navy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-upt-gold active:scale-[0.99] disabled:opacity-60 transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-upt-gold" /> Autenticando...
                </>
              ) : (
                <>
                  Ingresar al Sistema <ArrowRight className="w-4 h-4 text-upt-gold" />
                </>
              )}
            </button>
          </form>

          {/* Selector de Acceso Demo */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 text-center">
              Acceso Rápido de Demostración
            </span>
            <button
              type="button"
              onClick={() => fillCredentials('superadmin@sgcs.com', 'Admin123!')}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 hover:bg-upt-navy-50 text-slate-700 hover:text-upt-navy-700 border border-slate-200 transition flex justify-between items-center group"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-upt-gold"></span>
                <span><strong>SuperAdmin:</strong> superadmin@sgcs.com</span>
              </span>
              <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200 group-hover:border-upt-gold/50">
                Admin123!
              </span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <GraduationCap className="w-4 h-4 text-upt-navy-600" />
          <span>Inspirado en la Identidad Visual de la Universidad Privada de Tacna</span>
        </div>
      </div>
    </div>
  );
}
