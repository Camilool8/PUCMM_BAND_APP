import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ConcertMetadata {
  id: string;
  eventName: string;
  date: string;
  location: string | null;
  bannerUrl: string | null;
}

export interface EventMetadata {
  id: string;
  name: string;
  description: string | null;
  bannerUrl: string | null;
  iconName: string | null;
}

export interface SongMetadata {
  id: string;
  title: string;
  artist: string;
  coverUrl: string | null;
  genre: string | null;
}

@Injectable()
export class PublicMetadataService {
  constructor(private prisma: PrismaService) {}

  async getConcertMetadata(id: string): Promise<ConcertMetadata> {
    const concert = await this.prisma.concert.findUnique({
      where: { id },
      select: {
        id: true,
        date: true,
        location: true,
        event: {
          select: {
            name: true,
            bannerUrl: true,
          },
        },
      },
    });

    if (!concert) {
      throw new NotFoundException('Concert not found');
    }

    return {
      id: concert.id,
      eventName: concert.event.name,
      date: concert.date.toISOString(),
      location: concert.location,
      bannerUrl: concert.event.bannerUrl,
    };
  }

  async getEventMetadata(id: string): Promise<EventMetadata> {
    const event = await this.prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        bannerUrl: true,
        iconName: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return {
      id: event.id,
      name: event.name,
      description: event.description,
      bannerUrl: event.bannerUrl,
      iconName: event.iconName,
    };
  }

  async getSongMetadata(id: string): Promise<SongMetadata> {
    const song = await this.prisma.song.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        artist: true,
        coverUrl: true,
        genre: true,
      },
    });

    if (!song) {
      throw new NotFoundException('Song not found');
    }

    return {
      id: song.id,
      title: song.title,
      artist: song.artist,
      coverUrl: song.coverUrl,
      genre: song.genre,
    };
  }
}
