import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SpotifyTrack, SongMetadata } from '../dto/resolve-link.dto';

@Injectable()
export class SpotifyProvider {
  private readonly logger = new Logger(SpotifyProvider.name);
  private readonly authUrl = 'https://accounts.spotify.com/api/token';
  private readonly apiUrl = 'https://api.spotify.com/v1';

  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(private readonly configService: ConfigService) {}

  /**
   * Get access token using Client Credentials flow
   * Public to allow service to check if Spotify is available
   */
  async getAccessToken(): Promise<string | null> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const clientId = this.configService.get<string>('SPOTIFY_CLIENT_ID');
    const clientSecret = this.configService.get<string>('SPOTIFY_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      this.logger.warn('Spotify credentials not configured');
      return null;
    }

    try {
      const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

      const response = await fetch(this.authUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });

      if (!response.ok) {
        this.logger.error(`Spotify auth failed: ${response.status}`);
        return null;
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      // Set expiry 5 minutes before actual expiry for safety
      this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

      return this.accessToken;
    } catch (error) {
      this.logger.error(`Error getting Spotify access token: ${error.message}`);
      return null;
    }
  }

  /**
   * Get track metadata from Spotify
   */
  async getTrack(trackId: string): Promise<SpotifyTrack | null> {
    const token = await this.getAccessToken();
    if (!token) return null;

    try {
      const response = await fetch(`${this.apiUrl}/tracks/${trackId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        this.logger.warn(`Spotify track fetch failed: ${response.status} for track ${trackId}`);
        return null;
      }

      const data: SpotifyTrack = await response.json();
      return data;
    } catch (error) {
      this.logger.error(`Error fetching Spotify track: ${error.message}`);
      return null;
    }
  }

  /**
   * Search for a track on Spotify
   */
  async searchTrack(query: string): Promise<SpotifyTrack | null> {
    const token = await this.getAccessToken();
    if (!token) return null;

    try {
      const encodedQuery = encodeURIComponent(query);
      const response = await fetch(
        `${this.apiUrl}/search?q=${encodedQuery}&type=track&limit=1`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        this.logger.warn(`Spotify search failed: ${response.status}`);
        return null;
      }

      const data = await response.json();
      const tracks = data.tracks?.items;
      return tracks?.length > 0 ? tracks[0] : null;
    } catch (error) {
      this.logger.error(`Error searching Spotify: ${error.message}`);
      return null;
    }
  }

  /**
   * Convert Spotify track to our SongMetadata format
   */
  toSongMetadata(track: SpotifyTrack): Partial<SongMetadata> {
    // Get the largest cover image
    const coverImage = track.album.images?.sort((a, b) => b.width - a.width)[0];

    return {
      title: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      album: track.album.name,
      coverUrl: coverImage?.url,
      durationMs: track.duration_ms,
      releaseDate: track.album.release_date,
      isrc: track.external_ids?.isrc,
      spotifyId: track.id,
      previewUrl: track.preview_url,
    };
  }

  /**
   * Extract Spotify track ID from URL
   */
  extractTrackId(url: string): string | null {
    // Patterns:
    // https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC
    // spotify:track:4uLU6hMCjMI75M1A2tKUQC
    const patterns = [
      /spotify\.com\/track\/([a-zA-Z0-9]+)/,
      /spotify:track:([a-zA-Z0-9]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return null;
  }
}
