'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
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
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Check,
  FolderKanban,
} from 'lucide-react';
import { NavbarUser } from '@/components/NavbarPrincipal';
import { useActiveProject, MetodologiaProyecto } from '@/components/ProjectContext';
import { useSgcsTheme } from '@/components/ThemeProvider';

interface AppSidebarProps {
  user?: NavbarUser | null;
  onLogout?: () => Promise<void> | void;
}

function getMetodologiaBadgeClasses(metodologia: MetodologiaProyecto, isLight: boolean) {
  if (metodologia === 'SCRUM') {
    return isLight
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  }
  if (metodologia === 'CASCADA') {
    return isLight
      ? 'bg-sky-50 text-sky-700 border-sky-200'
      : 'bg-sky-500/15 text-sky-400 border-sky-500/30';
  }
  return isLight
    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
    : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
}

export default function AppSidebar({ user, onLogout }: AppSidebarProps) {
  const pathname = usePathname();
  const { theme } = useSgcsTheme();
  const isLight = theme === 'light';

  const {
    proyectos,
    selectedProyecto,
    selectedProyectoId,
    setSelectedProyectoId,
    isLoading: proyectosLoading,
  } = useActiveProject();

  const [collapsed, setCollapsed] = useState(false);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProjectMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setProjectMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const isAdmin = user?.rol === 'ADMINISTRADOR' || user?.rol === 'SUPERADMIN';
  const isConstruccion = user?.rubro === 'CONSTRUCCION';
  const isVeterinaria = user?.rubro === 'VETERINARIA';

  const activeMetodologia: MetodologiaProyecto = selectedProyecto?.metodologia || 'RUP';
  const isScrum = activeMetodologia === 'SCRUM';
  const isRup = activeMetodologia === 'RUP';

  const focusAccentClass = isScrum
    ? isLight
      ? 'border-l-2 border-l-emerald-500 bg-emerald-50/40'
      : 'border-l-2 border-l-emerald-400 bg-emerald-500/[0.04]'
    : isRup
      ? isLight
        ? 'border-l-2 border-l-indigo-500 bg-indigo-50/40'
        : 'border-l-2 border-l-indigo-400 bg-indigo-500/[0.04]'
      : '';

  // Flujo Secuencial Oficial (Fases 1 a 5) adaptado a metodología activa
  const navCicloVida = [
    {
      href: '/reuniones',
      label: isConstruccion
        ? 'Minutas de Obra'
        : isVeterinaria
          ? 'Consentimientos'
          : isScrum
            ? 'Ceremonias & Sprints'
            : 'Comités & Actas',
      sublabel: isScrum ? 'Planning / Review' : 'Minutas',
      step: '1',
      icon: CalendarDays,
      badgeColor: isLight
        ? 'text-amber-700 bg-amber-50 border-amber-200'
        : 'text-amber-400 bg-amber-400/10 border-amber-400/30',
      highlighted: !isConstruccion && !isVeterinaria && isScrum,
    },
    {
      href: '/ecs',
      label: isConstruccion
        ? 'Planos & Entregables'
        : isVeterinaria
          ? 'Historiales Clínicos'
          : isScrum
            ? 'Tablero Sprint / Backlog'
            : 'Fases & Entregables',
      sublabel: isScrum ? 'Historias / ECS' : 'Artefactos ECS',
      step: '2',
      icon: Layers,
      badgeColor: isLight
        ? 'text-teal-700 bg-teal-50 border-teal-200'
        : 'text-teal-400 bg-teal-400/10 border-teal-400/30',
      highlighted: !isConstruccion && !isVeterinaria && (isScrum || isRup),
    },
    {
      href: '/aprobaciones',
      label: isConstruccion
        ? 'Visto Bueno Técnico'
        : isVeterinaria
          ? 'Aprobación Médica'
          : isScrum
            ? 'Revisión / DoD'
            : 'Dictamen Técnico',
      sublabel: isScrum ? 'Criterios QA' : 'Dictamen',
      step: '3',
      icon: FileCheck2,
      badgeColor: isLight
        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
        : 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
      highlighted: !isConstruccion && !isVeterinaria && isRup,
    },
    {
      href: '/lineas-base',
      label: isConstruccion
        ? 'Hitos Congelados'
        : isVeterinaria
          ? 'Protocolos Cerrados'
          : isScrum
            ? 'Releases & Hitos'
            : 'Líneas Base',
      sublabel: isScrum ? 'Versiones' : 'Hitos Cerrados',
      step: '4',
      icon: Lock,
      badgeColor: isLight
        ? 'text-purple-700 bg-purple-50 border-purple-200'
        : 'text-purple-400 bg-purple-400/10 border-purple-400/30',
      highlighted: !isConstruccion && !isVeterinaria && isRup,
    },
    {
      href: '/cambios',
      label: isConstruccion
        ? 'Adicionales de Obra'
        : isVeterinaria
          ? 'Variaciones Clínicas'
          : isScrum
            ? 'Cambios de Scope'
            : 'Solicitudes RFC',
      sublabel: isScrum ? 'RFC / Backlog' : 'Comité CCB',
      step: '5',
      icon: GitPullRequest,
      badgeColor: isLight
        ? 'text-rose-700 bg-rose-50 border-rose-200'
        : 'text-rose-400 bg-rose-400/10 border-rose-400/30',
      highlighted: false,
    },
  ];

  // Control Operativo y de Calidad
  const navSupervision = [
    {
      href: '/bitacora',
      label: isConstruccion
        ? 'Cuaderno de Obra'
        : isVeterinaria
          ? 'Evolución del Paciente'
          : isScrum
            ? 'Daily / Bitácora'
            : 'Bitácora Diaria',
      sublabel: isScrum ? 'Impedimentos y Avance' : 'Reporte del Día',
      icon: Activity,
      highlighted: !isConstruccion && !isVeterinaria && isScrum,
    },
    {
      href: '/cronograma',
      label: isScrum ? 'Roadmap & Sprints' : 'Línea de Tiempo',
      sublabel: 'Tablero Visual',
      icon: Building2,
      highlighted: false,
    },
    {
      href: '/trazabilidad',
      label: 'Trazabilidad y Calidad',
      sublabel: 'Matriz RTV',
      icon: Network,
      highlighted: false,
    },
    {
      href: '/reportes',
      label: 'Reportes Formales PDF',
      sublabel: 'Exportación',
      icon: Printer,
      highlighted: false,
    },
    ...(isAdmin
      ? [
          {
            href: '/auditoria',
            label: 'Registro de Auditoría',
            sublabel: 'Logs',
            icon: History,
            highlighted: false,
          },
          {
            href: '/usuarios',
            label: 'Equipo y Roles',
            sublabel: 'Colaboradores',
            icon: Users,
            highlighted: false,
          },
        ]
      : []),
  ];

  return (
    <aside
      className={`hidden lg:flex flex-col justify-between border-r transition-all duration-200 select-none z-30 shrink-0 h-full ${
        collapsed ? 'w-18' : 'w-64'
      } ${isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#13151A] border-white/10 text-slate-100'}`}
    >
      {/* Header Superior del Sidebar (Control de Colapso y Rubro Activo) */}
      <div
        className={`h-12 px-3 flex items-center justify-between border-b shrink-0 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0F1115] border-white/10'
        }`}
      >
        {!collapsed ? (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 rounded-full bg-upt-gold animate-pulse shrink-0" />
            <span
              className={`text-[11px] font-bold uppercase tracking-wider truncate ${
                isLight ? 'text-slate-600' : 'text-slate-300'
              }`}
            >
              {user?.rubro ? `Ciclo ${user.rubro}` : 'Navegación'}
            </span>
          </div>
        ) : (
          <div className="mx-auto w-2 h-2 rounded-full bg-upt-gold animate-pulse" title="SGCS Activo" />
        )}

        <button
          onClick={() => {
            setCollapsed(!collapsed);
            setProjectMenuOpen(false);
          }}
          className={`p-1.5 rounded-lg transition ${
            isLight
              ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/70'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
          title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Menú de Navegación con Scroll Propio */}
      <div className="flex-1 p-3 space-y-4 overflow-y-auto [&::-webkit-scrollbar]:hidden">
        {/* Selector de Proyecto Activo (Estilo Jira / Linear) */}
        <div ref={dropdownRef} className="relative">
          {collapsed ? (
            <button
              type="button"
              onClick={() => {
                setCollapsed(false);
                setProjectMenuOpen(true);
              }}
              className={`w-full flex items-center justify-center p-2.5 rounded-xl border transition relative ${
                isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  : 'bg-[#0F1115] border-white/10 text-slate-200 hover:bg-white/5'
              }`}
              title={
                selectedProyecto
                  ? `${selectedProyecto.nombre} (${activeMetodologia})`
                  : 'Seleccionar proyecto activo'
              }
            >
              <FolderKanban className="w-4 h-4 text-upt-gold shrink-0" />
              <span
                className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${
                  isScrum ? 'bg-emerald-400' : 'bg-indigo-400'
                }`}
              />
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setProjectMenuOpen((prev) => !prev)}
                aria-expanded={projectMenuOpen}
                aria-haspopup="listbox"
                className={`w-full text-left px-3 py-2.5 rounded-xl border transition group ${
                  isLight
                    ? 'bg-slate-50/90 border-slate-200 hover:border-slate-300 hover:bg-slate-100/80'
                    : 'bg-[#0F1115] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      isLight ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    Proyecto Activo
                  </span>
                  <span
                    className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded border tracking-wide ${getMetodologiaBadgeClasses(
                      activeMetodologia,
                      isLight
                    )}`}
                  >
                    {activeMetodologia}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-bold truncate leading-tight ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      {selectedProyecto
                        ? selectedProyecto.nombre
                        : proyectosLoading
                          ? 'Cargando proyectos...'
                          : 'Sin proyectos'}
                    </p>
                    {selectedProyecto && (
                      <p
                        className={`text-[10px] font-mono truncate mt-0.5 ${
                          isLight ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      >
                        {selectedProyecto.codigo}
                      </p>
                    )}
                  </div>
                  <ChevronsUpDown
                    className={`w-3.5 h-3.5 shrink-0 transition ${
                      isLight
                        ? 'text-slate-400 group-hover:text-slate-700'
                        : 'text-slate-500 group-hover:text-slate-200'
                    }`}
                  />
                </div>
              </button>

              {projectMenuOpen && (
                <div
                  role="listbox"
                  aria-label="Seleccionar proyecto activo"
                  className={`absolute left-0 right-0 mt-1.5 z-50 rounded-xl border shadow-2xl overflow-hidden ${
                    isLight
                      ? 'bg-white border-slate-200 shadow-slate-200/80'
                      : 'bg-[#181B22] border-white/15 shadow-black/60'
                  }`}
                >
                  <div
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border-b ${
                      isLight
                        ? 'bg-slate-50 text-slate-500 border-slate-200'
                        : 'bg-[#111318] text-slate-400 border-white/10'
                    }`}
                  >
                    Cambiar Proyecto ({proyectos.length})
                  </div>

                  <div className="max-h-60 overflow-y-auto p-1 space-y-0.5">
                    {proyectos.length === 0 ? (
                      <div
                        className={`px-3 py-3 text-xs text-center ${
                          isLight ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      >
                        {proyectosLoading ? 'Cargando...' : 'No hay proyectos disponibles'}
                      </div>
                    ) : (
                      proyectos.map((proy) => {
                        const isSelected = proy.id === selectedProyectoId;
                        return (
                          <button
                            key={proy.id}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              setSelectedProyectoId(proy.id);
                              setProjectMenuOpen(false);
                            }}
                            className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between gap-2 transition ${
                              isSelected
                                ? isLight
                                  ? 'bg-amber-50 text-slate-900'
                                  : 'bg-upt-gold/10 text-white'
                                : isLight
                                  ? 'text-slate-700 hover:bg-slate-100'
                                  : 'text-slate-300 hover:bg-white/5'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold truncate">{proy.nombre}</span>
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span
                                  className={`text-[10px] font-mono ${
                                    isLight ? 'text-slate-500' : 'text-slate-400'
                                  }`}
                                >
                                  {proy.codigo}
                                </span>
                                <span
                                  className={`text-[8px] font-mono font-bold px-1 py-0.2 rounded border ${getMetodologiaBadgeClasses(
                                    proy.metodologia,
                                    isLight
                                  )}`}
                                >
                                  {proy.metodologia}
                                </span>
                              </div>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-upt-gold shrink-0" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Acceso Directo Dashboard */}
        <div>
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition ${
              pathname === '/dashboard'
                ? 'bg-gradient-to-r from-upt-gold to-amber-400 text-slate-950 shadow-sm'
                : isLight
                  ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
            title="Panel Principal"
          >
            <LayoutDashboard
              className={`w-4 h-4 shrink-0 ${
                pathname === '/dashboard'
                  ? 'text-slate-950'
                  : isLight
                    ? 'text-slate-500'
                    : 'text-slate-400'
              }`}
            />
            {!collapsed && <span>Tablero General</span>}
          </Link>
        </div>

        {/* Ciclo de Vida del Proyecto (Fases 1 a 5) */}
        <div className="space-y-1">
          {!collapsed && (
            <div
              className={`px-3 pb-1 text-[10px] font-black uppercase tracking-wider flex items-center justify-between ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              <span>{isScrum ? 'Flujo Ágil Scrum' : isRup ? 'Fases RUP' : 'Fases del Proyecto'}</span>
              <span className="text-[9px] text-upt-gold font-mono">1 a 5</span>
            </div>
          )}
          {navCicloVida.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition group ${
                  isActive
                    ? 'bg-gradient-to-r from-upt-gold to-amber-400 text-slate-950 font-bold shadow-sm'
                    : `${
                        isLight
                          ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      } ${item.highlighted ? focusAccentClass : ''}`
                }`}
                title={collapsed ? `${item.step}. ${item.label} (${item.sublabel})` : undefined}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? 'text-slate-950'
                        : isLight
                          ? 'text-slate-500 group-hover:text-slate-900'
                          : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  {!collapsed && (
                    <div className="flex flex-col min-w-0">
                      <span className="truncate leading-tight font-medium">{item.label}</span>
                      <span
                        className={`text-[10px] leading-tight ${
                          isActive
                            ? 'text-slate-900 font-semibold'
                            : isLight
                              ? 'text-slate-500'
                              : 'text-slate-500'
                        }`}
                      >
                        {item.sublabel}
                      </span>
                    </div>
                  )}
                </div>
                {!collapsed && (
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md border shrink-0 ${
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
            <div
              className={`px-3 pb-1 text-[10px] font-black uppercase tracking-wider ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              Operación Diaria
            </div>
          )}
          {navSupervision.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition group ${
                  isActive
                    ? 'bg-gradient-to-r from-upt-gold to-amber-400 text-slate-950 font-bold shadow-sm'
                    : `${
                        isLight
                          ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      } ${item.highlighted ? focusAccentClass : ''}`
                }`}
                title={collapsed ? `${item.label} (${item.sublabel})` : undefined}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? 'text-slate-950'
                        : isLight
                          ? 'text-slate-500 group-hover:text-slate-900'
                          : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  {!collapsed && (
                    <div className="flex flex-col min-w-0">
                      <span className="truncate leading-tight font-medium">{item.label}</span>
                      <span
                        className={`text-[10px] leading-tight ${
                          isActive
                            ? 'text-slate-900 font-semibold'
                            : isLight
                              ? 'text-slate-500'
                              : 'text-slate-500'
                        }`}
                      >
                        {item.sublabel}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer / Cerrar Sesión */}
      <div
        className={`p-3 border-t ${
          isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-[#0F1115]'
        }`}
      >
        <button
          onClick={async () => {
            if (onLogout) {
              await onLogout();
            } else {
              await fetch('/api/auth/logout', { method: 'POST' });
            }
            window.location.href = '/login';
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
            isLight
              ? 'text-rose-600 hover:bg-rose-50'
              : 'text-rose-300 hover:bg-rose-500/10'
          }`}
          title="Cerrar sesión"
        >
          <LogOut className={`w-4 h-4 shrink-0 ${isLight ? 'text-rose-600' : 'text-rose-400'}`} />
          {!collapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
}
