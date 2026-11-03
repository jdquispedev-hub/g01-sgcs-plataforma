import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { NivelImpacto, EstadoCambio, RolUsuario } from '@prisma/client';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: { id: string };
}

const evaluarSchema = z.object({
  impacto: z.nativeEnum(NivelImpacto, {
    errorMap: () => ({ message: 'Nivel de impacto inválido (BAJO, MEDIO, ALTO, CRITICO)' }),
  }),
  observaciones: z
    .string()
    .min(5, 'Las observaciones y análisis técnico deben tener al menos 5 caracteres'),
  ecs_afectados_ids: z.array(z.string().uuid('ID de ECS inválido')).default([]),
});

// -------------------------------------------------------------
// POST: Registrar evaluación técnica de impacto (RF-13, RNF-08)
// -------------------------------------------------------------
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    // Verificación de rol: Solo Administrador y Aprobador pueden registrar dictamen de evaluación (RF-03, RNF-02)
    const rolesPermitidos: RolUsuario[] = [RolUsuario.SUPERADMIN, RolUsuario.ADMINISTRADOR, RolUsuario.APROBADOR];
    if (!rolesPermitidos.includes(session.rol)) {
      return NextResponse.json(
        { success: false, message: 'Permiso denegado: solo el Especialista Técnico o Administrador puede evaluar cambios' },
        { status: 403 }
      );
    }

    const { id: solicitudId } = params;
    const body = await request.json();
    const validation = evaluarSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Datos de evaluación inválidos', errors: validation.error.format() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Verificar existencia y pertenencia de la RFC
    const solicitud = await prisma.solicitudCambio.findFirst({
      where: {
        id: solicitudId,
        ecs: {
          proyecto: {
            organizacion_id: session.organizacionId,
          },
        },
      },
    });

    if (!solicitud) {
      return NextResponse.json(
        { success: false, message: 'Solicitud de Cambio no encontrada o no pertenece a su organización' },
        { status: 404 }
      );
    }

    const estadosResueltos: EstadoCambio[] = [EstadoCambio.APROBADA, EstadoCambio.RECHAZADA, EstadoCambio.IMPLEMENTADA];
    if (estadosResueltos.includes(solicitud.estado)) {
      return NextResponse.json(
        { success: false, message: `La solicitud ya fue resuelta (Estado: ${solicitud.estado}) y no puede ser reevaluada` },
        { status: 400 }
      );
    }

    // Transacción ACID (RNF-08): Guardar evaluación, vincular ECS colaterales y pasar a EN_EVALUACION
    const evaluacionResultado = await prisma.$transaction(async (tx) => {
      // 1. Guardar o actualizar la evaluación
      const evaluacion = await tx.evaluacionCambio.upsert({
        where: { solicitud_id: solicitudId },
        update: {
          impacto: data.impacto,
          observaciones: data.observaciones.trim(),
          evaluador_id: session.userId,
        },
        create: {
          solicitud_id: solicitudId,
          impacto: data.impacto,
          observaciones: data.observaciones.trim(),
          evaluador_id: session.userId,
        },
      });

      // 2. Limpiar y recrear vínculos de ECS afectados indirectamente
      await tx.cambioEcsAfectado.deleteMany({
        where: { solicitud_id: solicitudId },
      });

      if (data.ecs_afectados_ids.length > 0) {
        await tx.cambioEcsAfectado.createMany({
          data: data.ecs_afectados_ids.map((ecsId) => ({
            solicitud_id: solicitudId,
            ecs_id: ecsId,
          })),
        });
      }

      // 3. Actualizar estado de la solicitud a EN_EVALUACION
      await tx.solicitudCambio.update({
        where: { id: solicitudId },
        data: {
          estado: EstadoCambio.EN_EVALUACION,
        },
      });

      // 4. Registro en auditoria_logs (RNF-10)
      await tx.auditoriaLog.create({
        data: {
          usuario_id: session.userId,
          accion: 'EVALUAR_IMPACTO_CAMBIO',
          entidad: 'SOLICITUD_CAMBIO',
          entidad_id: solicitudId,
          datos_nuevos: {
            impacto: data.impacto,
            ecs_afectados_total: data.ecs_afectados_ids.length,
            estado: EstadoCambio.EN_EVALUACION,
          },
          ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
          user_agent: request.headers.get('user-agent') || 'desconocido',
        },
      });

      return evaluacion;
    });

    return NextResponse.json({
      success: true,
      message: 'Evaluación técnica de impacto registrada con éxito',
      data: evaluacionResultado,
    });
  } catch (error) {
    console.error('Error al evaluar Solicitud de Cambio:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno al registrar la evaluación técnica' },
      { status: 500 }
    );
  }
}
