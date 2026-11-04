import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { RolUsuario } from '@prisma/client';

export const dynamic = 'force-dynamic';

const crearUsuarioSchema = z.object({
  nombre_completo: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(150),
  email: z.string().email('Correo electrónico inválido'),
  rol: z.enum(['ADMINISTRADOR', 'APROBADOR', 'SOLICITANTE']),
  cargo: z.string().max(100).optional().nullable(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

// -------------------------------------------------------------
// GET: Listar Colaboradores del Tenant (RF-02, RNF-02)
// -------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const usuarios = await prisma.usuario.findMany({
      where: {
        organizacion_id: session.organizacionId,
      },
      select: {
        id: true,
        nombre_completo: true,
        email: true,
        rol: true,
        cargo: true,
        activo: true,
        created_at: true,
        _count: {
          select: {
            ecs_responsable: true,
            versiones_autor: true,
            reportes_diarios: true,
          },
        },
      },
      orderBy: { nombre_completo: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: usuarios,
    });
  } catch (error: any) {
    console.error('Error al listar usuarios:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno al consultar usuarios' },
      { status: 500 }
    );
  }
}

// -------------------------------------------------------------
// POST: Registrar Nuevo Colaborador (RF-02, RNF-01, RNF-02)
// -------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    // RNF-02: Solo ADMINISTRADOR o SUPERADMIN pueden dar de alta usuarios
    const rolesAdmin: RolUsuario[] = [RolUsuario.SUPERADMIN, RolUsuario.ADMINISTRADOR];
    if (!rolesAdmin.includes(session.rol as RolUsuario)) {
      return NextResponse.json(
        { success: false, message: 'Acceso denegado: Se requiere rol de Administrador' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parseResult = crearUsuarioSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Datos de usuario inválidos',
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { nombre_completo, email, rol, cargo, password } = parseResult.data;
    const emailNormalizado = email.toLowerCase().trim();

    // Validar si el email ya existe en la organización
    const existente = await prisma.usuario.findFirst({
      where: {
        organizacion_id: session.organizacionId,
        email: emailNormalizado,
      },
    });

    if (existente) {
      return NextResponse.json(
        { success: false, message: 'Ya existe un usuario con este correo electrónico en la empresa' },
        { status: 400 }
      );
    }

    // RNF-01: Hash seguro con salt >= 12
    const passwordHash = await bcrypt.hash(password, 12);

    const nuevoUsuario = await prisma.$transaction(async (tx) => {
      const u = await tx.usuario.create({
        data: {
          organizacion_id: session.organizacionId,
          nombre_completo: nombre_completo.trim(),
          email: emailNormalizado,
          password_hash: passwordHash,
          rol: rol as RolUsuario,
          cargo: cargo?.trim() || null,
          activo: true,
        },
        select: {
          id: true,
          nombre_completo: true,
          email: true,
          rol: true,
          cargo: true,
          activo: true,
          created_at: true,
        },
      });

      await tx.auditoriaLog.create({
        data: {
          usuario_id: session.userId,
          accion: 'CREAR_USUARIO',
          entidad: 'USUARIO',
          entidad_id: u.id,
          datos_nuevos: {
            nombre: u.nombre_completo,
            email: u.email,
            rol: u.rol,
            cargo: u.cargo,
          },
        },
      });

      return u;
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Usuario registrado exitosamente',
        data: nuevoUsuario,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error al crear usuario:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno al registrar el usuario' },
      { status: 500 }
    );
  }
}
