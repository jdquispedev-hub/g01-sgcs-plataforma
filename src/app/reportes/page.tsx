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
    autor: string;
    fecha: string;
    total_artefactos: number;
    versiones: {
      ecs_codigo: string;
      ecs_nombre: string;
      version: string;
    }[];
  }[];
}

interface ReporteData {
  tipo: string;
  fecha_generacion: string;
  generado_por: string;
  organizacion: {
    id: string;
    nombre: string;
    rubro: string;
  };
  proyectos: ReporteProyecto[];
}

export default function ReportesPage() {
  const [data, setData] = useState<ReporteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tipoReporte, setTipoReporte] = useState<'CONSOLIDADO' | 'INVENTARIO_ECS' | 'LINEAS_BASE' | 'BALANCE_CAMBIOS'>('CONSOLIDADO');
  const [proyectoIdFiltro, setProyectoIdFiltro] = useState<string>('');

  const loadReporte = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/reportes/csa', window.location.origin);
      url.searchParams.set('tipo', tipoReporte);
      if (proyectoIdFiltro) url.searchParams.set('proyectoId', proyectoIdFiltro);

      const res = await fetch(url.toString());
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
    loadReporte();
  }, [tipoReporte, proyectoIdFiltro]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    if (!data) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Proyecto,Codigo ECS,Nombre Artefacto,Tipo,Responsable,Ultima Version,Estado Version,Total Versiones,Total RFCs\n';

    data.proyectos.forEach((p) => {
      p.elementos.forEach((e) => {
        csvContent += `"${p.nombre}","${e.codigo}","${e.nombre}","${e.tipo}","${e.responsable}","${e.ultima_version}","${e.estado_ultima_version}",${e.total_versiones},${e.total_rfcs}\n`;
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
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col antialiased print:bg-white print:p-0">
      {/* Top Navbar (oculta al imprimir) */}
      <header className="bg-upt-navy-900 text-white border-b-2 border-upt-gold shadow-xl sticky top-0 z-40 print:hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-0 sm:h-16 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
          
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href="/dashboard"
              className="p-2 rounded-xl bg-upt-navy-800 hover:bg-upt-navy-700 text-upt-gold transition border border-upt-gold/30 shrink-0 shadow-sm"
              title="Volver al Dashboard"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-sm sm:text-base text-white tracking-tight truncate">
                  Centro de Reportes CSA
                </span>
                <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-upt-gold text-upt-navy-950 font-black uppercase tracking-wider shrink-0 shadow-sm">
                  RF-18 • ISO 10007
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-300 truncate">
                Contabilidad del Estado de la Configuración (Configuration Status Accounting)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center gap-1.5 border border-white/20"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Exportar CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-upt-gold hover:bg-upt-gold-500 text-upt-navy-950 font-black text-xs shadow-md transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-upt-navy-950" />
              <span>Imprimir Acta Formal</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6 print:max-w-none print:p-0 print:space-y-4">
        
        {/* Controles de Configuración del Reporte (ocultos al imprimir) */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border-2 border-slate-300 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2 text-upt-navy-900 font-black text-xs sm:text-sm">
            <Filter className="w-4 h-4 text-upt-gold-600" />
            <span>Parámetros del Informe:</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 flex-1 sm:justify-end">
            <select
              value={tipoReporte}
              onChange={(e: any) => setTipoReporte(e.target.value)}
              className="px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-upt-navy-700 transition"
            >
              <option value="CONSOLIDADO">Informe Consolidado Integral (CSA)</option>
              <option value="INVENTARIO_ECS">Catálogo e Inventario de Artefactos</option>
              <option value="LINEAS_BASE">Historial de Líneas Base y Congelamientos</option>
              <option value="BALANCE_CAMBIOS">Balance de Solicitudes de Cambio (RFC)</option>
            </select>
          </div>
        </div>

        {/* Hoja de Reporte Formal (Apta para pantalla e impresión @media print) */}
        {loading ? (
          <div className="p-16 text-center bg-white rounded-3xl border-2 border-slate-300 shadow-md print:hidden">
            <Loader2 className="w-10 h-10 animate-spin text-upt-navy-700 mx-auto mb-3" />
            <p className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Generando informe formal de contabilidad de configuración...
            </p>
          </div>
        ) : !data || data.proyectos.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-300 p-12 text-center shadow-md">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-2" />
            <h3 className="font-black text-slate-900 text-base">Sin datos para el informe seleccionado</h3>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-slate-300 shadow-md print:border-none print:shadow-none print:p-4 space-y-8">
            
            {/* Membrete Oficial Institucional */}
            <div className="border-b-2 border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-black text-lg sm:text-xl text-upt-navy-950 tracking-tight">
                    {data.organizacion.nombre}
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-upt-gold text-upt-navy-950 uppercase">
                    {data.organizacion.rubro}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  Informe de Contabilidad del Estado de la Configuración (CSA)
                </h1>
                <p className="text-xs text-slate-600 mt-1">
                  Conforme a los estándares de gestión de configuración <strong>ISO 10007 / CMMI Nivel 2-3</strong>
                </p>
              </div>

              <div className="text-left sm:text-right text-xs text-slate-600 space-y-1 shrink-0 bg-slate-50 p-3 rounded-2xl border border-slate-200">
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
                <p className="text-emerald-700 font-bold flex items-center sm:justify-end gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Estado: Oficial Auditado
                </p>
              </div>
            </div>

            {/* Contenido de Cada Proyecto */}
            {data.proyectos.map((p) => (
              <div key={p.id} className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-black text-upt-navy-900 bg-white px-2.5 py-0.5 rounded border border-slate-300">
                      {p.codigo}
                    </span>
                    <h2 className="text-base font-black text-slate-900 mt-1">{p.nombre}</h2>
                    <span className="text-xs text-slate-600">Cliente: {p.cliente}</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 font-bold">
                      <span className="text-slate-500">ECS:</span>{' '}
                      <strong className="text-slate-900">{p.resumen_metricas.total_ecs}</strong>
                    </div>
                    <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 font-bold">
                      <span className="text-slate-500">Líneas Base:</span>{' '}
                      <strong className="text-upt-gold-600">{p.resumen_metricas.lineas_base_vigentes}</strong>
                    </div>
                    <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 font-bold">
                      <span className="text-slate-500">RFCs Implementadas:</span>{' '}
                      <strong className="text-emerald-700">{p.resumen_metricas.rfcs_implementadas}</strong>
                    </div>
                  </div>
                </div>

                {/* Tabla de Elementos de Configuración */}
                <div className="space-y-2">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    1. Catálogo e Inventario de Entregables (ECS)
                  </h3>
                  <div className="overflow-x-auto border-2 border-slate-200 rounded-2xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 uppercase font-black text-[10px]">
                          <th className="py-2.5 px-3">Código</th>
                          <th className="py-2.5 px-3">Nombre</th>
                          <th className="py-2.5 px-3">Tipo</th>
                          <th className="py-2.5 px-3">Responsable</th>
                          <th className="py-2.5 px-3">Última Versión</th>
                          <th className="py-2.5 px-3">Estado Dictamen</th>
                          <th className="py-2.5 px-3 text-right">RFCs</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {p.elementos.map((e) => (
                          <tr key={e.codigo} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-mono font-bold text-upt-navy-900">{e.codigo}</td>
                            <td className="py-2.5 px-3 font-medium text-slate-900">{e.nombre}</td>
                            <td className="py-2.5 px-3 text-slate-600">{e.tipo}</td>
                            <td className="py-2.5 px-3 text-slate-600">{e.responsable}</td>
                            <td className="py-2.5 px-3 font-mono font-bold">v{e.ultima_version}</td>
                            <td className="py-2.5 px-3">
                              {e.estado_ultima_version === 'APROBADA' ? (
                                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                                  Aprobada
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                  {e.estado_ultima_version}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono">{e.total_rfcs}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Tabla de Líneas Base Inmutables */}
                {p.lineas_base.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      2. Registro Oficial de Líneas Base Inmutables
                    </h3>
                    <div className="overflow-x-auto border-2 border-slate-200 rounded-2xl">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 uppercase font-black text-[10px]">
                            <th className="py-2.5 px-3">Código Línea Base</th>
                            <th className="py-2.5 px-3">Denominación</th>
                            <th className="py-2.5 px-3">Estado</th>
                            <th className="py-2.5 px-3">Congelada Por</th>
                            <th className="py-2.5 px-3">Fecha de Congelamiento</th>
                            <th className="py-2.5 px-3 text-right">Artefactos</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {p.lineas_base.map((lb) => (
                            <tr key={lb.codigo} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-mono font-bold text-upt-navy-900">{lb.codigo}</td>
                              <td className="py-2.5 px-3 font-medium text-slate-900">{lb.nombre}</td>
                              <td className="py-2.5 px-3">
                                {lb.estado === 'VIGENTE' ? (
                                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                                    Vigente
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                    Obsoleta
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-slate-600">{lb.autor}</td>
                              <td className="py-2.5 px-3 text-slate-600">
                                {new Date(lb.fecha).toLocaleDateString('es-PE')}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold">
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
            <div className="pt-12 mt-12 border-t-2 border-slate-300 grid grid-cols-2 sm:grid-cols-3 gap-8 text-center text-xs">
              <div className="space-y-2">
                <div className="border-b border-slate-400 pb-8" />
                <p className="font-bold text-slate-900">Especialista Técnico</p>
                <span className="text-[10px] text-slate-500 block">Responsable de Pre-Factibilidad</span>
              </div>
              <div className="space-y-2">
                <div className="border-b border-slate-400 pb-8" />
                <p className="font-bold text-slate-900">Gestor de Configuración</p>
                <span className="text-[10px] text-slate-500 block">Control de Líneas Base y RFCs</span>
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <div className="border-b border-slate-400 pb-8" />
                <p className="font-bold text-slate-900">Dirección de Calidad</p>
                <span className="text-[10px] text-slate-500 block">Conformidad ISO 10007 / CMMI</span>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
