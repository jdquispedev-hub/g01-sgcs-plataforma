'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Compass,
  CalendarDays,
  Layers,
  Lock,
  AlertTriangle,
  Activity,
  Sparkles,
  Network,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Eye,
  ArrowLeft,
  User,
  ChevronRight,
  Briefcase,
  Users,
} from 'lucide-react';
import GuiaFlujoModal from '@/components/GuiaFlujoModal';

export interface NavbarUser {
  userId?: string;
  nombreCompleto?: string;
  email?: string;
  rol?: string;
  organizacionNombre?: string;
  rubro?: string;
  isSupervising?: boolean;
}

interface NavbarPrincipalProps {
  user?: NavbarUser | null;
  onLogout?: () => Promise<void> | void;
}

const NAV_ITEMS = [
  {
    href: '/dashboard',
    label: 'Inicio',
    fullLabel: 'Inicio / Panel de Control',
    icon: Compass,
    badge: null,
    step: null,
    isCore: true,
  },
  {
    href: '/reuniones',
    label: '1. Minutas',
    fullLabel: 'Paso 1: Reuniones & Minutas',
    icon: CalendarDays,
    color: 'text-emerald-400',
    step: 'Paso 1',
    isCore: true,
  },
  {
    href: '/ecs',
    label: '2. ECS',
    fullLabel: 'Paso 2: Entregables (ECS)',
    icon: Layers,
    color: 'text-blue-400',
    step: 'Paso 2',
    isCore: true,
  },
  {
    href: '/aprobaciones',
    label: '3. Aprobación',
    fullLabel: 'Paso 3: Dictamen Tech Lead',
    icon: ShieldCheck,
    color: 'text-amber-400',
    step: 'Paso 3',
    isCore: true,
  },
  {
    href: '/lineas-base',
    label: '4. Hitos',
    fullLabel: 'Paso 4: Hitos Congelados (Líneas Base)',
    icon: Lock,
    color: 'text-purple-400',
    step: 'Paso 4',
    isCore: true,
  },
  {
    href: '/cambios',
    label: '5. Cambios',
    fullLabel: 'Paso 5: Solicitudes de Cambio (RFC)',
    icon: AlertTriangle,
    color: 'text-rose-400',
    step: 'Paso 5',
    isCore: true,
  },
  {
    href: '/cronograma',
    label: 'Canvas',
    fullLabel: 'Canvas de Cronograma Visual',
    icon: Sparkles,
    color: 'text-upt-gold',
    step: 'Vista',
    isCore: false,
  },
  {
    href: '/bitacora',
    label: 'Bitácora',
    fullLabel: 'Bitácora Diaria de Campo',
    icon: Activity,
    color: 'text-teal-400',
    step: 'Campo',
    isCore: false,
  },
  {
    href: '/trazabilidad',
    label: 'Matriz RTV',
    fullLabel: 'Matriz de Trazabilidad de Requisitos',
    icon: Network,
    color: 'text-indigo-400',
    step: 'Auditoría',
    isCore: false,
  },
];

