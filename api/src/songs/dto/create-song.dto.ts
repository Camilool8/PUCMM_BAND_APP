import { SongStatus } from '@prisma/client';
import { IsString, IsOptional, IsNumber, IsUrl, IsDateString, IsEnum } from 'class-validator';

export class CreateSongDto {
  @IsString()
  title: string;

  @IsString()
  artist: string;

  @IsOptional()
  @IsNumber()
  bpm?: number;

  @IsOptional()
  @IsString()
  key?: string;

  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @IsString()
  isrc?: string;

  @IsOptional()
  @IsUrl()
  coverUrl?: string;

  @IsOptional()
  @IsNumber()
  durationMs?: number;

  @IsOptional()
  @IsDateString()
  releaseDate?: string;

  @IsOptional()
  @IsEnum(SongStatus)
  status?: SongStatus; // Allow admins to set initial status

  @IsOptional()
  @IsUrl()
  spotifyUrl?: string;

  @IsOptional()
  @IsUrl()
  youtubeUrl?: string;

  @IsOptional()
  @IsUrl()
  appleMusicUrl?: string;
}