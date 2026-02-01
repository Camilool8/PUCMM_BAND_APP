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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
