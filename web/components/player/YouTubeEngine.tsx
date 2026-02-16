"use client";

import { useEffect, useRef, useCallback } from "react";
import { loadYouTubeAPI } from "@/lib/youtube-utils";

interface YouTubeEngineProps {
  videoId: string | undefined;
  isPlaying: boolean;
  seekTo: number | null;
  onReady: () => void;
  onTimeUpdate: (data: { currentTimeMs: number; durationMs: number }) => void;
  onEnd: () => void;
  onError: () => void;
}

export default function YouTubeEngine({
  videoId,
  isPlaying,
  seekTo,
  onReady,
  onTimeUpdate,
  onEnd,
  onError,
}: YouTubeEngineProps) {
  const playerRef = useRef<YT.Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentVideoIdRef = useRef<string | undefined>(undefined);
  const isReadyRef = useRef(false);

  // Stable callback refs
  const onReadyRef = useRef(onReady);
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const onEndRef = useRef(onEnd);
  const onErrorRef = useRef(onError);

  onReadyRef.current = onReady;
  onTimeUpdateRef.current = onTimeUpdate;
  onEndRef.current = onEnd;
  onErrorRef.current = onError;

  const startTimeUpdates = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      try {
        const currentTimeMs = player.getCurrentTime() * 1000;
        const durationMs = player.getDuration() * 1000;
        if (durationMs > 0) {
          onTimeUpdateRef.current({ currentTimeMs, durationMs });
        }
      } catch {
        // Player might not be ready
      }
    }, 250);
  }, []);

  const stopTimeUpdates = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Initialize player
  useEffect(() => {
    if (!videoId || !containerRef.current) return;

    let destroyed = false;

    const init = async () => {
      await loadYouTubeAPI();
      if (destroyed || !containerRef.current) return;

      // Destroy existing player if any
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // ignore
        }
        playerRef.current = null;
      }

      isReadyRef.current = false;
      currentVideoIdRef.current = videoId;

      playerRef.current = new YT.Player(containerRef.current, {
        width: 1,
        height: 1,
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: () => {
            if (destroyed) return;
            isReadyRef.current = true;
            onReadyRef.current();
            startTimeUpdates();
          },
          onStateChange: (event: YT.PlayerEvent) => {
            if (destroyed) return;
            if (event.data === YT.PlayerState.ENDED) {
              stopTimeUpdates();
              onEndRef.current();
            } else if (event.data === YT.PlayerState.PLAYING) {
              startTimeUpdates();
            } else if (event.data === YT.PlayerState.PAUSED) {
              stopTimeUpdates();
            }
          },
          onError: () => {
            if (destroyed) return;
            stopTimeUpdates();
            onErrorRef.current();
          },
        },
      });
    };

    init();

    return () => {
      destroyed = true;
      stopTimeUpdates();
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // ignore
        }
        playerRef.current = null;
      }
      isReadyRef.current = false;
    };
  }, [videoId, startTimeUpdates, stopTimeUpdates]);

  // Handle play/pause
  useEffect(() => {
    const player = playerRef.current;
    if (!player || !isReadyRef.current) return;

    try {
      if (isPlaying) {
        player.playVideo();
      } else {
        player.pauseVideo();
      }
    } catch {
      // Player might be destroyed
    }
  }, [isPlaying]);

  // Handle seek
  useEffect(() => {
    const player = playerRef.current;
    if (!player || !isReadyRef.current || seekTo === null) return;

    try {
      player.seekTo(seekTo / 1000, true);
    } catch {
      // Player might be destroyed
    }
  }, [seekTo]);

  return (
    <div
      ref={containerRef}
      className="sr-only"
      aria-hidden="true"
    />
  );
}
