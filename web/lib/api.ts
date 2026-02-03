const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export type Role = "SUPERADMIN" | "SECTION_LEADER" | "MEMBER" | "ALUMNI_GUEST";

export interface DbUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: Role;
  instruments: string[];
  phone: string | null;
  bio: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface UpdateProfileDto {
  name?: string;
  avatarUrl?: string;
  instruments?: string[];
  phone?: string;
  bio?: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  bpm: number | null;
  key: string | null;
  status: "PENDING" | "REHEARSING" | "READY" | "ARCHIVED";
  coverUrl: string | null;
  durationMs: number | null;
  releaseDate: string | null;
  isrc: string | null;
  // Music platform links
  spotifyUrl: string | null;
  youtubeUrl: string | null;
  appleMusicUrl: string | null;
  createdAt: string;
  updatedAt: string;
  suggestedBy?: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  } | null;
  suggestedById?: string | null;
  // Optional relations
  assets?: Asset[];
}

export type SongStatus = "PENDING" | "REHEARSING" | "READY" | "ARCHIVED";

export interface CreateSongDto {
  title: string;
  artist: string;
  bpm?: number;
  key?: string;
  isrc?: string;
  coverUrl?: string;
  durationMs?: number;
  releaseDate?: string;
  status?: SongStatus;
  spotifyUrl?: string;
  youtubeUrl?: string;
  appleMusicUrl?: string;
}

export interface UpdateSongDto {
  title?: string;
  artist?: string;
  bpm?: number;
  key?: string;
  status?: SongStatus;
  isrc?: string;
  coverUrl?: string;
  durationMs?: number;
  releaseDate?: string;
  spotifyUrl?: string;
  youtubeUrl?: string;
  appleMusicUrl?: string;
}

// ============================================================================
// Upload Types
// ============================================================================

export type AssetType = "SCORE" | "VIDEO" | "AUDIO";

export interface UploadedFile {
  filename: string;
  originalName: string;
  path: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface UploadResponse {
  success: boolean;
  file: UploadedFile;
}

export interface Asset {
  id: string;
  type: AssetType;
  url: string;
  name: string | null;
  instrumentTag: string | null;
  songId: string | null;
  concertId: string | null;
  createdAt: string;
}

export interface CreateAssetDto {
  type: AssetType;
  url: string;
  name?: string;
  instrumentTag?: string;
  songId?: string;
  concertId?: string;
}

// ============================================================================
// Events Types
// ============================================================================

export interface Event {
  id: string;
  name: string;
  description: string | null;
  // Visual customization
  iconName: string | null;
  bannerUrl: string | null;
  gradientFrom: string | null;
  gradientVia: string | null;
  gradientTo: string | null;
  iconGradientFrom: string | null;
  iconGradientTo: string | null;
  // Timestamps
  createdAt: string;
  updatedAt: string;
  // Relations
  songs?: Song[];
  concerts?: Concert[];
  _count?: {
    songs: number;
    concerts: number;
  };
}

export interface Concert {
  id: string;
  date: string;
  location: string | null;
  notes: string | null;
  eventId: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  event?: Event;
  songs?: Song[];
  _count?: {
    songs: number;
  };
}

export interface CreateConcertDto {
  date: string;
  eventId: string;
  location?: string;
  notes?: string;
  songIds?: string[];
}

export interface UpdateConcertDto {
  date?: string;
  location?: string;
  notes?: string;
  songIds?: string[];
}

export interface CreateEventDto {
  name: string;
  description?: string;
  // Visual customization
  iconName?: string;
  bannerUrl?: string;
  gradientFrom?: string;
  gradientVia?: string;
  gradientTo?: string;
  iconGradientFrom?: string;
  iconGradientTo?: string;
  // Initial songs
  songIds?: string[];
}

export interface UpdateEventDto {
  name?: string;
  description?: string;
  // Visual customization
  iconName?: string;
  bannerUrl?: string;
  gradientFrom?: string;
  gradientVia?: string;
  gradientTo?: string;
  iconGradientFrom?: string;
  iconGradientTo?: string;
  // Songs
  songIds?: string[];
}

// ============================================================================
// Repertoire Sections Types
// ============================================================================

export interface RepertoireSection {
  id: string;
  key: string;
  title: string;
  subtitle: string | null;
  iconName: string | null;
  bannerUrl: string | null;
  gradientFrom: string | null;
  gradientVia: string | null;
  gradientTo: string | null;
  iconGradientFrom: string | null;
  iconGradientTo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSectionDto {
  title?: string;
  subtitle?: string;
  iconName?: string;
  bannerUrl?: string;
  gradientFrom?: string;
  gradientVia?: string;
  gradientTo?: string;
  iconGradientFrom?: string;
  iconGradientTo?: string;
}

// ============================================================================
// Music Metadata Types
// ============================================================================

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

export interface ResolveLinkResponse {
  success: boolean;
  metadata?: SongMetadata;
  error?: string;
}

export type MusicPlatform = 'spotify' | 'youtube' | 'apple_music' | 'unknown';

class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.accessToken) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Songs
  async getSongs(): Promise<Song[]> {
    return this.request<Song[]>("/songs");
  }

