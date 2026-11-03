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

    const [proyectos, usuarios] = await Promise.all([
      prisma.proyectoCaso.findMany({
        where: { organizacion_id: session.organizacionId },
        select: { id: true, codigo: true, nombre: true, cliente_nombre: true, estado: true },
        orderBy: { nombre: 'asc' },
      }),
      prisma.usuario.findMany({
        where: { organizacion_id: session.organizacionId, activo: true },
        select: { id: true, nombre_completo: true, email: true, rol: true },
        orderBy: { nombre_completo: 'asc' },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: { proyectos, usuarios },
    });
  } catch (error) {
    console.error('Error al listar auxiliares:', error);
    return NextResponse.json({ success: false, message: 'Error interno del servidor' }, { status: 500 });
  }
}
