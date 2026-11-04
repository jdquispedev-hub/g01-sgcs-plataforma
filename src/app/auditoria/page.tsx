'use client';

import { useState, useEffect } from 'react';
import AccesoRestringido from '@/components/AccesoRestringido';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  ArrowLeft,
  Search,
  Filter,
  Calendar,
  User,
  Clock,
  Eye,
  X,
  Lock,
  Layers,
  GitPullRequest,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Terminal,
} from 'lucide-react';

interface LogItem {
  id: string;
  accion: string;
  entidad: string;
  entidad_id: string;
  datos_anteriores: any;
  datos_nuevos: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  usuario: {
    id: string;
    nombre_completo: string;
    email: string;
    rol: string;
  } | null;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 25,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [entidadFiltro, setEntidadFiltro] = useState('');
  const [accionFiltro, setAccionFiltro] = useState('');
  const [selectedLog, setSelectedLog] = useState<LogItem | null>(null);

  const loadLogs = async (pageToLoad = 1) => {
    setLoading(true);
    try {
      const url = new URL('/api/auditoria', window.location.origin);
      url.searchParams.set('page', pageToLoad.toString());
      url.searchParams.set('limit', '25');
      if (entidadFiltro) url.searchParams.set('entidad', entidadFiltro);
      if (accionFiltro) url.searchParams.set('accion', accionFiltro);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Error al cargar logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs(1);
  }, [entidadFiltro, accionFiltro]);

