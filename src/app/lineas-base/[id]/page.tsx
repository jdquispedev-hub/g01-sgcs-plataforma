'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Archive,
  Printer,
  Calendar,
  User,
  FolderGit2,
  FileCheck2,
  ExternalLink,
  Layers,
  Building2,
  Tag,
  Hash,
  FileText,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import NavbarPrincipal from '@/components/NavbarPrincipal';

interface DetalleVersion {
  linea_base_id: string;
  version_ecs_id: string;
  version_ecs: {
    id: string;
    numero_version: string;
    descripcion: string;
    archivo_url: string | null;
    estado: string;
    fecha_aprobacion: string | null;
    created_at: string;
    ecs: {
      id: string;
      codigo: string;
      nombre: string;
      tipo: string;
      ubicacion: string;
      responsable: {
        id: string;
        nombre_completo: string;
      };
    };
    autor: {
      id: string;
      nombre_completo: string;
    };
    aprobador: {
      id: string;
      nombre_completo: string;
    } | null;
  };
}

interface LineaBaseCompleta {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  estado: 'VIGENTE' | 'OBSOLETA';
  created_at: string;
  proyecto: {
    id: string;
    codigo: string;
    nombre: string;
    cliente_nombre: string;
    organizacion: {
      nombre: string;
      rubro: string;
    };
  };
  autor: {
    id: string;
    nombre_completo: string;
    email: string;
    rol: string;
  };
  versiones: DetalleVersion[];
}

