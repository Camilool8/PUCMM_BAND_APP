import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AzureADStrategy } from './azure-ad.strategy';
import { AzureAdGuard } from './azure-ad.guard';
import { RolesGuard } from './roles.guard';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'azure-ad' }),
    PrismaModule,
  ],
  providers: [AuthService, AzureADStrategy, AzureAdGuard, RolesGuard],
  exports: [AuthService, AzureAdGuard, RolesGuard],
})
export class AuthModule {}
