export class CreateSongDto {
  title: string;
  artist: string;
  bpm?: number;
  key?: string;
  isrc?: string;
}