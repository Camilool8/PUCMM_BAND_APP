import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { OdesliProvider } from './providers/odesli.provider';
import { SpotifyProvider } from './providers/spotify.provider';
import { ITunesProvider } from './providers/itunes.provider';
import { ReccoBeatsProvider } from './providers/reccobeats.provider';
import { GetSongBpmProvider } from './providers/getsongbpm.provider';
import { SongMetadata } from './dto/resolve-link.dto';

@Injectable()
export class MusicMetadataService {
  private readonly logger = new Logger(MusicMetadataService.name);
  private spotifyAvailable = false;

  constructor(
    private readonly odesliProvider: OdesliProvider,
    private readonly spotifyProvider: SpotifyProvider,
    private readonly iTunesProvider: ITunesProvider,
    private readonly reccoBeatsProvider: ReccoBeatsProvider,
    private readonly getSongBpmProvider: GetSongBpmProvider,
  ) {
    // Check if Spotify credentials are configured
    this.checkSpotifyAvailability();
  }

  private async checkSpotifyAvailability() {
    try {
      // Try to get a token to verify credentials are valid
      const token = await this.spotifyProvider.getAccessToken();
      this.spotifyAvailable = !!token;
      if (this.spotifyAvailable) {
        this.logger.log('Spotify API available - will use for enhanced metadata');
      } else {
        this.logger.log('Spotify API not configured - using iTunes as primary source');
      }
    } catch {
      this.spotifyAvailable = false;
      this.logger.log('Spotify API not configured - using iTunes as primary source');
    }
  }

  /**
   * Detect the platform from a URL
   */
  detectPlatform(url: string): 'spotify' | 'youtube' | 'apple_music' | 'unknown' {
    const lowercaseUrl = url.toLowerCase();

    if (lowercaseUrl.includes('spotify.com') || lowercaseUrl.startsWith('spotify:')) {
      return 'spotify';
    }
    if (lowercaseUrl.includes('youtube.com') || lowercaseUrl.includes('youtu.be') || lowercaseUrl.includes('music.youtube.com')) {
      return 'youtube';
    }
    if (lowercaseUrl.includes('music.apple.com') || lowercaseUrl.includes('itunes.apple.com')) {
      return 'apple_music';
    }

    return 'unknown';
  }

