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
  ChevronDown,
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

function getCoreNavItems(rubro?: string) {
  const isConstruccion = rubro === 'CONSTRUCCION';
  const isVeterinaria = rubro === 'VETERINARIA';

  return [
    {
      href: '/dashboard',
      label: 'Inicio',
      icon: Compass,
    },
    {
      href: '/reuniones',
      label: 'Minutas',
      fullLabel: isConstruccion ? 'Minutas de Obra' : isVeterinaria ? 'Juntas Médicas' : 'Reuniones y Minutas',
      icon: CalendarDays,
    },
    {
      href: '/ecs',
      label: isConstruccion ? 'Planos' : isVeterinaria ? 'Fichas' : 'ECS',
      fullLabel: isConstruccion ? 'Planos Estructurales (ECS)' : isVeterinaria ? 'Fichas Clínicas (ECS)' : 'Entregables (ECS)',
      icon: Layers,
    },
    {
      href: '/aprobaciones',
      label: 'Dictamen',
      fullLabel: isConstruccion ? 'Dictamen de Residencia' : isVeterinaria ? 'Dictamen Veterinario' : 'Aprobaciones',
      icon: ShieldCheck,
    },
    {
      href: '/lineas-base',
      label: 'Hitos',
      fullLabel: 'Líneas Base / Hitos',
      icon: Lock,
    },
    {
      href: '/cambios',
      label: isConstruccion ? 'Adicionales' : 'Cambios',
      fullLabel: isConstruccion ? 'Órdenes de Cambio (RFC)' : 'Solicitudes de Cambio (RFC)',
      icon: AlertTriangle,
    },
  ];
}

function getSecondaryNavItems(rubro?: string) {
  const isConstruccion = rubro === 'CONSTRUCCION';
  const isVeterinaria = rubro === 'VETERINARIA';

  return [
    {
      href: '/cronograma',
      label: 'Línea de Tiempo',
      fullLabel: 'Línea de Tiempo y Canvas',
      icon: Sparkles,
    },
    {
      href: '/bitacora',
      label: 'Bitácora Diaria',
      fullLabel: isConstruccion ? 'Parte Diario de Faena' : isVeterinaria ? 'Cuaderno Clínico' : 'Bitácora de Campo',
      icon: Activity,
    },
    {
      href: '/trazabilidad',
      label: 'Matriz RTV',
      fullLabel: 'Matriz de Trazabilidad',
      icon: Network,
    },
  ];
}

