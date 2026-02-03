"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  X,
  Pencil,
  Trash2,
  Music,
  Plus,
  MapPin,
  FileText,
  Copy,
  ChevronRight,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/hooks/use-auth";
import { useConcert, useDeleteConcert, useAddSongToConcert, useRemoveSongFromConcert, useCopyEventSongsToConcert } from "@/hooks/use-concerts";
import { useSongs } from "@/hooks/use-songs";
import SongDetailModal from "@/components/SongDetailModal";
import type { Concert, Event, Song } from "@/lib/api";

interface ConcertDetailModalProps {
  concert: Concert | null;
  event: Event;
  onClose: () => void;
  onEdit: (concert: Concert) => void;
}

export default function ConcertDetailModal({
  concert,
  event,
  onClose,
  onEdit,
}: ConcertDetailModalProps) {
  const { canManageEvents } = useAuth();
  const { data: fullConcert } = useConcert(concert?.id || "");
  const { data: allSongs } = useSongs();
  const deleteConcert = useDeleteConcert();
  const addSongToConcert = useAddSongToConcert();
  const removeSongFromConcert = useRemoveSongFromConcert();
  const copySongsFromEvent = useCopyEventSongsToConcert();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddSong, setShowAddSong] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  // Reset states when concert changes
  useEffect(() => {
    setShowDeleteConfirm(false);
    setShowAddSong(false);
  }, [concert]);

  if (!concert) return null;

  const displayConcert = fullConcert || concert;
  const concertSongs = displayConcert.songs || [];
  const concertDate = new Date(displayConcert.date);
  const isUpcoming = concertDate >= new Date();

  // Filter out songs already in the concert
  const availableSongs = allSongs?.filter(
    (song) => !concertSongs.some((cs) => cs.id === song.id)
  ) || [];

  const handleDelete = async () => {
    await deleteConcert.mutateAsync({ id: concert.id, eventId: event.id });
    onClose();
  };

  const handleAddSong = async (songId: string) => {
    await addSongToConcert.mutateAsync({ concertId: concert.id, songId });
    setShowAddSong(false);
  };

  const handleRemoveSong = async (songId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await removeSongFromConcert.mutateAsync({ concertId: concert.id, songId });
  };

  const handleCopyFromEvent = async () => {
    await copySongsFromEvent.mutateAsync(concert.id);
  };

  const handleClose = () => {
    setShowDeleteConfirm(false);
    setShowAddSong(false);
    onClose();
  };

  const handleSongClick = (song: Song) => {
    setSelectedSong(song);
  };

  return (
    <>
      <Modal isOpen={!!concert} onClose={handleClose} size="lg" showCloseButton={false}>
        {/* Custom Header */}
        <div className="relative h-32 md:h-40 shrink-0 bg-linear-to-b from-brand-blue-primary/30 via-surface-50/50 to-surface-50">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white transition-all duration-200"
          >
            <X size={18} />
          </button>

          {/* Edit button for admins */}
          {canManageEvents && (
            <button
              onClick={() => onEdit(displayConcert)}
              className="absolute top-4 right-16 z-10 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white transition-all duration-200"
            >
              <Pencil size={16} />
            </button>
          )}

          {/* Content */}
          <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 md:gap-6 p-4 md:p-6">
            {/* Concert Icon */}
            <div
              className={`w-14 h-14 md:w-20 md:h-20 rounded-xl md:rounded-2xl shadow-2xl border border-white/10 overflow-hidden shrink-0 flex items-center justify-center ${
                isUpcoming ? "bg-brand-blue-primary" : "bg-gray-600"
              }`}
            >
              <Calendar size={24} className="text-white md:w-8 md:h-8" />
            </div>

            {/* Concert Info */}
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs text-white/60 uppercase tracking-wider truncate max-w-[120px] sm:max-w-none">
                  {event.name}
                </span>
                {isUpcoming && (
                  <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-500 text-white uppercase font-medium shrink-0">
                    Próximo
                  </span>
                )}
              </div>
              <h2 className="text-lg md:text-2xl font-black text-white capitalize truncate">
                {concertDate.toLocaleDateString("es-DO", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </h2>
              <div className="flex items-center gap-2 md:gap-3 mt-1 flex-wrap">
                {displayConcert.location && (
                  <p className="text-xs md:text-sm text-white/70 flex items-center gap-1 truncate max-w-[140px] sm:max-w-none">
                    <MapPin size={12} className="shrink-0" />
                    <span className="truncate">{displayConcert.location}</span>
                  </p>
                )}
                <p className="text-xs md:text-sm text-white/50 shrink-0">
                  {concertDate.toLocaleTimeString("es-DO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <Modal.Body className="space-y-5">
          {/* Notes */}
          {displayConcert.notes && (
            <div className="bg-surface-100/30 p-4 rounded-xl border border-surface-200/30">
              <div className="flex items-start gap-3">
                <FileText size={16} className="text-gray-400 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-300">{displayConcert.notes}</p>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex gap-4">
            <div className="flex-1 bg-surface-100/50 p-4 rounded-xl border border-surface-200/50 text-center">
              <div className="text-2xl font-bold text-white">{concertSongs.length}</div>
              <div className="text-xs text-gray-400 mt-1">Canciones</div>
            </div>
            <div className="flex-1 bg-surface-100/50 p-4 rounded-xl border border-surface-200/50 text-center">
              <div className="text-2xl font-bold text-white">
                {event.songs?.length || event._count?.songs || 0}
              </div>
              <div className="text-xs text-gray-400 mt-1">En Evento</div>
            </div>
          </div>

          {/* Songs Section */}
          <div className="bg-surface-100/30 p-4 rounded-2xl border border-surface-200/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 text-white font-semibold">
                <div className="w-8 h-8 rounded-lg bg-brand-yellow/20 flex items-center justify-center">
                  <Music size={16} className="text-brand-yellow" />
                </div>
                Setlist del Concierto
              </h3>
              {canManageEvents && !showAddSong && (
                <div className="flex items-center gap-2">
                  {concertSongs.length === 0 && (event.songs?.length || event._count?.songs || 0) > 0 && (
                    <button
                      onClick={handleCopyFromEvent}
                      disabled={copySongsFromEvent.isPending}
                      className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5 disabled:opacity-50"
                    >
                      <Copy size={14} />
                      <span className="hidden sm:inline">Copiar de evento</span>
                    </button>
                  )}
                  <button
                    onClick={() => setShowAddSong(true)}
                    className="flex items-center gap-1.5 text-sm text-brand-yellow hover:text-brand-yellow/80 transition-colors"
                  >
                    <Plus size={16} />
                    Agregar
                  </button>
                </div>
              )}
            </div>

            {/* Add Song Selector */}
            {showAddSong && (
              <div className="mb-4 p-3 bg-surface-100/50 rounded-xl border border-surface-200/50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Seleccionar canción:</span>
                  <button
                    onClick={() => setShowAddSong(false)}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                {availableSongs.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto space-y-1 scrollbar-hide">
                    {availableSongs.map((song) => (
                      <button
                        key={song.id}
                        onClick={() => handleAddSong(song.id)}
                        disabled={addSongToConcert.isPending}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 text-left transition-all disabled:opacity-50"
                      >
                        <div className="w-8 h-8 rounded-md bg-surface-200 flex items-center justify-center shrink-0">
                          {song.coverUrl ? (
                            <img src={song.coverUrl} alt="" className="w-full h-full object-cover rounded-md" />
                          ) : (
                            <Music size={14} className="text-gray-500" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-white truncate">{song.title}</p>
                          <p className="text-xs text-gray-500 truncate">{song.artist}</p>
                        </div>
                        <Plus size={16} className="text-brand-yellow shrink-0" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No hay canciones disponibles</p>
                )}
              </div>
            )}

            {/* Songs List */}
            {concertSongs.length > 0 ? (
              <div className="space-y-1">
                {concertSongs.map((song, index) => (
                  <div
                    key={song.id}
                    onClick={() => handleSongClick(song)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-all group cursor-pointer"
                  >
                    <div className="w-6 text-center text-xs text-gray-500 shrink-0">
                      {index + 1}
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-surface-200 flex items-center justify-center shrink-0 overflow-hidden">
                      {song.coverUrl ? (
                        <img src={song.coverUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Music size={16} className="text-gray-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white truncate group-hover:text-brand-yellow transition-colors">{song.title}</p>
                      <p className="text-xs text-gray-500 truncate">{song.artist}</p>
                    </div>
                    {canManageEvents && (
                      <button
                        onClick={(e) => handleRemoveSong(song.id, e)}
                        disabled={removeSongFromConcert.isPending}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                    <ChevronRight size={14} className="text-gray-600 group-hover:text-gray-400 shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Music size={24} className="mx-auto text-gray-600 mb-2" />
                <p className="text-sm text-gray-500">
                  No hay canciones en este concierto
                </p>
                {canManageEvents && (event.songs?.length || event._count?.songs || 0) > 0 && (
                  <button
                    onClick={handleCopyFromEvent}
                    disabled={copySongsFromEvent.isPending}
                    className="mt-2 text-brand-yellow text-sm hover:underline disabled:opacity-50"
                  >
                    {copySongsFromEvent.isPending ? "Copiando..." : "Copiar setlist del evento"}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Admin Actions */}
          {canManageEvents && (
            <div className="pt-4 border-t border-surface-200/50">
              {showDeleteConfirm ? (
                <div className="flex items-center justify-between bg-red-500/10 p-4 rounded-xl border border-red-500/30 animate-in fade-in duration-200">
                  <p className="text-sm text-red-400">¿Eliminar este concierto?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleteConcert.isPending}
                      className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-all duration-200 disabled:opacity-50"
                    >
                      {deleteConcert.isPending ? "Eliminando..." : "Sí, eliminar"}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 text-sm text-red-400/80 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                  Eliminar concierto
                </button>
              )}
            </div>
          )}
        </Modal.Body>

        {/* Footer with metadata */}
        <div className="shrink-0 px-6 py-4 border-t border-white/5 text-center">
          <p className="text-xs text-gray-500">
            Creado el{" "}
            {new Date(displayConcert.createdAt).toLocaleDateString("es-DO", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </Modal>

      {/* Song Detail Modal (nested) */}
      <SongDetailModal
        song={selectedSong}
        onClose={() => setSelectedSong(null)}
      />
    </>
  );
}
