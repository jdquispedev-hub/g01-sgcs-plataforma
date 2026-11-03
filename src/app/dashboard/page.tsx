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
  ChevronRight,
  ClipboardList,
  Compass,
  Sparkles,
  GitCommit,
  Clock,
  ExternalLink,
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-3">
        <div className="w-12 h-12 rounded-2xl bg-upt-gold/20 border border-upt-gold/40 flex items-center justify-center text-upt-gold animate-bounce">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <p className="text-sm font-bold text-slate-300">Cargando plataforma SGCS...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      {/* Top Navbar Institucional Unificada */}
      <header className="bg-upt-navy-900 text-white border-b-2 border-upt-gold shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo y Tenant */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-upt-navy-700 border border-upt-gold/40 flex items-center justify-center text-upt-gold shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base text-white tracking-tight">
                  {user?.organizacionNombre}
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-upt-gold text-upt-navy-950 uppercase tracking-wider shadow-sm">
                  {user?.rubro}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                SGCS • Gestión de Configuración y Control Operativo
              </span>
            </div>
          </div>

          {/* Navegación Principal con Tabs Activos Claros */}
          <nav className="hidden md:flex items-center gap-1.5 bg-upt-navy-950/60 p-1.5 rounded-2xl border border-white/10">
            <Link
              href="/dashboard"
              className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-upt-navy-700 text-upt-gold shadow-sm border border-upt-gold/30 flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/ecs"
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition flex items-center gap-1.5"
            >
              <Layers className="w-4 h-4 text-slate-400" />
              <span>Elementos (ECS)</span>
            </Link>
            <Link
              href="/lineas-base"
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition flex items-center gap-1.5"
            >
              <Lock className="w-4 h-4 text-slate-400" />
              <span>Líneas Base</span>
            </Link>
          </nav>

          {/* Usuario y Salir */}
          <div className="flex items-center gap-3 text-xs">
            <div className="hidden sm:block text-right">
              <p className="font-extrabold text-white leading-tight">{user?.nombreCompleto}</p>
              <span className="text-[10px] font-bold text-upt-gold uppercase tracking-wider">
                {user?.rol}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-red-500/20 text-slate-300 hover:text-red-400 font-bold transition flex items-center gap-1.5 border border-white/10"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* Banner Hero: Explicación de Qué Hace el Sistema y Erradicación del Teléfono Descompuesto */}
        <section className="bg-gradient-to-r from-upt-navy-900 via-upt-navy-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-upt-navy-700 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-upt-gold/15 to-transparent pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-upt-gold/20 text-upt-gold border border-upt-gold/40 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Erradicación del «Teléfono Descompuesto»</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Control de Requisitos, Pre-Factibilidad y Líneas Base
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              En este sistema <strong className="text-white font-bold">ninguna promesa al cliente se suscribe a ciegas</strong>.
              Cada entregable o plano técnico pasa por aprobación especializada antes de congelarse en una Línea Base inmutable.
            </p>
          </div>

          {/* Guía Visual: Flujo de 5 Etapas del Sistema */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <span className="text-[11px] font-black uppercase tracking-wider text-upt-gold block mb-3">
              Guía de Operación: Flujo Universal de 5 Etapas (¿Cómo funciona el sistema?)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              
              {/* Etapa 1 */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-upt-gold">ETAPA 1</span>
                  <ClipboardList className="w-3.5 h-3.5 text-upt-gold" />
                </div>
                <h4 className="font-extrabold text-xs text-white">Recepción</h4>
                <p className="text-[11px] text-slate-300 leading-tight">
                  Minuta formal del requerimiento del cliente sin promesas inmediatas.
                </p>
              </div>

              {/* Etapa 2 */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-emerald-400">ETAPA 2</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <h4 className="font-extrabold text-xs text-white">Pre-Factibilidad</h4>
                <p className="text-[11px] text-slate-300 leading-tight">
                  El especialista técnico evalúa en el <strong>Catálogo ECS</strong> y dictamina (Aprobada / Rechazada).
                </p>
              </div>

              {/* Etapa 3 */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-amber-400">ETAPA 3</span>
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <h4 className="font-extrabold text-xs text-white">Línea Base</h4>
                <p className="text-[11px] text-slate-300 leading-tight">
                  Se congelan las especificaciones aprobadas en una versión inmutable.
                </p>
              </div>

              {/* Etapa 4 */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-sky-400">ETAPA 4</span>
                  <Activity className="w-3.5 h-3.5 text-sky-400" />
                </div>
                <h4 className="font-extrabold text-xs text-white">Bitácora & Bloqueos</h4>
                <p className="text-[11px] text-slate-300 leading-tight">
                  Reportes diarios de campo y alerta gerencial inmediata si hay bloqueos.
                </p>
              </div>

              {/* Etapa 5 */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-purple-400">ETAPA 5</span>
                  <FileCheck2 className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <h4 className="font-extrabold text-xs text-white">Cierre & Auditoría</h4>
                <p className="text-[11px] text-slate-300 leading-tight">
                  Checklist final contra la Línea Base y trazabilidad 100% auditada.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Tarjetas Principales de Módulos Operativos (Alto Contraste y Claridad) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Módulos de Gestión Activos
              </h2>
              <p className="text-xs text-slate-600">
                Selecciona una sección para consultar o registrar información técnica.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Card 1: Elementos de Configuración (ECS) */}
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-md hover:border-upt-navy-600 hover:shadow-xl transition-all duration-200 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-upt-navy-50 text-upt-navy-700 border border-upt-navy-200 flex items-center justify-center group-hover:bg-upt-navy-700 group-hover:text-upt-gold transition">
                    <Layers className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    RF-04 al RF-08
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-black text-upt-navy-600 uppercase tracking-wider block">
                    1. Catálogo Técnico
                  </span>
                  <h3 className="text-xl font-black text-slate-900 group-hover:text-upt-navy-700 transition">
                    Elementos de Configuración (ECS)
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Catálogo donde se registran los artefactos de software, planos, documentos o fórmulas técnicas. Incluye el historial de versiones y la bandeja de aprobación.
                  </p>
                </div>

                {/* Métrica viva */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600">Artefactos Registrados:</span>
                  <span className="font-black text-sm text-upt-navy-800 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-sm">
                    {totalEcs} ECS
                  </span>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-slate-100 flex items-center gap-2">
                <Link
                  href="/ecs"
                  className="w-full py-2.5 px-4 rounded-xl bg-upt-navy-700 hover:bg-upt-navy-800 text-upt-gold font-black text-xs shadow transition flex items-center justify-center gap-2"
                >
                  <span>Explorar Catálogo ECS</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Card 2: Líneas Base Inmutables */}
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-md hover:border-upt-gold hover:shadow-xl transition-all duration-200 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-upt-gold-600 border border-upt-gold/30 flex items-center justify-center group-hover:bg-upt-gold group-hover:text-upt-navy-950 transition">
                    <Lock className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-amber-50 text-upt-gold-700 border border-upt-gold/30">
                    RF-09 & RF-10
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-black text-upt-gold-700 uppercase tracking-wider block">
                    2. Congelamiento Técnico
                  </span>
                  <h3 className="text-xl font-black text-slate-900 group-hover:text-upt-gold-700 transition">
                    Líneas Base (Baselines)
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Congelamiento oficial de las especificaciones aprobadas. Garantiza que nadie cambie el alcance sin una solicitud formal de cambio.
                  </p>
                </div>

                {/* Métrica viva */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600">Líneas Base Vigentes:</span>
                  <span className="font-black text-sm text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200 shadow-sm flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {lineasVigentes} Activas
                  </span>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-slate-100 flex items-center gap-2">
                <Link
                  href="/lineas-base"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-upt-gold hover:bg-upt-gold-600 text-upt-navy-950 font-black text-xs shadow transition flex items-center justify-center gap-1.5"
                >
                  <span>Ver Líneas Base</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/lineas-base/nueva"
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition border border-slate-200"
                  title="Establecer nueva línea base"
                >
                  <Plus className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Card 3: Solicitudes de Cambio (RFC) */}
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-md hover:border-amber-500 hover:shadow-xl transition-all duration-200 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-red-50 text-upt-garnet border border-red-200 flex items-center justify-center group-hover:bg-upt-garnet group-hover:text-white transition">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-red-50 text-upt-garnet border border-red-200">
                    RF-11 al RF-15
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-black text-upt-garnet uppercase tracking-wider block">
                    3. Control de Impacto
                  </span>
                  <h3 className="text-xl font-black text-slate-900 group-hover:text-upt-garnet transition">
                    Gestión de Cambios (RFC)
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Cuando surge un imprevisto o el cliente solicita modificar una Línea Base, se evalúa el impacto técnico, costos y afectación antes de autorizarlo.
                  </p>
                </div>

                {/* Métrica */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600">Regla de Negocio:</span>
                  <span className="font-bold text-[11px] text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    Comité Técnico Requerido
                  </span>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-slate-100">
                <button
                  disabled
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Siguiente Módulo en Roadmap</span>
                </button>
              </div>
            </div>

          </div>
        </section>

      </main>
    </div>
  );
}
