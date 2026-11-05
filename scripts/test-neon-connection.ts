import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const orgs = await prisma.organizacion.findMany({
    select: { id: true, nombre: true, rubro: true }
  });
  const usersCount = await prisma.usuario.count();
  const proyectosCount = await prisma.proyectoCaso.count();
  const ecsCount = await prisma.ecs.count();

  console.log('--- Resumen de Base de Datos en Neon () ---');
  console.log('Organizaciones registradas:', orgs);
  console.log(`Usuarios totales: ${usersCount}`);
  console.log(`Proyectos totales: ${proyectosCount}`);
  console.log(`Elementos de Configuración (ECS): ${ecsCount}`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
