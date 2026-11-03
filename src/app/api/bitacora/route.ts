import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const crearReporteSchema = z.object({
  proyecto_id: z.string().uuid('ID de proyecto inválido'),
  resumen_actividades: z.string().min(5, 'El resumen de actividades debe tener al menos 5 caracteres'),
  tiene_bloqueo: z.boolean(),
  detalle_bloqueo: z.string().optional().nullable(),
  metricas_avance: z.record(z.any()).optional().default({}),
});

// -------------------------------------------------------------
// GET: Listar Bitácoras Diarias de Campo (Etapa 4, RNF-04)
// -------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const proyectoId = searchParams.get('proyectoId');
    const soloBloqueos = searchParams.get('soloBloqueos') === 'true';

    const whereClause: any = {
      proyecto: {
        organizacion_id: session.organizacionId,
      },
    };

    if (proyectoId) {
      whereClause.proyecto_id = proyectoId;
    }

    if (soloBloqueos) {
      whereClause.tiene_bloqueo = true;
    }

    const reportes = await prisma.reporteDiario.findMany({
      where: whereClause,
      include: {
        proyecto: {
          select: { id: true, codigo: true, nombre: true },
        },
        usuario: {
          select: { id: true, nombre_completo: true, email: true, rol: true },
        },
      },
      orderBy: { created_at: 'desc' },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      data: reportes,
    });
  } catch (error: any) {
    console.error('Error al listar reportes diarios:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno al consultar la bitácora' },
      { status: 500 }
    );
  }
}

// -------------------------------------------------------------
// POST: Registrar Reporte Diario con Semáforo de Bloqueos (Etapa 4)
// -------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const parseResult = crearReporteSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Datos de reporte inválidos',
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { proyecto_id, resumen_actividades, tiene_bloqueo, detalle_bloqueo, metricas_avance } = parseResult.data;

    // Validación de negocio: Si tiene bloqueo, el detalle es estrictamente obligatorio
    if (tiene_bloqueo && (!detalle_bloqueo || detalle_bloqueo.trim().length < 5)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Debe especificar el motivo y detalle del bloqueo crítico para alertar a gerencia',
        },
        { status: 400 }
      );
    }

    // Verificar que el proyecto pertenezca al tenant
    const proyecto = await prisma.proyectoCaso.findFirst({
      where: {
        id: proyecto_id,
        organizacion_id: session.organizacionId,
      },
    });

    if (!proyecto) {
      return NextResponse.json(
        { success: false, message: 'Proyecto no encontrado en su organización' },
        { status: 404 }
      );
    }

    // Transacción ACID para persistir reporte y log de auditoría
    const nuevoReporte = await prisma.$transaction(async (tx) => {
      const rep = await tx.reporteDiario.create({
        data: {
          proyecto_id,
          usuario_id: session.userId,
          resumen_actividades: resumen_actividades.trim(),
          tiene_bloqueo,
          detalle_bloqueo: tiene_bloqueo ? detalle_bloqueo?.trim() : null,
          metricas_avance,
        },
        include: {
          proyecto: { select: { codigo: true, nombre: true } },
          usuario: { select: { nombre_completo: true } },
        },
      });

      // Si se reportó un bloqueo activo, generar log de auditoría urgente
      if (tiene_bloqueo) {
        await tx.auditoriaLog.create({
          data: {
            usuario_id: session.userId,
            accion: 'ALERTA_BLOQUEO',
            entidad: 'REPORTE_DIARIO',
            entidad_id: rep.id,
            datos_nuevos: {
              proyecto_codigo: proyecto.codigo,
              proyecto_nombre: proyecto.nombre,
              detalle_bloqueo: detalle_bloqueo?.trim(),
              reportado_por: session.nombreCompleto,
            },
          },
        });
      } else {
        await tx.auditoriaLog.create({
          data: {
            usuario_id: session.userId,
            accion: 'CREAR_REPORTE_DIARIO',
            entidad: 'REPORTE_DIARIO',
            entidad_id: rep.id,
            datos_nuevos: {
              proyecto_codigo: proyecto.codigo,
              resumen: resumen_actividades.trim().slice(0, 100),
            },
          },
        });
      }

      return rep;
    });

    return NextResponse.json(
      {
        success: true,
        message: tiene_bloqueo
          ? 'Reporte diario guardado. Se ha generado una alerta gerencial de bloqueo crítico.'
          : 'Reporte diario de avance guardado exitosamente.',
        data: nuevoReporte,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error al registrar reporte diario:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno al registrar la bitácora diaria' },
      { status: 500 }
    );
  }
}
