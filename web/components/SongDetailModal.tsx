"use client";

import { useState, useEffect } from "react";
import {
  Mic2,
  FileMusic,
  Calendar,
  Music,
  CheckCircle2,
  PlayCircle,
  Clock,
  Archive,
  Trash2,
  Shield,
  Pencil,
  X,
  Check,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import StatusBadge from "./StatusBadge";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateSong, useDeleteSong } from "@/hooks/use-songs";
import type { Song, SongStatus } from "@/lib/api";

interface SongDetailModalProps {
  song: Song | null;
  onClose: () => void;
}

const STATUS_OPTIONS: {
  value: SongStatus;
  label: string;
  icon: React.ReactNode;
  color: string;
  activeColor: string;
  description: string;
}[] = [
  {
    value: "PENDING",
    label: "Pendiente",
    icon: <Clock size={16} />,
    color: "text-red-400 border-red-500/30 hover:bg-red-500/10",
    activeColor: "text-red-400 bg-red-500/20 border-red-500/50 ring-2 ring-red-500/30",
    description: "Sugerencia nueva, sin revisar",
  },
  {
    value: "REHEARSING",
    label: "Ensayando",
    icon: <PlayCircle size={16} />,
    color: "text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10",
    activeColor: "text-yellow-400 bg-yellow-500/20 border-yellow-500/50 ring-2 ring-yellow-500/30",
    description: "En proceso de montaje",
  },
  {
    value: "READY",
    label: "Lista",
    icon: <CheckCircle2 size={16} />,
    color: "text-green-400 border-green-500/30 hover:bg-green-500/10",
    activeColor: "text-green-400 bg-green-500/20 border-green-500/50 ring-2 ring-green-500/30",
    description: "Montada y lista para tocar",
  },
  {
    value: "ARCHIVED",
    label: "Archivada",
    icon: <Archive size={16} />,
    color: "text-gray-400 border-gray-500/30 hover:bg-gray-500/10",
    activeColor: "text-gray-400 bg-gray-500/20 border-gray-500/50 ring-2 ring-gray-500/30",
    description: "Ya no se toca activamente",
  },
];

