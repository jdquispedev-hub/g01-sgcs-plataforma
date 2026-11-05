'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Clock,
  Users,
  Handshake,
  Briefcase,
  AlertTriangle,
  Sparkles,
  X,
  Check,
  Plus,
  Loader2,
  FileText,
  UserCheck,
} from 'lucide-react';

export interface ProyectoOption {
  id: string;
  codigo: string;
  nombre: string;
  cliente_nombre?: string;
}

export interface UsuarioOption {
  id: string;
  nombre_completo: string;
  email: string;
  rol: string;
  cargo?: string | null;
}

interface AgendarReunionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (reunionCreada: any) => void;
  initialProyectoId?: string;
  initialFecha?: string;
  proyectos?: ProyectoOption[];
  usuarios?: UsuarioOption[];
  currentUserId?: string;
}

export default function AgendarReunionModal({
  isOpen,
  onClose,
  onSuccess,
  initialProyectoId,
  initialFecha,
  proyectos: initialProyectos = [],
  usuarios: initialUsuarios = [],
  currentUserId,
}: AgendarReunionModalProps) {
  const [proyectos, setProyectos] = useState<ProyectoOption[]>(initialProyectos);
  const [usuarios, setUsuarios] = useState<UsuarioOption[]>(initialUsuarios);
  const [loadingAux, setLoadingAux] = useState(false);

  // Campos del formulario
  const [proyectoId, setProyectoId] = useState(initialProyectoId || '');
  const [convocanteId, setConvocanteId] = useState(currentUserId || '');
  const [tipo, setTipo] = useState<'CLIENTE' | 'EQUIPO_INTERNO' | 'COMITE_CAMBIOS'>('CLIENTE');
  const [fecha, setFecha] = useState(initialFecha || '2026-11-03');
  const [hora, setHora] = useState('10:00');
  const [titulo, setTitulo] = useState('');
  const [participantes, setParticipantes] = useState('');
  const [temasTratados, setTemasTratados] = useState('');
  const [acuerdos, setAcuerdos] = useState('');
  const [proximoPaso, setProximoPaso] = useState('');

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Cargar datos auxiliares si no vinieron como props
  useEffect(() => {
    if (!isOpen) return;

    if (initialProyectos.length > 0) {
      setProyectos(initialProyectos);
    }
    if (initialUsuarios.length > 0) {
      setUsuarios(initialUsuarios);
    }

    if (initialProyectos.length === 0 || initialUsuarios.length === 0) {
      setLoadingAux(true);
      fetch('/api/auxiliares')
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.data) {
            if (data.data.proyectos) {
              setProyectos(data.data.proyectos);
              if (!proyectoId && data.data.proyectos.length > 0) {
                setProyectoId(initialProyectoId || data.data.proyectos[0].id);
              }
            }
            if (data.data.usuarios) {
              setUsuarios(data.data.usuarios);
              if (!convocanteId && data.data.usuarios.length > 0) {
                setConvocanteId(currentUserId || data.data.usuarios[0].id);
              }
            }
          }
        })
        .catch((e) => console.error('Error cargando auxiliares para modal:', e))
        .finally(() => setLoadingAux(false));
    } else {
      if (!proyectoId && initialProyectos.length > 0) {
        setProyectoId(initialProyectoId || initialProyectos[0].id);
      }
      if (!convocanteId && initialUsuarios.length > 0) {
        setConvocanteId(currentUserId || initialUsuarios[0].id);
      }
    }
  }, [isOpen, initialProyectos, initialUsuarios, initialProyectoId, currentUserId]);

  // Si cambia el proyecto o inicialProyectoId
  useEffect(() => {
    if (initialProyectoId) {
      setProyectoId(initialProyectoId);
    }
  }, [initialProyectoId]);

  if (!isOpen) return null;

  const activeProyecto = proyectos.find((p) => p.id === proyectoId) || proyectos[0];

  // Alternar participante al hacer clic en un chip
  const handleToggleParticipante = (nombre: string) => {
    const list = participantes
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const exists = list.some((p) => p.toLowerCase() === nombre.toLowerCase());
    let nextList: string[];
    if (exists) {
      nextList = list.filter((p) => p.toLowerCase() !== nombre.toLowerCase());
    } else {
      nextList = [...list, nombre];
    }
    setParticipantes(nextList.join(', '));
  };

  const isParticipanteSelected = (nombre: string) => {
    return participantes
      .toLowerCase()
      .split(',')
      .map((p) => p.trim())
      .includes(nombre.toLowerCase());
  };

  // Plantillas automáticas con 1 clic
  const aplicarPlantilla = (tipoPlantilla: 'CLIENTE' | 'PLANIFICACION' | 'REVISION' | 'CAMBIO') => {
    const clienteName = activeProyecto?.cliente_nombre || 'Cliente';
    const proyCodigo = activeProyecto?.codigo || 'Proyecto';

    if (tipoPlantilla === 'CLIENTE') {
      setTipo('CLIENTE');
      setTitulo(`Reunión de Levantamiento de Requerimientos y Alcance Inicial (${proyCodigo})`);
      setTemasTratados(
        `Presentación de propuesta técnica, levantamiento de requerimientos clave con ${clienteName}, definición de plazos estimados y presupuesto de entrega.`
      );
      setAcuerdos(
        `Se aprueba la estructura inicial de entregables. El cliente valida los requerimientos de la primera etapa y autoriza el inicio del desarrollo.`
      );
      setProximoPaso('El equipo técnico generará los entregables (ECS) y comenzará la fase de diseño.');
      
      // Auto-seleccionar convocante y cliente
      const userConvocante = usuarios.find((u) => u.id === convocanteId) || usuarios[0];
      const iniciales = [
        userConvocante ? userConvocante.nombre_completo.split('(')[0].trim() : 'Jefe de Proyecto',
        clienteName,
      ];
      setParticipantes(iniciales.join(', '));
    } else if (tipoPlantilla === 'PLANIFICACION') {
      setTipo('EQUIPO_INTERNO');
      setTitulo(`Planificación de Sprint y Asignación de Entregables (${proyCodigo})`);
      setTemasTratados(
        `Distribución de componentes y entregables técnicos (ECS). Revisión de dependencias de arquitectura y cronograma de hitos.`
      );
      setAcuerdos(
        `Cada miembro asume sus tareas correspondientes y se fija como meta someter a revisión técnica antes del viernes.`
      );
      setProximoPaso('Subir versiones preliminares de código y planos para revisión técnica.');
      
      const teamNombres = usuarios.map((u) => u.nombre_completo.split('(')[0].trim());
      setParticipantes(teamNombres.slice(0, 4).join(', '));
    } else if (tipoPlantilla === 'REVISION') {
      setTipo('EQUIPO_INTERNO');
      setTitulo(`Revisión Técnica de Entregables y Congelamiento de Hito (${proyCodigo})`);
      setTemasTratados(
        `Inspección rigurosa de entregables listos. Verificación de pruebas técnicas, planos estructurales y documentación técnica.`
      );
      setAcuerdos(
        `Dictamen técnico FAVORABLE emitido por el Tech Lead. Se aprueba la creación y congelamiento de la Línea Base oficial.`
      );
      setProximoPaso('Crear Hito Congelado (Línea Base Vigente) en el sistema.');
    } else if (tipoPlantilla === 'CAMBIO') {
      setTipo('COMITE_CAMBIOS');
      setTitulo(`Comité de Cambios (CCB): Evaluación de Solicitud del Cliente (${proyCodigo})`);
      setTemasTratados(
        `El cliente ${clienteName} ha solicitado modificaciones en el alcance pactado. Se evalúa el impacto en costo, tiempo y arquitectura.`
      );
      setAcuerdos(
        `Se autoriza la Solicitud de Cambio (RFC) condicionada a una adenda de cronograma de +10 días hábiles.`
      );
      setProximoPaso('Registrar la Solicitud de Cambio (RFC) formal y actualizar la línea base.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    if (!proyectoId) {
      setFormError('Debe seleccionar un proyecto.');
      setSaving(false);
      return;
    }
    if (!titulo.trim()) {
      setFormError('Debe indicar un título o motivo para la reunión.');
      setSaving(false);
      return;
    }
    if (!participantes.trim()) {
      setFormError('Debe indicar los participantes que asistirán o asistieron a la reunión.');
      setSaving(false);
      return;
    }
    if (!temasTratados.trim()) {
      setFormError('Debe resumir los temas tratados o discutidos.');
      setSaving(false);
      return;
    }
    if (!acuerdos.trim()) {
      setFormError('Debe registrar los acuerdos y compromisos asumidos.');
      setSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/reuniones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proyecto_id: proyectoId,
          convocante_id: convocanteId || undefined,
          titulo: titulo.trim(),
          tipo,
          fecha,
          hora: hora.trim() || '10:00',
          participantes: participantes.trim(),
          temas_tratados: temasTratados.trim(),
          acuerdos: acuerdos.trim(),
          proximo_paso: proximoPaso.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Error al guardar la reunión');
      }

      onSuccess(data.data);
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Error interno al registrar la sesión');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border-2 border-slate-300 space-y-4 animate-in fade-in zoom-in-95 duration-150 my-6">
        
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-upt-navy-900 text-upt-gold flex items-center justify-center border border-upt-gold/40 shadow-sm shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <span>Agendar Reunión o Minuta</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Paso 1
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Conecta al cliente con el equipo: acuerdos que dan origen a entregables y cambios.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {formError && (
          <div className="p-3 bg-red-50 border border-red-300 text-red-800 text-xs rounded-xl font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{formError}</span>
          </div>
        )}

        {/* Plantillas Rápidas con 1 clic */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300/80 rounded-2xl p-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-amber-950 font-black text-xs">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>¿Quieres ahorrar tiempo? Usa una Plantilla Rápida (Rellena todo con 1 clic):</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => aplicarPlantilla('CLIENTE')}
              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-amber-100 text-amber-950 text-[11px] font-bold border border-amber-300 shadow-sm transition text-left flex items-center gap-1.5"
            >
              <Handshake className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">1. Con Cliente</span>
            </button>
            <button
              type="button"
              onClick={() => aplicarPlantilla('PLANIFICACION')}
              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-amber-100 text-amber-950 text-[11px] font-bold border border-amber-300 shadow-sm transition text-left flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">2. Planif. Equipo</span>
            </button>
            <button
              type="button"
              onClick={() => aplicarPlantilla('REVISION')}
              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-amber-100 text-amber-950 text-[11px] font-bold border border-amber-300 shadow-sm transition text-left flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span className="truncate">3. Revisión / LB</span>
            </button>
            <button
              type="button"
              onClick={() => aplicarPlantilla('CAMBIO')}
              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-amber-100 text-amber-950 text-[11px] font-bold border border-amber-300 shadow-sm transition text-left flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">4. Cambio (RFC)</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Fila: Proyecto y Convocante */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">
                Proyecto Asociado:
              </label>
              <select
                value={proyectoId}
                onChange={(e) => setProyectoId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-upt-navy-700 transition"
                required
              >
                {proyectos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.codigo} - {p.nombre} {p.cliente_nombre ? `(${p.cliente_nombre})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">
                ¿Quién Convoca / Dirige la Reunión?:
              </label>
              <select
                value={convocanteId}
                onChange={(e) => setConvocanteId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-upt-navy-700 transition"
                required
              >
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre_completo}{u.cargo ? ` (${u.cargo})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fila: Tipo, Fecha y Hora */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">
                Tipo de Reunión:
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-upt-navy-700 transition"
                required
              >
                <option value="CLIENTE">Reunión con Cliente (Acuerdos)</option>
                <option value="EQUIPO_INTERNO">Interna de Equipo Técnico</option>
                <option value="COMITE_CAMBIOS">Comité de Control de Cambios (CCB)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">
                Fecha:
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-upt-navy-700 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">
                Hora:
              </label>
              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-upt-navy-700 transition"
                required
              />
            </div>
          </div>

          {/* Título / Motivo */}
          <div>
            <label className="block text-xs font-black text-slate-800 mb-1">
              Título / Motivo Principal:
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Levantamiento de requerimientos iniciales o Revisión de prototipo"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-upt-navy-700 transition placeholder:font-normal"
              required
            />
          </div>

          {/* Participantes Asistentes con Selector de 1 Clic */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-black text-slate-800">
                Participantes Asistentes:
              </label>
              <span className="text-[10px] text-slate-500 font-medium">
                Haz clic en los nombres para añadirlos/quitarlos:
              </span>
            </div>
            
            <input
              type="text"
              value={participantes}
              onChange={(e) => setParticipantes(e.target.value)}
              placeholder="Escribe o haz clic en los miembros abajo..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-upt-navy-700 transition placeholder:font-normal mb-2"
              required
            />

            {/* Chips de Selección Rápida */}
            <div className="flex flex-wrap gap-1.5 p-2 bg-slate-100 rounded-2xl border border-slate-200">
              {/* Chip del Cliente Oficial */}
              {activeProyecto?.cliente_nombre && (
                <button
                  type="button"
                  onClick={() => handleToggleParticipante(activeProyecto.cliente_nombre!)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition flex items-center gap-1 ${
                    isParticipanteSelected(activeProyecto.cliente_nombre)
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                      : 'bg-white hover:bg-emerald-50 text-emerald-900 border-emerald-300'
                  }`}
                >
                  <Handshake className="w-3.5 h-3.5" />
                  <span>{activeProyecto.cliente_nombre}</span>
                  {isParticipanteSelected(activeProyecto.cliente_nombre) && (
                    <Check className="w-3 h-3 ml-0.5" />
                  )}
                </button>
              )}

              {/* Chips de Miembros del Equipo */}
              {usuarios.map((u) => {
                const shortName = u.nombre_completo.split('(')[0].trim();
                const isSelected = isParticipanteSelected(shortName);
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleToggleParticipante(shortName)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition flex items-center gap-1 ${
                      isSelected
                        ? 'bg-upt-navy-900 text-white border-upt-navy-950 shadow-sm'
                        : 'bg-white hover:bg-slate-200 text-slate-800 border-slate-300'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>{shortName}</span>
                    {u.cargo && <span className={`text-[9px] px-1 rounded font-medium ${isSelected ? 'bg-white/20 text-upt-gold' : 'bg-slate-100 text-purple-700'}`}>{u.cargo}</span>}
                    {isSelected && <Check className="w-3 h-3 text-upt-gold ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Temas Tratados */}
          <div>
            <label className="block text-xs font-black text-slate-800 mb-1">
              Temas Tratados / Puntos Discutidos:
            </label>
            <textarea
              value={temasTratados}
              onChange={(e) => setTemasTratados(e.target.value)}
              rows={2}
              placeholder="¿Qué se habló? Requerimientos del cliente, aspectos técnicos, plazos..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-upt-navy-700 transition"
              required
            />
          </div>

          {/* Acuerdos y Compromisos */}
          <div>
            <label className="block text-xs font-black text-slate-800 mb-1">
              Acuerdos y Compromisos Vinculantes:
            </label>
            <textarea
              value={acuerdos}
              onChange={(e) => setAcuerdos(e.target.value)}
              rows={2}
              placeholder="¿Qué se pactó? Aprobación de alcance, plazos de entrega, cambios aceptados..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-upt-navy-700 transition"
              required
            />
          </div>

          {/* Próximo Paso */}
          <div>
            <label className="block text-xs font-black text-slate-800 mb-1">
              Próximo Paso / Responsable Inmediato:
            </label>
            <input
              type="text"
              value={proximoPaso}
              onChange={(e) => setProximoPaso(e.target.value)}
              placeholder="Ej: Ana Torres subirá el prototipo / Tech Lead emitirá dictamen de línea base"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-upt-navy-700 transition"
            />
          </div>

          {/* Botones de Acción */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-upt-gold hover:bg-amber-400 text-upt-navy-950 font-black text-xs shadow-md transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando Sesión...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Guardar y Notificar a la Agenda</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
