'use client';

import { useState, useEffect } from 'react';
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
  Building2,
  FolderGit2,
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
      color: 'text-sky-600',
    },
    {
      href: '/reuniones',
      label: 'Minutas',
      fullLabel: isConstruccion ? 'Minutas de Obra' : isVeterinaria ? 'Juntas Médicas' : 'Reuniones y Minutas',
      icon: CalendarDays,
      color: 'text-amber-600',
    },
    {
      href: '/ecs',
      label: isConstruccion ? 'Planos (ECS)' : isVeterinaria ? 'Fichas (ECS)' : 'Entregables (ECS)',
      fullLabel: isConstruccion ? 'Planos Estructurales (ECS)' : isVeterinaria ? 'Fichas Clínicas (ECS)' : 'Entregables (ECS)',
      icon: Layers,
      color: 'text-teal-600',
    },
    {
      href: '/aprobaciones',
      label: 'Dictamen',
      fullLabel: isConstruccion ? 'Dictamen de Residencia' : isVeterinaria ? 'Dictamen Veterinario' : 'Aprobaciones',
      icon: ShieldCheck,
      color: 'text-emerald-600',
    },
    {
      href: '/lineas-base',
      label: 'Líneas Base',
      fullLabel: 'Líneas Base / Hitos Contractuales',
      icon: Lock,
      color: 'text-purple-600',
    },
    {
      href: '/cambios',
      label: isConstruccion ? 'Adicionales' : 'Cambios (RFC)',
      fullLabel: isConstruccion ? 'Órdenes de Cambio (RFC)' : 'Solicitudes de Cambio (RFC)',
      icon: AlertTriangle,
      color: 'text-orange-600',
    },
    {
      href: '/bitacora',
      label: 'Bitácora',
      fullLabel: isConstruccion ? 'Parte Diario de Faena' : isVeterinaria ? 'Cuaderno Clínico' : 'Bitácora de Campo',
      icon: Activity,
      color: 'text-rose-600',
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
      color: 'text-sky-600',
    },
    {
      href: '/trazabilidad',
      label: 'Matriz RTV',
      fullLabel: 'Matriz de Trazabilidad',
      icon: Network,
      color: 'text-blue-600',
    },
  ];
}