  /**
   * Resolve a music link and fetch all available metadata
   * Uses iTunes as primary source (no auth required)
   * Falls back to Spotify if credentials are available
   */
  async resolveLink(url: string): Promise<SongMetadata> {
    const platform = this.detectPlatform(url);
    this.logger.log(`Resolving ${platform} link: ${url}`);

    let spotifyId: string | null = null;
    let appleMusicId: string | null = null;
    let metadata: Partial<SongMetadata> = {};

    // Step 1: Extract IDs based on platform
    if (platform === 'spotify') {
      spotifyId = this.spotifyProvider.extractTrackId(url);
    }

    // Step 2: Use Odesli to resolve any link to get cross-platform IDs
    const odesliData = await this.odesliProvider.resolveLink(url);

    if (odesliData) {
      spotifyId = spotifyId || this.odesliProvider.getSpotifyId(odesliData);
      appleMusicId = this.odesliProvider.getAppleMusicId(odesliData);

      // Store platform IDs
      metadata.youtubeId = this.odesliProvider.getYouTubeId(odesliData) || undefined;
      metadata.appleMusicId = appleMusicId || undefined;
      metadata.spotifyId = spotifyId || undefined;

      // Get basic metadata from Odesli as initial fallback
      const basicMetadata = this.odesliProvider.getBasicMetadata(odesliData);
      metadata.title = basicMetadata.title;
      metadata.artist = basicMetadata.artist;
      metadata.coverUrl = basicMetadata.thumbnailUrl;
    }

    // Step 3: Try iTunes for full metadata (FREE, no auth needed)
    let iTunesTrack: Awaited<ReturnType<typeof this.iTunesProvider.lookupById>> = null;

    // First try lookup by Apple Music ID if available
    if (appleMusicId) {
      iTunesTrack = await this.iTunesProvider.lookupById(appleMusicId);
    }

    // If no iTunes track yet, search by title/artist from Odesli
    if (!iTunesTrack && metadata.title && metadata.artist) {
      iTunesTrack = await this.iTunesProvider.searchTrack(metadata.title, metadata.artist);
    }

    // Merge iTunes metadata if found
    if (iTunesTrack) {
      const iTunesMetadata = this.iTunesProvider.toSongMetadata(iTunesTrack);
      metadata = { ...metadata, ...iTunesMetadata };
      this.logger.debug(`Got iTunes metadata for "${metadata.title}"`);
    }

    // Step 4: If Spotify is available, try to get enhanced metadata
    if (this.spotifyAvailable && spotifyId) {
      const spotifyTrack = await this.spotifyProvider.getTrack(spotifyId);
      if (spotifyTrack) {
        const spotifyMetadata = this.spotifyProvider.toSongMetadata(spotifyTrack);
        // Merge Spotify data (has ISRC, better cover quality sometimes)
        metadata.isrc = metadata.isrc || spotifyMetadata.isrc;
        // Prefer Spotify cover if iTunes doesn't have one
        metadata.coverUrl = metadata.coverUrl || spotifyMetadata.coverUrl;
      }
    }

    // Step 5: If we still don't have basic metadata, fail
    if (!metadata.title || !metadata.artist) {
      throw new BadRequestException(
        'No se pudo extraer información de la canción. Verifica que el enlace sea válido.',
      );
    }

    // Step 6: Try to get audio features (BPM, key) from ReccoBeats if we have Spotify ID
    if (spotifyId) {
      const audioFeatures = await this.reccoBeatsProvider.getAudioFeatures(spotifyId);
      if (audioFeatures) {
        metadata.bpm = this.reccoBeatsProvider.formatBpm(audioFeatures.tempo);
        metadata.key = this.reccoBeatsProvider.formatKey(audioFeatures.key, audioFeatures.mode);
      }
    }

    // Step 7: Fallback to GetSongBPM if we don't have BPM/key
    if (!metadata.bpm && metadata.title && metadata.artist) {
      const getSongBpmTrack = await this.getSongBpmProvider.searchSong(
        metadata.title,
        metadata.artist,
      );
      if (getSongBpmTrack) {
        metadata.bpm = metadata.bpm || this.getSongBpmProvider.getBpm(getSongBpmTrack);
        metadata.key = metadata.key || this.getSongBpmProvider.getKey(getSongBpmTrack);
      }
    }

    this.logger.log(`Resolved metadata for "${metadata.title}" by ${metadata.artist}`);

    return metadata as SongMetadata;
  }

  /**
   * Search for a song by title and artist (fallback when link resolution fails)
   * Uses iTunes as primary source (FREE, no auth required)
   */
  async searchSong(title: string, artist: string): Promise<SongMetadata | null> {
    // Search on iTunes first (no auth required)
    const iTunesTrack = await this.iTunesProvider.searchTrack(title, artist);

    if (iTunesTrack) {
      const metadata = this.iTunesProvider.toSongMetadata(iTunesTrack);

      // Try GetSongBPM for BPM/key
      const getSongBpmTrack = await this.getSongBpmProvider.searchSong(title, artist);
      if (getSongBpmTrack) {
        metadata.bpm = this.getSongBpmProvider.getBpm(getSongBpmTrack);
        metadata.key = this.getSongBpmProvider.getKey(getSongBpmTrack);
      }

      return metadata as SongMetadata;
    }

    // Fallback to Spotify if available and iTunes failed
    if (this.spotifyAvailable) {
      const query = `${title} ${artist}`;
      const spotifyTrack = await this.spotifyProvider.searchTrack(query);

      if (spotifyTrack) {
        const metadata = this.spotifyProvider.toSongMetadata(spotifyTrack);

        // Try to get audio features
        const audioFeatures = await this.reccoBeatsProvider.getAudioFeatures(spotifyTrack.id);
        if (audioFeatures) {
          metadata.bpm = this.reccoBeatsProvider.formatBpm(audioFeatures.tempo);
          metadata.key = this.reccoBeatsProvider.formatKey(audioFeatures.key, audioFeatures.mode);
        }

        return metadata as SongMetadata;
      }
    }

    return null;
  }
}
