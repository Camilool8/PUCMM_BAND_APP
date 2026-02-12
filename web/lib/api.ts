import { env } from "./env";

// Use getter to support runtime config in Docker
const getApiUrl = () => env.apiUrl || "http://localhost:3001";

export type Role = "SUPERADMIN" | "MEMBER" | "STUDENT_GUEST";

export interface DbUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  homeBackground: string | null; // Preset name (e.g., "aurora") or custom image URL
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
  homeBackground?: string; // Preset name (e.g., "aurora") or custom image URL
  instruments?: string[];
  phone?: string;
  bio?: string;
}

export interface SongVoter {
  id: string;
  name: string | null;
  avatarUrl: string | null;
}

export interface SongEvent {
  id: string;
  name: string;
  iconName: string | null;
  gradientFrom?: string | null;
  iconGradientFrom?: string | null;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  bpm: number | null;
  key: string | null;
  genre: string | null;
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
  // Lead vocals
  leadVocals?: SongVoter[];
  // Events this song belongs to
  eventSongs?: { event: SongEvent }[];
  // Votes
  votes?: { userId: string; isGolden: boolean; user: SongVoter }[];
  _count?: {
    votes: number;
    goldenVotes: number;
  };
  // Optional relations
  assets?: Asset[];
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingSong?: {
    id: string;
    title: string;
    artist: string;
    coverUrl: string | null;
    status: SongStatus;
  };
  matchedBy?: "isrc" | "title_artist";
}

export type SongStatus = "PENDING" | "REHEARSING" | "READY" | "ARCHIVED";

export interface MyVote {
  songId: string;
  isGolden: boolean;
}

