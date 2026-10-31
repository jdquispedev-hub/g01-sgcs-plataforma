import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="es">
      <body className="min-h-screen antialiased flex flex-col">{children}</body>
    </html>
  );
}
