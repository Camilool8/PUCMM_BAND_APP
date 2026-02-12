"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    const adminPassword = process.env.PLATFORM_ADMIN_PASSWORD || 'admin123';
    const passwordHash = await bcrypt.hash(adminPassword, 12);
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
//# sourceMappingURL=seed.js.map