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
  Briefcase,
  FileText,
  CheckCircle2,
  Lock,
  ArrowRight,
  Plus,
  Activity,
  ChevronRight,
  Compass,
  Sparkles,
  Clock,
  Network,
  Printer,
  Terminal,
  Eye,
  ArrowLeft,
  HelpCircle,
  CalendarDays,
  Handshake,
  Building,
  User,
  GitPullRequest,
  ArrowUpRight,
} from 'lucide-react';
import GuiaFlujoModal from '@/components/GuiaFlujoModal';
import AgendarReunionModal from '@/components/AgendarReunionModal';

interface UserData {
  userId: string;
  nombreCompleto: string;
  email: string;
  rol: string;
  organizacionNombre: string;
  rubro: string;
  isSupervising?: boolean;
  originalOrgNombre?: string;
}

interface BloqueoActivo {
  id: string;
  detalle_bloqueo: string;
  created_at: string;
  proyecto: { codigo: string; nombre: string };
  usuario: { nombre_completo: string };
}

interface ProyectoItem {
  id: string;
  codigo: string;
  nombre: string;
  cliente_nombre?: string;
  estado?: string;
}

interface UsuarioItem {
  id: string;
  nombre_completo: string;
  email: string;
  rol: string;
}

interface ReunionItem {
  id: string;
  proyecto_id: string;
  titulo: string;
  tipo: string;
  fecha: string;
  hora?: string | null;
  participantes: string;
  convocante?: { nombre_completo: string };
  proyecto: { codigo: string; nombre: string; cliente_nombre: string };
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Métricas
  const [totalEcs, setTotalEcs] = useState<number>(0);
  const [versionesPendientes, setVersionesPendientes] = useState<number>(0);
  const [totalLineasBase, setTotalLineasBase] = useState<number>(0);
  const [lineasVigentes, setLineasVigentes] = useState<number>(0);
  const [totalRfc, setTotalRfc] = useState<number>(0);
  const [rfcPendientes, setRfcPendientes] = useState<number>(0);
  const [bloqueosActivos, setBloqueosActivos] = useState<BloqueoActivo[]>([]);

  // Proyectos y Reuniones
  const [proyectos, setProyectos] = useState<ProyectoItem[]>([]);
  const [selectedProyectoId, setSelectedProyectoId] = useState<string>('');
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([]);
  const [reuniones, setReuniones] = useState<ReunionItem[]>([]);
  const [agendarModalOpen, setAgendarModalOpen] = useState(false);

