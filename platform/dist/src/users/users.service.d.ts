import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        email: string;
        name: string | null;
        role: import(".prisma/client").$Enums.PlatformRole;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    create(email: string, password: string, name?: string, role?: string): Promise<{
        id: string;
        email: string;
        name: string | null;
        role: import(".prisma/client").$Enums.PlatformRole;
    }>;
    updateRole(id: string, role: string): Promise<{
        id: string;
        email: string;
        name: string | null;
        role: import(".prisma/client").$Enums.PlatformRole;
    }>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
