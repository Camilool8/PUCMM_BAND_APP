import { Injectable, Logger } from '@nestjs/common';
import { SongMetadata } from '../dto/resolve-link.dto';

interface ITunesTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName: string;
  artworkUrl100: string;
  trackTimeMillis: number;
  previewUrl: string;
  releaseDate: string;
  primaryGenreName: string;
  trackViewUrl: string;
}

interface ITunesSearchResponse {
  resultCount: number;
  results: ITunesTrack[];
}

@Injectable()
export class ITunesProvider {
  private readonly logger = new Logger(ITunesProvider.name);
  private readonly baseUrl = 'https://itunes.apple.com';

  /**
   * Search for a track by title and artist
   */
  async searchTrack(title: string, artist: string): Promise<ITunesTrack | null> {
    try {
      const query = encodeURIComponent(`${title} ${artist}`);
      const url = `${this.baseUrl}/search?term=${query}&media=music&entity=song&limit=5`;

      const response = await fetch(url);
      if (!response.ok) {
        this.logger.warn(`iTunes search failed: ${response.status}`);
        return null;
      }

      const data: ITunesSearchResponse = await response.json();

      if (data.resultCount === 0) {
        this.logger.debug(`No results for: ${title} - ${artist}`);
        return null;
      }

      // Find best match - prefer exact artist match
      const exactMatch = data.results.find(
        track => track.artistName.toLowerCase() === artist.toLowerCase()
      );

      return exactMatch || data.results[0];
    } catch (error) {
      this.logger.error(`iTunes search error: ${error.message}`);
      return null;
    }
  }

  /**
   * Lookup track by Apple Music ID
   */
  async lookupById(appleMusicId: string): Promise<ITunesTrack | null> {
    try {
      // Apple Music IDs from Odesli are in format like "1440818542"
      const url = `${this.baseUrl}/lookup?id=${appleMusicId}&entity=song`;

      const response = await fetch(url);
      if (!response.ok) {
        this.logger.warn(`iTunes lookup failed: ${response.status}`);
        return null;
      }

      const data: ITunesSearchResponse = await response.json();

      if (data.resultCount === 0) {
        return null;
      }

      return data.results[0];
    } catch (error) {
      this.logger.error(`iTunes lookup error: ${error.message}`);
      return null;
    }
  }

  /**
   * Convert iTunes track to our SongMetadata format
   */
  toSongMetadata(track: ITunesTrack): SongMetadata {
    return {
      title: track.trackName,
      artist: track.artistName,
      album: track.collectionName,
      // Get higher resolution artwork (replace 100x100 with 600x600)
      coverUrl: track.artworkUrl100?.replace('100x100bb', '600x600bb'),
      durationMs: track.trackTimeMillis,
      releaseDate: track.releaseDate,
      previewUrl: track.previewUrl,
      genre: track.primaryGenreName,
      // iTunes doesn't provide BPM or key - will use ReccoBeats if we have Spotify ID
      bpm: undefined,
      key: undefined,
      isrc: undefined,
    };
  }

  /**
   * Get high-resolution artwork URL
   */
  getHighResArtwork(artworkUrl: string, size: number = 600): string {
    return artworkUrl.replace(/\d+x\d+bb/, `${size}x${size}bb`);
  }
}
