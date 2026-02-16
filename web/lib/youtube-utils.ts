/**
 * Extract YouTube video ID from various URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://music.youtube.com/watch?v=VIDEO_ID
 */
export function extractVideoId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|music\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

/**
 * Extract Spotify track ID from URL:
 * - https://open.spotify.com/track/TRACK_ID
 * - https://open.spotify.com/track/TRACK_ID?si=...
 */
export function extractSpotifyTrackId(url: string): string | null {
  const match = url.match(/open\.spotify\.com\/track\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

/**
 * Load the YouTube IFrame API script once.
 * Returns a promise that resolves when YT.Player is available.
 */
let loadPromise: Promise<void> | null = null;

export function loadYouTubeAPI(): Promise<void> {
  if (loadPromise) return loadPromise;

  if (typeof window !== "undefined" && window.YT?.Player) {
    return Promise.resolve();
  }

  loadPromise = new Promise((resolve) => {
    const existing = document.getElementById("youtube-iframe-api");
    if (existing) {
      const check = setInterval(() => {
        if (window.YT?.Player) {
          clearInterval(check);
          resolve();
        }
      }, 100);
      return;
    }

    (window as unknown as Record<string, unknown>).onYouTubeIframeAPIReady =
      () => resolve();

    const script = document.createElement("script");
    script.id = "youtube-iframe-api";
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);
  });

  return loadPromise;
}

/**
 * Format milliseconds to MM:SS display
 */
export function formatPlayerTime(ms: number): string {
  if (!ms || ms <= 0) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
