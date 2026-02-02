import { IsOptional, IsString } from 'class-validator';

export class UpdateSectionDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  iconName?: string;

  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @IsOptional()
  @IsString()
  gradientFrom?: string;

  @IsOptional()
  @IsString()
  gradientVia?: string;

  @IsOptional()
  @IsString()
  gradientTo?: string;

  @IsOptional()
  @IsString()
  iconGradientFrom?: string;

  @IsOptional()
  @IsString()
  iconGradientTo?: string;
}
