import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrgDto } from './dto/create-org.dto';
import { UpdateOrgDto, UpdateOrgStatusDto } from './dto/update-org.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PlatformRolesGuard } from '../auth/platform-roles.guard';
import { PlatformRoles } from '../auth/platform-roles.decorator';

@Controller('orgs')
@UseGuards(JwtAuthGuard, PlatformRolesGuard)
export class OrganizationsController {
  constructor(private orgsService: OrganizationsService) {}

  @Get()
  @PlatformRoles('PLATFORM_ADMIN', 'PLATFORM_VIEWER')
  findAll() {
    return this.orgsService.findAll();
  }

  @Get(':id')
  @PlatformRoles('PLATFORM_ADMIN', 'PLATFORM_VIEWER')
  findOne(@Param('id') id: string) {
    return this.orgsService.findOne(id);
  }

  @Post()
  @PlatformRoles('PLATFORM_ADMIN')
  create(@Body() dto: CreateOrgDto) {
    return this.orgsService.create(dto);
  }

  @Patch(':id')
  @PlatformRoles('PLATFORM_ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateOrgDto) {
    return this.orgsService.update(id, dto);
  }

  @Patch(':id/status')
  @PlatformRoles('PLATFORM_ADMIN')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrgStatusDto) {
    return this.orgsService.updateStatus(id, dto);
  }

  @Delete(':id')
  @PlatformRoles('PLATFORM_ADMIN')
  remove(@Param('id') id: string) {
    return this.orgsService.remove(id);
  }

  @Get(':id/health')
  @PlatformRoles('PLATFORM_ADMIN', 'PLATFORM_VIEWER')
  healthCheck(@Param('id') id: string) {
    return this.orgsService.healthCheck(id);
  }

  @Post('health-check')
  @PlatformRoles('PLATFORM_ADMIN')
  healthCheckAll() {
    return this.orgsService.healthCheckAll();
  }
}
