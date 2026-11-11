'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  LayoutDashboard,
  CalendarDays,
  Layers,
  FileCheck2,
  Lock,
  GitPullRequest,
  Activity,
  Network,
  Printer,
  History,
  Users,
  Building2,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Eye,
  ArrowLeft,
} from 'lucide-react';
import GuiaFlujoModal from '@/components/GuiaFlujoModal';
import { NavbarUser } from '@/components/NavbarPrincipal';
import { getTerminologia } from '@/lib/terminologia';

interface AppSidebarProps {
  user?: NavbarUser | null;
  onLogout?: () => Promise<void> | void;
}

export default function AppSidebar({ user, onLogout }: AppSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [guiaModalOpen, setGuiaModalOpen] = useState(false);

  const terminologia = getTerminologia(user?.rubro);
  const isAdmin = user?.rol === 'ADMINISTRADOR' || user?.rol === 'SUPERADMIN';

  const isConstruccion = user?.rubro === 'CONSTRUCCION';
  const isVeterinaria = user?.rubro === 'VETERINARIA';

  // Flujo Secuencial Oficial (Fases 1 a 5)
  const navCicloVida = [
    {
      href: '/reuniones',
      label: isConstruccion ? 'Minutas de Obra' : isVeterinaria ? 'Consentimientos' : 'Minutas / Sprints',
      step: '1',
      icon: CalendarDays,
      badgeColor: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    },
    {
      href: '/ecs',
      label: isConstruccion ? 'Planos & Memorias' : isVeterinaria ? 'Casos & Analíticas' : 'Entregables (ECS)',
      step: '2',
      icon: Layers,
      badgeColor: 'text-teal-400 bg-teal-400/10 border-teal-400/30',
    },
    {
      href: '/aprobaciones',
      label: isConstruccion ? 'Dictamen Técnico' : isVeterinaria ? 'Aprobación Cirugía' : 'Dictamen Tech Lead',
      step: '3',
      icon: FileCheck2,
      badgeColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
    },
    {
      href: '/lineas-base',
      label: isConstruccion ? 'Hitos Congelados' : isVeterinaria ? 'Protocolos Clínicos' : 'Líneas Base (Release)',
      step: '4',
      icon: Lock,
      badgeColor: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
    },
    {
      href: '/cambios',
      label: isConstruccion ? 'Adicionales de Obra' : isVeterinaria ? 'Variaciones Clínicas' : 'Control de Cambios (RFC)',
      step: '5',
      icon: GitPullRequest,
      badgeColor: 'text-rose-400 bg-rose-400/10 border-rose-400/30',
    },
  ];

  // Control Operativo y de Calidad
  const navSupervision = [
    {
      href: '/bitacora',
      label: isConstruccion ? 'Cuaderno de Obra' : isVeterinaria ? 'Evolución del Paciente' : 'Bitácora Diaria',
      icon: Activity,
    },
    {
      href: '/trazabilidad',
      label: 'Matriz RTV (Calidad)',
      icon: Network,
    },
    {
      href: '/cronograma',
      label: 'Línea de Tiempo (Canvas)',
      icon: Building2,
    },
    {
      href: '/reportes',
      label: 'Reportes Formales PDF',
      icon: Printer,
    },
    ...(isAdmin
      ? [
          {
            href: '/auditoria',
            label: 'Registro de Auditoría',
            icon: History,
          },
          {
            href: '/usuarios',
            label: 'Equipo y Roles',
            icon: Users,
          },
        ]
      : []),
  ];

  return (
    <>
      <aside
        className={`hidden lg:flex flex-col justify-between bg-[#13151A] border-r border-white/10 transition-all duration-200 select-none z-30 shrink-0 h-full ${
          collapsed ? 'w-18' : 'w-64'
        }`}
      >
        {/* Header Superior del Sidebar (Control de Colapso y Rubro Activo) */}
        <div className="h-12 px-3 flex items-center justify-between border-b border-white/10 bg-[#0F1115] shrink-0">
          {!collapsed ? (
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2 h-2 rounded-full bg-upt-gold animate-pulse shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 truncate">
                {user?.rubro ? `Ciclo ${user.rubro}` : 'Navegación'}
              </span>
            </div>
          ) : (
            <div className="mx-auto w-2 h-2 rounded-full bg-upt-gold animate-pulse" title="SGCS Activo" />
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
            title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Menú de Navegación con Scroll Propio */}
        <div className="flex-1 p-3 space-y-5 overflow-y-auto [&::-webkit-scrollbar]:hidden">
            {/* Acceso Directo Dashboard */}
            <div>
              <Link
                href="/dashboard"
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition ${
                  pathname === '/dashboard'
                    ? 'bg-gradient-to-r from-upt-gold to-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
                title="Panel Principal"
              >
                <LayoutDashboard className={`w-4 h-4 shrink-0 ${pathname === '/dashboard' ? 'text-slate-950' : 'text-slate-400'}`} />
                {!collapsed && <span>Tablero General</span>}
              </Link>
            </div>

            {/* Ciclo de Vida del Proyecto (Fases 1 a 5) */}
            <div className="space-y-1">
              {!collapsed && (
                <div className="px-3 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Ciclo de Vida Formal</span>
                  <span className="text-[9px] text-upt-gold font-mono">5 Fases</span>
                </div>
              )}
              {navCicloVida.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition group ${
                      isActive
                        ? 'bg-gradient-to-r from-upt-gold to-amber-400 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                    title={collapsed ? `${item.step}. ${item.label}` : undefined}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-white'}`} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </div>
                    {!collapsed && (
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md border shrink-0 ${
                          isActive
                            ? 'bg-slate-950 text-upt-gold border-slate-950'
                            : item.badgeColor
                        }`}
                      >
                        P{item.step}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Control y Supervisión de Campo */}
            <div className="space-y-1">
              {!collapsed && (
                <div className="px-3 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Supervisión & Campo
                </div>
              )}
              {navSupervision.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition group ${
                      isActive
                        ? 'bg-gradient-to-r from-upt-gold to-amber-400 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-white'}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>

        {/* Footer / Usuario y Guía */}
        <div className="p-3 border-t border-white/10 space-y-2 bg-[#0F1115]">
          <button
            onClick={() => setGuiaModalOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition"
            title="¿Cómo funciona el flujo?"
          >
            <HelpCircle className="w-4 h-4 text-upt-gold shrink-0" />
            {!collapsed && <span>Guía de Proceso</span>}
          </button>

          {onLogout && (
            <button
              onClick={() => onLogout()}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-300 hover:bg-rose-500/10 transition"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
              {!collapsed && <span>Cerrar Sesión</span>}
            </button>
          )}
        </div>
      </aside>

      <GuiaFlujoModal isOpen={guiaModalOpen} onClose={() => setGuiaModalOpen(false)} />
    </>
  );
}
