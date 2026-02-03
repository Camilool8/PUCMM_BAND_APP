"use client";

import { useState, useEffect } from "react";
import {
  Music,
  PlayCircle,
  CheckCircle2,
  Link as LinkIcon,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useCreateSong } from "@/hooks/use-songs";
import { useResolveMusicLink } from "@/hooks/use-music-metadata";
import { isMusicLink, formatDurationFromMs, getPlatformIcon } from "@/hooks/use-music-metadata";
import type { SongStatus, SongMetadata } from "@/lib/api";

// Platform icons as SVG
const SpotifyIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
  </svg>
);

const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const AppleMusicIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.99c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.4-1.336.53-2.3 1.452-2.865 2.78-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.801.42.127.856.187 1.293.228.555.053 1.11.06 1.667.06h11.03a12.5 12.5 0 001.57-.1c.822-.106 1.596-.35 2.295-.81a5.046 5.046 0 001.88-2.207c.186-.42.293-.87.37-1.324.113-.675.138-1.358.137-2.04-.002-3.8 0-7.595-.003-11.393zm-6.423 3.99v5.712c0 .417-.058.827-.244 1.206-.29.59-.76.962-1.388 1.14-.35.1-.706.157-1.07.173-.95.042-1.785-.455-2.105-1.392-.227-.665-.198-1.342.124-1.987.31-.62.823-1.017 1.478-1.223.376-.118.77-.174 1.16-.222.376-.046.75-.098 1.13-.15V8.687a.588.588 0 00-.003-.063.21.21 0 00-.194-.18c-.065-.008-.13-.003-.193.006-.76.097-1.52.197-2.28.298l-3.674.483a.287.287 0 00-.193.096.248.248 0 00-.048.163v7.418c0 .31-.02.618-.11.916-.213.7-.63 1.222-1.302 1.503-.374.157-.77.227-1.175.25-.928.054-1.77-.338-2.158-1.303-.232-.574-.24-1.167-.078-1.758.217-.79.706-1.353 1.463-1.668.37-.154.76-.227 1.155-.267.453-.046.907-.095 1.36-.144v-.003-.004-5.26c0-.083.002-.167.017-.25.03-.17.126-.287.293-.326.1-.024.203-.037.306-.05l3.896-.51 3.468-.456c.106-.013.212-.032.318-.035.17-.005.287.098.324.265.015.067.02.138.02.208z"/>
  </svg>
);

interface AdminSongModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_OPTIONS: {
  value: SongStatus;
  label: string;
  description: string;
  icon: typeof PlayCircle;
  color: string;
}[] = [
  {
    value: "REHEARSING",
    label: "Ensayando",
    description: "Comenzar a montar inmediatamente",
    icon: PlayCircle,
    color: "text-yellow-400",
  },
  {
    value: "READY",
    label: "Lista",
    description: "Ya montada, lista para tocar",
    icon: CheckCircle2,
    color: "text-green-400",
  },
];

