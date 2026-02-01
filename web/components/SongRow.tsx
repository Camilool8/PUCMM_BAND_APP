"use client";

import { ChevronRight, Music } from "lucide-react";
import StatusBadge from "./StatusBadge";
import type { Song } from "@/lib/api";

interface SongRowProps {
  song: Song;
  index: number;
  onClick: (song: Song) => void;
}

export default function SongRow({ song, index, onClick }: SongRowProps) {
  return (
    <div
      onClick={() => onClick(song)}
      className="
        group flex items-center gap-3 md:gap-4 p-2.5 md:p-3
        rounded-xl cursor-pointer
        transition-smooth
        hover:bg-white/5 active:bg-white/10
        border border-transparent hover:border-white/5
      "
    >
      {/* Index */}
      <div className="w-6 md:w-8 shrink-0 text-center">
        <span className="text-gray-500 text-sm font-medium">
          {index + 1}
        </span>
      </div>

      {/* Cover */}
      <div className="relative w-11 h-11 md:w-12 md:h-12 rounded-lg overflow-hidden shadow-lg shrink-0 bg-surface-100">
        {song.coverUrl ? (
          <img
            src={song.coverUrl}
            alt={song.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-tertiary bg-linear-to-br from-surface-100 to-surface-200">
            <Music size={18} />
          </div>
        )}
      </div>

      {/* Title & Artist */}
      <div className="flex-1 min-w-0">
        <div className="text-white font-medium truncate text-sm md:text-base group-hover:text-brand-yellow transition-smooth">
          {song.title}
        </div>
        <div className="text-gray-400 text-xs md:text-sm truncate">
          {song.artist}
        </div>
      </div>

      {/* Status - Hidden on mobile, shown as dot indicator */}
      <div className="hidden sm:block">
        <StatusBadge status={song.status} />
      </div>

      {/* Mobile Status Dot */}
      <div className="sm:hidden shrink-0">
        <div
          className={`w-2.5 h-2.5 rounded-full ${
            song.status === "READY"
              ? "bg-green-400"
              : song.status === "REHEARSING"
              ? "bg-yellow-400"
              : "bg-red-400"
          }`}
        />
      </div>

      {/* BPM & Key - Only desktop */}
      <div className="hidden lg:flex items-center gap-3 text-xs text-gray-400">
        {song.bpm && (
          <span className="bg-white/5 px-2 py-1 rounded-md font-mono">
            {song.bpm} BPM
          </span>
        )}
        {song.key && (
          <span className="bg-white/5 px-2 py-1 rounded-md font-mono">
            {song.key}
          </span>
        )}
      </div>

      {/* Chevron indicator */}
      <ChevronRight
        size={18}
        className="text-gray-500 group-hover:text-gray-300 transition-smooth shrink-0"
      />
    </div>
  );
}
