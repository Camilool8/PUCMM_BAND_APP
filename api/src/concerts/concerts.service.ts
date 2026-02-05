import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConcertDto } from './dto/create-concert.dto';
import { UpdateConcertDto } from './dto/update-concert.dto';
import { CreateConcertBlockDto } from './dto/create-block.dto';
import { UpdateConcertBlockDto } from './dto/update-block.dto';

@Injectable()
export class ConcertsService {
  constructor(private prisma: PrismaService) {}

  // Common event select including visual properties and songs count
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

  // Common include for fetching a full concert with songs and blocks
  private fullConcertInclude() {
    return {
      event: { select: this.eventSelect },
      concertSongs: {
        include: this.songInclude,
        orderBy: { order: 'asc' as const },
      },
      concertBlocks: {
        orderBy: { order: 'asc' as const },
      },
      _count: {
        select: { concertSongs: true, assets: true, concertBlocks: true },
      },
    };
  }

  // Transform Prisma response to use 'songs' and 'setlistItems' for frontend
  private transformConcert(concert: any) {
    if (!concert) return concert;
    const { concertSongs, concertBlocks, _count, ...rest } = concert;

    const songs = concertSongs?.map((cs: any) => cs.song) || [];

    // Build unified setlist: songs + blocks, sorted by order
    const songItems = (concertSongs || []).map((cs: any) => ({
      id: cs.id,
      itemType: 'song' as const,
      order: cs.order,
      song: cs.song,
      block: null,
    }));

    const blockItems = (concertBlocks || []).map((cb: any) => ({
      id: cb.id,
      itemType: 'block' as const,
      order: cb.order,
      song: null,
      block: {
        id: cb.id,
        type: cb.type,
        label: cb.label,
        durationMinutes: cb.durationMinutes,
        notes: cb.notes,
      },
    }));

    const setlistItems = [...songItems, ...blockItems].sort((a, b) => a.order - b.order);

    return {
      ...rest,
      songs,
      setlistItems,
      _count: _count
        ? { songs: _count.concertSongs, assets: _count.assets, blocks: _count.concertBlocks }
        : undefined,
    };
  }

  // Get the max order across both songs and blocks for a concert
  private async getMaxOrder(concertId: string): Promise<number> {
    const [maxSongOrder, maxBlockOrder] = await Promise.all([
      this.prisma.concertSong.aggregate({ where: { concertId }, _max: { order: true } }),
      this.prisma.concertBlock.aggregate({ where: { concertId }, _max: { order: true } }),
    ]);
    return Math.max(maxSongOrder._max.order ?? -1, maxBlockOrder._max.order ?? -1);
  }

