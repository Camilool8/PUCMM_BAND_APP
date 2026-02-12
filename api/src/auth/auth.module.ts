import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AzureADStrategy } from './azure-ad.strategy';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './google.strategy';
import { AzureAdGuard } from './azure-ad.guard';
import { UnifiedAuthGuard } from './unified-auth.guard';
import { RolesGuard } from './roles.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { OrganizationsModule } from '../organizations/organizations.module';

// Conditionally include GoogleStrategy only if credentials are configured
const conditionalProviders: any[] = [];
if (process.env.GOOGLE_CLIENT_ID) {
  conditionalProviders.push(GoogleStrategy);
}

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'azure-ad' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET') || 'dev-secret-change-me',
        signOptions: { expiresIn: '7d', issuer: 'band-app' },
      }),
    }),
    PrismaModule,
    forwardRef(() => OrganizationsModule),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AzureADStrategy,
    JwtStrategy,
    AzureAdGuard,
    UnifiedAuthGuard,
    RolesGuard,
    ...conditionalProviders,
  ],
  exports: [AuthService, AzureAdGuard, UnifiedAuthGuard, RolesGuard, JwtModule],
})
export class AuthModule {}
