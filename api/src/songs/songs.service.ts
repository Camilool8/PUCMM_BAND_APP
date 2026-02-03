import { Injectable } from '@nestjs/common';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SongsService {
  constructor(private prisma: PrismaService) {}

  create(createSongDto: CreateSongDto, suggestedById?: string) {
    return this.prisma.song.create({
      data: {
        title: createSongDto.title,
        artist: createSongDto.artist,
        bpm: createSongDto.bpm,
        key: createSongDto.key,
        isrc: createSongDto.isrc,
        coverUrl: createSongDto.coverUrl,
        durationMs: createSongDto.durationMs,
        releaseDate: createSongDto.releaseDate ? new Date(createSongDto.releaseDate) : undefined,
        status: createSongDto.status,
        spotifyUrl: createSongDto.spotifyUrl,
        youtubeUrl: createSongDto.youtubeUrl,
        appleMusicUrl: createSongDto.appleMusicUrl,
        suggestedBy: suggestedById ? { connect: { id: suggestedById } } : undefined,
      },
      include: {
        suggestedBy: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });
  }

  findAll() {
    return this.prisma.song.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        suggestedBy: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });
  }

  findOne(id: string) {
    return this.prisma.song.findUnique({
      where: { id },
      include: {
        versions: true,
        assets: true,
        suggestedBy: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });
  }

  update(id: string, updateSongDto: UpdateSongDto) {
    return this.prisma.song.update({
      where: { id },
      data: updateSongDto,
    });
  }

  remove(id: string) {
    return this.prisma.song.delete({
      where: { id },
    });
  }
}