"use client";

import { useState, useMemo } from "react";
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
  X,
  FileText,
  Pencil,
  ArrowLeft,
  Copy,
  ExternalLink,
  Clock,
  Trash2,
  Search,
  Check,
  Layers,
  MapPin,
  Users,
  Video,
  Upload,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRehearsalAssets, useCreateAsset, useDeleteAsset } from "@/hooks/use-upload";
import MediaGallery from "@/components/MediaGallery";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { env } from "@/lib/env";
import {
  useRehearsal,
  useDeleteRehearsal,
  useAddSongToRehearsal,
  useAddSongsToRehearsalBulk,
  useRemoveSongFromRehearsal,
  useCopyEventSongsToRehearsal,
  useReorderRehearsalSetlist,
  useAddBlockToRehearsal,
  useRemoveBlockFromRehearsal,
} from "@/hooks/use-rehearsals";
import { useSongs } from "@/hooks/use-songs";
import SongDetailModal from "@/components/SongDetailModal";
import CreateRehearsalModal from "@/components/CreateRehearsalModal";
import AttendancePanel from "@/components/AttendancePanel";
import SortableSongItem from "@/components/SortableSongItem";
import SortableBlockItem, { BLOCK_LABELS } from "@/components/SortableBlockItem";
import type { Rehearsal, Song, SetlistItem, BlockType, AssetType } from "@/lib/api";
import { formatDuration } from "@/lib/utils";
import Link from "next/link";
import PlaySetlistButton from "@/components/player/PlaySetlistButton";

interface RehearsalContentProps {
  rehearsal: Rehearsal;
  onBack: () => void;
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

export default function RehearsalContent({ rehearsal, onBack }: RehearsalContentProps) {
  const { canManageEvents, canUploadMedia, canDeleteAssets } = useAuth();
  const { data: fullRehearsal } = useRehearsal(rehearsal.id);
  const { data: allSongs } = useSongs();
  const deleteRehearsal = useDeleteRehearsal();
  const addSongToRehearsal = useAddSongToRehearsal();
  const addSongsBulk = useAddSongsToRehearsalBulk();
  const removeSongFromRehearsal = useRemoveSongFromRehearsal();
  const copySongsFromEvent = useCopyEventSongsToRehearsal();
  const addBlockToRehearsal = useAddBlockToRehearsal();
  const removeBlockFromRehearsal = useRemoveBlockFromRehearsal();

  // Media gallery hooks
  const { data: assets = [] } = useRehearsalAssets(rehearsal.id);
  const createAsset = useCreateAsset();
  const deleteAsset = useDeleteAsset();

  const [showAddSong, setShowAddSong] = useState(false);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [songSearchQuery, setSongSearchQuery] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSongIds, setSelectedSongIds] = useState<Set<string>>(new Set());
  const [blockType, setBlockType] = useState<BlockType>("INTERLUDE");
  const [blockLabel, setBlockLabel] = useState("");
  const [blockDuration, setBlockDuration] = useState("");
  const [showUploadMedia, setShowUploadMedia] = useState(false);

  const displayRehearsal = fullRehearsal || rehearsal;
  const setlistItems = displayRehearsal.setlistItems || [];
  const rehearsalSongs = displayRehearsal.songs || [];
  const rehearsalDate = new Date(displayRehearsal.date);

  const eventSongsCount = displayRehearsal.event?.songs?.length || displayRehearsal.event?._count?.songs || 0;

