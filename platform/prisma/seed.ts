import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = process.env.PLATFORM_ADMIN_PASSWORD || 'admin123';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  // Seed platform admin user
  const admin = await prisma.platformUser.upsert({
    where: { email: 'admin@cjoga.cloud' },
    update: {},
    create: {
      email: 'admin@cjoga.cloud',
      name: 'Platform Admin',
      passwordHash,
      role: 'PLATFORM_ADMIN',
    },
  });
  console.log(`Platform admin: ${admin.email} (${admin.role})`);

  // Seed PUCMM org registry entry
  const pucmmOrg = await prisma.orgRegistry.upsert({
    where: { slug: 'pucmm-band' },
    update: {},
    create: {
      name: 'Banda Universitaria PUCMM',
      slug: 'pucmm-band',
      apiUrl: 'https://pucmm-band-api.cjoga.cloud',
      frontendUrl: 'https://pucmm-band.cjoga.cloud',
      status: 'ACTIVE',
      adminEmail: 'jcjg0001@ce.pucmm.edu.do',
      adminName: 'Carlos Joga',
      allowedEmailDomains: ['ce.pucmm.edu.do'],
      authProviders: ['azure_ad'],
      colorPrimary: '#0033A0',
    },
  });
  console.log(`Org registered: ${pucmmOrg.name} (${pucmmOrg.slug})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
