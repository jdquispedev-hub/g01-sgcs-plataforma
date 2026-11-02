import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { TipoEcs } from '@prisma/client';

const ecsUpdateSchema = z.object({
  nombre: z.string().min(3).max(200).optional(),
  tipo: z.nativeEnum(TipoEcs).optional(),
  descripcion: z.string().optional(),
  ubicacion: z.string().min(1).optional(),
  responsable_id: z.string().uuid().optional(),
  atributos_personalizados: z.record(z.any()).optional(),
});

// -------------------------------------------------------------
// GET: Obtener detalle de un ECS con historial completo (RF-05)
// -------------------------------------------------------------
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const ecs = await prisma.ecs.findFirst({
      where: {
        id: params.id,
        proyecto: { organizacion_id: session.organizacionId },
      },
      include: {
        proyecto: true,
        responsable: { select: { id: true, nombre_completo: true, email: true } },
        versiones: {
          include: {
            autor: { select: { id: true, nombre_completo: true, email: true } },
            aprobador: { select: { id: true, nombre_completo: true, email: true } },
          },
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!ecs) {
      return NextResponse.json({ success: false, message: 'ECS no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: ecs });
  } catch (error) {
    console.error('Error al obtener ECS:', error);
    return NextResponse.json({ success: false, message: 'Error interno del servidor' }, { status: 500 });
  }
}

// -------------------------------------------------------------
// PUT: Actualizar descriptivamente un ECS (RF-06, RNF-10)
// Conserva el código inalterable y audita autor y fecha
// -------------------------------------------------------------
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const validation = ecsUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Datos inválidos', errors: validation.error.format() },
        { status: 400 }
      );
    }

    // Verificar existencia y pertenencia a la organización (RNF-02)
    const ecsExistente = await prisma.ecs.findFirst({
      where: {
        id: params.id,
        proyecto: { organizacion_id: session.organizacionId },
      },
    });

    if (!ecsExistente) {
      return NextResponse.json({ success: false, message: 'ECS no encontrado' }, { status: 404 });
    }

    const data = validation.data;

    // Actualización transaccional con auditoría (RNF-08, RNF-10)
    const ecsActualizado = await prisma.$transaction(async (tx) => {
      const updated = await tx.ecs.update({
        where: { id: params.id },
        data: {
          nombre: data.nombre ?? ecsExistente.nombre,
          tipo: data.tipo ?? ecsExistente.tipo,
          descripcion: data.descripcion ?? ecsExistente.descripcion,
          ubicacion: data.ubicacion ?? ecsExistente.ubicacion,
          responsable_id: data.responsable_id ?? ecsExistente.responsable_id,
          atributos_personalizados: data.atributos_personalizados ?? (ecsExistente.atributos_personalizados as any),
        },
      });

      // Registro inmutable de auditoría (RF-06, RNF-10)
      await tx.auditoriaLog.create({
        data: {
          usuario_id: session.userId,
          accion: 'ACTUALIZAR_ECS',
          entidad: 'ECS',
          entidad_id: updated.id,
          datos_anteriores: {
            nombre: ecsExistente.nombre,
            tipo: ecsExistente.tipo,
            descripcion: ecsExistente.descripcion,
            ubicacion: ecsExistente.ubicacion,
          },
          datos_nuevos: {
            nombre: updated.nombre,
            tipo: updated.tipo,
            descripcion: updated.descripcion,
            ubicacion: updated.ubicacion,
          },
          ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
          user_agent: request.headers.get('user-agent') || 'desconocido',
        },
      });

      return updated;
    });

    return NextResponse.json({
      success: true,
      message: 'ECS actualizado correctamente',
      data: ecsActualizado,
    });
  } catch (error) {
    console.error('Error al actualizar ECS:', error);
    return NextResponse.json({ success: false, message: 'Error interno del servidor' }, { status: 500 });
  }
}
