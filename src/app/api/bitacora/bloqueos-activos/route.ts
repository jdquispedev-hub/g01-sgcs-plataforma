import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// -------------------------------------------------------------
// GET: Consultar Bloqueos Críticos Activos en Campo (Alerta Gerencial)
// -------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    // Buscar bloqueos reportados en las últimas 72 horas
    const haceTresDias = new Date();
    haceTresDias.setDate(haceTresDias.getDate() - 3);

    const bloqueos = await prisma.reporteDiario.findMany({
      where: {
        tiene_bloqueo: true,
        created_at: { gte: haceTresDias },
        proyecto: {
          organizacion_id: session.organizacionId,
        },
      },
      include: {
        proyecto: {
          select: { id: true, codigo: true, nombre: true },
        },
        usuario: {
          select: { id: true, nombre_completo: true, email: true },
        },
      },
      orderBy: { created_at: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      total_bloqueos: bloqueos.length,
      data: bloqueos,
    });
  } catch (error: any) {
    console.error('Error al consultar bloqueos activos:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno al consultar bloqueos' },
      { status: 500 }
    );
  }
}
