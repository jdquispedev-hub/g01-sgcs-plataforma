import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const crearProyectoSchema = z.object({
  codigo: z.string().min(2, 'El código debe tener al menos 2 caracteres').max(50),
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(200),
  cliente_nombre: z.string().min(2, 'El nombre del cliente es obligatorio').max(150),
  descripcion: z.string().optional(),
});

// GET: Listar proyectos de la organización activa
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const proyectos = await prisma.proyectoCaso.findMany({
      where: { organizacion_id: session.organizacionId },
      orderBy: { created_at: 'desc' },
      include: {
        _count: {
          select: {
            elementos_config: true,
            lineas_base: true,
            reuniones: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: proyectos,
    });
  } catch (error) {
    console.error('Error al listar proyectos:', error);
    return NextResponse.json({ success: false, message: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST: Registrar nuevo proyecto / obra civil
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    if (!['SUPERADMIN', 'ADMINISTRADOR'].includes(session.rol)) {
      return NextResponse.json(
        { success: false, message: 'Solo administradores pueden crear proyectos' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = crearProyectoSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Datos de proyecto inválidos', errors: validation.error.format() },
        { status: 400 }
      );
    }

    const { codigo, nombre, cliente_nombre } = validation.data;
    const codigoUpper = codigo.trim().toUpperCase();

    // Validar código único por organización
    const existente = await prisma.proyectoCaso.findUnique({
      where: {
        organizacion_id_codigo: {
          organizacion_id: session.organizacionId,
          codigo: codigoUpper,
        },
      },
    });

    if (existente) {
      return NextResponse.json(
        { success: false, message: `Ya existe un proyecto con el código '${codigoUpper}' en su organización.` },
        { status: 409 }
      );
    }

    const nuevoProyecto = await prisma.proyectoCaso.create({
      data: {
        organizacion_id: session.organizacionId,
        codigo: codigoUpper,
        nombre: nombre.trim(),
        cliente_nombre: cliente_nombre.trim(),
        fecha_inicio: new Date(),
        estado: 'EN_EJECUCION',
      },
    });

    // Auditoría inmutable (RNF-10)
    await prisma.auditoriaLog.create({
      data: {
        usuario_id: session.userId,
        accion: 'CREAR_PROYECTO',
        entidad: 'PROYECTO',
        entidad_id: nuevoProyecto.id,
        datos_nuevos: {
          codigo: nuevoProyecto.codigo,
          nombre: nuevoProyecto.nombre,
          cliente: nuevoProyecto.cliente_nombre,
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Proyecto registrado exitosamente',
        data: nuevoProyecto,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error al crear proyecto:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error interno al registrar proyecto' },
      { status: 500 }
    );
  }
}
