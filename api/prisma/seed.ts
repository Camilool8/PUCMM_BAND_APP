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

  // Seed default organization
  const org = await prisma.organization.upsert({
    where: { slug: 'pucmm-band' },
    update: {},
    create: {
      name: 'Banda Universitaria PUCMM',
      slug: 'pucmm-band',
      domain: 'pucmm-band.cjoga.cloud',
      description:
        'Sistema de Gestión de Repertorio para la Banda Universitaria PUCMM',
      logoInitial: 'P',
      colorPrimary: '#0033A0',
      colorSecondary: '#FFD200',
      colorAccent: '#D22630',
      allowedEmailDomains: ['ce.pucmm.edu.do'],
      superadminEmail: SUPERADMIN_EMAIL,
      metaTitle: 'PUCMM Band App',
      metaDescription:
        'Sistema de Gestión de Repertorio para la Banda Universitaria PUCMM',
      locale: 'es',
    },
  });

  // Seed Azure AD auth provider
  await prisma.authProvider.upsert({
    where: {
      organizationId_provider: {
        organizationId: org.id,
        provider: 'azure_ad',
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      provider: 'azure_ad',
      enabled: true,
      isPrimary: true,
      displayName: 'Correo Estudiantil PUCMM',
      config: {
        tenantId: process.env.AZURE_AD_TENANT_ID || '',
        clientId: process.env.AZURE_AD_CLIENT_ID || '',
      },
    },
  });

  console.log(`Organization created/verified: ${org.name} (${org.slug})`);

  // Optionally seed Google auth provider (if GOOGLE_CLIENT_ID is configured)
  if (process.env.GOOGLE_CLIENT_ID) {
    await prisma.authProvider.upsert({
      where: {
        organizationId_provider: {
          organizationId: org.id,
          provider: 'google',
        },
      },
      update: {},
      create: {
        organizationId: org.id,
        provider: 'google',
        enabled: true,
        isPrimary: false,
        displayName: 'Google',
        config: {
          clientId: process.env.GOOGLE_CLIENT_ID || '',
          clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        },
      },
    });
    console.log('Google auth provider seeded');
  }

  // Optionally seed email/password auth provider
  if (process.env.ENABLE_EMAIL_PASSWORD_AUTH === 'true') {
    await prisma.authProvider.upsert({
      where: {
        organizationId_provider: {
          organizationId: org.id,
          provider: 'email_password',
        },
      },
      update: {},
      create: {
        organizationId: org.id,
        provider: 'email_password',
        enabled: true,
        isPrimary: false,
        displayName: 'Correo y Contraseña',
        config: { requireEmailVerification: false },
      },
    });
    console.log('Email/password auth provider seeded');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
