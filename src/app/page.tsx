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
  Github,
  Check,
  Flame,
  FileCheck2
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100 relative overflow-hidden text-slate-900 selection:bg-upt-gold/30 selection:text-upt-navy-950">
      
      {/* Fondo Ambiental Sutil con Aura y Gradientes */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-upt-navy-500/10 via-upt-gold/10 to-transparent blur-3xl rounded-full" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-blue-500/5 blur-3xl rounded-full" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-amber-500/5 blur-3xl rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* Top Banner de Línea Dorada Institucional */}
      <div className="h-1.5 bg-gradient-to-r from-upt-navy-700 via-upt-gold to-upt-navy-700"></div>

      {/* Navbar Superior con Efecto Glassmorphism */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-upt-navy-900 flex items-center justify-center text-upt-gold shadow-md shadow-upt-navy-900/20 border border-upt-gold/40">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl text-upt-navy-900 tracking-tight">SGCS Platform</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-upt-gold text-upt-navy-950 shadow-sm uppercase tracking-wider">
                  UPT
                </span>
              </div>
              <span className="text-xs text-slate-500 font-medium hidden sm:block">
                Gestión de Configuración y Control Operativo Multi-Tenant
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-upt-navy-900 transition"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/login"
              className="px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-extrabold text-upt-navy-950 bg-gradient-to-r from-upt-gold to-amber-400 hover:from-amber-400 hover:to-upt-gold rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-2 group active:scale-95"
            >
              <span>Acceder al Portal</span>
              <ArrowRight className="w-4 h-4 text-upt-navy-950 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 flex flex-col items-center text-center">
        
        {/* Pill Badge Superior */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-slate-300/80 text-upt-navy-900 text-xs sm:text-sm font-bold mb-7 shadow-sm hover:border-upt-gold/60 transition">
          <Sparkles className="w-3.5 h-3.5 text-upt-gold" />
          <span>Control Estricto de Requerimientos y Pre-Factibilidad Técnica</span>
        </div>

        {/* Titular Principal Limpio (Sin subrayados desordenados) */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl leading-[1.18] sm:leading-[1.15]">
          Erradica el{' '}
          <span className="relative inline-block px-2 text-upt-navy-900">
            <span className="relative z-10 text-upt-navy-900">«teléfono descompuesto»</span>
            <span className="absolute inset-x-0 bottom-1.5 h-3 bg-upt-gold/30 -z-0 rounded-sm"></span>
          </span>{' '}
          en la gestión de servicios.
        </h1>

        {/* Subtítulo Descriptivo */}
        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
          Ninguna fecha ni costo se promete al cliente sin la estimación previa del especialista técnico.
          Líneas base inmutables, control de cambios formal y bitácora diaria de campo.
        </p>

        {/* Botonera de Acción CTA */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3.5 w-full sm:w-auto">
          <Link
            href="/login"
            className="px-8 py-3.5 text-sm sm:text-base font-extrabold text-white bg-upt-navy-900 hover:bg-upt-navy-800 rounded-2xl shadow-xl shadow-upt-navy-900/25 transition flex items-center justify-center gap-2 group active:scale-95"
          >
            <span>Comenzar Ahora</span>
            <ArrowRight className="w-5 h-5 text-upt-gold group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="https://github.com/ClaraBQuispeChileno/G01_Gesti-n-de-la-Configuraci-n-de-S-ftware"
            target="_blank"
            rel="noopener noreferrer"
            className="px-7 py-3.5 text-sm sm:text-base font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-2xl transition flex items-center justify-center gap-2 shadow-sm hover:border-slate-400"
          >
            <Github className="w-4 h-4 text-slate-800" />
            <span>Repositorio Oficial GitHub</span>
          </a>
        </div>

        {/* ========================================================
           SECCIÓN DE TARJETAS DE INDUSTRIA REDISEÑADAS
           ======================================================== */}
        <div className="mt-20 w-full text-left">
          <div className="text-center mb-10">
            <span className="text-xs font-black tracking-widest text-upt-gold uppercase px-3 py-1 rounded-md bg-upt-navy-900/90 inline-block shadow-sm">
              Arquitectura Universal Multi-Industria
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
              Una plataforma adaptada al lenguaje de cada sector
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-xl mx-auto">
              Cada rubro cuenta con plantillas especializadas, roles de aprobación y flujos de auditoría a la medida.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7">
            
            {/* Card 1: Software */}
            <div className="bg-white/90 backdrop-blur-sm p-7 rounded-3xl border-2 border-slate-200/90 shadow-sm hover:shadow-2xl hover:border-blue-500/80 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-500" />
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-13 h-13 w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200/70 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Code2 className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 tracking-wider">
                    Tecnología
                  </span>
                </div>
                
                <h3 className="font-black text-xl text-slate-900 group-hover:text-blue-700 transition">
                  Empresas de Software
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Control de Sprints, Elementos de Configuración (ECS), versiones de código y bloqueos diarios de APIs.
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">Control ECS</span>
                  <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">Sprints</span>
                  <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">Git Commits</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  Preset Tech Lead & Devs
                </span>
                <span className="text-[10px] uppercase font-black text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all">➔</span>
              </div>
            </div>

            {/* Card 2: Veterinaria */}
            <div className="bg-white/90 backdrop-blur-sm p-7 rounded-3xl border-2 border-slate-200/90 shadow-sm hover:shadow-2xl hover:border-emerald-500/80 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/70 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 tracking-wider">
                    Salud Animal
                  </span>
                </div>
                
                <h3 className="font-black text-xl text-slate-900 group-hover:text-emerald-700 transition">
                  Clínicas Veterinarias
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Casos quirúrgicos, analíticas pre-operatorias obligatorias, fichas médicas y evolución en turnos.
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">Casos Clínicos</span>
                  <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">Pre-quirúrgicos</span>
                  <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">Evolución</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Preset Cirujano & Asistente
                </span>
                <span className="text-[10px] uppercase font-black text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all">➔</span>
              </div>
            </div>

            {/* Card 3: Construcción */}
            <div className="bg-white/90 backdrop-blur-sm p-7 rounded-3xl border-2 border-slate-200/90 shadow-sm hover:shadow-2xl hover:border-amber-500/80 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-upt-gold" />
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/70 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 tracking-wider">
                    Obras Civiles
                  </span>
                </div>
                
                <h3 className="font-black text-xl text-slate-900 group-hover:text-amber-700 transition">
                  Construcción & Reformas
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Planos estructurales, líneas base de obra, partes diarios con metros cuadrados y fotos desde el celular.
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">Planos Técnicos</span>
                  <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">Hitos de Obra</span>
                  <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">Bitácora Cuadrilla</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-800">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600" />
                  Preset Ingeniero & Capataz
                </span>
                <span className="text-[10px] uppercase font-black text-slate-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all">➔</span>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================
           BANNER DE CONFORMIDAD NORMATIVA Y ACADÉMICA (RNF/RF)
           ======================================================== */}
        <div className="mt-16 w-full bg-gradient-to-br from-upt-navy-950 via-slate-900 to-upt-navy-900 text-white rounded-3xl p-8 sm:p-10 text-left border-2 border-upt-gold/50 shadow-2xl relative overflow-hidden">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-xs sm:text-sm text-slate-200">
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/5">
              <ShieldCheck className="w-5 h-5 text-upt-gold shrink-0 mt-0.5" />
              <span><strong>RNF-01/02:</strong> Bcrypt salt, JWT HttpOnly y RBAC estricto en servidor.</span>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/5">
              <Activity className="w-5 h-5 text-upt-gold shrink-0 mt-0.5" />
              <span><strong>RNF-04:</strong> Rendimiento &le; 3s para +1000 registros y concurrencia.</span>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/5">
              <Layers className="w-5 h-5 text-upt-gold shrink-0 mt-0.5" />
              <span><strong>RF-09/10:</strong> Líneas base inmutables con transacciones ACID (RNF-08).</span>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/5">
              <CheckCircle2 className="w-5 h-5 text-upt-gold shrink-0 mt-0.5" />
              <span><strong>RNF-10:</strong> Auditoría Append-Only (solo inserción) no modificable.</span>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white/90 py-6 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-upt-navy-900" />
            <span className="font-semibold text-slate-700">SGCS Platform • Universidad Privada de Tacna (UPT)</span>
          </div>
          <p className="font-mono text-[11px] text-slate-500">
            Next.js 14 • TypeScript • Tailwind CSS • Prisma ORM • PostgreSQL
          </p>
        </div>
      </footer>
    </div>
  );
}
