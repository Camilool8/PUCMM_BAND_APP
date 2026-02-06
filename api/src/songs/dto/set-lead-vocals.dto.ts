import { IsArray, IsString } from 'class-validator';

export class SetLeadVocalsDto {
  @IsArray()
  @IsString({ each: true })
  userIds: string[];
}