export default function DetalleLineaBasePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [lineaBase, setLineaBase] = useState<LineaBaseCompleta | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchDetalle() {
      setLoading(true);
      setErrorMsg(null);
      try {
        const res = await fetch(`/api/lineas-base/${id}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setLineaBase(data.data);
        } else {
          setErrorMsg(data.message || 'Línea Base no encontrada');
        }
      } catch (err) {
        console.error('Error al cargar detalle de Línea Base:', err);
        setErrorMsg('Error de red al consultar el servidor');
      } finally {
        setLoading(false);
      }
    }

    fetchDetalle();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070D18] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 animate-spin text-amber-400 mb-3" />
        <p className="text-xs font-bold text-slate-300 uppercase tracking-wider animate-pulse">
          Cargando Acta Oficial de Línea Base...
        </p>
      </div>
    );
  }

  if (errorMsg || !lineaBase) {
    return (
      <div className="min-h-screen bg-[#070D18] flex items-center justify-center p-4">
        <div className="bg-[#0C1527] max-w-md w-full p-6 rounded-2xl border border-white/10 text-center space-y-4 shadow-xl">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-base font-bold text-white">Error al cargar la Línea Base</h2>
          <p className="text-xs text-slate-400">{errorMsg || 'Registro no disponible'}</p>
          <Link
            href="/lineas-base"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-upt-gold to-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
          >
            <ArrowLeft className="w-4 h-4" /> Regresar al catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 flex flex-col antialiased print:bg-white print:text-slate-900 print:p-0">
      {/* Navbar Global Unificado (oculta al imprimir) */}
      <div className="print:hidden">
        <NavbarPrincipal />
      </div>

      {/* Sub-header contextual (oculta al imprimir) */}
      <div className="bg-[#0B1528] border-b border-white/10 print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/lineas-base"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-amber-400 transition border border-white/10 shrink-0"
              title="Volver a Líneas Base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs sm:text-sm font-bold text-white tracking-tight truncate">
                  {lineaBase.codigo}
                </span>
                {lineaBase.estado === 'VIGENTE' ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 uppercase shrink-0">
                    Vigente
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-400 font-bold border border-white/10 uppercase shrink-0">
                    Obsoleta
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400 block truncate">
                Acta Oficial de Configuración Inmutable (RF-10)
              </span>
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-upt-gold to-amber-400 hover:brightness-110 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-1.5 shrink-0"
          >
            <Printer className="w-4 h-4 text-slate-950" />
            <span className="hidden sm:inline">Imprimir Acta</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full space-y-6 print:max-w-none print:p-0 print:space-y-4">
        {/* Encabezado del Acta Oficial */}
        <div className="bg-[#0C1527] rounded-2xl p-5 sm:p-8 border border-white/10 shadow-md print:bg-white print:text-slate-900 print:shadow-none print:border-none print:p-4 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/10 print:border-slate-300 pb-6">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="font-mono text-xs sm:text-sm font-bold text-amber-300 bg-amber-500/10 print:bg-slate-100 print:text-slate-900 px-3 py-1 rounded-xl border border-amber-500/20 print:border-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                  {lineaBase.codigo}
                </span>
                <span className="text-xs font-semibold text-slate-300 print:text-slate-700 bg-white/5 print:bg-slate-100 px-2.5 py-1 rounded-lg border border-white/10 print:border-slate-200">
                  Proyecto: {lineaBase.proyecto.codigo}
                </span>
                {lineaBase.estado === 'VIGENTE' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 print:bg-emerald-50 print:text-emerald-800 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Línea Base Vigente
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-white/10 text-slate-400 print:bg-slate-100 print:text-slate-600 border border-white/10">
                    <Archive className="w-3.5 h-3.5 text-slate-400" /> Histórica / Obsoleta
                  </span>
                )}
              </div>
              <h1 className="text-lg sm:text-2xl font-bold text-white print:text-slate-950 leading-tight">
                {lineaBase.nombre}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 print:text-slate-700 mt-2 max-w-3xl leading-relaxed">
                {lineaBase.descripcion || 'Sin justificación técnica adicional.'}
              </p>
            </div>

            {/* Sello de Inmutabilidad Visual */}
            <div className="bg-[#070D18] print:bg-slate-100 border border-white/10 print:border-slate-200 rounded-2xl p-4 text-center shrink-0 sm:w-56 shadow-sm">
              <ShieldCheck className="w-8 h-8 text-amber-400 mx-auto mb-1" />
              <div className="font-bold text-xs text-white print:text-slate-950 uppercase tracking-wider">
                Línea Base Inmutable
              </div>
              <span className="text-[10px] text-slate-400 print:text-slate-600 block mt-0.5 font-medium">
                Protección ACID (RNF-08)
              </span>
            </div>
          </div>

          {/* Ficha Técnica de Auditoría */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-[#070D18] print:bg-slate-50 p-4 rounded-xl border border-white/10 print:border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Organización</span>
              <p className="font-bold text-white print:text-slate-800">{lineaBase.proyecto.organizacion.nombre}</p>
              <span className="text-[10px] text-slate-400 print:text-slate-500 font-medium">Rubro: {lineaBase.proyecto.organizacion.rubro}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Proyecto / Cliente</span>
              <p className="font-bold text-white print:text-slate-800">{lineaBase.proyecto.nombre}</p>
              <span className="text-[10px] text-slate-400 print:text-slate-500 font-medium">Cliente: {lineaBase.proyecto.cliente_nombre}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Establecida Por</span>
              <p className="font-bold text-white print:text-slate-800">{lineaBase.autor.nombre_completo}</p>
              <span className="text-[10px] text-slate-400 print:text-slate-500 font-medium">Rol: {lineaBase.autor.rol}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Fecha de Congelamiento</span>
              <p className="font-bold text-white print:text-slate-800">
                {new Date(lineaBase.created_at).toLocaleDateString('es-PE', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
              <span className="text-[10px] text-slate-400 print:text-slate-500 font-medium">
                {new Date(lineaBase.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        {/* Tabla Detallada de Especificaciones y Versiones Congeladas */}
        <div className="bg-[#0C1527] rounded-2xl border border-white/10 shadow-md overflow-hidden print:bg-white print:border print:shadow-none">
          <div className="p-5 sm:p-6 border-b border-white/10 print:border-slate-200 flex items-center justify-between bg-[#0B1528] print:bg-slate-50">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-amber-400" />
              <h2 className="font-bold text-white print:text-slate-900 text-sm sm:text-base">
                Catálogo de Versiones Congeladas ({lineaBase.versiones.length} Elementos)
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-400 print:text-slate-500">
              Versiones con Dictamen Técnico Aprobado
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#070D18] print:bg-slate-100 border-b border-white/10 print:border-slate-200 text-slate-400 print:text-slate-600 uppercase font-bold tracking-wider text-[10px]">
                  <th className="py-3 px-4">Código ECS</th>
                  <th className="py-3 px-4">Elemento de Configuración</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Versión Congelada</th>
                  <th className="py-3 px-4">Descripción del Entregable</th>
                  <th className="py-3 px-4">Especialista Aprobador</th>
                  <th className="py-3 px-4 text-right print:hidden">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 print:divide-slate-100">
                {lineaBase.versiones.map((item) => {
                  const v = item.version_ecs;
                  const ecs = v.ecs;

                  return (
                    <tr key={item.version_ecs_id} className="hover:bg-white/5 print:hover:bg-slate-50 transition">
                      {/* Código ECS */}
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-300 print:text-slate-900 whitespace-nowrap">
                        {ecs.codigo}
                      </td>

                      {/* Nombre ECS */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-white print:text-slate-900 block">{ecs.nombre}</span>
                        <span className="text-[11px] text-slate-400 print:text-slate-500 truncate block max-w-xs">
                          {ecs.ubicacion}
                        </span>
                      </td>

                      {/* Tipo */}
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 print:bg-slate-100 text-slate-300 print:text-slate-600 uppercase border border-white/10 print:border-none">
                          {ecs.tipo}
                        </span>
                      </td>

                      {/* Versión Congelada */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-xs bg-emerald-500/20 text-emerald-300 print:bg-emerald-50 print:text-emerald-800 px-2 py-0.5 rounded-lg border border-emerald-500/30 print:border-emerald-200">
                          <Lock className="w-3 h-3 text-emerald-400" /> v{v.numero_version}
                        </span>
                      </td>

                      {/* Descripción */}
                      <td className="py-3.5 px-4 max-w-xs text-slate-300 print:text-slate-600 text-[11px] leading-relaxed">
                        {v.descripcion}
                      </td>

                      {/* Aprobador */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-white print:text-slate-700 block">
                          {v.aprobador?.nombre_completo || 'Comité Técnico'}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {v.fecha_aprobacion
                            ? new Date(v.fecha_aprobacion).toLocaleDateString('es-PE')
                            : 'Aprobada'}
                        </span>
                      </td>

                      {/* Acción */}
                      <td className="py-3.5 px-4 text-right print:hidden whitespace-nowrap">
                        <Link
                          href={`/ecs/${ecs.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 font-bold text-[11px] border border-white/10 transition"
                        >
                          <span>Ver ECS</span>
                          <ExternalLink className="w-3 h-3 text-amber-400" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sección de Firmas Formales para Impresión */}
        <div className="hidden print:grid grid-cols-2 gap-12 pt-16 text-center text-xs text-slate-700">
          <div className="border-t border-slate-400 pt-2">
            <p className="font-bold">{lineaBase.autor.nombre_completo}</p>
            <p className="text-[10px] text-slate-500">Responsable de Configuración / Establecimiento</p>
          </div>
          <div className="border-t border-slate-400 pt-2">
            <p className="font-bold">Especialista Técnico / Aprobador</p>
            <p className="text-[10px] text-slate-500">Dictamen Técnico Formal (SGCS)</p>
          </div>
        </div>
      </main>
    </div>
  );
}
