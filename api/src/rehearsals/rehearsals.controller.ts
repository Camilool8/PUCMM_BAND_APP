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
  Request,
} from '@nestjs/common';
import { RehearsalsService } from './rehearsals.service';
import { CreateRehearsalDto } from './dto/create-rehearsal.dto';
import { UpdateRehearsalDto } from './dto/update-rehearsal.dto';
import { AddSongToRehearsalDto } from './dto/add-song.dto';
import { AddSongsBulkDto } from './dto/add-songs-bulk.dto';
import { ReorderRehearsalSetlistDto } from './dto/reorder-setlist.dto';
import { CreateRehearsalBlockDto } from './dto/create-block.dto';
import { UpdateRehearsalBlockDto } from './dto/update-block.dto';
import { CheckInDto } from './dto/check-in.dto';
import { AdminAttendanceDto } from './dto/admin-attendance.dto';
import { UnifiedAuthGuard } from '../auth/unified-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

const REHEARSAL_ADMIN_ROLES = [Role.SUPERADMIN];

@Controller('rehearsals')
@UseGuards(UnifiedAuthGuard, RolesGuard)
export class RehearsalsController {
  constructor(private readonly rehearsalsService: RehearsalsService) {}

  // ── CRUD ──────────────────────────────────────────────────

  @Get()
  findAll(@Query('eventId') eventId?: string) {
    if (eventId) {
      return this.rehearsalsService.findByEvent(eventId);
    }
    return this.rehearsalsService.findAll();
  }

  @Get('event/:eventId')
  findByEvent(@Param('eventId') eventId: string) {
    return this.rehearsalsService.findByEvent(eventId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rehearsalsService.findOne(id);
  }

  @Post()
  @Roles(...REHEARSAL_ADMIN_ROLES)
  create(@Body() dto: CreateRehearsalDto) {
    return this.rehearsalsService.create(dto);
  }

  @Patch(':id')
  @Roles(...REHEARSAL_ADMIN_ROLES)
  update(@Param('id') id: string, @Body() dto: UpdateRehearsalDto) {
    return this.rehearsalsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(...REHEARSAL_ADMIN_ROLES)
  remove(@Param('id') id: string) {
    return this.rehearsalsService.remove(id);
  }

  // ── Song management ───────────────────────────────────────

  @Post(':id/songs')
  @Roles(...REHEARSAL_ADMIN_ROLES)
  addSong(@Param('id') id: string, @Body() dto: AddSongToRehearsalDto) {
    return this.rehearsalsService.addSong(id, dto.songId);
  }

  @Post(':id/songs/bulk')
  @Roles(...REHEARSAL_ADMIN_ROLES)
  addSongsBulk(@Param('id') id: string, @Body() dto: AddSongsBulkDto) {
    return this.rehearsalsService.addSongsBulk(id, dto.songIds);
  }

  @Delete(':id/songs/:songId')
  @Roles(...REHEARSAL_ADMIN_ROLES)
  removeSong(@Param('id') id: string, @Param('songId') songId: string) {
    return this.rehearsalsService.removeSong(id, songId);
  }

  // ── Copy from event ───────────────────────────────────────

  @Post(':id/copy-from-event')
  @Roles(...REHEARSAL_ADMIN_ROLES)
  copyFromEvent(@Param('id') id: string) {
    return this.rehearsalsService.copyFromEvent(id);
  }

  // ── Setlist reorder ───────────────────────────────────────

  @Patch(':id/setlist/reorder')
  @Roles(...REHEARSAL_ADMIN_ROLES)
  reorderSetlist(@Param('id') id: string, @Body() dto: ReorderRehearsalSetlistDto) {
    return this.rehearsalsService.reorderSetlist(id, dto.items);
  }

  // ── Block management ──────────────────────────────────────

  @Post(':id/blocks')
  @Roles(...REHEARSAL_ADMIN_ROLES)
  addBlock(@Param('id') id: string, @Body() dto: CreateRehearsalBlockDto) {
    return this.rehearsalsService.addBlock(id, dto);
  }

  @Patch(':id/blocks/:blockId')
  @Roles(...REHEARSAL_ADMIN_ROLES)
  updateBlock(
    @Param('id') id: string,
    @Param('blockId') blockId: string,
    @Body() dto: UpdateRehearsalBlockDto,
  ) {
    return this.rehearsalsService.updateBlock(id, blockId, dto);
  }

  @Delete(':id/blocks/:blockId')
  @Roles(...REHEARSAL_ADMIN_ROLES)
  removeBlock(@Param('id') id: string, @Param('blockId') blockId: string) {
    return this.rehearsalsService.removeBlock(id, blockId);
  }

  // ── Attendance ────────────────────────────────────────────

  @Post(':id/check-in')
  checkIn(@Param('id') id: string, @Body() dto: CheckInDto, @Request() req: any) {
    const userId = req.user.dbUser.id;
    return this.rehearsalsService.checkIn(id, userId, dto.latitude, dto.longitude);
  }

  @Post(':id/attendance')
  @Roles(...REHEARSAL_ADMIN_ROLES)
  adminMarkAttendance(
    @Param('id') id: string,
    @Body() dto: AdminAttendanceDto,
    @Request() req: any,
  ) {
    const adminUserId = req.user.dbUser.id;
    return this.rehearsalsService.adminMarkAttendance(
      id,
      adminUserId,
      dto.userId,
      dto.status,
      dto.notes,
    );
  }

  @Get(':id/attendance')
  getAttendance(@Param('id') id: string) {
    return this.rehearsalsService.getAttendance(id);
  }

  @Delete(':id/attendance/:userId')
  @Roles(...REHEARSAL_ADMIN_ROLES)
  removeAttendance(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.rehearsalsService.removeAttendance(id, userId);
  }
}
