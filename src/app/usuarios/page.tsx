'use client';

import { useState, useEffect } from 'react';
import AccesoRestringido from '@/components/AccesoRestringido';
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
  Briefcase,
  Edit3,
  Info,
  Sparkles,
} from 'lucide-react';
import NavbarPrincipal from '@/components/NavbarPrincipal';

interface UsuarioColaborador {
  id: string;
  nombre_completo: string;
  email: string;
  rol: 'ADMINISTRADOR' | 'APROBADOR' | 'SOLICITANTE';
  cargo?: string | null;
  activo: boolean;
  created_at: string;
  _count: {
    ecs_responsable: number;
    versiones_autor: number;
    reportes_diarios: number;
  };
}

const SUGERENCIAS_CARGO: Record<string, string[]> = {
  CONSTRUCCION: [
    'Arquitecto Proyectista',
    'Ingeniero Residente',
    'Ingeniero Estructural',
    'Topógrafo de Campo',
    'Supervisor SSOMA',
    'Maestro de Obra',
    'Jefe de Producción / Encofrados',
  ],
  SOFTWARE: [
    'Tech Lead / Líder Técnico',
    'Arquitecto de Software',
    'Backend Engineer',
    'Frontend Engineer',
    'QA Automation / Tester',
    'Diseñador UI/UX',
    'DevOps Engineer',
  ],
  VETERINARIA: [
    'Médico Veterinario Cirujano',
    'Veterinario de Consulta General',
    'Asistente Clínico y Cuidados',
    'Especialista en Diagnóstico por Imágenes',
    'Farmacéutico Veterinario',
  ],
};

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioColaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [rubro, setRubro] = useState<string>('CONSTRUCCION');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEditUser, setModalEditUser] = useState<UsuarioColaborador | null>(null);

  // Formulario nuevo usuario
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [cargo, setCargo] = useState('');
  const [rol, setRol] = useState<'ADMINISTRADOR' | 'APROBADOR' | 'SOLICITANTE'>('SOLICITANTE');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Formulario edición
  const [editRol, setEditRol] = useState<'ADMINISTRADOR' | 'APROBADOR' | 'SOLICITANTE'>('SOLICITANTE');
  const [editCargo, setEditCargo] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

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
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.user) {
          setCurrentUser(data.data.user);
          if (data.data.user.rubro) {
            setRubro(data.data.user.rubro);
          }
          if (data.data.user.rol === 'ADMINISTRADOR' || data.data.user.rol === 'SUPERADMIN') {
            loadUsuarios();
          } else {
            setLoading(false);
          }
        }
      })
      .catch(() => setLoading(false));
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
          cargo: cargo.trim() || undefined,
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

      setSuccessMsg(`Colaborador ${nombre} registrado exitosamente como ${cargo.trim() || rol}.`);
      setNombre('');
      setEmail('');
      setCargo('');
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

  const handleAbrirEdicion = (u: UsuarioColaborador) => {
    setModalEditUser(u);
    setEditRol(u.rol);
    setEditCargo(u.cargo || '');
  };

  const handleGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEditUser) return;
    setSavingEdit(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/usuarios/${modalEditUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rol: editRol,
          cargo: editCargo.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Error al actualizar colaborador');
        setSavingEdit(false);
        return;
      }

      setSuccessMsg(`Datos de ${modalEditUser.nombre_completo} actualizados correctamente.`);
      setModalEditUser(null);
      loadUsuarios();
    } catch {
      setErrorMsg('Error de conexión al actualizar colaborador');
    } finally {
      setSavingEdit(false);
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

  const sugerencias = SUGERENCIAS_CARGO[rubro] || SUGERENCIAS_CARGO.CONSTRUCCION;

  if (currentUser && currentUser.rol !== 'ADMINISTRADOR' && currentUser.rol !== 'SUPERADMIN') {
    return (
      <AccesoRestringido
        modulo="Gestión de Personal y Roles"
        user={currentUser}
        rolRequerido="Administrador de Empresa"
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#13151A] text-slate-100 flex flex-col antialiased selection:bg-upt-gold selection:text-slate-950">
      {/* Navbar Global Unificado */}
      <NavbarPrincipal user={currentUser} />

      {/* Sub-Header Mobile-First */}
      <div className="bg-[#16181D] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href="/dashboard"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition border border-white/10"
              title="Volver al Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm sm:text-base text-white tracking-tight truncate">
                  Gestión de Personal y Roles
                </span>
                <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-upt-gold/20 text-upt-gold border border-upt-gold/30 font-bold uppercase tracking-wider shrink-0">
                  {rubro === 'CONSTRUCCION' ? 'Obras Civiles' : rubro === 'SOFTWARE' ? 'Tecnología' : 'Salud Veterinaria'}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                Directorio institucional de colaboradores, cargos operativos y privilegios RBAC
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-1 sm:pt-0 border-t border-white/10 sm:border-t-0">
            <button
              onClick={() => setModalOpen(true)}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-upt-gold to-amber-400 hover:brightness-110 text-slate-950 font-bold text-xs sm:text-sm shadow-xs transition flex items-center gap-1.5 shrink-0 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3] text-slate-950" />
              <span className="hidden sm:inline">Nuevo Colaborador</span>
              <span className="sm:hidden font-bold">Nuevo</span>
            </button>
          </div>
        </div>
      </div>

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
          <div className="bg-[#1A1D25] p-5 rounded-3xl border border-white/10 border-l-4 border-l-purple-500 shadow-md">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 block">
              1. Administradores
            </span>
            <div className="mt-2 text-2xl font-black text-white">
              {usuarios.filter((u) => u.rol === 'ADMINISTRADOR').length}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Control global de la empresa y auditoría</p>
          </div>

          <div className="bg-[#1A1D25] p-5 rounded-3xl border border-white/10 border-l-4 border-l-emerald-500 shadow-md">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 block">
              2. Especialistas Aprobadores
            </span>
            <div className="mt-2 text-2xl font-black text-emerald-400">
              {usuarios.filter((u) => u.rol === 'APROBADOR').length}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Responsables del dictamen de pre-factibilidad y RFCs</p>
          </div>

          <div className="bg-[#1A1D25] p-5 rounded-3xl border border-white/10 border-l-4 border-l-sky-500 shadow-md">
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-300 block">
              3. Solicitantes & Campo
            </span>
            <div className="mt-2 text-2xl font-black text-white">
              {usuarios.filter((u) => u.rol === 'SOLICITANTE').length}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Operarios, técnicos de campo y redactores</p>
          </div>
        </div>

        {/* Tabla de Usuarios */}
        {loading ? (
          <div className="p-16 text-center bg-[#1A1D25] rounded-3xl border border-white/10 shadow-md">
            <Loader2 className="w-10 h-10 animate-spin text-upt-gold mx-auto mb-3" />
            <p className="text-xs font-black text-slate-300 uppercase tracking-wider">
              Cargando directorio de personal...
            </p>
          </div>
        ) : (
          <div className="bg-[#1A1D25] rounded-3xl border border-white/10 shadow-md overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-white/10 bg-[#14161E] flex items-center justify-between">
              <span className="text-xs font-black text-white uppercase tracking-wider">
                Colaboradores Registrados ({usuarios.length} activos)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#14161E] border-b border-white/10 text-slate-400 uppercase font-black tracking-wider text-[10px]">
                    <th className="py-3 px-4">Colaborador / Especialidad</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Rol Operativo (SGCS)</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-center">Artefactos / Reportes</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {usuarios.map((u) => (
                    <tr key={u.id} className="hover:bg-white/5 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-white/10 text-upt-gold font-black text-xs flex items-center justify-center shrink-0 border border-white/10">
                            {u.nombre_completo.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-white text-xs">{u.nombre_completo}</p>
                            {u.cargo ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 mt-0.5">
                                <Briefcase className="w-2.5 h-2.5 text-purple-400" />
                                {u.cargo}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500 italic block mt-0.5">Sin cargo específico</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-mono">{u.email}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleAbrirEdicion(u)}
                          className={`inline-flex items-center text-[10px] font-black px-2.5 py-0.5 rounded-full border transition hover:opacity-80 ${getBadgeRol(
                            u.rol
                          )}`}
                          title="Haga clic para editar rol o cargo"
                        >
                          <span className="flex items-center gap-1">
                            <span>{u.rol}</span>
                            <Edit3 className="w-3 h-3 opacity-60" />
                          </span>
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        {u.activo ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <UserCheck className="w-3 h-3 text-emerald-400" /> Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            <UserX className="w-3 h-3 text-rose-400" /> Inactivo
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-300 font-medium">
                        {u._count.ecs_responsable} ECS • {u._count.reportes_diarios} partes
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleAbrirEdicion(u)}
                            className="px-2.5 py-1 rounded-xl text-xs font-bold text-slate-200 bg-white/10 hover:bg-white/20 border border-white/10 transition"
                            title="Editar rol y especialidad"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleToggleActivo(u)}
                            className={`px-2.5 py-1 rounded-xl text-xs font-black transition border ${
                              u.activo
                                ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-600 hover:text-white border-rose-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-600 hover:text-white border-emerald-500/30'
                            }`}
                          >
                            {u.activo ? 'Desactivar' : 'Activar'}
                          </button>
                        </div>
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
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto text-white">
          <div className="bg-[#1A1D25] rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-white/10 space-y-4 animate-in fade-in zoom-in-95 duration-150 my-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-white/10 text-upt-gold flex items-center justify-center border border-white/10">
                  <Users className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white leading-tight">Dar de Alta Colaborador</h3>
                  <p className="text-[11px] text-slate-400">Asigna profesión, rol operativo y credenciales de acceso</p>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCrearUsuario} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-black text-slate-300 mb-1">Nombre Completo <span className="text-rose-400">*</span></label>
                <input
                  required
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Arq. Claudia Morales / Ing. Carlos Mendoza"
                  className="w-full px-3.5 py-2.5 bg-[#14161E] border border-white/10 rounded-2xl font-bold text-white placeholder:text-slate-500 focus:border-sky-400 transition"
                />
              </div>

              <div>
                <label className="block font-black text-slate-300 mb-1">Correo Electrónico <span className="text-rose-400">*</span></label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="claudia.morales@empresa.com"
                  className="w-full px-3.5 py-2.5 bg-[#14161E] border border-white/10 rounded-2xl font-bold text-white placeholder:text-slate-500 focus:border-sky-400 transition"
                />
              </div>

              {/* Cargo / Especialidad por Rubro */}
              <div className="bg-[#14161E] p-3.5 rounded-2xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-black text-purple-300 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                    <span>Cargo / Especialidad Profesional</span>
                  </label>
                  <span className="text-[10px] text-purple-300 font-bold bg-purple-500/20 px-2 py-0.5 rounded-md border border-purple-500/30">
                    Personalizable
                  </span>
                </div>
                <input
                  type="text"
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  placeholder={
                    rubro === 'CONSTRUCCION'
                      ? 'Ej. Arquitecto Proyectista / Ing. Residente'
                      : rubro === 'SOFTWARE'
                      ? 'Ej. Tech Lead / Backend Engineer'
                      : 'Ej. Médico Veterinario Cirujano'
                  }
                  className="w-full px-3.5 py-2 bg-[#1A1D25] border border-white/10 rounded-xl font-bold text-white placeholder:text-slate-500 focus:border-purple-400 transition"
                />
                
                {/* Sugerencias Rápidas según el rubro */}
                <div className="pt-1">
                  <span className="flex items-center gap-1.5 text-[10px] font-black text-purple-300 uppercase tracking-wider mb-1.5">
                    <Info className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Cargos frecuentes de {rubro === 'CONSTRUCCION' ? 'Construcción' : rubro === 'SOFTWARE' ? 'Software' : 'Veterinaria'}:</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {sugerencias.map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setCargo(sug)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition border ${
                          cargo === sug
                            ? 'bg-purple-500/30 text-purple-200 border-purple-400 font-black'
                            : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                        }`}
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-black text-slate-300 mb-1">
                  Rol Operativo de Permisos (SGCS) <span className="text-rose-400">*</span>
                </label>
                <select
                  value={rol}
                  onChange={(e: any) => setRol(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#14161E] border border-white/10 rounded-2xl font-bold text-white focus:border-sky-400 transition"
                >
                  <option value="SOLICITANTE" className="bg-[#1A1D25] text-white">SOLICITANTE • Técnicos de campo, asistentes, redactores de entregables</option>
                  <option value="APROBADOR" className="bg-[#1A1D25] text-white">APROBADOR • Residentes, arquitectos líderes con firma de aprobación y RFCs</option>
                  <option value="ADMINISTRADOR" className="bg-[#1A1D25] text-white">ADMINISTRADOR • Gestión directiva y control de configuración</option>
                </select>
              </div>

              <div>
                <label className="block font-black text-slate-300 mb-1">Contraseña Inicial <span className="text-rose-400">*</span></label>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3.5 py-2.5 bg-[#14161E] border border-white/10 rounded-2xl font-bold text-white placeholder:text-slate-500 focus:border-sky-400 transition"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Protegida con hash criptográfico bcrypt (RNF-01).
                </span>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-upt-gold to-amber-400 hover:brightness-110 text-slate-950 font-black shadow-xs transition disabled:opacity-50"
                >
                  {submitting ? 'Registrando...' : 'Registrar Colaborador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edición de Rol y Cargo */}
      {modalEditUser && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 text-white">
          <div className="bg-[#1A1D25] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-black text-base text-white">
                Editar {modalEditUser.nombre_completo}
              </h3>
              <button onClick={() => setModalEditUser(null)} className="p-1 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarEdicion} className="space-y-4 text-xs">
              <div>
                <label className="block font-black text-slate-300 mb-1">
                  Cargo / Especialidad Profesional
                </label>
                <input
                  type="text"
                  value={editCargo}
                  onChange={(e) => setEditCargo(e.target.value)}
                  placeholder="Ej. Arquitecto Proyectista / Ing. Residente"
                  className="w-full px-3.5 py-2 bg-[#14161E] border border-white/10 rounded-xl font-bold text-white placeholder:text-slate-500 focus:border-sky-400 transition"
                />
                <div className="flex flex-wrap gap-1 mt-2">
                  {sugerencias.slice(0, 4).map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setEditCargo(sug)}
                      className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-black text-slate-300 mb-1">
                  Rol Operativo RBAC (Permisos)
                </label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setEditRol('SOLICITANTE')}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
                      editRol === 'SOLICITANTE'
                        ? 'border-sky-500 bg-sky-500/20 text-sky-300 font-black shadow-xs'
                        : 'border-white/10 hover:bg-white/5 text-slate-300 font-bold'
                    }`}
                  >
                    <span>SOLICITANTE</span>
                    <span className="text-[10px] text-slate-400">Campo & Avance</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditRol('APROBADOR')}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
                      editRol === 'APROBADOR'
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-black shadow-xs'
                        : 'border-white/10 hover:bg-white/5 text-slate-300 font-bold'
                    }`}
                  >
                    <span>APROBADOR</span>
                    <span className="text-[10px] text-slate-400">Dictamen Técnico & RFCs</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditRol('ADMINISTRADOR')}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
                      editRol === 'ADMINISTRADOR'
                        ? 'border-purple-500 bg-purple-500/20 text-purple-300 font-black shadow-xs'
                        : 'border-white/10 hover:bg-white/5 text-slate-300 font-bold'
                    }`}
                  >
                    <span>ADMINISTRADOR</span>
                    <span className="text-[10px] text-slate-400">Acceso Total</span>
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalEditUser(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-upt-gold to-amber-400 hover:brightness-110 text-slate-950 font-black shadow-xs transition disabled:opacity-50"
                >
                  {savingEdit ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
