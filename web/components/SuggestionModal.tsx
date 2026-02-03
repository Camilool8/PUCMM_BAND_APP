"use client";

import { useState, useEffect } from "react";
import { Music, Sparkles, Link, Search, Loader2, Check, Clock, ExternalLink } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useCreateSong } from "@/hooks/use-songs";
import { useResolveMusicLink, isMusicLink, formatDurationFromMs } from "@/hooks/use-music-metadata";
import type { SongMetadata } from "@/lib/api";

interface SuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type InputMode = "link" | "manual";

export default function SuggestionModal({ isOpen, onClose }: SuggestionModalProps) {
  const [mode, setMode] = useState<InputMode>("link");
  const [musicLink, setMusicLink] = useState("");
  const [metadata, setMetadata] = useState<SongMetadata | null>(null);

  // Manual input fields (used for editing fetched data or manual entry)
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [bpm, setBpm] = useState("");
  const [key, setKey] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [durationMs, setDurationMs] = useState<number | null>(null);

  const createSong = useCreateSong();
  const resolveLink = useResolveMusicLink();

  // Auto-resolve link when it looks valid
  useEffect(() => {
    if (mode === "link" && musicLink && isMusicLink(musicLink)) {
      const timer = setTimeout(() => {
        resolveLink.mutate(musicLink);
      }, 500); // Debounce

      return () => clearTimeout(timer);
    }
  }, [musicLink, mode]);

  // Update form when metadata is fetched
  useEffect(() => {
    if (resolveLink.data?.success && resolveLink.data.metadata) {
      const m = resolveLink.data.metadata;
      setMetadata(m);
      setTitle(m.title);
      setArtist(m.artist);
      setBpm(m.bpm?.toString() || "");
      setKey(m.key || "");
      setCoverUrl(m.coverUrl || "");
      setDurationMs(m.durationMs || null);
    }
  }, [resolveLink.data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await createSong.mutateAsync({
      title,
      artist,
      bpm: bpm ? parseInt(bpm) : undefined,
      key: key || undefined,
      coverUrl: coverUrl || undefined,
      durationMs: durationMs || undefined,
    });

    handleClose();
  };

  const handleClose = () => {
    // Reset all state
    setMode("link");
    setMusicLink("");
    setMetadata(null);
    setTitle("");
    setArtist("");
    setBpm("");
    setKey("");
    setCoverUrl("");
    setDurationMs(null);
    resolveLink.reset();
    onClose();
  };

  const handleModeChange = (newMode: InputMode) => {
    setMode(newMode);
    // Clear metadata when switching modes
    setMetadata(null);
    setMusicLink("");
    resolveLink.reset();
  };

  const canSubmit = title && artist && !createSong.isPending;
  const isLoading = resolveLink.isPending;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <form onSubmit={handleSubmit} className="flex flex-col">
        <Modal.Header icon={<Sparkles size={24} />} subtitle="Agrega una nueva canción al repertorio">
          Sugerir Canción
        </Modal.Header>

        <Modal.Body className="space-y-5">
          {/* Mode Tabs */}
          <div className="flex gap-2 p-1 bg-surface-100/50 rounded-xl">
            <button
              type="button"
              onClick={() => handleModeChange("link")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                mode === "link"
                  ? "bg-brand-yellow text-brand-blue-primary"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Link size={16} />
              Pegar Enlace
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("manual")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                mode === "manual"
                  ? "bg-brand-yellow text-brand-blue-primary"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Search size={16} />
              Manual
            </button>
          </div>

          {/* Link Input Mode */}
          {mode === "link" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs text-gray-400 uppercase tracking-wide font-medium">
                  Enlace de Música
                </label>
                <div className="relative">
                  <input
                    value={musicLink}
                    onChange={(e) => setMusicLink(e.target.value)}
                    placeholder="Pega un enlace de Spotify, YouTube o Apple Music"
                    autoFocus
                    className="
                      w-full bg-surface-100/80 border border-surface-200
                      rounded-xl px-4 py-3.5 pr-12 text-white
                      placeholder:text-gray-500
                      focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20
                      outline-none transition-all duration-200
                    "
                  />
                  {isLoading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Loader2 size={20} className="text-brand-yellow animate-spin" />
                    </div>
                  )}
                  {metadata && !isLoading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Check size={20} className="text-emerald-400" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Soportamos enlaces de Spotify, YouTube y Apple Music
                </p>
              </div>

              {/* Metadata Preview */}
              {metadata && (
                <div className="p-4 bg-surface-100/50 rounded-xl border border-surface-200/50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex gap-4">
                    {/* Cover */}
                    <div className="w-20 h-20 rounded-lg bg-surface-200 shrink-0 overflow-hidden">
                      {coverUrl ? (
                        <img src={coverUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music size={24} className="text-gray-500" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-white font-medium truncate">{title}</h4>
                      <p className="text-sm text-gray-400 truncate">{artist}</p>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {durationMs && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-200/50 rounded text-xs text-gray-400">
                            <Clock size={12} />
                            {formatDurationFromMs(durationMs)}
                          </span>
                        )}
                        {bpm && (
                          <span className="px-2 py-0.5 bg-surface-200/50 rounded text-xs text-gray-400">
                            {bpm} BPM
                          </span>
                        )}
                        {key && (
                          <span className="px-2 py-0.5 bg-surface-200/50 rounded text-xs text-gray-400">
                            {key}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Edit Note */}
                  <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-surface-200/50">
                    Puedes editar la información antes de enviar
                  </p>
                </div>
              )}

              {/* Error State */}
              {resolveLink.isError && musicLink && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <p className="text-sm text-red-400">
                    No se pudo obtener información del enlace. Verifica que sea válido o usa el modo manual.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Editable Fields (shown when we have metadata or in manual mode) */}
          {(metadata || mode === "manual") && (
            <div className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <label className="block text-xs text-gray-400 uppercase tracking-wide font-medium">
                  Título *
                </label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Bachata Rosa"
                  autoFocus={mode === "manual"}
                  className="
                    w-full bg-surface-100/80 border border-surface-200
                    rounded-xl px-4 py-3.5 text-white
                    placeholder:text-gray-500
                    focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20
                    outline-none transition-all duration-200
                  "
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
                  className="
                    w-full bg-surface-100/80 border border-surface-200
                    rounded-xl px-4 py-3.5 text-white
                    placeholder:text-gray-500
                    focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20
                    outline-none transition-all duration-200
                  "
                />
              </div>

              {/* BPM & Key */}
              <div className="grid grid-cols-2 gap-4">
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
                    className="
                      w-full bg-surface-100/80 border border-surface-200
                      rounded-xl px-4 py-3.5 text-white
                      placeholder:text-gray-500
                      focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20
                      outline-none transition-all duration-200
                    "
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs text-gray-400 uppercase tracking-wide font-medium">
                    Tonalidad
                  </label>
                  <input
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="Am, C, G..."
                    className="
                      w-full bg-surface-100/80 border border-surface-200
                      rounded-xl px-4 py-3.5 text-white
                      placeholder:text-gray-500
                      focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20
                      outline-none transition-all duration-200
                    "
                  />
                </div>
              </div>
            </div>
          )}

          {/* Hint */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-surface-100/50 border border-surface-200/50">
            <Music size={16} className="text-gray-400 shrink-0 mt-0.5" />
            <p className="text-xs text-gray-400">
              Tu sugerencia será revisada por los administradores antes de ser añadida al repertorio.
            </p>
          </div>
        </Modal.Body>

        <Modal.Footer className="flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="
              flex-1 py-3.5 rounded-xl
              text-gray-400 hover:text-white
              hover:bg-white/5
              font-medium transition-all duration-200
            "
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="
              flex-1 py-3.5 rounded-xl
              bg-brand-yellow hover:bg-brand-yellow/90
              text-brand-blue-primary font-bold
              shadow-lg shadow-brand-yellow/20
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              disabled:shadow-none
            "
          >
            {createSong.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-brand-blue-primary/30 border-t-brand-blue-primary rounded-full animate-spin" />
                Enviando...
              </span>
            ) : (
              "Enviar Sugerencia"
            )}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
