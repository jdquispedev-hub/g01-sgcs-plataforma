'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  LogOut,
  Layers,
  AlertTriangle,
  Users,
  FileText,
  CheckCircle2,
  Lock,
  ArrowRight,
  Plus,
  Bookmark,
  Activity,
  FileCheck2,
} from 'lucide-react';

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
  const [totalEcs, setTotalEcs] = useState<number>(0);
  const [totalLineasBase, setTotalLineasBase] = useState<number>(0);
  const [lineasVigentes, setLineasVigentes] = useState<number>(0);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [resMe, resEcs, resLb] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/ecs'),
          fetch('/api/lineas-base'),
        ]);

        const dataMe = await resMe.json();
        if (dataMe.success) {
          setUser(dataMe.data.user);
        } else {
          router.push('/login');
          return;
        }

        const dataEcs = await resEcs.json();
        if (dataEcs.success) {
          setTotalEcs(dataEcs.data.length);
        }

        const dataLb = await resLb.json();
        if (dataLb.success) {
          setTotalLineasBase(dataLb.data.length);
          const vigentes = dataLb.data.filter((lb: any) => lb.estado === 'VIGENTE').length;
          setLineasVigentes(vigentes);
        }
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
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

          <nav className="hidden md:flex items-center gap-2">
            <Link
              href="/dashboard"
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-upt-navy-50 text-upt-navy-700"
            >
              Dashboard
            </Link>
            <Link
              href="/ecs"
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-upt-navy-700 hover:bg-slate-100 transition"
            >
              Elementos (ECS)
            </Link>
            <Link
              href="/lineas-base"
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-upt-navy-700 hover:bg-slate-100 transition"
            >
              Líneas Base
            </Link>
          </nav>

          <div className="flex items-center gap-4 text-xs">
            <div className="hidden sm:block text-right">
              <p className="font-bold text-slate-800">{user?.nombreCompleto}</p>
              <p className="text-upt-navy-600 font-semibold">{user?.rol}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 font-bold transition flex items-center gap-1.5 border border-slate-200"
            >
              <LogOut className="w-4 h-4" /> Salir
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-upt-gold-600">
            Control de Requerimientos y Fases
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-upt-navy-700 mt-1">
            Dashboard Gerencial y Técnico
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
            Líneas base inmutables, pre-factibilidad técnica y control de configuración para erradicar el teléfono descompuesto en las operaciones.
          </p>
        </div>

        {/* Métricas Principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card ECS */}
          <Link
            href="/ecs"
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-upt-navy-500 hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-2xl bg-upt-navy-50 text-upt-navy-600 flex items-center justify-center group-hover:bg-upt-navy-700 group-hover:text-upt-gold transition">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                RF-04 a RF-08
              </span>
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Elementos Activos</p>
            <h3 className="text-2xl font-black text-upt-navy-700 mt-1">{totalEcs} ECS</h3>
            <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1 group-hover:text-upt-navy-600">
              <span>Explorar catálogo de artefactos</span> &rarr;
            </p>
          </Link>

          {/* Card Líneas Base */}
          <Link
            href="/lineas-base"
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-upt-gold hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-upt-gold-600 flex items-center justify-center group-hover:bg-upt-gold group-hover:text-upt-navy-900 transition">
                <Lock className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-upt-gold-600 bg-amber-50 px-2 py-0.5 rounded-md">
                RF-09 & RF-10
              </span>
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Líneas Base</p>
            <h3 className="text-2xl font-black text-upt-navy-700 mt-1">
              {lineasVigentes} <span className="text-xs font-semibold text-slate-400">/ {totalLineasBase} tot.</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1 group-hover:text-upt-gold-600">
              <span>Ver actas inmutables congeladas</span> &rarr;
            </p>
          </Link>

          {/* Card Cambios (RFC) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                RF-11 a RF-15
              </span>
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Cambios (RFC)</p>
            <h3 className="text-2xl font-black text-upt-navy-700 mt-1">Control Formal</h3>
            <p className="text-[11px] text-slate-500 mt-2">
              Evaluación técnica de impacto antes de modificar
            </p>
          </div>

          {/* Card Trazabilidad */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                RNF-08 ACID
              </span>
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Integridad</p>
            <h3 className="text-2xl font-black text-upt-navy-700 mt-1">100% Auditado</h3>
            <p className="text-[11px] text-slate-500 mt-2">
              Historial append-only en PostgreSQL
            </p>
          </div>
        </div>

        {/* Acciones Rápidas y Guía Operativa */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card de Acciones de Línea Base */}
          <div className="bg-gradient-to-br from-upt-navy-700 to-upt-navy-900 rounded-3xl p-6 text-white border border-upt-navy-500/40 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-upt-gold text-xs font-bold uppercase tracking-wider mb-2">
                <Lock className="w-4 h-4" /> Módulo de Líneas Base Inmutables
              </div>
              <h3 className="text-xl font-black text-white">
                Congelamiento Formal de Especificaciones
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Reúne las versiones aprobadas de los entregables y artefactos de un proyecto en una línea base congelada mediante una transacción atómica ACID.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-white/10">
              <Link
                href="/lineas-base/nueva"
                className="px-4 py-2.5 rounded-2xl bg-upt-gold hover:bg-upt-gold-600 text-upt-navy-900 font-black text-xs shadow transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Establecer Nueva Línea Base
              </Link>
              <Link
                href="/lineas-base"
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center gap-1.5"
              >
                <span>Ver Catálogo de Líneas Base</span> &rarr;
              </Link>
            </div>
          </div>

          {/* Card de Elementos de Configuración */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                <Layers className="w-4 h-4 text-upt-navy-600" /> Catálogo de Elementos (ECS)
              </div>
              <h3 className="text-xl font-black text-slate-900">
                Inventario de Artefactos y Versiones
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Gestiona documentos de requisitos, código fuente, planos y especificaciones con histórico de versiones correlativo y dictamen técnico.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-slate-100">
              <Link
                href="/ecs"
                className="px-4 py-2.5 rounded-2xl bg-upt-navy-700 hover:bg-upt-navy-800 text-upt-gold font-bold text-xs transition flex items-center gap-2"
              >
                <Layers className="w-4 h-4" /> Ver Elementos (ECS)
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
