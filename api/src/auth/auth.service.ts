import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    @Inject(forwardRef(() => OrganizationsService))
    private orgService: OrganizationsService,
  ) {}

  issueToken(user: { id: string; email: string; role: Role }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      expiresIn: 7 * 24 * 60 * 60,
    };
  }

  async register(email: string, password: string, name?: string) {
    const normalizedEmail = email.toLowerCase().trim();

    // Validate email domain
    await this.validateEmailDomain(normalizedEmail);

    // Check if user already exists
    const existing = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      throw new ConflictException('Ya existe una cuenta con este correo');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Check if this is the superadmin
    const superadminEmail = await this.orgService.getSuperadminEmail();
    const isSuperAdmin =
      normalizedEmail === superadminEmail.toLowerCase();

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name || null,
        passwordHash,
        authProvider: 'email_password',
        emailVerified: false,
        role: isSuperAdmin ? Role.SUPERADMIN : Role.STUDENT_GUEST,
      },
    });

    const token = this.issueToken(user);
    return { ...token, user };
  }

  async loginWithPassword(email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException(
        'Esta cuenta no tiene contraseña configurada. Inicia sesión con tu proveedor original.',
      );
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const token = this.issueToken(user);
    return { ...token, user };
  }

  async handleGoogleCallback(profile: {
    googleId: string;
    email: string;
    name: string;
    avatarUrl: string | null;
  }) {
    const normalizedEmail = profile.email.toLowerCase().trim();

    // Validate email domain
    await this.validateEmailDomain(normalizedEmail);

    // Check if this is the superadmin
    const superadminEmail = await this.orgService.getSuperadminEmail();
    const isSuperAdmin =
      normalizedEmail === superadminEmail.toLowerCase();

    // Upsert user by email (link accounts if email matches)
    const user = await this.prisma.user.upsert({
      where: { email: normalizedEmail },
      update: {
        googleId: profile.googleId,
        name: profile.name || undefined,
        avatarUrl: profile.avatarUrl || undefined,
        emailVerified: true,
      },
      create: {
        email: normalizedEmail,
        name: profile.name || null,
        googleId: profile.googleId,
        avatarUrl: profile.avatarUrl,
        authProvider: 'google',
        emailVerified: true,
        role: isSuperAdmin ? Role.SUPERADMIN : Role.STUDENT_GUEST,
      },
    });

    const token = this.issueToken(user);
    return { ...token, user };
  }

  async exchangeAzureToken(azureUser: {
    dbUser: { id: string; email: string; role: Role };
  }) {
    return this.issueToken(azureUser.dbUser);
  }

  private async validateEmailDomain(email: string) {
    const allowedDomains = await this.orgService.getAllowedDomains();

    // If no domains are configured, allow all
    if (allowedDomains.length === 0) return;

    const isAllowed = allowedDomains.some((domain) =>
      email.endsWith(`@${domain.toLowerCase()}`),
    );

    if (!isAllowed) {
      throw new BadRequestException(
        `Solo se permiten correos de: ${allowedDomains.join(', ')}`,
      );
    }
  }
}
