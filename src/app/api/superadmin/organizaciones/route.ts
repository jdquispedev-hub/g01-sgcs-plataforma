import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession, hashPassword } from '@/lib/auth';
import { RubroIndustria } from '@prisma/client';

// Esquema de validación para nueva organización cliente (RNF-05)
const crearOrganizacionSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(150),
  rubro: z.nativeEnum(RubroIndustria),
  adminNombre: z.string().min(3, 'El nombre del administrador es obligatorio').max(150),
  adminEmail: z.string().email('Debe ingresar un correo electrónico válido'),
  adminPassword: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

// Plantillas de terminología por industria (Arquitectura Multi-Rubro SGCS)
const PLANTILLAS_TERMINOLOGIA: Record<RubroIndustria, any> = {
  SOFTWARE: {
    terminos: {
      proyecto: 'Sistema / Sprint',
      ecs: 'Componente / Módulo',
      version: 'Release / Tag Git',
      linea_base: 'Línea Base de Código',
      solicitud_cambio: 'RFC / Ticket de Cambio',
      reporte_diario: 'Daily Standup',
    },
    campos_reporte: [
      { clave: 'commits', etiqueta: 'Cantidad de Commits', tipo: 'numero' },
      { clave: 'endpoints_listos', etiqueta: 'Endpoints completados', tipo: 'texto' },
    ],
  },
  VETERINARIA: {
    terminos: {
      proyecto: 'Caso Clínico / Paciente',
      ecs: 'Ficha / Examen Médico',
      version: 'Resultado / Dosis Actualizada',
      linea_base: 'Estado Pre-Operatorio Aprobado',
      solicitud_cambio: 'Modificación de Tratamiento',
      reporte_diario: 'Evolución Médica del Turno',
    },
    campos_reporte: [
      { clave: 'temperatura', etiqueta: 'Temperatura (°C)', tipo: 'numero' },
      { clave: 'dosis_suministrada', etiqueta: 'Dosis y Medicación', tipo: 'texto' },
    ],
  },
  CONSTRUCCION: {
    terminos: {
      proyecto: 'Obra / Proyecto',
      ecs: 'Plano / Partida de Obra',
      version: 'Revisión de Plano (Rev A, B)',
      linea_base: 'Línea Base Contractual',
      solicitud_cambio: 'Orden de Modificación de Obra',
      reporte_diario: 'Parte Diario de Faena',
    },
    campos_reporte: [
      { clave: 'm2_avanzados', etiqueta: 'Metros Cuadrados Avanzados', tipo: 'numero' },
      { clave: 'sacos_cemento', etiqueta: 'Sacos de Cemento Consumidos', tipo: 'numero' },
    ],
  },
  OTRO: {
    terminos: {
      proyecto: 'Proyecto',
      ecs: 'Elemento de Configuración',
      version: 'Versión del Entregable',
      linea_base: 'Línea Base Aprobada',
      solicitud_cambio: 'Solicitud de Cambio',
      reporte_diario: 'Reporte de Jornada',
    },
    campos_reporte: [
      { clave: 'avance_porcentaje', etiqueta: 'Avance Estimado (%)', tipo: 'numero' },
    ],
  },
};

// GET: Lista de organizaciones con métricas globales en tiempo real (RNF-02, Nivel 0)
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.rol !== 'SUPERADMIN') {
      return NextResponse.json(
        { success: false, message: 'Acceso no autorizado. Requiere rol SUPERADMIN.' },
        { status: 403 }
      );
    }

    const [organizaciones, totalUsuarios, totalProyectos] = await Promise.all([
      prisma.organizacion.findMany({
        orderBy: { created_at: 'asc' },
        include: {
          _count: {
            select: {
              usuarios: true,
              proyectos: true,
            },
          },
          usuarios: {
            where: { rol: 'ADMINISTRADOR' },
            select: {
              id: true,
              nombre_completo: true,
              email: true,
              activo: true,
            },
            take: 1,
          },
        },
      }),
      prisma.usuario.count({ where: { activo: true } }),
      prisma.proyectoCaso.count(),
    ]);

    // Cálculo de métricas
    const totalOrganizaciones = organizaciones.length;
    const organizacionesActivas = organizaciones.filter((o) => o.activo).length;

    return NextResponse.json({
      success: true,
      data: {
        organizaciones,
        metricas: {
          totalOrganizaciones,
          organizacionesActivas,
          totalUsuarios,
          totalProyectos,
        },
      },
    });
  } catch (error) {
    console.error('Error en GET /api/superadmin/organizaciones:', error);
    return NextResponse.json(
      { success: false, message: 'Error al consultar organizaciones' },
      { status: 500 }
    );
  }
}

// POST: Registrar nueva empresa cliente con terminología adaptada y admin inicial (RF-01, RF-02)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.rol !== 'SUPERADMIN') {
      return NextResponse.json(
        { success: false, message: 'Acceso no autorizado. Requiere rol SUPERADMIN.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = crearOrganizacionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Datos de organización inválidos',
          errors: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const { nombre, rubro, adminNombre, adminEmail, adminPassword } = validation.data;

    // Verificar unicidad global del correo del administrador
    const emailExistente = await prisma.usuario.findFirst({
      where: { email: adminEmail.trim().toLowerCase() },
    });

    if (emailExistente) {
      return NextResponse.json(
        { success: false, message: `El correo '${adminEmail}' ya está registrado en el sistema` },
        { status: 409 }
      );
    }

    // Hashear contraseña inicial con bcrypt salt 12 (RNF-01)
    const passwordHash = await hashPassword(adminPassword);
    const terminologiaConfig = PLANTILLAS_TERMINOLOGIA[rubro] || PLANTILLAS_TERMINOLOGIA.OTRO;

    // Transacción ACID: Crear Organización + Usuario Administrador + Auditoría Inmutable
    const resultado = await prisma.$transaction(async (tx) => {
      const nuevaOrg = await tx.organizacion.create({
        data: {
          nombre: nombre.trim(),
          rubro,
          configuracion_terminologia: terminologiaConfig,
          activo: true,
        },
      });

      const nuevoAdmin = await tx.usuario.create({
        data: {
          organizacion_id: nuevaOrg.id,
          nombre_completo: adminNombre.trim(),
          email: adminEmail.trim().toLowerCase(),
          password_hash: passwordHash,
          rol: 'ADMINISTRADOR',
          activo: true,
        },
      });

      // Registro de auditoría (RNF-10)
      await tx.auditoriaLog.create({
        data: {
          usuario_id: session.userId,
          accion: 'CREACION_ORGANIZACION',
          entidad: 'ORGANIZACION',
          entidad_id: nuevaOrg.id,
          datos_nuevos: {
            organizacion_id: nuevaOrg.id,
            nombre: nuevaOrg.nombre,
            rubro: nuevaOrg.rubro,
            admin_email: nuevoAdmin.email,
          },
        },
      });

      return {
        organizacion: nuevaOrg,
        admin: {
          id: nuevoAdmin.id,
          nombre_completo: nuevoAdmin.nombre_completo,
          email: nuevoAdmin.email,
          rol: nuevoAdmin.rol,
        },
      };
    });

    return NextResponse.json(
      {
        success: true,
        message: `Organización '${nombre}' y su cuenta administradora creadas exitosamente`,
        data: resultado,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error en POST /api/superadmin/organizaciones:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error interno al registrar la organización' },
      { status: 500 }
    );
  }
}