  async getSong(id: string): Promise<Song> {
    return this.request<Song>(`/songs/${id}`);
  }

  async createSong(data: CreateSongDto): Promise<Song> {
    return this.request<Song>("/songs", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateSong(id: string, data: UpdateSongDto): Promise<Song> {
    return this.request<Song>(`/songs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteSong(id: string): Promise<void> {
    await this.request(`/songs/${id}`, { method: "DELETE" });
  }

  // Users
  async getMe(): Promise<DbUser> {
    return this.request<DbUser>("/users/me");
  }

  async getUsers(): Promise<DbUser[]> {
    return this.request<DbUser[]>("/users");
  }

  async updateUserRole(id: string, role: Role): Promise<DbUser> {
    return this.request<DbUser>(`/users/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  }

  async updateProfile(data: UpdateProfileDto): Promise<DbUser> {
    return this.request<DbUser>("/users/me/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // ============================================================================
  // Uploads
  // ============================================================================

  /**
   * Upload a file with progress tracking
   * @param endpoint - The upload endpoint (e.g., '/uploads/image')
   * @param file - The file to upload
   * @param onProgress - Optional callback for progress updates (0-100)
   */
  async uploadFile(
    endpoint: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", file);

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Upload failed: Network error"));
      });

      xhr.open("POST", `${this.baseUrl}${endpoint}`);
      if (this.accessToken) {
        xhr.setRequestHeader("Authorization", `Bearer ${this.accessToken}`);
      }
      xhr.send(formData);
    });
  }

  async uploadImage(file: File, onProgress?: (progress: number) => void): Promise<UploadResponse> {
    return this.uploadFile("/uploads/image", file, onProgress);
  }

  async uploadPdf(file: File, onProgress?: (progress: number) => void): Promise<UploadResponse> {
    return this.uploadFile("/uploads/pdf", file, onProgress);
  }

  async uploadVideo(file: File, onProgress?: (progress: number) => void): Promise<UploadResponse> {
    return this.uploadFile("/uploads/video", file, onProgress);
  }

  async createAsset(data: CreateAssetDto): Promise<{ success: boolean; asset: Asset }> {
    return this.request("/uploads/asset", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getAssetsBySong(songId: string): Promise<Asset[]> {
    return this.request<Asset[]>(`/uploads/song/${songId}/assets`);
  }

  async getAssetsByConcert(concertId: string): Promise<Asset[]> {
    return this.request<Asset[]>(`/uploads/concert/${concertId}/assets`);
  }

  async deleteAsset(id: string): Promise<void> {
    await this.request(`/uploads/asset/${id}`, { method: "DELETE" });
  }

  // ============================================================================
  // Repertoire Sections
  // ============================================================================

  async getSections(): Promise<RepertoireSection[]> {
    return this.request<RepertoireSection[]>("/repertoire-sections");
  }

  async getSection(key: string): Promise<RepertoireSection> {
    return this.request<RepertoireSection>(`/repertoire-sections/${key}`);
  }

  async updateSection(key: string, data: UpdateSectionDto): Promise<RepertoireSection> {
    return this.request<RepertoireSection>(`/repertoire-sections/${key}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async clearSectionBanner(key: string): Promise<RepertoireSection> {
    return this.request<RepertoireSection>(`/repertoire-sections/${key}/banner`, {
      method: "DELETE",
    });
  }

  // ============================================================================
  // Events
  // ============================================================================

  async getEvents(): Promise<Event[]> {
    return this.request<Event[]>("/events");
  }

  async getEvent(id: string): Promise<Event> {
    return this.request<Event>(`/events/${id}`);
  }

  async createEvent(data: CreateEventDto): Promise<Event> {
    return this.request<Event>("/events", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateEvent(id: string, data: UpdateEventDto): Promise<Event> {
    return this.request<Event>(`/events/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteEvent(id: string): Promise<void> {
    await this.request(`/events/${id}`, { method: "DELETE" });
  }

  async addSongToEvent(eventId: string, songId: string): Promise<Event> {
    return this.request<Event>(`/events/${eventId}/songs`, {
      method: "POST",
      body: JSON.stringify({ songId }),
    });
  }

  async removeSongFromEvent(eventId: string, songId: string): Promise<Event> {
    return this.request<Event>(`/events/${eventId}/songs/${songId}`, {
      method: "DELETE",
    });
  }

  async reorderEventSongs(eventId: string, songIds: string[]): Promise<Event> {
    return this.request<Event>(`/events/${eventId}/songs/reorder`, {
      method: "PATCH",
      body: JSON.stringify({ songIds }),
    });
  }

  // ============================================================================
  // Concerts
  // ============================================================================

  async getConcerts(): Promise<Concert[]> {
    return this.request<Concert[]>("/concerts");
  }

  async getConcertsByEvent(eventId: string): Promise<Concert[]> {
    return this.request<Concert[]>(`/concerts/event/${eventId}`);
  }

  async getConcert(id: string): Promise<Concert> {
    return this.request<Concert>(`/concerts/${id}`);
  }

  async createConcert(data: CreateConcertDto): Promise<Concert> {
    return this.request<Concert>("/concerts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateConcert(id: string, data: UpdateConcertDto): Promise<Concert> {
    return this.request<Concert>(`/concerts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteConcert(id: string): Promise<void> {
    await this.request(`/concerts/${id}`, { method: "DELETE" });
  }

  async addSongToConcert(concertId: string, songId: string): Promise<Concert> {
    return this.request<Concert>(`/concerts/${concertId}/songs`, {
      method: "POST",
      body: JSON.stringify({ songId }),
    });
  }

  async removeSongFromConcert(concertId: string, songId: string): Promise<Concert> {
    return this.request<Concert>(`/concerts/${concertId}/songs/${songId}`, {
      method: "DELETE",
    });
  }

  async copyEventSongsToConcert(concertId: string): Promise<Concert> {
    return this.request<Concert>(`/concerts/${concertId}/copy-from-event`, {
      method: "POST",
    });
  }

  async reorderConcertSongs(concertId: string, songIds: string[]): Promise<Concert> {
    return this.request<Concert>(`/concerts/${concertId}/songs/reorder`, {
      method: "PATCH",
      body: JSON.stringify({ songIds }),
    });
  }

  // ============================================================================
  // Music Metadata
  // ============================================================================

  /**
   * Resolve a music link and fetch metadata
   * Supports Spotify, YouTube, and Apple Music links
   */
  async resolveMusicLink(url: string): Promise<ResolveLinkResponse> {
    return this.request<ResolveLinkResponse>("/music-metadata/resolve", {
      method: "POST",
      body: JSON.stringify({ url }),
    });
  }

  /**
   * Search for a song by title and artist
   * Fallback when user doesn't have a link
   */
  async searchSongMetadata(title: string, artist: string): Promise<ResolveLinkResponse> {
    return this.request<ResolveLinkResponse>(
      `/music-metadata/search?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`
    );
  }

  /**
   * Detect the platform from a URL
   */
  async detectMusicPlatform(url: string): Promise<{ platform: MusicPlatform; supported: boolean }> {
    return this.request<{ platform: MusicPlatform; supported: boolean }>("/music-metadata/detect-platform", {
      method: "POST",
      body: JSON.stringify({ url }),
    });
  }
}

export const api = new ApiClient(API_URL);
