'use client';

import React from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import AppSidebar from '@/components/AppSidebar';
import NavbarPrincipal, { NavbarUser } from '@/components/NavbarPrincipal';
import { useSgcsTheme } from '@/components/ThemeProvider';

interface AppShellProps {
  children: React.ReactNode;
  user?: NavbarUser | null;
  onLogout?: () => Promise<void> | void;
}

export default function AppShell({ children, user, onLogout }: AppShellProps) {
  const { theme } = useSgcsTheme();
  const isLight = theme === 'light';

  // Siempre sincronizar sesión para asegurar rubro, rol y navegación persistente en AppSidebar y Navbar
  const { data: dataMe } = useSWR('/api/auth/me', fetcher, { revalidateOnFocus: false });
  const meUser = dataMe?.success && dataMe.data?.user ? dataMe.data.user : null;
  const activeUser = user ? { ...meUser, ...user } : meUser;

  return (
    <div
      className={`h-screen w-screen overflow-hidden flex flex-col antialiased selection:bg-amber-400 selection:text-slate-950 transition-colors duration-200 ${
        isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#13151A] text-slate-100'
      }`}
    >
      {/* 1. Header Global Superior Permanente (Fijo, nunca hace scroll) */}
      <div className="shrink-0 z-40 w-full">
        <NavbarPrincipal user={activeUser} onLogout={onLogout} hideNavTabs={true} />
      </div>

      {/* 2. Cuerpo Principal: Sidebar a la izquierda + Contenido con Scroll a la derecha */}
      <div className="flex-1 flex min-h-0 w-full overflow-hidden relative">
        {/* Sidebar Persistente a la izquierda (Ocupa toda la altura bajo el header) */}
        <AppSidebar user={activeUser} onLogout={onLogout} />

        {/* Área de Trabajo a la derecha: Scroll suave e independiente */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
