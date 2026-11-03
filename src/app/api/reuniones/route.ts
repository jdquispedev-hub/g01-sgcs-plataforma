import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const TIPOS_REUNION = ['CLIENTE', 'EQUIPO_INTERNO', 'COMITE_CAMBIOS'] as const;
type TipoReunionVal = (typeof TIPOS_REUNION)[number];

const crearReunionSchema = z.object({
  proyecto_id: z.string().min(1, 'El proyecto es requerido'),
  titulo: z.string().min(3, 'El título debe tener al menos 3 caracteres').max(200),
  tipo: z.enum(TIPOS_REUNION).default('CLIENTE'),
  fecha: z.string().optional(),
  hora: z.string().optional(),
  convocante_id: z.string().optional(),
  participantes: z.string().min(2, 'Debe especificar los participantes'),
  temas_tratados: z.string().min(3, 'Debe describir los temas tratados'),
  acuerdos: z.string().min(3, 'Debe registrar los acuerdos y compromisos'),
  proximo_paso: z.string().optional(),
});

// -------------------------------------------------------------
// GET: Listar Reuniones con Cliente y Equipo
// -------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const proyectoId = searchParams.get('proyectoId');
    const tipo = searchParams.get('tipo');
    const search = searchParams.get('search') || '';

    const whereClause: any = {
      proyecto: {
        organizacion_id: session.organizacionId,
      },
    };

    if (proyectoId) {
      whereClause.proyecto_id = proyectoId;
    }

    if (tipo && (TIPOS_REUNION as readonly string[]).includes(tipo)) {
      whereClause.tipo = tipo as TipoReunionVal;
    }

    if (search.trim()) {
      whereClause.OR = [
        { titulo: { contains: search.trim(), mode: 'insensitive' } },
        { participantes: { contains: search.trim(), mode: 'insensitive' } },
        { temas_tratados: { contains: search.trim(), mode: 'insensitive' } },
        { acuerdos: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const reuniones = await prisma.reunionProyecto.findMany({
      where: whereClause,
      include: {
        proyecto: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            cliente_nombre: true,
            fecha_inicio: true,
            fecha_estimada_fin: true,
            estado: true,
          },
        },
        convocante: {
          select: {
            id: true,
            nombre_completo: true,
            email: true,
            rol: true,
          },
        },
      },
      orderBy: { fecha: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: reuniones,
    });
  } catch (error) {
    console.error('Error al listar reuniones:', error);
    return NextResponse.json({ success: false, message: 'Error interno del servidor' }, { status: 500 });
  }
}

// -------------------------------------------------------------
// POST: Registrar Nueva Reunión y Minuta
// -------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const result = crearReunionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: result.error.errors[0]?.message || 'Datos de reunión inválidos',
      }, { status: 400 });
    }

    const { proyecto_id, titulo, tipo, fecha, hora, convocante_id, participantes, temas_tratados, acuerdos, proximo_paso } = result.data;

    // Verificar que el proyecto pertenezca a la organización
    const proyecto = await prisma.proyectoCaso.findFirst({
      where: {
        id: proyecto_id,
        organizacion_id: session.organizacionId,
      },
    });

    if (!proyecto) {
      return NextResponse.json({
        success: false,
        message: 'El proyecto seleccionado no existe o no tiene permisos sobre él',
      }, { status: 404 });
    }

    const reunion = await prisma.reunionProyecto.create({
      data: {
        proyecto_id,
        convocante_id: convocante_id || session.userId,
        titulo: titulo.trim(),
        tipo,
        fecha: fecha ? new Date(fecha) : new Date(),
        hora: hora?.trim() || '10:00',
        participantes: participantes.trim(),
        temas_tratados: temas_tratados.trim(),
        acuerdos: acuerdos.trim(),
        proximo_paso: proximo_paso?.trim() || null,
      },
      include: {
        proyecto: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            cliente_nombre: true,
          },
        },
        convocante: {
          select: {
            id: true,
            nombre_completo: true,
            rol: true,
          },
        },
      },
    });

    // Auditoría
    try {
      await prisma.auditoriaLog.create({
        data: {
          usuario_id: session.userId,
          accion: 'CREAR_REUNION',
          entidad: 'ReunionProyecto',
          entidad_id: reunion.id,
          datos_nuevos: {
            titulo: reunion.titulo,
            tipo: reunion.tipo,
            proyecto: proyecto.codigo,
            fecha: reunion.fecha,
          },
        },
      });
    } catch (e) {
      console.error('Error al registrar auditoría de reunión:', e);
    }

    return NextResponse.json({
      success: true,
      message: 'Reunión registrada exitosamente',
      data: reunion,
    }, { status: 201 });
  } catch (error) {
    console.error('Error al registrar reunión:', error);
    return NextResponse.json({ success: false, message: 'Error interno del servidor' }, { status: 500 });
  }
}