export interface CreateSongDto {
  title: string;
  artist: string;
  bpm?: number;
  key?: string;
  genre?: string;
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
  genre?: string;
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
// Setlist Block Types
// ============================================================================

export type BlockType = "INTERLUDE" | "INTRODUCTION" | "BREAK" | "TRANSITION" | "CUSTOM";

export interface SetlistBlock {
  id: string;
  type: BlockType;
  label: string;
  durationMinutes: number | null;
  notes: string | null;
}

export interface SetlistItem {
  id: string;
  itemType: "song" | "block";
  order: number;
  song: Song | null;
  block: SetlistBlock | null;
}

export interface CreateBlockDto {
  type: BlockType;
  label: string;
  durationMinutes?: number;
  notes?: string;
}

export interface UpdateBlockDto {
  type?: BlockType;
  label?: string;
  durationMinutes?: number;
  notes?: string;
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
  setlistItems?: SetlistItem[];
  concerts?: Concert[];
  _count?: {
    songs: number;
    concerts: number;
    blocks?: number;
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
  setlistItems?: SetlistItem[];
  _count?: {
    songs: number;
    blocks?: number;
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
  genre?: string;
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

// Re-export OrgConfig type for convenience
export type { OrgConfig } from "@/hooks/use-org-config";

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

  // Song Voting
  async voteSong(songId: string): Promise<{ voteCount: number }> {
    return this.request<{ voteCount: number }>(`/songs/${songId}/vote`, {
      method: "POST",
    });
  }

  async unvoteSong(songId: string): Promise<{ voteCount: number }> {
    return this.request<{ voteCount: number }>(`/songs/${songId}/vote`, {
      method: "DELETE",
    });
  }

  async getMyVotes(): Promise<MyVote[]> {
    return this.request<MyVote[]>("/songs/my-votes");
  }

  async addGoldenVote(songId: string): Promise<{ voteCount: number; goldenVoteCount: number }> {
    return this.request<{ voteCount: number; goldenVoteCount: number }>(`/songs/${songId}/golden-vote`, {
      method: "POST",
    });
  }

  async removeGoldenVote(songId: string): Promise<{ voteCount: number; goldenVoteCount: number }> {
    return this.request<{ voteCount: number; goldenVoteCount: number }>(`/songs/${songId}/golden-vote`, {
      method: "DELETE",
    });
  }

  // Song Lead Vocals
  async addLeadVocal(songId: string, userId: string): Promise<Song> {
    return this.request<Song>(`/songs/${songId}/lead-vocals/${userId}`, {
      method: "POST",
    });
  }

  async removeLeadVocal(songId: string, userId: string): Promise<Song> {
    return this.request<Song>(`/songs/${songId}/lead-vocals/${userId}`, {
      method: "DELETE",
    });
  }

  async setLeadVocals(songId: string, userIds: string[]): Promise<Song> {
    return this.request<Song>(`/songs/${songId}/lead-vocals`, {
      method: "POST",
      body: JSON.stringify({ userIds }),
    });
  }

  // Duplicate Detection
  async checkDuplicate(title: string, artist: string, isrc?: string): Promise<DuplicateCheckResult> {
    const params = new URLSearchParams({ title, artist });
    if (isrc) params.append("isrc", isrc);
    return this.request<DuplicateCheckResult>(`/songs/check-duplicate?${params}`);
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

  async updateUserProfile(id: string, data: UpdateProfileDto): Promise<DbUser> {
    return this.request<DbUser>(`/users/${id}/profile`, {
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

  async addSongsToEventBulk(eventId: string, songIds: string[]): Promise<Event> {
    return this.request<Event>(`/events/${eventId}/songs/bulk`, {
      method: "POST",
      body: JSON.stringify({ songIds }),
    });
  }

  async reorderEventSetlist(eventId: string, items: { id: string; itemType: "song" | "block" }[]): Promise<Event> {
    return this.request<Event>(`/events/${eventId}/setlist/reorder`, {
      method: "PATCH",
      body: JSON.stringify({ items }),
    });
  }

  async addBlockToEvent(eventId: string, data: CreateBlockDto): Promise<Event> {
    return this.request<Event>(`/events/${eventId}/blocks`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateEventBlock(eventId: string, blockId: string, data: UpdateBlockDto): Promise<Event> {
    return this.request<Event>(`/events/${eventId}/blocks/${blockId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async removeBlockFromEvent(eventId: string, blockId: string): Promise<Event> {
    return this.request<Event>(`/events/${eventId}/blocks/${blockId}`, {
      method: "DELETE",
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

  async addSongsToConcertBulk(concertId: string, songIds: string[]): Promise<Concert> {
    return this.request<Concert>(`/concerts/${concertId}/songs/bulk`, {
      method: "POST",
      body: JSON.stringify({ songIds }),
    });
  }

  async reorderConcertSetlist(concertId: string, items: { id: string; itemType: "song" | "block" }[]): Promise<Concert> {
    return this.request<Concert>(`/concerts/${concertId}/setlist/reorder`, {
      method: "PATCH",
      body: JSON.stringify({ items }),
    });
  }

  async addBlockToConcert(concertId: string, data: CreateBlockDto): Promise<Concert> {
    return this.request<Concert>(`/concerts/${concertId}/blocks`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateConcertBlock(concertId: string, blockId: string, data: UpdateBlockDto): Promise<Concert> {
    return this.request<Concert>(`/concerts/${concertId}/blocks/${blockId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async removeBlockFromConcert(concertId: string, blockId: string): Promise<Concert> {
    return this.request<Concert>(`/concerts/${concertId}/blocks/${blockId}`, {
      method: "DELETE",
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

  // ============================================================================
  // Auth (email/password, token exchange)
  // ============================================================================

  async login(email: string, password: string): Promise<{ accessToken: string; expiresIn: number; user: DbUser }> {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string, name?: string): Promise<{ accessToken: string; expiresIn: number; user: DbUser }> {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  }

  async exchangeAzureToken(): Promise<{ accessToken: string; expiresIn: number }> {
    return this.request("/auth/exchange", { method: "POST" });
  }
}

// Create a proxy that lazily initializes the API client
// This ensures runtime config is available before initialization
class ApiClientProxy {
  private _client: ApiClient | null = null;

  private get client(): ApiClient {
    if (!this._client) {
      this._client = new ApiClient(getApiUrl());
    }
    return this._client;
  }

  setAccessToken(token: string | null) {
    this.client.setAccessToken(token);
  }

  getSongs = () => this.client.getSongs();
  getSong = (id: string) => this.client.getSong(id);
  createSong = (data: CreateSongDto) => this.client.createSong(data);
  updateSong = (id: string, data: UpdateSongDto) => this.client.updateSong(id, data);
  deleteSong = (id: string) => this.client.deleteSong(id);
  voteSong = (songId: string) => this.client.voteSong(songId);
  unvoteSong = (songId: string) => this.client.unvoteSong(songId);
  getMyVotes = () => this.client.getMyVotes();
  addLeadVocal = (songId: string, userId: string) => this.client.addLeadVocal(songId, userId);
  removeLeadVocal = (songId: string, userId: string) => this.client.removeLeadVocal(songId, userId);
  addGoldenVote = (songId: string) => this.client.addGoldenVote(songId);
  removeGoldenVote = (songId: string) => this.client.removeGoldenVote(songId);
  setLeadVocals = (songId: string, userIds: string[]) => this.client.setLeadVocals(songId, userIds);
  checkDuplicate = (title: string, artist: string, isrc?: string) => this.client.checkDuplicate(title, artist, isrc);
  getMe = () => this.client.getMe();
  getUsers = () => this.client.getUsers();
  updateUserRole = (id: string, role: Role) => this.client.updateUserRole(id, role);
  updateProfile = (data: UpdateProfileDto) => this.client.updateProfile(data);
  updateUserProfile = (id: string, data: UpdateProfileDto) => this.client.updateUserProfile(id, data);
  uploadFile = (endpoint: string, file: File, onProgress?: (progress: number) => void) => this.client.uploadFile(endpoint, file, onProgress);
  uploadImage = (file: File, onProgress?: (progress: number) => void) => this.client.uploadImage(file, onProgress);
  uploadPdf = (file: File, onProgress?: (progress: number) => void) => this.client.uploadPdf(file, onProgress);
  uploadVideo = (file: File, onProgress?: (progress: number) => void) => this.client.uploadVideo(file, onProgress);
  createAsset = (data: CreateAssetDto) => this.client.createAsset(data);
  getAssetsBySong = (songId: string) => this.client.getAssetsBySong(songId);
  getAssetsByConcert = (concertId: string) => this.client.getAssetsByConcert(concertId);
  deleteAsset = (id: string) => this.client.deleteAsset(id);
  getSections = () => this.client.getSections();
  getSection = (key: string) => this.client.getSection(key);
  updateSection = (key: string, data: UpdateSectionDto) => this.client.updateSection(key, data);
  clearSectionBanner = (key: string) => this.client.clearSectionBanner(key);
  getEvents = () => this.client.getEvents();
  getEvent = (id: string) => this.client.getEvent(id);
  createEvent = (data: CreateEventDto) => this.client.createEvent(data);
  updateEvent = (id: string, data: UpdateEventDto) => this.client.updateEvent(id, data);
  deleteEvent = (id: string) => this.client.deleteEvent(id);
  addSongToEvent = (eventId: string, songId: string) => this.client.addSongToEvent(eventId, songId);
  removeSongFromEvent = (eventId: string, songId: string) => this.client.removeSongFromEvent(eventId, songId);
  reorderEventSongs = (eventId: string, songIds: string[]) => this.client.reorderEventSongs(eventId, songIds);
  addSongsToEventBulk = (eventId: string, songIds: string[]) => this.client.addSongsToEventBulk(eventId, songIds);
  reorderEventSetlist = (eventId: string, items: { id: string; itemType: "song" | "block" }[]) => this.client.reorderEventSetlist(eventId, items);
  addBlockToEvent = (eventId: string, data: CreateBlockDto) => this.client.addBlockToEvent(eventId, data);
  updateEventBlock = (eventId: string, blockId: string, data: UpdateBlockDto) => this.client.updateEventBlock(eventId, blockId, data);
  removeBlockFromEvent = (eventId: string, blockId: string) => this.client.removeBlockFromEvent(eventId, blockId);
  getConcerts = () => this.client.getConcerts();
  getConcertsByEvent = (eventId: string) => this.client.getConcertsByEvent(eventId);
  getConcert = (id: string) => this.client.getConcert(id);
  createConcert = (data: CreateConcertDto) => this.client.createConcert(data);
  updateConcert = (id: string, data: UpdateConcertDto) => this.client.updateConcert(id, data);
  deleteConcert = (id: string) => this.client.deleteConcert(id);
  addSongToConcert = (concertId: string, songId: string) => this.client.addSongToConcert(concertId, songId);
  removeSongFromConcert = (concertId: string, songId: string) => this.client.removeSongFromConcert(concertId, songId);
  copyEventSongsToConcert = (concertId: string) => this.client.copyEventSongsToConcert(concertId);
  reorderConcertSongs = (concertId: string, songIds: string[]) => this.client.reorderConcertSongs(concertId, songIds);
  addSongsToConcertBulk = (concertId: string, songIds: string[]) => this.client.addSongsToConcertBulk(concertId, songIds);
  reorderConcertSetlist = (concertId: string, items: { id: string; itemType: "song" | "block" }[]) => this.client.reorderConcertSetlist(concertId, items);
  addBlockToConcert = (concertId: string, data: CreateBlockDto) => this.client.addBlockToConcert(concertId, data);
  updateConcertBlock = (concertId: string, blockId: string, data: UpdateBlockDto) => this.client.updateConcertBlock(concertId, blockId, data);
  removeBlockFromConcert = (concertId: string, blockId: string) => this.client.removeBlockFromConcert(concertId, blockId);
  resolveMusicLink = (url: string) => this.client.resolveMusicLink(url);
  searchSongMetadata = (title: string, artist: string) => this.client.searchSongMetadata(title, artist);
  detectMusicPlatform = (url: string) => this.client.detectMusicPlatform(url);
  login = (email: string, password: string) => this.client.login(email, password);
  register = (email: string, password: string, name?: string) => this.client.register(email, password, name);
  exchangeAzureToken = () => this.client.exchangeAzureToken();
}

export const api = new ApiClientProxy();
