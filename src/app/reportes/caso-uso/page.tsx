'use client';

import AppShell from '@/components/AppShell';
import ReporteTrazabilidadCasoUso from '@/components/ReporteTrazabilidadCasoUso';
import Link from 'next/link';
import { ArrowLeft, Printer } from 'lucide-react';

export default function ReporteCasoUsoPage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <AppShell>
      {/* Sub-header contextual (oculto al imprimir) */}
      <div className="bg-[#16181D] border-b border-white/10 print:hidden h-16 flex items-center shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href="/reportes"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition border border-white/10"
              title="Volver a Reportes"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                Informe Detallado de Trazabilidad
              </h1>
              <p className="text-xs text-slate-400 truncate">
                Rúbrica SGCS (4 Puntos): Caso de Uso CU01 → Requisitos (SRS) → Arquitectura (SAD) → Código / BD
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-upt-gold to-amber-400 hover:brightness-110 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-slate-950" />
              <span>Imprimir Acta Formal</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6 print:max-w-none print:p-0 print:space-y-4">
        <ReporteTrazabilidadCasoUso />
      </main>
    </AppShell>
  );
}
