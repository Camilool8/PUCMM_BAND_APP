import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRehearsalDto } from './dto/create-rehearsal.dto';
import { UpdateRehearsalDto } from './dto/update-rehearsal.dto';
import { CreateRehearsalBlockDto } from './dto/create-block.dto';
import { UpdateRehearsalBlockDto } from './dto/update-block.dto';
import { AttendanceStatus } from '@prisma/client';

@Injectable()
export class RehearsalsService {
  constructor(private prisma: PrismaService) {}

  // Common event select including visual properties
  private readonly eventSelect = {
    id: true,
    name: true,
    iconName: true,
    bannerUrl: true,
    gradientFrom: true,
    gradientVia: true,
    gradientTo: true,
    iconGradientFrom: true,
    iconGradientTo: true,
    _count: { select: { eventSongs: true } },
  };

  // Common include for song with all relations
  private readonly songInclude = {
    song: {
      include: {
        suggestedBy: {
          select: { id: true, name: true, avatarUrl: true },
        },
        leadVocals: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            instruments: true,
          },
        },
        eventSongs: {
          include: {
            event: {
              select: {
                id: true,
                name: true,
                iconName: true,
                gradientFrom: true,
                iconGradientFrom: true,
              },
            },
          },
        },
        _count: {
          select: { votes: true },
        },
      },
    },
  };

  private fullRehearsalInclude() {
    return {
      event: { select: this.eventSelect },
      location: true,
      rehearsalSongs: {
        include: this.songInclude,
        orderBy: { order: 'asc' as const },
      },
      rehearsalBlocks: {
        orderBy: { order: 'asc' as const },
      },
      attendances: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              instruments: true,
            },
          },
        },
        orderBy: { checkedInAt: 'asc' as const },
      },
      _count: {
        select: {
          rehearsalSongs: true,
          rehearsalBlocks: true,
          attendances: true,
        },
      },
    };
  }

  private transformRehearsal(rehearsal: any) {
    if (!rehearsal) return rehearsal;
    const { rehearsalSongs, rehearsalBlocks, _count, ...rest } = rehearsal;

    const songs = rehearsalSongs?.map((rs: any) => rs.song) || [];

    const songItems = (rehearsalSongs || []).map((rs: any) => ({
      id: rs.id,
      itemType: 'song' as const,
      order: rs.order,
      song: rs.song,
      block: null,
    }));

    const blockItems = (rehearsalBlocks || []).map((rb: any) => ({
      id: rb.id,
      itemType: 'block' as const,
      order: rb.order,
      song: null,
      block: {
        id: rb.id,
        type: rb.type,
        label: rb.label,
        durationMinutes: rb.durationMinutes,
        notes: rb.notes,
      },
    }));

    const setlistItems = [...songItems, ...blockItems].sort(
      (a, b) => a.order - b.order,
    );

    return {
      ...rest,
      songs,
      setlistItems,
      _count: _count
        ? {
            songs: _count.rehearsalSongs,
            blocks: _count.rehearsalBlocks,
            attendances: _count.attendances,
          }
        : undefined,
    };
  }

  private async getMaxOrder(rehearsalId: string): Promise<number> {
    const [maxSongOrder, maxBlockOrder] = await Promise.all([
      this.prisma.rehearsalSong.aggregate({
        where: { rehearsalId },
        _max: { order: true },
      }),
      this.prisma.rehearsalBlock.aggregate({
        where: { rehearsalId },
        _max: { order: true },
      }),
    ]);
    return Math.max(
      maxSongOrder._max.order ?? -1,
      maxBlockOrder._max.order ?? -1,
    );
  }

  /**
   * Haversine formula: calculates distance between two GPS coordinates in meters.
   */
  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // ── CRUD ──────────────────────────────────────────────────

  async create(dto: CreateRehearsalDto) {
    const { songIds, eventId, locationId, date, ...data } = dto;

    // Verify location exists
    const location = await this.prisma.location.findUnique({
      where: { id: locationId },
    });
    if (!location) {
      throw new NotFoundException(
        `Ubicación con ID ${locationId} no encontrada`,
      );
    }

    // Verify event exists if provided
    if (eventId) {
      const event = await this.prisma.event.findUnique({
        where: { id: eventId },
      });
      if (!event) {
        throw new NotFoundException(
          `Evento con ID ${eventId} no encontrado`,
        );
      }
    }

    const rehearsal = await this.prisma.rehearsal.create({
      data: {
        ...data,
        date: new Date(date),
        location: { connect: { id: locationId } },
        event: eventId ? { connect: { id: eventId } } : undefined,
        rehearsalSongs: songIds?.length
          ? {
              create: songIds.map((songId, index) => ({
                songId,
                order: index,
              })),
            }
          : undefined,
      },
      include: this.fullRehearsalInclude(),
    });

    return this.transformRehearsal(rehearsal);
  }

  async findAll() {
    const rehearsals = await this.prisma.rehearsal.findMany({
      include: this.fullRehearsalInclude(),
      orderBy: { date: 'desc' },
    });
    return rehearsals.map((r) => this.transformRehearsal(r));
  }

  async findByEvent(eventId: string) {
    const rehearsals = await this.prisma.rehearsal.findMany({
      where: { eventId },
      include: this.fullRehearsalInclude(),
      orderBy: { date: 'desc' },
    });
    return rehearsals.map((r) => this.transformRehearsal(r));
  }

  async findOne(id: string) {
    const rehearsal = await this.prisma.rehearsal.findUnique({
      where: { id },
      include: this.fullRehearsalInclude(),
    });

    if (!rehearsal) {
      throw new NotFoundException(`Ensayo con ID ${id} no encontrado`);
    }

    return this.transformRehearsal(rehearsal);
  }

  async update(id: string, dto: UpdateRehearsalDto) {
    const { songIds, locationId, date, ...data } = dto;

    const existing = await this.prisma.rehearsal.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Ensayo con ID ${id} no encontrado`);
    }

    // Verify location if changing
    if (locationId) {
      const location = await this.prisma.location.findUnique({
        where: { id: locationId },
      });
      if (!location) {
        throw new NotFoundException(
          `Ubicación con ID ${locationId} no encontrada`,
        );
      }
    }

    if (songIds !== undefined) {
      await this.prisma.rehearsalSong.deleteMany({
        where: { rehearsalId: id },
      });
      await this.prisma.rehearsalSong.createMany({
        data: songIds.map((songId, index) => ({
          rehearsalId: id,
          songId,
          order: index,
        })),
      });
    }

    const rehearsal = await this.prisma.rehearsal.update({
      where: { id },
      data: {
        ...data,
        date: date ? new Date(date) : undefined,
        locationId: locationId || undefined,
      },
      include: this.fullRehearsalInclude(),
    });

    return this.transformRehearsal(rehearsal);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.rehearsal.delete({ where: { id } });
  }

  // ── Song management ───────────────────────────────────────

  async addSong(rehearsalId: string, songId: string) {
    const existing = await this.prisma.rehearsal.findUnique({
      where: { id: rehearsalId },
    });
    if (!existing) {
      throw new NotFoundException(
        `Ensayo con ID ${rehearsalId} no encontrado`,
      );
    }

    const song = await this.prisma.song.findUnique({
      where: { id: songId },
    });
    if (!song) {
      throw new NotFoundException(
        `Canción con ID ${songId} no encontrada`,
      );
    }

    const maxOrder = await this.getMaxOrder(rehearsalId);

    await this.prisma.rehearsalSong.create({
      data: { rehearsalId, songId, order: maxOrder + 1 },
    });

    const rehearsal = await this.prisma.rehearsal.findUnique({
      where: { id: rehearsalId },
      include: this.fullRehearsalInclude(),
    });

    return this.transformRehearsal(rehearsal);
  }

  async addSongsBulk(rehearsalId: string, songIds: string[]) {
    const existing = await this.prisma.rehearsal.findUnique({
      where: { id: rehearsalId },
    });
    if (!existing) {
      throw new NotFoundException(
        `Ensayo con ID ${rehearsalId} no encontrado`,
      );
    }

    const existingSongs = await this.prisma.rehearsalSong.findMany({
      where: { rehearsalId, songId: { in: songIds } },
      select: { songId: true },
    });
    const existingSet = new Set(existingSongs.map((e) => e.songId));
    const newSongIds = songIds.filter((id) => !existingSet.has(id));

    if (newSongIds.length > 0) {
      const startOrder = (await this.getMaxOrder(rehearsalId)) + 1;
      await this.prisma.rehearsalSong.createMany({
        data: newSongIds.map((songId, index) => ({
          rehearsalId,
          songId,
          order: startOrder + index,
        })),
      });
    }

    const rehearsal = await this.prisma.rehearsal.findUnique({
      where: { id: rehearsalId },
      include: this.fullRehearsalInclude(),
    });

    return this.transformRehearsal(rehearsal);
  }

  async removeSong(rehearsalId: string, songId: string) {
    const existing = await this.prisma.rehearsal.findUnique({
      where: { id: rehearsalId },
    });
    if (!existing) {
      throw new NotFoundException(
        `Ensayo con ID ${rehearsalId} no encontrado`,
      );
    }

    await this.prisma.rehearsalSong.delete({
      where: { rehearsalId_songId: { rehearsalId, songId } },
    });

    const rehearsal = await this.prisma.rehearsal.findUnique({
      where: { id: rehearsalId },
      include: this.fullRehearsalInclude(),
    });

    return this.transformRehearsal(rehearsal);
  }

  // ── Setlist reorder ───────────────────────────────────────

  async reorderSetlist(
    rehearsalId: string,
    items: { id: string; itemType: 'song' | 'block' }[],
  ) {
    const existing = await this.prisma.rehearsal.findUnique({
      where: { id: rehearsalId },
    });
    if (!existing) {
      throw new NotFoundException(
        `Ensayo con ID ${rehearsalId} no encontrado`,
      );
    }

    await Promise.all(
      items.map((item, index) => {
        if (item.itemType === 'song') {
          return this.prisma.rehearsalSong.update({
            where: { id: item.id },
            data: { order: index },
          });
        } else {
          return this.prisma.rehearsalBlock.update({
            where: { id: item.id },
            data: { order: index },
          });
        }
      }),
    );

    const rehearsal = await this.prisma.rehearsal.findUnique({
      where: { id: rehearsalId },
      include: this.fullRehearsalInclude(),
    });

    return this.transformRehearsal(rehearsal);
  }

  // ── Copy from event ───────────────────────────────────────

  async copyFromEvent(rehearsalId: string) {
    const existing = await this.prisma.rehearsal.findUnique({
      where: { id: rehearsalId },
    });
    if (!existing) {
      throw new NotFoundException(
        `Ensayo con ID ${rehearsalId} no encontrado`,
      );
    }
    if (!existing.eventId) {
      throw new NotFoundException(
        'Este ensayo no está vinculado a un evento',
      );
    }

    const [eventSongs, eventBlocks] = await Promise.all([
      this.prisma.eventSong.findMany({
        where: { eventId: existing.eventId },
        orderBy: { order: 'asc' },
      }),
      this.prisma.eventBlock.findMany({
        where: { eventId: existing.eventId },
        orderBy: { order: 'asc' },
      }),
    ]);

    await Promise.all([
      this.prisma.rehearsalSong.deleteMany({ where: { rehearsalId } }),
      this.prisma.rehearsalBlock.deleteMany({ where: { rehearsalId } }),
    ]);

    await Promise.all([
      this.prisma.rehearsalSong.createMany({
        data: eventSongs.map((es) => ({
          rehearsalId,
          songId: es.songId,
          order: es.order,
        })),
      }),
      this.prisma.rehearsalBlock.createMany({
        data: eventBlocks.map((eb) => ({
          rehearsalId,
          type: eb.type,
          label: eb.label,
          durationMinutes: eb.durationMinutes,
          notes: eb.notes,
          order: eb.order,
        })),
      }),
    ]);

    const rehearsal = await this.prisma.rehearsal.findUnique({
      where: { id: rehearsalId },
      include: this.fullRehearsalInclude(),
    });

    return this.transformRehearsal(rehearsal);
  }

  // ── Block management ──────────────────────────────────────

  async addBlock(rehearsalId: string, dto: CreateRehearsalBlockDto) {
    const existing = await this.prisma.rehearsal.findUnique({
      where: { id: rehearsalId },
    });
    if (!existing) {
      throw new NotFoundException(
        `Ensayo con ID ${rehearsalId} no encontrado`,
      );
    }

    const maxOrder = await this.getMaxOrder(rehearsalId);

    await this.prisma.rehearsalBlock.create({
      data: {
        rehearsalId,
        type: dto.type,
        label: dto.label,
        durationMinutes: dto.durationMinutes,
        notes: dto.notes,
        order: maxOrder + 1,
      },
    });

    const rehearsal = await this.prisma.rehearsal.findUnique({
      where: { id: rehearsalId },
      include: this.fullRehearsalInclude(),
    });

    return this.transformRehearsal(rehearsal);
  }

  async updateBlock(
    rehearsalId: string,
    blockId: string,
    dto: UpdateRehearsalBlockDto,
  ) {
    const existing = await this.prisma.rehearsal.findUnique({
      where: { id: rehearsalId },
    });
    if (!existing) {
      throw new NotFoundException(
        `Ensayo con ID ${rehearsalId} no encontrado`,
      );
    }

    const block = await this.prisma.rehearsalBlock.findUnique({
      where: { id: blockId },
    });
    if (!block || block.rehearsalId !== rehearsalId) {
      throw new NotFoundException('Bloque no encontrado');
    }

    await this.prisma.rehearsalBlock.update({
      where: { id: blockId },
      data: dto,
    });

    const rehearsal = await this.prisma.rehearsal.findUnique({
      where: { id: rehearsalId },
      include: this.fullRehearsalInclude(),
    });

    return this.transformRehearsal(rehearsal);
  }

  async removeBlock(rehearsalId: string, blockId: string) {
    const existing = await this.prisma.rehearsal.findUnique({
      where: { id: rehearsalId },
    });
    if (!existing) {
      throw new NotFoundException(
        `Ensayo con ID ${rehearsalId} no encontrado`,
      );
    }

    const block = await this.prisma.rehearsalBlock.findUnique({
      where: { id: blockId },
    });
    if (!block || block.rehearsalId !== rehearsalId) {
      throw new NotFoundException('Bloque no encontrado');
    }

    await this.prisma.rehearsalBlock.delete({ where: { id: blockId } });

    const rehearsal = await this.prisma.rehearsal.findUnique({
      where: { id: rehearsalId },
      include: this.fullRehearsalInclude(),
    });

    return this.transformRehearsal(rehearsal);
  }

  // ── Attendance ────────────────────────────────────────────

  async checkIn(
    rehearsalId: string,
    userId: string,
    latitude: number,
    longitude: number,
  ) {
    const rehearsal = await this.prisma.rehearsal.findUnique({
      where: { id: rehearsalId },
      include: { location: true },
    });
    if (!rehearsal) {
      throw new NotFoundException(
        `Ensayo con ID ${rehearsalId} no encontrado`,
      );
    }

    const distance = this.calculateDistance(
      latitude,
      longitude,
      rehearsal.location.latitude,
      rehearsal.location.longitude,
    );

    if (distance > rehearsal.location.radiusMeters) {
      throw new ForbiddenException(
        `Estás a ${Math.round(distance)}m del lugar de ensayo. Debes estar dentro de ${rehearsal.location.radiusMeters}m para marcar asistencia.`,
      );
    }

    await this.prisma.rehearsalAttendance.upsert({
      where: { rehearsalId_userId: { rehearsalId, userId } },
      update: {
        status: 'PRESENT',
        latitude,
        longitude,
        checkedInAt: new Date(),
      },
      create: {
        rehearsalId,
        userId,
        status: 'PRESENT',
        latitude,
        longitude,
      },
    });

    return this.findOne(rehearsalId);
  }

  async adminMarkAttendance(
    rehearsalId: string,
    adminUserId: string,
    userId: string,
    status: AttendanceStatus,
    notes?: string,
  ) {
    const rehearsal = await this.prisma.rehearsal.findUnique({
      where: { id: rehearsalId },
    });
    if (!rehearsal) {
      throw new NotFoundException(
        `Ensayo con ID ${rehearsalId} no encontrado`,
      );
    }

    await this.prisma.rehearsalAttendance.upsert({
      where: { rehearsalId_userId: { rehearsalId, userId } },
      update: { status, notes, markedBy: adminUserId },
      create: {
        rehearsalId,
        userId,
        status,
        notes,
        markedBy: adminUserId,
      },
    });

    return this.findOne(rehearsalId);
  }

  async getAttendance(rehearsalId: string) {
    const rehearsal = await this.prisma.rehearsal.findUnique({
      where: { id: rehearsalId },
    });
    if (!rehearsal) {
      throw new NotFoundException(
        `Ensayo con ID ${rehearsalId} no encontrado`,
      );
    }

    return this.prisma.rehearsalAttendance.findMany({
      where: { rehearsalId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            instruments: true,
          },
        },
      },
      orderBy: { checkedInAt: 'asc' },
    });
  }

  async removeAttendance(rehearsalId: string, userId: string) {
    await this.prisma.rehearsalAttendance.delete({
      where: { rehearsalId_userId: { rehearsalId, userId } },
    });

    return this.findOne(rehearsalId);
  }
}
