import {
  IsString,
  IsOptional,
  IsArray,
  IsUUID,
  IsDateString,
} from 'class-validator';

export class CreateConcertDto {
  @IsDateString()
  date: string;

  @IsUUID('4')
  eventId: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  // Optional: Initialize with songs from event or custom selection
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  songIds?: string[];
}
