import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const versionSchema = z.object({
  numero_version: z.string().min(1, 'El número de versión es requerido').max(30),
  descripcion: z.string().min(5, 'La descripción del cambio debe tener al menos 5 caracteres'),
  archivo_url: z.string().url('Debe ser una URL válida hacia el archivo, commit o repositorio').optional().or(z.literal('')),
});

// -------------------------------------------------------------
// POST: Registrar nueva versión para un ECS (RF-07)
// Estado inicial: PENDIENTE
// -------------------------------------------------------------
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const validation = versionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Datos de entrada inválidos', errors: validation.error.format() },
        { status: 400 }
      );
    }

    // Verificar que el ECS pertenezca a la organización (RNF-02)
    const ecs = await prisma.ecs.findFirst({
      where: {
        id: params.id,
        proyecto: { organizacion_id: session.organizacionId },
      },
    });

    if (!ecs) {
      return NextResponse.json({ success: false, message: 'ECS no encontrado' }, { status: 404 });
    }

    const { numero_version, descripcion, archivo_url } = validation.data;

    // Verificar número de versión único para este ECS (RF-07)
    const versionExistente = await prisma.versionEcs.findUnique({
      where: {
        ecs_id_numero_version: {
          ecs_id: params.id,
          numero_version: numero_version.trim(),
        },
      },
    });

    if (versionExistente) {
      return NextResponse.json(
        { success: false, message: `La versión "${numero_version}" ya se encuentra registrada para este ECS` },
        { status: 409 }
      );
    }

    // Transacción ACID para crear versión y auditar (RNF-08, RNF-10)
    const nuevaVersion = await prisma.$transaction(async (tx) => {
      const v = await tx.versionEcs.create({
        data: {
          ecs_id: params.id,
          numero_version: numero_version.trim(),
          descripcion: descripcion.trim(),
          archivo_url: archivo_url || null,
          autor_id: session.userId,
          estado: 'PENDIENTE',
        },
      });

      await tx.auditoriaLog.create({
        data: {
          usuario_id: session.userId,
          accion: 'REGISTRAR_VERSION',
          entidad: 'VERSION_ECS',
          entidad_id: v.id,
          datos_nuevos: {
            ecs_id: ecs.id,
            ecs_codigo: ecs.codigo,
            numero_version: v.numero_version,
            estado: v.estado,
          },
          ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
          user_agent: request.headers.get('user-agent') || 'desconocido',
        },
      });

      return v;
    });

    return NextResponse.json({
      success: true,
      message: 'Versión registrada exitosamente (Estado: Pendiente de Aprobación)',
      data: nuevaVersion,
    });
  } catch (error) {
    console.error('Error al registrar versión:', error);
    return NextResponse.json({ success: false, message: 'Error interno del servidor' }, { status: 500 });
  }
}
