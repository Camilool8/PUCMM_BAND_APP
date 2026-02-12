import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.platformUser.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(email: string, password: string, name?: string, role?: string) {
    const existing = await this.prisma.platformUser.findUnique({
      where: { email },
    });
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.prisma.platformUser.create({
      data: {
        email,
        passwordHash,
        name,
        role: (role as any) || 'PLATFORM_VIEWER',
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  async updateRole(id: string, role: string) {
    const user = await this.prisma.platformUser.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.platformUser.update({
      where: { id },
      data: { role: role as any },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
  }

  async remove(id: string) {
    const user = await this.prisma.platformUser.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.platformUser.delete({ where: { id } });
    return { deleted: true };
  }
}
