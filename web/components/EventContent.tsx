"use client";

import { useState, useMemo } from "react";
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
  Clock,
  Search,
  Check,
  Layers,
  ClipboardCheck,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useEvent, useDeleteEvent, useAddSongToEvent, useAddSongsToEventBulk, useRemoveSongFromEvent, useReorderEventSetlist, useAddBlockToEvent, useRemoveBlockFromEvent } from "@/hooks/use-events";
import { useDeleteConcert } from "@/hooks/use-concerts";
import { useRehearsalsByEvent, useDeleteRehearsal } from "@/hooks/use-rehearsals";
import { useSongs } from "@/hooks/use-songs";
import SongDetailModal from "@/components/SongDetailModal";
import CreateConcertModal from "@/components/CreateConcertModal";
import CreateRehearsalModal from "@/components/CreateRehearsalModal";
import SortableSongItem from "@/components/SortableSongItem";
import SortableBlockItem, { BLOCK_LABELS } from "@/components/SortableBlockItem";
import type { Event, Song, Concert, SetlistItem, BlockType } from "@/lib/api";
import { formatDuration } from "@/lib/utils";
import PlaySetlistButton from "@/components/player/PlaySetlistButton";

interface EventContentProps {
  event: Event;
  onEdit: (event: Event) => void;
}

function calculateSetlistItemsDuration(items: SetlistItem[]): number {
  return items.reduce((total, item) => {
    if (item.itemType === "song" && item.song?.durationMs) {
      return total + item.song.durationMs;
    }
    if (item.itemType === "block" && item.block?.durationMinutes) {
      return total + item.block.durationMinutes * 60 * 1000;
    }
    return total;
  }, 0);
}

function hasSetlistDurationData(items: SetlistItem[]): boolean {
  return items.some(
    (item) =>
      (item.itemType === "song" && item.song?.durationMs && item.song.durationMs > 0) ||
      (item.itemType === "block" && item.block?.durationMinutes && item.block.durationMinutes > 0)
  );
}

const BLOCK_TYPES: { value: BlockType; label: string }[] = [
  { value: "INTERLUDE", label: "Interludio" },
  { value: "INTRODUCTION", label: "Introduccion" },
  { value: "BREAK", label: "Descanso" },
  { value: "TRANSITION", label: "Transicion" },
  { value: "CUSTOM", label: "Personalizado" },
];

