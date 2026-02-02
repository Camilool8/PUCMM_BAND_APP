import { IsString, IsOptional, IsArray, IsUUID } from 'class-validator';

export class CreateEventDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  // Visual customization fields
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

  // Initial songs for the event's setlist
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  songIds?: string[];
}
