import {
  IsString,
  IsOptional,
  IsArray,
  IsUUID,
  IsDateString,
} from 'class-validator';

export class CreateRehearsalDto {
  @IsDateString()
  date: string;

  @IsUUID('4')
  locationId: string;

  @IsOptional()
  @IsUUID('4')
  eventId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  songIds?: string[];
}
