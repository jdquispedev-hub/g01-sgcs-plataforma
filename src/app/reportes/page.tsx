'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Printer,
  Download,
  ArrowLeft,
  Calendar,
  Building2,
  FolderGit2,
  Layers,
  Lock,
  GitPullRequest,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Loader2,
  Filter,
} from 'lucide-react';
import NavbarPrincipal from '@/components/NavbarPrincipal';

interface ReporteProyecto {
  id: string;
  codigo: string;
  nombre: string;
  cliente: string;
  estado: string;
  resumen_metricas: {
    total_ecs: number;
    total_versiones: number;
    ecs_con_aprobacion: number;
    total_lineas_base: number;
    lineas_base_vigentes: number;
    total_rfcs: number;
    rfcs_implementadas: number;
  };
  elementos: {
    codigo: string;
    nombre: string;
    tipo: string;
    ubicacion: string;
    responsable: string;
    ultima_version: string;
    estado_ultima_version: string;
    total_versiones: number;
    total_rfcs: number;
  }[];
  lineas_base: {
    codigo: string;
    nombre: string;
    estado: string;
    fecha: string;
    autor: string;
    total_artefactos: number;
  }[];
}

interface ReporteData {
  organizacion: {
    nombre: string;
    rubro: string;
  };
  fecha_generacion: string;
  generado_por: string;
  proyectos: ReporteProyecto[];
}

