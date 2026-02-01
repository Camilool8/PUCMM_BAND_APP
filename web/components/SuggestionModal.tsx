"use client";

import { useState } from "react";
import { Music, Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useCreateSong } from "@/hooks/use-songs";

interface SuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SuggestionModal({ isOpen, onClose }: SuggestionModalProps) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [bpm, setBpm] = useState("");
  const [key, setKey] = useState("");
  const createSong = useCreateSong();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await createSong.mutateAsync({
      title,
      artist,
      bpm: bpm ? parseInt(bpm) : undefined,
      key: key || undefined,
    });

    // Reset form
    setTitle("");
    setArtist("");
    setBpm("");
    setKey("");
    onClose();
  };

  const handleClose = () => {
    // Reset form on close
    setTitle("");
    setArtist("");
    setBpm("");
    setKey("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <form onSubmit={handleSubmit} className="flex flex-col">
        <Modal.Header icon={<Sparkles size={24} />} subtitle="Agrega una nueva cancion al repertorio">
          Sugerir Cancion
        </Modal.Header>

        <Modal.Body className="space-y-5">
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
              autoFocus
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

          {/* Hint */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-brand-blue-primary/10 border border-brand-blue-primary/20">
            <Music size={16} className="text-brand-blue-primary shrink-0 mt-0.5" />
            <p className="text-xs text-gray-400">
              Tu sugerencia sera revisada por los administradores antes de ser anadida al repertorio.
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
            disabled={createSong.isPending || !title || !artist}
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
