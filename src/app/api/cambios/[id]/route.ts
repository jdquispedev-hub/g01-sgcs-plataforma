import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: { id: string };
}

// -------------------------------------------------------------
// GET: Consultar expediente completo de Solicitud de Cambio (RF-12)
// -------------------------------------------------------------
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const { id } = params;

    const solicitud = await prisma.solicitudCambio.findFirst({
      where: {
        id,
        ecs: {
          proyecto: {
            organizacion_id: session.organizacionId,
          },
        },
      },
      include: {
        ecs: {
          include: {
            proyecto: {
              select: {
                id: true,
                codigo: true,
                nombre: true,
                estado: true,
              },
            },
            responsable: {
              select: {
                id: true,
                nombre_completo: true,
                email: true,
              },
            },
          },
        },
        version_base: {
          select: {
            id: true,
            numero_version: true,
            descripcion: true,
            archivo_url: true,
            estado: true,
            fecha_aprobacion: true,
            created_at: true,
          },
        },
        version_resultante: {
          select: {
            id: true,
            numero_version: true,
            descripcion: true,
            archivo_url: true,
            estado: true,
            created_at: true,
          },
        },
        solicitante: {
          select: {
            id: true,
            nombre_completo: true,
            email: true,
            rol: true,
          },
        },
        resolutor: {
          select: {
            id: true,
            nombre_completo: true,
            email: true,
            rol: true,
          },
        },
        evaluacion: {
          include: {
            evaluador: {
              select: {
                id: true,
                nombre_completo: true,
                email: true,
                rol: true,
              },
            },
          },
        },
        ecs_afectados: {
          include: {
            ecs: {
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
                  },
                },
              },
            },
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

    return NextResponse.json({
      success: true,
      data: solicitud,
    });
  } catch (error) {
    console.error('Error al consultar Solicitud de Cambio:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno al consultar la Solicitud de Cambio' },
      { status: 500 }
    );
  }
}
