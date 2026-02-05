import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  // Common include for song with all relations
  private readonly songInclude = {
    song: {
      include: {
        suggestedBy: {
          select: { id: true, name: true, avatarUrl: true },
        },
        leadVocals: {
          select: { id: true, name: true, avatarUrl: true, instruments: true },
        },
        eventSongs: {
          include: {
            event: {
              select: { id: true, name: true, iconName: true, gradientFrom: true, iconGradientFrom: true },
            },
          },
        },
        _count: {
          select: { votes: true },
        },
      },
    },
  };

  // Common include for fetching a full event with songs and blocks
  private fullEventInclude() {
    return {
      eventSongs: {
        include: this.songInclude,
        orderBy: { order: 'asc' as const },
      },
      eventBlocks: {
        orderBy: { order: 'asc' as const },
      },
      concerts: true,
      _count: {
        select: { eventSongs: true, concerts: true, eventBlocks: true },
      },
    };
  }

  // Transform event to include songs array and setlistItems from eventSongs + eventBlocks
  private transformEvent(event: any) {
    if (!event) return event;
    const { eventSongs, eventBlocks, _count, ...rest } = event;

    const songs = eventSongs?.map((es: any) => es.song) || [];

    // Build unified setlist: songs + blocks, sorted by order
    const songItems = (eventSongs || []).map((es: any) => ({
      id: es.id,
      itemType: 'song' as const,
      order: es.order,
      song: es.song,
      block: null,
    }));

    const blockItems = (eventBlocks || []).map((eb: any) => ({
      id: eb.id,
      itemType: 'block' as const,
      order: eb.order,
      song: null,
      block: {
        id: eb.id,
        type: eb.type,
        label: eb.label,
        durationMinutes: eb.durationMinutes,
        notes: eb.notes,
      },
    }));

    const setlistItems = [...songItems, ...blockItems].sort((a, b) => a.order - b.order);

    return {
      ...rest,
      songs,
      setlistItems,
      _count: _count
        ? { songs: _count.eventSongs, concerts: _count.concerts, blocks: _count.eventBlocks }
        : undefined,
    };
  }

  // Get the max order across both songs and blocks for an event
  private async getMaxOrder(eventId: string): Promise<number> {
    const [maxSongOrder, maxBlockOrder] = await Promise.all([
      this.prisma.eventSong.aggregate({ where: { eventId }, _max: { order: true } }),
      this.prisma.eventBlock.aggregate({ where: { eventId }, _max: { order: true } }),
    ]);
    return Math.max(maxSongOrder._max.order ?? -1, maxBlockOrder._max.order ?? -1);
  }

  async create(createEventDto: CreateEventDto) {
    const { songIds, ...eventData } = createEventDto;

    const event = await this.prisma.event.create({
      data: {
        ...eventData,
        eventSongs: songIds?.length
          ? {
              create: songIds.map((songId, index) => ({
                songId,
                order: index,
              })),
            }
          : undefined,
      },
      include: this.fullEventInclude(),
    });

    return this.transformEvent(event);
  }

  async findAll() {
    const events = await this.prisma.event.findMany({
      include: {
        _count: {
          select: { eventSongs: true, concerts: true, eventBlocks: true },
        },
        concerts: {
          orderBy: { date: 'asc' },
          take: 1,
          select: { date: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return events.map((event) => ({
      ...event,
      _count: {
        songs: event._count.eventSongs,
        concerts: event._count.concerts,
        blocks: event._count.eventBlocks,
      },
    }));
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: this.fullEventInclude(),
    });

    if (!event) {
      throw new NotFoundException(`Evento con ID ${id} no encontrado`);
    }

    return this.transformEvent(event);
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    const { songIds, ...eventData } = updateEventDto;

    // Check if event exists
    await this.findOne(id);

    // If songIds provided, recreate all eventSongs with order
    if (songIds !== undefined) {
      await this.prisma.eventSong.deleteMany({ where: { eventId: id } });
      await this.prisma.eventSong.createMany({
        data: songIds.map((songId, index) => ({
          eventId: id,
          songId,
          order: index,
        })),
      });
    }

    const event = await this.prisma.event.update({
      where: { id },
      data: eventData,
      include: this.fullEventInclude(),
    });

    return this.transformEvent(event);
  }

  async remove(id: string) {
    // Check if event exists
    await this.findOne(id);

    return this.prisma.event.delete({
      where: { id },
    });
  }

  async addSong(eventId: string, songId: string) {
    // Check if event exists
    await this.findOne(eventId);

    // Check if song exists
    const song = await this.prisma.song.findUnique({ where: { id: songId } });
    if (!song) {
      throw new NotFoundException(`Cancion con ID ${songId} no encontrada`);
    }

    const maxOrder = await this.getMaxOrder(eventId);

    // Create junction record with next order
    await this.prisma.eventSong.create({
      data: {
        eventId,
        songId,
        order: maxOrder + 1,
      },
    });

    // Return updated event
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: this.fullEventInclude(),
    });

    return this.transformEvent(event);
  }

  async addSongsBulk(eventId: string, songIds: string[]) {
    await this.findOne(eventId);

    // Filter out songs already in event
    const existing = await this.prisma.eventSong.findMany({
      where: { eventId, songId: { in: songIds } },
      select: { songId: true },
    });
    const existingSet = new Set(existing.map((e) => e.songId));
    const newSongIds = songIds.filter((id) => !existingSet.has(id));

    if (newSongIds.length > 0) {
      const startOrder = (await this.getMaxOrder(eventId)) + 1;
      await this.prisma.eventSong.createMany({
        data: newSongIds.map((songId, index) => ({
          eventId,
          songId,
          order: startOrder + index,
        })),
      });
    }

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: this.fullEventInclude(),
    });

    return this.transformEvent(event);
  }

  async removeSong(eventId: string, songId: string) {
    // Check if event exists
    await this.findOne(eventId);

    // Delete the junction record
    await this.prisma.eventSong.delete({
      where: {
        eventId_songId: { eventId, songId },
      },
    });

    // Return updated event
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: this.fullEventInclude(),
    });

    return this.transformEvent(event);
  }

  async reorderSongs(eventId: string, songIds: string[]) {
    // Check if event exists
    await this.findOne(eventId);

    // Update order for each song
    await Promise.all(
      songIds.map((songId, index) =>
        this.prisma.eventSong.update({
          where: {
            eventId_songId: { eventId, songId },
          },
          data: { order: index },
        }),
      ),
    );

    // Return updated event
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: this.fullEventInclude(),
    });

    return this.transformEvent(event);
  }

  // Unified reorder for both songs and blocks
  async reorderSetlist(eventId: string, items: { id: string; itemType: 'song' | 'block' }[]) {
    await this.findOne(eventId);

    await Promise.all(
      items.map((item, index) => {
        if (item.itemType === 'song') {
          return this.prisma.eventSong.update({
            where: { id: item.id },
            data: { order: index },
          });
        } else {
          return this.prisma.eventBlock.update({
            where: { id: item.id },
            data: { order: index },
          });
        }
      }),
    );

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: this.fullEventInclude(),
    });

    return this.transformEvent(event);
  }

  // Block CRUD
  async addBlock(eventId: string, dto: CreateBlockDto) {
    await this.findOne(eventId);

    const maxOrder = await this.getMaxOrder(eventId);

    await this.prisma.eventBlock.create({
      data: {
        eventId,
        type: dto.type,
        label: dto.label,
        durationMinutes: dto.durationMinutes,
        notes: dto.notes,
        order: maxOrder + 1,
      },
    });

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: this.fullEventInclude(),
    });

    return this.transformEvent(event);
  }

  async updateBlock(eventId: string, blockId: string, dto: UpdateBlockDto) {
    await this.findOne(eventId);

    const block = await this.prisma.eventBlock.findUnique({ where: { id: blockId } });
    if (!block || block.eventId !== eventId) {
      throw new NotFoundException('Bloque no encontrado');
    }

    await this.prisma.eventBlock.update({
      where: { id: blockId },
      data: dto,
    });

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: this.fullEventInclude(),
    });

    return this.transformEvent(event);
  }

  async removeBlock(eventId: string, blockId: string) {
    await this.findOne(eventId);

    const block = await this.prisma.eventBlock.findUnique({ where: { id: blockId } });
    if (!block || block.eventId !== eventId) {
      throw new NotFoundException('Bloque no encontrado');
    }

    await this.prisma.eventBlock.delete({ where: { id: blockId } });

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: this.fullEventInclude(),
    });

    return this.transformEvent(event);
  }
}
