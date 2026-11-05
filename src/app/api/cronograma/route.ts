import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const proyectoId = searchParams.get('proyectoId');

    // Scoping por organización
    const whereProyecto: any = { organizacion_id: session.organizacionId };
    if (proyectoId) {
      whereProyecto.id = proyectoId;
    }

    // Obtener proyecto con todas sus entidades cronológicas
    const proyecto = await prisma.proyectoCaso.findFirst({
      where: whereProyecto,
      include: {
        reuniones: {
          include: {
            convocante: { select: { nombre_completo: true } },
          },
          orderBy: { fecha: 'asc' },
        },
        elementos_config: {
          include: {
            versiones: {
              orderBy: { created_at: 'asc' },
              include: {
                autor: { select: { nombre_completo: true } },
                aprobador: { select: { nombre_completo: true } },
              },
            },
          },
          orderBy: { created_at: 'asc' },
        },
        lineas_base: {
          include: {
            autor: { select: { nombre_completo: true } },
            versiones: {
              include: {
                version_ecs: {
                  include: {
                    ecs: { select: { codigo: true, nombre: true } },
                  },
                },
              },
            },
          },
          orderBy: { created_at: 'asc' },
        },
      },
    });

    if (!proyecto) {
      return NextResponse.json({
        success: false,
        message: 'Proyecto no encontrado',
      }, { status: 404 });
    }

    // Obtener las solicitudes de cambio asociadas a este proyecto
    const solicitudesCambio = await prisma.solicitudCambio.findMany({
      where: {
        ecs: {
          proyecto_id: proyecto.id,
        },
      },
      include: {
        ecs: { select: { codigo: true, nombre: true } },
        solicitante: { select: { nombre_completo: true } },
        evaluacion: true,
      },
      orderBy: { created_at: 'asc' },
    });

    // Construir línea de tiempo cronológica unificada
    type TimelineEvent = {
      id: string;
      tipo: 'REUNION' | 'ECS_CREADO' | 'VERSION_APROBADA' | 'LINEA_BASE' | 'SOLICITUD_CAMBIO';
      fecha: string;
      titulo: string;
      subtitulo: string;
      descripcion: string;
      badge: string;
      icono: string;
      metadata?: any;
    };

    const timeline: TimelineEvent[] = [];

    // 1. Evento inicial: Inicio del proyecto
    timeline.push({
      id: `ini-${proyecto.id}`,
      tipo: 'REUNION',
      fecha: proyecto.fecha_inicio.toISOString(),
      titulo: `Arranque de Proyecto: ${proyecto.nombre}`,
      subtitulo: `Cliente: ${proyecto.cliente_nombre}`,
      descripcion: `Se apertura formalmente el proyecto bajo el código ${proyecto.codigo}.`,
      badge: 'Inicio Oficial',
      icono: 'Rocket',
    });

    // 2. Reuniones
    proyecto.reuniones.forEach((r) => {
      const horaStr = r.hora ? ` a las ${r.hora}` : '';
      const convocanteStr = r.convocante?.nombre_completo ? ` • Convocó: ${r.convocante.nombre_completo}` : '';
      timeline.push({
        id: `reu-${r.id}`,
        tipo: 'REUNION',
        fecha: r.fecha.toISOString(),
        titulo: `${r.titulo}${horaStr}`,
        subtitulo: r.tipo === 'CLIENTE' ? `Con Cliente (${r.participantes})${convocanteStr}` : `Con Equipo (${r.participantes})${convocanteStr}`,
        descripcion: `Acuerdos: ${r.acuerdos}${r.proximo_paso ? ` • Próximo paso: ${r.proximo_paso}` : ''}`,
        badge: r.tipo === 'CLIENTE' ? 'Cliente' : r.tipo === 'COMITE_CAMBIOS' ? 'Comité Cambios' : 'Equipo Interno',
        icono: r.tipo === 'CLIENTE' ? 'Users' : 'Briefcase',
        metadata: r,
      });
    });

    // 3. Entregables y Aprobaciones
    proyecto.elementos_config.forEach((ecs) => {
      timeline.push({
        id: `ecs-${ecs.id}`,
        tipo: 'ECS_CREADO',
        fecha: ecs.created_at.toISOString(),
        titulo: `Nuevo Entregable: ${ecs.codigo} - ${ecs.nombre}`,
        subtitulo: `Tipo: ${ecs.tipo === 'DISENO' ? 'Diseño / Planos' : ecs.tipo === 'DOCUMENTO' ? 'Documento / Especificación' : ecs.tipo === 'CODIGO_FUENTE' ? 'Código Fuente' : ecs.tipo === 'BASE_DATOS' ? 'Base de Datos' : ecs.tipo === 'CASO_PRUEBA' ? 'Caso de Prueba / QA' : ecs.tipo}`,
        descripcion: ecs.descripcion || 'Entregable registrado en el inventario del proyecto.',
        badge: 'Artefacto',
        icono: 'FileText',
      });

      ecs.versiones.forEach((v) => {
        if (v.estado === 'APROBADA' && v.fecha_aprobacion) {
          timeline.push({
            id: `ver-${v.id}`,
            tipo: 'VERSION_APROBADA',
            fecha: v.fecha_aprobacion.toISOString(),
            titulo: `Dictamen Aprobado: ${ecs.codigo} v${v.numero_version}`,
            subtitulo: `Dictaminado por ${v.aprobador?.nombre_completo || 'Líder Técnico'}`,
            descripcion: v.descripcion,
            badge: 'Aprobación Técnica',
            icono: 'CheckCircle2',
          });
        }
      });
    });

    // 4. Líneas Base
    proyecto.lineas_base.forEach((lb) => {
      timeline.push({
        id: `lb-${lb.id}`,
        tipo: 'LINEA_BASE',
        fecha: lb.created_at.toISOString(),
        titulo: `Hito Congelado (Línea Base): ${lb.codigo} - ${lb.nombre}`,
        subtitulo: `${lb.versiones.length} versiones de entregables congeladas inmutablemente`,
        descripcion: lb.descripcion || 'Pacto oficial del alcance.',
        badge: 'Línea Base Oficial',
        icono: 'Lock',
      });
    });

    // 5. Solicitudes de Cambio (RFC)
    solicitudesCambio.forEach((rfc) => {
      timeline.push({
        id: `rfc-${rfc.id}`,
        tipo: 'SOLICITUD_CAMBIO',
        fecha: rfc.created_at.toISOString(),
        titulo: `Solicitud de Cambio: ${rfc.codigo}`,
        subtitulo: `Afecta a: ${rfc.ecs.codigo} • Solicitado por ${rfc.solicitante.nombre_completo}`,
        descripcion: `Motivo: ${rfc.justificacion} (Estado: ${rfc.estado})`,
        badge: 'Nuevo Requerimiento / RFC',
        icono: 'GitPullRequest',
        metadata: rfc,
      });
    });

    // Ordenar timeline por fecha
    timeline.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    return NextResponse.json({
      success: true,
      data: {
        proyecto,
        solicitudesCambio,
        timeline,
      },
    });
  } catch (error) {
    console.error('Error al generar cronograma del proyecto:', error);
    return NextResponse.json({ success: false, message: 'Error interno del servidor' }, { status: 500 });
  }
}
