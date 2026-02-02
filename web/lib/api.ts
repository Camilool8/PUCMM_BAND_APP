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
  createdAt: string;
  updatedAt: string;
}

export type SongStatus = "PENDING" | "REHEARSING" | "READY" | "ARCHIVED";

export interface CreateSongDto {
  title: string;
  artist: string;
  bpm?: number;
  key?: string;
  isrc?: string;
  status?: SongStatus; // Allow admins to set initial status
}

export interface UpdateSongDto {
  title?: string;
  artist?: string;
  bpm?: number;
  key?: string;
  status?: SongStatus;
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
}

export const api = new ApiClient(API_URL);
