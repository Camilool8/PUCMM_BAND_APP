import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AzureAdGuard } from './azure-ad.guard';

@Injectable()
export class UnifiedAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private azureAdGuard: AzureAdGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    // Try app JWT first (fast, local validation)
    try {
      const payload = this.jwtService.verify(token);
      if (payload.sub && payload.iss === 'band-app') {
        const user = await this.prisma.user.findUnique({
          where: { id: payload.sub },
        });
        if (user) {
          request.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            dbUser: user,
          };
          return true;
        }
      }
    } catch {
      // Not a valid app JWT — fall through to Azure AD
    }

    // Fall back to Azure AD (existing passport-azure-ad validation)
    return this.azureAdGuard.canActivate(context) as Promise<boolean>;
  }

  private extractToken(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
