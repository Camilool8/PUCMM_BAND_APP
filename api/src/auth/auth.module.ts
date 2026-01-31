import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AzureADStrategy } from './azure-ad.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'azure-ad' })],
  providers: [AuthService, AzureADStrategy],
  exports: [AuthService],
})
export class AuthModule {}