export default function AdminSongModal({ isOpen, onClose }: AdminSongModalProps) {
  const [activeTab, setActiveTab] = useState<"link" | "manual">("link");
  const [musicUrl, setMusicUrl] = useState("");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [bpm, setBpm] = useState("");
  const [key, setKey] = useState("");
  const [genre, setGenre] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [durationMs, setDurationMs] = useState<number | undefined>();
  const [releaseDate, setReleaseDate] = useState("");
  const [isrc, setIsrc] = useState("");
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [appleMusicUrl, setAppleMusicUrl] = useState("");
  const [status, setStatus] = useState<SongStatus>("REHEARSING");
  const [resolvedMetadata, setResolvedMetadata] = useState<SongMetadata | null>(null);

  const createSong = useCreateSong();
  const resolveMusicLink = useResolveMusicLink();

  // Auto-resolve music link when URL changes
  useEffect(() => {
    if (musicUrl && isMusicLink(musicUrl)) {
      const timer = setTimeout(() => {
        resolveMusicLink.mutate(musicUrl, {
          onSuccess: (data) => {
            if (data.success && data.metadata) {
              const meta = data.metadata;
              setResolvedMetadata(meta);
              setTitle(meta.title);
              setArtist(meta.artist);
              if (meta.bpm) setBpm(meta.bpm.toString());
              if (meta.key) setKey(meta.key);
              if (meta.genre) setGenre(meta.genre);
              if (meta.coverUrl) setCoverUrl(meta.coverUrl);
              if (meta.durationMs) setDurationMs(meta.durationMs);
              if (meta.releaseDate) setReleaseDate(meta.releaseDate);
              if (meta.isrc) setIsrc(meta.isrc);

              // Set the original URL based on detected platform
              if (musicUrl.includes("spotify")) {
                setSpotifyUrl(musicUrl);
              } else if (musicUrl.includes("youtube") || musicUrl.includes("youtu.be")) {
                setYoutubeUrl(musicUrl);
              } else if (musicUrl.includes("apple")) {
                setAppleMusicUrl(musicUrl);
              }
            }
          },
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [musicUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await createSong.mutateAsync({
      title,
      artist,
      bpm: bpm ? parseInt(bpm) : undefined,
      key: key || undefined,
      genre: genre || undefined,
      coverUrl: coverUrl || undefined,
      durationMs: durationMs || undefined,
      releaseDate: releaseDate || undefined,
      isrc: isrc || undefined,
      spotifyUrl: spotifyUrl || undefined,
      youtubeUrl: youtubeUrl || undefined,
      appleMusicUrl: appleMusicUrl || undefined,
      status,
    });

    resetForm();
    onClose();
  };

  const resetForm = () => {
    setActiveTab("link");
    setMusicUrl("");
    setTitle("");
    setArtist("");
    setBpm("");
    setKey("");
    setGenre("");
    setCoverUrl("");
    setDurationMs(undefined);
    setReleaseDate("");
    setIsrc("");
    setSpotifyUrl("");
    setYoutubeUrl("");
    setAppleMusicUrl("");
    setStatus("REHEARSING");
    setResolvedMetadata(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const clearResolvedData = () => {
    setMusicUrl("");
    setTitle("");
    setArtist("");
    setBpm("");
    setKey("");
    setGenre("");
    setCoverUrl("");
    setDurationMs(undefined);
    setReleaseDate("");
    setIsrc("");
    setSpotifyUrl("");
    setYoutubeUrl("");
    setAppleMusicUrl("");
    setResolvedMetadata(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <Modal.Header
          icon={<Music size={24} />}
          subtitle="Agregar una cancion al repertorio"
        >
          Nueva Cancion
        </Modal.Header>

        <Modal.Body className="space-y-5">
          {/* Tab Selection */}
          <div className="flex gap-2 p-1 bg-surface-100 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab("link")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "link"
                  ? "bg-brand-yellow text-brand-blue-primary"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <LinkIcon size={16} />
              Pegar Enlace
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("manual")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "manual"
                  ? "bg-brand-yellow text-brand-blue-primary"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Music size={16} />
              Manual
            </button>
          </div>

          {/* Link Tab Content */}
          {activeTab === "link" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs text-gray-400 uppercase tracking-wide font-medium">
                  Enlace de Musica
                </label>
                <div className="relative">
                  <input
                    value={musicUrl}
                    onChange={(e) => setMusicUrl(e.target.value)}
                    placeholder="Pega un enlace de Spotify, YouTube o Apple Music..."
                    className="w-full bg-surface-100/80 border border-surface-200 rounded-xl px-4 py-3.5 pr-12 text-white placeholder:text-gray-500 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20 outline-none transition-all duration-200"
                  />
                  {resolveMusicLink.isPending && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Loader2 size={20} className="text-brand-yellow animate-spin" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Soportamos Spotify, YouTube y Apple Music
                </p>
              </div>

              {/* Error message */}
              {resolveMusicLink.isError && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                  <AlertCircle size={16} />
                  No se pudo obtener informacion del enlace
                </div>
              )}

              {/* Preview Card */}
              {resolvedMetadata && (
                <div className="relative bg-surface-100/50 rounded-2xl border border-surface-200/50 overflow-hidden">
                  <button
                    type="button"
                    onClick={clearResolvedData}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white/80 hover:text-white transition-all z-10"
                  >
                    <X size={14} />
                  </button>
                  <div className="flex gap-4 p-4">
                    {coverUrl && (
                      <img
                        src={coverUrl}
                        alt={title}
                        className="w-24 h-24 rounded-xl object-cover shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white truncate">{title}</h4>
                      <p className="text-sm text-gray-400 truncate">{artist}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {genre && (
                          <span className="text-xs px-2 py-0.5 bg-purple-500/30 text-purple-300 rounded-full">
                            {genre}
                          </span>
                        )}
                        {bpm && (
                          <span className="text-xs px-2 py-0.5 bg-brand-blue-primary/50 text-white rounded-full">
                            {bpm} BPM
                          </span>
                        )}
                        {key && (
                          <span className="text-xs px-2 py-0.5 bg-brand-yellow/80 text-brand-blue-primary rounded-full font-medium">
                            {key}
                          </span>
                        )}
                        {durationMs && (
                          <span className="text-xs px-2 py-0.5 bg-surface-200 text-gray-300 rounded-full">
                            {formatDurationFromMs(durationMs)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Always show editable fields (either auto-filled or manual) */}
          <div className={`space-y-4 ${activeTab === "link" && !resolvedMetadata ? "hidden" : ""}`}>
            {/* Title */}
            <div className="space-y-2">
              <label className="block text-xs text-gray-400 uppercase tracking-wide font-medium">
                Titulo *
              </label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Bachata Rosa"
                className="w-full bg-surface-100/80 border border-surface-200 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-500 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20 outline-none transition-all duration-200"
              />
            </div>

            {/* Artist */}
            <div className="space-y-2">
              <label className="block text-xs text-gray-400 uppercase tracking-wide font-medium">
                Artista Original *
              </label>
              <input
                required
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Ej: Juan Luis Guerra"
                className="w-full bg-surface-100/80 border border-surface-200 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-500 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20 outline-none transition-all duration-200"
              />
            </div>

            {/* BPM, Key & Genre */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-xs text-gray-400 uppercase tracking-wide font-medium">
                  BPM
                </label>
                <input
                  type="number"
                  value={bpm}
                  onChange={(e) => setBpm(e.target.value)}
                  placeholder="120"
                  min="40"
                  max="300"
                  className="w-full bg-surface-100/80 border border-surface-200 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-500 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20 outline-none transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs text-gray-400 uppercase tracking-wide font-medium">
                  Tonalidad
                </label>
                <input
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="Am, C..."
                  className="w-full bg-surface-100/80 border border-surface-200 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-500 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20 outline-none transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs text-gray-400 uppercase tracking-wide font-medium">
                  Genero
                </label>
                <input
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="Pop, Rock..."
                  className="w-full bg-surface-100/80 border border-surface-200 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-500 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20 outline-none transition-all duration-200"
                />
              </div>
            </div>

            {/* Music Links */}
            <div className="space-y-2">
              <label className="block text-xs text-gray-400 uppercase tracking-wide font-medium">
                Enlaces para Escuchar
              </label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-[#1DB954]/20 flex items-center justify-center text-[#1DB954] shrink-0">
                    <SpotifyIcon />
                  </div>
                  <input
                    value={spotifyUrl}
                    onChange={(e) => setSpotifyUrl(e.target.value)}
                    placeholder="https://open.spotify.com/track/..."
                    className="flex-1 bg-surface-100/80 border border-surface-200 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/20 outline-none transition-all duration-200"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-[#FF0000]/20 flex items-center justify-center text-[#FF0000] shrink-0">
                    <YouTubeIcon />
                  </div>
                  <input
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="flex-1 bg-surface-100/80 border border-surface-200 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/20 outline-none transition-all duration-200"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-[#FC3C44]/20 flex items-center justify-center text-[#FC3C44] shrink-0">
                    <AppleMusicIcon />
                  </div>
                  <input
                    value={appleMusicUrl}
                    onChange={(e) => setAppleMusicUrl(e.target.value)}
                    placeholder="https://music.apple.com/..."
                    className="flex-1 bg-surface-100/80 border border-surface-200 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/20 outline-none transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Status Selection */}
            <div className="space-y-2">
              <label className="block text-xs text-gray-400 uppercase tracking-wide font-medium">
                Estado Inicial
              </label>
              <div className="grid grid-cols-1 gap-2">
                {STATUS_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = status === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setStatus(option.value)}
                      className={`
                        flex items-center justify-between p-4 rounded-xl border text-left transition-all
                        ${
                          isSelected
                            ? "border-brand-yellow bg-brand-yellow/10 text-white ring-2 ring-brand-yellow/30"
                            : "border-surface-200 bg-surface-100/50 text-gray-400 hover:border-white/20 hover:text-white"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={20} className={isSelected ? option.color : "text-gray-500"} />
                        <div>
                          <p className="font-medium">{option.label}</p>
                          <p className="text-xs opacity-70">{option.description}</p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-brand-yellow flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-brand-blue-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className="flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-3.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-medium transition-all duration-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={createSong.isPending || !title || !artist}
            className="flex-1 py-3.5 rounded-xl bg-brand-yellow hover:bg-brand-yellow/90 text-brand-blue-primary font-bold shadow-lg shadow-brand-yellow/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {createSong.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-brand-blue-primary/30 border-t-brand-blue-primary rounded-full animate-spin" />
                Creando...
              </span>
            ) : (
              "Crear Cancion"
            )}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
