import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ProjectProvider } from '@/components/ProjectContext';

export const metadata: Metadata = {
  title: 'SGCS | Sistema de Gestión de Configuración y Control de Servicios',
  description: 'Plataforma Multi-Tenant para control de requerimientos, pre-factibilidad técnica y reporte de bloqueos',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body className="min-h-screen antialiased flex flex-col bg-[var(--sgcs-bg)] text-[var(--sgcs-text)]">
        <ThemeProvider>
          <ProjectProvider>{children}</ProjectProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