export default function ReportesPage() {
  const [data, setData] = useState<ReporteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tipoReporte, setTipoReporte] = useState<'CONSOLIDADO' | 'INVENTARIO_ECS' | 'LINEAS_BASE' | 'BALANCE_CAMBIOS'>('CONSOLIDADO');

  const loadReportData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reportes/csa');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Error al cargar reporte:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    if (!data || !data.proyectos) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Proyecto,Codigo ECS,Nombre Artefacto,Tipo,Responsable,Ultima Version,Estado Dictamen,RFCs\n';

    data.proyectos.forEach((p) => {
      p.elementos.forEach((e) => {
        const row = [
          `"${p.codigo} - ${p.nombre}"`,
          `"${e.codigo}"`,
          `"${e.nombre}"`,
          `"${e.tipo}"`,
          `"${e.responsable}"`,
          `"v${e.ultima_version}"`,
          `"${e.estado_ultima_version}"`,
          `"${e.total_rfcs}"`,
        ].join(',');
        csvContent += row + '\n';
      });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_csa_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 flex flex-col antialiased print:bg-white print:text-slate-900 print:p-0">
      {/* Navbar Global Unificado (oculta al imprimir) */}
      <div className="print:hidden">
        <NavbarPrincipal />
      </div>

      {/* Sub-header contextual (oculta al imprimir) */}
      <div className="bg-[#0B1528] border-b border-white/10 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Centro de Reportes CSA
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 uppercase tracking-wider">
                  RF-18 • ISO 10007
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Contabilidad del Estado de la Configuración (Configuration Status Accounting)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 font-semibold text-xs transition flex items-center gap-1.5 border border-white/10"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Exportar CSV</span>
            </button>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6 print:max-w-none print:p-0 print:space-y-4">
        
        {/* Controles de Configuración del Reporte (ocultos al imprimir) */}
        <div className="bg-[#0C1527] p-4 sm:p-5 rounded-2xl border border-white/10 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2 text-white font-bold text-xs sm:text-sm">
            <Filter className="w-4 h-4 text-amber-400" />
            <span>Parámetros del Informe:</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 flex-1 sm:justify-end">
            <select
              value={tipoReporte}
              onChange={(e: any) => setTipoReporte(e.target.value)}
              className="px-3.5 py-2 bg-[#070D18] border border-white/10 rounded-xl text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-amber-400/50 transition cursor-pointer"
            >
              <option value="CONSOLIDADO" className="bg-[#0C1527]">Informe Consolidado Integral (CSA)</option>
              <option value="INVENTARIO_ECS" className="bg-[#0C1527]">Catálogo e Inventario de Artefactos</option>
              <option value="LINEAS_BASE" className="bg-[#0C1527]">Historial de Líneas Base y Congelamientos</option>
              <option value="BALANCE_CAMBIOS" className="bg-[#0C1527]">Balance de Solicitudes de Cambio (RFC)</option>
            </select>
          </div>
        </div>

        {/* Hoja de Reporte Formal */}
        {loading ? (
          <div className="p-16 text-center bg-[#0C1527] rounded-2xl border border-white/10 shadow-md print:hidden">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-3" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Generando informe formal de contabilidad de configuración...
            </p>
          </div>
        ) : !data || data.proyectos.length === 0 ? (
          <div className="bg-[#0C1527] rounded-2xl border border-white/10 p-12 text-center shadow-md">
            <FileText className="w-10 h-10 text-slate-500 mx-auto mb-2" />
            <h3 className="font-bold text-white text-base">Sin datos para el informe seleccionado</h3>
          </div>
        ) : (
          <div className="bg-[#0C1527] rounded-2xl p-6 sm:p-10 border border-white/10 shadow-md print:bg-white print:text-slate-900 print:border-none print:shadow-none print:p-4 space-y-8">
            
            {/* Membrete Oficial Institucional */}
            <div className="border-b border-white/10 print:border-slate-300 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-lg sm:text-xl text-white print:text-slate-950 tracking-tight">
                    {data.organizacion.nombre}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 print:bg-amber-100 print:text-amber-900 uppercase">
                    {data.organizacion.rubro}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white print:text-slate-900 leading-tight">
                  Informe de Contabilidad del Estado de la Configuración (CSA)
                </h1>
                <p className="text-xs text-slate-400 print:text-slate-600 mt-1">
                  Conforme a los estándares de gestión de configuración <strong>ISO 10007 / CMMI Nivel 2-3</strong>
                </p>
              </div>

              <div className="text-left sm:text-right text-xs text-slate-300 print:text-slate-600 space-y-1 shrink-0 bg-[#070D18] print:bg-slate-50 p-3.5 rounded-xl border border-white/10 print:border-slate-200">
                <p>
                  <strong>Fecha de Emisión:</strong>{' '}
                  {new Date(data.fecha_generacion).toLocaleDateString('es-PE', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p><strong>Auditor Responsable:</strong> {data.generado_por}</p>
                <p className="text-emerald-400 print:text-emerald-700 font-bold flex items-center sm:justify-end gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Estado: Oficial Auditado
                </p>
              </div>
            </div>

            {/* Contenido de Cada Proyecto */}
            {data.proyectos.map((p) => (
              <div key={p.id} className="space-y-6">
                <div className="bg-[#070D18] print:bg-slate-50 p-4 rounded-xl border border-white/10 print:border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-amber-300 bg-amber-500/10 print:bg-white print:text-slate-900 px-2.5 py-0.5 rounded border border-amber-500/20 print:border-slate-300">
                      {p.codigo}
                    </span>
                    <h2 className="text-base font-bold text-white print:text-slate-900 mt-1">{p.nombre}</h2>
                    <span className="text-xs text-slate-400 print:text-slate-600">Cliente: {p.cliente}</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <div className="bg-[#0C1527] print:bg-white px-3 py-1.5 rounded-xl border border-white/10 print:border-slate-200 font-semibold">
                      <span className="text-slate-400 print:text-slate-500">ECS:</span>{' '}
                      <strong className="text-white print:text-slate-900">{p.resumen_metricas.total_ecs}</strong>
                    </div>
                    <div className="bg-[#0C1527] print:bg-white px-3 py-1.5 rounded-xl border border-white/10 print:border-slate-200 font-semibold">
                      <span className="text-slate-400 print:text-slate-500">Líneas Base:</span>{' '}
                      <strong className="text-amber-400 print:text-amber-700">{p.resumen_metricas.lineas_base_vigentes}</strong>
                    </div>
                    <div className="bg-[#0C1527] print:bg-white px-3 py-1.5 rounded-xl border border-white/10 print:border-slate-200 font-semibold">
                      <span className="text-slate-400 print:text-slate-500">RFCs Implementadas:</span>{' '}
                      <strong className="text-emerald-400 print:text-emerald-700">{p.resumen_metricas.rfcs_implementadas}</strong>
                    </div>
                  </div>
                </div>

                {/* Tabla de Elementos de Configuración */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-300 print:text-slate-800 uppercase tracking-wider">
                    1. Catálogo e Inventario de Entregables (ECS)
                  </h3>
                  <div className="overflow-x-auto border border-white/10 print:border-slate-200 rounded-xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#070D18] print:bg-slate-100 border-b border-white/10 print:border-slate-200 text-slate-400 print:text-slate-700 uppercase font-bold text-[10px]">
                          <th className="py-2.5 px-3">Código</th>
                          <th className="py-2.5 px-3">Nombre</th>
                          <th className="py-2.5 px-3">Tipo</th>
                          <th className="py-2.5 px-3">Responsable</th>
                          <th className="py-2.5 px-3">Última Versión</th>
                          <th className="py-2.5 px-3">Estado Dictamen</th>
                          <th className="py-2.5 px-3 text-right">RFCs</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 print:divide-slate-100">
                        {p.elementos.map((e) => (
                          <tr key={e.codigo} className="hover:bg-white/5 print:hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-mono font-bold text-amber-300 print:text-slate-900">{e.codigo}</td>
                            <td className="py-2.5 px-3 font-medium text-white print:text-slate-900">{e.nombre}</td>
                            <td className="py-2.5 px-3 text-slate-400 print:text-slate-600">{e.tipo}</td>
                            <td className="py-2.5 px-3 text-slate-400 print:text-slate-600">{e.responsable}</td>
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-200 print:text-slate-900">v{e.ultima_version}</td>
                            <td className="py-2.5 px-3">
                              {e.estado_ultima_version === 'APROBADA' ? (
                                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 print:bg-emerald-100 print:text-emerald-800 px-2 py-0.5 rounded border border-emerald-500/30">
                                  Aprobada
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium text-slate-400 bg-white/5 print:bg-slate-100 print:text-slate-600 px-2 py-0.5 rounded border border-white/10">
                                  {e.estado_ultima_version}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-300 print:text-slate-900">{e.total_rfcs}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Tabla de Líneas Base Inmutables */}
                {p.lineas_base.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h3 className="text-xs font-bold text-slate-300 print:text-slate-800 uppercase tracking-wider">
                      2. Registro Oficial de Líneas Base Inmutables
                    </h3>
                    <div className="overflow-x-auto border border-white/10 print:border-slate-200 rounded-xl">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#070D18] print:bg-slate-100 border-b border-white/10 print:border-slate-200 text-slate-400 print:text-slate-700 uppercase font-bold text-[10px]">
                            <th className="py-2.5 px-3">Código Línea Base</th>
                            <th className="py-2.5 px-3">Denominación</th>
                            <th className="py-2.5 px-3">Estado</th>
                            <th className="py-2.5 px-3">Congelada Por</th>
                            <th className="py-2.5 px-3">Fecha de Congelamiento</th>
                            <th className="py-2.5 px-3 text-right">Artefactos</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 print:divide-slate-100">
                          {p.lineas_base.map((lb) => (
                            <tr key={lb.codigo} className="hover:bg-white/5 print:hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-mono font-bold text-amber-300 print:text-slate-900">{lb.codigo}</td>
                              <td className="py-2.5 px-3 font-medium text-white print:text-slate-900">{lb.nombre}</td>
                              <td className="py-2.5 px-3">
                                {lb.estado === 'VIGENTE' ? (
                                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 print:bg-emerald-100 print:text-emerald-800 px-2 py-0.5 rounded border border-emerald-500/30">
                                    Vigente
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-medium text-slate-400 bg-white/5 print:bg-slate-100 print:text-slate-500 px-2 py-0.5 rounded border border-white/10">
                                    Obsoleta
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-slate-400 print:text-slate-600">{lb.autor}</td>
                              <td className="py-2.5 px-3 text-slate-400 print:text-slate-600">
                                {new Date(lb.fecha).toLocaleDateString('es-PE')}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-200 print:text-slate-900">
                                {lb.total_artefactos} ECS
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Bloque de Firmas para Impresión Formal */}
            <div className="pt-12 mt-12 border-t border-white/10 print:border-slate-300 grid grid-cols-2 sm:grid-cols-3 gap-8 text-center text-xs">
              <div className="space-y-2">
                <div className="border-b border-white/20 print:border-slate-400 pb-8" />
                <p className="font-bold text-white print:text-slate-900">Especialista Técnico</p>
                <span className="text-[10px] text-slate-400 print:text-slate-500 block">Responsable de Pre-Factibilidad</span>
              </div>
              <div className="space-y-2">
                <div className="border-b border-white/20 print:border-slate-400 pb-8" />
                <p className="font-bold text-white print:text-slate-900">Gestor de Configuración</p>
                <span className="text-[10px] text-slate-400 print:text-slate-500 block">Control de Líneas Base y RFCs</span>
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <div className="border-b border-white/20 print:border-slate-400 pb-8" />
                <p className="font-bold text-white print:text-slate-900">Dirección de Calidad</p>
                <span className="text-[10px] text-slate-400 print:text-slate-500 block">Conformidad ISO 10007 / CMMI</span>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
