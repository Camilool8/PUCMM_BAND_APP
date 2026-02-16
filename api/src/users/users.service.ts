import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findMembers() {
    return this.prisma.user.findMany({
      where: {
        role: { in: [Role.SUPERADMIN, Role.MEMBER] },
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        instruments: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: [
        { role: 'asc' },
        { name: 'asc' },
      ],
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        homeBackground: true,
        role: true,
        instruments: true,
        phone: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async updateRole(id: string, role: Role) {
    return this.prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
      },
    });
  }

  async updateProfile(id: string, updateProfileDto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id },
      data: {
        name: updateProfileDto.name,
        avatarUrl: updateProfileDto.avatarUrl,
        homeBackground: updateProfileDto.homeBackground,
        instruments: updateProfileDto.instruments,
        phone: updateProfileDto.phone,
        bio: updateProfileDto.bio,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        homeBackground: true,
        role: true,
        instruments: true,
        phone: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