export default function EventContent({ event, onEdit }: EventContentProps) {
  const router = useRouter();
  const { canManageEvents } = useAuth();
  const { data: fullEvent } = useEvent(event.id);
  const { data: allSongs } = useSongs();
  const deleteEvent = useDeleteEvent();
  const deleteConcert = useDeleteConcert();
  const { data: eventRehearsals } = useRehearsalsByEvent(event.id);
  const deleteRehearsal = useDeleteRehearsal();
  const addSongToEvent = useAddSongToEvent();
  const addSongsBulk = useAddSongsToEventBulk();
  const removeSongFromEvent = useRemoveSongFromEvent();
  const addBlockToEvent = useAddBlockToEvent();
  const removeBlockFromEvent = useRemoveBlockFromEvent();

  const [showAddSong, setShowAddSong] = useState(false);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [songSearchQuery, setSongSearchQuery] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showCreateConcert, setShowCreateConcert] = useState(false);
  const [editConcert, setEditConcert] = useState<Concert | null>(null);
  const [deletingConcertId, setDeletingConcertId] = useState<string | null>(null);
  const [showCreateRehearsal, setShowCreateRehearsal] = useState(false);
  const [deletingRehearsalId, setDeletingRehearsalId] = useState<string | null>(null);
  const [selectedSongIds, setSelectedSongIds] = useState<Set<string>>(new Set());
  const [blockType, setBlockType] = useState<BlockType>("INTERLUDE");
  const [blockLabel, setBlockLabel] = useState("");
  const [blockDuration, setBlockDuration] = useState("");

  const displayEvent = fullEvent || event;
  const setlistItems = displayEvent.setlistItems || [];
  const eventSongs = displayEvent.songs || [];
  const eventConcerts = displayEvent.concerts || [];

  const songIdsInEvent = useMemo(() => new Set(eventSongs.map((s) => s.id)), [eventSongs]);
  const availableSongs = useMemo(() =>
    allSongs?.filter((song) => {
      if (songIdsInEvent.has(song.id)) return false;
      if (songSearchQuery) {
        const query = songSearchQuery.toLowerCase();
        return song.title.toLowerCase().includes(query) || song.artist.toLowerCase().includes(query);
      }
      return true;
    }) || [],
    [allSongs, songIdsInEvent, songSearchQuery]
  );

  const toggleSongSelection = (songId: string) => {
    setSelectedSongIds((prev) => {
      const next = new Set(prev);
      if (next.has(songId)) next.delete(songId);
      else next.add(songId);
      return next;
    });
  };

  const handleBulkAdd = async () => {
    const songIds = Array.from(selectedSongIds);
    if (songIds.length === 1) {
      await addSongToEvent.mutateAsync({ eventId: event.id, songId: songIds[0] });
    } else {
      await addSongsBulk.mutateAsync({ eventId: event.id, songIds });
    }
    setSelectedSongIds(new Set());
    setSongSearchQuery("");
    setShowAddSong(false);
  };

  const handleRemoveSong = async (songId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await removeSongFromEvent.mutateAsync({ eventId: event.id, songId });
  };

  const handleRemoveBlock = async (blockId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await removeBlockFromEvent.mutateAsync({ eventId: event.id, blockId });
  };

  const handleAddBlock = async () => {
    const label = blockLabel.trim() || BLOCK_LABELS[blockType];
    const durationMinutes = blockDuration ? parseInt(blockDuration, 10) : undefined;
    await addBlockToEvent.mutateAsync({
      eventId: event.id,
      data: { type: blockType, label, durationMinutes },
    });
    setBlockLabel("");
    setBlockDuration("");
    setShowAddBlock(false);
  };

  const handleDelete = async () => {
    await deleteEvent.mutateAsync(event.id);
    window.location.reload();
  };

  const handleSongClick = (song: Song) => setSelectedSong(song);
  const handleConcertClick = (concert: Concert) => router.push(`/concerts/${concert.id}`);

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

  const handleRehearsalClick = (rehearsalId: string) => router.push(`/rehearsals/${rehearsalId}`);

  const handleDeleteRehearsal = async (rehearsalId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingRehearsalId(rehearsalId);
    await deleteRehearsal.mutateAsync({ id: rehearsalId, eventId: event.id });
    setDeletingRehearsalId(null);
  };

  // Drag-and-drop with optimistic reorder
  const reorderSetlist = useReorderEventSetlist();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (dragEvent: DragEndEvent) => {
    const { active, over } = dragEvent;
    if (!over || active.id === over.id) return;

    const oldIndex = setlistItems.findIndex((i) => i.id === active.id);
    const newIndex = setlistItems.findIndex((i) => i.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = arrayMove(setlistItems, oldIndex, newIndex);
      const items = newOrder.map((i) => ({ id: i.id, itemType: i.itemType }));
      reorderSetlist.mutate({ eventId: event.id, items });
    }
  };

  const sortedConcerts = [...eventConcerts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const sortedRehearsals = [...(eventRehearsals || [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const isAdding = addSongToEvent.isPending || addSongsBulk.isPending;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Setlist Section */}
      <div data-tour="event-setlist" className="bg-surface-100/30 p-4 md:p-6 rounded-2xl border border-surface-200/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <h3 className="flex items-center gap-2 text-white font-semibold text-base sm:text-lg">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-brand-yellow/20 flex items-center justify-center">
                <Music size={14} className="text-brand-yellow sm:w-4 sm:h-4" />
              </div>
              <span className="hidden xs:inline">Setlist del Evento</span>
              <span className="xs:hidden">Setlist</span>
            </h3>
            {setlistItems.length > 0 && (
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-500 bg-surface-100/50 px-2 py-1 rounded-full">
                <span>{setlistItems.length}</span>
                {hasSetlistDurationData(setlistItems) && (
                  <>
                    <span>-</span>
                    <Clock size={10} className="sm:w-3 sm:h-3" />
                    <span>{formatDuration(calculateSetlistItemsDuration(setlistItems))}</span>
                  </>
                )}
              </div>
            )}
            <PlaySetlistButton
              setlistItems={setlistItems}
              songs={eventSongs}
              context={{ type: "event", id: event.id, name: displayEvent.name }}
            />
          </div>
          {canManageEvents && !showAddSong && !showAddBlock && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowAddBlock(true)}
                className="flex items-center justify-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
              >
                <Layers size={14} />
                <span className="hidden sm:inline">Bloque</span>
              </button>
              <button
                onClick={() => setShowAddSong(true)}
                className="flex items-center justify-center gap-1.5 text-sm text-brand-yellow hover:text-brand-yellow/80 transition-colors px-3 py-2 rounded-lg hover:bg-brand-yellow/10"
              >
                <Plus size={16} />
                <span>Agregar</span>
              </button>
            </div>
          )}
        </div>

        {/* Add Block Form */}
        {showAddBlock && (
          <div className="mb-4 p-3 sm:p-4 bg-surface-100/50 rounded-xl border border-surface-200/50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">Agregar bloque:</span>
              <button onClick={() => setShowAddBlock(false)} className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                {BLOCK_TYPES.map((bt) => (
                  <button
                    key={bt.value}
                    onClick={() => { setBlockType(bt.value); if (!blockLabel) setBlockLabel(bt.label); }}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                      blockType === bt.value
                        ? "border-brand-yellow/50 bg-brand-yellow/10 text-brand-yellow"
                        : "border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                    }`}
                  >
                    {bt.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={blockLabel}
                  onChange={(e) => setBlockLabel(e.target.value)}
                  placeholder={BLOCK_LABELS[blockType]}
                  className="flex-1 bg-surface-100 border border-surface-200 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/20 outline-none transition-all"
                />
                <input
                  type="number"
                  value={blockDuration}
                  onChange={(e) => setBlockDuration(e.target.value)}
                  placeholder="min"
                  min="1"
                  className="w-20 bg-surface-100 border border-surface-200 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/20 outline-none transition-all"
                />
              </div>
              <button
                onClick={handleAddBlock}
                disabled={addBlockToEvent.isPending}
                className="w-full px-4 py-2 bg-brand-yellow text-black text-sm font-medium rounded-lg hover:bg-brand-yellow/90 transition-all disabled:opacity-50"
              >
                {addBlockToEvent.isPending ? "Agregando..." : "Agregar bloque"}
              </button>
            </div>
          </div>
        )}

        {/* Add Song Selector with Multi-Select */}
        {showAddSong && (
          <div className="mb-4 p-3 sm:p-4 bg-surface-100/50 rounded-xl border border-surface-200/50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">Agregar canciones:</span>
              <button onClick={() => { setSongSearchQuery(""); setSelectedSongIds(new Set()); setShowAddSong(false); }} className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                <X size={16} />
              </button>
            </div>

            <div className="relative mb-3">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={songSearchQuery}
                onChange={(e) => setSongSearchQuery(e.target.value)}
                placeholder="Buscar cancion o artista..."
                className="w-full bg-surface-100 border border-surface-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/20 outline-none transition-all"
                autoFocus
              />
              {songSearchQuery && (
                <button onClick={() => setSongSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  <X size={14} />
                </button>
              )}
            </div>

            {availableSongs.length > 0 ? (
              <div className="max-h-64 overflow-y-auto space-y-1 scrollbar-hide">
                {availableSongs.map((song) => (
                  <div
                    key={song.id}
                    onClick={() => toggleSongSelection(song.id)}
                    className={`w-full flex items-center gap-3 p-2 sm:p-2.5 rounded-lg hover:bg-white/5 active:bg-white/10 text-left transition-all cursor-pointer ${
                      selectedSongIds.has(song.id) ? "bg-brand-yellow/10 border border-brand-yellow/30" : "border border-transparent"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                      selectedSongIds.has(song.id) ? "bg-brand-yellow border-brand-yellow" : "border-gray-600"
                    }`}>
                      {selectedSongIds.has(song.id) && <Check size={12} className="text-black" />}
                    </div>
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-surface-200 flex items-center justify-center shrink-0 overflow-hidden">
                      {song.coverUrl ? (
                        <img src={song.coverUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Music size={14} className="text-gray-500 sm:w-4 sm:h-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white truncate">{song.title}</p>
                      <p className="text-xs text-gray-500 truncate">{song.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-6">
                {songSearchQuery ? "No se encontraron canciones" : "No hay canciones disponibles"}
              </p>
            )}

            {selectedSongIds.size > 0 && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                <span className="text-sm text-gray-400">
                  {selectedSongIds.size} seleccionada{selectedSongIds.size > 1 ? "s" : ""}
                </span>
                <button
                  onClick={handleBulkAdd}
                  disabled={isAdding}
                  className="px-4 py-2 bg-brand-yellow text-black text-sm font-medium rounded-lg hover:bg-brand-yellow/90 transition-all disabled:opacity-50"
                >
                  {isAdding ? "Agregando..." : "Agregar seleccionadas"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Setlist Items (songs + blocks) */}
        {setlistItems.length > 0 ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={setlistItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-1">
                {setlistItems.map((item, index) =>
                  item.itemType === "song" && item.song ? (
                    <SortableSongItem
                      key={item.id}
                      song={item.song}
                      sortableId={item.id}
                      index={index}
                      onSongClick={handleSongClick}
                      onRemove={handleRemoveSong}
                      isRemoving={removeSongFromEvent.isPending}
                      canReorder={canManageEvents}
                      canRemove={canManageEvents}
                    />
                  ) : item.itemType === "block" && item.block ? (
                    <SortableBlockItem
                      key={item.id}
                      block={item.block}
                      sortableId={item.id}
                      index={index}
                      onRemove={handleRemoveBlock}
                      isRemoving={removeBlockFromEvent.isPending}
                      canReorder={canManageEvents}
                      canRemove={canManageEvents}
                    />
                  ) : null
                )}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="text-center py-8">
            <Music size={32} className="mx-auto text-gray-600 mb-2" />
            <p className="text-sm text-gray-500">No hay canciones en el setlist</p>
            {canManageEvents && (
              <button onClick={() => setShowAddSong(true)} className="mt-3 text-brand-yellow text-sm hover:underline">
                Agregar la primera cancion
              </button>
            )}
          </div>
        )}
      </div>

      {/* Concerts Section */}
      <div data-tour="event-concerts" className="bg-surface-100/30 p-4 md:p-6 rounded-2xl border border-surface-200/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2 text-white font-semibold text-lg">
            <div className="w-8 h-8 rounded-lg bg-brand-yellow/20 flex items-center justify-center">
              <Users size={16} className="text-brand-yellow" />
            </div>
            Conciertos
            {eventConcerts.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white/10 text-white font-medium">{eventConcerts.length}</span>
            )}
          </h3>
          {canManageEvents && (
            <button onClick={() => setShowCreateConcert(true)} className="flex items-center gap-1.5 text-sm text-brand-yellow hover:text-brand-yellow/80 transition-colors px-3 py-1.5 rounded-lg hover:bg-brand-yellow/10">
              <Plus size={16} />
              Nuevo Concierto
            </button>
          )}
        </div>

        {sortedConcerts.length > 0 ? (
          <div className="space-y-2">
            {sortedConcerts.map((concert, index) => {
              const concertDate = new Date(concert.date);
              const isUpcoming = concertDate >= new Date();
              const isDeleting = deletingConcertId === concert.id;
              return (
                <div
                  key={concert.id || `concert-${index}`}
                  onClick={() => handleConcertClick(concert)}
                  className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-surface-100/50 border border-surface-200/30 hover:border-white/10 transition-all cursor-pointer group ${isDeleting ? "opacity-50" : ""}`}
                >
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center shrink-0 ${isUpcoming ? "bg-brand-blue-primary" : "bg-gray-600"}`}>
                    <Calendar size={18} className="text-white md:w-5 md:h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm md:text-base text-white font-medium capitalize truncate max-w-[200px] sm:max-w-none">
                        {concertDate.toLocaleDateString("es-DO", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                      </p>
                      {isUpcoming && <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-500 text-white uppercase font-medium shrink-0">Proximo</span>}
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 mt-0.5 md:mt-1">
                      {concert.location && (
                        <p className="text-xs md:text-sm text-gray-400 flex items-center gap-1 truncate max-w-[140px] sm:max-w-none">
                          <MapPin size={10} className="shrink-0 md:w-3 md:h-3" /><span className="truncate">{concert.location}</span>
                        </p>
                      )}
                      <p className="text-xs text-gray-500 shrink-0">{concertDate.toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  </div>
                  {canManageEvents && (
                    <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); handleEditConcert(concert); }} className="p-1.5 md:p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"><Pencil size={14} /></button>
                      <button onClick={(e) => handleDeleteConcert(concert.id, e)} disabled={isDeleting} className="p-1.5 md:p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"><Trash2 size={14} /></button>
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
            <p className="text-sm text-gray-500">No hay conciertos programados para este evento</p>
            {canManageEvents && <button onClick={() => setShowCreateConcert(true)} className="mt-3 text-brand-yellow text-sm hover:underline">Crear el primer concierto</button>}
          </div>
        )}
      </div>

      {/* Rehearsals Section */}
      <div className="bg-surface-100/30 p-4 md:p-6 rounded-2xl border border-surface-200/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2 text-white font-semibold text-lg">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <ClipboardCheck size={16} className="text-emerald-400" />
            </div>
            Ensayos
            {sortedRehearsals.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white/10 text-white font-medium">{sortedRehearsals.length}</span>
            )}
          </h3>
          {canManageEvents && (
            <button onClick={() => setShowCreateRehearsal(true)} className="flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-emerald-500/10">
              <Plus size={16} />
              Nuevo Ensayo
            </button>
          )}
        </div>

        {sortedRehearsals.length > 0 ? (
          <div className="space-y-2">
            {sortedRehearsals.map((rehearsal, index) => {
              const rehearsalDate = new Date(rehearsal.date);
              const isUpcoming = rehearsalDate >= new Date();
              const isDeleting = deletingRehearsalId === rehearsal.id;
              return (
                <div
                  key={rehearsal.id || `rehearsal-${index}`}
                  onClick={() => handleRehearsalClick(rehearsal.id)}
                  className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-surface-100/50 border border-surface-200/30 hover:border-white/10 transition-all cursor-pointer group ${isDeleting ? "opacity-50" : ""}`}
                >
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center shrink-0 ${isUpcoming ? "bg-emerald-600" : "bg-gray-600"}`}>
                    <ClipboardCheck size={18} className="text-white md:w-5 md:h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm md:text-base text-white font-medium capitalize truncate max-w-[200px] sm:max-w-none">
                        {rehearsalDate.toLocaleDateString("es-DO", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                      </p>
                      {isUpcoming && <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-500 text-white uppercase font-medium shrink-0">Próximo</span>}
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 mt-0.5 md:mt-1">
                      {rehearsal.location && (
                        <p className="text-xs md:text-sm text-gray-400 flex items-center gap-1 truncate max-w-[140px] sm:max-w-none">
                          <MapPin size={10} className="shrink-0 md:w-3 md:h-3" /><span className="truncate">{rehearsal.location.name}</span>
                        </p>
                      )}
                      <p className="text-xs text-gray-500 shrink-0">{rehearsalDate.toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" })}</p>
                      {(rehearsal._count?.attendances || 0) > 0 && (
                        <span className="text-xs text-gray-500 shrink-0 flex items-center gap-1">
                          <Users size={10} />
                          {rehearsal._count?.attendances}
                        </span>
                      )}
                    </div>
                  </div>
                  {canManageEvents && (
                    <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => handleDeleteRehearsal(rehearsal.id, e)} disabled={isDeleting} className="p-1.5 md:p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"><Trash2 size={14} /></button>
                    </div>
                  )}
                  <ChevronRight size={14} className="text-gray-600 group-hover:text-gray-400 transition-colors shrink-0 md:w-4 md:h-4" />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <ClipboardCheck size={32} className="mx-auto text-gray-600 mb-2" />
            <p className="text-sm text-gray-500">No hay ensayos programados para este evento</p>
            {canManageEvents && <button onClick={() => setShowCreateRehearsal(true)} className="mt-3 text-emerald-400 text-sm hover:underline">Crear el primer ensayo</button>}
          </div>
        )}
      </div>

      {/* Admin Actions */}
      {canManageEvents && (
        <div className="bg-surface-100/30 p-4 rounded-2xl border border-surface-200/30">
          {showDeleteConfirm ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-red-500/10 p-4 rounded-xl border border-red-500/30 animate-in fade-in duration-200">
              <p className="text-sm text-red-400">Eliminar este evento?</p>
              <div className="flex gap-2">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 sm:flex-none px-4 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200">Cancelar</button>
                <button onClick={handleDelete} disabled={deleteEvent.isPending} className="flex-1 sm:flex-none px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-all duration-200 disabled:opacity-50">
                  {deleteEvent.isPending ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-2 text-sm text-red-400/80 hover:text-red-400 transition-colors"><Trash2 size={14} />Eliminar evento</button>
          )}
        </div>
      )}

      {/* Modals */}
      <SongDetailModal song={selectedSong} onClose={() => setSelectedSong(null)} />
      <CreateConcertModal isOpen={showCreateConcert} onClose={handleCloseConcertModal} event={displayEvent} editConcert={editConcert} />
      <CreateRehearsalModal isOpen={showCreateRehearsal} onClose={() => setShowCreateRehearsal(false)} defaultEventId={event.id} />
    </div>
  );
}
