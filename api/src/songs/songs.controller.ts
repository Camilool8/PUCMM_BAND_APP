import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { SongsService } from './songs.service';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { SetLeadVocalsDto } from './dto/set-lead-vocals.dto';
import { AzureAdGuard } from '../auth/azure-ad.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('songs')
@UseGuards(AzureAdGuard)
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.SUPERADMIN, Role.MEMBER)
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
  @Roles(Role.SUPERADMIN, Role.MEMBER)
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
  @Roles(Role.SUPERADMIN)
  update(@Param('id') id: string, @Body() updateSongDto: UpdateSongDto) {
    return this.songsService.update(id, updateSongDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPERADMIN)
  remove(@Param('id') id: string) {
    return this.songsService.remove(id);
  }

  // ============================================================================
  // Voting Endpoints (only members can vote, not STUDENT_GUEST)
  // ============================================================================

  @Post(':id/vote')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPERADMIN, Role.MEMBER)
  addVote(@Param('id') id: string, @Request() req) {
    const userId = req.user?.dbUser?.id;
    return this.songsService.addVote(id, userId);
  }

  @Delete(':id/vote')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPERADMIN, Role.MEMBER)
  removeVote(@Param('id') id: string, @Request() req) {
    const userId = req.user?.dbUser?.id;
    return this.songsService.removeVote(id, userId);
  }

  @Post(':id/golden-vote')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPERADMIN, Role.MEMBER)
  addGoldenVote(@Param('id') id: string, @Request() req) {
    const userId = req.user?.dbUser?.id;
    return this.songsService.addGoldenVote(id, userId);
  }

  @Delete(':id/golden-vote')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPERADMIN, Role.MEMBER)
  removeGoldenVote(@Param('id') id: string, @Request() req) {
    const userId = req.user?.dbUser?.id;
    return this.songsService.removeGoldenVote(id, userId);
  }

  // ============================================================================
  // Lead Vocals Endpoints
  // ============================================================================

  @Post(':id/lead-vocals')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPERADMIN)
  setLeadVocals(@Param('id') id: string, @Body() dto: SetLeadVocalsDto) {
    return this.songsService.setLeadVocals(id, dto.userIds);
  }

  @Post(':id/lead-vocals/:userId')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPERADMIN)
  addLeadVocal(@Param('id') id: string, @Param('userId') userId: string) {
    return this.songsService.addLeadVocal(id, userId);
  }

  @Delete(':id/lead-vocals/:userId')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPERADMIN)
  removeLeadVocal(@Param('id') id: string, @Param('userId') userId: string) {
    return this.songsService.removeLeadVocal(id, userId);
  }
}
