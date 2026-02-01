import { SongStatus } from '@prisma/client';

export class CreateSongDto {
  title: string;
  artist: string;
  bpm?: number;
  key?: string;
  isrc?: string;
  status?: SongStatus; // Allow admins to set initial status
}