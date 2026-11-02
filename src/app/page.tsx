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
  GraduationCap
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col justify-between bg-slate-50">
      {/* Top Banner de Línea Dorada Institucional */}
      <div className="h-1.5 bg-gradient-to-r from-upt-navy-600 via-upt-gold to-upt-navy-600"></div>

      {/* Navbar Superior */}
      <header className="border-b bg-white/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-upt-navy-600 flex items-center justify-center text-upt-gold shadow-md shadow-upt-navy-600/20 border border-upt-gold/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl text-upt-navy-700 tracking-tight">SGCS Platform</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-upt-gold-100 text-upt-gold-700 border border-upt-gold-300">
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
              className="px-4 py-2 text-sm font-semibold text-upt-navy-600 hover:text-upt-gold-600 transition"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/login"
              className="px-4 py-2.5 text-sm font-bold text-white bg-upt-navy-600 hover:bg-upt-navy-700 rounded-xl shadow-md transition flex items-center gap-2 group"
            >
              Acceder al Portal <ArrowRight className="w-4 h-4 text-upt-gold group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-upt-gold/40 text-upt-navy-700 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-upt-gold animate-pulse"></span>
          Control Estricto de Requerimientos y Pre-Factibilidad Técnica
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-upt-navy-700 tracking-tight max-w-4xl leading-tight">
          Erradica el <span className="text-upt-gold-600 underline decoration-upt-navy-500 decoration-wavy decoration-2">«teléfono descompuesto»</span> en tus servicios.
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
          Ninguna fecha ni costo se promete al cliente sin la estimación previa del especialista técnico.
          Líneas base inmutables, control de cambios formal y bitácora diaria de campo.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/login"
            className="px-7 py-3.5 text-base font-bold text-white bg-upt-navy-600 hover:bg-upt-navy-700 rounded-2xl shadow-xl shadow-upt-navy-600/25 transition flex items-center justify-center gap-2"
          >
            Comenzar Ahora <ArrowRight className="w-5 h-5 text-upt-gold" />
          </Link>
          <a
            href="https://github.com/ClaraBQuispeChileno/G01_Gesti-n-de-la-Configuraci-n-de-S-ftware"
            target="_blank"
            rel="noopener noreferrer"
            className="px-7 py-3.5 text-base font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-2xl transition flex items-center justify-center gap-2 shadow-sm"
          >
            Repositorio Oficial GitHub
          </a>
        </div>

        {/* Las 3 Plantillas de Industria */}
        <div className="mt-16 w-full text-left">
          <div className="text-center mb-8">
            <h2 className="text-xs font-black tracking-widest text-upt-gold-600 uppercase">
              Arquitectura Universal Multi-Industria
            </h2>
            <p className="text-xl font-bold text-slate-800 mt-1">Una plataforma adaptada al lenguaje de cada sector</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Software */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-upt-navy-50 text-upt-navy-600 flex items-center justify-center mb-4">
                <Code2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Empresas de Software</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Control de Sprints, Elementos de Configuración (ECS), versiones de código y bloqueos diarios de APIs.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-upt-navy-600">
                <CheckCircle2 className="w-4 h-4 text-upt-gold" /> Preset Tech Lead & Devs
              </div>
            </div>

            {/* Veterinaria */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Clínicas Veterinarias</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Casos quirúrgicos, analíticas pre-operatorias obligatorias, fichas médicas y evolución en turnos.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Preset Cirujano & Asistente
              </div>
            </div>

            {/* Construcción */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Construcción & Reformas</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Planos estructurales, líneas base de obra, partes diarios con metros cuadrados y fotos desde el celular.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-amber-700">
                <CheckCircle2 className="w-4 h-4 text-amber-600" /> Preset Ingeniero & Capataz
              </div>
            </div>
          </div>
        </div>

        {/* Banner Institucional con Cumplimiento de Requerimientos */}
        <div className="mt-14 w-full bg-upt-navy-700 text-white rounded-3xl p-8 sm:p-10 text-left border-t-4 border-upt-gold shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-upt-navy-500 pb-6 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-upt-gold">Especificación Formal y Académica</span>
              <h3 className="text-xl sm:text-2xl font-black mt-1">Conformidad Total de Requerimientos del SGCS</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1.5 rounded-full bg-upt-gold/20 text-upt-gold-300 text-xs font-bold border border-upt-gold/40">
                18 RF Cubiertos
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                12 RNF Validados
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-sm text-slate-200">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-upt-gold shrink-0 mt-0.5" />
              <span><strong>RNF-01/02:</strong> Bcrypt salt, JWT HttpOnly y RBAC estricto en servidor.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <Activity className="w-5 h-5 text-upt-gold shrink-0 mt-0.5" />
              <span><strong>RNF-04:</strong> Rendimiento &le; 3s para +1000 registros y concurrencia.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <Layers className="w-5 h-5 text-upt-gold shrink-0 mt-0.5" />
              <span><strong>RF-09/10:</strong> Líneas base inmutables con transacciones ACID (RNF-08).</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-upt-gold shrink-0 mt-0.5" />
              <span><strong>RNF-10:</strong> Auditoría Append-Only (solo inserción) no modificable.</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-upt-navy-600" />
            <span>SGCS Platform • Universidad Privada de Tacna (UPT)</span>
          </div>
          <p>Next.js 14 • TypeScript • Tailwind CSS • Prisma ORM • PostgreSQL</p>
        </div>
      </footer>
    </div>
  );
}
