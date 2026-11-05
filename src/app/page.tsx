import Link from 'next/link';
import { 
  ShieldCheck, 
  Layers, 
  Activity, 
  Building2, 
  Stethoscope, 
  Code2, 
  ArrowRight, 
  CheckCircle2, 
  GraduationCap,
  Sparkles,
  Lock,
  GitPullRequest,
  CalendarDays,
  Terminal,
  Check,
  CheckCircle,
  FileText
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#040812] relative overflow-hidden text-slate-100 selection:bg-upt-gold selection:text-slate-950">
      
      {/* Fondo Ambiental Dinámico y Luces de Neón */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        {/* Orbes de Iluminación */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-upt-gold/15 via-blue-600/10 to-transparent blur-[140px] rounded-full" />
        <div className="absolute top-1/4 -left-48 w-[500px] h-[500px] bg-blue-600/10 blur-[130px] rounded-full" />
        <div className="absolute top-1/2 -right-48 w-[500px] h-[500px] bg-amber-500/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-0 left-1/3 w-[600px] h-[400px] bg-emerald-500/5 blur-[140px] rounded-full" />
        
        {/* Malla de Cuadrícula Tecnológica */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Top Banner de Línea Dorada Institucional UPT */}
      <div className="h-1 bg-gradient-to-r from-blue-600 via-upt-gold to-blue-600"></div>

      {/* Header Superior Oscuro con Glassmorphism */}
      <header className="border-b border-white/10 bg-[#040812]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-upt-navy-800 to-slate-900 flex items-center justify-center text-upt-gold shadow-lg shadow-upt-gold/10 border border-upt-gold/40">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl text-white tracking-tight">SGCS Platform</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-upt-gold text-slate-950 uppercase tracking-wider shadow">
                  UPT
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium hidden sm:block">
                Gestión de Configuración y Control Operativo Multi-Tenant
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-300 hover:text-white transition"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/login"
              className="px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-black text-slate-950 bg-gradient-to-r from-upt-gold via-amber-400 to-upt-gold hover:brightness-110 rounded-xl shadow-lg shadow-upt-gold/20 transition flex items-center gap-2 active:scale-95"
            >
              <span>Acceder al Portal</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </Link>
          </div>
        </div>
      </header>

      {/* Contenido Principal (Hero + Mockup + Cards) */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 flex flex-col items-center text-center">
        
        {/* Chip Badge Superior */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-upt-gold/10 border border-upt-gold/30 text-upt-gold text-xs sm:text-sm font-bold mb-8 shadow-sm backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-upt-gold" />
          <span>Control Estricto de Requerimientos y Pre-Factibilidad Técnica</span>
        </div>

        {/* Titular Principal en Tonos Metálicos y Oro */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight max-w-4xl leading-[1.12]">
          Erradica el{' '}
          <span className="bg-gradient-to-r from-amber-200 via-upt-gold to-amber-400 bg-clip-text text-transparent">
            «teléfono descompuesto»
          </span>{' '}
          en tus proyectos.
        </h1>

        {/* Subtítulo Descriptivo */}
        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          Ninguna fecha ni costo se promete al cliente sin la estimación previa del especialista técnico.
          Líneas base inmutables, control de cambios formal y bitácora diaria de campo.
        </p>

        {/* Botonera de Acción */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
          <Link
            href="/login"
            className="px-8 py-3.5 text-sm sm:text-base font-black text-slate-950 bg-gradient-to-r from-upt-gold to-amber-400 hover:brightness-110 rounded-2xl shadow-xl shadow-upt-gold/20 transition flex items-center justify-center gap-2 group active:scale-95"
          >
            <span>Comenzar Ahora</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
          </Link>
        </div>

        {/* Accesos Rápidos de Demostración (Fast Demo Passwords) */}
        <div className="mt-8 p-3 bg-white/[0.04] border border-white/10 rounded-2xl max-w-2xl w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300">
          <span className="font-bold text-amber-300 flex items-center gap-1.5 shrink-0">
            <Lock className="w-4 h-4 text-amber-400" /> Cuentas Demo Configuradas:
          </span>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
            <Link
              href="/login"
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition flex items-center gap-1 border border-white/10"
              title="admin.construccion@sgcs.com"
            >
              <span>🏗️ Caso Don Juan (Construcción)</span>
            </Link>
            <Link
              href="/login"
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition flex items-center gap-1 border border-white/10"
              title="admin.software@sgcs.com"
            >
              <span>💻 Caso E-Learning (Software)</span>
            </Link>
            <Link
              href="/login"
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold transition flex items-center gap-1 border border-amber-500/30"
              title="superadmin@sgcs.com"
            >
              <span>🌐 SuperAdmin</span>
            </Link>
          </div>
        </div>

        {/* ========================================================
           MOCKUP INTERACTIVO EN VIVO: EL SISTEMA EN ACCIÓN
           ======================================================== */}
        <div className="mt-14 w-full max-w-5xl bg-slate-900/90 border-2 border-white/15 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl text-left">
          {/* Barra Superior de Ventana (Estilo Mac/IDE) */}
          <div className="px-5 py-3.5 bg-slate-950/90 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
              <span className="ml-3 font-mono text-xs text-slate-400 font-bold hidden sm:inline">
                sgcs-terminal // pipeline-en-tiempo-real.v2
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-upt-gold bg-upt-gold/10 px-2.5 py-0.5 rounded-full border border-upt-gold/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Estado: Operativo 100%
            </div>
          </div>

          {/* Cuerpo del Mockup: Pipeline Visual de 5 Pasos */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-upt-gold bg-upt-gold/10 px-2.5 py-0.5 rounded-md border border-upt-gold/30 inline-block mb-1">
                  Proyecto de Demostración Activo
                </span>
                <h3 className="text-xl font-black text-white flex items-center gap-2.5">
                  <span>Construcción Vivienda Residencial 2 Pisos</span>
                  <span className="text-xs font-mono font-bold text-slate-400 bg-white/10 px-2 py-0.5 rounded-md">
                    PRY-CASA-01
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Cliente Oficial: <strong className="text-white">Don Juan Pérez (Propietario)</strong> • Constructora Los Andes S.A.C.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Obra en Ejecución</span>
                </span>
              </div>
            </div>

            {/* Los 5 Pasos en Cuadrícula Interactiva */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-emerald-400">PASO 1</span>
                  <CalendarDays className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <h4 className="font-bold text-xs text-white">Minutas Vinculantes</h4>
                <p className="text-[10px] text-slate-400">Acuerdo inicial firmado con el cliente</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-blue-400">PASO 2</span>
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <h4 className="font-bold text-xs text-white">Entregables (ECS)</h4>
                <p className="text-[10px] text-slate-400">Código, planos o fichas técnicas</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-amber-400">PASO 3</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <h4 className="font-bold text-xs text-white">Dictamen Técnico</h4>
                <p className="text-[10px] text-slate-400">Aprobación obligatoria del Tech Lead</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-purple-400">PASO 4</span>
                  <Lock className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <h4 className="font-bold text-xs text-white">Línea Base</h4>
                <p className="text-[10px] text-slate-400">Hito pactado congelado e inmutable</p>
              </div>

              <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-rose-400">PASO 5</span>
                  <GitPullRequest className="w-3.5 h-3.5 text-rose-400" />
                </div>
                <h4 className="font-bold text-xs text-white">Cambios (RFC)</h4>
                <p className="text-[10px] text-slate-400">Evaluación de impacto en costo y tiempo</p>
              </div>
            </div>

            {/* Muestra de Métricas del Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Línea Base Oficial</span>
                  <span className="text-xs font-bold text-white">LB-01 Inmutable Vigente</span>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Bitácora de Obra</span>
                  <span className="text-xs font-bold text-white">0 Bloqueos Críticos Activos</span>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-upt-gold/20 text-upt-gold flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Trazabilidad RTV</span>
                  <span className="text-xs font-bold text-white">100% Requisitos Cubiertos</span>
                </div>
              </div>
            </div>

            {/* Acción en Vivo: Solicitud de Cambio de Don Juan */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
                    Caso Vivo: Solicitud de Cambio RFC de Don Juan Pérez
                  </span>
                  <p className="text-xs font-medium text-slate-200">
                    Don Juan solicitó una <strong>piscina temperada</strong>. El equipo estimó el sobrecosto (+12 días) y se evaluará en el Comité CCB formal.
                  </p>
                </div>
              </div>
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-upt-gold to-amber-400 text-slate-950 font-black text-xs hover:brightness-110 transition shrink-0 shadow"
              >
                Ver en Vivo ➔
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================
           SECCIÓN DE TARJETAS DE INDUSTRIA (DARK OBSIDIAN THEME)
           ======================================================== */}
        <div className="mt-20 w-full text-left">
          <div className="text-center mb-10">
            <span className="text-xs font-black tracking-widest text-upt-gold uppercase px-3 py-1 rounded-md bg-upt-gold/10 border border-upt-gold/30 inline-block shadow-sm">
              Arquitectura Universal Multi-Industria
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white mt-3">
              Una plataforma adaptada al lenguaje de cada sector
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-xl mx-auto">
              Cada rubro cuenta con plantillas especializadas, roles de aprobación y flujos de auditoría a la medida.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7">
            
            {/* Card 1: Software */}
            <div className="bg-slate-900/80 backdrop-blur-md p-7 rounded-3xl border-2 border-white/10 hover:border-blue-500 shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner">
                    <Code2 className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 tracking-wider">
                    Tecnología
                  </span>
                </div>
                
                <h3 className="font-black text-xl text-white group-hover:text-blue-400 transition">
                  Empresas de Software
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Control de Sprints, Elementos de Configuración (ECS), versiones de código y bloqueos diarios de APIs.
                </p>

                <div className="mt-5 flex flex-wrap gap-1.5">
                  <span className="text-[11px] font-semibold bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded-md">Control ECS</span>
                  <span className="text-[11px] font-semibold bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded-md">Sprints</span>
                  <span className="text-[11px] font-semibold bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded-md">Git Commits</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-blue-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  Preset Tech Lead & Devs
                </span>
                <span className="text-xs uppercase font-black text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all">➔</span>
              </div>
            </div>

            {/* Card 2: Veterinaria */}
            <div className="bg-slate-900/80 backdrop-blur-md p-7 rounded-3xl border-2 border-white/10 hover:border-emerald-500 shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 tracking-wider">
                    Salud Animal
                  </span>
                </div>
                
                <h3 className="font-black text-xl text-white group-hover:text-emerald-400 transition">
                  Clínicas Veterinarias
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Casos quirúrgicos, analíticas pre-operatorias obligatorias, fichas médicas y evolución en turnos.
                </p>

                <div className="mt-5 flex flex-wrap gap-1.5">
                  <span className="text-[11px] font-semibold bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded-md">Casos Clínicos</span>
                  <span className="text-[11px] font-semibold bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded-md">Pre-quirúrgicos</span>
                  <span className="text-[11px] font-semibold bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded-md">Evolución</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Preset Cirujano & Asistente
                </span>
                <span className="text-xs uppercase font-black text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all">➔</span>
              </div>
            </div>

            {/* Card 3: Construcción */}
            <div className="bg-slate-900/80 backdrop-blur-md p-7 rounded-3xl border-2 border-white/10 hover:border-upt-gold shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-upt-gold" />
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-upt-gold border border-amber-500/30 flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 tracking-wider">
                    Obras Civiles
                  </span>
                </div>
                
                <h3 className="font-black text-xl text-white group-hover:text-upt-gold transition">
                  Construcción & Reformas
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Planos estructurales, líneas base de obra, partes diarios con metros cuadrados y fotos desde el celular.
                </p>

                <div className="mt-5 flex flex-wrap gap-1.5">
                  <span className="text-[11px] font-semibold bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded-md">Planos Técnicos</span>
                  <span className="text-[11px] font-semibold bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded-md">Hitos de Obra</span>
                  <span className="text-[11px] font-semibold bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded-md">Bitácora Cuadrilla</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-upt-gold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-upt-gold" />
                  Preset Ingeniero & Capataz
                </span>
                <span className="text-xs uppercase font-black text-slate-500 group-hover:text-upt-gold group-hover:translate-x-1 transition-all">➔</span>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================
           BANNER DE CONFORMIDAD ACADÉMICA (RF / RNF)
           ======================================================== */}
        <div className="mt-16 w-full bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 text-left border-2 border-upt-gold/40 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6 mb-6">
            <div>
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-upt-gold">
                Especificación Formal y Académica
              </span>
              <h3 className="text-xl sm:text-2xl font-black mt-1 text-white">
                Conformidad Total de Requerimientos del SGCS
              </h3>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="px-3.5 py-1.5 rounded-full bg-upt-gold/20 text-upt-gold text-xs font-black border border-upt-gold/40 shadow-sm">
                18 RF Cubiertos
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-500/40 shadow-sm">
                12 RNF Validados
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs sm:text-sm text-slate-300">
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-upt-gold/30 transition">
              <ShieldCheck className="w-5 h-5 text-upt-gold shrink-0 mt-0.5" />
              <span><strong>RNF-01/02:</strong> Bcrypt salt, JWT HttpOnly y RBAC estricto en servidor.</span>
            </div>
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-upt-gold/30 transition">
              <Activity className="w-5 h-5 text-upt-gold shrink-0 mt-0.5" />
              <span><strong>RNF-04:</strong> Rendimiento &le; 3s para +1000 registros y concurrencia.</span>
            </div>
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-upt-gold/30 transition">
              <Layers className="w-5 h-5 text-upt-gold shrink-0 mt-0.5" />
              <span><strong>RF-09/10:</strong> Líneas base inmutables con transacciones ACID (RNF-08).</span>
            </div>
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-upt-gold/30 transition">
              <CheckCircle2 className="w-5 h-5 text-upt-gold shrink-0 mt-0.5" />
              <span><strong>RNF-10:</strong> Auditoría Append-Only (solo inserción) no modificable.</span>
            </div>
          </div>
        </div>

      </main>

      {/* Footer Tecnológico Oscuro */}
      <footer className="border-t border-white/10 bg-[#02050c] py-7 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-upt-gold" />
            <span className="font-semibold text-slate-300">SGCS Platform • Universidad Privada de Tacna (UPT)</span>
          </div>
          <p className="font-mono text-[11px] text-slate-500">
            Next.js 14 • TypeScript • Tailwind CSS • Prisma ORM • PostgreSQL
          </p>
        </div>
      </footer>
    </div>
  );
}
