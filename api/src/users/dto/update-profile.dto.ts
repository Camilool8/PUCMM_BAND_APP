export class UpdateProfileDto {
  name?: string;
  avatarUrl?: string;
  homeBackground?: string; // Preset name (e.g., "aurora") or custom image URL
  instruments?: string[];
  phone?: string;
  bio?: string;
}
