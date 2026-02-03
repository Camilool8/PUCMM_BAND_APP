import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  // Transform event to include songs array from eventSongs junction
  private transformEvent(event: any) {
    if (!event) return event;
    const { eventSongs, _count, ...rest } = event;
    return {
      ...rest,
      songs: eventSongs?.map((es: any) => es.song) || [],
      _count: _count
        ? { songs: _count.eventSongs, concerts: _count.concerts }
        : undefined,
    };
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
      include: {
        eventSongs: {
          include: { song: true },
          orderBy: { order: 'asc' },
        },
        concerts: true,
        _count: {
          select: { eventSongs: true, concerts: true },
        },
      },
    });

    return this.transformEvent(event);
  }

  async findAll() {
    const events = await this.prisma.event.findMany({
      include: {
        _count: {
          select: { eventSongs: true, concerts: true },
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
      },
    }));
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        eventSongs: {
          include: { song: true },
          orderBy: { order: 'asc' },
        },
        concerts: {
          orderBy: { date: 'asc' },
        },
        _count: {
          select: { eventSongs: true, concerts: true },
        },
      },
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
      include: {
        eventSongs: {
          include: { song: true },
          orderBy: { order: 'asc' },
        },
        concerts: true,
        _count: {
          select: { eventSongs: true, concerts: true },
        },
      },
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

    // Get current max order
    const maxOrder = await this.prisma.eventSong.aggregate({
      where: { eventId },
      _max: { order: true },
    });

    // Create junction record with next order
    await this.prisma.eventSong.create({
      data: {
        eventId,
        songId,
        order: (maxOrder._max.order ?? -1) + 1,
      },
    });

    // Return updated event
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        eventSongs: {
          include: { song: true },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { eventSongs: true, concerts: true },
        },
      },
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
      include: {
        eventSongs: {
          include: { song: true },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { eventSongs: true, concerts: true },
        },
      },
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
      include: {
        eventSongs: {
          include: { song: true },
          orderBy: { order: 'asc' },
        },
        concerts: true,
        _count: {
          select: { eventSongs: true, concerts: true },
        },
      },
    });

    return this.transformEvent(event);
  }
}
