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

    const { searchParams } = new URL(request.url);
    const proyectoId = searchParams.get('proyectoId');
    const codigoCU = searchParams.get('codigo')?.trim().toUpperCase() || 'CU01';

    // Scoping por organización
    const whereProyecto: any = { organizacion_id: session.organizacionId };
    if (proyectoId) {
      whereProyecto.id = proyectoId;
    }

    const proyecto = await prisma.proyectoCaso.findFirst({
      where: whereProyecto,
      include: {
        etapas: { orderBy: { orden: 'asc' } },
      },
    });

    if (!proyecto) {
      return NextResponse.json(
        { success: false, message: 'No se encontró un proyecto activo en su organización' },
        { status: 404 }
      );
    }

    // 1. Obtener todos los ECS asociados al Caso de Uso (CU01 o el especificado)
    const ecsVinculados = await prisma.ecs.findMany({
      where: {
        proyecto_id: proyecto.id,
        OR: [
          { codigo_caso_uso: codigoCU },
          { codigo: { contains: codigoCU, mode: 'insensitive' } },
          { nombre: { contains: codigoCU, mode: 'insensitive' } },
        ],
      },
      include: {
        responsable: { select: { id: true, nombre_completo: true, email: true, cargo: true } },
        versiones: {
          orderBy: { created_at: 'desc' },
          include: {
            autor: { select: { nombre_completo: true } },
            aprobador: { select: { nombre_completo: true } },
          },
        },
        lineas_base: {
          include: {
            linea_base: true,
          },
        },
      },
    });

    // Clasificar según la pizarra del docente (SRS, SAD, Implementación/Código)
    const ecsSrs = ecsVinculados.filter(
      (e) => e.codigo.includes('SRS') || e.nombre.toLowerCase().includes('requisito') || e.etapa_sugerida === 'INICIO'
    );

    const ecsSad = ecsVinculados.filter(
      (e) => e.codigo.includes('SAD') || e.nombre.toLowerCase().includes('arquitectura') || e.tipo === 'DISENO' || e.etapa_sugerida === 'ELABORACION'
    );

    const ecsImplementacion = ecsVinculados.filter(
      (e) => e.tipo === 'CODIGO_FUENTE' || e.tipo === 'BASE_DATOS' || e.tipo === 'CASO_PRUEBA' || e.etapa_sugerida === 'CONSTRUCCION'
    );

    // 2. Obtener actividades del cronograma ligadas al Caso de Uso
    const actividadesCronograma = await prisma.actividadCronograma.findMany({
      where: {
        proyecto_id: proyecto.id,
        codigo_caso_uso: codigoCU,
      },
      include: {
        etapa: true,
        responsable: { select: { id: true, nombre_completo: true, email: true, cargo: true } },
        ecs: { select: { id: true, codigo: true, nombre: true } },
      },
      orderBy: { fecha_inicio: 'asc' },
    });

    // 3. Obtener solicitudes de cambio asociadas a este caso de uso o a sus ECS
    const ecsIds = ecsVinculados.map((e) => e.id);
    const cambiosAsociados = await prisma.solicitudCambio.findMany({
      where: {
        OR: [
          { codigo_caso_uso: codigoCU },
          { ecs_id: { in: ecsIds } },
          { ecs_afectados: { some: { ecs_id: { in: ecsIds } } } },
        ],
      },
      include: {
        ecs: { select: { codigo: true, nombre: true } },
        solicitante: { select: { nombre_completo: true } },
        evaluacion: true,
        version_base: { select: { numero_version: true } },
        version_resultante: { select: { numero_version: true } },
        ecs_afectados: {
          include: {
            ecs: { select: { codigo: true, nombre: true } },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // 4. Lista de todos los casos de uso detectados en el proyecto para el selector
    const todosCasosUsoRaw = await prisma.actividadCronograma.findMany({
      where: { proyecto_id: proyecto.id },
      select: { codigo_caso_uso: true },
      distinct: ['codigo_caso_uso'],
    });

    const listaCasosUso = Array.from(
      new Set(
        todosCasosUsoRaw
          .map((c) => c.codigo_caso_uso)
          .filter((c): c is string => Boolean(c))
          .concat(['CU01', 'CU02', 'CU03'])
      )
    ).sort();

    return NextResponse.json({
      success: true,
      data: {
        proyecto: {
          id: proyecto.id,
          codigo: proyecto.codigo,
          nombre: proyecto.nombre,
          cliente: proyecto.cliente_nombre,
          metodologia: proyecto.metodologia,
          fecha_inicio: proyecto.fecha_inicio,
          fecha_fin: proyecto.fecha_estimada_fin,
        },
        caso_uso_solicitado: codigoCU,
        lista_casos_disponibles: listaCasosUso,
        trazabilidad: {
          srs: ecsSrs,
          sad: ecsSad,
          implementacion: ecsImplementacion,
          otros: ecsVinculados.filter(
            (e) => !ecsSrs.includes(e) && !ecsSad.includes(e) && !ecsImplementacion.includes(e)
          ),
        },
        cronograma_actividades: actividadesCronograma,
        gestion_cambios: cambiosAsociados,
      },
    });
  } catch (error: any) {
    console.error('Error al generar informe por caso de uso:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
