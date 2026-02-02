import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(createEventDto: CreateEventDto) {
    const { songIds, ...eventData } = createEventDto;

    return this.prisma.event.create({
      data: {
        ...eventData,
        songs: songIds?.length
          ? { connect: songIds.map((id) => ({ id })) }
          : undefined,
      },
      include: {
        songs: true,
        concerts: true,
        _count: {
          select: { songs: true, concerts: true },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.event.findMany({
      include: {
        _count: {
          select: { songs: true, concerts: true },
        },
        concerts: {
          orderBy: { date: 'asc' },
          take: 1,
          select: { date: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        songs: {
          orderBy: { title: 'asc' },
        },
        concerts: {
          orderBy: { date: 'asc' },
        },
        _count: {
          select: { songs: true, concerts: true },
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`Evento con ID ${id} no encontrado`);
    }

    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    const { songIds, ...eventData } = updateEventDto;

    // Check if event exists
    await this.findOne(id);

    return this.prisma.event.update({
      where: { id },
      data: {
        ...eventData,
        // If songIds is provided, replace all song connections
        songs: songIds !== undefined
          ? { set: songIds.map((id) => ({ id })) }
          : undefined,
      },
      include: {
        songs: true,
        concerts: true,
        _count: {
          select: { songs: true, concerts: true },
        },
      },
    });
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

    return this.prisma.event.update({
      where: { id: eventId },
      data: {
        songs: { connect: { id: songId } },
      },
      include: {
        songs: true,
        _count: {
          select: { songs: true, concerts: true },
        },
      },
    });
  }

  async removeSong(eventId: string, songId: string) {
    // Check if event exists
    await this.findOne(eventId);

    return this.prisma.event.update({
      where: { id: eventId },
      data: {
        songs: { disconnect: { id: songId } },
      },
      include: {
        songs: true,
        _count: {
          select: { songs: true, concerts: true },
        },
      },
    });
  }
}