  const getBadgeAccion = (accion: string) => {
    if (accion.includes('APROB')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
    if (accion.includes('RECHAZ')) {
      return 'bg-red-100 text-red-800 border-red-300';
    }
    if (accion.includes('CREAR') || accion.includes('ESTABLECER')) {
      return 'bg-blue-100 text-blue-800 border-blue-300';
    }
    if (accion.includes('EVALUAR')) {
      return 'bg-amber-100 text-amber-800 border-amber-300';
    }
    if (accion.includes('IMPLEMENTAR')) {
      return 'bg-purple-100 text-purple-800 border-purple-300';
    }
    return 'bg-slate-100 text-slate-800 border-slate-300';
  };

  if (currentUser && currentUser.rol !== 'ADMINISTRADOR' && currentUser.rol !== 'SUPERADMIN') {
    return (
      <AccesoRestringido
        modulo="Bitácora de Auditoría del Sistema"
        user={currentUser}
        rolRequerido="Administrador de Empresa"
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col antialiased">
      {/* Top Navbar Mobile-First */}
      <header className="bg-upt-navy-900 text-white border-b-2 border-upt-gold shadow-xl sticky top-0 z-40">
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
                  Historial Inmutable de Auditoría
                </span>
                <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-upt-gold text-upt-navy-950 font-black uppercase tracking-wider shrink-0 shadow-sm">
                  RF-16 • RNF-10
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-300 truncate">
                Trazabilidad oficial de operaciones protegida por diseño append-only
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Append-Only Activo</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6">
        
        {/* Filtros Rápidos */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border-2 border-slate-300 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-upt-navy-900 font-black text-xs sm:text-sm">
            <Filter className="w-4 h-4 text-upt-gold-600" />
            <span>Filtros de Auditoría:</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 flex-1 sm:justify-end">
            {/* Filtro Entidad */}
            <select
              value={entidadFiltro}
              onChange={(e) => setEntidadFiltro(e.target.value)}
              className="px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-upt-navy-700 transition"
            >
              <option value="">Todas las Entidades</option>
              <option value="ECS">Elementos (ECS)</option>
              <option value="VERSION_ECS">Versiones de ECS</option>
              <option value="LINEA_BASE">Líneas Base</option>
              <option value="SOLICITUD_CAMBIO">Solicitudes de Cambio</option>
              <option value="USUARIO">Usuarios / Sesión</option>
            </select>

            {/* Filtro Acción */}
            <select
              value={accionFiltro}
              onChange={(e) => setAccionFiltro(e.target.value)}
              className="px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-upt-navy-700 transition"
            >
              <option value="">Todas las Acciones</option>
              <option value="CREAR">Creación</option>
              <option value="APROBAR">Aprobación / Dictamen</option>
              <option value="RECHAZAR">Rechazo</option>
              <option value="EVALUAR">Evaluación de Impacto</option>
              <option value="IMPLEMENTAR">Implementación / Cierre</option>
            </select>
          </div>
        </div>

        {/* Tabla de Auditoría */}
        {loading ? (
          <div className="p-16 text-center bg-white rounded-3xl border-2 border-slate-300 shadow-md">
            <Loader2 className="w-10 h-10 animate-spin text-upt-navy-700 mx-auto mb-3" />
            <p className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Consultando registro inmutable de auditoría...
            </p>
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-300 p-12 text-center shadow-md">
            <ShieldCheck className="w-12 h-12 text-slate-400 mx-auto mb-2" />
            <h3 className="font-black text-slate-900 text-base">Sin eventos registrados con estos filtros</h3>
            <p className="text-xs text-slate-500 mt-1">Prueba seleccionando otros criterios de búsqueda.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border-2 border-slate-300 shadow-md overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Eventos Auditados ({pagination.total} registros totales)
              </span>
              <span className="text-xs font-bold text-slate-600">
                Página {pagination.page} de {pagination.totalPages}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 uppercase font-black tracking-wider text-[10px]">
                    <th className="py-3 px-4">Fecha & Hora</th>
                    <th className="py-3 px-4">Usuario Responsable</th>
                    <th className="py-3 px-4">Rol</th>
                    <th className="py-3 px-4">Acción</th>
                    <th className="py-3 px-4">Entidad Afectada</th>
                    <th className="py-3 px-4 text-right">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-medium">
                        {new Date(log.created_at).toLocaleDateString('es-PE', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-950">
                        {log.usuario ? log.usuario.nombre_completo : 'Sistema / Automático'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-bold text-slate-600 uppercase">
                          {log.usuario?.rol || 'SYSTEM'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center text-[10px] font-black px-2 py-0.5 rounded-full border ${getBadgeAccion(log.accion)}`}>
                          {log.accion}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {log.entidad}: <span className="text-slate-500 font-normal">{log.entidad_id.slice(0, 8)}...</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 rounded-xl bg-upt-navy-50 hover:bg-upt-navy-900 text-upt-navy-900 hover:text-upt-gold font-bold text-[11px] transition inline-flex items-center gap-1 border border-upt-navy-200"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspeccionar</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {pagination.totalPages > 1 && (
              <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => loadLogs(pagination.page - 1)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold disabled:opacity-50 flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </button>
                <span className="text-xs text-slate-600 font-bold">
                  {pagination.page} de {pagination.totalPages}
                </span>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => loadLogs(pagination.page + 1)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold disabled:opacity-50 flex items-center gap-1"
                >
                  Siguiente <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Modal Inspector de Payload JSON */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border-2 border-slate-200 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-upt-gold" />
                <h3 className="font-black text-base text-slate-900">
                  Inspección de Registro #{selectedLog.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto pr-1 flex-1 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase block">Acción</span>
                  <span className="font-bold text-slate-900">{selectedLog.accion}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase block">Entidad</span>
                  <span className="font-mono font-bold text-slate-900">{selectedLog.entidad}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase block">Usuario</span>
                  <span className="font-bold text-slate-900">
                    {selectedLog.usuario?.nombre_completo || 'Sistema'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase block">IP de Origen</span>
                  <span className="font-mono text-slate-700">{selectedLog.ip_address || '127.0.0.1'}</span>
                </div>
              </div>

              {/* Datos Nuevos / Payload */}
              <div>
                <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider block mb-1">
                  Datos Nuevos / Modificados:
                </span>
                <pre className="bg-slate-900 text-emerald-400 p-4 rounded-2xl font-mono text-[11px] overflow-x-auto border border-slate-800">
                  {JSON.stringify(selectedLog.datos_nuevos, null, 2)}
                </pre>
              </div>

              {/* Datos Anteriores si existen */}
              {selectedLog.datos_anteriores && (
                <div>
                  <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider block mb-1">
                    Datos Anteriores (Pre-modificación):
                  </span>
                  <pre className="bg-slate-900 text-amber-400 p-4 rounded-2xl font-mono text-[11px] overflow-x-auto border border-slate-800">
                    {JSON.stringify(selectedLog.datos_anteriores, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 rounded-xl bg-upt-navy-900 text-white font-bold text-xs"
              >
                Cerrar Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
