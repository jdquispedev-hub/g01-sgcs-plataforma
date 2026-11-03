'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
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

interface DetalleLineaBase {
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
    estado: string;
    cliente_nombre: string;
    organizacion: {
      id: string;
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

  const [lineaBase, setLineaBase] = useState<DetalleLineaBase | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchDetalle() {
      setLoading(true);
      try {
        const res = await fetch(`/api/lineas-base/${id}`);
        const data = await res.json();

        if (data.success) {
          setLineaBase(data.data);
        } else {
          setErrorMsg(data.message || 'Error al obtener la Línea Base');
        }
      } catch (err) {
        console.error('Error:', err);
        setErrorMsg('Error de conexión al cargar la Línea Base');
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-upt-navy-600 mx-auto mb-3" />
          <p className="text-xs sm:text-sm font-semibold text-slate-600">
            Cargando acta inmutable de Línea Base...
          </p>
        </div>
      </div>
    );
  }

  if (errorMsg || !lineaBase) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 max-w-md w-full text-center shadow-lg space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">No se pudo cargar la Línea Base</h2>
          <p className="text-xs text-slate-500">{errorMsg || 'Registro no encontrado'}</p>
          <Link
            href="/lineas-base"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-upt-navy-700 text-upt-gold font-bold text-xs"
          >
            <ArrowLeft className="w-4 h-4" /> Regresar al catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col print:bg-white print:p-0">
      {/* Top Navbar (oculta al imprimir) */}
      <header className="bg-upt-navy-900 text-white border-b-2 border-upt-gold shadow-lg sticky top-0 z-30 print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/lineas-base"
              className="p-2 rounded-xl bg-upt-navy-800 hover:bg-upt-navy-700 text-upt-gold transition border border-upt-gold/30"
              title="Volver a Líneas Base"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base text-white tracking-tight">{lineaBase.codigo}</span>
                {lineaBase.estado === 'VIGENTE' ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-black border border-emerald-500/40 uppercase">
                    Vigente
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-400/20 text-slate-300 font-black border border-slate-400/40 uppercase">
                    Obsoleta
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400">Acta Oficial de Configuración Inmutable (RF-10)</span>
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 border border-white/20"
          >
            <Printer className="w-4 h-4 text-upt-gold" />
            <span className="hidden sm:inline">Imprimir Acta Formal</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6 print:max-w-none print:p-0 print:space-y-4">
        {/* Encabezado del Acta Oficial */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-300 shadow-md print:shadow-none print:border-none print:p-4 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-sm font-black text-upt-navy-700 bg-upt-navy-50 px-3 py-1 rounded-xl border border-upt-navy-200 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-upt-gold" />
                  {lineaBase.codigo}
                </span>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                  Proyecto: {lineaBase.proyecto.codigo}
                </span>
                {lineaBase.estado === 'VIGENTE' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Línea Base Vigente
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                    <Archive className="w-3.5 h-3.5 text-slate-400" /> Histórica / Obsoleta
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {lineaBase.nombre}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
                {lineaBase.descripcion || 'Sin justificación técnica adicional.'}
              </p>
            </div>

            {/* Sello de Inmutabilidad Visual */}
            <div className="bg-gradient-to-br from-upt-navy-50 to-slate-100 border border-upt-navy-100 rounded-2xl p-4 text-center shrink-0 sm:w-56">
              <ShieldCheck className="w-8 h-8 text-upt-gold mx-auto mb-1" />
              <div className="font-black text-xs text-upt-navy-900 uppercase tracking-wider">
                Línea Base Inmutable
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">
                Protección ACID (RNF-08)
              </span>
            </div>
          </div>

          {/* Ficha Técnica de Auditoría */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Organización</span>
              <p className="font-bold text-slate-800">{lineaBase.proyecto.organizacion.nombre}</p>
              <span className="text-[10px] text-slate-500 font-medium">Rubro: {lineaBase.proyecto.organizacion.rubro}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Proyecto / Cliente</span>
              <p className="font-bold text-slate-800">{lineaBase.proyecto.nombre}</p>
              <span className="text-[10px] text-slate-500 font-medium">Cliente: {lineaBase.proyecto.cliente_nombre}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Establecida Por</span>
              <p className="font-bold text-slate-800">{lineaBase.autor.nombre_completo}</p>
              <span className="text-[10px] text-slate-500 font-medium">Rol: {lineaBase.autor.rol}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Fecha de Congelamiento</span>
              <p className="font-bold text-slate-800">
                {new Date(lineaBase.created_at).toLocaleDateString('es-PE', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
              <span className="text-[10px] text-slate-500 font-medium">
                {new Date(lineaBase.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        {/* Tabla Detallada de Especificaciones y Versiones Congeladas */}
        <div className="bg-white rounded-3xl border-2 border-slate-300 shadow-md overflow-hidden print:shadow-none print:border">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-upt-gold" />
              <h2 className="font-bold text-slate-900 text-sm sm:text-base">
                Catálogo de Versiones Congeladas ({lineaBase.versiones.length} Elementos)
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Versiones con Dictamen Técnico Aprobado
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 uppercase font-black tracking-wider text-[10px]">
                  <th className="py-3 px-4">Código ECS</th>
                  <th className="py-3 px-4">Elemento de Configuración</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Versión Congelada</th>
                  <th className="py-3 px-4">Descripción del Entregable</th>
                  <th className="py-3 px-4">Especialista Aprobador</th>
                  <th className="py-3 px-4 text-right print:hidden">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lineaBase.versiones.map((item, idx) => {
                  const v = item.version_ecs;
                  const ecs = v.ecs;

                  return (
                    <tr key={item.version_ecs_id} className="hover:bg-slate-50/80 transition">
                      {/* Código ECS */}
                      <td className="py-3.5 px-4 font-mono font-bold text-upt-navy-700 whitespace-nowrap">
                        {ecs.codigo}
                      </td>

                      {/* Nombre ECS */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{ecs.nombre}</span>
                        <span className="text-[11px] text-slate-500 truncate block max-w-xs">
                          {ecs.ubicacion}
                        </span>
                      </td>

                      {/* Tipo */}
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase">
                          {ecs.tipo}
                        </span>
                      </td>

                      {/* Versión Congelada */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-xs bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-lg border border-emerald-200">
                          <Lock className="w-3 h-3 text-emerald-600" /> v{v.numero_version}
                        </span>
                      </td>

                      {/* Descripción */}
                      <td className="py-3.5 px-4 max-w-xs text-slate-600 text-[11px] leading-relaxed">
                        {v.descripcion}
                      </td>

                      {/* Aprobador */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-700 block">
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
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-upt-navy-700 hover:text-upt-gold text-slate-700 font-bold text-[11px] transition"
                        >
                          <span>Ver ECS</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sección de Firmas Formles para Impresión */}
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
