import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { RolUsuario } from '@prisma/client';

export const dynamic = 'force-dynamic';

// -------------------------------------------------------------
// GET: Consultar Historial Inmutable de Auditoría (RF-16, RNF-10)
// Los registros son strictly append-only (solo lectura sin DELETE ni UPDATE)
// -------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    // RNF-02: Control de acceso RBAC
    const rolesPermitidos: RolUsuario[] = [RolUsuario.SUPERADMIN, RolUsuario.ADMINISTRADOR, RolUsuario.APROBADOR];
    if (!rolesPermitidos.includes(session.rol as RolUsuario)) {
      return NextResponse.json(
        { success: false, message: 'Acceso denegado: Se requiere rol de auditor o directivo' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const entidad = searchParams.get('entidad');
    const accion = searchParams.get('accion');
    const usuarioId = searchParams.get('usuarioId');
    const fechaDesde = searchParams.get('fechaDesde');
    const fechaHasta = searchParams.get('fechaHasta');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '50', 10)));
    const skip = (page - 1) * limit;

    // Scoping multi-tenant estricto: filtrar logs por usuarios de la organización
    const whereClause: any = {
      usuario: {
        organizacion_id: session.organizacionId,
      },
    };

    if (entidad) {
      whereClause.entidad = entidad;
    }
    if (accion) {
      whereClause.accion = accion;
    }
    if (usuarioId) {
      whereClause.usuario_id = usuarioId;
    }

    if (fechaDesde || fechaHasta) {
      whereClause.created_at = {};
      if (fechaDesde) {
        whereClause.created_at.gte = new Date(fechaDesde);
      }
      if (fechaHasta) {
        // Fin del día para incluir eventos de la fecha límite
        const hasta = new Date(fechaHasta);
        hasta.setHours(23, 59, 59, 999);
        whereClause.created_at.lte = hasta;
      }
    }

    // Consulta paginada + conteo total
    const [total, logs] = await Promise.all([
      prisma.auditoriaLog.count({ where: whereClause }),
      prisma.auditoriaLog.findMany({
        where: whereClause,
        include: {
          usuario: {
            select: {
              id: true,
              nombre_completo: true,
              email: true,
              rol: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        take: limit,
        skip,
      }),
    ]);

    // Serialización segura de BigInt
    const logsSerializados = logs.map((log) => ({
      id: log.id.toString(),
      accion: log.accion,
      entidad: log.entidad,
      entidad_id: log.entidad_id,
      datos_anteriores: log.datos_anteriores,
      datos_nuevos: log.datos_nuevos,
      ip_address: log.ip_address,
      user_agent: log.user_agent,
      created_at: log.created_at.toISOString(),
      usuario: log.usuario
        ? {
            id: log.usuario.id,
            nombre_completo: log.usuario.nombre_completo,
            email: log.usuario.email,
            rol: log.usuario.rol,
          }
        : null,
    }));

    return NextResponse.json({
      success: true,
      data: logsSerializados,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error al consultar auditoría:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno al consultar el registro de auditoría' },
      { status: 500 }
    );
  }
}
