"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  SkipForward,
  X,
  Music,
} from "lucide-react";
import { usePlayer } from "@/contexts/music-player-context";
import { formatPlayerTime } from "@/lib/youtube-utils";
import SpotifyEngine from "./SpotifyEngine";

export default function MiniPlayer() {
  const {
    state,
    currentSong,
    currentItem,
    dispatch,
    togglePlay,
    next,
    hasNext,
    close,
    toggleExpanded,
    progress,
  } = usePlayer();

  const handleSpotifyReady = useCallback(() => {
    dispatch({ type: "SET_STATUS", payload: "playing" });
  }, [dispatch]);

  if (!currentSong || !state.isVisible || state.isExpanded) return null;

  const isPlaying = state.status === "playing";
  const isSpotify = currentItem?.source === "spotify";

  // Spotify: show the embed widget as the player
  if (isSpotify) {
    return (
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-16 md:bottom-0 left-0 md:left-64 right-0 z-40 glass-strong border-t border-white/10"
      >
        {/* Song info bar */}
        <div
          className="flex items-center gap-3 px-3 py-1.5 cursor-pointer"
          onClick={toggleExpanded}
        >
          <div className="w-8 h-8 rounded-md overflow-hidden bg-surface-200 shrink-0">
            {currentSong.coverUrl ? (
              <img src={currentSong.coverUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music size={12} className="text-gray-500" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-white truncate font-medium">{currentSong.title}</p>
            <p className="text-[10px] text-gray-400 truncate">{currentSong.artist}</p>
          </div>
          <span className="text-[9px] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded shrink-0">
            Spotify
          </span>
          <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
            {hasNext && (
              <button
                onClick={next}
                className="p-1.5 text-gray-400 hover:text-white transition-colors active:scale-95"
                aria-label="Siguiente"
              >
                <SkipForward size={16} />
              </button>
            )}
            <button
              onClick={close}
              className="p-1.5 text-gray-500 hover:text-white transition-colors active:scale-95"
              aria-label="Cerrar reproductor"
            >
              <X size={14} />
            </button>
          </div>
        </div>
        {/* Spotify embed */}
        <div className="px-3 pb-2" onClick={(e) => e.stopPropagation()}>
          <SpotifyEngine
            spotifyTrackId={currentItem?.spotifyTrackId}
            isActive={true}
            compact
            onReady={handleSpotifyReady}
          />
        </div>
      </motion.div>
    );
  }

  // YouTube / default player
  return (
    <motion.div
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="fixed bottom-16 md:bottom-0 left-0 md:left-64 right-0 z-40 glass-strong border-t border-white/10"
      onClick={toggleExpanded}
    >
      {/* Progress bar */}
      <div className="h-0.5 bg-white/10">
        <div
          className="h-full bg-brand-yellow transition-[width] duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex items-center gap-3 px-3 md:px-4 py-2 md:py-2.5">
        {/* Cover art */}
        <div className="w-10 h-10 md:w-11 md:h-11 rounded-lg overflow-hidden bg-surface-200 shrink-0">
          {currentSong.coverUrl ? (
            <img
              src={currentSong.coverUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music size={16} className="text-gray-500" />
            </div>
          )}
        </div>

        {/* Song info */}
        <div className="min-w-0 flex-1">
          <p className="text-sm text-white truncate font-medium">
            {currentSong.title}
          </p>
          <div className="flex items-center gap-1.5">
            <p className="text-xs text-gray-400 truncate">
              {currentSong.artist}
            </p>
            {state.durationMs > 0 && (
              <span className="text-[10px] text-gray-500 shrink-0">
                {formatPlayerTime(state.currentTimeMs)}
              </span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div
          className="flex items-center gap-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={togglePlay}
            className="p-2 text-white hover:text-brand-yellow transition-colors active:scale-95"
            aria-label={isPlaying ? "Pausar" : "Reproducir"}
          >
            {isPlaying ? (
              <Pause size={20} className="fill-current" />
            ) : (
              <Play size={20} className="fill-current" />
            )}
          </button>
          {hasNext && (
            <button
              onClick={next}
              className="p-2 text-gray-400 hover:text-white transition-colors active:scale-95"
              aria-label="Siguiente"
            >
              <SkipForward size={18} />
            </button>
          )}
          <button
            onClick={close}
            className="p-1.5 text-gray-500 hover:text-white transition-colors active:scale-95"
            aria-label="Cerrar reproductor"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
