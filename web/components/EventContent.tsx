"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import {
  Calendar,
  Music,
  Plus,
  Trash2,
  X,
  Users,
  ChevronRight,
  MapPin,
  Pencil,
  ExternalLink,
  Clock,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useEvent, useDeleteEvent, useAddSongToEvent, useRemoveSongFromEvent, useReorderEventSongs } from "@/hooks/use-events";
import { useDeleteConcert } from "@/hooks/use-concerts";
import { useSongs } from "@/hooks/use-songs";
import SongDetailModal from "@/components/SongDetailModal";
import CreateConcertModal from "@/components/CreateConcertModal";
import SortableSongItem from "@/components/SortableSongItem";
import type { Event, Song, Concert } from "@/lib/api";
import { formatDuration, calculateSetlistDuration, hasDurationData } from "@/lib/utils";

interface EventContentProps {
  event: Event;
  onEdit: (event: Event) => void;
}

export default function EventContent({ event, onEdit }: EventContentProps) {
  const router = useRouter();
  const { canManageEvents } = useAuth();
  const { data: fullEvent } = useEvent(event.id);
  const { data: allSongs } = useSongs();
  const deleteEvent = useDeleteEvent();
  const deleteConcert = useDeleteConcert();
  const addSongToEvent = useAddSongToEvent();
  const removeSongFromEvent = useRemoveSongFromEvent();

  const [showAddSong, setShowAddSong] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showCreateConcert, setShowCreateConcert] = useState(false);
  const [editConcert, setEditConcert] = useState<Concert | null>(null);
  const [deletingConcertId, setDeletingConcertId] = useState<string | null>(null);

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

  const handleConcertClick = (concert: Concert) => {
    // Navigate to concerts page with the specific concert selected
    router.push(`/concerts?concert=${concert.id}`);
  };

  const handleEditConcert = (concert: Concert) => {
    setEditConcert(concert);
    setShowCreateConcert(true);
  };

  const handleDeleteConcert = async (concertId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingConcertId(concertId);
    await deleteConcert.mutateAsync({ id: concertId, eventId: event.id });
    setDeletingConcertId(null);
  };

  const handleCloseConcertModal = () => {
    setShowCreateConcert(false);
    setEditConcert(null);
  };

  // Drag-and-drop setup
  const reorderSongs = useReorderEventSongs();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (dragEvent: DragEndEvent) => {
    const { active, over } = dragEvent;
    if (!over || active.id === over.id) return;

    const oldIndex = eventSongs.findIndex((s) => s.id === active.id);
    const newIndex = eventSongs.findIndex((s) => s.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = arrayMove(eventSongs, oldIndex, newIndex);
      const songIds = newOrder.map((s) => s.id);
      await reorderSongs.mutateAsync({ eventId: event.id, songIds });
    }
  };

  // Sort concerts by date (most recent first or upcoming first)
  const sortedConcerts = [...eventConcerts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Setlist Section */}
      <div className="bg-surface-100/30 p-4 md:p-6 rounded-2xl border border-surface-200/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="flex items-center gap-2 text-white font-semibold text-lg">
              <div className="w-8 h-8 rounded-lg bg-brand-yellow/20 flex items-center justify-center">
                <Music size={16} className="text-brand-yellow" />
              </div>
              Setlist del Evento
            </h3>
            {eventSongs.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-surface-100/50 px-2 py-1 rounded-full">
                <span>{eventSongs.length} canciones</span>
                {hasDurationData(eventSongs) && (
                  <>
                    <span>•</span>
                    <Clock size={12} />
                    <span>{formatDuration(calculateSetlistDuration(eventSongs))}</span>
                  </>
                )}
              </div>
            )}
          </div>
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

        {/* Songs List with Drag-Drop */}
        {eventSongs.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={eventSongs.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1">
                {eventSongs.map((song, index) => (
                  <SortableSongItem
                    key={song.id}
                    song={song}
                    index={index}
                    onSongClick={handleSongClick}
                    onRemove={handleRemoveSong}
                    isRemoving={removeSongFromEvent.isPending}
                    canReorder={canManageEvents}
                    canRemove={canManageEvents}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
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
            {eventConcerts.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white/10 text-white font-medium">
                {eventConcerts.length}
              </span>
            )}
          </h3>
          {canManageEvents && (
            <button
              onClick={() => setShowCreateConcert(true)}
              className="flex items-center gap-1.5 text-sm text-brand-yellow hover:text-brand-yellow/80 transition-colors px-3 py-1.5 rounded-lg hover:bg-brand-yellow/10"
            >
              <Plus size={16} />
              Nuevo Concierto
            </button>
          )}
        </div>

        {sortedConcerts.length > 0 ? (
          <div className="space-y-2">
            {sortedConcerts.map((concert) => {
              const concertDate = new Date(concert.date);
              const isUpcoming = concertDate >= new Date();
              const isDeleting = deletingConcertId === concert.id;

              return (
                <div
                  key={concert.id}
                  onClick={() => handleConcertClick(concert)}
                  className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-surface-100/50 border border-surface-200/30 hover:border-white/10 transition-all cursor-pointer group ${
                    isDeleting ? "opacity-50" : ""
                  }`}
                >
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center shrink-0 ${
                      isUpcoming
                        ? "bg-brand-blue-primary"
                        : "bg-gray-600"
                    }`}
                  >
                    <Calendar
                      size={18}
                      className="text-white md:w-5 md:h-5"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm md:text-base text-white font-medium capitalize truncate max-w-[200px] sm:max-w-none">
                        {concertDate.toLocaleDateString("es-DO", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      {isUpcoming && (
                        <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-500 text-white uppercase font-medium shrink-0">
                          Próximo
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 mt-0.5 md:mt-1">
                      {concert.location && (
                        <p className="text-xs md:text-sm text-gray-400 flex items-center gap-1 truncate max-w-[140px] sm:max-w-none">
                          <MapPin size={10} className="shrink-0 md:w-3 md:h-3" />
                          <span className="truncate">{concert.location}</span>
                        </p>
                      )}
                      <p className="text-xs text-gray-500 shrink-0">
                        {concertDate.toLocaleTimeString("es-DO", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  {canManageEvents && (
                    <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditConcert(concert);
                        }}
                        className="p-1.5 md:p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteConcert(concert.id, e)}
                        disabled={isDeleting}
                        className="p-1.5 md:p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                  <ChevronRight size={14} className="text-gray-600 group-hover:text-gray-400 transition-colors shrink-0 md:w-4 md:h-4" />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar size={32} className="mx-auto text-gray-600 mb-2" />
            <p className="text-sm text-gray-500">
              No hay conciertos programados para este evento
            </p>
            {canManageEvents && (
              <button
                onClick={() => setShowCreateConcert(true)}
                className="mt-3 text-brand-yellow text-sm hover:underline"
              >
                Crear el primer concierto
              </button>
            )}
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

      {/* Modals */}
      <SongDetailModal
        song={selectedSong}
        onClose={() => setSelectedSong(null)}
      />

      <CreateConcertModal
        isOpen={showCreateConcert}
        onClose={handleCloseConcertModal}
        event={displayEvent}
        editConcert={editConcert}
      />
    </div>
  );
}
