import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ConcertsService } from './concerts.service';
import { CreateConcertDto } from './dto/create-concert.dto';
import { UpdateConcertDto } from './dto/update-concert.dto';
import { AddSongToConcertDto } from './dto/add-song.dto';
import { ReorderSongsDto } from './dto/reorder-songs.dto';
import { AzureAdGuard } from '../auth/azure-ad.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

const CONCERT_ADMIN_ROLES = [Role.SUPERADMIN, Role.SECTION_LEADER];

@Controller('concerts')
@UseGuards(AzureAdGuard, RolesGuard)
export class ConcertsController {
  constructor(private readonly concertsService: ConcertsService) {}

  @Get()
  findAll(@Query('eventId') eventId?: string) {
    if (eventId) {
      return this.concertsService.findByEvent(eventId);
    }
    return this.concertsService.findAll();
  }

  @Get('event/:eventId')
  findByEvent(@Param('eventId') eventId: string) {
    return this.concertsService.findByEvent(eventId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.concertsService.findOne(id);
  }

  @Post()
  @Roles(...CONCERT_ADMIN_ROLES)
  create(@Body() createConcertDto: CreateConcertDto) {
    return this.concertsService.create(createConcertDto);
  }

  @Patch(':id')
  @Roles(...CONCERT_ADMIN_ROLES)
  update(@Param('id') id: string, @Body() updateConcertDto: UpdateConcertDto) {
    return this.concertsService.update(id, updateConcertDto);
  }

  @Delete(':id')
  @Roles(...CONCERT_ADMIN_ROLES)
  remove(@Param('id') id: string) {
    return this.concertsService.remove(id);
  }

  // Song management for concert setlist
  @Post(':id/songs')
  @Roles(...CONCERT_ADMIN_ROLES)
  addSong(@Param('id') id: string, @Body() addSongDto: AddSongToConcertDto) {
    return this.concertsService.addSong(id, addSongDto.songId);
  }

  @Delete(':id/songs/:songId')
  @Roles(...CONCERT_ADMIN_ROLES)
  removeSong(@Param('id') id: string, @Param('songId') songId: string) {
    return this.concertsService.removeSong(id, songId);
  }

  // Copy songs from parent event
  @Post(':id/copy-from-event')
  @Roles(...CONCERT_ADMIN_ROLES)
  copyFromEvent(@Param('id') id: string) {
    return this.concertsService.copyFromEvent(id);
  }

  // Reorder songs in setlist
  @Patch(':id/songs/reorder')
  @Roles(...CONCERT_ADMIN_ROLES)
  reorderSongs(@Param('id') id: string, @Body() reorderSongsDto: ReorderSongsDto) {
    return this.concertsService.reorderSongs(id, reorderSongsDto.songIds);
  }
}
