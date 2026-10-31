import Link from 'next/link';
import { 
  ShieldCheck, 
  Layers, 
  Activity, 
  Building2, 
  Stethoscope, 
  Code2, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col justify-between">
      {/* Navbar Superior */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight">SGCS Platform</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Multi-Tenant
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 transition"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition flex items-center gap-1.5"
            >
              Acceder al Sistema <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs sm:text-sm font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Control Estricto de Requerimientos y Pre-Factibilidad Técnica
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight max-w-4xl leading-tight">
          Erradica el <span className="text-blue-600">«teléfono descompuesto»</span> en la gestión de tus servicios.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
          Ninguna fecha ni costo se promete al cliente sin la estimación previa del especialista técnico.
          Líneas base inmutables, control de cambios formal y bitácora diaria con semáforo de bloqueos.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/login"
            className="px-6 py-3.5 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/25 transition flex items-center justify-center gap-2"
          >
            Comenzar Ahora <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="https://github.com/ClaraBQuispeChileno/G01_Gesti-n-de-la-Configuraci-n-de-S-ftware"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition flex items-center justify-center gap-2"
          >
            Ver Repositorio GitHub
          </a>
        </div>

        {/* Las 3 Plantillas de Industria */}
        <div className="mt-16 w-full text-left">
          <h2 className="text-center text-xs font-bold tracking-widest text-slate-400 uppercase mb-8">
            Una sola plataforma adaptada al vocabulario de tu industria
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Software */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4">
                <Code2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Empresas de Software</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Control de Sprints, Elementos de Configuración (ECS), versiones de código y bloqueos diarios de APIs.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-violet-700">
                <CheckCircle2 className="w-4 h-4" /> Preset Tech Lead & Devs
              </div>
            </div>

            {/* Veterinaria */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Clínicas Veterinarias</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Casos quirúrgicos, exámenes pre-operatorios obligatorios, fichas médicas y evolución en turnos.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="w-4 h-4" /> Preset Cirujano & Asistente
              </div>
            </div>

            {/* Construcción */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Construcción & Reformas</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Planos estructurales, líneas base de obra, partes diarios con metros cuadrados y fotos desde el celular.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-amber-700">
                <CheckCircle2 className="w-4 h-4" /> Preset Ingeniero & Capataz
              </div>
            </div>
          </div>
        </div>

        {/* Cumplimiento de Requerimientos */}
        <div className="mt-12 w-full bg-slate-900 text-white rounded-3xl p-8 sm:p-10 text-left">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Especificación Formal</span>
              <h3 className="text-xl sm:text-2xl font-bold mt-1">Conformidad de Requerimientos del Sistema</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
                18 RF Cubiertos
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                12 RNF Cubiertos
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-slate-300">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>RNF-01/02:</strong> Bcrypt, JWT HttpOnly y verificación RBAC estricta en servidor.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <Activity className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>RNF-04:</strong> Rendimiento &le; 3s para +1000 registros y 10 usuarios concurrentes.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <Layers className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>RF-09/10:</strong> Líneas base inmutables con transacciones ACID (RNF-08).</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>RNF-10:</strong> Auditoría de solo inserción (Append-only) no modificable.</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 SGCS Platform - Gestión de la Configuración y Control Operativo.</p>
          <p>Next.js 15 • TypeScript • Tailwind CSS • Prisma ORM • PostgreSQL</p>
        </div>
      </footer>
    </div>
  );
}
