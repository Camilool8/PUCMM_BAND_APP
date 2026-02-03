import { Injectable, Logger } from '@nestjs/common';
import { OdesliResponse } from '../dto/resolve-link.dto';

@Injectable()
export class OdesliProvider {
  private readonly logger = new Logger(OdesliProvider.name);
  private readonly baseUrl = 'https://api.song.link/v1-alpha.1/links';

  /**
   * Resolves any music link (YouTube, Spotify, Apple Music, etc.) to get
   * cross-platform links and basic metadata.
   */
  async resolveLink(url: string): Promise<OdesliResponse | null> {
    try {
      const encodedUrl = encodeURIComponent(url);
      const response = await fetch(`${this.baseUrl}?url=${encodedUrl}`);

      if (!response.ok) {
        this.logger.warn(`Odesli API returned ${response.status} for URL: ${url}`);
        return null;
      }

      const data: OdesliResponse = await response.json();
      return data;
    } catch (error) {
      this.logger.error(`Error resolving link with Odesli: ${error.message}`);
      return null;
    }
  }

  /**
   * Extract Spotify track ID from Odesli response
   */
  getSpotifyId(odesliData: OdesliResponse): string | null {
    const spotifyLink = odesliData.linksByPlatform?.spotify;
    if (!spotifyLink) return null;

    const entityId = spotifyLink.entityUniqueId;
    // Format: SPOTIFY_SONG::trackId
    if (entityId?.startsWith('SPOTIFY_SONG::')) {
      return entityId.replace('SPOTIFY_SONG::', '');
    }

    // Try to extract from URL
    const match = spotifyLink.url?.match(/track\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  }

  /**
   * Extract YouTube video ID from Odesli response
   */
  getYouTubeId(odesliData: OdesliResponse): string | null {
    const youtubeLink = odesliData.linksByPlatform?.youtube || odesliData.linksByPlatform?.youtubeMusic;
    if (!youtubeLink) return null;

    const entityId = youtubeLink.entityUniqueId;
    // Format: YOUTUBE_VIDEO::videoId
    if (entityId?.startsWith('YOUTUBE_VIDEO::')) {
      return entityId.replace('YOUTUBE_VIDEO::', '');
    }

    // Try to extract from URL
    const match = youtubeLink.url?.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  }

  /**
   * Extract Apple Music ID from Odesli response
   */
  getAppleMusicId(odesliData: OdesliResponse): string | null {
    const appleMusicLink = odesliData.linksByPlatform?.appleMusic;
    if (!appleMusicLink) return null;

    const entityId = appleMusicLink.entityUniqueId;
    // Format: ITUNES_SONG::trackId
    if (entityId?.startsWith('ITUNES_SONG::')) {
      return entityId.replace('ITUNES_SONG::', '');
    }

    return null;
  }

  /**
   * Get basic metadata from Odesli response (fallback when Spotify isn't available)
   */
  getBasicMetadata(odesliData: OdesliResponse): { title?: string; artist?: string; thumbnailUrl?: string } {
    const entities = Object.values(odesliData.entitiesByUniqueId || {});
    const entity = entities.find(e => e.title && e.artistName) || entities[0];

    return {
      title: entity?.title,
      artist: entity?.artistName,
      thumbnailUrl: entity?.thumbnailUrl,
    };
  }
}
