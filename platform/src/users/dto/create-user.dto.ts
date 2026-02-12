import { IsEmail, IsString, IsOptional, IsEnum, MinLength } from 'class-validator';

enum PlatformRole {
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
  PLATFORM_VIEWER = 'PLATFORM_VIEWER',
}

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(PlatformRole)
  role?: PlatformRole;
}

export class UpdateRoleDto {
  @IsEnum(PlatformRole)
  role: PlatformRole;
}
