import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConcertDto } from './dto/create-concert.dto';
import { UpdateConcertDto } from './dto/update-concert.dto';

@Injectable()
export class ConcertsService {
  constructor(private prisma: PrismaService) {}

  // Transform Prisma response to use 'songs' instead of 'concertSongs' for frontend consistency
  private transformConcert(concert: any) {
    if (!concert) return concert;
    const { concertSongs, _count, ...rest } = concert;
    return {
      ...rest,
      songs: concertSongs?.map((cs: any) => cs.song) || [],
      _count: _count
        ? { songs: _count.concertSongs, assets: _count.assets }
        : undefined,
    };
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
        event: {
          select: { id: true, name: true },
        },
        concertSongs: {
          include: { song: true },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { concertSongs: true, assets: true },
        },
      },
    });

    return this.transformConcert(concert);
  }

  async findAll() {
    const concerts = await this.prisma.concert.findMany({
      include: {
        event: {
          select: { id: true, name: true },
        },
        concertSongs: {
          include: { song: true },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { concertSongs: true, assets: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    return concerts.map((c) => this.transformConcert(c));
  }

  async findByEvent(eventId: string) {
    const concerts = await this.prisma.concert.findMany({
      where: { eventId },
      include: {
        concertSongs: {
          include: { song: true },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { concertSongs: true, assets: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    return concerts.map((c) => this.transformConcert(c));
  }

  async findOne(id: string) {
    const concert = await this.prisma.concert.findUnique({
      where: { id },
      include: {
        event: {
          select: { id: true, name: true },
        },
        concertSongs: {
          include: { song: true },
          orderBy: { order: 'asc' },
        },
        assets: true,
        _count: {
          select: { concertSongs: true, assets: true },
        },
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
      include: {
        event: {
          select: { id: true, name: true },
        },
        concertSongs: {
          include: { song: true },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { concertSongs: true, assets: true },
        },
      },
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
    // Check if concert exists
    const existing = await this.prisma.concert.findUnique({
      where: { id: concertId },
    });
    if (!existing) {
      throw new NotFoundException(`Concierto con ID ${concertId} no encontrado`);
    }

    // Check if song exists
    const song = await this.prisma.song.findUnique({ where: { id: songId } });
    if (!song) {
      throw new NotFoundException(`Canción con ID ${songId} no encontrada`);
    }

    // Get current max order
    const maxOrder = await this.prisma.concertSong.aggregate({
      where: { concertId },
      _max: { order: true },
    });

    // Create junction record with next order
    await this.prisma.concertSong.create({
      data: {
        concertId,
        songId,
        order: (maxOrder._max.order ?? -1) + 1,
      },
    });

    // Return updated concert
    const concert = await this.prisma.concert.findUnique({
      where: { id: concertId },
      include: {
        event: {
          select: { id: true, name: true },
        },
        concertSongs: {
          include: { song: true },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { concertSongs: true, assets: true },
        },
      },
    });

    return this.transformConcert(concert);
  }

  async removeSong(concertId: string, songId: string) {
    // Check if concert exists
    const existing = await this.prisma.concert.findUnique({
      where: { id: concertId },
    });
    if (!existing) {
      throw new NotFoundException(`Concierto con ID ${concertId} no encontrado`);
    }

    // Delete the junction record
    await this.prisma.concertSong.delete({
      where: {
        concertId_songId: { concertId, songId },
      },
    });

    // Return updated concert
    const concert = await this.prisma.concert.findUnique({
      where: { id: concertId },
      include: {
        event: {
          select: { id: true, name: true },
        },
        concertSongs: {
          include: { song: true },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { concertSongs: true, assets: true },
        },
      },
    });

    return this.transformConcert(concert);
  }

  // Copy songs from parent event to this concert
  async copyFromEvent(concertId: string) {
    const existing = await this.prisma.concert.findUnique({
      where: { id: concertId },
    });
    if (!existing) {
      throw new NotFoundException(`Concierto con ID ${concertId} no encontrado`);
    }

    // Get event's songs with their order
    const eventSongs = await this.prisma.eventSong.findMany({
      where: { eventId: existing.eventId },
      orderBy: { order: 'asc' },
    });

    // Delete existing concert songs
    await this.prisma.concertSong.deleteMany({ where: { concertId } });

    // Copy event songs to concert maintaining order
    await this.prisma.concertSong.createMany({
      data: eventSongs.map((es, index) => ({
        concertId,
        songId: es.songId,
        order: index,
      })),
    });

    // Return updated concert
    const concert = await this.prisma.concert.findUnique({
      where: { id: concertId },
      include: {
        event: {
          select: { id: true, name: true },
        },
        concertSongs: {
          include: { song: true },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { concertSongs: true, assets: true },
        },
      },
    });

    return this.transformConcert(concert);
  }

  async reorderSongs(concertId: string, songIds: string[]) {
    // Check if concert exists
    const existing = await this.prisma.concert.findUnique({
      where: { id: concertId },
    });
    if (!existing) {
      throw new NotFoundException(`Concierto con ID ${concertId} no encontrado`);
    }

    // Update order for each song
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

    // Return updated concert
    const concert = await this.prisma.concert.findUnique({
      where: { id: concertId },
      include: {
        event: {
          select: { id: true, name: true },
        },
        concertSongs: {
          include: { song: true },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { concertSongs: true, assets: true },
        },
      },
    });

    return this.transformConcert(concert);
  }
}
