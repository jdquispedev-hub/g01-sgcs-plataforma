'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  LogOut,
  Building,
  GraduationCap,
  Plus,
  Search,
  Users,
  FolderGit2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Power,
  Loader2,
  Sparkles,
  Laptop,
  Stethoscope,
  HardHat,
  AlertTriangle,
  RefreshCw,
  Eye,
  Key,
  Mail,
  User,
  X,
} from 'lucide-react';

interface OrganizacionData {
  id: string;
  nombre: string;
  rubro: 'SOFTWARE' | 'VETERINARIA' | 'CONSTRUCCION' | 'OTRO';
  activo: boolean;
  created_at: string;
  _count: {
    usuarios: number;
    proyectos: number;
  };
  usuarios: {
    id: string;
    nombre_completo: string;
    email: string;
    activo: boolean;
  }[];
}

interface MetricasData {
  totalOrganizaciones: number;
  organizacionesActivas: number;
  totalUsuarios: number;
  totalProyectos: number;
}

interface UserSession {
  userId: string;
  nombreCompleto: string;
  email: string;
  rol: string;
  organizacionNombre: string;
  rubro: string;
}

export default function SuperAdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [organizaciones, setOrganizaciones] = useState<OrganizacionData[]>([]);
  const [metricas, setMetricas] = useState<MetricasData>({
    totalOrganizaciones: 0,
    organizacionesActivas: 0,
    totalUsuarios: 0,
    totalProyectos: 0,
  });

  // Filtros y búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRubro, setSelectedRubro] = useState<string>('TODOS');

  // Estado del Modal de Nueva Organización
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formNombre, setFormNombre] = useState('');
  const [formRubro, setFormRubro] = useState<'SOFTWARE' | 'VETERINARIA' | 'CONSTRUCCION' | 'OTRO'>('SOFTWARE');
  const [formAdminNombre, setFormAdminNombre] = useState('');
  const [formAdminEmail, setFormAdminEmail] = useState('');
  const [formAdminPassword, setFormAdminPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  // Estados de carga de acciones
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Carga inicial de datos
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/superadmin/organizaciones');
      const data = await res.json();

      if (res.ok && data.success) {
        setOrganizaciones(data.data.organizaciones);
        setMetricas(data.data.metricas);
        setUser(data.data.currentUser);
      } else {
        if (res.status === 403) {
          router.push('/dashboard');
        } else if (res.status === 401) {
          router.push('/login');
        }
      }
    } catch (err) {
      console.error('Error al cargar organizaciones:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Cerrar sesión
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  // Alternar estado activo / suspendido de organización
  const handleToggleEstado = async (org: OrganizacionData) => {
    const nuevoEstado = !org.activo;
    const confirmMsg = nuevoEstado
      ? `¿Desea reactivar el acceso a la empresa "${org.nombre}"?`
      : `¿Está seguro de suspender a la empresa "${org.nombre}"? Ningún usuario podrá ingresar mientras esté suspendida.`;

    if (!confirm(confirmMsg)) return;

    try {
      setActionLoadingId(org.id);
      const res = await fetch(`/api/superadmin/organizaciones/${org.id}/toggle-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: nuevoEstado }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setOrganizaciones((prev) =>
          prev.map((o) => (o.id === org.id ? { ...o, activo: nuevoEstado } : o))
        );
        setMetricas((prev) => ({
          ...prev,
          organizacionesActivas: nuevoEstado
            ? prev.organizacionesActivas + 1
            : prev.organizacionesActivas - 1,
        }));
        setFeedbackMsg({
          tipo: 'success',
          texto: `La empresa "${org.nombre}" fue ${nuevoEstado ? 'activada' : 'suspendida'} correctamente.`,
        });
      } else {
        setFeedbackMsg({
          tipo: 'error',
          texto: data.message || 'No se pudo cambiar el estado de la organización',
        });
      }
    } catch {
      setFeedbackMsg({
        tipo: 'error',
        texto: 'Error de red al actualizar estado',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Supervisar entorno de una organización (Impersonation)
  const handleSupervisarEntorno = async (org: OrganizacionData) => {
    try {
      setActionLoadingId(org.id);
      const res = await fetch('/api/superadmin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizacionId: org.id }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        window.location.href = '/dashboard';
      } else {
        alert(data.message || 'No se pudo iniciar el modo supervisión');
      }
    } catch {
      alert('Error al conectar con el servidor de supervisión');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Enviar formulario de nueva organización
  const handleCrearOrganizacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/superadmin/organizaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formNombre,
          rubro: formRubro,
          adminNombre: formAdminNombre,
          adminEmail: formAdminEmail,
          adminPassword: formAdminPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setModalError(data.message || 'Error al registrar la organización');
        setSubmitting(false);
        return;
      }

      // Éxito: recargar lista y limpiar modal
      setIsModalOpen(false);
      setFormNombre('');
      setFormRubro('SOFTWARE');
      setFormAdminNombre('');
      setFormAdminEmail('');
      setFormAdminPassword('');
      setFeedbackMsg({
        tipo: 'success',
        texto: `¡Organización "${formNombre}" creada exitosamente con su administrador!`,
      });
      await loadData();
    } catch {
      setModalError('Error de red al registrar la organización');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtrado de organizaciones
  const organizacionesFiltradas = useMemo(() => {
    return organizaciones.filter((org) => {
      const matchSearch = org.nombre.toLowerCase().includes(searchQuery.toLowerCase());
      const matchRubro = selectedRubro === 'TODOS' || org.rubro === selectedRubro;
      return matchSearch && matchRubro;
    });
  }, [organizaciones, searchQuery, selectedRubro]);

  // Metadatos por Rubro
  const getRubroMeta = (rubro: string) => {
    switch (rubro) {
      case 'SOFTWARE':
        return {
          label: 'Software & TI',
          icon: Laptop,
          badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
          iconBg: 'bg-indigo-500/15 text-indigo-400',
        };
      case 'VETERINARIA':
        return {
          label: 'Clínica Veterinaria',
          icon: Stethoscope,
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          iconBg: 'bg-emerald-500/15 text-emerald-400',
        };
      case 'CONSTRUCCION':
        return {
          label: 'Ing. & Construcción',
          icon: HardHat,
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          iconBg: 'bg-amber-500/15 text-amber-400',
        };
      default:
        return {
          label: 'General / Otro',
          icon: Building,
          badgeBg: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
          iconBg: 'bg-slate-500/15 text-slate-400',
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#070D18] gap-3">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        <p className="text-sm font-semibold text-slate-300 animate-pulse">
          Cargando Centro de Control Multi-Tenant...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 flex flex-col antialiased">
      {/* Top Navbar SuperAdmin */}
      <header className="bg-[#0B1528] text-white border-b border-white/10 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">SuperAdmin SGCS</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 uppercase tracking-wider">
                  Nivel 0
                </span>
              </div>
              <span className="text-xs text-slate-400 hidden sm:inline">
                Gestión Multi-Tenant de Empresas y Plantillas
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="hidden sm:block text-right">
              <p className="font-bold text-white leading-tight">{user?.nombreCompleto}</p>
              <p className="text-amber-400 text-[11px]">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 font-semibold transition flex items-center gap-1.5 border border-white/10"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1 w-full">
        {/* Banner de Feedback Temporal */}
        <AnimatePresence>
          {feedbackMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-sm font-semibold shadow-sm ${
                feedbackMsg.tipo === 'success'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              }`}
            >
              <div className="flex items-center gap-2">
                {feedbackMsg.tipo === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
                <span>{feedbackMsg.texto}</span>
              </div>
              <button
                onClick={() => setFeedbackMsg(null)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Encabezado y Acciones Globales */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
              <GraduationCap className="w-4 h-4" /> Arquitectura Multi-Rubro
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Control de Empresas Clientes
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Administración de inquilinos (tenants), activación de cuentas y supervisión operativa directa.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadData}
              className="p-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition shadow-sm"
              title="Refrescar lista"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-upt-gold to-amber-400 hover:brightness-110 text-slate-950 font-bold text-xs sm:text-sm transition flex items-center gap-2 shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Registrar Empresa Cliente</span>
            </button>
          </div>
        </div>

        {/* Grid de KPIs Globales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0C1527] p-5 rounded-2xl border border-white/10 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Empresas</p>
              <p className="text-2xl font-bold text-white mt-0.5">{metricas.totalOrganizaciones}</p>
            </div>
          </div>

          <div className="bg-[#0C1527] p-5 rounded-2xl border border-white/10 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Operativas</p>
              <p className="text-2xl font-bold text-emerald-400 mt-0.5">
                {metricas.organizacionesActivas}{' '}
                <span className="text-xs font-medium text-slate-500">/ {metricas.totalOrganizaciones}</span>
              </p>
            </div>
          </div>

          <div className="bg-[#0C1527] p-5 rounded-2xl border border-white/10 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Usuarios Globales</p>
              <p className="text-2xl font-bold text-white mt-0.5">{metricas.totalUsuarios}</p>
            </div>
          </div>

          <div className="bg-[#0C1527] p-5 rounded-2xl border border-white/10 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Proyectos en Curso</p>
              <p className="text-2xl font-bold text-white mt-0.5">{metricas.totalProyectos}</p>
            </div>
          </div>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="bg-[#0C1527] p-4 rounded-2xl border border-white/10 shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar empresa cliente por nombre..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-[#070D18] border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50 transition"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {['TODOS', 'SOFTWARE', 'VETERINARIA', 'CONSTRUCCION'].map((rubroKey) => (
              <button
                key={rubroKey}
                onClick={() => setSelectedRubro(rubroKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedRubro === rubroKey
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                }`}
              >
                {rubroKey === 'TODOS'
                  ? 'Todos'
                  : rubroKey === 'SOFTWARE'
                  ? 'Software'
                  : rubroKey === 'VETERINARIA'
                  ? 'Veterinaria'
                  : 'Construcción'}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Tarjetas de Organizaciones Dinámicas */}
        {organizacionesFiltradas.length === 0 ? (
          <div className="bg-[#0C1527] p-12 text-center rounded-2xl border border-white/10 shadow-sm space-y-3">
            <Building className="w-12 h-12 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold text-white">No se encontraron organizaciones</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Intente con otro término de búsqueda o registre una nueva empresa cliente en la plataforma.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizacionesFiltradas.map((org) => {
              const meta = getRubroMeta(org.rubro);
              const RubroIcon = meta.icon;
              const isMaster = org.id === '00000000-0000-0000-0000-000000000001';
              const adminUser = org.usuarios?.[0];
              const isActing = actionLoadingId === org.id;

              return (
                <div
                  key={org.id}
                  className={`bg-[#0C1527] rounded-2xl border p-6 flex flex-col justify-between transition-all duration-200 shadow-md hover:-translate-y-0.5 ${
                    org.activo
                      ? 'border-white/10 border-l-4 border-l-amber-400'
                      : 'border-rose-500/30 bg-[#0C1527] border-l-4 border-l-rose-500'
                  }`}
                >
                  <div>
                    {/* Header de la tarjeta */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${meta.iconBg}`}>
                          <RubroIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.badgeBg}`}>
                            {meta.label}
                          </span>
                          {isMaster && (
                            <span className="ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Org Maestra
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Badge de Estado Activo / Suspendido */}
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 border shrink-0 ${
                          org.activo
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {org.activo ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Activo
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-rose-400" />
                            Suspendido
                          </>
                        )}
                      </span>
                    </div>

                    {/* Nombre de la Organización */}
                    <h3 className="font-bold text-white text-base tracking-tight leading-snug">
                      {org.nombre}
                    </h3>

                    {/* Administrador a cargo */}
                    <div className="mt-3 py-2 px-3 rounded-xl bg-[#070D18] border border-white/10 text-xs text-slate-300 flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <div className="truncate">
                        <span className="font-semibold text-white block truncate">
                          {adminUser ? adminUser.nombre_completo : 'Sin Administrador asignado'}
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate">
                          {adminUser ? adminUser.email : 'Requiere creación de usuario'}
                        </span>
                      </div>
                    </div>

                    {/* Métricas de la empresa */}
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <div className="p-2.5 rounded-xl bg-[#070D18] border border-white/10 flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400 shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold uppercase text-slate-400">Usuarios</p>
                          <p className="text-sm font-bold text-white">{org._count.usuarios}</p>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#070D18] border border-white/10 flex items-center gap-2">
                        <FolderGit2 className="w-4 h-4 text-slate-400 shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold uppercase text-slate-400">Proyectos</p>
                          <p className="text-sm font-bold text-white">{org._count.proyectos}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Acciones de la Tarjeta */}
                  <div className="mt-5 pt-4 border-t border-white/5 flex items-center gap-2">
                    {/* Botón Supervisar Entorno */}
                    <button
                      onClick={() => handleSupervisarEntorno(org)}
                      disabled={!org.activo || isActing}
                      className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white font-bold text-xs border border-white/10 transition flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      {isActing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span>Supervisar Entorno</span>
                    </button>

                    {/* Toggle Activar / Suspender */}
                    {!isMaster && (
                      <button
                        onClick={() => handleToggleEstado(org)}
                        disabled={isActing}
                        className={`p-2 rounded-xl border transition ${
                          org.activo
                            ? 'border-white/10 text-slate-400 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30'
                            : 'border-emerald-500/30 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                        }`}
                        title={org.activo ? 'Suspender acceso a la empresa' : 'Reactivar empresa'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal: Registrar Nueva Organización Cliente */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#0C1527] rounded-2xl border border-white/10 shadow-2xl max-w-lg w-full overflow-hidden"
            >
              {/* Header Modal */}
              <div className="p-6 bg-[#0B1528] text-white flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base tracking-tight">Alta de Empresa Cliente</h3>
                    <p className="text-xs text-slate-400">Configuración multi-tenant y administrador inicial</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Formulario */}
              <form onSubmit={handleCrearOrganizacion} className="p-6 space-y-4">
                {modalError && (
                  <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{modalError}</span>
                  </div>
                )}

                {/* 1. Datos de la Empresa */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Nombre de la Organización / Empresa <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formNombre}
                    onChange={(e) => setFormNombre(e.target.value)}
                    placeholder="Ej. Minera & Constructora del Sur S.A.C."
                    className="w-full px-3.5 py-2.5 text-sm bg-[#070D18] border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50 transition"
                  />
                </div>

                {/* 2. Selector de Rubro */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Rubro de Industria (Plantilla SGCS) <span className="text-amber-400">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'SOFTWARE', label: 'Software', icon: Laptop },
                      { key: 'VETERINARIA', label: 'Veterinaria', icon: Stethoscope },
                      { key: 'CONSTRUCCION', label: 'Construcción', icon: HardHat },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isSelected = formRubro === item.key;
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setFormRubro(item.key as any)}
                          className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                            isSelected
                              ? 'border-amber-400/60 bg-amber-500/10 text-amber-300 font-bold'
                              : 'border-white/10 bg-[#070D18] text-slate-400 hover:bg-white/5'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                          <span className="text-xs">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5 italic">
                    {formRubro === 'SOFTWARE' && 'Plantilla: Sprints, Commits, Módulos y Daily Standups.'}
                    {formRubro === 'VETERINARIA' && 'Plantilla: Pacientes, Fichas Médicas, Dosis y Evoluciones.'}
                    {formRubro === 'CONSTRUCCION' && 'Plantilla: Obras, Planos, Partes Diarios y Órdenes de Modificación.'}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5">
                  <p className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" /> Administrador Inicial del Tenant
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        required
                        value={formAdminNombre}
                        onChange={(e) => setFormAdminNombre(e.target.value)}
                        placeholder="Ej. Ing. Juan Pérez"
                        className="w-full px-3.5 py-2 text-sm bg-[#070D18] border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50 transition"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Correo Corporativo
                        </label>
                        <input
                          type="email"
                          required
                          value={formAdminEmail}
                          onChange={(e) => setFormAdminEmail(e.target.value)}
                          placeholder="admin@empresa.com"
                          className="w-full px-3.5 py-2 text-sm bg-[#070D18] border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50 transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Contraseña Inicial
                        </label>
                        <input
                          type="password"
                          required
                          value={formAdminPassword}
                          onChange={(e) => setFormAdminPassword(e.target.value)}
                          placeholder="Mín. 6 caracteres"
                          className="w-full px-3.5 py-2 text-sm bg-[#070D18] border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50 transition"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Modal */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-upt-gold to-amber-400 hover:brightness-110 disabled:opacity-50 text-slate-950 font-bold text-xs transition flex items-center gap-2 shadow-md"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Creando...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Crear Empresa Cliente</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
