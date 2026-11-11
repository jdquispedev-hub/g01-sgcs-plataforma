'use client';

import { useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { fetcher } from '@/lib/fetcher';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  LogOut,
  Layers,
  AlertTriangle,
  Users,
  Briefcase,
  ShieldAlert,
  X,
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
  UserCheck,
  Upload,
  FolderGit2,
  GitPullRequest,
  ArrowUpRight,
} from 'lucide-react';
import GuiaFlujoModal from '@/components/GuiaFlujoModal';
import AgendarReunionModal from '@/components/AgendarReunionModal';
import NavbarPrincipal from '@/components/NavbarPrincipal';
import { getTerminologia } from '@/lib/terminologia';

interface UserData {
  userId: string;
  nombreCompleto: string;
  email: string;
  rol: string;
  organizacionNombre: string;
  rubro: string;
  isSupervising?: boolean;
  originalOrgNombre?: string;
  cargo?: string | null;
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
  const [alertaRestringido, setAlertaRestringido] = useState(false);
  const [moduloRestringido, setModuloRestringido] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('error_acceso') === 'restringido') {
        setAlertaRestringido(true);
        setModuloRestringido(params.get('modulo') || 'solicitado');
      }
    }
  }, []);

  const [user, setUser] = useState<UserData | null>(null);
  const isAdmin = user?.rol === 'ADMINISTRADOR' || user?.rol === 'SUPERADMIN';
  const terminologia = getTerminologia(user?.rubro);
  const [loading, setLoading] = useState(true);
  const [vistaTab, setVistaTab] = useState<'PERSONAL' | 'GENERAL'>('GENERAL');
  const [ecsList, setEcsList] = useState<any[]>([]);

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

  // Modal Crear Proyecto / Obra
  const [crearProyectoModalOpen, setCrearProyectoModalOpen] = useState(false);
  const [nuevoProyCodigo, setNuevoProyCodigo] = useState('');
  const [nuevoProyNombre, setNuevoProyNombre] = useState('');
  const [nuevoProyCliente, setNuevoProyCliente] = useState('');
  const [creandoProy, setCreandoProy] = useState(false);
  const [errorCrearProy, setErrorCrearProy] = useState('');

  // Pestaña de módulos
  const [tabModulo, setTabModulo] = useState<'OPERACION' | 'SUPERVISION'>('OPERACION');
  const [guiaModalOpen, setGuiaModalOpen] = useState(false);

  // Caché SWR en memoria (Stale-While-Revalidate) para navegación instantánea (0ms)
  const { data: dataMe, error: errorMe } = useSWR('/api/auth/me', fetcher, { revalidateOnFocus: false });
  const { data: dataEcs } = useSWR('/api/ecs', fetcher, { revalidateOnFocus: false });
  const { data: dataLb } = useSWR('/api/lineas-base', fetcher, { revalidateOnFocus: false });
  const { data: dataRfc } = useSWR('/api/cambios', fetcher, { revalidateOnFocus: false });
  const { data: dataBloqueos } = useSWR('/api/bitacora/bloqueos-activos', fetcher, { revalidateOnFocus: false });
  const { data: dataAux, mutate: mutateAux } = useSWR('/api/auxiliares', fetcher, { revalidateOnFocus: false });
  const { data: dataReu } = useSWR('/api/reuniones', fetcher, { revalidateOnFocus: false });

  // Solo muestra pantalla de carga bloqueante la PRIMERA VEZ absoluta si no hay nada en caché
  const isInitialLoading = (!dataMe && !errorMe) || !dataEcs || !dataAux;

  useEffect(() => {
    if (dataMe) {
      if (dataMe.success) {
        setUser(dataMe.data.user);
        if (dataMe.data.user.rol === 'SOLICITANTE') {
          setVistaTab('PERSONAL');
        } else {
          setVistaTab('GENERAL');
        }
      } else {
        router.push('/login');
      }
    }
    if (errorMe) {
      router.push('/login');
    }
  }, [dataMe, errorMe, router]);

  useEffect(() => {
    if (dataEcs?.success && Array.isArray(dataEcs.data)) {
      setEcsList(dataEcs.data);
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
  }, [dataEcs]);

  useEffect(() => {
    if (dataLb?.success && Array.isArray(dataLb.data)) {
      setTotalLineasBase(dataLb.data.length);
      const vigentes = dataLb.data.filter((lb: any) => lb.estado === 'VIGENTE').length;
      setLineasVigentes(vigentes);
    }
  }, [dataLb]);

  useEffect(() => {
    if (dataRfc?.success && Array.isArray(dataRfc.data)) {
      setTotalRfc(dataRfc.data.length);
      const pendientes = dataRfc.data.filter(
        (r: any) => r.estado === 'PENDIENTE_EVALUACION' || r.estado === 'EN_EVALUACION'
      ).length;
      setRfcPendientes(pendientes);
    }
  }, [dataRfc]);

  useEffect(() => {
    if (dataBloqueos?.success && Array.isArray(dataBloqueos.data)) {
      setBloqueosActivos(dataBloqueos.data);
    }
  }, [dataBloqueos]);

  useEffect(() => {
    if (dataAux?.success) {
      if (Array.isArray(dataAux.data.proyectos)) {
        setProyectos(dataAux.data.proyectos);
        if (dataAux.data.proyectos.length > 0 && !selectedProyectoId) {
          setSelectedProyectoId(dataAux.data.proyectos[0].id);
        }
      }
      if (Array.isArray(dataAux.data.usuarios)) {
        setUsuarios(dataAux.data.usuarios);
      }
    }
  }, [dataAux, selectedProyectoId]);

  useEffect(() => {
    if (dataReu?.success && Array.isArray(dataReu.data)) {
      setReuniones(dataReu.data);
    }
  }, [dataReu]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const handleCrearProyecto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoProyCodigo.trim() || !nuevoProyNombre.trim() || !nuevoProyCliente.trim()) {
      setErrorCrearProy('Por favor complete todos los campos obligatorios');
      return;
    }
    setCreandoProy(true);
    setErrorCrearProy('');
    try {
      const res = await fetch('/api/proyectos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo: nuevoProyCodigo.trim().toUpperCase(),
          nombre: nuevoProyNombre.trim(),
          cliente_nombre: nuevoProyCliente.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorCrearProy(data.message || 'Error al registrar el proyecto');
        setCreandoProy(false);
        return;
      }

      const nuevo = data.data;
      setProyectos((prev) => [nuevo, ...prev]);
      setSelectedProyectoId(nuevo.id);
      mutateAux();
      setCrearProyectoModalOpen(false);
      setNuevoProyCodigo('');
      setNuevoProyNombre('');
      setNuevoProyCliente('');
    } catch {
      setErrorCrearProy('Error de conexión con el servidor');
    } finally {
      setCreandoProy(false);
    }
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

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#13151A] text-slate-200 gap-3 p-4">
        <div className="w-14 h-14 rounded-2xl bg-[#1A1D25] text-upt-gold border border-white/10 flex items-center justify-center shadow-lg animate-pulse">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <p className="text-sm font-bold text-slate-300">Cargando plataforma SGCS...</p>
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
    : user?.rol === 'SOLICITANTE'
    ? 'Técnico / Responsable'
    : user?.rol === 'APROBADOR'
    ? 'Aprobador / Calidad'
    : user?.rol === 'ADMINISTRADOR'
    ? 'Administrador'
    : user?.rol || 'USUARIO';

  const misEcs = ecsList.filter(
    (e) => e.responsable?.id === user?.userId || e.responsable_id === user?.userId
  );
  const misEcsPendientes = misEcs.filter(
    (e) => !e.versiones || e.versiones.length === 0 || e.versiones.some((v: any) => v.estado === 'PENDIENTE')
  );

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 flex flex-col antialiased selection:bg-upt-gold selection:text-slate-950">
      {/* Top Navbar Responsivo con Drawer Móvil */}
      <NavbarPrincipal user={user} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6">
        
        {/* Alerta de Módulo Restringido (RNF-02) */}
        {alertaRestringido && (
          <div className="p-4 rounded-2xl bg-amber-500 text-upt-navy-950 font-bold border-2 border-amber-600 shadow-xl flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-upt-navy-950 text-upt-gold flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider">Acceso Restringido (RNF-02)</p>
                <p className="text-xs font-medium">
                  El apartado <strong className="underline">&quot;{moduloRestringido}&quot;</strong> está reservado para los Administradores de la empresa. Tu usuario tiene asignado el rol <strong>{user?.rol}</strong>{user?.cargo ? ' (' + user.cargo + ')' : ''}.
                </p>
              </div>
            </div>
            <button
              onClick={() => setAlertaRestringido(false)}
              className="p-1.5 rounded-xl hover:bg-black/10 transition text-upt-navy-950 shrink-0"
              title="Cerrar aviso"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        
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

        {/* Selector de Modo de Vista (Segmented Control Estilo Linear / macOS) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0C1527] p-2 rounded-2xl border border-white/10 shadow-sm">
          <div className="bg-slate-900/80 p-1 rounded-xl inline-flex items-center gap-1 border border-white/5">
            <button
              type="button"
              onClick={() => setVistaTab('PERSONAL')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                vistaTab === 'PERSONAL'
                  ? 'bg-gradient-to-r from-upt-gold to-amber-400 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <UserCheck className={`w-3.5 h-3.5 ${vistaTab === 'PERSONAL' ? 'text-slate-950 stroke-[2.5]' : 'text-slate-400'}`} />
              <span>Mi Trabajo a Cargo</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-semibold border ${
                vistaTab === 'PERSONAL'
                  ? 'bg-slate-950/20 text-slate-950 border-slate-950/20'
                  : 'bg-white/10 text-slate-300 border-white/10'
              }`}>
                {misEcs.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setVistaTab('GENERAL')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                vistaTab === 'GENERAL'
                  ? 'bg-gradient-to-r from-upt-gold to-amber-400 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Compass className={`w-3.5 h-3.5 ${vistaTab === 'GENERAL' ? 'text-slate-950 stroke-[2.5]' : 'text-slate-400'}`} />
              <span>Panorama de la Obra</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 font-medium px-2">
            {vistaTab === 'PERSONAL'
              ? 'Tus entregables y bitácora técnica prioritaria'
              : 'Pipeline contractual, agenda de reuniones y líneas base'}
          </div>
        </div>

        {/* VISTA PERSONAL: MI ESPACIO DE TRABAJO */}
        {vistaTab === 'PERSONAL' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Banner de Bienvenida del Colaborador */}
            <div className="bg-[#0C1527] rounded-3xl p-6 sm:p-7 text-white border border-white/10 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-13 h-13 rounded-2xl bg-[#13233F] border border-sky-400/30 flex items-center justify-center text-sky-300 shadow shrink-0">
                  <UserCheck className="w-6 h-6 text-sky-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-sky-300 tracking-wide uppercase">
                      Espacio Operativo de Colaborador
                    </span>
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-sky-200 border border-white/15">
                      {displayRole}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                    Hola, {displayName}
                  </h2>
                  <p className="text-xs text-slate-300 mt-1">
                    Proyecto Activo: <strong className="text-white">{activeProyecto?.nombre || 'Obra Asignada'}</strong>
                    {activeProyecto?.cliente_nombre ? ` • Cliente: ${activeProyecto.cliente_nombre}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/bitacora"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-upt-gold to-amber-400 hover:brightness-110 text-slate-950 font-bold text-xs shadow-sm transition active:scale-95 flex items-center gap-2"
                >
                  <Activity className="w-4 h-4 text-slate-950" />
                  <span>Reportar Bitácora de Hoy</span>
                </Link>
              </div>
            </div>

            {/* 3 KPIs Personales del Usuario */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#0C1527] p-5 rounded-2xl border border-white/10 shadow-md flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/30">
                  <Layers className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Mis {terminologia.ecsLabelPlural}
                  </p>
                  <p className="text-2xl font-black text-white mt-0.5">{misEcs.length}</p>
                  <p className="text-[10px] text-slate-400 font-medium">Bajo tu responsabilidad técnica</p>
                </div>
              </div>

              <div className="bg-[#0C1527] p-5 rounded-2xl border border-white/10 shadow-md flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Entregas Pendientes
                  </p>
                  <p className="text-2xl font-black text-amber-400 mt-0.5">{misEcsPendientes.length}</p>
                  <p className="text-[10px] text-slate-400 font-medium">Requieren subir versión o dictamen</p>
                </div>
              </div>

              <div className="bg-[#0C1527] p-5 rounded-2xl border border-white/10 shadow-md flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Bitácora de Campo
                  </p>
                  <p className="text-base font-bold text-emerald-400 mt-0.5">Semáforo Activo</p>
                  <p className="text-[10px] text-slate-400 font-medium">Reporta jornada y bloqueos diarios</p>
                </div>
              </div>
            </div>

            {/* Sección de Artefactos Asignados */}
            <div className="bg-[#0C1527] rounded-3xl p-6 sm:p-7 border border-white/10 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-upt-gold" />
                    <span>Mis {terminologia.ecsLabelPlural} Asignados</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Entregables y partidas donde figuras formalmente como Responsable Técnico directo.
                  </p>
                </div>
                <Link
                  href="/ecs"
                  className="text-xs font-bold text-upt-gold hover:text-amber-300 flex items-center gap-1 shrink-0"
                >
                  <span>Ver Catálogo Completo</span>
                  <ArrowRight className="w-3.5 h-3.5 text-upt-gold" />
                </Link>
              </div>

              {misEcs.length === 0 ? (
                <div className="bg-[#070D18] rounded-2xl p-8 border border-dashed border-white/10 text-center space-y-3">
                  <Layers className="w-10 h-10 text-slate-500 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-200">
                      Aún no tienes {terminologia.ecsLabelPlural.toLowerCase()} asignados directamente
                    </h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      El Administrador de la obra te asignará como Responsable Técnico al dar de alta nuevos planos o partidas en el Catálogo ECS.
                    </p>
                  </div>
                  <Link
                    href="/ecs"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold shadow-sm transition border border-white/10"
                  >
                    <Compass className="w-4 h-4 text-sky-400" />
                    <span>Explorar Catálogo de la Obra</span>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {misEcs.map((ecs: any) => {
                    const ultimaVersion = ecs.versiones?.[0];
                    const sinVersiones = !ecs.versiones || ecs.versiones.length === 0;
                    const esAprobada = ultimaVersion?.estado === 'APROBADA';

                    return (
                      <div
                        key={ecs.id}
                        className="bg-[#070D18] hover:bg-[#0C1527] p-5 rounded-2xl border border-white/10 hover:border-white/20 transition shadow-md space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-white/10 text-slate-200 border border-white/15">
                              {ecs.codigo}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/15 flex items-center gap-1">
                              <UserCheck className="w-3 h-3 text-slate-400" /> A tu cargo
                            </span>
                          </div>

                          <h4 className="text-sm font-black text-white leading-snug">
                            {ecs.nombre}
                          </h4>
                          {ecs.descripcion && (
                            <p className="text-xs text-slate-400 line-clamp-2">
                              {ecs.descripcion}
                            </p>
                          )}

                          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                            <span className="text-slate-400 font-medium">Estado de Entrega:</span>
                            {sinVersiones ? (
                              <span className="font-semibold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md inline-flex items-center gap-1 text-[11px]">
                                <Clock className="w-3 h-3 text-amber-400" /> Sin versión registrada
                              </span>
                            ) : esAprobada ? (
                              <span className="font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md inline-flex items-center gap-1 text-[11px]">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Aprobada v{ultimaVersion.numero_version}
                              </span>
                            ) : (
                              <span className="font-semibold text-sky-300 bg-sky-500/15 border border-sky-500/30 px-2 py-0.5 rounded-md inline-flex items-center gap-1 text-[11px]">
                                <Clock className="w-3 h-3 text-sky-400" /> En Dictamen v{ultimaVersion.numero_version}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="pt-2 flex items-center gap-2">
                          <Link
                            href={`/ecs/${ecs.id}`}
                            className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm border border-white/10"
                          >
                            {sinVersiones ? (
                              <>
                                <Upload className="w-3.5 h-3.5 text-sky-400" />
                                <span>Registrar Versión v1.0.0</span>
                              </>
                            ) : (
                              <>
                                <span>Ver Expediente Completo</span>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                              </>
                            )}
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tarjeta de Bitácora Diaria y Semáforo de Bloqueo */}
            <div className="bg-[#0C1527] rounded-3xl p-6 text-white border border-white/10 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <Activity className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-full inline-block">
                    Control de Campo en Tiempo Real
                  </span>
                  <h4 className="text-base font-black text-white mt-0.5">
                    Reporte Diario de Jornada y Detección de Bloqueos
                  </h4>
                  <p className="text-xs text-slate-300">
                    Informa tus avances de hoy y activa el indicador si tu trabajo está detenido por falta de insumos o planos.
                  </p>
                </div>
              </div>
              <Link
                href="/bitacora"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-upt-gold to-amber-400 hover:brightness-110 text-slate-950 font-bold text-xs shadow-sm transition active:scale-95 flex items-center justify-center gap-2 shrink-0"
              >
                <span>Ir a la Bitácora Diaria</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </Link>
            </div>
          </div>
        )}

        {/* VISTA GENERAL: PIPELINE Y AGENDA DE REUNIONES */}
        {vistaTab === 'GENERAL' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* SECCIÓN CENTRAL: PROYECTO ACTIVO Y AGENDA DE REUNIONES */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Lado Izquierdo: Ficha del Proyecto y Pipeline de 5 Pasos (7 cols) */}
          <section className="lg:col-span-7 bg-[#0C1527] rounded-3xl p-6 sm:p-7 border border-white/10 shadow-xl flex flex-col justify-between space-y-5">
            <div className="space-y-4">
            {proyectos.length === 0 ? (
              <div className="bg-[#070D18] rounded-2xl p-6 sm:p-8 border border-dashed border-white/15 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-white/5 text-slate-300 flex items-center justify-center mx-auto border border-white/10">
                  {user?.rubro === 'CONSTRUCCION' ? (
                    <Building className="w-6 h-6 text-slate-300" />
                  ) : (
                    <Briefcase className="w-6 h-6 text-slate-300" />
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-300 bg-white/10 px-2 py-0.5 rounded-md inline-block">
                    {terminologia.badgeIndustria}
                  </span>
                  <h3 className="text-base font-bold text-white">
                    No hay {terminologia.proyectoLabelPlural.toLowerCase()} registrados
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                    {terminologia.recomendaciones.sinProyectos}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                  {isAdmin ? (
                    <>
                      <button
                        onClick={() => setCrearProyectoModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-upt-gold to-amber-400 text-slate-950 font-bold text-xs shadow-xs transition active:scale-95 inline-flex items-center gap-2 hover:brightness-110"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>Registrar {terminologia.proyectoLabel}</span>
                      </button>
                      <Link
                        href="/usuarios"
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-medium text-xs shadow-xs transition active:scale-95 inline-flex items-center gap-2 border border-white/10"
                      >
                        <Users className="w-4 h-4 text-indigo-400" />
                        <span>Gestionar Personal</span>
                      </Link>
                    </>
                  ) : (
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-center max-w-sm">
                      <p className="text-xs text-slate-300 font-semibold">
                        Tu organización aún no tiene {terminologia.proyectoLabel.toLowerCase()} activo asignado.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Selector de Proyecto Activo */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-upt-gold bg-upt-gold/10 px-2.5 py-0.5 rounded-md border border-upt-gold/30 inline-flex items-center gap-1.5 mb-1 shadow-2xs">
                      <Building className="w-3 h-3 text-upt-gold" />
                      <span>{terminologia.proyectoLabel} Seleccionado</span>
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <span>{activeProyecto?.nombre}</span>
                      <span className="text-xs font-mono font-bold text-slate-300 bg-white/10 px-2.5 py-0.5 rounded-md border border-white/15">
                        {activeProyecto?.codigo}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Cliente Oficial: <strong className="text-slate-200">{activeProyecto?.cliente_nombre || 'Sin cliente asignado'}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={selectedProyectoId}
                      onChange={(e) => setSelectedProyectoId(e.target.value)}
                      className="px-3 py-1.5 bg-[#070D18] border border-white/15 rounded-xl text-xs font-medium text-slate-200 focus:bg-[#070D18] focus:border-upt-gold transition cursor-pointer max-w-[200px] truncate"
                    >
                      {proyectos.map((p) => (
                        <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                          {p.codigo} - {p.nombre}
                        </option>
                      ))}
                    </select>
                    {isAdmin && (
                      <button
                        onClick={() => setCrearProyectoModalOpen(true)}
                        className="p-1.5 rounded-xl bg-gradient-to-r from-upt-gold to-amber-400 text-slate-950 font-bold hover:brightness-110 transition shadow-xs shrink-0 active:scale-95 flex items-center justify-center"
                        title={`Registrar Nuevo(a) ${terminologia.proyectoLabel}`}
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Siguiente Paso Recomendado */}
                <div className="bg-gradient-to-r from-blue-950/40 via-sky-950/20 to-transparent border border-sky-500/30 rounded-2xl p-3.5 flex items-start gap-3 shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Clock className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block">
                      Acción Recomendada Ahora:
                    </span>
                    <p className="text-xs font-medium text-slate-200 leading-snug">
                      {versionesPendientes > 0
                        ? terminologia.recomendaciones.pendientesAprobacion(versionesPendientes)
                        : lineasVigentes === 0
                        ? terminologia.recomendaciones.sinLineaBase
                        : terminologia.recomendaciones.lineaBaseVigente}
                    </p>
                  </div>
                </div>
              </>
            )}

              {/* Pipeline Guiado de 5 Pasos Interactivos con Iconografía Rica */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Flujo Contractual del Proyecto:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2.5">
                  <Link
                    href="/reuniones"
                    className="p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-white transition flex flex-col justify-between shadow-2xs active:scale-95 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">1. Minutas</span>
                      <CalendarDays className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-xs font-bold text-white mt-1">Reuniones</span>
                    <span className="text-[10px] text-amber-300 font-medium">Pactos</span>
                  </Link>

                  <Link
                    href="/ecs"
                    className="p-3 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-white transition flex flex-col justify-between shadow-2xs active:scale-95 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-teal-400 uppercase tracking-wider">2. Catálogo</span>
                      <Layers className="w-3.5 h-3.5 text-teal-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-xs font-bold text-white mt-1">Entregables</span>
                    <span className="text-[10px] text-teal-300 font-medium">{totalEcs} ECS</span>
                  </Link>

                  <Link
                    href="/aprobaciones"
                    className={`p-3 rounded-xl border transition flex flex-col justify-between shadow-2xs active:scale-95 group ${
                      versionesPendientes > 0
                        ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-400 text-white font-bold'
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-bold uppercase tracking-wider ${
                        versionesPendientes > 0 ? 'text-amber-300 font-extrabold' : 'text-emerald-400'
                      }`}>
                        3. Dictamen
                      </span>
                      <ShieldCheck className={`w-3.5 h-3.5 ${
                        versionesPendientes > 0 ? 'text-amber-300 animate-pulse' : 'text-emerald-400'
                      } group-hover:scale-110 transition-transform`} />
                    </div>
                    <span className="text-xs font-bold mt-1">Aprobación</span>
                    <span className={`text-[10px] font-semibold ${
                      versionesPendientes > 0 ? 'text-amber-300' : 'text-emerald-300'
                    }`}>
                      {versionesPendientes > 0 ? `${versionesPendientes} Por Ver` : 'Al día'}
                    </span>
                  </Link>

                  <Link
                    href="/lineas-base"
                    className={`p-3 rounded-xl border transition flex flex-col justify-between shadow-2xs active:scale-95 group ${
                      lineasVigentes > 0
                        ? 'bg-purple-500/15 hover:bg-purple-500/25 border-purple-500/30 text-white'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-purple-300">4. Hito</span>
                      <Lock className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-xs font-bold text-white mt-1">Línea Base</span>
                    <span className="text-[10px] text-purple-300 font-medium">
                      {lineasVigentes > 0 ? `${lineasVigentes} Vigente` : 'Pendiente'}
                    </span>
                  </Link>

                  <Link
                    href="/cambios"
                    className="col-span-2 sm:col-span-3 xl:col-span-1 p-3 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-white transition flex flex-col justify-between shadow-2xs active:scale-95 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-orange-400">5. Control</span>
                      <AlertTriangle className="w-3.5 h-3.5 text-orange-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-xs font-bold text-white mt-1">Cambios RFC</span>
                    <span className="text-[10px] text-orange-300 font-medium">
                      {rfcPendientes > 0 ? `${rfcPendientes} Activos` : '0 RFCs'}
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Línea de tiempo cronológica completa
              </span>
              <Link
                href="/cronograma"
                className="text-xs font-semibold text-upt-gold hover:text-amber-300 flex items-center gap-1 transition"
              >
                <span>Ver Canvas Vivo</span>
                <ArrowRight className="w-3.5 h-3.5 text-upt-gold" />
              </Link>
            </div>
          </section>

          {/* Lado Derecho: Widget de Agenda de Reuniones (5 cols) */}
          <section className="lg:col-span-5 bg-gradient-to-br from-[#0B2545] via-[#0C1A30] to-[#070D18] rounded-3xl p-6 text-white border border-white/10 shadow-xl flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-300 border border-sky-500/30">
                    <CalendarDays className="w-4 h-4 text-sky-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Agenda de Sesiones</h3>
                    <p className="text-[10px] text-sky-200/80">Reuniones de coordinación y cliente</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold bg-white/10 text-sky-200 px-2.5 py-0.5 rounded-full border border-white/15">
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
                      className="bg-white/5 hover:bg-white/10 p-3 rounded-2xl border border-white/10 transition space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            isCliente ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          }`}
                        >
                          {isCliente ? <Handshake className="w-3 h-3 inline" /> : <Users className="w-3 h-3 inline" />}
                          <span>{isCliente ? 'Con Cliente' : 'Equipo'}</span>
                        </span>
                        <span className="font-mono text-[10px] text-sky-200 font-bold">
                          {fechaStr} • {r.hora || '10:00'}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white leading-snug truncate">
                        {r.titulo}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate">
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
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/10"
              >
                <span>Ver Calendario</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setAgendarModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-upt-gold to-amber-400 hover:brightness-110 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>+ Agendar</span>
              </button>
            </div>
          </section>

        </div>

        {/* ========================================================
           ACCIONES RÁPIDAS (Atajos de 1 clic) con Iconos Vivos
           ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => setAgendarModalOpen(true)}
            className="p-4 rounded-2xl bg-[#0C1527] hover:bg-[#111C33] border border-white/10 hover:border-amber-400/50 shadow-md transition flex items-center gap-3 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 group-hover:scale-105 transition-transform">
              <CalendarDays className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="font-bold text-xs text-white block group-hover:text-amber-300 transition">
                Agendar Reunión
              </span>
              <span className="text-[10px] text-slate-400">Minuta con cliente o equipo</span>
            </div>
          </button>

          <Link
            href="/cronograma"
            className="p-4 rounded-2xl bg-[#0C1527] hover:bg-[#111C33] border border-white/10 hover:border-sky-400/50 shadow-md transition flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <span className="font-bold text-xs text-white block group-hover:text-sky-300 transition">
                Línea de Tiempo (Canvas)
              </span>
              <span className="text-[10px] text-slate-400">Roadmap cronológico</span>
            </div>
          </Link>

          <Link
            href="/ecs"
            className="p-4 rounded-2xl bg-[#0C1527] hover:bg-[#111C33] border border-white/10 hover:border-teal-400/50 shadow-md transition flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/30 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <span className="font-bold text-xs text-white block group-hover:text-teal-300 transition">
                Catálogo de Entregables
              </span>
              <span className="text-[10px] text-slate-400">{terminologia.modulos.ecsAtajoSubtitulo}</span>
            </div>
          </Link>

          <Link
            href="/lineas-base/nueva"
            className="p-4 rounded-2xl bg-[#0C1527] hover:bg-[#111C33] border border-white/10 hover:border-purple-400/50 shadow-md transition flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30 group-hover:scale-105 transition-transform">
              <Lock className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <span className="font-bold text-xs text-white block group-hover:text-purple-300 transition">
                Congelar Hito Oficial
              </span>
              <span className="text-[10px] text-slate-400">{terminologia.lineaBaseLabel}</span>
            </div>
          </Link>
        </div>
      </div>
    )}

        {/* ========================================================
           SECCIÓN DE MÓDULOS ORGANIZADOS EN PESTAÑAS LIMPIAS
           ======================================================== */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Módulos de Trabajo y Control
              </h2>
              <p className="text-xs text-slate-400">
                Herramientas del sistema según la etapa de tu jornada técnica
              </p>
            </div>

            {/* Pestañas de Organización */}
            <div className="bg-[#0C1527] p-1 rounded-xl inline-flex items-center gap-1 border border-white/10">
              <button
                onClick={() => setTabModulo('OPERACION')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  tabModulo === 'OPERACION'
                    ? 'bg-gradient-to-r from-upt-gold to-amber-400 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Briefcase className={`w-3.5 h-3.5 ${tabModulo === 'OPERACION' ? 'text-slate-950 stroke-[2.5]' : 'text-slate-400'}`} />
                <span>Operación del Proyecto (6)</span>
              </button>
              <button
                onClick={() => setTabModulo('SUPERVISION')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  tabModulo === 'SUPERVISION'
                    ? 'bg-gradient-to-r from-upt-gold to-amber-400 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <ShieldCheck className={`w-3.5 h-3.5 ${tabModulo === 'SUPERVISION' ? 'text-slate-950 stroke-[2.5]' : 'text-slate-400'}`} />
                <span>Supervisión & Bitácora (5)</span>
              </button>
            </div>
          </div>

          {/* Pestaña 1: Operación del Proyecto */}
          {tabModulo === 'OPERACION' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Card Reuniones */}
              <div className="bg-[#0C1527] rounded-3xl p-5 border border-white/10 hover:border-amber-400/50 shadow-md transition flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                      <CalendarDays className="w-5 h-5 text-amber-400" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Paso 1
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition">
                      {terminologia.modulos.reuniones.titulo}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {terminologia.modulos.reuniones.descripcion}
                    </p>
                  </div>
                </div>
                <div className="pt-3 mt-3 border-t border-white/10">
                  <Link
                    href="/reuniones"
                    className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs flex items-center justify-between transition border border-white/10 group-hover:border-amber-400/30"
                  >
                    <span>Abrir Calendario</span>
                    <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                  </Link>
                </div>
              </div>

              {/* Card Canvas */}
              <div className="bg-[#0C1527] rounded-3xl p-5 border border-white/10 hover:border-sky-400/50 shadow-md transition flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                      <Sparkles className="w-5 h-5 text-sky-400" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      Roadmap
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition">
                      {terminologia.modulos.canvas.titulo}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {terminologia.modulos.canvas.descripcion}
                    </p>
                  </div>
                </div>
                <div className="pt-3 mt-3 border-t border-white/10">
                  <Link
                    href="/cronograma"
                    className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs flex items-center justify-between transition border border-white/10 group-hover:border-sky-400/30"
                  >
                    <span>Ver Canvas Vivo</span>
                    <ChevronRight className="w-3.5 h-3.5 text-sky-400" />
                  </Link>
                </div>
              </div>

              {/* Card Entregables ECS */}
              <div className="bg-[#0C1527] rounded-3xl p-5 border border-white/10 hover:border-teal-400/50 shadow-md transition flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/30 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                      <Layers className="w-5 h-5 text-teal-400" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      Paso 2
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-teal-300 transition">
                      {terminologia.modulos.ecs.titulo}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {terminologia.modulos.ecs.descripcion}
                    </p>
                  </div>
                  <div className="text-[11px] text-teal-300 font-semibold bg-teal-500/10 p-2 rounded-xl border border-teal-500/20">
                    Total: {totalEcs} entregables registrados
                  </div>
                </div>
                <div className="pt-3 mt-3 border-t border-white/10">
                  <Link
                    href="/ecs"
                    className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs flex items-center justify-between transition border border-white/10 group-hover:border-teal-400/30"
                  >
                    <span>Explorar Entregables</span>
                    <ChevronRight className="w-3.5 h-3.5 text-teal-400" />
                  </Link>
                </div>
              </div>

              {/* Card Aprobaciones */}
              <div className="bg-[#0C1527] rounded-3xl p-5 border border-white/10 hover:border-emerald-400/50 shadow-md transition flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Paso 3
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
                      {terminologia.modulos.aprobaciones.titulo}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {terminologia.modulos.aprobaciones.descripcion}
                    </p>
                  </div>
                  <div className="text-[11px] text-amber-300 font-semibold bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                    Pendientes: {versionesPendientes} versiones
                  </div>
                </div>
                <div className="pt-3 mt-3 border-t border-white/10">
                  <Link
                    href="/aprobaciones"
                    className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs flex items-center justify-between transition border border-white/10 group-hover:border-emerald-400/30"
                  >
                    <span>Bandeja Técnica</span>
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
                  </Link>
                </div>
              </div>

              {/* Card Líneas Base */}
              <div className="bg-[#0C1527] rounded-3xl p-5 border border-white/10 hover:border-purple-400/50 shadow-md transition flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                      <Lock className="w-5 h-5 text-purple-400" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Paso 4
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition">
                      {terminologia.modulos.lineasBase.titulo}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {terminologia.modulos.lineasBase.descripcion}
                    </p>
                  </div>
                  <div className="text-[11px] text-purple-300 font-semibold bg-purple-500/10 p-2 rounded-xl border border-purple-500/20">
                    Vigentes: {lineasVigentes} de {totalLineasBase}
                  </div>
                </div>
                <div className="pt-3 mt-3 border-t border-white/10">
                  <Link
                    href="/lineas-base"
                    className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs flex items-center justify-between transition border border-white/10 group-hover:border-purple-400/30"
                  >
                    <span>Ver Líneas Base</span>
                    <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
                  </Link>
                </div>
              </div>

              {/* Card Cambios RFC */}
              <div className="bg-[#0C1527] rounded-3xl p-5 border border-white/10 hover:border-orange-400/50 shadow-md transition flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-400 border border-orange-500/30 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                      <AlertTriangle className="w-5 h-5 text-orange-400" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-orange-500/20 text-orange-300 border border-orange-500/30">
                      Paso 5
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-orange-300 transition">
                      {terminologia.modulos.cambios.titulo}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {terminologia.modulos.cambios.descripcion}
                    </p>
                  </div>
                  <div className="text-[11px] text-orange-300 font-semibold bg-orange-500/10 p-2 rounded-xl border border-orange-500/20">
                    Pendientes: {rfcPendientes} de {totalRfc}
                  </div>
                </div>
                <div className="pt-3 mt-3 border-t border-white/10">
                  <Link
                    href="/cambios"
                    className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs flex items-center justify-between transition border border-white/10 group-hover:border-orange-400/30"
                  >
                    <span>Gestionar Cambios</span>
                    <ChevronRight className="w-3.5 h-3.5 text-orange-400" />
                  </Link>
                </div>
              </div>

            </div>
          )}

          {/* Pestaña 2: Supervisión y Control */}
          {tabModulo === 'SUPERVISION' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Bitácora de Campo */}
              <div className="bg-[#0C1527] rounded-3xl p-5 border border-white/10 hover:border-red-400/50 shadow-md transition flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    <Activity className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-red-300 transition">
                      {terminologia.modulos.bitacora.titulo}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {terminologia.modulos.bitacora.descripcion}
                    </p>
                  </div>
                </div>
                <div className="pt-3 mt-3 border-t border-white/10">
                  <Link
                    href="/bitacora"
                    className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs flex items-center justify-between transition border border-white/10 group-hover:border-red-400/30"
                  >
                    <span>Abrir Bitácora</span>
                    <ChevronRight className="w-3.5 h-3.5 text-red-400" />
                  </Link>
                </div>
              </div>

              {/* Matriz de Trazabilidad */}
              <div className="bg-[#0C1527] rounded-3xl p-5 border border-white/10 hover:border-blue-400/50 shadow-md transition flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    <Network className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition">
                      {terminologia.modulos.trazabilidad.titulo}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {terminologia.modulos.trazabilidad.descripcion}
                    </p>
                  </div>
                </div>
                <div className="pt-3 mt-3 border-t border-white/10">
                  <Link
                    href="/trazabilidad"
                    className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs flex items-center justify-between transition border border-white/10 group-hover:border-blue-400/30"
                  >
                    <span>Explorar Trazabilidad</span>
                    <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
                  </Link>
                </div>
              </div>

              {/* Reportes Oficiales */}
              <div className="bg-[#0C1527] rounded-3xl p-5 border border-white/10 hover:border-amber-400/50 shadow-md transition flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    <Printer className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition">
                      {terminologia.modulos.reportes.titulo}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {terminologia.modulos.reportes.descripcion}
                    </p>
                  </div>
                </div>
                <div className="pt-3 mt-3 border-t border-white/10">
                  <Link
                    href="/reportes"
                    className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs flex items-center justify-between transition border border-white/10 group-hover:border-amber-400/30"
                  >
                    <span>Generar Reportes</span>
                    <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                  </Link>
                </div>
              </div>

              {isAdmin ? (
                <>
                  {/* Auditoría de Seguridad (Solo Administradores) */}
                  <div className="bg-[#0C1527] rounded-3xl p-5 border border-white/10 hover:border-emerald-400/50 shadow-md transition flex flex-col justify-between group">
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                        <Terminal className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
                          Historial de Auditoría
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          Registro inmutable append-only de cada acción del sistema: usuario, fecha, IPs y diffs.
                        </p>
                      </div>
                    </div>
                    <div className="pt-3 mt-3 border-t border-white/10">
                      <Link
                        href="/auditoria"
                        className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs flex items-center justify-between transition border border-white/10 group-hover:border-emerald-400/30"
                      >
                        <span>Ver Logs de Auditoría</span>
                        <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
                      </Link>
                    </div>
                  </div>

                  {/* Personal y Roles (Solo Administradores) */}
                  <div className="bg-[#0C1527] rounded-3xl p-5 border border-white/10 hover:border-indigo-400/50 shadow-md transition flex flex-col justify-between group">
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                        <Users className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">
                          Personal & Colaboradores
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          Directorio del equipo: roles (Administrador, Aprobador, Solicitante) y control de accesos.
                        </p>
                      </div>
                    </div>
                    <div className="pt-3 mt-3 border-t border-white/10">
                      <Link
                        href="/usuarios"
                        className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs flex items-center justify-between transition border border-white/10 group-hover:border-indigo-400/30"
                      >
                        <span>Administrar Personal</span>
                        <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
                      </Link>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Bitácora Diaria de Campo (Para Colaboradores Operativos) */}
                  <div className="bg-[#0C1527] rounded-3xl p-5 border border-white/10 hover:border-teal-400/50 shadow-md transition flex flex-col justify-between group">
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/30 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                        <Activity className="w-5 h-5 text-teal-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-teal-300 transition">
                          {terminologia.modulos.bitacora.titulo}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {terminologia.modulos.bitacora.descripcion}
                        </p>
                      </div>
                    </div>
                    <div className="pt-3 mt-3 border-t border-white/10">
                      <Link
                        href="/bitacora"
                        className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs flex items-center justify-between transition border border-white/10 group-hover:border-teal-400/30"
                      >
                        <span>Ir a Mi Bitácora</span>
                        <ChevronRight className="w-3.5 h-3.5 text-teal-400" />
                      </Link>
                    </div>
                  </div>

                  {/* Solicitudes de Cambio RFC (Para Colaboradores Operativos) */}
                  <div className="bg-[#0C1527] rounded-3xl p-5 border border-white/10 hover:border-rose-400/50 shadow-md transition flex flex-col justify-between group">
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                        <AlertTriangle className="w-5 h-5 text-rose-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-rose-300 transition">
                          {terminologia.modulos.cambios.titulo}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {terminologia.modulos.cambios.descripcion}
                        </p>
                      </div>
                    </div>
                    <div className="pt-3 mt-3 border-t border-white/10">
                      <Link
                        href="/cambios"
                        className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs flex items-center justify-between transition border border-white/10 group-hover:border-rose-400/30"
                      >
                        <span>Ver Solicitudes de Cambio</span>
                        <ChevronRight className="w-3.5 h-3.5 text-rose-400" />
                      </Link>
                    </div>
                  </div>
                </>
              )}

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

      {/* Modal Registrar Nuevo Proyecto / Obra Civil */}
      {crearProyectoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150 my-6">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-200 bg-[#0B2545] px-2.5 py-0.5 rounded-full inline-block mb-1">
                  Nuevo(a) {terminologia.proyectoLabel}
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Registrar Nuevo(a) {terminologia.proyectoLabel}
                </h3>
              </div>
              <button
                onClick={() => setCrearProyectoModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            {errorCrearProy && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorCrearProy}</span>
              </div>
            )}

            <form onSubmit={handleCrearProyecto} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Código Único ({terminologia.proyectoLabel}) *
                </label>
                <input
                  type="text"
                  required
                  value={nuevoProyCodigo}
                  onChange={(e) => setNuevoProyCodigo(e.target.value.toUpperCase())}
                  placeholder={`Ej: ${terminologia.proyectoCodigoEjemplo}`}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:border-[#0B2545] focus:bg-white bg-slate-50 transition outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Nombre Completo ({terminologia.proyectoLabel}) *
                </label>
                <input
                  type="text"
                  required
                  value={nuevoProyNombre}
                  onChange={(e) => setNuevoProyNombre(e.target.value)}
                  placeholder={terminologia.proyectoPlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 focus:border-[#0B2545] focus:bg-white bg-slate-50 transition outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  {terminologia.clienteLabel} *
                </label>
                <input
                  type="text"
                  required
                  value={nuevoProyCliente}
                  onChange={(e) => setNuevoProyCliente(e.target.value)}
                  placeholder={terminologia.clientePlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 focus:border-[#0B2545] focus:bg-white bg-slate-50 transition outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCrearProyectoModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creandoProy}
                  className="px-5 py-2 rounded-xl bg-[#0B2545] hover:bg-[#133A66] text-white font-semibold transition shadow-xs active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {creandoProy ? (
                    <span>Registrando...</span>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>
                        Crear {terminologia.proyectoLabel}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
