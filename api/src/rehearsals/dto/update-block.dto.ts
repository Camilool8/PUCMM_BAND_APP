import { IsString, IsOptional, IsInt, IsEnum, Min } from 'class-validator';
import { BlockType } from '@prisma/client';

export class UpdateRehearsalBlockDto {
  @IsOptional()
  @IsEnum(BlockType)
  type?: BlockType;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
