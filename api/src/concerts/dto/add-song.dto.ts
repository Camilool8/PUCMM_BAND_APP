import { IsUUID } from 'class-validator';

export class AddSongToConcertDto {
  @IsUUID('4')
  songId: string;
}
