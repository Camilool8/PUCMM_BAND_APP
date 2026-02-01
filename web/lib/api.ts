const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export type Role = "SUPERADMIN" | "SECTION_LEADER" | "MEMBER" | "ALUMNI_GUEST";

export interface DbUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  instruments: string[];
  createdAt: string;
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
}

export const api = new ApiClient(API_URL);
