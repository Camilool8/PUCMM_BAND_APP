import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrgDto } from './dto/create-org.dto';
import { UpdateOrgDto, UpdateOrgStatusDto } from './dto/update-org.dto';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.orgRegistry.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const org = await this.prisma.orgRegistry.findUnique({ where: { id } });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async create(dto: CreateOrgDto) {
    return this.prisma.orgRegistry.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        apiUrl: dto.apiUrl,
        frontendUrl: dto.frontendUrl,
        adminEmail: dto.adminEmail,
        adminName: dto.adminName,
        allowedEmailDomains: dto.allowedEmailDomains || [],
        authProviders: dto.authProviders || [],
        colorPrimary: dto.colorPrimary || '#0033A0',
        logoUrl: dto.logoUrl,
        notes: dto.notes,
      },
    });
  }

  async update(id: string, dto: UpdateOrgDto) {
    await this.findOne(id);
    return this.prisma.orgRegistry.update({
      where: { id },
      data: dto,
    });
  }

  async updateStatus(id: string, dto: UpdateOrgStatusDto) {
    await this.findOne(id);
    return this.prisma.orgRegistry.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.orgRegistry.delete({ where: { id } });
  }

  async healthCheck(id: string) {
    const org = await this.findOne(id);
    if (!org.apiUrl) {
      return { healthy: false, error: 'No API URL configured' };
    }

    try {
      const response = await fetch(
        `${org.apiUrl}/organizations/config`,
        { signal: AbortSignal.timeout(10000) },
      );
      const healthy = response.ok;

      await this.prisma.orgRegistry.update({
        where: { id },
        data: {
          isHealthy: healthy,
          lastHealthCheck: new Date(),
        },
      });

      return { healthy, statusCode: response.status };
    } catch (error) {
      await this.prisma.orgRegistry.update({
        where: { id },
        data: {
          isHealthy: false,
          lastHealthCheck: new Date(),
        },
      });

      return {
        healthy: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  async healthCheckAll() {
    const orgs = await this.prisma.orgRegistry.findMany({
      where: { status: 'ACTIVE' },
    });

    const results = await Promise.allSettled(
      orgs.map(async (org) => ({
        id: org.id,
        slug: org.slug,
        ...(await this.healthCheck(org.id)),
      })),
    );

    return results.map((r) =>
      r.status === 'fulfilled' ? r.value : { error: 'Check failed' },
    );
  }
}
