"use client";

import { useMemo } from "react";
import { Play, Pause } from "lucide-react";
import { usePlayer, type SourceContext } from "@/contexts/music-player-context";
import type { SetlistItem, Song } from "@/lib/api";
import { cn } from "@/lib/utils";

interface PlaySetlistButtonProps {
  setlistItems: SetlistItem[];
  songs?: Song[];
  context: SourceContext;
  className?: string;
}

export default function PlaySetlistButton({
  setlistItems,
  songs,
  context,
  className,
}: PlaySetlistButtonProps) {
  const { playSetlist, togglePlay, state } = usePlayer();

  const items = useMemo((): SetlistItem[] => {
    if (setlistItems.length > 0) return setlistItems;
    if (!songs || songs.length === 0) return [];
    return songs.map((s, i) => ({
      id: s.id,
      itemType: "song" as const,
      order: i,
      song: s,
      block: null,
    }));
  }, [setlistItems, songs]);

  const playableCount = useMemo(() => {
    return items.filter(
      (item) =>
        item.itemType === "song" &&
        item.song &&
        (item.song.youtubeUrl || item.song.spotifyUrl)
    ).length;
  }, [items]);

  if (playableCount === 0) return null;

  const isThisContext =
    state.sourceContext?.type === context.type &&
    state.sourceContext?.id === context.id;
  const isThisPlaying = isThisContext && state.status === "playing";
  const isThisPaused = isThisContext && state.status === "paused";

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isThisContext && (state.status === "playing" || state.status === "paused")) {
      togglePlay();
    } else {
      playSetlist(items, context);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex items-center gap-1.5 text-sm font-medium px-2.5 py-1.5 rounded-lg transition-all active:scale-95",
        isThisPlaying || isThisPaused
          ? "bg-brand-yellow/20 text-brand-yellow"
          : "text-brand-yellow/70 hover:text-brand-yellow hover:bg-brand-yellow/10",
        className
      )}
    >
      {isThisPlaying ? (
        <Pause size={14} className="fill-current" />
      ) : (
        <Play size={14} className="fill-current" />
      )}
      <span className="hidden sm:inline">
        {isThisPlaying ? "Pausar" : isThisPaused ? "Continuar" : "Reproducir"}
      </span>
    </button>
  );
}
