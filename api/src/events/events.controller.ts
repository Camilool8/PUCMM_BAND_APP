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
import { AddSongsBulkDto } from './dto/add-songs-bulk.dto';
import { ReorderSongsDto } from './dto/reorder-songs.dto';
import { ReorderSetlistDto } from './dto/reorder-setlist.dto';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';
import { AzureAdGuard } from '../auth/azure-ad.guard';
import { Role } from '@prisma/client';

// Only SUPERADMIN can manage events
const EVENT_ADMIN_ROLES = [Role.SUPERADMIN];

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

  // Song management
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

  @Post(':id/songs/bulk')
  addSongsBulk(
    @Param('id') id: string,
    @Body() dto: AddSongsBulkDto,
    @Request() req,
  ) {
    const user = req.user.dbUser;
    if (!EVENT_ADMIN_ROLES.includes(user.role)) {
      throw new ForbiddenException(
        'Solo los administradores pueden agregar canciones a eventos',
      );
    }
    return this.eventsService.addSongsBulk(id, dto.songIds);
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

  // Unified setlist reorder (songs + blocks)
  @Patch(':id/setlist/reorder')
  reorderSetlist(
    @Param('id') id: string,
    @Body() dto: ReorderSetlistDto,
    @Request() req,
  ) {
    const user = req.user.dbUser;
    if (!EVENT_ADMIN_ROLES.includes(user.role)) {
      throw new ForbiddenException(
        'Solo los administradores pueden reordenar el setlist',
      );
    }
    return this.eventsService.reorderSetlist(id, dto.items);
  }

  // Block management
  @Post(':id/blocks')
  addBlock(
    @Param('id') id: string,
    @Body() dto: CreateBlockDto,
    @Request() req,
  ) {
    const user = req.user.dbUser;
    if (!EVENT_ADMIN_ROLES.includes(user.role)) {
      throw new ForbiddenException(
        'Solo los administradores pueden agregar bloques a eventos',
      );
    }
    return this.eventsService.addBlock(id, dto);
  }

  @Patch(':id/blocks/:blockId')
  updateBlock(
    @Param('id') id: string,
    @Param('blockId') blockId: string,
    @Body() dto: UpdateBlockDto,
    @Request() req,
  ) {
    const user = req.user.dbUser;
    if (!EVENT_ADMIN_ROLES.includes(user.role)) {
      throw new ForbiddenException(
        'Solo los administradores pueden editar bloques',
      );
    }
    return this.eventsService.updateBlock(id, blockId, dto);
  }

  @Delete(':id/blocks/:blockId')
  removeBlock(
    @Param('id') id: string,
    @Param('blockId') blockId: string,
    @Request() req,
  ) {
    const user = req.user.dbUser;
    if (!EVENT_ADMIN_ROLES.includes(user.role)) {
      throw new ForbiddenException(
        'Solo los administradores pueden remover bloques de eventos',
      );
    }
    return this.eventsService.removeBlock(id, blockId);
  }
}
