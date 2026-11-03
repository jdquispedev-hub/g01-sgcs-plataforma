import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// -------------------------------------------------------------
// GET: Reportes Oficiales CSA - Configuration Status Accounting (RF-18)
// Estándar ISO 10007 / CMMI: Contabilidad del Estado de la Configuración
// -------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo') || 'CONSOLIDADO';
    const proyectoId = searchParams.get('proyectoId');

    // 1. Datos de la organización
    const organizacion = await prisma.organizacion.findUnique({
      where: { id: session.organizacionId },
      select: {
        id: true,
        nombre: true,
        rubro: true,
      },
    });

    if (!organizacion) {
      return NextResponse.json({ success: false, message: 'Organización no encontrada' }, { status: 404 });
    }

    // 2. Filtrar proyectos
    const proyectosWhere: any = { organizacion_id: session.organizacionId };
    if (proyectoId) {
      proyectosWhere.id = proyectoId;
    }

    const proyectos = await prisma.proyectoCaso.findMany({
      where: proyectosWhere,
      include: {
        elementos_config: {
          include: {
            responsable: {
              select: { nombre_completo: true, email: true },
            },
            versiones: {
              orderBy: { created_at: 'desc' },
              include: {
                aprobador: { select: { nombre_completo: true } },
                lineas_base: {
                  include: {
                    linea_base: { select: { codigo: true, estado: true } },
                  },
                },
              },
            },
            solicitudes_cambio: {
              include: {
                evaluacion: { select: { impacto: true } },
                version_resultante: { select: { numero_version: true } },
              },
            },
          },
        },
        lineas_base: {
          orderBy: { created_at: 'desc' },
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
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // 3. Ensamblar datos del reporte
    const fechaGeneracion = new Date().toISOString();

    return NextResponse.json({
      success: true,
      data: {
        tipo,
        fecha_generacion: fechaGeneracion,
        generado_por: session.nombreCompleto,
        organizacion,
        proyectos: proyectos.map((p) => {
          // Totales del proyecto
          const totalEcs = p.elementos_config.length;
          let totalVersiones = 0;
          let versionesAprobadas = 0;
          let totalRfcs = 0;
          let rfcsImplementadas = 0;

          const ecsDetalle = p.elementos_config.map((ecs) => {
            totalVersiones += ecs.versiones.length;
            const ultimaVersion = ecs.versiones[0] || null;
            const tieneAprobada = ecs.versiones.some((v) => v.estado === 'APROBADA');
            if (tieneAprobada) versionesAprobadas++;
            totalRfcs += ecs.solicitudes_cambio.length;
            rfcsImplementadas += ecs.solicitudes_cambio.filter((s) => s.estado === 'IMPLEMENTADA').length;

            return {
              codigo: ecs.codigo,
              nombre: ecs.nombre,
              tipo: ecs.tipo,
              ubicacion: ecs.ubicacion,
              responsable: ecs.responsable.nombre_completo,
              ultima_version: ultimaVersion ? ultimaVersion.numero_version : 'N/A',
              estado_ultima_version: ultimaVersion ? ultimaVersion.estado : 'SIN_VERSIONES',
              total_versiones: ecs.versiones.length,
              total_rfcs: ecs.solicitudes_cambio.length,
            };
          });

          return {
            id: p.id,
            codigo: p.codigo,
            nombre: p.nombre,
            cliente: p.cliente_nombre,
            estado: p.estado,
            fecha_inicio: p.fecha_inicio,
            resumen_metricas: {
              total_ecs: totalEcs,
              total_versiones: totalVersiones,
              ecs_con_aprobacion: versionesAprobadas,
              total_lineas_base: p.lineas_base.length,
              lineas_base_vigentes: p.lineas_base.filter((lb) => lb.estado === 'VIGENTE').length,
              total_rfcs: totalRfcs,
              rfcs_implementadas: rfcsImplementadas,
            },
            elementos: ecsDetalle,
            lineas_base: p.lineas_base.map((lb) => ({
              codigo: lb.codigo,
              nombre: lb.nombre,
              estado: lb.estado,
              autor: lb.autor.nombre_completo,
              fecha: lb.created_at,
              total_artefactos: lb.versiones.length,
              versiones: lb.versiones.map((v) => ({
                ecs_codigo: v.version_ecs.ecs.codigo,
                ecs_nombre: v.version_ecs.ecs.nombre,
                version: v.version_ecs.numero_version,
              })),
            })),
          };
        }),
      },
    });
  } catch (error: any) {
    console.error('Error al generar reporte CSA:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno al generar el reporte CSA' },
      { status: 500 }
    );
  }
}
