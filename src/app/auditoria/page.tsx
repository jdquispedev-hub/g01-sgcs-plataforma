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
import AppShell from '@/components/AppShell';

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
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [entidadFiltro, setEntidadFiltro] = useState('');
  const [accionFiltro, setAccionFiltro] = useState('');
  const [selectedLog, setSelectedLog] = useState<LogItem | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Cargar usuario actual para validar rol
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCurrentUser(data.data);
      })
      .catch((err) => console.error(err));
  }, []);

  const loadLogs = async (page = 1) => {
    setLoading(true);
    try {
      const url = new URL('/api/auditoria', window.location.origin);
      url.searchParams.set('page', page.toString());
      url.searchParams.set('limit', '20');
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
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
    if (accion.includes('RECHAZ')) {
      return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    }
    if (accion.includes('CREAR') || accion.includes('ESTABLECER')) {
      return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
    }
    if (accion.includes('EVALUAR')) {
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    }
    if (accion.includes('IMPLEMENTAR')) {
      return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    }
    return 'bg-white/10 text-slate-300 border-white/10';
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
    <AppShell>
      {/* Sub-header contextual */}
      <div className="bg-[#16181D] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Historial Inmutable de Auditoría
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 uppercase tracking-wider">
                  RF-16 • RNF-10
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Trazabilidad oficial de operaciones protegida por diseño append-only
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Append-Only Activo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        
        {/* Filtros Rápidos */}
        <div className="bg-[#1A1D25] p-4 sm:p-5 rounded-2xl border border-white/10 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-white font-bold text-xs sm:text-sm">
            <Filter className="w-4 h-4 text-amber-400" />
            <span>Filtros de Auditoría:</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 flex-1 sm:justify-end">
            {/* Filtro Entidad */}
            <select
              value={entidadFiltro}
              onChange={(e) => setEntidadFiltro(e.target.value)}
              className="px-3.5 py-2 bg-[#14161E] border border-white/10 rounded-xl text-xs sm:text-sm font-semibold text-slate-200 focus:outline-none focus:border-amber-400/50 transition cursor-pointer"
            >
              <option value="" className="bg-[#1A1D25]">Todas las Entidades</option>
              <option value="ECS" className="bg-[#1A1D25]">Elementos (ECS)</option>
              <option value="VERSION_ECS" className="bg-[#1A1D25]">Versiones de ECS</option>
              <option value="LINEA_BASE" className="bg-[#1A1D25]">Líneas Base</option>
              <option value="SOLICITUD_CAMBIO" className="bg-[#1A1D25]">Solicitudes de Cambio</option>
              <option value="USUARIO" className="bg-[#1A1D25]">Usuarios / Sesión</option>
            </select>

            {/* Filtro Acción */}
            <select
              value={accionFiltro}
              onChange={(e) => setAccionFiltro(e.target.value)}
              className="px-3.5 py-2 bg-[#14161E] border border-white/10 rounded-xl text-xs sm:text-sm font-semibold text-slate-200 focus:outline-none focus:border-amber-400/50 transition cursor-pointer"
            >
              <option value="" className="bg-[#1A1D25]">Todas las Acciones</option>
              <option value="CREAR" className="bg-[#1A1D25]">Creación</option>
              <option value="APROBAR" className="bg-[#1A1D25]">Aprobación / Dictamen</option>
              <option value="RECHAZAR" className="bg-[#1A1D25]">Rechazo</option>
              <option value="EVALUAR" className="bg-[#1A1D25]">Evaluación de Impacto</option>
              <option value="IMPLEMENTAR" className="bg-[#1A1D25]">Implementación / Cierre</option>
            </select>
          </div>
        </div>

        {/* Tabla de Auditoría */}
        {loading ? (
          <div className="p-16 text-center bg-[#1A1D25] rounded-2xl border border-white/10 shadow-md">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-3" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Consultando registro inmutable de auditoría...
            </p>
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-[#1A1D25] rounded-2xl border border-white/10 p-12 text-center shadow-md">
            <ShieldCheck className="w-10 h-10 text-slate-500 mx-auto mb-2" />
            <h3 className="font-bold text-white text-base">Sin eventos registrados con estos filtros</h3>
            <p className="text-xs text-slate-400 mt-1">Prueba seleccionando otros criterios de búsqueda.</p>
          </div>
        ) : (
          <div className="bg-[#1A1D25] rounded-2xl border border-white/10 shadow-md overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-white/10 bg-[#16181D] flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Eventos Auditados ({pagination.total} registros totales)
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Página {pagination.page} de {pagination.totalPages}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#14161E] border-b border-white/10 text-slate-400 uppercase font-bold tracking-wider text-[10px]">
                    <th className="py-3 px-4">Fecha & Hora</th>
                    <th className="py-3 px-4">Usuario Responsable</th>
                    <th className="py-3 px-4">Rol</th>
                    <th className="py-3 px-4">Acción</th>
                    <th className="py-3 px-4">Entidad Afectada</th>
                    <th className="py-3 px-4 text-right">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/5 transition">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-medium">
                        {new Date(log.created_at).toLocaleDateString('es-PE', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        {log.usuario ? log.usuario.nombre_completo : 'Sistema / Automático'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase">
                          {log.usuario?.rol || 'SYSTEM'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBadgeAccion(log.accion)}`}>
                          {log.accion}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-amber-300">
                        {log.entidad}: <span className="text-slate-400 font-normal">{log.entidad_id.slice(0, 8)}...</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white font-semibold text-[11px] transition inline-flex items-center gap-1 border border-white/10"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
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
              <div className="p-4 border-t border-white/10 flex items-center justify-between bg-[#16181D]">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => loadLogs(pagination.page - 1)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-300 disabled:opacity-40 flex items-center gap-1 hover:bg-white/10"
                >
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </button>
                <span className="text-xs text-slate-400 font-semibold">
                  {pagination.page} de {pagination.totalPages}
                </span>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => loadLogs(pagination.page + 1)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-300 disabled:opacity-40 flex items-center gap-1 hover:bg-white/10"
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
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1A1D25] rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-white/10 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">
                  Inspección de Registro #{selectedLog.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto pr-1 flex-1 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-[#14161E] p-3 rounded-xl border border-white/10">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Acción</span>
                  <span className="font-bold text-white">{selectedLog.accion}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Entidad</span>
                  <span className="font-mono font-bold text-amber-300">{selectedLog.entidad}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Usuario</span>
                  <span className="font-semibold text-white">
                    {selectedLog.usuario?.nombre_completo || 'Sistema'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">IP de Origen</span>
                  <span className="font-mono text-slate-300">{selectedLog.ip_address || '127.0.0.1'}</span>
                </div>
              </div>

              {/* Datos Nuevos / Payload */}
              <div>
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Datos Nuevos / Modificados:
                </span>
                <pre className="bg-[#14161E] text-emerald-400 p-4 rounded-xl font-mono text-[11px] overflow-x-auto border border-white/10">
                  {JSON.stringify(selectedLog.datos_nuevos, null, 2)}
                </pre>
              </div>

              {/* Datos Anteriores si existen */}
              {selectedLog.datos_anteriores && (
                <div>
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Datos Anteriores (Pre-modificación):
                  </span>
                  <pre className="bg-[#14161E] text-amber-300 p-4 rounded-xl font-mono text-[11px] overflow-x-auto border border-white/10">
                    {JSON.stringify(selectedLog.datos_anteriores, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/10 transition"
              >
                Cerrar Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </AppShell>
  );
}
