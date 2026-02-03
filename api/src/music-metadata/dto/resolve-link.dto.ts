import { IsString, IsUrl } from 'class-validator';

export class ResolveLinkDto {
  @IsString()
  @IsUrl({}, { message: 'Debe ser una URL válida de Spotify, YouTube o Apple Music' })
  url: string;
}

export interface SongMetadata {
  title: string;
  artist: string;
  album?: string;
  coverUrl?: string;
  durationMs?: number;
  bpm?: number;
  key?: string;
  releaseDate?: string;
  isrc?: string;
  spotifyId?: string;
  youtubeId?: string;
  appleMusicId?: string;
  previewUrl?: string;
}

export interface OdesliResponse {
  entityUniqueId: string;
  userCountry: string;
  pageUrl: string;
  entitiesByUniqueId: Record<string, {
    id: string;
    type: string;
    title?: string;
    artistName?: string;
    thumbnailUrl?: string;
    thumbnailWidth?: number;
    thumbnailHeight?: number;
    apiProvider: string;
    platforms: string[];
  }>;
  linksByPlatform: Record<string, {
    country: string;
    url: string;
    entityUniqueId: string;
  }>;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string; id: string }>;
  album: {
    name: string;
    images: Array<{ url: string; width: number; height: number }>;
    release_date: string;
  };
  duration_ms: number;
  external_ids?: {
    isrc?: string;
  };
  preview_url?: string;
  popularity: number;
}

export interface ReccoBeatsResponse {
  track?: {
    tempo?: number;
    key?: number;
    mode?: number;
    energy?: number;
    danceability?: number;
  };
}

// Key mapping for Spotify/ReccoBeats pitch class notation
export const KEY_MAP: Record<number, string> = {
  0: 'C',
  1: 'C#/Db',
  2: 'D',
  3: 'D#/Eb',
  4: 'E',
  5: 'F',
  6: 'F#/Gb',
  7: 'G',
  8: 'G#/Ab',
  9: 'A',
  10: 'A#/Bb',
  11: 'B',
};

export const MODE_MAP: Record<number, string> = {
  0: 'minor',
  1: 'major',
};
