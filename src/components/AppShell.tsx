'use client';

import React from 'react';
import AppSidebar from '@/components/AppSidebar';
import NavbarPrincipal, { NavbarUser } from '@/components/NavbarPrincipal';

interface AppShellProps {
  children: React.ReactNode;
  user?: NavbarUser | null;
  onLogout?: () => Promise<void> | void;
}

export default function AppShell({ children, user, onLogout }: AppShellProps) {
  return (
    <div className="h-screen w-screen overflow-hidden bg-[#13151A] text-slate-100 flex flex-col antialiased selection:bg-amber-400 selection:text-slate-950">
      {/* 1. Header Global Superior Permanente (Fijo, nunca hace scroll) */}
      <div className="shrink-0 z-40 w-full">
        <NavbarPrincipal user={user} onLogout={onLogout} hideNavTabs={true} />
      </div>

      {/* 2. Cuerpo Principal: Sidebar a la izquierda + Contenido con Scroll a la derecha */}
      <div className="flex-1 flex min-h-0 w-full overflow-hidden relative">
        {/* Sidebar Persistente a la izquierda (Ocupa toda la altura bajo el header) */}
        <AppSidebar user={user} onLogout={onLogout} />

        {/* Área de Trabajo a la derecha: Scroll suave e independiente */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
