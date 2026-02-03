import { IsArray, IsUUID } from 'class-validator';

export class ReorderSongsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  songIds: string[];
}
