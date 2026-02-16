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

  if (!state.isVisible) return null;

  const isYouTube = currentItem?.source === "youtube";
  const isSpotify = currentItem?.source === "spotify";

  return (
    <>
      {/* Audio engines */}
      {isYouTube && currentItem?.videoId && (
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

      {/* Visual components */}
      <AnimatePresence mode="wait">
        {!state.isExpanded && <MiniPlayer key="mini" />}
        {state.isExpanded && <ExpandedPlayer key="expanded" />}
      </AnimatePresence>
    </>
  );
}