  async create(createConcertDto: CreateConcertDto) {
    const { songIds, eventId, date, ...concertData } = createConcertDto;

    // Verify event exists
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Evento con ID ${eventId} no encontrado`);
    }

    const concert = await this.prisma.concert.create({
      data: {
        ...concertData,
        date: new Date(date),
        event: { connect: { id: eventId } },
        concertSongs: songIds?.length
          ? {
              create: songIds.map((songId, index) => ({
                songId,
                order: index,
              })),
            }
          : undefined,
      },
      include: {
        ...this.fullConcertInclude(),
        assets: true,
      },
    });

    return this.transformConcert(concert);
  }

  async findAll() {
    const concerts = await this.prisma.concert.findMany({
      include: this.fullConcertInclude(),
      orderBy: { date: 'desc' },
    });

    return concerts.map((c) => this.transformConcert(c));
  }

  async findByEvent(eventId: string) {
    const concerts = await this.prisma.concert.findMany({
      where: { eventId },
      include: this.fullConcertInclude(),
      orderBy: { date: 'desc' },
    });

    return concerts.map((c) => this.transformConcert(c));
  }

  async findOne(id: string) {
    const concert = await this.prisma.concert.findUnique({
      where: { id },
      include: {
        ...this.fullConcertInclude(),
        assets: true,
      },
    });

    if (!concert) {
      throw new NotFoundException(`Concierto con ID ${id} no encontrado`);
    }

    return this.transformConcert(concert);
  }

  async update(id: string, updateConcertDto: UpdateConcertDto) {
    const { songIds, date, ...concertData } = updateConcertDto;

    // Check if concert exists
    const existing = await this.prisma.concert.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Concierto con ID ${id} no encontrado`);
    }

    // If songIds provided, recreate all concertSongs with order
    if (songIds !== undefined) {
      await this.prisma.concertSong.deleteMany({ where: { concertId: id } });
      await this.prisma.concertSong.createMany({
        data: songIds.map((songId, index) => ({
          concertId: id,
          songId,
          order: index,
        })),
      });
    }

    const concert = await this.prisma.concert.update({
      where: { id },
      data: {
        ...concertData,
        date: date ? new Date(date) : undefined,
      },
      include: this.fullConcertInclude(),
    });

    return this.transformConcert(concert);
  }

  async remove(id: string) {
    // Check if concert exists
    await this.findOne(id);

    return this.prisma.concert.delete({
      where: { id },
    });
  }

  async addSong(concertId: string, songId: string) {
    const existing = await this.prisma.concert.findUnique({
      where: { id: concertId },
    });
    if (!existing) {
      throw new NotFoundException(`Concierto con ID ${concertId} no encontrado`);
    }

    const song = await this.prisma.song.findUnique({ where: { id: songId } });
    if (!song) {
      throw new NotFoundException(`Canción con ID ${songId} no encontrada`);
    }

    const maxOrder = await this.getMaxOrder(concertId);

    await this.prisma.concertSong.create({
      data: {
        concertId,
        songId,
        order: maxOrder + 1,
      },
    });

    const concert = await this.prisma.concert.findUnique({
      where: { id: concertId },
      include: this.fullConcertInclude(),
    });

    return this.transformConcert(concert);
  }

  async addSongsBulk(concertId: string, songIds: string[]) {
    const existing = await this.prisma.concert.findUnique({
      where: { id: concertId },
    });
    if (!existing) {
      throw new NotFoundException(`Concierto con ID ${concertId} no encontrado`);
    }

    // Filter out songs already in concert
    const existingSongs = await this.prisma.concertSong.findMany({
      where: { concertId, songId: { in: songIds } },
      select: { songId: true },
    });
    const existingSet = new Set(existingSongs.map((e) => e.songId));
    const newSongIds = songIds.filter((id) => !existingSet.has(id));

    if (newSongIds.length > 0) {
      const startOrder = (await this.getMaxOrder(concertId)) + 1;
      await this.prisma.concertSong.createMany({
        data: newSongIds.map((songId, index) => ({
          concertId,
          songId,
          order: startOrder + index,
        })),
      });
    }

    const concert = await this.prisma.concert.findUnique({
      where: { id: concertId },
      include: this.fullConcertInclude(),
    });

    return this.transformConcert(concert);
  }

  async removeSong(concertId: string, songId: string) {
    const existing = await this.prisma.concert.findUnique({
      where: { id: concertId },
    });
    if (!existing) {
      throw new NotFoundException(`Concierto con ID ${concertId} no encontrado`);
    }

    await this.prisma.concertSong.delete({
      where: {
        concertId_songId: { concertId, songId },
      },
    });

    const concert = await this.prisma.concert.findUnique({
      where: { id: concertId },
      include: this.fullConcertInclude(),
    });

    return this.transformConcert(concert);
  }

  // Copy songs AND blocks from parent event to this concert
  async copyFromEvent(concertId: string) {
    const existing = await this.prisma.concert.findUnique({
      where: { id: concertId },
    });
    if (!existing) {
      throw new NotFoundException(`Concierto con ID ${concertId} no encontrado`);
    }

    // Get event's songs and blocks with their order
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

    // Delete existing concert songs and blocks
    await Promise.all([
      this.prisma.concertSong.deleteMany({ where: { concertId } }),
      this.prisma.concertBlock.deleteMany({ where: { concertId } }),
    ]);

    // Copy event songs and blocks to concert, preserving original order values
    await Promise.all([
      this.prisma.concertSong.createMany({
        data: eventSongs.map((es) => ({
          concertId,
          songId: es.songId,
          order: es.order,
        })),
      }),
      this.prisma.concertBlock.createMany({
        data: eventBlocks.map((eb) => ({
          concertId,
          type: eb.type,
          label: eb.label,
          durationMinutes: eb.durationMinutes,
          notes: eb.notes,
          order: eb.order,
        })),
      }),
    ]);

    const concert = await this.prisma.concert.findUnique({
      where: { id: concertId },
      include: {
        ...this.fullConcertInclude(),
        assets: true,
      },
    });

    return this.transformConcert(concert);
  }

  async reorderSongs(concertId: string, songIds: string[]) {
    const existing = await this.prisma.concert.findUnique({
      where: { id: concertId },
    });
    if (!existing) {
      throw new NotFoundException(`Concierto con ID ${concertId} no encontrado`);
    }

    await Promise.all(
      songIds.map((songId, index) =>
        this.prisma.concertSong.update({
          where: {
            concertId_songId: { concertId, songId },
          },
          data: { order: index },
        }),
      ),
    );

    const concert = await this.prisma.concert.findUnique({
      where: { id: concertId },
      include: this.fullConcertInclude(),
    });

    return this.transformConcert(concert);
  }

  // Unified reorder for both songs and blocks
  async reorderSetlist(concertId: string, items: { id: string; itemType: 'song' | 'block' }[]) {
    const existing = await this.prisma.concert.findUnique({
      where: { id: concertId },
    });
    if (!existing) {
      throw new NotFoundException(`Concierto con ID ${concertId} no encontrado`);
    }

    await Promise.all(
      items.map((item, index) => {
        if (item.itemType === 'song') {
          return this.prisma.concertSong.update({
            where: { id: item.id },
            data: { order: index },
          });
        } else {
          return this.prisma.concertBlock.update({
            where: { id: item.id },
            data: { order: index },
          });
        }
      }),
    );

    const concert = await this.prisma.concert.findUnique({
      where: { id: concertId },
      include: this.fullConcertInclude(),
    });

    return this.transformConcert(concert);
  }

  // Block CRUD
  async addBlock(concertId: string, dto: CreateConcertBlockDto) {
    const existing = await this.prisma.concert.findUnique({
      where: { id: concertId },
    });
    if (!existing) {
      throw new NotFoundException(`Concierto con ID ${concertId} no encontrado`);
    }

    const maxOrder = await this.getMaxOrder(concertId);

    await this.prisma.concertBlock.create({
      data: {
        concertId,
        type: dto.type,
        label: dto.label,
        durationMinutes: dto.durationMinutes,
        notes: dto.notes,
        order: maxOrder + 1,
      },
    });

    const concert = await this.prisma.concert.findUnique({
      where: { id: concertId },
      include: this.fullConcertInclude(),
    });

    return this.transformConcert(concert);
  }

  async updateBlock(concertId: string, blockId: string, dto: UpdateConcertBlockDto) {
    const existing = await this.prisma.concert.findUnique({
      where: { id: concertId },
    });
    if (!existing) {
      throw new NotFoundException(`Concierto con ID ${concertId} no encontrado`);
    }

    const block = await this.prisma.concertBlock.findUnique({ where: { id: blockId } });
    if (!block || block.concertId !== concertId) {
      throw new NotFoundException('Bloque no encontrado');
    }

    await this.prisma.concertBlock.update({
      where: { id: blockId },
      data: dto,
    });

    const concert = await this.prisma.concert.findUnique({
      where: { id: concertId },
      include: this.fullConcertInclude(),
    });

    return this.transformConcert(concert);
  }

  async removeBlock(concertId: string, blockId: string) {
    const existing = await this.prisma.concert.findUnique({
      where: { id: concertId },
    });
    if (!existing) {
      throw new NotFoundException(`Concierto con ID ${concertId} no encontrado`);
    }

    const block = await this.prisma.concertBlock.findUnique({ where: { id: blockId } });
    if (!block || block.concertId !== concertId) {
      throw new NotFoundException('Bloque no encontrado');
    }

    await this.prisma.concertBlock.delete({ where: { id: blockId } });

    const concert = await this.prisma.concert.findUnique({
      where: { id: concertId },
      include: this.fullConcertInclude(),
    });

    return this.transformConcert(concert);
  }
}
