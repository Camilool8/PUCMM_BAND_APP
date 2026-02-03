import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Song } from "./api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format milliseconds as "X min Y seg" or "X min" if no seconds
 */
export function formatDuration(totalMs: number): string {
  if (!totalMs || totalMs <= 0) return "0 min";

  const totalSeconds = Math.floor(totalMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (seconds === 0) {
    return `${minutes} min`;
  }
  return `${minutes} min ${seconds} seg`;
}

/**
 * Calculate total duration of a setlist from songs with durationMs
 * Returns 0 if no songs have duration set
 */
export function calculateSetlistDuration(songs: Song[]): number {
  return songs.reduce((total, song) => total + (song.durationMs || 0), 0);
}

/**
 * Check if any songs in the list have duration data
 */
export function hasDurationData(songs: Song[]): boolean {
  return songs.some((song) => song.durationMs && song.durationMs > 0);
}
