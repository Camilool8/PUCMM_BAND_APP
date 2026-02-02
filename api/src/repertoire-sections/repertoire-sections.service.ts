import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSectionDto } from './dto/update-section.dto';

@Injectable()
export class RepertoireSectionsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.repertoireSection.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  async findByKey(key: string) {
    const section = await this.prisma.repertoireSection.findUnique({
      where: { key },
    });

    if (!section) {
      throw new NotFoundException(`Section with key "${key}" not found`);
    }

    return section;
  }

  async update(key: string, updateDto: UpdateSectionDto) {
    // Check if section exists
    await this.findByKey(key);

    return this.prisma.repertoireSection.update({
      where: { key },
      data: updateDto,
    });
  }

  async clearBanner(key: string) {
    await this.findByKey(key);

    return this.prisma.repertoireSection.update({
      where: { key },
      data: { bannerUrl: null },
    });
  }
}
