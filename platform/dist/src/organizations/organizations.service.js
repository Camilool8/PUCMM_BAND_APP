"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let OrganizationsService = class OrganizationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.orgRegistry.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const org = await this.prisma.orgRegistry.findUnique({ where: { id } });
        if (!org)
            throw new common_1.NotFoundException('Organization not found');
        return org;
    }
    async create(dto) {
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
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.orgRegistry.update({
            where: { id },
            data: dto,
        });
    }
    async updateStatus(id, dto) {
        await this.findOne(id);
        return this.prisma.orgRegistry.update({
            where: { id },
            data: { status: dto.status },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.orgRegistry.delete({ where: { id } });
    }
    async healthCheck(id) {
        const org = await this.findOne(id);
        if (!org.apiUrl) {
            return { healthy: false, error: 'No API URL configured' };
        }
        try {
            const response = await fetch(`${org.apiUrl}/organizations/config`, { signal: AbortSignal.timeout(10000) });
            const healthy = response.ok;
            await this.prisma.orgRegistry.update({
                where: { id },
                data: {
                    isHealthy: healthy,
                    lastHealthCheck: new Date(),
                },
            });
            return { healthy, statusCode: response.status };
        }
        catch (error) {
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
        const results = await Promise.allSettled(orgs.map(async (org) => ({
            id: org.id,
            slug: org.slug,
            ...(await this.healthCheck(org.id)),
        })));
        return results.map((r) => r.status === 'fulfilled' ? r.value : { error: 'Check failed' });
    }
};
exports.OrganizationsService = OrganizationsService;
exports.OrganizationsService = OrganizationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrganizationsService);
//# sourceMappingURL=organizations.service.js.map