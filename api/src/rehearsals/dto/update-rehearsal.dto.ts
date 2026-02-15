import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateRehearsalDto } from './create-rehearsal.dto';

export class UpdateRehearsalDto extends PartialType(
  OmitType(CreateRehearsalDto, ['eventId'] as const),
) {}
