import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  MinLength,
} from 'class-validator';

export class CreateOrgDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(2)
  slug: string;

  @IsOptional()
  @IsString()
  apiUrl?: string;

  @IsOptional()
  @IsString()
  frontendUrl?: string;

  @IsEmail()
  adminEmail: string;

  @IsOptional()
  @IsString()
  adminName?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedEmailDomains?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  authProviders?: string[];

  @IsOptional()
  @IsString()
  colorPrimary?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
