import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: { id: string };
}

// -------------------------------------------------------------
// GET: Consultar detalle inmutable de Línea Base (RF-10)
// -------------------------------------------------------------
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const { id } = params;

    const lineaBase = await prisma.lineaBase.findFirst({
      where: {
        id,
        proyecto: {
          organizacion_id: session.organizacionId,
        },
      },
      include: {
        proyecto: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            estado: true,
            cliente_nombre: true,
            organizacion: {
              select: {
                id: true,
                nombre: true,
                rubro: true,
              },
            },
          },
        },
        autor: {
          select: {
            id: true,
            nombre_completo: true,
            email: true,
            rol: true,
          },
        },
        versiones: {
          include: {
            version_ecs: {
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
                autor: {
                  select: {
                    id: true,
                    nombre_completo: true,
                  },
                },
                aprobador: {
                  select: {
                    id: true,
                    nombre_completo: true,
                  },
                },
              },
            },
          },
          orderBy: {
            version_ecs: {
              ecs: {
                codigo: 'asc',
              },
            },
          },
        },
      },
    });

    if (!lineaBase) {
      return NextResponse.json(
        { success: false, message: 'Línea Base no encontrada o no pertenece a su organización' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: lineaBase,
    });
  } catch (error) {
    console.error('Error al consultar Línea Base:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno al consultar la Línea Base' },
      { status: 500 }
    );
  }
}

// -------------------------------------------------------------
// Rechazar explícitamente modificación o eliminación (RF-10 Inmutabilidad)
// -------------------------------------------------------------
export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      message: 'Operación no permitida: Las Líneas Base son estrictamente inmutables (RF-10). Para actualizar un proyecto debe establecerse una nueva Línea Base formal.',
    },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    {
      success: false,
      message: 'Operación no permitida: Las Líneas Base no pueden ser eliminadas para garantizar la trazabilidad y la integridad histórica de la configuración (RF-10, RNF-10).',
    },
    { status: 405 }
  );
}
