import { IsNumber } from 'class-validator';

export class CheckInDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}
