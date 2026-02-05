import { IsArray, ValidateNested, IsUUID, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

class SetlistItemOrder {
  @IsUUID('4')
  id: string;

  @IsIn(['song', 'block'])
  itemType: 'song' | 'block';
}

export class ReorderConcertSetlistDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SetlistItemOrder)
  items: SetlistItemOrder[];
}