export default function NavbarPrincipal({ user, onLogout }: NavbarPrincipalProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [guiaModalOpen, setGuiaModalOpen] = useState(false);
  const [dropdownHerramientas, setDropdownHerramientas] = useState(false);

  const coreNavItems = getCoreNavItems(user?.rubro);
  const secondaryNavItems = getSecondaryNavItems(user?.rubro);
  const isAdmin = user?.rol === 'ADMINISTRADOR' || user?.rol === 'SUPERADMIN';

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
    : user?.rol === 'SOLICITANTE'
    ? 'Técnico / Responsable'
    : user?.rol === 'APROBADOR'
    ? 'Aprobador / Calidad'
    : user?.rol === 'ADMINISTRADOR'
    ? 'Administrador'
    : user?.rol || 'USUARIO';

  const userInitials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');

  return (
    <>
      {/* Banner de Modo Supervisión SuperAdmin */}
      {user?.isSupervising && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 font-semibold text-xs flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-amber-600 z-50">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-slate-950 animate-pulse shrink-0" />
            <span>
              <strong>Modo Supervisión Global:</strong> Auditando a{' '}
              <strong className="underline underline-offset-2">{user.organizacionNombre}</strong> como SuperAdministrador.
            </span>
          </div>
          <button
            onClick={handleRevertSuperadmin}
            className="px-3 py-1 rounded-lg bg-slate-950 text-amber-300 font-bold text-xs hover:bg-slate-900 transition shadow-xs flex items-center gap-1.5 shrink-0 active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Volver al Panel SuperAdmin
          </button>
        </div>
      )}

      {/* Header Principal Adaptativo */}
      <header className="bg-slate-900/95 backdrop-blur-md text-white border-b border-slate-800 shadow-sm sticky top-0 z-40">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-3">
          
          {/* Brand & Organización */}
          <div className="flex items-center gap-3 shrink-0 min-w-0">
            <Link href="/dashboard" className="flex items-center gap-2.5 group min-w-0">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400 shadow-xs group-hover:border-slate-600 transition shrink-0">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white tracking-tight truncate max-w-[140px] sm:max-w-[200px]">
                    {user?.organizacionNombre || 'SGCS Plataforma'}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 uppercase tracking-wider shrink-0 hidden sm:inline-block">
                    {user?.rubro || 'SISTEMA'}
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Navegación Desktop & Laptop Elástica (Visible >= lg: 1024px) */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
            {coreNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-800 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                href="/usuarios"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
                  pathname.startsWith('/usuarios')
                    ? 'bg-slate-800 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span>Personal</span>
              </Link>
            )}

            {/* Dropdown de Herramientas Secundarias */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownHerramientas(!dropdownHerramientas)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 whitespace-nowrap ${
                  secondaryNavItems.some((s) => pathname.startsWith(s.href))
                    ? 'bg-slate-800 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span>Herramientas</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {dropdownHerramientas && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setDropdownHerramientas(false)} />
                  <div className="absolute right-0 mt-1.5 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-1 z-40 text-xs">
                    {secondaryNavItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname.startsWith(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setDropdownHerramientas(false)}
                          className={`flex items-center gap-2 px-3 py-2 transition ${
                            isActive
                              ? 'bg-slate-800 text-sky-400 font-semibold'
                              : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.fullLabel || item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </nav>

          {/* Acciones Derecha (Ayuda, Usuario y Logout) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Botón Guía Discreto */}
            <button
              onClick={() => setGuiaModalOpen(true)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition flex items-center gap-1.5 border border-slate-700/80 active:scale-95"
              title="Guía del Flujo"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden xl:inline">Guía</span>
            </button>

            {/* Ficha de Usuario Compacta */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center font-bold text-xs">
                {userInitials || <User className="w-3.5 h-3.5" />}
              </div>
              <div className="hidden md:block text-left">
                <p className="font-semibold text-white text-xs leading-tight truncate max-w-[110px] xl:max-w-[150px]">
                  {displayName}
                </p>
                <span className="text-[10px] text-slate-400 block truncate max-w-[110px] xl:max-w-[150px]">
                  {displayRole}
                </span>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleDefaultLogout}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition border border-slate-700/80 shrink-0"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Menú Móvil (< lg) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 transition active:scale-95"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>
      </header>

      {/* Drawer Lateral Móvil */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="fixed top-0 right-0 bottom-0 w-72 max-w-[80vw] bg-slate-900 border-l border-slate-800 text-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-150">
            {/* Header del Drawer */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-white">Navegación</h3>
                  <span className="text-[10px] text-slate-400 uppercase">{user?.rubro || 'SISTEMA'}</span>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Ficha de Usuario en Móvil */}
            <div className="p-4 bg-slate-800/40 border-b border-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs shrink-0">
                {userInitials || <User className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs text-white truncate">{displayName}</p>
                <span className="text-[10px] text-slate-400 block truncate">{displayRole}</span>
              </div>
            </div>

            {/* Lista de Enlaces en Móvil */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Módulos Principales
              </div>

              {coreNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 p-2 rounded-lg text-xs font-medium transition ${
                      isActive
                        ? 'bg-slate-800 text-sky-400 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{item.fullLabel || item.label}</span>
                  </Link>
                );
              })}

              <div className="px-2 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Herramientas
              </div>

              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 p-2 rounded-lg text-xs font-medium transition ${
                      isActive
                        ? 'bg-slate-800 text-sky-400 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{item.fullLabel || item.label}</span>
                  </Link>
                );
              })}

              {isAdmin && (
                <>
                  <div className="px-2 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Administración
                  </div>
                  <Link
                    href="/usuarios"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 p-2 rounded-lg text-xs font-medium transition ${
                      pathname.startsWith('/usuarios')
                        ? 'bg-slate-800 text-purple-300 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <Users className="w-4 h-4 text-purple-400" />
                    <span>Personal y Roles</span>
                  </Link>
                </>
              )}
            </div>

            {/* Footer del Drawer */}
            <div className="p-3 border-t border-slate-800 bg-slate-950 space-y-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setGuiaModalOpen(true);
                }}
                className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center justify-center gap-2 transition"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>¿Cómo funciona el sistema?</span>
              </button>

              <button
                onClick={handleDefaultLogout}
                className="w-full py-2 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-medium text-xs flex items-center justify-center gap-2 border border-rose-500/20 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Guiado de 5 Pasos */}
      <GuiaFlujoModal isOpen={guiaModalOpen} onClose={() => setGuiaModalOpen(false)} rubro={user?.rubro} />
    </>
  );
}
