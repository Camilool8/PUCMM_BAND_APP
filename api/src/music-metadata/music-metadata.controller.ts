import { Controller, Post, Body, UseGuards, Get, Query } from '@nestjs/common';
import { MusicMetadataService } from './music-metadata.service';
import { ResolveLinkDto } from './dto/resolve-link.dto';
import { AzureAdGuard } from '../auth/azure-ad.guard';

@Controller('music-metadata')
@UseGuards(AzureAdGuard)
export class MusicMetadataController {
  constructor(private readonly musicMetadataService: MusicMetadataService) {}

  /**
   * Resolve a music link and return metadata
   * Accepts URLs from Spotify, YouTube, Apple Music, and other platforms
   */
  @Post('resolve')
  async resolveLink(@Body() resolveLinkDto: ResolveLinkDto) {
    const metadata = await this.musicMetadataService.resolveLink(resolveLinkDto.url);
    return {
      success: true,
      metadata,
    };
  }

  /**
   * Search for a song by title and artist
   * Fallback when user doesn't have a link
   */
  @Get('search')
  async searchSong(
    @Query('title') title: string,
    @Query('artist') artist: string,
  ) {
    if (!title || !artist) {
      return {
        success: false,
        error: 'Se requiere título y artista',
      };
    }

    const metadata = await this.musicMetadataService.searchSong(title, artist);

    if (!metadata) {
      return {
        success: false,
        error: 'No se encontró la canción',
      };
    }

    return {
      success: true,
      metadata,
    };
  }

  /**
   * Detect the platform from a URL
   */
  @Post('detect-platform')
  detectPlatform(@Body() body: { url: string }) {
    const platform = this.musicMetadataService.detectPlatform(body.url);
    return {
      platform,
      supported: platform !== 'unknown',
    };
  }
}
