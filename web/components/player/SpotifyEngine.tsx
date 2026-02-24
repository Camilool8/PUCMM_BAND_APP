"use client";

import { useEffect, useRef } from "react";

// ---------------------------------------------------------------------------
// Spotify IFrame API loader
// ---------------------------------------------------------------------------

interface SpotifyController {
  play: () => void;
  togglePlay: () => void;
  loadUri: (uri: string) => void;
  destroy: () => void;
  addListener: (event: string, callback: (data: any) => void) => void;
}

interface SpotifyIFrameAPI {
  createController: (
    element: HTMLElement,
    options: { uri: string; width?: string | number; height?: number },
    callback: (controller: SpotifyController) => void
  ) => void;
}

let apiPromise: Promise<SpotifyIFrameAPI> | null = null;

function loadSpotifyAPI(): Promise<SpotifyIFrameAPI> {
  if (apiPromise) return apiPromise;

  apiPromise = new Promise<SpotifyIFrameAPI>((resolve, reject) => {
    if ((window as any).SpotifyIframeApi) {
      resolve((window as any).SpotifyIframeApi);
      return;
    }

    const timeout = setTimeout(() => {
      reject(new Error("Spotify IFrame API timeout"));
    }, 10000);

    (window as any).onSpotifyIframeApiReady = (api: SpotifyIFrameAPI) => {
      clearTimeout(timeout);
      resolve(api);
    };

    const script = document.createElement("script");
    script.src = "https://open.spotify.com/embed/iframe-api/v1";
    script.async = true;
    script.onerror = () => {
      clearTimeout(timeout);
      reject(new Error("Failed to load Spotify IFrame API"));
    };
    document.head.appendChild(script);
  }).catch((err) => {
    apiPromise = null; // allow retry on next call
    throw err;
  });

  return apiPromise;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface SpotifyEngineProps {
  spotifyTrackId: string | undefined;
  isActive: boolean;
  compact?: boolean;
  onReady?: () => void;
  onEnd?: () => void;
  onTimeUpdate?: (data: { currentTimeMs: number; durationMs: number }) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

export default function SpotifyEngine({
  spotifyTrackId,
  isActive,
  compact = false,
  onReady,
  onEnd,
  onTimeUpdate,
  onPlayStateChange,
}: SpotifyEngineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<SpotifyController | null>(null);
  const hasEndedRef = useRef(false);

  const onReadyRef = useRef(onReady);
  const onEndRef = useRef(onEnd);
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const onPlayStateChangeRef = useRef(onPlayStateChange);
  onReadyRef.current = onReady;
  onEndRef.current = onEnd;
  onTimeUpdateRef.current = onTimeUpdate;
  onPlayStateChangeRef.current = onPlayStateChange;

  useEffect(() => {
    if (!spotifyTrackId || !isActive || !containerRef.current) return;

    let destroyed = false;
    let autoplayTimer: ReturnType<typeof setTimeout> | null = null;
    hasEndedRef.current = false;

    const init = async () => {
      if (!containerRef.current) return;

      try {
        const api = await loadSpotifyAPI();
        if (destroyed || !containerRef.current) return;

        containerRef.current.innerHTML = "";
        const playerEl = document.createElement("div");
        containerRef.current.appendChild(playerEl);

        let hasConfirmedPlay = false;
        let lastIsPaused: boolean | null = null;

        api.createController(
          playerEl,
          {
            uri: `spotify:track:${spotifyTrackId}`,
            width: "100%",
            height: compact ? 80 : 152,
          },
          (controller) => {
            if (destroyed) return;
            controllerRef.current = controller;

            controller.addListener("ready", () => {
              if (destroyed) return;
              // Try autoplay – works on desktop, silently blocked on mobile
              controller.play();
              onReadyRef.current?.();

              // If no playback_update confirms playing within 2s,
              // assume autoplay was blocked (mobile browser policy)
              autoplayTimer = setTimeout(() => {
                if (!destroyed && !hasConfirmedPlay) {
                  onPlayStateChangeRef.current?.(false);
                }
              }, 2000);
            });

            controller.addListener("playback_update", (e: any) => {
              if (destroyed) return;
              const { position, duration, isPaused } = e.data;

              // Track actual play/pause state from the embed
              if (!isPaused && !hasConfirmedPlay) {
                hasConfirmedPlay = true;
                if (autoplayTimer) {
                  clearTimeout(autoplayTimer);
                  autoplayTimer = null;
                }
              }

              // Only emit on actual state changes to avoid unnecessary re-renders
              if (lastIsPaused !== isPaused) {
                lastIsPaused = isPaused;
                onPlayStateChangeRef.current?.(!isPaused);
              }

              if (duration > 0) {
                onTimeUpdateRef.current?.({
                  currentTimeMs: position,
                  durationMs: duration,
                });
              }

              // Detect end: playback stopped near the end of track
              if (
                duration > 0 &&
                isPaused &&
                position >= duration - 500 &&
                !hasEndedRef.current
              ) {
                hasEndedRef.current = true;
                onEndRef.current?.();
              }
            });
          }
        );
      } catch {
        // Fallback: simple iframe (no programmatic control)
        if (destroyed || !containerRef.current) return;

        containerRef.current.innerHTML = "";
        const iframe = document.createElement("iframe");
        iframe.src = `https://open.spotify.com/embed/track/${spotifyTrackId}?utm_source=generator&theme=0`;
        iframe.width = "100%";
        iframe.height = String(compact ? 80 : 152);
        iframe.allow = "encrypted-media; autoplay; clipboard-write";
        iframe.loading = "eager";
        iframe.className = "rounded-xl";
        iframe.title = "Spotify Player";
        iframe.onload = () => onReadyRef.current?.();
        containerRef.current.appendChild(iframe);
      }
    };

    init();

    return () => {
      destroyed = true;
      if (autoplayTimer) {
        clearTimeout(autoplayTimer);
      }
      if (controllerRef.current) {
        try {
          controllerRef.current.destroy();
        } catch {
          // ignore
        }
        controllerRef.current = null;
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [spotifyTrackId, isActive, compact]);

  if (!spotifyTrackId || !isActive) return null;

  return (
    <div
      ref={containerRef}
      className="w-full rounded-xl overflow-hidden"
    />
  );
}