export default function NavbarPrincipal({ user: userProp, onLogout }: NavbarPrincipalProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [guiaModalOpen, setGuiaModalOpen] = useState(false);
  const [dropdownHerramientas, setDropdownHerramientas] = useState(false);
  const [currentUser, setCurrentUser] = useState<NavbarUser | null>(userProp || null);

  // Si no se proporcionó user por props, cargarlo automáticamente desde /api/auth/me
  useEffect(() => {
    if (userProp) {
      setCurrentUser(userProp);
      return;
    }

    let isMounted = true;
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && data.data?.user) {
          setCurrentUser(data.data.user);
        }
      })
      .catch((err) => console.error('Error al obtener usuario en Navbar:', err));

    return () => {
      isMounted = false;
    };
  }, [userProp]);

  const user = currentUser || userProp;

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

      {/* Header en Dos Niveles Adaptativo (Estilo Industrial / GitHub / Linear) */}
      <header className="sticky top-0 z-40 shadow-xs">
        {/* NIVEL 1: Identidad Corporativa, Proyecto Activo y Sesión */}
        <div className="bg-[#0B2545] text-white border-b border-[#133A66]">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-13 sm:h-14 flex items-center justify-between gap-3">
            
            {/* Lado Izquierdo: Brand e Identidad */}
            <div className="flex items-center gap-3 min-w-0">
              <Link href="/dashboard" className="flex items-center gap-2.5 group shrink-0">
                <div className="w-8 h-8 rounded-lg bg-[#133A66] border border-sky-400/30 flex items-center justify-center text-sky-300 shadow-xs group-hover:border-sky-300 transition">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white tracking-tight leading-tight truncate max-w-[150px] sm:max-w-[220px]">
                      {user?.organizacionNombre || 'SGCS Plataforma'}
                    </span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#133A66] text-sky-200 border border-sky-400/20 uppercase tracking-wider shrink-0 hidden sm:inline-block">
                      {user?.rubro || 'SISTEMA'}
                    </span>
                  </div>
                  <span className="text-[10px] text-sky-200/70 hidden sm:block">
                    Gestión de Configuración y Control Contractual
                  </span>
                </div>
              </Link>
            </div>

            {/* Lado Derecho: Acciones de Sesión y Perfil */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Botón Guía Rápida */}
              <button
                onClick={() => setGuiaModalOpen(true)}
                className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-sky-100 hover:text-white text-xs font-medium transition flex items-center gap-1.5 border border-white/10 active:scale-95"
                title="Guía del Flujo Contractual"
              >
                <HelpCircle className="w-3.5 h-3.5 text-sky-300" />
                <span className="hidden sm:inline">Guía de Flujo</span>
              </button>

              {/* Ficha de Usuario Compacta */}
              <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-[#133A66]">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#133A66] text-sky-200 border border-sky-400/30 flex items-center justify-center font-bold text-xs shrink-0">
                  {userInitials || <User className="w-3.5 h-3.5" />}
                </div>
                <div className="hidden md:block text-left">
                  <p className="font-semibold text-white text-xs leading-tight truncate max-w-[130px] xl:max-w-[170px]">
                    {displayName}
                  </p>
                  <span className="text-[10px] text-sky-200/80 block truncate max-w-[130px] xl:max-w-[170px]">
                    {displayRole}
                  </span>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleDefaultLogout}
                className="p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-rose-500/20 text-sky-200 hover:text-rose-200 transition border border-white/10 shrink-0"
                title="Cerrar sesión"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Menú Móvil Botón (< lg) */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 rounded-lg bg-white/10 text-white border border-white/10 transition active:scale-95"
                aria-label="Abrir menú"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* NIVEL 2: Pestañas de Navegación Fluidas (Adaptable y con Scroll Suave en Laptops y Tablets) */}
        <div className="bg-[#071326] border-b border-white/10 shadow-sm backdrop-blur-md">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-11 flex items-center justify-between">
            
            {/* Navegación de Pestañas con Scroll Horizontal Táctil Automático */}
            <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] py-1 w-full">
              {coreNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-gradient-to-r from-upt-gold to-amber-400 text-slate-950 font-bold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-white/10 border border-transparent font-medium'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-slate-950 stroke-[2.5]' : 'text-sky-300'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Acceso para Administrador: Personal */}
              {isAdmin && (
                <Link
                  href="/usuarios"
                  className={`px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    pathname.startsWith('/usuarios')
                      ? 'bg-gradient-to-r from-upt-gold to-amber-400 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-white/10 border border-transparent font-medium'
                  }`}
                >
                  <Users className={`w-3.5 h-3.5 shrink-0 ${pathname.startsWith('/usuarios') ? 'text-slate-950 stroke-[2.5]' : 'text-indigo-400'}`} />
                  <span>Personal</span>
                </Link>
              )}

              {/* Menú de Más Herramientas Técnicas */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setDropdownHerramientas(!dropdownHerramientas)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 whitespace-nowrap ${
                    secondaryNavItems.some((s) => pathname.startsWith(s.href))
                      ? 'bg-gradient-to-r from-upt-gold to-amber-400 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-white/10 border border-transparent'
                  }`}
                >
                  <Sparkles className={`w-3.5 h-3.5 ${secondaryNavItems.some((s) => pathname.startsWith(s.href)) ? 'text-slate-950' : 'text-sky-300'}`} />
                  <span>Herramientas</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {dropdownHerramientas && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setDropdownHerramientas(false)} />
                    <div className="absolute left-0 mt-1.5 w-52 bg-[#0B2545] border border-white/15 rounded-xl shadow-2xl py-1.5 z-40 text-xs animate-in fade-in zoom-in-95 duration-100">
                      {secondaryNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname.startsWith(item.href);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setDropdownHerramientas(false)}
                            className={`flex items-center gap-2.5 px-3 py-2 transition ${
                              isActive
                                ? 'bg-white/15 text-upt-gold font-bold'
                                : 'text-slate-200 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5 text-sky-300" />
                            <span>{item.fullLabel || item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </nav>
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

          <div className="fixed top-0 right-0 bottom-0 w-72 max-w-[85vw] bg-white border-l border-slate-200 text-slate-900 shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-150">
            {/* Header del Drawer Móvil */}
            <div className="p-4 border-b border-[#133A66] flex items-center justify-between bg-[#0B2545] text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#133A66] border border-sky-400/30 flex items-center justify-center text-sky-300">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-white leading-tight">Menú de Trabajo</h3>
                  <span className="text-[10px] text-sky-200 uppercase">{user?.rubro || 'SISTEMA'}</span>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-sky-200 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Ficha de Usuario en Móvil */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#0B2545] text-sky-200 border border-sky-300/30 flex items-center justify-center font-bold text-xs shrink-0">
                {userInitials || <User className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs text-slate-900 truncate">{displayName}</p>
                <span className="text-[10px] text-slate-500 block truncate">{displayRole}</span>
              </div>
            </div>

            {/* Lista de Enlaces en Móvil */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-medium transition ${
                      isActive
                        ? 'bg-[#0B2545] text-white font-semibold shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-sky-300' : 'text-slate-500'}`} />
                    <span className="truncate">{item.fullLabel || item.label}</span>
                  </Link>
                );
              })}

              <div className="px-2 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Herramientas Técnicas
              </div>

              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-medium transition ${
                      isActive
                        ? 'bg-[#0B2545] text-white font-semibold shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-sky-300' : 'text-slate-500'}`} />
                    <span className="truncate">{item.fullLabel || item.label}</span>
                  </Link>
                );
              })}

              {isAdmin && (
                <>
                  <div className="px-2 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Administración
                  </div>
                  <Link
                    href="/usuarios"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-medium transition ${
                      pathname.startsWith('/usuarios')
                        ? 'bg-[#0B2545] text-white font-semibold shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Users className="w-4 h-4 text-purple-600" />
                    <span>Personal y Roles</span>
                  </Link>
                </>
              )}
            </div>

            {/* Footer del Drawer */}
            <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setGuiaModalOpen(true);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-200 transition"
              >
                <HelpCircle className="w-4 h-4 text-sky-600" />
                <span>¿Cómo funciona el sistema?</span>
              </button>

              <button
                onClick={handleDefaultLogout}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs flex items-center justify-center gap-2 border border-rose-200 transition"
              >
                <LogOut className="w-4 h-4" />
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
