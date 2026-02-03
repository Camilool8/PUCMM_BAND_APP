import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

// Hardcoded SUPERADMIN email
const SUPERADMIN_EMAIL = 'jcjg0001@ce.pucmm.edu.do';

async function main() {
  console.log('Seeding database...');

  // Upsert SUPERADMIN user
  const superadmin = await prisma.user.upsert({
    where: { email: SUPERADMIN_EMAIL },
    update: { role: Role.SUPERADMIN },
    create: {
      email: SUPERADMIN_EMAIL,
      name: 'Super Admin',
      role: Role.SUPERADMIN,
    },
  });

  console.log(`SUPERADMIN user created/updated: ${superadmin.email} (${superadmin.role})`);

  // Seed default repertoire sections
  const defaultSections = [
    {
      key: 'repertorio',
      title: 'Repertorio Activo',
      subtitle: 'Canciones listas y en ensayo',
      iconName: 'Library',
      gradientFrom: 'brand-blue-primary/40',
      gradientVia: 'indigo-600/20',
      gradientTo: 'transparent',
      iconGradientFrom: 'brand-blue-primary',
      iconGradientTo: 'indigo-600',
    },
    {
      key: 'sugerencias',
      title: 'Sugerencias Pendientes',
      subtitle: 'Canciones esperando aprobación',
      iconName: 'Clock',
      gradientFrom: 'amber-500/30',
      gradientVia: 'orange-600/10',
      gradientTo: 'transparent',
      iconGradientFrom: 'amber-500',
      iconGradientTo: 'orange-600',
    },
    {
      key: 'archivadas',
      title: 'Archivo',
      subtitle: 'Canciones que ya no tocamos',
      iconName: 'Archive',
      gradientFrom: 'gray-600/30',
      gradientVia: 'gray-700/10',
      gradientTo: 'transparent',
      iconGradientFrom: 'gray-500',
      iconGradientTo: 'gray-700',
    },
    {
      key: 'eventos',
      title: 'Eventos',
      subtitle: 'Gestiona los eventos y conciertos de la banda',
      iconName: 'Calendar',
      gradientFrom: 'brand-blue-primary/40',
      gradientVia: 'indigo-600/20',
      gradientTo: 'transparent',
      iconGradientFrom: 'brand-blue-primary',
      iconGradientTo: 'indigo-600',
    },
    {
      key: 'conciertos',
      title: 'Conciertos',
      subtitle: 'Historial de presentaciones y próximos conciertos',
      iconName: 'Users',
      gradientFrom: 'purple-600/40',
      gradientVia: 'pink-500/20',
      gradientTo: 'transparent',
      iconGradientFrom: 'purple-600',
      iconGradientTo: 'pink-500',
    },
  ];

  for (const section of defaultSections) {
    await prisma.repertoireSection.upsert({
      where: { key: section.key },
      update: {},
      create: section,
    });
  }

  console.log('Default repertoire sections created/verified');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
