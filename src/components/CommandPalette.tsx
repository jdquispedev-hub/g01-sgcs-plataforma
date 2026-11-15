'use client';

import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import {
  Search,
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
  FileSpreadsheet,
  Sun,
  Moon,
  Plus,
  X,
} from 'lucide-react';
import { useSgcsTheme } from '@/components/ThemeProvider';
import { NavbarUser } from '@/components/NavbarPrincipal';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: NavbarUser | null;
}

export default function CommandPalette({ open, onOpenChange, user }: CommandPaletteProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useSgcsTheme();
  const [search, setSearch] = useState('');

  const isAdmin = user?.rol === 'ADMINISTRADOR' || user?.rol === 'SUPERADMIN';
  const isApproverOrAdmin = isAdmin || user?.rol === 'APROBADOR';
  const isConstruccion = user?.rubro === 'CONSTRUCCION';
  const isVeterinaria = user?.rubro === 'VETERINARIA';

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      } else if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  const runAndClose = (fn: () => void) => {
    onOpenChange(false);
    setSearch('');
    fn();
  };

  if (!open) return null;

  const isLight = theme === 'light';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4 bg-black/50 backdrop-blur-xs"
      onClick={() => onOpenChange(false)}
    >
      <div
        className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden transition-colors ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-[#181B22] border-white/10 text-slate-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Paleta de comandos SGCS" className="w-full">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 border-b ${
              isLight ? 'border-slate-200 bg-slate-50/70' : 'border-white/10 bg-[#13151A]'
            }`}
          >
            <Search className={`w-4 h-4 shrink-0 ${isLight ? 'text-slate-400' : 'text-amber-400'}`} />
            <Command.Input
              autoFocus
              value={search}
              onValueChange={setSearch}
              placeholder="Buscar módulo, acción rápida o cambiar tema..."
              className={`w-full bg-transparent text-sm outline-none placeholder:text-slate-400 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            />
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className={`p-1 rounded-md text-xs transition ${
                isLight ? 'text-slate-500 hover:bg-slate-200' : 'text-slate-400 hover:bg-white/10'
              }`}
              aria-label="Cerrar buscador"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <Command.List className="max-h-[360px] overflow-y-auto p-2 space-y-1">
            <Command.Empty
              className={`py-8 text-center text-xs ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              No se encontraron coincidencias para &ldquo;{search}&rdquo;.
            </Command.Empty>

            <Command.Group
              heading="Ciclo de Vida SGCS"
              className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                isLight ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              <CommandItem
                isLight={isLight}
                icon={LayoutDashboard}
                label="Panel Principal (Workspace)"
                shortcut="G D"
                onSelect={() => runAndClose(() => router.push('/dashboard'))}
              />
              <CommandItem
                isLight={isLight}
                icon={CalendarDays}
                label={isConstruccion ? 'Minutas de Obra' : isVeterinaria ? 'Consentimientos' : 'Reuniones & Minutas'}
                shortcut="1"
                onSelect={() => runAndClose(() => router.push('/reuniones'))}
              />
              <CommandItem
                isLight={isLight}
                icon={Layers}
                label={isConstruccion ? 'Planos & Entregables (ECS)' : isVeterinaria ? 'Historiales Clínicos (ECS)' : 'Catálogo de Entregables (ECS)'}
                shortcut="2"
                onSelect={() => runAndClose(() => router.push('/ecs'))}
              />
              <CommandItem
                isLight={isLight}
                icon={FileCheck2}
                label="Bandeja de Dictamen y Aprobaciones"
                shortcut="3"
                onSelect={() => runAndClose(() => router.push('/aprobaciones'))}
              />
              <CommandItem
                isLight={isLight}
                icon={Lock}
                label="Líneas Base Inmutables (Hitos)"
                shortcut="4"
                onSelect={() => runAndClose(() => router.push('/lineas-base'))}
              />
              <CommandItem
                isLight={isLight}
                icon={GitPullRequest}
                label={isConstruccion ? 'Órdenes de Cambio (RFC)' : 'Solicitudes de Cambio (RFC)'}
                shortcut="5"
                onSelect={() => runAndClose(() => router.push('/cambios'))}
              />
            </Command.Group>

            <Command.Group
              heading="Supervisión, Metodología y Reportes"
              className={`px-2 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider ${
                isLight ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              <CommandItem
                isLight={isLight}
                icon={Building2}
                label="Línea de Tiempo & Cronograma (RUP / SCRUM / Cascada)"
                onSelect={() => runAndClose(() => router.push('/cronograma'))}
              />
              <CommandItem
                isLight={isLight}
                icon={Activity}
                label="Bitácora Diaria y Bloqueos"
                onSelect={() => runAndClose(() => router.push('/bitacora'))}
              />
              <CommandItem
                isLight={isLight}
                icon={Network}
                label="Matriz de Trazabilidad (RTM)"
                onSelect={() => runAndClose(() => router.push('/trazabilidad'))}
              />
              <CommandItem
                isLight={isLight}
                icon={FileSpreadsheet}
                label="Informe por Caso de Uso (CU01)"
                onSelect={() => runAndClose(() => router.push('/reportes/caso-uso'))}
              />
              {isApproverOrAdmin && (
                <CommandItem
                  isLight={isLight}
                  icon={Printer}
                  label="Reportes Oficiales CSA (PDF)"
                  onSelect={() => runAndClose(() => router.push('/reportes'))}
                />
              )}
              {isAdmin && (
                <>
                  <CommandItem
                    isLight={isLight}
                    icon={History}
                    label="Auditoría de Logs (Caja Negra)"
                    onSelect={() => runAndClose(() => router.push('/auditoria'))}
                  />
                  <CommandItem
                    isLight={isLight}
                    icon={Users}
                    label="Personal y Roles (RBAC)"
                    onSelect={() => runAndClose(() => router.push('/usuarios'))}
                  />
                </>
              )}
            </Command.Group>

            <Command.Group
              heading="Acciones Rápidas y Apariencia"
              className={`px-2 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider ${
                isLight ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              <CommandItem
                isLight={isLight}
                icon={Plus}
                label="Nueva Solicitud de Cambio (RFC)"
                onSelect={() => runAndClose(() => router.push('/cambios/nueva'))}
              />
              <CommandItem
                isLight={isLight}
                icon={Plus}
                label="Congelar Nueva Línea Base"
                onSelect={() => runAndClose(() => router.push('/lineas-base/nueva'))}
              />
              <CommandItem
                isLight={isLight}
                icon={isLight ? Moon : Sun}
                label={isLight ? 'Cambiar a Tema Oscuro (Linear Carbon)' : 'Cambiar a Tema Claro (Estilo Jira)'}
                shortcut="T"
                onSelect={() => runAndClose(() => toggleTheme())}
              />
            </Command.Group>
          </Command.List>

          <div
            className={`px-4 py-2 border-t text-[11px] flex items-center justify-between ${
              isLight ? 'border-slate-200 bg-slate-50 text-slate-500' : 'border-white/10 bg-[#13151A] text-slate-400'
            }`}
          >
            <span>Usa ↑ ↓ para navegar y Enter para abrir</span>
            <span className="font-mono text-[10px]">ESC para cerrar</span>
          </div>
        </Command>
      </div>
    </div>
  );
}

function CommandItem({
  icon: Icon,
  label,
  shortcut,
  onSelect,
  isLight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  shortcut?: string;
  onSelect: () => void;
  isLight: boolean;
}) {
  return (
    <Command.Item
      value={label}
      onSelect={onSelect}
      className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
        isLight
          ? 'text-slate-700 aria-selected:bg-blue-50 aria-selected:text-blue-700 hover:bg-slate-100'
          : 'text-slate-200 aria-selected:bg-amber-400/15 aria-selected:text-amber-300 hover:bg-white/5'
      }`}
    >
      <span className="flex items-center gap-2.5 min-w-0">
        <Icon className="w-4 h-4 shrink-0 opacity-80" />
        <span className="truncate">{label}</span>
      </span>
      {shortcut && (
        <kbd
          className={`px-1.5 py-0.5 rounded text-[10px] font-mono shrink-0 border ${
            isLight
              ? 'bg-slate-100 border-slate-200 text-slate-500'
              : 'bg-white/5 border-white/10 text-slate-400'
          }`}
        >
          {shortcut}
        </kbd>
      )}
    </Command.Item>
  );
}
