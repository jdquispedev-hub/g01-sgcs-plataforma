import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// -------------------------------------------------------------
// GET: Matriz de Trazabilidad End-to-End (RF-17, RNF-04)
// Cadena: Proyecto ➔ ECS ➔ Versión Aprobada ➔ Línea Base ➔ RFC
// -------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const proyectoId = searchParams.get('proyectoId');

    // 1. Obtener proyectos del tenant
    const proyectosWhere: any = { organizacion_id: session.organizacionId };
    if (proyectoId) {
      proyectosWhere.id = proyectoId;
    }

    const proyectos = await prisma.proyectoCaso.findMany({
      where: proyectosWhere,
      select: {
        id: true,
        codigo: true,
        nombre: true,
        estado: true,
        cliente_nombre: true,
        fecha_inicio: true,
        elementos_config: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            tipo: true,
            ubicacion: true,
            responsable: {
              select: {
                id: true,
                nombre_completo: true,
                email: true,
              },
            },
            versiones: {
              orderBy: { created_at: 'asc' },
              select: {
                id: true,
                numero_version: true,
                descripcion: true,
                estado: true,
                archivo_url: true,
                fecha_aprobacion: true,
                created_at: true,
                autor: {
                  select: { id: true, nombre_completo: true },
                },
                aprobador: {
                  select: { id: true, nombre_completo: true },
                },
                lineas_base: {
                  select: {
                    linea_base: {
                      select: {
                        id: true,
                        codigo: true,
                        nombre: true,
                        estado: true,
                        created_at: true,
                      },
                    },
                  },
                },
                solicitudes_base: {
                  select: {
                    id: true,
                    codigo: true,
                    estado: true,
                    descripcion: true,
                    fecha_resolucion: true,
                    fecha_implementacion: true,
                    evaluacion: {
                      select: { impacto: true },
                    },
                    version_resultante: {
                      select: {
                        id: true,
                        numero_version: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        lineas_base: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            estado: true,
            created_at: true,
            _count: {
              select: { versiones: true },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // 2. Construir matriz procesada y métricas de salud de configuración (CSA)
    const trazabilidadProcesada = proyectos.map((proyecto) => {
      let totalVersiones = 0;
      let versionesAprobadas = 0;
      let ecsConVersionAprobada = 0;
      let ecsEnLineaBaseSet = new Set<string>();
      let totalRfcs = 0;
      let rfcsPendientes = 0;
      let rfcsAprobadas = 0;
      let rfcsImplementadas = 0;

      const ecsMapeados = proyecto.elementos_config.map((ecs) => {
        let tieneAprobada = false;
        let estaEnLineaBase = false;

        totalVersiones += ecs.versiones.length;

        const versionesMapeadas = ecs.versiones.map((v) => {
          if (v.estado === 'APROBADA') {
            versionesAprobadas++;
            tieneAprobada = true;
          }

          const lineasBase = v.lineas_base.map((lb) => lb.linea_base);
          if (lineasBase.length > 0) {
            estaEnLineaBase = true;
            ecsEnLineaBaseSet.add(ecs.id);
          }

          const rfcs = v.solicitudes_base.map((s) => {
            totalRfcs++;
            if (s.estado === 'PENDIENTE_EVALUACION' || s.estado === 'EN_EVALUACION') {
              rfcsPendientes++;
            } else if (s.estado === 'APROBADA') {
              rfcsAprobadas++;
            } else if (s.estado === 'IMPLEMENTADA') {
              rfcsImplementadas++;
            }

            return {
              id: s.id,
              codigo: s.codigo,
              estado: s.estado,
              descripcion: s.descripcion,
              impacto: s.evaluacion?.impacto || null,
              version_resultante: s.version_resultante?.numero_version || null,
            };
          });

          return {
            id: v.id,
            numero_version: v.numero_version,
            descripcion: v.descripcion,
            estado: v.estado,
            archivo_url: v.archivo_url,
            fecha_aprobacion: v.fecha_aprobacion,
            autor: v.autor.nombre_completo,
            aprobador: v.aprobador?.nombre_completo || null,
            lineas_base: lineasBase,
            solicitudes_cambio: rfcs,
          };
        });

        if (tieneAprobada) ecsConVersionAprobada++;

        return {
          id: ecs.id,
          codigo: ecs.codigo,
          nombre: ecs.nombre,
          tipo: ecs.tipo,
          ubicacion: ecs.ubicacion,
          responsable: ecs.responsable.nombre_completo,
          tiene_aprobada: tieneAprobada,
          esta_congelado: estaEnLineaBase,
          versiones: versionesMapeadas,
        };
      });

      const totalEcs = ecsMapeados.length;
      const pctAprobacion = totalEcs > 0 ? Math.round((ecsConVersionAprobada / totalEcs) * 100) : 0;
      const pctCongelamiento = totalEcs > 0 ? Math.round((ecsEnLineaBaseSet.size / totalEcs) * 100) : 0;

      return {
        id: proyecto.id,
        codigo: proyecto.codigo,
        nombre: proyecto.nombre,
        cliente: proyecto.cliente_nombre,
        estado: proyecto.estado,
        metricas: {
          total_ecs: totalEcs,
          total_versiones: totalVersiones,
          versiones_aprobadas: versionesAprobadas,
          ecs_con_aprobacion: ecsConVersionAprobada,
          porcentaje_aprobacion: pctAprobacion,
          ecs_congelados: ecsEnLineaBaseSet.size,
          porcentaje_congelado: pctCongelamiento,
          lineas_base_total: proyecto.lineas_base.length,
          lineas_base_vigentes: proyecto.lineas_base.filter((lb) => lb.estado === 'VIGENTE').length,
          rfcs_totales: totalRfcs,
          rfcs_pendientes: rfcsPendientes,
          rfcs_aprobadas: rfcsAprobadas,
          rfcs_implementadas: rfcsImplementadas,
        },
        elementos_config: ecsMapeados,
        lineas_base: proyecto.lineas_base,
      };
    });

    return NextResponse.json({
      success: true,
      data: trazabilidadProcesada,
    });
  } catch (error: any) {
    console.error('Error al generar matriz de trazabilidad:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno al consultar la trazabilidad' },
      { status: 500 }
    );
  }
}
