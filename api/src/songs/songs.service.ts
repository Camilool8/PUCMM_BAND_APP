import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
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
        genre: createSongDto.genre,
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
        _count: {
          select: { votes: true },
        },
      },
    });
  }

  async findAll() {
    const songs = await this.prisma.song.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        suggestedBy: {
          select: { id: true, name: true, avatarUrl: true },
        },
        leadVocals: {
          select: { id: true, name: true, avatarUrl: true },
        },
        eventSongs: {
          include: {
            event: {
              select: { id: true, name: true, iconName: true },
            },
          },
        },
        _count: {
          select: { votes: true },
        },
      },
    });
    return this.enrichWithGoldenCounts(songs);
  }

  async findOne(id: string) {
    const song = await this.prisma.song.findUnique({
      where: { id },
      include: {
        versions: true,
        assets: true,
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
        votes: {
          select: {
            userId: true,
            isGolden: true,
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
        _count: {
          select: { votes: true },
        },
      },
    });
    if (!song) return null;
    const [enriched] = await this.enrichWithGoldenCounts([song]);
    return enriched;
  }

  update(id: string, updateSongDto: UpdateSongDto) {
    return this.prisma.song.update({
      where: { id },
      data: updateSongDto,
      include: {
        suggestedBy: {
          select: { id: true, name: true, avatarUrl: true },
        },
        leadVocals: {
          select: { id: true, name: true, avatarUrl: true },
        },
        _count: {
          select: { votes: true },
        },
      },
    });
  }

  remove(id: string) {
    return this.prisma.song.delete({
      where: { id },
    });
  }

  // ============================================================================
  // Voting System
  // ============================================================================

  async addVote(songId: string, userId: string) {
    // Check if user already voted
    const existingVote = await this.prisma.songVote.findUnique({
      where: {
        userId_songId: { userId, songId },
      },
    });

    if (existingVote) {
      throw new ConflictException('Ya votaste por esta canción');
    }

    await this.prisma.songVote.create({
      data: {
        userId,
        songId,
      },
    });

    // Return updated vote count
    const song = await this.prisma.song.findUnique({
      where: { id: songId },
      include: {
        _count: { select: { votes: true } },
      },
    });

    return { voteCount: song?._count.votes || 0 };
  }

  async removeVote(songId: string, userId: string) {
    try {
      await this.prisma.songVote.delete({
        where: {
          userId_songId: { userId, songId },
        },
      });
    } catch {
      throw new NotFoundException('No has votado por esta canción');
    }

    // Return updated vote count
    const song = await this.prisma.song.findUnique({
      where: { id: songId },
      include: {
        _count: { select: { votes: true } },
      },
    });

    return { voteCount: song?._count.votes || 0 };
  }

  async getUserVotes(userId: string) {
    const votes = await this.prisma.songVote.findMany({
      where: { userId },
      select: { songId: true, isGolden: true },
    });
    return votes;
  }

  // ============================================================================
  // Golden Vote
  // ============================================================================

  async addGoldenVote(songId: string, userId: string) {
    // Remove any existing golden vote by this user (only one allowed)
    await this.prisma.songVote.updateMany({
      where: { userId, isGolden: true },
      data: { isGolden: false },
    });

    // Check if user already has a normal vote on this song
    const existingVote = await this.prisma.songVote.findUnique({
      where: { userId_songId: { userId, songId } },
    });

    if (existingVote) {
      // Upgrade existing vote to golden
      await this.prisma.songVote.update({
        where: { id: existingVote.id },
        data: { isGolden: true },
      });
    } else {
      // Create new golden vote
      await this.prisma.songVote.create({
        data: { userId, songId, isGolden: true },
      });
    }

    return this.getVoteCounts(songId);
  }

  async removeGoldenVote(songId: string, userId: string) {
    const vote = await this.prisma.songVote.findUnique({
      where: { userId_songId: { userId, songId } },
    });

    if (!vote || !vote.isGolden) {
      throw new NotFoundException('No tienes un voto dorado en esta cancion');
    }

    // Downgrade to normal vote instead of removing entirely
    await this.prisma.songVote.update({
      where: { id: vote.id },
      data: { isGolden: false },
    });

    return this.getVoteCounts(songId);
  }

  private async getVoteCounts(songId: string) {
    const [totalVotes, goldenVotes] = await Promise.all([
      this.prisma.songVote.count({ where: { songId } }),
      this.prisma.songVote.count({ where: { songId, isGolden: true } }),
    ]);
    return { voteCount: totalVotes, goldenVoteCount: goldenVotes };
  }

  private async enrichWithGoldenCounts(songs: any[]) {
    const songIds = songs.map(s => s.id);
    if (songIds.length === 0) return songs;

    const goldenCounts = await this.prisma.songVote.groupBy({
      by: ['songId'],
      where: { songId: { in: songIds }, isGolden: true },
      _count: true,
    });
    const goldenMap = new Map(goldenCounts.map(g => [g.songId, g._count]));
    return songs.map(s => ({
      ...s,
      _count: {
        ...s._count,
        goldenVotes: goldenMap.get(s.id) || 0,
      },
    }));
  }

  // ============================================================================
  // Lead Vocals
  // ============================================================================

  async setLeadVocals(songId: string, userIds: string[]) {
    return this.prisma.song.update({
      where: { id: songId },
      data: {
        leadVocals: {
          set: userIds.map(id => ({ id })),
        },
      },
      include: {
        leadVocals: {
          select: { id: true, name: true, avatarUrl: true, instruments: true },
        },
        suggestedBy: {
          select: { id: true, name: true, avatarUrl: true },
        },
        _count: {
          select: { votes: true },
        },
      },
    });
  }

  async addLeadVocal(songId: string, userId: string) {
    return this.prisma.song.update({
      where: { id: songId },
      data: {
        leadVocals: {
          connect: { id: userId },
        },
      },
      include: {
        leadVocals: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });
  }

  async removeLeadVocal(songId: string, userId: string) {
    return this.prisma.song.update({
      where: { id: songId },
      data: {
        leadVocals: {
          disconnect: { id: userId },
        },
      },
      include: {
        leadVocals: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });
  }

  // ============================================================================
  // Duplicate Detection
  // ============================================================================

  async checkDuplicate(title: string, artist: string, isrc?: string) {
    // First check by ISRC if provided (most accurate)
    if (isrc) {
      const byIsrc = await this.prisma.song.findUnique({
        where: { isrc },
        select: {
          id: true,
          title: true,
          artist: true,
          coverUrl: true,
          status: true,
        },
      });
      if (byIsrc) {
        return { isDuplicate: true, existingSong: byIsrc, matchedBy: 'isrc' };
      }
    }

    // Then check by title + artist (case insensitive)
    const byTitleArtist = await this.prisma.song.findFirst({
      where: {
        AND: [
          { title: { equals: title, mode: 'insensitive' } },
          { artist: { equals: artist, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        title: true,
        artist: true,
        coverUrl: true,
        status: true,
      },
    });

    if (byTitleArtist) {
      return { isDuplicate: true, existingSong: byTitleArtist, matchedBy: 'title_artist' };
    }

    return { isDuplicate: false };
  }
}
