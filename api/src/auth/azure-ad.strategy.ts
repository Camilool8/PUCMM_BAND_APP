import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { BearerStrategy } from 'passport-azure-ad';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AzureADStrategy extends PassportStrategy(BearerStrategy, 'azure-ad') {
  constructor(configService: ConfigService) {
    super({
      identityMetadata: `https://login.microsoftonline.com/${configService.get('AZURE_AD_TENANT_NAME')}/v2.0/.well-known/openid-configuration`,
      clientID: configService.get('AZURE_AD_CLIENT_ID'),
      audience: configService.get('AZURE_AD_CLIENT_ID'), // usually the same for web APIs
      loggingLevel: 'info',
      passReqToCallback: false,
    });
  }

  async validate(payload: any) {
    // Validate email domain restriction
    const email = payload.preferred_username || payload.upn;
    if (!email?.endsWith('@ce.pucmm.edu.do')) {
        throw new Error('Unauthorized domain');
    }
    return payload;
  }
}
