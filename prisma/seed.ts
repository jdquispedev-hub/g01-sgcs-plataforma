import { PrismaClient, RubroIndustria, RolUsuario } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando carga de datos semilla (Seed)...');

  // 1. Crear Organización Maestra (Para SuperAdmin)
  const orgMaestra = await prisma.organizacion.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      nombre: 'Administración Global SGCS',
      rubro: RubroIndustria.SOFTWARE,
      configuracion_terminologia: {
        terminos: {
          proyecto: 'Proyecto Global',
          ecs: 'Elemento de Configuración',
          linea_base: 'Línea Base',
          reporte_diario: 'Bitácora Diaria',
        },
      },
    },
  });

  // 2. Crear Usuario SuperAdmin
  const passwordHash = await bcrypt.hash('Admin123!', 12);
  const superAdmin = await prisma.usuario.upsert({
    where: {
      organizacion_id_email: {
        organizacion_id: orgMaestra.id,
        email: 'superadmin@sgcs.com',
      },
    },
    update: {},
    create: {
      organizacion_id: orgMaestra.id,
      nombre_completo: 'Super Administrador del Sistema',
      email: 'superadmin@sgcs.com',
      password_hash: passwordHash,
      rol: RolUsuario.SUPERADMIN,
      activo: true,
    },
  });
  console.log(`✅ SuperAdmin creado: ${superAdmin.email} (Password: Admin123!)`);

  // 3. Crear Organización Demo: Empresa de Software
  const orgSoftware = await prisma.organizacion.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      nombre: 'DevCraft Software Solutions',
      rubro: RubroIndustria.SOFTWARE,
      configuracion_terminologia: {
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
    },
  });

  // 4. Crear Organización Demo: Clínica Veterinaria
  const orgVet = await prisma.organizacion.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      nombre: 'Clínica Veterinaria San Francisco',
      rubro: RubroIndustria.VETERINARIA,
      configuracion_terminologia: {
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
    },
  });

  // 5. Crear Organización Demo: Empresa de Construcción
  const orgConst = await prisma.organizacion.upsert({
    where: { id: '00000000-0000-0000-0000-000000000004' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000004',
      nombre: 'Constructora & Proyectos Los Andes',
      rubro: RubroIndustria.CONSTRUCCION,
      configuracion_terminologia: {
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
    },
  });

  console.log('✅ Organizaciones y plantillas de industria sembradas exitosamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error en Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
