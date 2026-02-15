import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.location.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const location = await this.prisma.location.findUnique({
      where: { id },
    });

    if (!location) {
      throw new NotFoundException(`Ubicación con ID ${id} no encontrada`);
    }

    return location;
  }

  async create(dto: CreateLocationDto) {
    return this.prisma.location.create({
      data: dto,
    });
  }

  async update(id: string, dto: UpdateLocationDto) {
    await this.findOne(id);

    return this.prisma.location.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.location.delete({
      where: { id },
    });
  }
}
