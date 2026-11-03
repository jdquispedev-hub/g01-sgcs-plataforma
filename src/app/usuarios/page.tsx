'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  ShieldCheck,
  ArrowLeft,
  Plus,
  UserCheck,
  UserX,
  X,
  KeyRound,
  Mail,
  User,
  Shield,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface UsuarioColaborador {
  id: string;
  nombre_completo: string;
  email: string;
  rol: 'ADMINISTRADOR' | 'APROBADOR' | 'SOLICITANTE';
  activo: boolean;
  created_at: string;
  _count: {
    ecs_responsable: number;
    versiones_autor: number;
    reportes_diarios: number;
  };
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioColaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEditRol, setModalEditRol] = useState<UsuarioColaborador | null>(null);

  // Formulario nuevo usuario
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState<'ADMINISTRADOR' | 'APROBADOR' | 'SOLICITANTE'>('SOLICITANTE');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadUsuarios = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/usuarios');
      const data = await res.json();
      if (data.success) {
        setUsuarios(data.data);
      } else {
        setErrorMsg(data.message || 'Error al obtener usuarios');
      }
    } catch {
      setErrorMsg('Error de red al cargar el directorio');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsuarios();
  }, []);

  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_completo: nombre.trim(),
          email: email.trim(),
          rol,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Error al crear usuario');
        setSubmitting(false);
        return;
      }

      setSuccessMsg(`Colaborador ${nombre} registrado exitosamente.`);
      setNombre('');
      setEmail('');
      setPassword('');
      setRol('SOLICITANTE');
      setModalOpen(false);
      loadUsuarios();
    } catch {
      setErrorMsg('Error de red al registrar colaborador');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActivo = async (u: UsuarioColaborador) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const nuevoEstado = !u.activo;

    try {
      const res = await fetch(`/api/usuarios/${u.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: nuevoEstado }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'No se pudo cambiar el estado del usuario');
        return;
      }

      setSuccessMsg(`Usuario ${u.nombre_completo} ${nuevoEstado ? 'activado' : 'desactivado'}.`);
      loadUsuarios();
    } catch {
      setErrorMsg('Error al comunicarse con el servidor');
    }
  };

  const handleGuardarCambioRol = async (nuevoRol: 'ADMINISTRADOR' | 'APROBADOR' | 'SOLICITANTE') => {
    if (!modalEditRol) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/usuarios/${modalEditRol.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rol: nuevoRol }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Error al cambiar de rol');
        return;
      }

      setSuccessMsg(`Rol de ${modalEditRol.nombre_completo} actualizado a ${nuevoRol}.`);
      setModalEditRol(null);
      loadUsuarios();
    } catch {
      setErrorMsg('Error de conexión al actualizar rol');
    }
  };

  const getBadgeRol = (r: string) => {
    switch (r) {
      case 'ADMINISTRADOR':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'APROBADOR':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'SOLICITANTE':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

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
                  Gestión de Personal y Roles
                </span>
                <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-upt-gold text-upt-navy-950 font-black uppercase tracking-wider shrink-0 shadow-sm">
                  RF-02 • Control de Acceso
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-300 truncate">
                Directorio institucional de colaboradores y privilegios RBAC
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-1 sm:pt-0 border-t border-white/10 sm:border-t-0">
            <button
              onClick={() => setModalOpen(true)}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-upt-gold to-amber-500 hover:from-amber-400 hover:to-upt-gold text-upt-navy-950 font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition flex items-center gap-1.5 shrink-0 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Nuevo Colaborador</span>
              <span className="sm:hidden font-bold">Nuevo</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6">
        
        {/* Notificaciones */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-100 border-2 border-emerald-300 text-emerald-900 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-100 border-2 border-red-300 text-red-900 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Resumen de Personal por Rol */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl border-2 border-slate-300 border-l-[6px] border-l-purple-600 shadow-md">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 block">
              1. Administradores
            </span>
            <div className="mt-2 text-2xl font-black text-slate-950">
              {usuarios.filter((u) => u.rol === 'ADMINISTRADOR').length}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Control global de la empresa y auditoría</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border-2 border-slate-300 border-l-[6px] border-l-emerald-600 shadow-md">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
              2. Especialistas Aprobadores
            </span>
            <div className="mt-2 text-2xl font-black text-emerald-700">
              {usuarios.filter((u) => u.rol === 'APROBADOR').length}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Responsables del dictamen de pre-factibilidad y RFCs</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border-2 border-slate-300 border-l-[6px] border-l-blue-600 shadow-md">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-800 block">
              3. Solicitantes & Campo
            </span>
            <div className="mt-2 text-2xl font-black text-slate-950">
              {usuarios.filter((u) => u.rol === 'SOLICITANTE').length}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Operarios, técnicos de campo y redactores</p>
          </div>
        </div>

        {/* Tabla de Usuarios */}
        {loading ? (
          <div className="p-16 text-center bg-white rounded-3xl border-2 border-slate-300 shadow-md">
            <Loader2 className="w-10 h-10 animate-spin text-upt-navy-700 mx-auto mb-3" />
            <p className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Cargando directorio de personal...
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border-2 border-slate-300 shadow-md overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Colaboradores Registrados ({usuarios.length} activos)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 uppercase font-black tracking-wider text-[10px]">
                    <th className="py-3 px-4">Colaborador</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Rol Asignado</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-center">Artefactos / Reportes</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usuarios.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-bold text-slate-950 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-upt-navy-100 text-upt-navy-900 font-black text-xs flex items-center justify-center shrink-0">
                          {u.nombre_completo.charAt(0)}
                        </div>
                        <span>{u.nombre_completo}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono">{u.email}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setModalEditRol(u)}
                          className={`inline-flex items-center text-[10px] font-black px-2.5 py-0.5 rounded-full border transition hover:opacity-80 ${getBadgeRol(
                            u.rol
                          )}`}
                          title="Haga clic para cambiar de rol"
                        >
                          {u.rol} ✏️
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        {u.activo ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <UserCheck className="w-3 h-3 text-emerald-600" /> Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300">
                            <UserX className="w-3 h-3 text-red-600" /> Inactivo
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-600 font-medium">
                        {u._count.ecs_responsable} ECS • {u._count.reportes_diarios} partes
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleToggleActivo(u)}
                          className={`px-3 py-1 rounded-xl text-xs font-black transition border ${
                            u.activo
                              ? 'bg-red-50 text-red-700 hover:bg-red-600 hover:text-white border-red-200'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border-emerald-200'
                          }`}
                        >
                          {u.activo ? 'Desactivar' : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* Modal Alta de Colaborador */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border-2 border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-upt-gold" />
                <h3 className="font-black text-base text-slate-900">Dar de Alta Colaborador</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-xl hover:bg-slate-100 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCrearUsuario} className="space-y-4 text-xs">
              <div>
                <label className="block font-black text-slate-700 mb-1">Nombre Completo <span className="text-red-500">*</span></label>
                <input
                  required
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Ing. Lucía Ramírez"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-upt-navy-700 transition"
                />
              </div>

              <div>
                <label className="block font-black text-slate-700 mb-1">Correo Electrónico <span className="text-red-500">*</span></label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="lucia.ramirez@empresa.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-upt-navy-700 transition"
                />
              </div>

              <div>
                <label className="block font-black text-slate-700 mb-1">Rol Operativo <span className="text-red-500">*</span></label>
                <select
                  value={rol}
                  onChange={(e: any) => setRol(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-upt-navy-700 transition"
                >
                  <option value="SOLICITANTE">SOLICITANTE (Técnico de Campo / Redactor)</option>
                  <option value="APROBADOR">APROBADOR (Especialista Técnico / Dictaminador)</option>
                  <option value="ADMINISTRADOR">ADMINISTRADOR (Gestor Directivo)</option>
                </select>
              </div>

              <div>
                <label className="block font-black text-slate-700 mb-1">Contraseña Inicial <span className="text-red-500">*</span></label>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-upt-navy-700 transition"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Protegida con hash criptográfico bcrypt (RNF-01).
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-upt-navy-900 hover:bg-upt-navy-800 text-upt-gold font-black shadow-md transition disabled:opacity-50"
                >
                  {submitting ? 'Registrando...' : 'Registrar Colaborador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cambio de Rol */}
      {modalEditRol && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border-2 border-slate-200 space-y-4">
            <h3 className="font-black text-base text-slate-900">
              Modificar Rol de {modalEditRol.nombre_completo}
            </h3>
            <p className="text-xs text-slate-600">
              Seleccione el nuevo nivel de privilegios RBAC para este usuario en la organización.
            </p>

            <div className="space-y-2 pt-2 text-xs">
              <button
                onClick={() => handleGuardarCambioRol('SOLICITANTE')}
                className="w-full p-3 rounded-2xl border-2 border-blue-200 hover:bg-blue-50 text-blue-900 font-black text-left flex items-center justify-between"
              >
                <span>SOLICITANTE</span>
                <span className="text-[10px] font-bold text-slate-500">Campo & Avance</span>
              </button>

              <button
                onClick={() => handleGuardarCambioRol('APROBADOR')}
                className="w-full p-3 rounded-2xl border-2 border-emerald-200 hover:bg-emerald-50 text-emerald-900 font-black text-left flex items-center justify-between"
              >
                <span>APROBADOR</span>
                <span className="text-[10px] font-bold text-slate-500">Dictamen Técnico</span>
              </button>

              <button
                onClick={() => handleGuardarCambioRol('ADMINISTRADOR')}
                className="w-full p-3 rounded-2xl border-2 border-purple-200 hover:bg-purple-50 text-purple-900 font-black text-left flex items-center justify-between"
              >
                <span>ADMINISTRADOR</span>
                <span className="text-[10px] font-bold text-slate-500">Acceso Total</span>
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setModalEditRol(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
