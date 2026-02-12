import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AzureAdGuard } from '../auth/azure-ad.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

const VALID_ROLES = Object.values(Role);

// Roles that can edit their own profile (admin and members, not students/guests)
const EDITABLE_PROFILE_ROLES = [Role.SUPERADMIN, Role.MEMBER];

@Controller('users')
@UseGuards(AzureAdGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Get current user info
  @Get('me')
  getMe(@Request() req) {
    return req.user.dbUser;
  }

  // Update current user's profile (admin and members only, not STUDENT_GUEST)
  @Patch('me/profile')
  async updateMyProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const currentUser = req.user.dbUser;

    // Only band members can edit their profile
    if (!EDITABLE_PROFILE_ROLES.includes(currentUser.role)) {
      throw new ForbiddenException('Solo los miembros de la banda pueden editar su perfil');
    }

    return this.usersService.updateProfile(currentUser.id, updateProfileDto);
  }

  // List all users (SUPERADMIN only)
  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.SUPERADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  // Update user role (SUPERADMIN only)
  @Patch(':id/role')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPERADMIN)
  async updateRole(
    @Param('id') id: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
    @Request() req,
  ) {
    // Validate role
    if (!updateUserRoleDto.role || !VALID_ROLES.includes(updateUserRoleDto.role)) {
      throw new BadRequestException(`Invalid role. Valid roles: ${VALID_ROLES.join(', ')}`);
    }

    const currentUser = req.user.dbUser;
    const targetUser = await this.usersService.findOne(id);

    // Prevent demoting an existing SUPERADMIN
    if (targetUser.role === Role.SUPERADMIN && updateUserRoleDto.role !== Role.SUPERADMIN) {
      throw new ForbiddenException('Cannot demote a SUPERADMIN user');
    }

    // Prevent self-demotion
    if (currentUser.id === id && updateUserRoleDto.role !== Role.SUPERADMIN) {
      throw new ForbiddenException('Cannot demote yourself');
    }

    return this.usersService.updateRole(id, updateUserRoleDto.role);
  }

  // Admin: Update any user's profile (SUPERADMIN only)
  @Patch(':id/profile')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPERADMIN)
  async updateUserProfile(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    await this.usersService.findOne(id);
    return this.usersService.updateProfile(id, updateProfileDto);
  }
}
