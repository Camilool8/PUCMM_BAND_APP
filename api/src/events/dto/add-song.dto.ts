import { IsUUID } from 'class-validator';

export class AddSongDto {
  @IsUUID('4')
  songId: string;
}
