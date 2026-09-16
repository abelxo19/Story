import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import type { JwtPayload } from './auth.types.js';
import type { LoginDto } from './dto/login.dto.js';
import type { SignupDto } from './dto/signup.dto.js';

const PUBLIC_USER = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
} as const;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('An account with that email already exists');
    }

    const user = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email: dto.email.toLowerCase(),
        passwordHash: await bcrypt.hash(dto.password, 10),
      },
      select: PUBLIC_USER,
    });

    return { user, token: await this.signToken(user) };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const publicUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    };

    return { user: publicUser, token: await this.signToken(user) };
  }

  async updateProfile(userId: string, name?: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: name ? { name: name.trim() } : {},
      select: PUBLIC_USER,
    });
  }

  toPublic(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  private signToken(user: { id: string; email: string; role: User['role'] }) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.signAsync(payload);
  }
}