export default function SongDetailModal({ song, onClose }: SongDetailModalProps) {
  const { canManageSongs } = useAuth();
  const updateSong = useUpdateSong();
  const deleteSong = useDeleteSong();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editArtist, setEditArtist] = useState("");
  const [editBpm, setEditBpm] = useState("");
  const [editKey, setEditKey] = useState("");

  // Optimistic status state for immediate UI feedback
  const [currentStatus, setCurrentStatus] = useState<SongStatus | null>(null);

  // Initialize edit values when song changes
  useEffect(() => {
    if (song) {
      setEditTitle(song.title);
      setEditArtist(song.artist);
      setEditBpm(song.bpm?.toString() || "");
      setEditKey(song.key || "");
      setCurrentStatus(song.status);
      setIsEditing(false);
      setShowDeleteConfirm(false);
    }
  }, [song]);

  if (!song) return null;

  const handleStatusChange = async (newStatus: SongStatus) => {
    // Optimistic update for immediate UI feedback
    setCurrentStatus(newStatus);
    await updateSong.mutateAsync({ id: song.id, data: { status: newStatus } });
  };

  const handleSaveEdit = async () => {
    await updateSong.mutateAsync({
      id: song.id,
      data: {
        title: editTitle,
        artist: editArtist,
        bpm: editBpm ? parseInt(editBpm) : undefined,
        key: editKey || undefined,
      },
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(song.title);
    setEditArtist(song.artist);
    setEditBpm(song.bpm?.toString() || "");
    setEditKey(song.key || "");
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await deleteSong.mutateAsync(song.id);
    onClose();
  };

  const handleClose = () => {
    setShowDeleteConfirm(false);
    setIsEditing(false);
    onClose();
  };

  return (
    <Modal isOpen={!!song} onClose={handleClose} size="lg" showCloseButton={false}>
      {/* Custom Header with Cover Art */}
      <div className="relative h-44 md:h-52 bg-linear-to-b from-brand-blue-primary/60 via-brand-blue-primary/30 to-transparent shrink-0">
        {/* Background blur effect */}
        {song.coverUrl && (
          <div
            className="absolute inset-0 opacity-30 blur-2xl scale-110"
            style={{
              backgroundImage: `url(${song.coverUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white transition-all duration-200"
        >
          <X size={18} />
        </button>

        {/* Edit button for admins */}
        {canManageSongs && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="absolute top-4 right-16 z-10 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white transition-all duration-200"
          >
            <Pencil size={16} />
          </button>
        )}

        {/* Content */}
        <div className="absolute inset-x-0 bottom-0 flex items-end gap-4 md:gap-6 p-5 md:p-6">
          {/* Album Cover */}
          <div className="w-28 h-28 md:w-36 md:h-36 rounded-xl md:rounded-2xl shadow-2xl border-2 border-white/10 overflow-hidden bg-surface-100 shrink-0 ring-1 ring-black/20">
            {song.coverUrl ? (
              <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-surface-100 to-surface-200">
                <Music size={40} className="text-gray-500 md:w-12 md:h-12" />
              </div>
            )}
          </div>

          {/* Song Info - Editable or Static */}
          <div className="flex-1 min-w-0 pb-1">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-xl font-bold text-white placeholder:text-white/50 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/50 outline-none"
                  placeholder="Titulo"
                />
                <input
                  value={editArtist}
                  onChange={(e) => setEditArtist(e.target.value)}
                  className="w-full bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/50 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/50 outline-none"
                  placeholder="Artista"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={editBpm}
                    onChange={(e) => setEditBpm(e.target.value)}
                    placeholder="BPM"
                    min="40"
                    max="300"
                    className="w-24 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/50 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/50 outline-none"
                  />
                  <input
                    value={editKey}
                    onChange={(e) => setEditKey(e.target.value)}
                    placeholder="Tonalidad"
                    className="w-24 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/50 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/50 outline-none"
                  />
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl md:text-3xl font-black text-white mb-1 truncate drop-shadow-lg">
                  {song.title}
                </h2>
                <p className="text-base md:text-lg text-white/80 truncate">{song.artist}</p>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {song.bpm && (
                    <span className="text-xs font-bold px-2.5 py-1 bg-brand-blue-primary/90 text-white rounded-full shadow-sm">
                      {song.bpm} BPM
                    </span>
                  )}
                  {song.key && (
                    <span className="text-xs font-bold px-2.5 py-1 bg-brand-yellow text-brand-blue-primary rounded-full shadow-sm">
                      {song.key}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Edit mode action bar */}
      {isEditing && (
        <div className="flex items-center justify-end gap-2 px-6 py-3 bg-surface-100/50 border-b border-surface-200/50">
          <button
            onClick={handleCancelEdit}
            disabled={updateSong.isPending}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200"
          >
            <X size={16} />
            Cancelar
          </button>
          <button
            onClick={handleSaveEdit}
            disabled={updateSong.isPending || !editTitle || !editArtist}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-brand-yellow text-brand-blue-primary font-medium rounded-lg hover:bg-brand-yellow/90 transition-all duration-200 disabled:opacity-50"
          >
            {updateSong.isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-brand-blue-primary/30 border-t-brand-blue-primary rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Check size={16} />
                Guardar
              </>
            )}
          </button>
        </div>
      )}

      {/* Body Content */}
      <Modal.Body className="space-y-5">
        {/* Status Section */}
        <div className="p-4 bg-surface-100/50 rounded-2xl border border-surface-200/50">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-400 font-medium">Estado actual</p>
            {canManageSongs && (
              <span className="flex items-center gap-1.5 text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full">
                <Shield size={12} />
                Admin
              </span>
            )}
          </div>

          {canManageSongs ? (
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map((option) => {
                const isSelected = currentStatus === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleStatusChange(option.value)}
                    disabled={updateSong.isPending}
                    className={`
                      relative flex items-center gap-2 px-3 py-3 rounded-xl border text-sm font-medium
                      transition-all duration-200 disabled:opacity-50
                      ${isSelected ? option.activeColor : `bg-surface-200/30 ${option.color}`}
                    `}
                  >
                    {option.icon}
                    <span>{option.label}</span>
                    {isSelected && (
                      <div className="absolute right-2 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center animate-in zoom-in duration-200">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <StatusBadge status={song.status} />
          )}
        </div>

        {/* Info Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Lead Vocals */}
          <div className="bg-surface-100/30 p-4 rounded-2xl border border-surface-200/30">
            <h3 className="flex items-center gap-2 text-white font-semibold mb-3">
              <div className="w-8 h-8 rounded-lg bg-brand-yellow/20 flex items-center justify-center">
                <Mic2 size={16} className="text-brand-yellow" />
              </div>
              Voces Principales
            </h3>
            <p className="text-sm text-gray-500 italic">No asignado</p>
          </div>

          {/* Scores */}
          <div className="bg-surface-100/30 p-4 rounded-2xl border border-surface-200/30">
            <h3 className="flex items-center gap-2 text-white font-semibold mb-3">
              <div className="w-8 h-8 rounded-lg bg-brand-yellow/20 flex items-center justify-center">
                <FileMusic size={16} className="text-brand-yellow" />
              </div>
              Partituras
            </h3>
            <p className="text-sm text-gray-500 italic">No hay partituras adjuntas</p>
          </div>
        </div>

        {/* Events */}
        <div className="bg-surface-100/30 p-4 rounded-2xl border border-surface-200/30">
          <h3 className="flex items-center gap-2 text-white font-semibold mb-3">
            <div className="w-8 h-8 rounded-lg bg-brand-yellow/20 flex items-center justify-center">
              <Calendar size={16} className="text-brand-yellow" />
            </div>
            Eventos
          </h3>
          <p className="text-sm text-gray-500 italic">Esta cancion no esta asignada a ningun evento</p>
        </div>

        {/* Admin Actions */}
        {canManageSongs && !isEditing && (
          <div className="pt-4 border-t border-surface-200/50">
            {showDeleteConfirm ? (
              <div className="flex items-center justify-between bg-red-500/10 p-4 rounded-xl border border-red-500/30 animate-in fade-in duration-200">
                <p className="text-sm text-red-400">Eliminar esta cancion?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteSong.isPending}
                    className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-all duration-200 disabled:opacity-50"
                  >
                    {deleteSong.isPending ? "Eliminando..." : "Si, eliminar"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 text-sm text-red-400/80 hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
                Eliminar cancion
              </button>
            )}
          </div>
        )}
      </Modal.Body>

      {/* Footer with metadata */}
      <div className="shrink-0 px-6 py-4 border-t border-white/5 text-center">
        <p className="text-xs text-gray-500">
          Sugerida el{" "}
          {new Date(song.createdAt).toLocaleDateString("es-DO", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
    </Modal>
  );
}
