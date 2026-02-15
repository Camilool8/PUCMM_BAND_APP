import { IsUUID } from 'class-validator';

export class AddSongToRehearsalDto {
  @IsUUID('4')
  songId: string;
}
