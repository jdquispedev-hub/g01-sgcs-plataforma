'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle,
  ShieldAlert,
  X,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import GuiaFlujoModal from '@/components/GuiaFlujoModal';
import AgendarReunionModal from '@/components/AgendarReunionModal';
import AppShell from '@/components/AppShell';
import ModalCrearProyecto from '@/components/ModalCrearProyecto';
import ClickUpWorkspace from '@/components/workspace/ClickUpWorkspace';

interface UserData {
  userId: string;
  nombreCompleto: string;
  email: string;
  rol: string;
  organizacionNombre: string;
  rubro: string;
  isSupervising?: boolean;
  originalOrgNombre?: string;
  cargo?: string | null;
}

interface BloqueoActivo {
  id: string;
  detalle_bloqueo: string;
  created_at: string;
  proyecto: { codigo: string; nombre: string };
  usuario: { nombre_completo: string };
}

interface ProyectoItem {
  id: string;
  codigo: string;
  nombre: string;
  cliente_nombre?: string;
  estado?: string;
}

interface UsuarioItem {
  id: string;
  nombre_completo: string;
  email: string;
  rol: string;
  cargo?: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [alertaRestringido, setAlertaRestringido] = useState(false);
  const [moduloRestringido, setModuloRestringido] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('error_acceso') === 'restringido') {
        setAlertaRestringido(true);
        setModuloRestringido(params.get('modulo') || 'solicitado');
      }
    }
  }, []);

  const [user, setUser] = useState<UserData | null>(null);
  const [totalEcs, setTotalEcs] = useState<number>(0);
  const [versionesPendientes, setVersionesPendientes] = useState<number>(0);
  const [lineasVigentes, setLineasVigentes] = useState<number>(0);
  const [rfcPendientes, setRfcPendientes] = useState<number>(0);
  const [bloqueosActivos, setBloqueosActivos] = useState<BloqueoActivo[]>([]);

  const [proyectos, setProyectos] = useState<ProyectoItem[]>([]);
  const [selectedProyectoId, setSelectedProyectoId] = useState<string>('');
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([]);
  const [agendarModalOpen, setAgendarModalOpen] = useState(false);
  const [crearProyectoModalOpen, setCrearProyectoModalOpen] = useState(false);
  const [guiaModalOpen, setGuiaModalOpen] = useState(false);

  const { data: dataMe, error: errorMe } = useSWR('/api/auth/me', fetcher, { revalidateOnFocus: false });
  const { data: dataEcs } = useSWR('/api/ecs', fetcher, { revalidateOnFocus: false });
  const { data: dataLb } = useSWR('/api/lineas-base', fetcher, { revalidateOnFocus: false });
  const { data: dataRfc } = useSWR('/api/cambios', fetcher, { revalidateOnFocus: false });
  const { data: dataBloqueos } = useSWR('/api/bitacora/bloqueos-activos', fetcher, { revalidateOnFocus: false });
  const { data: dataAux, mutate: mutateAux } = useSWR('/api/auxiliares', fetcher, { revalidateOnFocus: false });

  const isInitialLoading = (!dataMe && !errorMe) || !dataEcs || !dataAux;

  useEffect(() => {
    if (dataMe) {
      if (dataMe.success) {
        setUser(dataMe.data.user);
      } else {
        router.push('/login');
      }
    }
    if (errorMe) {
      router.push('/login');
    }
  }, [dataMe, errorMe, router]);

  useEffect(() => {
    if (dataEcs?.success && Array.isArray(dataEcs.data)) {
      setTotalEcs(dataEcs.data.length);
      let pendientes = 0;
      dataEcs.data.forEach((ecs: any) => {
        if (Array.isArray(ecs.versiones)) {
          ecs.versiones.forEach((v: any) => {
            if (v.estado === 'PENDIENTE') pendientes++;
          });
        }
      });
      setVersionesPendientes(pendientes);
    }
  }, [dataEcs]);

  useEffect(() => {
    if (dataLb?.success && Array.isArray(dataLb.data)) {
      const vigentes = dataLb.data.filter((lb: any) => lb.estado === 'VIGENTE').length;
      setLineasVigentes(vigentes);
    }
  }, [dataLb]);

  useEffect(() => {
    if (dataRfc?.success && Array.isArray(dataRfc.data)) {
      const pendientes = dataRfc.data.filter(
        (r: any) => r.estado === 'PENDIENTE_EVALUACION' || r.estado === 'EN_EVALUACION'
      ).length;
      setRfcPendientes(pendientes);
    }
  }, [dataRfc]);

  useEffect(() => {
    if (dataBloqueos?.success && Array.isArray(dataBloqueos.data)) {
      setBloqueosActivos(dataBloqueos.data);
    }
  }, [dataBloqueos]);

  useEffect(() => {
    if (dataAux?.success) {
      if (Array.isArray(dataAux.data.proyectos)) {
        setProyectos(dataAux.data.proyectos);
        if (dataAux.data.proyectos.length > 0 && !selectedProyectoId) {
          setSelectedProyectoId(dataAux.data.proyectos[0].id);
        }
      }
      if (Array.isArray(dataAux.data.usuarios)) {
        setUsuarios(dataAux.data.usuarios);
      }
    }
  }, [dataAux, selectedProyectoId]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <AppShell user={user} onLogout={handleLogout}>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4">
        {/* Banner de Alerta de Acceso Restringido */}
        {alertaRestringido && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                <strong>Acceso restringido:</strong> El módulo <span className="font-mono">{moduloRestringido}</span> requiere permisos de Jefatura o Aprobador.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setAlertaRestringido(false)}
              className="p-1 rounded-md hover:bg-white/10 text-slate-400"
              aria-label="Cerrar alerta"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Banner compacto de Bloqueos Activos en Campo */}
        {bloqueosActivos.length > 0 && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>
                <strong className="text-rose-500">{bloqueosActivos.length} bloqueo(s) operativo(s) activo(s):</strong>{' '}
                <span className="text-slate-400">
                  {bloqueosActivos[0]?.proyecto?.codigo} — {bloqueosActivos[0]?.detalle_bloqueo}
                </span>
              </span>
            </div>
            <Link
              href="/bitacora"
              className="inline-flex items-center gap-1 text-xs font-bold text-rose-500 hover:underline shrink-0"
            >
              Revisar en Bitácora <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Workspace Unificado ClickUp 3.0 + Jira */}
        {isInitialLoading || !user ? (
          <div className="py-16 flex items-center justify-center gap-2 text-xs text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            <span>Cargando espacio de trabajo SGCS...</span>
          </div>
        ) : (
          <ClickUpWorkspace
            user={user}
            proyectos={proyectos}
            selectedProyectoId={selectedProyectoId}
            onSelectProyecto={setSelectedProyectoId}
            stats={{
              totalEcs,
              versionesPendientes,
              lineasVigentes,
              rfcPendientes,
              bloqueosActivos: bloqueosActivos.length,
            }}
            onOpenCrearProyecto={() => setCrearProyectoModalOpen(true)}
            onOpenAgendarReunion={() => setAgendarModalOpen(true)}
          />
        )}
      </div>

      {/* Modal Guía Rápida */}
      <GuiaFlujoModal isOpen={guiaModalOpen} onClose={() => setGuiaModalOpen(false)} rubro={user?.rubro} />

      {/* Modal Agendar Reunión Directa */}
      <AgendarReunionModal
        isOpen={agendarModalOpen}
        onClose={() => setAgendarModalOpen(false)}
        onSuccess={() => {
          mutateAux();
        }}
        initialProyectoId={selectedProyectoId}
        initialFecha="2026-11-03"
        proyectos={proyectos}
        usuarios={usuarios}
        currentUserId={user?.userId}
      />

      {/* Modal Registrar Nuevo Proyecto / Metodología */}
      <ModalCrearProyecto
        isOpen={crearProyectoModalOpen}
        onClose={() => setCrearProyectoModalOpen(false)}
        rubro={user?.rubro}
        onProyectoCreado={(nuevo) => {
          setProyectos((prev) => [nuevo, ...prev]);
          setSelectedProyectoId(nuevo.id);
          mutateAux();
        }}
      />
    </AppShell>
  );
}
