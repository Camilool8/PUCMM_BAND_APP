import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateConcertDto } from './create-concert.dto';

// Exclude eventId from updates - concert cannot be moved to another event
export class UpdateConcertDto extends PartialType(
  OmitType(CreateConcertDto, ['eventId'] as const),
) {}
