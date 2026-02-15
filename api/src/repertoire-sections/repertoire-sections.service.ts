import { Injectable } from '@nestjs/common';
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
      // Return default section shape so frontend always gets data
      return {
        key,
        title: key.charAt(0).toUpperCase() + key.slice(1),
        subtitle: null,
        iconName: null,
        bannerUrl: null,
        gradientFrom: null,
        gradientVia: null,
        gradientTo: null,
        iconGradientFrom: null,
        iconGradientTo: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return section;
  }

  async update(key: string, updateDto: UpdateSectionDto) {
    const defaultTitle = key.charAt(0).toUpperCase() + key.slice(1);
    return this.prisma.repertoireSection.upsert({
      where: { key },
      update: updateDto,
      create: {
        key,
        title: defaultTitle,
        ...updateDto,
      },
    });
  }

  async clearBanner(key: string) {
    const defaultTitle = key.charAt(0).toUpperCase() + key.slice(1);
    return this.prisma.repertoireSection.upsert({
      where: { key },
      update: { bannerUrl: null },
      create: { key, title: defaultTitle, bannerUrl: null },
    });
  }
}
