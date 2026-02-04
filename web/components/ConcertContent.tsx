"use client";

import { useState } from "react";
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
  Video,
  Upload,
  Trash2,
  Search,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useConcert, useDeleteConcert, useAddSongToConcert, useRemoveSongFromConcert, useCopyEventSongsToConcert, useReorderConcertSongs } from "@/hooks/use-concerts";
import { useSongs } from "@/hooks/use-songs";
import { useConcertAssets, useCreateAsset, useDeleteAsset } from "@/hooks/use-upload";
import SongDetailModal from "@/components/SongDetailModal";
import CreateConcertModal from "@/components/CreateConcertModal";
import MediaGallery from "@/components/MediaGallery";
import SortableSongItem from "@/components/SortableSongItem";
import { FileDropzone } from "@/components/ui/FileDropzone";
import type { Concert, Song, AssetType } from "@/lib/api";
import { env } from "@/lib/env";
import { formatDuration, calculateSetlistDuration, hasDurationData } from "@/lib/utils";
import Link from "next/link";

interface ConcertContentProps {
  concert: Concert;
  onBack: () => void;
}

export default function ConcertContent({ concert, onBack }: ConcertContentProps) {
  const { canManageEvents, canUploadMedia } = useAuth();
  const { data: fullConcert } = useConcert(concert.id);
  const { data: allSongs } = useSongs();
  const deleteConcert = useDeleteConcert();
  const addSongToConcert = useAddSongToConcert();
  const removeSongFromConcert = useRemoveSongFromConcert();
  const copySongsFromEvent = useCopyEventSongsToConcert();

  // Media gallery hooks
  const { data: assets = [] } = useConcertAssets(concert.id);
  const createAsset = useCreateAsset();
  const deleteAsset = useDeleteAsset();

  const [showAddSong, setShowAddSong] = useState(false);
  const [songSearchQuery, setSongSearchQuery] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUploadMedia, setShowUploadMedia] = useState(false);

  const displayConcert = fullConcert || concert;
  const concertSongs = displayConcert.songs || [];
  const concertDate = new Date(displayConcert.date);
  const isUpcoming = concertDate >= new Date();

  // Get event songs count for reference
  const eventSongsCount = displayConcert.event?.songs?.length || displayConcert.event?._count?.songs || 0;


  // Filter out songs already in the concert and apply search
  const availableSongs = allSongs?.filter(
    (song) => {
      // Filter out songs already in concert
      if (concertSongs.some((cs) => cs.id === song.id)) return false;

      // Apply search filter
      if (songSearchQuery) {
        const query = songSearchQuery.toLowerCase();
        return (
          song.title.toLowerCase().includes(query) ||
          song.artist.toLowerCase().includes(query)
        );
      }
      return true;
    }
  ) || [];

  const handleAddSong = async (songId: string) => {
    await addSongToConcert.mutateAsync({ concertId: concert.id, songId });
    setSongSearchQuery("");
    setShowAddSong(false);
  };

  const handleRemoveSong = async (songId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await removeSongFromConcert.mutateAsync({ concertId: concert.id, songId });
  };

  const handleCopyFromEvent = async () => {
    await copySongsFromEvent.mutateAsync(concert.id);
  };

  const handleDelete = async () => {
    await deleteConcert.mutateAsync({ id: concert.id, eventId: displayConcert.eventId });
    onBack();
  };

  const handleSongClick = (song: Song) => {
    setSelectedSong(song);
  };

  const handleMediaUploadComplete = async (response: { file: { url: string; originalName: string } }, type: AssetType) => {
    const fullUrl = `${env.apiUrl}${response.file.url}`;
    await createAsset.mutateAsync({
      type,
      url: fullUrl,
      name: response.file.originalName,
      concertId: concert.id,
    });
    setShowUploadMedia(false);
  };

  const handleDeleteAsset = async (assetId: string) => {
    await deleteAsset.mutateAsync(assetId);
  };

  // Drag-and-drop setup
  const reorderSongs = useReorderConcertSongs();

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = concertSongs.findIndex((s) => s.id === active.id);
    const newIndex = concertSongs.findIndex((s) => s.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = arrayMove(concertSongs, oldIndex, newIndex);
      const songIds = newOrder.map((s) => s.id);
      await reorderSongs.mutateAsync({ concertId: concert.id, songIds });
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      {/* Action Bar: Back + Edit */}
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

      {/* Concert Details Card - only extra info not in header */}
      {(displayConcert.notes || displayConcert.event) && (
        <div className="bg-surface-100/30 p-4 rounded-2xl border border-surface-200/30 space-y-3">
          {/* Link to Event */}
          {displayConcert.event && (
            <Link
              href={`/events`}
              className="flex items-center gap-2 text-gray-400 hover:text-brand-yellow transition-colors group"
            >
              <Calendar size={16} className="text-gray-500 group-hover:text-brand-yellow shrink-0" />
              <span className="text-sm">Ver evento: {displayConcert.event.name}</span>
              <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          )}

          {/* Notes */}
          {displayConcert.notes && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-surface-100/50 border border-surface-200/30">
              <FileText size={14} className="text-gray-500 mt-0.5 shrink-0" />
              <p className="text-sm text-gray-300">{displayConcert.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className={`grid gap-2 md:gap-4 ${eventSongsCount > 0 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        <div className="bg-surface-100/50 p-3 md:p-4 rounded-xl border border-surface-200/50 text-center">
          <div className="text-xl md:text-3xl font-bold text-white">{concertSongs.length}</div>
          <div className="text-[10px] md:text-sm text-gray-400 mt-1">Canciones</div>
        </div>
        <div className="bg-surface-100/50 p-3 md:p-4 rounded-xl border border-surface-200/50 text-center">
          <div className="flex items-center justify-center gap-1 text-xl md:text-3xl font-bold text-white">
            <Clock size={16} className="text-gray-500 md:w-5 md:h-5" />
            <span>{hasDurationData(concertSongs) ? formatDuration(calculateSetlistDuration(concertSongs)) : "--"}</span>
          </div>
          <div className="text-[10px] md:text-sm text-gray-400 mt-1">Duración</div>
        </div>
        {eventSongsCount > 0 && (
          <div className="bg-surface-100/50 p-3 md:p-4 rounded-xl border border-surface-200/50 text-center">
            <div className="text-xl md:text-3xl font-bold text-white">{eventSongsCount}</div>
            <div className="text-[10px] md:text-sm text-gray-400 mt-1">En el evento</div>
          </div>
        )}
      </div>

      {/* Setlist Section */}
      <div data-tour="concert-setlist" className="bg-surface-100/30 p-4 md:p-6 rounded-2xl border border-surface-200/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="flex items-center gap-2 text-white font-semibold text-base sm:text-lg">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-brand-yellow/20 flex items-center justify-center">
              <Music size={14} className="text-brand-yellow sm:w-4 sm:h-4" />
            </div>
            Setlist
            {concertSongs.length > 0 && (
              <span className="text-[10px] sm:text-xs text-gray-500 font-normal ml-1">
                ({concertSongs.length} {concertSongs.length === 1 ? "canción" : "canciones"})
              </span>
            )}
          </h3>
          {canManageEvents && !showAddSong && (
            <div className="flex items-center gap-2">
              {concertSongs.length === 0 && eventSongsCount > 0 && (
                <button
                  onClick={handleCopyFromEvent}
                  disabled={copySongsFromEvent.isPending}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5 disabled:opacity-50"
                >
                  <Copy size={14} />
                  <span>Copiar</span>
                </button>
              )}
              <button
                onClick={() => setShowAddSong(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-sm text-brand-yellow hover:text-brand-yellow/80 transition-colors px-3 py-2 rounded-lg hover:bg-brand-yellow/10"
              >
                <Plus size={16} />
                <span>Agregar</span>
              </button>
            </div>
          )}
        </div>

        {/* Add Song Selector with Search */}
        {showAddSong && (
          <div className="mb-4 p-3 sm:p-4 bg-surface-100/50 rounded-xl border border-surface-200/50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">Agregar canción:</span>
              <button
                onClick={() => {
                  setSongSearchQuery("");
                  setShowAddSong(false);
                }}
                className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={songSearchQuery}
                onChange={(e) => setSongSearchQuery(e.target.value)}
                placeholder="Buscar canción o artista..."
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
                  <button
                    key={song.id}
                    onClick={() => handleAddSong(song.id)}
                    disabled={addSongToConcert.isPending}
                    className="w-full flex items-center gap-3 p-2 sm:p-2.5 rounded-lg hover:bg-white/5 active:bg-white/10 text-left transition-all disabled:opacity-50"
                  >
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
                    <Plus size={16} className="text-brand-yellow shrink-0" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-6">
                {songSearchQuery ? "No se encontraron canciones" : "No hay canciones disponibles"}
              </p>
            )}
          </div>
        )}

        {/* Songs List with Drag-Drop */}
        {concertSongs.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={concertSongs.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1">
                {concertSongs.map((song, index) => (
                  <SortableSongItem
                    key={song.id}
                    song={song}
                    index={index}
                    onSongClick={handleSongClick}
                    onRemove={handleRemoveSong}
                    isRemoving={removeSongFromConcert.isPending}
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

      {/* Media Gallery Section */}
      <div data-tour="concert-media" className="bg-surface-100/30 p-4 md:p-6 rounded-2xl border border-surface-200/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="flex items-center gap-2 text-white font-semibold text-base sm:text-lg">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Video size={14} className="text-purple-400 sm:w-4 sm:h-4" />
            </div>
            <span className="hidden xs:inline">Media del Concierto</span>
            <span className="xs:hidden">Media</span>
            {assets.length > 0 && (
              <span className="text-[10px] sm:text-xs text-gray-500 font-normal ml-1">
                ({assets.length})
              </span>
            )}
          </h3>
          {canUploadMedia && !showUploadMedia && (
            <button
              data-tour="concert-upload-btn"
              onClick={() => setShowUploadMedia(true)}
              className="flex items-center justify-center gap-1.5 text-sm text-purple-400 hover:text-purple-300 transition-colors px-3 py-2 rounded-lg hover:bg-purple-500/10 w-full sm:w-auto"
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
          canDelete={canManageEvents}
        />
      </div>

      {/* Admin Actions */}
      {canManageEvents && (
        <div className="bg-surface-100/30 p-4 rounded-2xl border border-surface-200/30">
          {showDeleteConfirm ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-red-500/10 p-4 rounded-xl border border-red-500/30 animate-in fade-in duration-200">
              <p className="text-sm text-red-400">¿Eliminar este concierto?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteConcert.isPending}
                  className="flex-1 sm:flex-none px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-all duration-200 disabled:opacity-50"
                >
                  {deleteConcert.isPending ? "Eliminando..." : "Eliminar"}
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

      {/* Modals */}
      <SongDetailModal
        song={selectedSong}
        onClose={() => setSelectedSong(null)}
      />

      {displayConcert.event && (
        <CreateConcertModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          event={displayConcert.event}
          editConcert={displayConcert}
        />
      )}
    </div>
  );
}
