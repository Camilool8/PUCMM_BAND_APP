import { PrismaClient, Role } from '@prisma/client';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

interface SeedOrganization {
  name: string;
  slug: string;
  domain?: string;
  description?: string;
  logoInitial?: string;
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
  allowedEmailDomains: string[];
  metaTitle?: string;
  metaDescription?: string;
  locale?: string;
}

interface SeedAuthProvider {
  enabled: boolean;
  isPrimary: boolean;
  displayName: string;
  config?: Record<string, string | number | boolean>;
}

interface SeedSection {
  key: string;
  title: string;
  subtitle?: string;
  iconName?: string;
  gradientFrom?: string;
  gradientVia?: string;
  gradientTo?: string;
  iconGradientFrom?: string;
  iconGradientTo?: string;
}

interface SeedLocation {
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  radiusMeters?: number;
}

interface SeedData {
  superadminEmail: string;
  organization: SeedOrganization;
  authProviders: {
    azureAd: SeedAuthProvider;
    google: SeedAuthProvider;
    emailPassword: SeedAuthProvider;
  };
  repertoireSections: SeedSection[];
  locations?: SeedLocation[];
}

function loadSeedData(): SeedData {
  const orgSlug = process.env.SEED_ORG || 'pucmm-band';
  const seedPath = join(__dirname, 'seeds', `${orgSlug}.json`);

  if (!existsSync(seedPath)) {
    console.error(`Seed file not found: ${seedPath}`);
    console.error(
      `Available seeds: check api/prisma/seeds/ directory. Use SEED_ORG=<slug> to select one.`,
    );
    process.exit(1);
  }

  const raw = readFileSync(seedPath, 'utf-8');
  console.log(`Loading seed data from: ${orgSlug}.json`);
  return JSON.parse(raw) as SeedData;
}

async function main() {
  const seedData = loadSeedData();

  console.log('Seeding database...');

  // Upsert SUPERADMIN user
  const superadmin = await prisma.user.upsert({
    where: { email: seedData.superadminEmail },
    update: { role: Role.SUPERADMIN },
    create: {
      email: seedData.superadminEmail,
      name: 'Super Admin',
      role: Role.SUPERADMIN,
    },
  });

  console.log(
    `SUPERADMIN user created/updated: ${superadmin.email} (${superadmin.role})`,
  );

  // Seed repertoire sections
  for (const section of seedData.repertoireSections) {
    await prisma.repertoireSection.upsert({
      where: { key: section.key },
      update: {},
      create: section,
    });
  }

  console.log('Default repertoire sections created/verified');

  // Seed organization
  const orgData = seedData.organization;
  const org = await prisma.organization.upsert({
    where: { slug: orgData.slug },
    update: {},
    create: {
      ...orgData,
      superadminEmail: seedData.superadminEmail,
    },
  });

  console.log(`Organization created/verified: ${org.name} (${org.slug})`);

  // Seed Azure AD auth provider (always, if enabled)
  const azureAd = seedData.authProviders.azureAd;
  if (azureAd.enabled) {
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
        isPrimary: azureAd.isPrimary,
        displayName: azureAd.displayName,
        config: {
          tenantId: process.env.AZURE_AD_TENANT_ID || '',
          clientId: process.env.AZURE_AD_CLIENT_ID || '',
        },
      },
    });
    console.log('Azure AD auth provider seeded');
  }

  // Seed Google auth provider (only if enabled AND env vars present)
  const google = seedData.authProviders.google;
  if (google.enabled && process.env.GOOGLE_CLIENT_ID) {
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
        isPrimary: google.isPrimary,
        displayName: google.displayName,
        config: {
          clientId: process.env.GOOGLE_CLIENT_ID || '',
          clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        },
      },
    });
    console.log('Google auth provider seeded');
  }

  // Seed email/password auth provider (only if enabled AND env var set)
  const emailPassword = seedData.authProviders.emailPassword;
  if (
    emailPassword.enabled ||
    process.env.ENABLE_EMAIL_PASSWORD_AUTH === 'true'
  ) {
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
        isPrimary: emailPassword.isPrimary,
        displayName: emailPassword.displayName,
        config: emailPassword.config || { requireEmailVerification: false },
      },
    });
    console.log('Email/password auth provider seeded');
  }

  // Seed locations (if provided)
  if (seedData.locations && seedData.locations.length > 0) {
    for (const location of seedData.locations) {
      const existing = await prisma.location.findFirst({
        where: { name: location.name },
      });
      if (!existing) {
        await prisma.location.create({
          data: {
            name: location.name,
            address: location.address || null,
            latitude: location.latitude,
            longitude: location.longitude,
            radiusMeters: location.radiusMeters || 200,
          },
        });
      }
    }
    console.log(`${seedData.locations.length} location(s) seeded`);
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
