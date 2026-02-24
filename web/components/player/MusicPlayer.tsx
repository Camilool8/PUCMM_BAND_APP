"use client";

import { useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { usePlayer } from "@/contexts/music-player-context";
import MiniPlayer from "./MiniPlayer";
import ExpandedPlayer from "./ExpandedPlayer";
import YouTubeEngine from "./YouTubeEngine";

export default function MusicPlayer() {
  const { state, currentItem, dispatch } = usePlayer();

  const handleReady = useCallback(() => {
    dispatch({ type: "SET_STATUS", payload: "playing" });
  }, [dispatch]);

  const handleTimeUpdate = useCallback(
    (data: { currentTimeMs: number; durationMs: number }) => {
      dispatch({ type: "UPDATE_TIME", payload: data });
    },
    [dispatch]
  );

  const handleEnd = useCallback(() => {
    dispatch({ type: "NEXT" });
  }, [dispatch]);

  const handleError = useCallback(() => {
    dispatch({ type: "NEXT" });
  }, [dispatch]);

  const isYouTube = currentItem?.source === "youtube";

  return (
    <>
      {/* Audio engines */}
      {state.isVisible && isYouTube && currentItem?.videoId && (
        <YouTubeEngine
          videoId={currentItem.videoId}
          isPlaying={state.status === "playing"}
          seekTo={state.seekTarget}
          onReady={handleReady}
          onTimeUpdate={handleTimeUpdate}
          onEnd={handleEnd}
          onError={handleError}
        />
      )}

      {/* Mini player - renders in place, safe with AnimatePresence */}
      <AnimatePresence>
        {state.isVisible && !state.isExpanded && currentItem && (
          <MiniPlayer key="mini" />
        )}
      </AnimatePresence>

      {/* Expanded player - manages its own portal + AnimatePresence internally
          to avoid removeChild errors from portal/AnimatePresence conflicts */}
      <ExpandedPlayer />
    </>
  );
}
