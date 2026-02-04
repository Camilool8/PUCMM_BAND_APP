import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { BearerStrategy } from 'passport-azure-ad';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

// Hardcoded SUPERADMIN email
const SUPERADMIN_EMAIL = 'jcjg0001@ce.pucmm.edu.do';

@Injectable()
export class AzureADStrategy extends PassportStrategy(BearerStrategy, 'azure-ad') {
  constructor(
    configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const tenantId = configService.get('AZURE_AD_TENANT_ID') || 'common';
    const clientId = configService.get('AZURE_AD_CLIENT_ID');
    super({
      identityMetadata: `https://login.microsoftonline.com/${tenantId}/v2.0/.well-known/openid-configuration`,
      clientID: clientId,
      audience: [clientId, `api://${clientId}`],
      validateIssuer: false,
      allowMultiAudiencesInToken: true,
      loggingLevel: 'info',
      passReqToCallback: false,
    });
  }

  async validate(payload: any) {
    const email = payload.preferred_username || payload.upn;

    // Validate email domain restriction (case-insensitive)
    if (!email?.toLowerCase().endsWith('@ce.pucmm.edu.do')) {
      throw new Error('Unauthorized domain');
    }

    const normalizedEmail = email.toLowerCase();
    const isSuperAdmin = normalizedEmail === SUPERADMIN_EMAIL;

    // Upsert user in database
    const user = await this.prisma.user.upsert({
      where: { email: normalizedEmail },
      update: {
        name: payload.name,
        jobTitle: payload.jobTitle,
        department: payload.department,
      },
      create: {
        email: normalizedEmail,
        name: payload.name,
        role: isSuperAdmin ? Role.SUPERADMIN : Role.STUDENT_GUEST,
        jobTitle: payload.jobTitle,
        department: payload.department,
      },
    });

    // Return user with database info (includes role)
    return {
      ...payload,
      id: user.id,
      email: user.email,
      role: user.role,
      dbUser: user,
    };
  }
}
