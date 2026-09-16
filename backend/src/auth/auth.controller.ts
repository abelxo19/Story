import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import type { Response } from 'express';
import { AuthService } from './auth.service.js';
import { CurrentUser } from './current-user.decorator.js';
import { LoginDto } from './dto/login.dto.js';
import { SignupDto } from './dto/signup.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(
    @Body() dto: SignupDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { user, token } = await this.authService.signup(dto);
    response.cookie('access_token', token, COOKIE_OPTIONS);
    return { user };
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { user, token } = await this.authService.login(dto);
    response.cookie('access_token', token, COOKIE_OPTIONS);
    return { user };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token', { path: '/' });
    return { ok: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: User) {
    return { user: this.authService.toPublic(user) };
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @CurrentUser() user: User,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user.id, dto.name);
  }
}
