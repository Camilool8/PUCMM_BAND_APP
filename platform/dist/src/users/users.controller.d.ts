import { UsersService } from './users.service';
import { CreateUserDto, UpdateRoleDto } from './dto/create-user.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<{
        id: string;
        email: string;
        name: string | null;
        role: import(".prisma/client").$Enums.PlatformRole;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    create(dto: CreateUserDto): Promise<{
        id: string;
        email: string;
        name: string | null;
        role: import(".prisma/client").$Enums.PlatformRole;
    }>;
    updateRole(id: string, dto: UpdateRoleDto): Promise<{
        id: string;
        email: string;
        name: string | null;
        role: import(".prisma/client").$Enums.PlatformRole;
    }>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
