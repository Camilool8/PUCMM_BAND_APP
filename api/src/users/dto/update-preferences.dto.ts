import { IsOptional, IsString, IsBoolean, IsArray } from 'class-validator';

export class UpdatePreferencesDto {
  @IsOptional()
  @IsString()
  seenAppVersion?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  completedTours?: string[];

  @IsOptional()
  @IsBoolean()
  hasSeenWelcome?: boolean;
}
