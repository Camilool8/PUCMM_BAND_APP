import { IsString, IsOptional, IsNumber, IsInt, Min, Max } from 'class-validator';

export class CreateLocationDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsInt()
  @Min(50)
  @Max(1000)
  radiusMeters?: number;
}
