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
      const [resAuth, resOrgs] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/superadmin/organizaciones'),
      ]);

      const dataAuth = await resAuth.json();
      if (!dataAuth.success || dataAuth.data.user.rol !== 'SUPERADMIN') {
        router.push('/login');
        return;
      }
      setUser(dataAuth.data.user);

      const dataOrgs = await resOrgs.json();
      if (dataOrgs.success) {
        setOrganizaciones(dataOrgs.data.organizaciones);
        setMetricas(dataOrgs.data.metricas);
      }
    } catch {
      setFeedbackMsg({ tipo: 'error', texto: 'Error al conectar con el servidor SGCS' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Cerrar sesión
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  // Alternar estado activo / suspendido de una organización
  const handleToggleEstado = async (org: OrganizacionData) => {
    if (org.id === '00000000-0000-0000-0000-000000000001') {
      alert('La Organización Maestra no puede ser suspendida.');
      return;
    }

    const nuevoEstado = !org.activo;
    const confirmMsg = nuevoEstado
      ? `¿Desea reactivar la organización "${org.nombre}"? Sus usuarios podrán volver a ingresar.`
      : `¿Desea suspender la organización "${org.nombre}"? Ningún usuario de esta empresa podrá iniciar sesión.`;

    if (!confirm(confirmMsg)) return;

    try {
      setActionLoadingId(org.id);
      const res = await fetch(`/api/superadmin/organizaciones/${org.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: nuevoEstado }),
      });
      const data = await res.json();
      if (data.success) {
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
          texto: `Estado de "${org.nombre}" actualizado a ${nuevoEstado ? 'Activo' : 'Suspendido'}.`,
        });
      } else {
        alert(data.message || 'Error al cambiar estado');
      }
    } catch {
      alert('Error de red al actualizar estado');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Entrar al entorno de la organización (Modo Supervisión / Impersonation)
  const handleSupervisarEntorno = async (org: OrganizacionData) => {
    if (!org.activo) {
      alert('No es posible supervisar una organización suspendida. Actívela primero.');
      return;
    }

    try {
      setActionLoadingId(org.id);
      const res = await fetch('/api/superadmin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizacionId: org.id }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(data.redirectUrl || '/dashboard');
        router.refresh();
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
          badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          iconBg: 'bg-indigo-100 text-indigo-600',
        };
      case 'VETERINARIA':
        return {
          label: 'Clínica Veterinaria',
          icon: Stethoscope,
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          iconBg: 'bg-emerald-100 text-emerald-600',
        };
      case 'CONSTRUCCION':
        return {
          label: 'Ing. & Construcción',
          icon: HardHat,
          badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
          iconBg: 'bg-amber-100 text-amber-700',
        };
      default:
        return {
          label: 'General / Otro',
          icon: Building,
          badgeBg: 'bg-slate-50 text-slate-700 border-slate-200',
          iconBg: 'bg-slate-100 text-slate-600',
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <Loader2 className="w-8 h-8 text-upt-navy-600 animate-spin" />
        <p className="text-sm font-semibold text-upt-navy-700 animate-pulse">
          Cargando Centro de Control Multi-Tenant...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Navbar UPT Style */}
      <header className="bg-upt-navy-700 text-white border-b-2 border-upt-gold shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-upt-navy-600 flex items-center justify-center text-upt-gold border border-upt-gold/30 shadow">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base tracking-tight">SuperAdmin SGCS</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-upt-gold/20 text-upt-gold font-black border border-upt-gold/40">
                  Nivel 0
                </span>
              </div>
              <span className="text-[11px] text-slate-300 hidden sm:inline">
                Gestión Multi-Tenant de Empresas y Plantillas
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="hidden sm:block text-right">
              <p className="font-bold text-white leading-tight">{user?.nombreCompleto}</p>
              <p className="text-upt-gold text-[11px]">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl bg-upt-navy-600 hover:bg-upt-garnet-500 text-white font-semibold transition flex items-center gap-1.5 border border-white/10"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Banner de Feedback Temporal */}
        <AnimatePresence>
          {feedbackMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-sm font-semibold shadow-sm ${
                feedbackMsg.tipo === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {feedbackMsg.tipo === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <span>{feedbackMsg.texto}</span>
              </div>
              <button
                onClick={() => setFeedbackMsg(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Encabezado y Métricas Globales */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-upt-gold-600 uppercase tracking-widest mb-1">
              <GraduationCap className="w-4 h-4" /> Arquitectura Multi-Rubro UPT
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-upt-navy-700 tracking-tight">
              Control de Empresas Clientes
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Administración de inquilinos (tenants), activación de cuentas y supervisión operativa directa.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadData}
              className="p-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition shadow-sm"
              title="Refrescar lista"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-upt-navy-600 hover:bg-upt-navy-700 text-white font-bold text-sm transition flex items-center gap-2 shadow-md shadow-upt-navy-600/20 active:scale-95"
            >
              <Plus className="w-4 h-4 text-upt-gold" />
              <span>Registrar Empresa Cliente</span>
            </button>
          </div>
        </div>

        {/* Grid de KPIs Globales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Empresas</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{metricas.totalOrganizaciones}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Operativas</p>
              <p className="text-2xl font-black text-emerald-600 mt-0.5">
                {metricas.organizacionesActivas}{' '}
                <span className="text-xs font-medium text-slate-400">/ {metricas.totalOrganizaciones}</span>
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Usuarios Globales</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{metricas.totalUsuarios}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Proyectos en Curso</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{metricas.totalProyectos}</p>
            </div>
          </div>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar empresa cliente por nombre..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-upt-navy-500 outline-none transition"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {['TODOS', 'SOFTWARE', 'VETERINARIA', 'CONSTRUCCION'].map((rubroKey) => (
              <button
                key={rubroKey}
                onClick={() => setSelectedRubro(rubroKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedRubro === rubroKey
                    ? 'bg-upt-navy-700 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
          <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <Building className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No se encontraron organizaciones</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
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
                  className={`bg-white rounded-3xl border p-6 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-1 ${
                    org.activo
                      ? 'border-slate-200/90 border-l-[6px] border-l-upt-navy-600'
                      : 'border-rose-200 bg-rose-50/20 border-l-[6px] border-l-rose-500'
                  }`}
                >
                  <div>
                    {/* Header de la tarjeta */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${meta.iconBg}`}>
                          <RubroIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${meta.badgeBg}`}>
                            {meta.label}
                          </span>
                          {isMaster && (
                            <span className="ml-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-upt-gold/20 text-upt-gold-800 border border-upt-gold/40">
                              Org Maestra
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Badge de Estado Activo / Suspendido */}
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 border shrink-0 ${
                          org.activo
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {org.activo ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Activo
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-rose-500" />
                            Suspendido
                          </>
                        )}
                      </span>
                    </div>

                    {/* Nombre de la Organización */}
                    <h3 className="font-extrabold text-slate-900 text-lg tracking-tight leading-snug">
                      {org.nombre}
                    </h3>

                    {/* Administrador a cargo */}
                    <div className="mt-3 py-2 px-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <div className="truncate">
                        <span className="font-semibold text-slate-800 block truncate">
                          {adminUser ? adminUser.nombre_completo : 'Sin Administrador asignado'}
                        </span>
                        <span className="text-[11px] text-slate-500 block truncate">
                          {adminUser ? adminUser.email : 'Requiere creación de usuario'}
                        </span>
                      </div>
                    </div>

                    {/* Métricas de la empresa */}
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400 shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold uppercase text-slate-400">Usuarios</p>
                          <p className="text-sm font-black text-slate-800">{org._count.usuarios}</p>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-2">
                        <FolderGit2 className="w-4 h-4 text-slate-400 shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold uppercase text-slate-400">Proyectos</p>
                          <p className="text-sm font-black text-slate-800">{org._count.proyectos}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Acciones de la Tarjeta */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2">
                    {/* Botón Supervisar Entorno */}
                    <button
                      onClick={() => handleSupervisarEntorno(org)}
                      disabled={!org.activo || isActing}
                      className="flex-1 py-2 px-3 rounded-xl bg-upt-navy-600 hover:bg-upt-navy-700 disabled:opacity-50 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                    >
                      {isActing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Eye className="w-3.5 h-3.5 text-upt-gold" />
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
                            ? 'border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden"
            >
              {/* Header Modal */}
              <div className="p-6 bg-gradient-to-r from-upt-navy-700 to-upt-navy-800 text-white flex items-center justify-between border-b-2 border-upt-gold">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-upt-navy-600 text-upt-gold flex items-center justify-center border border-upt-gold/30">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base tracking-tight">Alta de Empresa Cliente</h3>
                    <p className="text-xs text-slate-300">Configuración multi-tenant y administrador inicial</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Formulario */}
              <form onSubmit={handleCrearOrganizacion} className="p-6 space-y-4">
                {modalError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{modalError}</span>
                  </div>
                )}

                {/* 1. Datos de la Empresa */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Nombre de la Organización / Empresa <span className="text-upt-garnet-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formNombre}
                    onChange={(e) => setFormNombre(e.target.value)}
                    placeholder="Ej. Minera & Constructora del Sur S.A.C."
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-upt-navy-500 outline-none transition"
                  />
                </div>

                {/* 2. Selector de Rubro */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Rubro de Industria (Plantilla SGCS) <span className="text-upt-garnet-500">*</span>
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
                          className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                            isSelected
                              ? 'border-upt-navy-600 bg-upt-navy-50 text-upt-navy-700 font-bold ring-2 ring-upt-navy-500'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-upt-navy-600' : 'text-slate-400'}`} />
                          <span className="text-xs">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5 italic">
                    {formRubro === 'SOFTWARE' && 'Plantilla: Sprints, Commits, Módulos y Daily Standups.'}
                    {formRubro === 'VETERINARIA' && 'Plantilla: Pacientes, Fichas Médicas, Dosis y Evoluciones.'}
                    {formRubro === 'CONSTRUCCION' && 'Plantilla: Obras, Planos, Partes Diarios y Órdenes de Modificación.'}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs font-extrabold text-slate-900 mb-3 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-upt-gold-600" /> Administrador Inicial del Tenant
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        required
                        value={formAdminNombre}
                        onChange={(e) => setFormAdminNombre(e.target.value)}
                        placeholder="Ej. Ing. Juan Pérez"
                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-upt-navy-500 outline-none transition"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Correo Corporativo
                        </label>
                        <input
                          type="email"
                          required
                          value={formAdminEmail}
                          onChange={(e) => setFormAdminEmail(e.target.value)}
                          placeholder="admin@empresa.com"
                          className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-upt-navy-500 outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Contraseña Inicial
                        </label>
                        <input
                          type="password"
                          required
                          value={formAdminPassword}
                          onChange={(e) => setFormAdminPassword(e.target.value)}
                          placeholder="Mín. 6 caracteres"
                          className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-upt-navy-500 outline-none transition"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Modal */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-upt-navy-600 hover:bg-upt-navy-700 disabled:opacity-50 text-white font-bold text-xs transition flex items-center gap-2 shadow-md shadow-upt-navy-600/20"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Creando...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-upt-gold" />
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
