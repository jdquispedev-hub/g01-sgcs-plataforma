import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: { id: string };
}

// -------------------------------------------------------------
// GET: Obtener ECS y versiones aprobadas para Líneas Base (RF-09)
// -------------------------------------------------------------
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const { id: proyectoId } = params;

    // Verificar pertenencia del proyecto a la organización (RNF-02)
    const proyecto = await prisma.proyectoCaso.findFirst({
      where: {
        id: proyectoId,
        organizacion_id: session.organizacionId,
      },
      select: {
        id: true,
        codigo: true,
        nombre: true,
        estado: true,
      },
    });

    if (!proyecto) {
      return NextResponse.json(
        { success: false, message: 'Proyecto no encontrado o no pertenece a su organización' },
        { status: 404 }
      );
    }

    // Obtener los ECS del proyecto con únicamente sus versiones APROBADAS
    const ecsConVersionesAprobadas = await prisma.ecs.findMany({
      where: {
        proyecto_id: proyectoId,
        estado: 'ACTIVO',
      },
      include: {
        responsable: {
          select: { id: true, nombre_completo: true, email: true },
        },
        versiones: {
          where: {
            estado: 'APROBADA',
          },
          select: {
            id: true,
            numero_version: true,
            descripcion: true,
            archivo_url: true,
            estado: true,
            fecha_aprobacion: true,
            created_at: true,
            autor: {
              select: { id: true, nombre_completo: true },
            },
            aprobador: {
              select: { id: true, nombre_completo: true },
            },
          },
          orderBy: {
            created_at: 'desc',
          },
        },
      },
      orderBy: {
        codigo: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        proyecto,
        elementos: ecsConVersionesAprobadas,
      },
    });
  } catch (error) {
    console.error('Error al obtener versiones aprobadas del proyecto:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno al consultar las versiones aprobadas' },
      { status: 500 }
    );
  }
}
