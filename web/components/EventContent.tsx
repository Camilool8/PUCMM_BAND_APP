"use client";

import { useState } from "react";
import {
  Calendar,
  Music,
  Plus,
  Trash2,
  X,
  Users,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useEvent, useDeleteEvent, useAddSongToEvent, useRemoveSongFromEvent } from "@/hooks/use-events";
import { useSongs } from "@/hooks/use-songs";
import SongDetailModal from "@/components/SongDetailModal";
import type { Event, Song } from "@/lib/api";

interface EventContentProps {
  event: Event;
  onEdit: (event: Event) => void;
}

export default function EventContent({ event, onEdit }: EventContentProps) {
  const { canManageEvents } = useAuth();
  const { data: fullEvent } = useEvent(event.id);
  const { data: allSongs } = useSongs();
  const deleteEvent = useDeleteEvent();
  const addSongToEvent = useAddSongToEvent();
  const removeSongFromEvent = useRemoveSongFromEvent();

  const [showAddSong, setShowAddSong] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  const displayEvent = fullEvent || event;
  const eventSongs = displayEvent.songs || [];
  const eventConcerts = displayEvent.concerts || [];

  // Filter out songs already in the event
  const availableSongs = allSongs?.filter(
    (song) => !eventSongs.some((es) => es.id === song.id)
  ) || [];

  const handleAddSong = async (songId: string) => {
    await addSongToEvent.mutateAsync({ eventId: event.id, songId });
    setShowAddSong(false);
  };

  const handleRemoveSong = async (songId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent song click
    await removeSongFromEvent.mutateAsync({ eventId: event.id, songId });
  };

  const handleDelete = async () => {
    await deleteEvent.mutateAsync(event.id);
    // The page will handle navigation back to "todos"
    window.location.reload();
  };

  const handleSongClick = (song: Song) => {
    setSelectedSong(song);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Setlist Section */}
      <div className="bg-surface-100/30 p-4 md:p-6 rounded-2xl border border-surface-200/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2 text-white font-semibold text-lg">
            <div className="w-8 h-8 rounded-lg bg-brand-yellow/20 flex items-center justify-center">
              <Music size={16} className="text-brand-yellow" />
            </div>
            Setlist del Evento
          </h3>
          {canManageEvents && !showAddSong && (
            <button
              onClick={() => setShowAddSong(true)}
              className="flex items-center gap-1.5 text-sm text-brand-yellow hover:text-brand-yellow/80 transition-colors px-3 py-1.5 rounded-lg hover:bg-brand-yellow/10"
            >
              <Plus size={16} />
              Agregar Canción
            </button>
          )}
        </div>

        {/* Add Song Selector */}
        {showAddSong && (
          <div className="mb-4 p-4 bg-surface-100/50 rounded-xl border border-surface-200/50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">Seleccionar canción:</span>
              <button
                onClick={() => setShowAddSong(false)}
                className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                <X size={16} />
              </button>
            </div>
            {availableSongs.length > 0 ? (
              <div className="max-h-64 overflow-y-auto space-y-1 scrollbar-hide">
                {availableSongs.map((song) => (
                  <button
                    key={song.id}
                    onClick={() => handleAddSong(song.id)}
                    disabled={addSongToEvent.isPending}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 text-left transition-all disabled:opacity-50"
                  >
                    <div className="w-10 h-10 rounded-lg bg-surface-200 flex items-center justify-center shrink-0 overflow-hidden">
                      {song.coverUrl ? (
                        <img src={song.coverUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Music size={16} className="text-gray-500" />
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
              <p className="text-sm text-gray-500 text-center py-6">No hay canciones disponibles para agregar</p>
            )}
          </div>
        )}

        {/* Songs List - Clickable */}
        {eventSongs.length > 0 ? (
          <div className="space-y-1">
            {eventSongs.map((song, index) => (
              <div
                key={song.id}
                onClick={() => handleSongClick(song)}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all group cursor-pointer"
              >
                <div className="w-8 text-center text-sm text-gray-500 shrink-0">
                  {index + 1}
                </div>
                <div className="w-11 h-11 rounded-lg bg-surface-200 flex items-center justify-center shrink-0 overflow-hidden">
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
                    disabled={removeSongFromEvent.isPending}
                    className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400 transition-colors shrink-0" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Music size={32} className="mx-auto text-gray-600 mb-2" />
            <p className="text-sm text-gray-500">
              No hay canciones en el setlist
            </p>
            {canManageEvents && (
              <button
                onClick={() => setShowAddSong(true)}
                className="mt-3 text-brand-yellow text-sm hover:underline"
              >
                Agregar la primera canción
              </button>
            )}
          </div>
        )}
      </div>

      {/* Concerts Section */}
      <div className="bg-surface-100/30 p-4 md:p-6 rounded-2xl border border-surface-200/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2 text-white font-semibold text-lg">
            <div className="w-8 h-8 rounded-lg bg-brand-yellow/20 flex items-center justify-center">
              <Users size={16} className="text-brand-yellow" />
            </div>
            Conciertos
          </h3>
          {canManageEvents && (
            <button
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
              disabled
            >
              <Plus size={16} />
              Próximamente
            </button>
          )}
        </div>

        {eventConcerts.length > 0 ? (
          <div className="space-y-2">
            {eventConcerts.map((concert) => (
              <div
                key={concert.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-surface-100/50 border border-surface-200/30 hover:border-white/10 transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-brand-blue-primary/20 flex items-center justify-center shrink-0">
                  <Calendar size={20} className="text-brand-blue-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white font-medium">
                    {new Date(concert.date).toLocaleDateString("es-DO", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  {concert.location && (
                    <p className="text-sm text-gray-500">{concert.location}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar size={32} className="mx-auto text-gray-600 mb-2" />
            <p className="text-sm text-gray-500">
              No hay conciertos programados para este evento
            </p>
            <p className="text-xs text-gray-600 mt-1">
              La gestión de conciertos estará disponible próximamente
            </p>
          </div>
        )}
      </div>

      {/* Admin Actions */}
      {canManageEvents && (
        <div className="bg-surface-100/30 p-4 rounded-2xl border border-surface-200/30">
          {showDeleteConfirm ? (
            <div className="flex items-center justify-between bg-red-500/10 p-4 rounded-xl border border-red-500/30 animate-in fade-in duration-200">
              <p className="text-sm text-red-400">¿Eliminar este evento permanentemente?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteEvent.isPending}
                  className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-all duration-200 disabled:opacity-50"
                >
                  {deleteEvent.isPending ? "Eliminando..." : "Sí, eliminar"}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 text-sm text-red-400/80 hover:text-red-400 transition-colors"
            >
              <Trash2 size={14} />
              Eliminar evento
            </button>
          )}
        </div>
      )}

      {/* Song Detail Modal */}
      <SongDetailModal
        song={selectedSong}
        onClose={() => setSelectedSong(null)}
      />
    </div>
  );
}
