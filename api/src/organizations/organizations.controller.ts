import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { UnifiedAuthGuard } from '../auth/unified-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  // Public endpoint - no auth required
  // Frontend fetches this before login to get branding + auth provider config
  @Get('config')
  getPublicConfig() {
    return this.organizationsService.getPublicConfig();
  }

  // Admin-only: update organization settings
  @UseGuards(UnifiedAuthGuard)
  @Roles(Role.SUPERADMIN)
  @Patch()
  update(@Body() dto: UpdateOrganizationDto) {
    return this.organizationsService.updateOrganization(dto);
  }
}
