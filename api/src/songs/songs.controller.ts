import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { SongsService } from './songs.service';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { AzureAdGuard } from '../auth/azure-ad.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('songs')
@UseGuards(AzureAdGuard)
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  @Post()
  create(@Request() req, @Body() createSongDto: CreateSongDto) {
    const userId = req.user?.dbUser?.id;
    return this.songsService.create(createSongDto, userId);
  }

  @Get()
  findAll() {
    return this.songsService.findAll();
  }

  @Get('my-votes')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPERADMIN, Role.SECTION_LEADER, Role.MEMBER)
  getMyVotes(@Request() req) {
    const userId = req.user?.dbUser?.id;
    return this.songsService.getUserVotes(userId);
  }

  @Get('check-duplicate')
  async checkDuplicate(
    @Query('title') title: string,
    @Query('artist') artist: string,
    @Query('isrc') isrc?: string,
  ) {
    return this.songsService.checkDuplicate(title, artist, isrc);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.songsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPERADMIN, Role.SECTION_LEADER)
  update(@Param('id') id: string, @Body() updateSongDto: UpdateSongDto) {
    return this.songsService.update(id, updateSongDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPERADMIN, Role.SECTION_LEADER)
  remove(@Param('id') id: string) {
    return this.songsService.remove(id);
  }

  // ============================================================================
  // Voting Endpoints (only band members can vote, not ALUMNI_GUEST)
  // ============================================================================

  @Post(':id/vote')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPERADMIN, Role.SECTION_LEADER, Role.MEMBER)
  addVote(@Param('id') id: string, @Request() req) {
    const userId = req.user?.dbUser?.id;
    return this.songsService.addVote(id, userId);
  }

  @Delete(':id/vote')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPERADMIN, Role.SECTION_LEADER, Role.MEMBER)
  removeVote(@Param('id') id: string, @Request() req) {
    const userId = req.user?.dbUser?.id;
    return this.songsService.removeVote(id, userId);
  }

  // ============================================================================
  // Lead Vocals Endpoints
  // ============================================================================

  @Post(':id/lead-vocals/:userId')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPERADMIN, Role.SECTION_LEADER)
  addLeadVocal(@Param('id') id: string, @Param('userId') userId: string) {
    return this.songsService.addLeadVocal(id, userId);
  }

  @Delete(':id/lead-vocals/:userId')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPERADMIN, Role.SECTION_LEADER)
  removeLeadVocal(@Param('id') id: string, @Param('userId') userId: string) {
    return this.songsService.removeLeadVocal(id, userId);
  }
}
