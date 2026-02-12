import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Organization } from '@prisma/client';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

export interface PublicOrgConfig {
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  logoInitial: string | null;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  allowedEmailDomains: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  locale: string;
  authProviders: {
    provider: string;
    displayName: string | null;
    isPrimary: boolean;
    tenantId?: string;
    clientId?: string;
  }[];
}

@Injectable()
export class OrganizationsService {
  private cachedOrg: Organization | null = null;

  constructor(private prisma: PrismaService) {}

  async getPublicConfig(): Promise<PublicOrgConfig> {
    const org = await this.getOrganization();
    const providers = await this.prisma.authProvider.findMany({
      where: { organizationId: org.id, enabled: true },
      orderBy: { isPrimary: 'desc' },
    });

    return {
      name: org.name,
      slug: org.slug,
      description: org.description,
      logoUrl: org.logoUrl,
      logoInitial: org.logoInitial,
      colors: {
        primary: org.colorPrimary,
        secondary: org.colorSecondary,
        accent: org.colorAccent,
      },
      allowedEmailDomains: org.allowedEmailDomains,
      metaTitle: org.metaTitle,
      metaDescription: org.metaDescription,
      locale: org.locale,
      authProviders: providers.map((p) => ({
        provider: p.provider,
        displayName: p.displayName,
        isPrimary: p.isPrimary,
        // Expose only public-safe config (client IDs, not secrets)
        ...(p.provider === 'azure_ad'
          ? {
              tenantId: (p.config as Record<string, string>).tenantId,
              clientId: (p.config as Record<string, string>).clientId,
            }
          : {}),
        ...(p.provider === 'google'
          ? {
              clientId: (p.config as Record<string, string>).clientId,
            }
          : {}),
      })),
    };
  }

  async getAllowedDomains(): Promise<string[]> {
    const org = await this.getOrganization();
    return org.allowedEmailDomains;
  }

  async getSuperadminEmail(): Promise<string> {
    const org = await this.getOrganization();
    return org.superadminEmail;
  }

  async updateOrganization(data: UpdateOrganizationDto) {
    const org = await this.getOrganization();
    this.cachedOrg = null;
    return this.prisma.organization.update({
      where: { id: org.id },
      data,
    });
  }

  private async getOrganization(): Promise<Organization> {
    if (!this.cachedOrg) {
      const org = await this.prisma.organization.findFirst();
      if (!org) {
        throw new Error(
          'No organization configured. Run prisma db seed to initialize.',
        );
      }
      this.cachedOrg = org;
    }
    return this.cachedOrg;
  }
}