export default function NavbarPrincipal({ user, onLogout }: NavbarPrincipalProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [guiaModalOpen, setGuiaModalOpen] = useState(false);

  const handleDefaultLogout = async () => {
    if (onLogout) {
      await onLogout();
      return;
    }
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
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

  const displayName = user?.nombreCompleto?.split('(')[0]?.trim() || user?.nombreCompleto || 'Usuario';
  const displayRole = user?.nombreCompleto?.includes('(')
    ? user.nombreCompleto.split('(')[1]?.replace(')', '')?.trim()
    : user?.rol || 'USUARIO';

  return (
    <>
      {/* Banner de Modo Supervisión SuperAdmin */}
      {user?.isSupervising && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 px-4 py-2 font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-between gap-2 shadow-inner border-b-2 border-amber-600 z-50">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-slate-950 animate-pulse shrink-0" />
            <span>
              <strong>Modo Supervisión Global:</strong> Auditando a{' '}
              <strong className="underline underline-offset-2">{user.organizacionNombre}</strong> como SuperAdministrador.
            </span>
          </div>
          <button
            onClick={handleRevertSuperadmin}
            className="px-3 py-1 rounded-xl bg-slate-950 text-amber-300 font-extrabold text-xs hover:bg-slate-800 transition shadow flex items-center gap-1.5 shrink-0 active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Volver al Panel SuperAdmin
          </button>
        </div>
      )}

      {/* Header Principal Responsivo */}
      <header className="bg-upt-navy-900 text-white border-b-2 border-upt-gold shadow-xl sticky top-0 z-40">
        <div className="w-full px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Logo y Nombre de Organización */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
            <Link href="/dashboard" className="flex items-center gap-2 sm:gap-2.5 group min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-upt-navy-800 border border-upt-gold/40 flex items-center justify-center text-upt-gold shadow-md group-hover:border-upt-gold transition shrink-0">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-black text-xs sm:text-base text-white tracking-tight truncate max-w-[120px] sm:max-w-[180px] xl:max-w-xs">
                    {user?.organizacionNombre || 'SGCS Plataforma'}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full bg-upt-gold text-upt-navy-950 uppercase tracking-wider shadow-sm shrink-0">
                    {user?.rubro || 'PLATAFORMA'}
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] text-slate-300 font-medium hidden md:block truncate max-w-[200px] xl:max-w-xs">
                  SGCS • Control de Configuración y Proyectos
                </span>
              </div>
            </Link>
          </div>

          {/* Navegación Desktop Completa (2xl:flex >= 1536px, Ej. Monitor 24") */}
          <nav className="hidden 2xl:flex items-center gap-1 bg-upt-navy-950/80 p-1 rounded-2xl border border-white/15 shrink-0">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'bg-upt-navy-700 text-upt-gold shadow-sm border border-upt-gold/40 font-black'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-upt-gold' : item.color || 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            {(user?.rol === 'ADMINISTRADOR' || user?.rol === 'SUPERADMIN') && (
              <Link
                href="/usuarios"
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  pathname.startsWith('/usuarios')
                    ? 'bg-purple-900/60 text-purple-200 shadow-sm border border-purple-400/50 font-black'
                    : 'text-purple-300 hover:text-white hover:bg-white/10'
                }`}
                title="Administrar Personal y Colaboradores"
              >
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span>Personal</span>
              </Link>
            )}
          </nav>

          {/* Navegación Laptop Compacta (xl:flex 2xl:hidden, 1280px a 1535px, Ej. Laptop 13-14", 1366x768) */}
          <nav className="hidden xl:flex 2xl:hidden items-center gap-1 bg-upt-navy-950/80 p-1 rounded-2xl border border-white/15 shrink-0">
            {NAV_ITEMS.filter((item) => item.isCore).map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-2 py-1 rounded-xl text-[11px] font-bold transition flex items-center gap-1 whitespace-nowrap ${
                    isActive
                      ? 'bg-upt-navy-700 text-upt-gold shadow-sm border border-upt-gold/40 font-black'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-3 h-3 ${isActive ? 'text-upt-gold' : item.color || 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            {(user?.rol === 'ADMINISTRADOR' || user?.rol === 'SUPERADMIN') && (
              <Link
                href="/usuarios"
                className={`px-2 py-1 rounded-xl text-[11px] font-bold transition flex items-center gap-1 whitespace-nowrap ${
                  pathname.startsWith('/usuarios')
                    ? 'bg-purple-900/60 text-purple-200 shadow-sm border border-purple-400/50 font-black'
                    : 'text-purple-300 hover:text-white hover:bg-white/10'
                }`}
                title="Administrar Personal y Colaboradores"
              >
                <Users className="w-3 h-3 text-purple-400" />
                <span>Personal</span>
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="px-2 py-1 rounded-xl text-[11px] font-black text-upt-gold hover:bg-white/10 transition flex items-center gap-1 active:scale-95"
              title="Ver Canvas, Bitácora y Trazabilidad"
            >
              <span>+ Más</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </nav>

          {/* Acciones Derecha (Guía, Usuario y Logout) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              onClick={() => setGuiaModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-upt-gold hover:bg-amber-400 text-upt-navy-950 font-black text-xs shadow-md transition flex items-center gap-1.5 shrink-0 active:scale-95"
              title="Ver guía en 5 pasos"
            >
              <HelpCircle className="w-3.5 h-3.5 text-upt-navy-950" />
              <span className="hidden lg:inline">¿Cómo funciona?</span>
            </button>

            {/* Ficha de Usuario en Barra (Visible desde xl) */}
            <div className="text-right pl-2 border-l border-white/15 hidden xl:block">
              <p className="font-extrabold text-white text-xs leading-tight truncate max-w-[120px] 2xl:max-w-[160px]">
                {displayName}
              </p>
              <span className="text-[9px] font-bold text-upt-gold uppercase tracking-wider block">
                {displayRole}
              </span>
            </div>

            {/* Logout en Barra (Visible en Tablets y Desktops) */}
            <button
              onClick={handleDefaultLogout}
              className="hidden sm:flex p-2 rounded-xl bg-white/10 hover:bg-red-500/20 text-slate-300 hover:text-red-400 font-bold transition border border-white/10 shrink-0"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Botón Menú / Hamburguesa (< xl o para abrir el Drawer de Módulos) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15 transition active:scale-95 flex items-center gap-1"
              aria-label="Abrir menú de navegación"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-upt-gold" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Drawer Lateral Responsivo */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop con Blur */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Lateral */}
          <div className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-upt-navy-900 border-l-2 border-upt-gold text-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-200">
            {/* Header del Drawer */}
            <div className="p-4 border-b border-white/15 flex items-center justify-between bg-upt-navy-950">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-upt-navy-800 border border-upt-gold/40 flex items-center justify-center text-upt-gold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white">Navegación SGCS</h3>
                  <span className="text-[10px] text-upt-gold font-bold uppercase">{user?.rubro || 'SISTEMA'}</span>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-xl bg-white/10 text-slate-300 hover:text-white hover:bg-white/20 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Ficha de Usuario en Móvil */}
            <div className="p-4 bg-upt-navy-800/60 border-b border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-upt-navy-700 border border-upt-gold/30 flex items-center justify-center text-upt-gold shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-sm text-white truncate">{displayName}</p>
                <span className="text-[10px] font-bold text-upt-gold uppercase tracking-wider block">
                  {displayRole}
                </span>
                <span className="text-[10px] text-slate-300 truncate block">
                  {user?.organizacionNombre}
                </span>
              </div>
            </div>

            {/* Lista de Enlaces en Móvil */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                Flujo Operativo del Proyecto
              </div>

              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between p-2.5 rounded-2xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-upt-navy-700 text-upt-gold border border-upt-gold/40 shadow-md font-black'
                        : 'text-slate-200 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                          isActive ? 'bg-upt-navy-800 text-upt-gold' : 'bg-white/5 text-slate-300'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-upt-gold' : item.color || 'text-slate-300'}`} />
                      </div>
                      <span className="truncate">{item.fullLabel || item.label}</span>
                    </div>
                    {item.step && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 uppercase font-black shrink-0">
                        {item.step}
                      </span>
                    )}
                  </Link>
                );
              })}

              {(user?.rol === 'ADMINISTRADOR' || user?.rol === 'SUPERADMIN') && (
                <div className="pt-3 border-t border-white/10 mt-3">
                  <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Administración & Personal
                  </div>
                  <Link
                    href="/usuarios"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between p-2.5 rounded-2xl text-xs font-bold transition ${
                      pathname.startsWith('/usuarios')
                        ? 'bg-purple-900/60 text-purple-200 border border-purple-400/50 shadow-md font-black'
                        : 'text-purple-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 bg-purple-500/20 text-purple-300">
                        <Users className="w-4 h-4 text-purple-400" />
                      </div>
                      <span className="truncate">Personal & Colaboradores</span>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 uppercase font-black shrink-0">
                      Equipo
                    </span>
                  </Link>
                </div>
              )}
            </div>

            {/* Footer del Drawer */}
            <div className="p-3 border-t border-white/15 bg-upt-navy-950 space-y-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setGuiaModalOpen(true);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-upt-gold text-upt-navy-950 font-black text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-95"
              >
                <HelpCircle className="w-4 h-4" />
                <span>¿Cómo funciona el sistema?</span>
              </button>

              <button
                onClick={handleDefaultLogout}
                className="w-full py-2 px-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 font-bold text-xs flex items-center justify-center gap-2 border border-red-500/30 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Guiado de 5 Pasos */}
      <GuiaFlujoModal isOpen={guiaModalOpen} onClose={() => setGuiaModalOpen(false)} />
    </>
  );
}
