import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ForbiddenException,
  Request,
} from '@nestjs/common';
import { RepertoireSectionsService } from './repertoire-sections.service';
import { UpdateSectionDto } from './dto/update-section.dto';
import { AzureAdGuard } from '../auth/azure-ad.guard';
import { Role } from '@prisma/client';

// Only SUPERADMIN and SECTION_LEADER can edit sections
const SECTION_ADMIN_ROLES = [Role.SUPERADMIN, Role.SECTION_LEADER];

@Controller('repertoire-sections')
@UseGuards(AzureAdGuard)
export class RepertoireSectionsController {
  constructor(private readonly sectionsService: RepertoireSectionsService) {}

  @Get()
  findAll() {
    return this.sectionsService.findAll();
  }

  @Get(':key')
  findByKey(@Param('key') key: string) {
    return this.sectionsService.findByKey(key);
  }

  @Patch(':key')
  update(
    @Param('key') key: string,
    @Body() updateDto: UpdateSectionDto,
    @Request() req,
  ) {
    const user = req.user.dbUser;
    if (!SECTION_ADMIN_ROLES.includes(user.role)) {
      throw new ForbiddenException(
        'Solo los administradores pueden editar las secciones del repertorio',
      );
    }
    return this.sectionsService.update(key, updateDto);
  }

  @Delete(':key/banner')
  clearBanner(@Param('key') key: string, @Request() req) {
    const user = req.user.dbUser;
    if (!SECTION_ADMIN_ROLES.includes(user.role)) {
      throw new ForbiddenException(
        'Solo los administradores pueden editar las secciones del repertorio',
      );
    }
    return this.sectionsService.clearBanner(key);
  }
}
