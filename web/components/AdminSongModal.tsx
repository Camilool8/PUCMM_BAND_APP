"use client";

import { useState } from "react";
import { Plus, Music, PlayCircle, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useCreateSong } from "@/hooks/use-songs";
import type { SongStatus } from "@/lib/api";

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
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [bpm, setBpm] = useState("");
  const [key, setKey] = useState("");
  const [status, setStatus] = useState<SongStatus>("REHEARSING");
  const createSong = useCreateSong();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await createSong.mutateAsync({
      title,
      artist,
      bpm: bpm ? parseInt(bpm) : undefined,
      key: key || undefined,
      status,
    });

    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTitle("");
    setArtist("");
    setBpm("");
    setKey("");
    setStatus("REHEARSING");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <form onSubmit={handleSubmit} className="flex flex-col">
        <Modal.Header
          icon={<Music size={24} />}
          subtitle="Agregar una cancion directamente al repertorio"
        >
          Nueva Cancion
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
                placeholder="Am, C, G..."
                className="w-full bg-surface-100/80 border border-surface-200 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-500 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20 outline-none transition-all duration-200"
              />
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
