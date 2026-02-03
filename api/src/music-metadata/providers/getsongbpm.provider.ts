import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface GetSongBpmTrack {
  id: string;
  song_title: string;
  artist: {
    id: string;
    name: string;
  };
  tempo: string;
  time_sig: string;
  key_of: string;
  open_key: string;
  album?: {
    title: string;
    uri: string;
  };
}

@Injectable()
export class GetSongBpmProvider {
  private readonly logger = new Logger(GetSongBpmProvider.name);
  private readonly baseUrl = 'https://api.getsongbpm.com';

  constructor(private readonly configService: ConfigService) {}

  /**
   * Search for a song by title and artist
   * Note: This API requires an API key and attribution
   */
  async searchSong(title: string, artist: string): Promise<GetSongBpmTrack | null> {
    const apiKey = this.configService.get<string>('GETSONGBPM_API_KEY');

    if (!apiKey) {
      this.logger.debug('GetSongBPM API key not configured, skipping');
      return null;
    }

    try {
      // Search by combined query
      const query = encodeURIComponent(`${title} ${artist}`);
      const response = await fetch(
        `${this.baseUrl}/search/?api_key=${apiKey}&type=song&lookup=${query}`,
      );

      if (!response.ok) {
        this.logger.warn(`GetSongBPM API returned ${response.status}`);
        return null;
      }

      const data = await response.json();
      const tracks = data.search || [];

      if (tracks.length === 0) return null;

      // Find best match (simple title/artist comparison)
      const normalizedTitle = title.toLowerCase();
      const normalizedArtist = artist.toLowerCase();

      const bestMatch = tracks.find((track: GetSongBpmTrack) =>
        track.song_title?.toLowerCase().includes(normalizedTitle) ||
        normalizedTitle.includes(track.song_title?.toLowerCase()),
      ) || tracks[0];

      return bestMatch;
    } catch (error) {
      this.logger.error(`Error searching GetSongBPM: ${error.message}`);
      return null;
    }
  }

  /**
   * Get song details by ID
   */
  async getSongById(songId: string): Promise<GetSongBpmTrack | null> {
    const apiKey = this.configService.get<string>('GETSONGBPM_API_KEY');

    if (!apiKey) {
      return null;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/song/?api_key=${apiKey}&id=${songId}`,
      );

      if (!response.ok) {
        this.logger.warn(`GetSongBPM song fetch returned ${response.status}`);
        return null;
      }

      const data = await response.json();
      return data.song || null;
    } catch (error) {
      this.logger.error(`Error fetching GetSongBPM song: ${error.message}`);
      return null;
    }
  }

  /**
   * Extract BPM from GetSongBPM response
   */
  getBpm(track: GetSongBpmTrack): number | undefined {
    const tempo = parseInt(track.tempo, 10);
    return isNaN(tempo) ? undefined : tempo;
  }

  /**
   * Extract key from GetSongBPM response
   * Format: "A Major", "F# Minor", etc.
   */
  getKey(track: GetSongBpmTrack): string | undefined {
    if (!track.key_of) return undefined;
    return track.key_of;
  }
}
