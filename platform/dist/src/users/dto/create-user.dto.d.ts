declare enum PlatformRole {
    PLATFORM_ADMIN = "PLATFORM_ADMIN",
    PLATFORM_VIEWER = "PLATFORM_VIEWER"
}
export declare class CreateUserDto {
    email: string;
    password: string;
    name?: string;
    role?: PlatformRole;
}
export declare class UpdateRoleDto {
    role: PlatformRole;
}
export {};
