"use client";

import { useCallback } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import {
  ChevronDown,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Music,
  ListMusic,
} from "lucide-react";
import { usePlayer } from "@/contexts/music-player-context";
import { formatPlayerTime } from "@/lib/youtube-utils";
import SpotifyEngine from "./SpotifyEngine";

export default function ExpandedPlayer() {
  const {
    state,
    currentSong,
    currentItem,
    dispatch,
    togglePlay,
    next,
    previous,
    hasNext,
    hasPrevious,
    toggleExpanded,
    seek,
    jumpTo,
    progress,
  } = usePlayer();

  const handleSpotifyReady = useCallback(() => {
    dispatch({ type: "SET_STATUS", payload: "playing" });
  }, [dispatch]);

  if (!state.isExpanded || !state.isVisible || !currentSong) return null;

  const isPlaying = state.status === "playing";
  const isSpotify = currentItem?.source === "spotify";

  const handleSeek = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (isSpotify) return;
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    seek(pct * state.durationMs);
  };

  const portal = document.getElementById("modal-root");
  if (!portal) return null;

  return createPortal(
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="fixed inset-0 z-[9999] bg-surface-0 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <button
          onClick={toggleExpanded}
          className="p-2 text-gray-400 hover:text-white transition-colors active:scale-95"
          aria-label="Minimizar"
        >
          <ChevronDown size={24} />
        </button>
        <div className="text-center flex-1 min-w-0">
          {state.sourceContext && (
            <p className="text-xs text-gray-500 uppercase tracking-wider truncate">
              {state.sourceContext.name}
            </p>
          )}
        </div>
        <div className="w-10" /> {/* Spacer for symmetry */}
      </div>

      {/* Main content - scrollable */}
      <div className="flex-1 overflow-y-auto px-6 pb-8 scrollbar-hide">
        {/* Cover art */}
        <div className="flex justify-center mt-4 mb-6">
          <div className="w-56 h-56 md:w-72 md:h-72 rounded-2xl overflow-hidden bg-surface-100 shadow-2xl">
            {currentSong.coverUrl ? (
              <img
                src={currentSong.coverUrl}
                alt={currentSong.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-surface-100 to-surface-200">
                <Music size={64} className="text-gray-600" />
              </div>
            )}
          </div>
        </div>

        {/* Song info */}
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-white truncate">
            {currentSong.title}
          </h2>
          <p className="text-sm text-gray-400 mt-1">{currentSong.artist}</p>
          {isSpotify && (
            <span className="inline-block mt-2 text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
              Reproduciendo con Spotify
            </span>
          )}
        </div>

        {/* Spotify embed */}
        {isSpotify && (
          <div className="mb-6 max-w-md mx-auto">
            <SpotifyEngine
              spotifyTrackId={currentItem?.spotifyTrackId}
              isActive={true}
              onReady={handleSpotifyReady}
            />
          </div>
        )}

        {/* Progress bar - YouTube only */}
        {!isSpotify && (
          <div className="mb-6">
            <div
              className="h-1.5 bg-white/10 rounded-full cursor-pointer relative group"
              onClick={handleSeek}
              onTouchStart={handleSeek}
            >
              <div
                className="h-full bg-brand-yellow rounded-full relative transition-[width] duration-200"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-brand-yellow rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-gray-500">
                {formatPlayerTime(state.currentTimeMs)}
              </span>
              <span className="text-[10px] text-gray-500">
                {formatPlayerTime(state.durationMs)}
              </span>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <button
            onClick={previous}
            disabled={!hasPrevious && state.currentTimeMs <= 3000}
            className="p-3 text-gray-400 hover:text-white transition-colors disabled:opacity-30 active:scale-95"
            aria-label="Anterior"
          >
            <SkipBack size={28} className="fill-current" />
          </button>
          {!isSpotify && (
            <button
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform active:scale-95"
              aria-label={isPlaying ? "Pausar" : "Reproducir"}
            >
              {isPlaying ? (
                <Pause size={28} className="text-surface-0 fill-current" />
              ) : (
                <Play size={28} className="text-surface-0 fill-current ml-1" />
              )}
            </button>
          )}
          <button
            onClick={next}
            disabled={!hasNext}
            className="p-3 text-gray-400 hover:text-white transition-colors disabled:opacity-30 active:scale-95"
            aria-label="Siguiente"
          >
            <SkipForward size={28} className="fill-current" />
          </button>
        </div>

        {/* Queue */}
        {state.queue.length > 1 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ListMusic size={16} className="text-gray-500" />
              <h3 className="text-sm font-medium text-gray-400">
                Cola ({state.currentIndex + 1}/{state.queue.length})
              </h3>
            </div>
            <div className="space-y-0.5">
              {state.queue.map((item, index) => {
                const isCurrent = index === state.currentIndex;
                return (
                  <button
                    key={item.setlistItemId}
                    onClick={() => jumpTo(index)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      isCurrent
                        ? "bg-brand-yellow/10 text-brand-yellow"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="text-xs w-5 text-center shrink-0 tabular-nums">
                      {isCurrent && isPlaying ? (
                        <span className="inline-flex gap-0.5">
                          <span className="w-0.5 h-3 bg-brand-yellow rounded-full animate-pulse" />
                          <span className="w-0.5 h-2 bg-brand-yellow rounded-full animate-pulse [animation-delay:150ms]" />
                          <span className="w-0.5 h-3 bg-brand-yellow rounded-full animate-pulse [animation-delay:300ms]" />
                        </span>
                      ) : (
                        index + 1
                      )}
                    </span>
                    <div className="w-8 h-8 rounded bg-surface-100 overflow-hidden shrink-0">
                      {item.song.coverUrl ? (
                        <img
                          src={item.song.coverUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music size={12} className="text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm truncate ${isCurrent ? "font-medium" : ""}`}
                      >
                        {item.song.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {item.song.artist}
                      </p>
                    </div>
                    {item.source === "spotify" && (
                      <span className="text-[9px] text-emerald-400 bg-emerald-400/10 px-1 py-0.5 rounded shrink-0">
                        Spotify
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>,
    portal
  );
}
