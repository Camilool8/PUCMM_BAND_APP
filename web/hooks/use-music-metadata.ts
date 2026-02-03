import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, SongMetadata } from "@/lib/api";

const TOAST_MESSAGES = {
  LINK_RESOLVED: "Información de la canción obtenida",
  ERROR_RESOLVE: "No se pudo obtener información del enlace",
  ERROR_SEARCH: "No se encontró la canción",
};

export function useResolveMusicLink() {
  return useMutation({
    mutationFn: (url: string) => api.resolveMusicLink(url),
    onSuccess: (data) => {
      if (data.success && data.metadata) {
        toast.success(TOAST_MESSAGES.LINK_RESOLVED);
      }
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.ERROR_RESOLVE);
    },
  });
}

export function useSearchSongMetadata() {
  return useMutation({
    mutationFn: ({ title, artist }: { title: string; artist: string }) =>
      api.searchSongMetadata(title, artist),
    onError: () => {
      toast.error(TOAST_MESSAGES.ERROR_SEARCH);
    },
  });
}

export function useDetectPlatform() {
  return useMutation({
    mutationFn: (url: string) => api.detectMusicPlatform(url),
  });
}

/**
 * Helper to format duration from milliseconds to readable string
 */
export function formatDurationFromMs(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Helper to detect if a URL is a valid music link
 */
export function isMusicLink(url: string): boolean {
  const patterns = [
    /spotify\.com\/track/,
    /spotify:track:/,
    /youtube\.com\/watch/,
    /youtu\.be\//,
    /music\.youtube\.com/,
    /music\.apple\.com/,
    /itunes\.apple\.com/,
  ];
  return patterns.some((pattern) => pattern.test(url));
}

/**
 * Helper to get platform icon name
 */
export function getPlatformIcon(url: string): string {
  if (url.includes("spotify")) return "spotify";
  if (url.includes("youtube") || url.includes("youtu.be")) return "youtube";
  if (url.includes("apple")) return "apple";
  return "music";
}
