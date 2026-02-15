import { IsString, IsOptional, IsInt, IsEnum, Min } from 'class-validator';
import { BlockType } from '@prisma/client';

export class CreateRehearsalBlockDto {
  @IsEnum(BlockType)
  type: BlockType;

  @IsString()
  label: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
