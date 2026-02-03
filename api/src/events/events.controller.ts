import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { AddSongDto } from './dto/add-song.dto';
import { ReorderSongsDto } from './dto/reorder-songs.dto';
import { AzureAdGuard } from '../auth/azure-ad.guard';
import { Role } from '@prisma/client';

// Only SUPERADMIN and SECTION_LEADER can manage events
const EVENT_ADMIN_ROLES = [Role.SUPERADMIN, Role.SECTION_LEADER];

@Controller('events')
@UseGuards(AzureAdGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(@Body() createEventDto: CreateEventDto, @Request() req) {
    const user = req.user.dbUser;
    if (!EVENT_ADMIN_ROLES.includes(user.role)) {
      throw new ForbiddenException(
        'Solo los administradores pueden crear eventos',
      );
    }
    return this.eventsService.create(createEventDto);
  }

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Request() req,
  ) {
    const user = req.user.dbUser;
    if (!EVENT_ADMIN_ROLES.includes(user.role)) {
      throw new ForbiddenException(
        'Solo los administradores pueden editar eventos',
      );
    }
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    const user = req.user.dbUser;
    if (!EVENT_ADMIN_ROLES.includes(user.role)) {
      throw new ForbiddenException(
        'Solo los administradores pueden eliminar eventos',
      );
    }
    return this.eventsService.remove(id);
  }

  @Post(':id/songs')
  addSong(
    @Param('id') id: string,
    @Body() addSongDto: AddSongDto,
    @Request() req,
  ) {
    const user = req.user.dbUser;
    if (!EVENT_ADMIN_ROLES.includes(user.role)) {
      throw new ForbiddenException(
        'Solo los administradores pueden agregar canciones a eventos',
      );
    }
    return this.eventsService.addSong(id, addSongDto.songId);
  }

  @Delete(':id/songs/:songId')
  removeSong(
    @Param('id') id: string,
    @Param('songId') songId: string,
    @Request() req,
  ) {
    const user = req.user.dbUser;
    if (!EVENT_ADMIN_ROLES.includes(user.role)) {
      throw new ForbiddenException(
        'Solo los administradores pueden remover canciones de eventos',
      );
    }
    return this.eventsService.removeSong(id, songId);
  }

  @Patch(':id/songs/reorder')
  reorderSongs(
    @Param('id') id: string,
    @Body() reorderSongsDto: ReorderSongsDto,
    @Request() req,
  ) {
    const user = req.user.dbUser;
    if (!EVENT_ADMIN_ROLES.includes(user.role)) {
      throw new ForbiddenException(
        'Solo los administradores pueden reordenar canciones',
      );
    }
    return this.eventsService.reorderSongs(id, reorderSongsDto.songIds);
  }
}