  // Pestaña de módulos
  const [tabModulo, setTabModulo] = useState<'OPERACION' | 'SUPERVISION'>('OPERACION');
  const [guiaModalOpen, setGuiaModalOpen] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [resMe, resEcs, resLb, resRfc, resBloqueos, resAux, resReu] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/ecs'),
          fetch('/api/lineas-base'),
          fetch('/api/cambios'),
          fetch('/api/bitacora/bloqueos-activos'),
          fetch('/api/auxiliares'),
          fetch('/api/reuniones'),
        ]);

        const dataMe = await resMe.json();
        if (dataMe.success) {
          setUser(dataMe.data.user);
        } else {
          router.push('/login');
          return;
        }

        const dataEcs = await resEcs.json();
        if (dataEcs.success && Array.isArray(dataEcs.data)) {
          setTotalEcs(dataEcs.data.length);
          let pendientes = 0;
          dataEcs.data.forEach((ecs: any) => {
            if (Array.isArray(ecs.versiones)) {
              ecs.versiones.forEach((v: any) => {
                if (v.estado === 'PENDIENTE') pendientes++;
              });
            }
          });
          setVersionesPendientes(pendientes);
        }

        const dataLb = await resLb.json();
        if (dataLb.success) {
          setTotalLineasBase(dataLb.data.length);
          const vigentes = dataLb.data.filter((lb: any) => lb.estado === 'VIGENTE').length;
          setLineasVigentes(vigentes);
        }

        const dataRfc = await resRfc.json();
        if (dataRfc.success) {
          setTotalRfc(dataRfc.data.length);
          const pendientes = dataRfc.data.filter(
            (r: any) => r.estado === 'PENDIENTE_EVALUACION' || r.estado === 'EN_EVALUACION'
          ).length;
          setRfcPendientes(pendientes);
        }

        const dataBloqueos = await resBloqueos.json();
        if (dataBloqueos.success) {
          setBloqueosActivos(dataBloqueos.data);
        }

        const dataAux = await resAux.json();
        if (dataAux.success) {
          if (Array.isArray(dataAux.data.proyectos)) {
            setProyectos(dataAux.data.proyectos);
            if (dataAux.data.proyectos.length > 0) {
              setSelectedProyectoId(dataAux.data.proyectos[0].id);
            }
          }
          if (Array.isArray(dataAux.data.usuarios)) {
            setUsuarios(dataAux.data.usuarios);
          }
        }

        const dataReu = await resReu.json();
        if (dataReu.success && Array.isArray(dataReu.data)) {
          setReuniones(dataReu.data);
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

  const handleRevertSuperadmin = async () => {
    try {
      const res = await fetch('/api/superadmin/impersonate/revert', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        router.push(data.redirectUrl || '/superadmin');
        router.refresh();
      }
    } catch {
      alert('Error al volver al panel SuperAdmin');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 text-slate-800 gap-3 p-4">
        <div className="w-14 h-14 rounded-2xl bg-upt-navy-900 text-upt-gold border border-slate-300 flex items-center justify-center shadow-lg animate-pulse">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <p className="text-sm font-bold text-slate-700">Cargando plataforma SGCS...</p>
      </div>
    );
  }

  const activeProyecto = proyectos.find((p) => p.id === selectedProyectoId) || proyectos[0];
  const activeReuniones = reuniones.filter(
    (r) => !selectedProyectoId || r.proyecto_id === selectedProyectoId || (r.proyecto as any)?.id === selectedProyectoId
  );

  const displayName = user?.nombreCompleto?.split('(')[0]?.trim() || user?.nombreCompleto || 'Usuario';
  const displayRole = user?.nombreCompleto?.includes('(')
    ? user.nombreCompleto.split('(')[1]?.replace(')', '')?.trim()
    : user?.rol || 'USUARIO';

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col antialiased">
      {/* Banner de Modo Supervisión SuperAdmin */}
      {user?.isSupervising && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 px-4 py-2 font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-between gap-2 shadow-inner border-b-2 border-amber-600 z-50">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-slate-950 animate-pulse shrink-0" />
            <span>
              <strong>Modo Supervisión Global:</strong> Estás auditando el entorno de{' '}
              <strong className="underline underline-offset-2">{user.organizacionNombre}</strong> como SuperAdministrador.
            </span>
          </div>
          <button
            onClick={handleRevertSuperadmin}
            className="px-3 py-1.5 rounded-xl bg-slate-950 text-amber-300 font-extrabold text-xs hover:bg-slate-800 transition shadow flex items-center gap-1.5 shrink-0 active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Volver al Panel SuperAdmin
          </button>
        </div>
      )}

      {/* Top Navbar */}
      <header className="bg-upt-navy-900 text-white border-b-2 border-upt-gold shadow-xl sticky top-0 z-40">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-2.5 sm:py-0 sm:h-16 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Logo y Nombre de la Organización */}
          <div className="flex items-center justify-between sm:justify-start gap-3 shrink-0">
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-2xl bg-upt-navy-800 border border-upt-gold/40 flex items-center justify-center text-upt-gold shadow-md shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="shrink-0">
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm sm:text-base text-white tracking-tight whitespace-nowrap">
                    {user?.organizacionNombre || 'SGCS'}
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-upt-gold text-upt-navy-950 uppercase tracking-wider shadow-sm shrink-0 whitespace-nowrap">
                    {user?.rubro || 'PLATAFORMA'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-300 font-medium block whitespace-nowrap">
                  SGCS • Control de Configuración y Proyectos
                </span>
              </div>
            </div>

            {/* Salir en Mobile */}
            <div className="sm:hidden shrink-0">
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-white/10 hover:bg-red-500/20 text-slate-300 hover:text-red-400 font-bold transition border border-white/10"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navegación Principal */}
          <nav className="hidden xl:flex items-center gap-1 bg-upt-navy-950/80 p-1.5 rounded-2xl border border-white/15 shrink-0">
            <Link
              href="/dashboard"
              className="px-3 py-1.5 rounded-xl text-xs font-black bg-upt-navy-700 text-upt-gold shadow-sm border border-upt-gold/30 flex items-center gap-1.5 whitespace-nowrap"
            >
              <Compass className="w-4 h-4" />
              <span>Inicio</span>
            </Link>
            <Link
              href="/reuniones"
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-emerald-400 hover:text-white hover:bg-white/10 transition flex items-center gap-1.5 whitespace-nowrap"
            >
              <CalendarDays className="w-4 h-4 text-emerald-400" />
              <span>Calendario</span>
            </Link>
            <Link
              href="/cronograma"
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-upt-gold hover:text-white hover:bg-white/10 transition flex items-center gap-1.5 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 text-upt-gold" />
              <span>Canvas</span>
            </Link>
            <Link
              href="/ecs"
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition flex items-center gap-1.5 whitespace-nowrap"
            >
              <Layers className="w-4 h-4 text-slate-400" />
              <span>Entregables</span>
            </Link>
            <Link
              href="/aprobaciones"
              className="px-2.5 py-1 rounded-xl font-bold text-upt-gold hover:text-white bg-upt-gold/15 border border-upt-gold/30 flex items-center gap-1.5 shrink-0 whitespace-nowrap text-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-upt-gold" />
              <span>Aprobaciones</span>
            </Link>
            <Link
              href="/lineas-base"
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition flex items-center gap-1.5 whitespace-nowrap"
            >
              <Lock className="w-4 h-4 text-slate-400" />
              <span>Hitos</span>
            </Link>
            <Link
              href="/cambios"
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition flex items-center gap-1.5 whitespace-nowrap"
            >
              <AlertTriangle className="w-4 h-4 text-slate-400" />
              <span>Cambios</span>
            </Link>
            <Link
              href="/bitacora"
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition flex items-center gap-1.5 whitespace-nowrap"
            >
              <Activity className="w-4 h-4 text-slate-400" />
              <span>Bitácora</span>
            </Link>
          </nav>

          {/* Usuario y Salir Desktop */}
          <div className="hidden sm:flex items-center gap-3 text-xs shrink-0">
            <button
              onClick={() => setGuiaModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-upt-gold hover:bg-amber-400 text-upt-navy-950 font-black text-xs shadow-md transition flex items-center gap-1.5 shrink-0 active:scale-95 whitespace-nowrap"
            >
              <HelpCircle className="w-4 h-4 text-upt-navy-950" />
              <span>¿Cómo funciona?</span>
            </button>
            <div className="text-right">
              <p className="font-extrabold text-white leading-tight whitespace-nowrap">
                {displayName}
              </p>
              <span className="text-[10px] font-bold text-upt-gold uppercase tracking-wider block whitespace-nowrap">
                {displayRole}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-red-500/20 text-slate-300 hover:text-red-400 font-bold transition flex items-center gap-1.5 border border-white/10 shrink-0 whitespace-nowrap"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6">
        
        {/* Alerta de Bloqueos Críticos (si existen) */}
        {bloqueosActivos.length > 0 && (
          <div className="p-4 sm:p-5 rounded-3xl bg-red-600 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-2 border-red-700 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full inline-block">
                  Alerta Temprana en Campo
                </span>
                <h3 className="text-base font-black">
                  Se registran {bloqueosActivos.length} bloqueo(s) de cuadrilla activos
                </h3>
                <p className="text-xs text-red-100">
                  {bloqueosActivos[0].proyecto.nombre}: "{bloqueosActivos[0].detalle_bloqueo}"
                </p>
              </div>
            </div>
            <Link
              href="/bitacora"
              className="px-4 py-2 rounded-xl bg-white text-red-700 hover:bg-red-50 font-black text-xs shadow transition flex items-center justify-center gap-1.5 shrink-0"
            >
              <span>Ver Bitácora</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* ========================================================
           SECCIÓN CENTRAL: PROYECTO ACTIVO Y AGENDA DE REUNIONES
           ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Lado Izquierdo: Ficha del Proyecto y Pipeline de 5 Pasos (7 cols) */}
          <section className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-300 shadow-md flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              {/* Selector de Proyecto Activo */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-upt-navy-700 bg-upt-navy-50 px-2.5 py-0.5 rounded-md border border-upt-navy-200 inline-block mb-1">
                    Proyecto Seleccionado
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                    <span>{activeProyecto?.nombre || 'Plataforma Web'}</span>
                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {activeProyecto?.codigo}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Cliente Oficial: <strong className="text-slate-900">{activeProyecto?.cliente_nombre || 'Sin cliente asignado'}</strong>
                  </p>
                </div>

                <div className="shrink-0">
                  <select
                    value={selectedProyectoId}
                    onChange={(e) => setSelectedProyectoId(e.target.value)}
                    className="px-3 py-1.5 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-upt-navy-700 transition cursor-pointer"
                  >
                    {proyectos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.codigo} - {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Siguiente Paso Recomendado */}
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3.5 flex items-start gap-3 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 text-amber-800" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 block">
                    Acción Recomendada Ahora:
                  </span>
                  <p className="text-xs font-bold text-slate-900 leading-snug">
                    {versionesPendientes > 0
                      ? `Hay ${versionesPendientes} versión(es) de código/planos esperando dictamen técnico del Tech Lead.`
                      : lineasVigentes === 0
                      ? 'Los entregables están listos. El siguiente paso es congelar la primera Línea Base.'
                      : 'Línea Base oficial vigente. El equipo debe continuar la ejecución y documentar avances.'}
                  </p>
                </div>
              </div>

              {/* Pipeline Guiado de 5 Pasos Interactivos */}
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-2">
                  Flujo Oficial del Proyecto (Haz clic para navegar):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <Link
                    href="/reuniones"
                    className="p-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-300 text-emerald-950 transition flex flex-col justify-between"
                  >
                    <span className="text-[9px] font-black text-emerald-700">1. CLIENTE</span>
                    <span className="text-xs font-black truncate">Reuniones</span>
                    <span className="text-[9px] text-slate-500">Minutas</span>
                  </Link>
                  <Link
                    href="/ecs"
                    className="p-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-300 text-emerald-950 transition flex flex-col justify-between"
                  >
                    <span className="text-[9px] font-black text-emerald-700">2. EQUIPO</span>
                    <span className="text-xs font-black truncate">Entregables</span>
                    <span className="text-[9px] text-slate-500">{totalEcs} ECS</span>
                  </Link>
                  <Link
                    href="/aprobaciones"
                    className={`p-2.5 rounded-2xl border-2 transition flex flex-col justify-between ${
                      versionesPendientes > 0
                        ? 'bg-amber-50 hover:bg-amber-100 border-amber-400 text-amber-950'
                        : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-950'
                    }`}
                  >
                    <span className="text-[9px] font-black">3. DICTAMEN</span>
                    <span className="text-xs font-black truncate">Revisión</span>
                    <span className="text-[9px]">
                      {versionesPendientes > 0 ? `${versionesPendientes} Por Ver` : '✓ Al día'}
                    </span>
                  </Link>
                  <Link
                    href="/lineas-base"
                    className={`p-2.5 rounded-2xl border-2 transition flex flex-col justify-between ${
                      lineasVigentes > 0
                        ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-950'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700'
                    }`}
                  >
                    <span className="text-[9px] font-black">4. PACTO</span>
                    <span className="text-xs font-black truncate">Línea Base</span>
                    <span className="text-[9px]">
                      {lineasVigentes > 0 ? `${lineasVigentes} Vigente` : 'Pendiente'}
                    </span>
                  </Link>
                  <Link
                    href="/cambios"
                    className="p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border-2 border-slate-300 text-slate-700 transition flex flex-col justify-between"
                  >
                    <span className="text-[9px] font-black">5. CAMBIOS</span>
                    <span className="text-xs font-black truncate">Solicitudes</span>
                    <span className="text-[9px]">
                      {rfcPendientes > 0 ? `${rfcPendientes} RFCs` : '0 RFCs'}
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-bold">
                ¿Deseas ver la historia viva en el tiempo?
              </span>
              <Link
                href="/cronograma"
                className="text-xs font-black text-upt-navy-900 hover:text-upt-gold-600 flex items-center gap-1"
              >
                <span>Abrir Línea de Tiempo / Canvas ➔</span>
              </Link>
            </div>
          </section>

          {/* Lado Derecho: Widget de Agenda de Reuniones (5 cols) */}
          <section className="lg:col-span-5 bg-gradient-to-br from-upt-navy-900 to-slate-900 rounded-3xl p-6 text-white border-2 border-upt-navy-700 shadow-xl flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-upt-gold/20 flex items-center justify-center text-upt-gold">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-white">Agenda de Reuniones</h3>
                    <p className="text-[10px] text-slate-300">Hoy y próximas sesiones citadas</p>
                  </div>
                </div>
                <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {activeReuniones.length} sesiones
                </span>
              </div>

              {/* Lista de Próximas Reuniones */}
              <div className="space-y-2.5">
                {activeReuniones.slice(0, 3).map((r) => {
                  const isCliente = r.tipo === 'CLIENTE';
                  const fechaStr = new Date(r.fecha).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                  });

                  return (
                    <div
                      key={r.id}
                      className="bg-white/10 hover:bg-white/15 p-3 rounded-2xl border border-white/10 transition space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                            isCliente ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'
                          }`}
                        >
                          {isCliente ? '🤝 Con Cliente' : '👥 Equipo'}
                        </span>
                        <span className="font-mono text-[10px] text-upt-gold font-bold">
                          {fechaStr} • {r.hora || '10:00'}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white leading-snug truncate">
                        {r.titulo}
                      </h4>
                      <p className="text-[10px] text-slate-300 truncate">
                        Citada por: {r.convocante?.nombre_completo || 'Carlos Mendoza'}
                      </p>
                    </div>
                  );
                })}

                {activeReuniones.length === 0 && (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    No hay reuniones registradas para este proyecto.
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
              <Link
                href="/reuniones"
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <span>Ver Calendario</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setAgendarModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-upt-gold hover:bg-amber-400 text-upt-navy-950 text-xs font-black transition flex items-center gap-1.5 shadow active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>+ Agendar</span>
              </button>
            </div>
          </section>

        </div>

        {/* ========================================================
           ACCIONES RÁPIDAS (Atajos de 1 clic)
           ======================================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => setAgendarModalOpen(true)}
            className="p-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-emerald-500 shadow-sm transition flex items-center gap-3 group text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-xs text-slate-900 block group-hover:text-emerald-700 transition">
                + Agendar Reunión
              </span>
              <span className="text-[10px] text-slate-500">Minuta con cliente o equipo</span>
            </div>
          </button>

          <Link
            href="/cronograma"
            className="p-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-upt-gold shadow-sm transition flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-upt-gold-700" />
            </div>
            <div>
              <span className="font-black text-xs text-slate-900 block group-hover:text-upt-gold-800 transition">
                Línea de Tiempo (Canvas)
              </span>
              <span className="text-[10px] text-slate-500">Roadmap cronológico</span>
            </div>
          </Link>

          <Link
            href="/ecs"
            className="p-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-blue-500 shadow-sm transition flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-xs text-slate-900 block group-hover:text-blue-700 transition">
                + Subir Entregable (ECS)
              </span>
              <span className="text-[10px] text-slate-500">Código, planos o docs</span>
            </div>
          </Link>

          <Link
            href="/lineas-base/nueva"
            className="p-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-purple-500 shadow-sm transition flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-xs text-slate-900 block group-hover:text-purple-700 transition">
                + Congelar Hito Oficial
              </span>
              <span className="text-[10px] text-slate-500">Fijar Línea Base</span>
            </div>
          </Link>
        </div>

        {/* ========================================================
           SECCIÓN DE MÓDULOS ORGANIZADOS EN PESTAÑAS LIMPIAS
           ======================================================== */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-300 pb-3">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Módulos de Trabajo y Control
              </h2>
              <p className="text-xs text-slate-600">
                Accede a las herramientas de gestión según la etapa de tu jornada
              </p>
            </div>

            {/* Pestañas de Organización */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTabModulo('OPERACION')}
                className={`px-4 py-2 rounded-2xl text-xs font-black transition flex items-center gap-1.5 ${
                  tabModulo === 'OPERACION'
                    ? 'bg-upt-navy-900 text-upt-gold shadow'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Operación del Proyecto (6)</span>
              </button>
              <button
                onClick={() => setTabModulo('SUPERVISION')}
                className={`px-4 py-2 rounded-2xl text-xs font-black transition flex items-center gap-1.5 ${
                  tabModulo === 'SUPERVISION'
                    ? 'bg-upt-navy-900 text-upt-gold shadow'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Supervisión & Bitácora (5)</span>
              </button>
            </div>
          </div>

          {/* Pestaña 1: Operación del Proyecto */}
          {tabModulo === 'OPERACION' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              
              {/* Card Reuniones */}
              <div className="bg-white rounded-3xl p-6 border-2 border-slate-300 border-l-[6px] border-l-emerald-600 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                      Paso 1
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Reuniones & Calendario
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Agenda de sesiones con el cliente y el equipo. Registro de minutas y compromisos vinculantes.
                    </p>
                  </div>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-200">
                  <Link
                    href="/reuniones"
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-between transition"
                  >
                    <span>Abrir Calendario</span>
                    <ChevronRight className="w-4 h-4 text-upt-gold" />
                  </Link>
                </div>
              </div>

              {/* Card Canvas */}
              <div className="bg-white rounded-3xl p-6 border-2 border-slate-300 border-l-[6px] border-l-upt-gold shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-upt-gold-700 border border-upt-gold/30 flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                      Roadmap
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Línea de Tiempo (Canvas)
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Tablero visual interactivo que une reuniones, entregables, aprobaciones y solicitudes de cambio.
                    </p>
                  </div>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-200">
                  <Link
                    href="/cronograma"
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-between transition"
                  >
                    <span>Ver Canvas Vivo</span>
                    <ChevronRight className="w-4 h-4 text-upt-gold" />
                  </Link>
                </div>
              </div>

              {/* Card Entregables ECS */}
              <div className="bg-white rounded-3xl p-6 border-2 border-slate-300 border-l-[6px] border-l-blue-600 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
                      <Layers className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-900">
                      Paso 2
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Entregables y Componentes (ECS)
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Catálogo de código fuente, planos, bases de datos y documentos técnicos bajo control de versiones.
                    </p>
                  </div>
                  <div className="text-xs text-slate-600 font-bold bg-slate-100 p-2 rounded-xl">
                    Total: {totalEcs} entregables registrados
                  </div>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-200">
                  <Link
                    href="/ecs"
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-between transition"
                  >
                    <span>Explorar Entregables</span>
                    <ChevronRight className="w-4 h-4 text-upt-gold" />
                  </Link>
                </div>
              </div>

              {/* Card Aprobaciones */}
              <div className="bg-white rounded-3xl p-6 border-2 border-slate-300 border-l-[6px] border-l-teal-600 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-teal-100 text-teal-900">
                      Paso 3
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Bandeja de Aprobaciones
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Módulo para el Tech Lead: revisión técnica y dictamen (Aprobar o Rechazar) de versiones y solicitudes.
                    </p>
                  </div>
                  <div className="text-xs text-slate-600 font-bold bg-slate-100 p-2 rounded-xl">
                    Pendientes: {versionesPendientes} versiones
                  </div>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-200">
                  <Link
                    href="/aprobaciones"
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-between transition"
                  >
                    <span>Bandeja Técnica</span>
                    <ChevronRight className="w-4 h-4 text-upt-gold" />
                  </Link>
                </div>
              </div>

              {/* Card Líneas Base */}
              <div className="bg-white rounded-3xl p-6 border-2 border-slate-300 border-l-[6px] border-l-purple-600 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center">
                      <Lock className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-100 text-purple-900">
                      Paso 4
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Hitos Oficiales (Líneas Base)
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Fotografía congelada e inmutable del alcance pactado. Nadie puede alterar lo pactado a ciegas.
                    </p>
                  </div>
                  <div className="text-xs text-slate-600 font-bold bg-slate-100 p-2 rounded-xl">
                    Vigentes: {lineasVigentes} de {totalLineasBase}
                  </div>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-200">
                  <Link
                    href="/lineas-base"
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-between transition"
                  >
                    <span>Ver Líneas Base</span>
                    <ChevronRight className="w-4 h-4 text-upt-gold" />
                  </Link>
                </div>
              </div>

              {/* Card Cambios RFC */}
              <div className="bg-white rounded-3xl p-6 border-2 border-slate-300 border-l-[6px] border-l-rose-600 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-900">
                      Paso 5
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Control de Cambios (RFC)
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Si el cliente pide modificar lo congelado, aquí se evalúa el impacto en costo, tiempo y arquitectura.
                    </p>
                  </div>
                  <div className="text-xs text-slate-600 font-bold bg-slate-100 p-2 rounded-xl">
                    Pendientes: {rfcPendientes} de {totalRfc}
                  </div>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-200">
                  <Link
                    href="/cambios"
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-between transition"
                  >
                    <span>Gestionar Cambios</span>
                    <ChevronRight className="w-4 h-4 text-upt-gold" />
                  </Link>
                </div>
              </div>

            </div>
          )}

          {/* Pestaña 2: Supervisión y Control */}
          {tabModulo === 'SUPERVISION' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              
              {/* Bitácora de Campo */}
              <div className="bg-white rounded-3xl p-6 border-2 border-slate-300 border-l-[6px] border-l-red-600 shadow-sm hover:shadow-xl transition flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center">
                    <Activity className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-black text-slate-900">
                    Bitácora Diaria de Campo
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Reporte de avance diario de cuadrilla y semáforo verde/rojo de bloqueos o falta de insumos.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-200">
                  <Link
                    href="/bitacora"
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-between transition"
                  >
                    <span>Abrir Bitácora</span>
                    <ChevronRight className="w-4 h-4 text-upt-gold" />
                  </Link>
                </div>
              </div>

              {/* Matriz de Trazabilidad */}
              <div className="bg-white rounded-3xl p-6 border-2 border-slate-300 border-l-[6px] border-l-sky-600 shadow-sm hover:shadow-xl transition flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center">
                    <Network className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-black text-slate-900">
                    Matriz de Trazabilidad
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Árbol completo de relaciones: Requerimiento ➔ Entregable ➔ Línea Base ➔ Solicitud de Cambio.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-200">
                  <Link
                    href="/trazabilidad"
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-between transition"
                  >
                    <span>Explorar Trazabilidad</span>
                    <ChevronRight className="w-4 h-4 text-upt-gold" />
                  </Link>
                </div>
              </div>

              {/* Reportes Oficiales */}
              <div className="bg-white rounded-3xl p-6 border-2 border-slate-300 border-l-[6px] border-l-upt-gold shadow-sm hover:shadow-xl transition flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-upt-gold-700 flex items-center justify-center">
                    <Printer className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-black text-slate-900">
                    Reportes Oficiales (CSA)
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Generación de informes formales de configuración, actas firmables y exportación CSV de artefactos.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-200">
                  <Link
                    href="/reportes"
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-between transition"
                  >
                    <span>Generar Reportes</span>
                    <ChevronRight className="w-4 h-4 text-upt-gold" />
                  </Link>
                </div>
              </div>

              {/* Auditoría de Seguridad */}
              <div className="bg-white rounded-3xl p-6 border-2 border-slate-300 border-l-[6px] border-l-emerald-600 shadow-sm hover:shadow-xl transition flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-black text-slate-900">
                    Historial de Auditoría
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Registro de solo inserción (append-only) de cada acción del sistema: usuario, fecha, IPs y diffs.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-200">
                  <Link
                    href="/auditoria"
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-between transition"
                  >
                    <span>Ver Logs de Auditoría</span>
                    <ChevronRight className="w-4 h-4 text-upt-gold" />
                  </Link>
                </div>
              </div>

              {/* Personal y Roles */}
              <div className="bg-white rounded-3xl p-6 border-2 border-slate-300 border-l-[6px] border-l-purple-600 shadow-sm hover:shadow-xl transition flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-black text-slate-900">
                    Personal & Colaboradores
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Directorio del equipo: roles (Administrador, Aprobador, Solicitante) y control de accesos.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-200">
                  <Link
                    href="/usuarios"
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-between transition"
                  >
                    <span>Administrar Personal</span>
                    <ChevronRight className="w-4 h-4 text-upt-gold" />
                  </Link>
                </div>
              </div>

            </div>
          )}
        </section>

      </main>

      {/* Modal Guía Rápida */}
      <GuiaFlujoModal
        isOpen={guiaModalOpen}
        onClose={() => setGuiaModalOpen(false)}
      />

      {/* Modal Agendar Reunión Directa */}
      <AgendarReunionModal
        isOpen={agendarModalOpen}
        onClose={() => setAgendarModalOpen(false)}
        onSuccess={(nuevaReu) => {
          setReuniones((prev) => [nuevaReu, ...prev]);
        }}
        initialProyectoId={selectedProyectoId}
        initialFecha="2026-11-03"
        proyectos={proyectos}
        usuarios={usuarios}
        currentUserId={user?.userId}
      />
    </div>
  );
}
