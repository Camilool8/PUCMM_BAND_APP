"use client";

import { ChevronRight, Music, Clock } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { CachedImage } from "@/components/ui/CachedImage";
import type { Song } from "@/lib/api";

interface SongRowProps {
  song: Song;
  index: number;
  onClick: (song: Song) => void;
  dataTour?: string;
}

// Platform icons as SVG components
const SpotifyIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className || "w-4 h-4"} fill="currentColor">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
  </svg>
);

const YouTubeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className || "w-4 h-4"} fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const AppleMusicIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className || "w-4 h-4"} fill="currentColor">
    <path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.99c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.4-1.336.53-2.3 1.452-2.865 2.78-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.801.42.127.856.187 1.293.228.555.053 1.11.06 1.667.06h11.03a12.5 12.5 0 001.57-.1c.822-.106 1.596-.35 2.295-.81a5.046 5.046 0 001.88-2.207c.186-.42.293-.87.37-1.324.113-.675.138-1.358.137-2.04-.002-3.8 0-7.595-.003-11.393zm-6.423 3.99v5.712c0 .417-.058.827-.244 1.206-.29.59-.76.962-1.388 1.14-.35.1-.706.157-1.07.173-.95.042-1.785-.455-2.105-1.392-.227-.665-.198-1.342.124-1.987.31-.62.823-1.017 1.478-1.223.376-.118.77-.174 1.16-.222.376-.046.75-.098 1.13-.15V8.687a.588.588 0 00-.003-.063.21.21 0 00-.194-.18c-.065-.008-.13-.003-.193.006-.76.097-1.52.197-2.28.298l-3.674.483a.287.287 0 00-.193.096.248.248 0 00-.048.163v7.418c0 .31-.02.618-.11.916-.213.7-.63 1.222-1.302 1.503-.374.157-.77.227-1.175.25-.928.054-1.77-.338-2.158-1.303-.232-.574-.24-1.167-.078-1.758.217-.79.706-1.353 1.463-1.668.37-.154.76-.227 1.155-.267.453-.046.907-.095 1.36-.144v-.003-.004-5.26c0-.083.002-.167.017-.25.03-.17.126-.287.293-.326.1-.024.203-.037.306-.05l3.896-.51 3.468-.456c.106-.013.212-.032.318-.035.17-.005.287.098.324.265.015.067.02.138.02.208z"/>
  </svg>
);

// Format duration from milliseconds to mm:ss
function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function SongRow({ song, index, onClick, dataTour }: SongRowProps) {
  const hasMusicLinks = song.spotifyUrl || song.youtubeUrl || song.appleMusicUrl;

  const handlePlatformClick = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      onClick={() => onClick(song)}
      data-tour={dataTour}
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
          <CachedImage
            src={song.coverUrl}
            alt={song.title}
            className="w-full h-full"
            fallback={
              <div className="w-full h-full flex items-center justify-center text-text-tertiary bg-linear-to-br from-surface-100 to-surface-200">
                <Music size={18} />
              </div>
            }
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-tertiary bg-linear-to-br from-surface-100 to-surface-200">
            <Music size={18} />
          </div>
        )}
      </div>

      {/* Title & Artist & Genre */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-white font-medium truncate text-sm md:text-base group-hover:text-brand-yellow transition-smooth">
            {song.title}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs md:text-sm">
          <span className="text-gray-400 truncate">{song.artist}</span>
          {song.genre && (
            <>
              <span className="text-gray-600 hidden sm:inline">•</span>
              <span className="text-gray-500 hidden sm:inline truncate">{song.genre}</span>
            </>
          )}
        </div>
      </div>

      {/* Duration - Only tablet+ */}
      {song.durationMs && (
        <div className="hidden md:flex items-center gap-1 text-xs text-gray-500 shrink-0">
          <Clock size={12} />
          <span>{formatDuration(song.durationMs)}</span>
        </div>
      )}

      {/* Platform Quick Links - Desktop only */}
      {hasMusicLinks && (
        <div className="hidden lg:flex items-center gap-1 shrink-0">
          {song.spotifyUrl && (
            <button
              onClick={(e) => handlePlatformClick(e, song.spotifyUrl!)}
              className="p-1.5 rounded-full hover:bg-[#1DB954]/20 text-gray-500 hover:text-[#1DB954] transition-all"
              title="Escuchar en Spotify"
            >
              <SpotifyIcon className="w-4 h-4" />
            </button>
          )}
          {song.youtubeUrl && (
            <button
              onClick={(e) => handlePlatformClick(e, song.youtubeUrl!)}
              className="p-1.5 rounded-full hover:bg-[#FF0000]/20 text-gray-500 hover:text-[#FF0000] transition-all"
              title="Ver en YouTube"
            >
              <YouTubeIcon className="w-4 h-4" />
            </button>
          )}
          {song.appleMusicUrl && (
            <button
              onClick={(e) => handlePlatformClick(e, song.appleMusicUrl!)}
              className="p-1.5 rounded-full hover:bg-[#FC3C44]/20 text-gray-500 hover:text-[#FC3C44] transition-all"
              title="Escuchar en Apple Music"
            >
              <AppleMusicIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

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
              : song.status === "PENDING"
              ? "bg-red-400"
              : "bg-gray-400"
          }`}
        />
      </div>

      {/* BPM & Key - Only xl desktop */}
      <div className="hidden xl:flex items-center gap-2 text-xs text-gray-400 shrink-0">
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
