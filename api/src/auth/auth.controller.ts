import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { AzureAdGuard } from './azure-ad.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.loginWithPassword(dto.email, dto.password);
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password, dto.name);
  }

  // Google OAuth: redirect to Google login
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    // Passport redirects to Google — this method body is never reached
  }

  // Google OAuth: callback after successful Google login
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Request() req, @Res() res: Response) {
    const result = await this.authService.handleGoogleCallback(req.user);
    const frontendUrl =
      this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    res.redirect(
      `${frontendUrl}/auth/callback?token=${result.accessToken}&provider=google`,
    );
  }

  // Exchange Azure AD token for app JWT (optional convenience)
  @Post('exchange')
  @UseGuards(AzureAdGuard)
  async exchangeToken(@Request() req) {
    return this.authService.exchangeAzureToken(req.user);
  }
}
