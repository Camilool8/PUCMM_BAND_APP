import { Injectable, Logger } from '@nestjs/common';
import { KEY_MAP, MODE_MAP } from '../dto/resolve-link.dto';

interface ReccoBeatsTrack {
  tempo?: number;
  key?: number;
  mode?: number;
  energy?: number;
  danceability?: number;
  acousticness?: number;
  instrumentalness?: number;
  liveness?: number;
  loudness?: number;
  speechiness?: number;
  valence?: number;
}

@Injectable()
export class ReccoBeatsProvider {
  private readonly logger = new Logger(ReccoBeatsProvider.name);
  private readonly baseUrl = 'https://api.reccobeats.com/v1';

  /**
   * Get audio features for a Spotify track ID
   */
  async getAudioFeatures(spotifyId: string): Promise<ReccoBeatsTrack | null> {
    try {
      const response = await fetch(`${this.baseUrl}/track/${spotifyId}/audio-features`);

      if (!response.ok) {
        this.logger.warn(`ReccoBeats API returned ${response.status} for track ${spotifyId}`);
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      this.logger.error(`Error fetching ReccoBeats audio features: ${error.message}`);
      return null;
    }
  }

  /**
   * Search for a track and get its audio features
   */
  async searchAndGetFeatures(title: string, artist: string): Promise<ReccoBeatsTrack | null> {
    try {
      const query = encodeURIComponent(`${title} ${artist}`);
      const response = await fetch(`${this.baseUrl}/search?q=${query}&limit=1`);

      if (!response.ok) {
        this.logger.warn(`ReccoBeats search returned ${response.status}`);
        return null;
      }

      const data = await response.json();
      const tracks = data.tracks || data.items || [];

      if (tracks.length === 0) return null;

      const track = tracks[0];
      // If the search result includes audio features, return them
      if (track.tempo !== undefined) {
        return track;
      }

      // Otherwise, try to get features by ID
      if (track.id) {
        return this.getAudioFeatures(track.id);
      }

      return null;
    } catch (error) {
      this.logger.error(`Error searching ReccoBeats: ${error.message}`);
      return null;
    }
  }

  /**
   * Convert key number to human-readable key string
   * e.g., 0 + mode 1 = "C major", 9 + mode 0 = "A minor"
   */
  formatKey(keyNumber: number | undefined, mode: number | undefined): string | undefined {
    if (keyNumber === undefined || keyNumber < 0) return undefined;

    const keyName = KEY_MAP[keyNumber];
    if (!keyName) return undefined;

    const modeName = mode !== undefined ? MODE_MAP[mode] : undefined;
    return modeName ? `${keyName} ${modeName}` : keyName;
  }

  /**
   * Convert tempo to integer BPM
   */
  formatBpm(tempo: number | undefined): number | undefined {
    if (tempo === undefined) return undefined;
    return Math.round(tempo);
  }
}