  const songIdsInRehearsal = useMemo(() => new Set(rehearsalSongs.map((s) => s.id)), [rehearsalSongs]);
  const availableSongs = useMemo(() =>
    allSongs?.filter((song) => {
      if (songIdsInRehearsal.has(song.id)) return false;
      if (songSearchQuery) {
        const query = songSearchQuery.toLowerCase();
        return song.title.toLowerCase().includes(query) || song.artist.toLowerCase().includes(query);
      }
      return true;
    }) || [],
    [allSongs, songIdsInRehearsal, songSearchQuery]
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
      await addSongToRehearsal.mutateAsync({ rehearsalId: rehearsal.id, songId: songIds[0] });
    } else {
      await addSongsBulk.mutateAsync({ rehearsalId: rehearsal.id, songIds });
    }
    setSelectedSongIds(new Set());
    setSongSearchQuery("");
    setShowAddSong(false);
  };

  const handleRemoveSong = async (songId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await removeSongFromRehearsal.mutateAsync({ rehearsalId: rehearsal.id, songId });
  };

  const handleRemoveBlock = async (blockId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await removeBlockFromRehearsal.mutateAsync({ rehearsalId: rehearsal.id, blockId });
  };

  const handleAddBlock = async () => {
    const label = blockLabel.trim() || BLOCK_LABELS[blockType];
    const durationMinutes = blockDuration ? parseInt(blockDuration, 10) : undefined;
    await addBlockToRehearsal.mutateAsync({
      rehearsalId: rehearsal.id,
      data: { type: blockType, label, durationMinutes },
    });
    setBlockLabel("");
    setBlockDuration("");
    setShowAddBlock(false);
  };

  const handleCopyFromEvent = async () => {
    await copySongsFromEvent.mutateAsync(rehearsal.id);
  };

  const handleDelete = async () => {
    await deleteRehearsal.mutateAsync({ id: rehearsal.id, eventId: displayRehearsal.eventId });
    onBack();
  };

  const handleMediaUploadComplete = async (response: { file: { url: string; originalName: string } }, type: "VIDEO" | "SCORE") => {
    const fullUrl = `${env.apiUrl}${response.file.url}`;
    await createAsset.mutateAsync({
      type,
      url: fullUrl,
      name: response.file.originalName,
      rehearsalId: rehearsal.id,
    });
    setShowUploadMedia(false);
  };

  const handleDeleteAsset = async (assetId: string) => {
    await deleteAsset.mutateAsync(assetId);
  };

  const handleSongClick = (song: Song) => {
    setSelectedSong(song);
  };

  // Drag-and-drop
  const reorderSetlist = useReorderRehearsalSetlist();

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
      reorderSetlist.mutate({ rehearsalId: rehearsal.id, items });
    }
  };

  const isAdding = addSongToRehearsal.isPending || addSongsBulk.isPending;

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      {/* Action Bar */}
      <div className="flex items-center justify-between -mt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">Volver</span>
        </button>

        {canManageEvents && (
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm"
          >
            <Pencil size={14} />
            <span>Editar</span>
          </button>
        )}
      </div>

      {/* Details Card */}
      {(displayRehearsal.notes || displayRehearsal.event || displayRehearsal.location) && (
        <div className="bg-surface-100/30 p-4 rounded-2xl border border-surface-200/30 space-y-3">
          {/* Link to Event */}
          {displayRehearsal.event && (
            <Link
              href={`/events/${displayRehearsal.event.id}`}
              className="flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-colors group"
            >
              <Calendar size={16} className="text-gray-500 group-hover:text-emerald-400 shrink-0" />
              <span className="text-sm">Ver evento: {displayRehearsal.event.name}</span>
              <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          )}

          {/* Location */}
          {displayRehearsal.location && (
            <div className="flex items-center gap-2 text-gray-400">
              <MapPin size={16} className="text-gray-500 shrink-0" />
              <span className="text-sm">{displayRehearsal.location.name}</span>
              {displayRehearsal.location.address && (
                <span className="text-xs text-gray-500">• {displayRehearsal.location.address}</span>
              )}
            </div>
          )}

          {/* Notes */}
          {displayRehearsal.notes && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-surface-100/50 border border-surface-200/30">
              <FileText size={14} className="text-gray-500 mt-0.5 shrink-0" />
              <p className="text-sm text-gray-300">{displayRehearsal.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className={`grid gap-2 md:gap-4 ${eventSongsCount > 0 ? "grid-cols-3" : "grid-cols-2"}`}>
        <div className="bg-surface-100/50 p-3 md:p-4 rounded-xl border border-surface-200/50 text-center">
          <div className="text-xl md:text-3xl font-bold text-white">{setlistItems.length}</div>
          <div className="text-[10px] md:text-sm text-gray-400 mt-1">Items</div>
        </div>
        <div className="bg-surface-100/50 p-3 md:p-4 rounded-xl border border-surface-200/50 text-center">
          <div className="flex items-center justify-center gap-1 text-xl md:text-3xl font-bold text-white">
            <Users size={16} className="text-gray-500 md:w-5 md:h-5" />
            <span>{displayRehearsal.attendances?.length || displayRehearsal._count?.attendances || 0}</span>
          </div>
          <div className="text-[10px] md:text-sm text-gray-400 mt-1">Asistentes</div>
        </div>
        {eventSongsCount > 0 && (
          <div className="bg-surface-100/50 p-3 md:p-4 rounded-xl border border-surface-200/50 text-center">
            <div className="text-xl md:text-3xl font-bold text-white">{eventSongsCount}</div>
            <div className="text-[10px] md:text-sm text-gray-400 mt-1">En el evento</div>
          </div>
        )}
      </div>

      {/* Setlist Section */}
      <div className="bg-surface-100/30 p-4 md:p-6 rounded-2xl border border-surface-200/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <h3 className="flex items-center gap-2 text-white font-semibold text-base sm:text-lg">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-brand-yellow/20 flex items-center justify-center">
                <Music size={14} className="text-brand-yellow sm:w-4 sm:h-4" />
              </div>
              Setlist
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
              songs={rehearsalSongs}
              context={{ type: "rehearsal", id: rehearsal.id, name: "Ensayo" }}
            />
          </div>
          {canManageEvents && !showAddSong && !showAddBlock && (
            <div className="flex items-center gap-1.5">
              {setlistItems.length === 0 && eventSongsCount > 0 && (
                <button
                  onClick={handleCopyFromEvent}
                  disabled={copySongsFromEvent.isPending}
                  className="flex items-center justify-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5 disabled:opacity-50"
                >
                  <Copy size={14} />
                  <span>Copiar</span>
                </button>
              )}
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
                disabled={addBlockToRehearsal.isPending}
                className="w-full px-4 py-2 bg-brand-yellow text-black text-sm font-medium rounded-lg hover:bg-brand-yellow/90 transition-all disabled:opacity-50"
              >
                {addBlockToRehearsal.isPending ? "Agregando..." : "Agregar bloque"}
              </button>
            </div>
          </div>
        )}

        {/* Add Song Selector */}
        {showAddSong && (
          <div className="mb-4 p-3 sm:p-4 bg-surface-100/50 rounded-xl border border-surface-200/50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">Agregar canciones:</span>
              <button
                onClick={() => {
                  setSongSearchQuery("");
                  setSelectedSongIds(new Set());
                  setShowAddSong(false);
                }}
                className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
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
                <button
                  onClick={() => setSongSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
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

        {/* Setlist Items */}
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
                      isRemoving={removeSongFromRehearsal.isPending}
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
                      isRemoving={removeBlockFromRehearsal.isPending}
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
            <p className="text-sm text-gray-500">
              No hay canciones en el setlist
            </p>
            {canManageEvents && eventSongsCount > 0 && (
              <button
                onClick={handleCopyFromEvent}
                disabled={copySongsFromEvent.isPending}
                className="mt-3 text-brand-yellow text-sm hover:underline disabled:opacity-50"
              >
                {copySongsFromEvent.isPending ? "Copiando..." : "Copiar setlist del evento"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Attendance Panel */}
      <AttendancePanel rehearsal={displayRehearsal} />

      {/* Media Gallery Section */}
      <div className="bg-surface-100/30 p-4 md:p-6 rounded-2xl border border-surface-200/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="flex items-center gap-2 text-white font-semibold text-base sm:text-lg">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Video size={14} className="text-emerald-400 sm:w-4 sm:h-4" />
            </div>
            <span className="hidden xs:inline">Media del Ensayo</span>
            <span className="xs:hidden">Media</span>
            {assets.length > 0 && (
              <span className="text-[10px] sm:text-xs text-gray-500 font-normal ml-1">
                ({assets.length})
              </span>
            )}
          </h3>
          {canUploadMedia && !showUploadMedia && (
            <button
              onClick={() => setShowUploadMedia(true)}
              className="flex items-center justify-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 transition-colors px-3 py-2 rounded-lg hover:bg-emerald-500/10 w-full sm:w-auto"
            >
              <Upload size={16} />
              <span>Subir media</span>
            </button>
          )}
        </div>

        {/* Upload Section */}
        {showUploadMedia && (
          <div className="mb-4 p-4 bg-surface-100/50 rounded-xl border border-surface-200/50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">Subir video o imagen:</span>
              <button
                onClick={() => setShowUploadMedia(false)}
                className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                <X size={16} />
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <FileDropzone
                type="video"
                label="Video"
                description="MP4, WebM, MOV (max 1.5GB)"
                onUploadComplete={(response) => handleMediaUploadComplete(response, "VIDEO")}
              />
              <FileDropzone
                type="image"
                label="Imagen"
                description="JPG, PNG, WebP (max 15MB)"
                onUploadComplete={(response) => handleMediaUploadComplete(response, "VIDEO")}
              />
            </div>
          </div>
        )}

        {/* Gallery */}
        <MediaGallery
          assets={assets}
          onDelete={handleDeleteAsset}
          isDeleting={deleteAsset.isPending}
          canDelete={canDeleteAssets}
        />
      </div>

      {/* Admin Actions */}
      {canManageEvents && (
        <div className="bg-surface-100/30 p-4 rounded-2xl border border-surface-200/30">
          {showDeleteConfirm ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-red-500/10 p-4 rounded-xl border border-red-500/30 animate-in fade-in duration-200">
              <p className="text-sm text-red-400">¿Eliminar este ensayo?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteRehearsal.isPending}
                  className="flex-1 sm:flex-none px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-all duration-200 disabled:opacity-50"
                >
                  {deleteRehearsal.isPending ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 text-sm text-red-400/80 hover:text-red-400 transition-colors"
            >
              <Trash2 size={14} />
              Eliminar ensayo
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      <SongDetailModal
        song={selectedSong}
        onClose={() => setSelectedSong(null)}
      />

      <CreateRehearsalModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        editRehearsal={displayRehearsal}
      />
    </div>
  );
}
