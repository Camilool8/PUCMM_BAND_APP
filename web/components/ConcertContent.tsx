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
  MapPin,
  FileText,
  Pencil,
  ArrowLeft,
  Copy,
  ExternalLink,
  Clock,
  Video,
  Upload,
  Trash2,
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
import { formatDuration, calculateSetlistDuration, hasDurationData } from "@/lib/utils";
import Link from "next/link";

interface ConcertContentProps {
  concert: Concert;
  onBack: () => void;
}

export default function ConcertContent({ concert, onBack }: ConcertContentProps) {
  const { canManageEvents } = useAuth();
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

  // Filter out songs already in the concert
  const availableSongs = allSongs?.filter(
    (song) => !concertSongs.some((cs) => cs.id === song.id)
  ) || [];

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

  const handleDelete = async () => {
    await deleteConcert.mutateAsync({ id: concert.id, eventId: displayConcert.eventId });
    onBack();
  };

  const handleSongClick = (song: Song) => {
    setSelectedSong(song);
  };

  const handleMediaUploadComplete = async (response: { file: { url: string; originalName: string } }, type: AssetType) => {
    await createAsset.mutateAsync({
      type,
      url: response.file.url,
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
    <div className="space-y-6 animate-fade-in">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors -mt-2"
      >
        <ArrowLeft size={18} />
        <span className="text-sm">Volver a conciertos</span>
      </button>

      {/* Concert Info Card */}
      <div className="bg-surface-100/30 p-4 md:p-6 rounded-2xl border border-surface-200/30">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-4">
            {/* Date Badge */}
            <div
              className={`w-14 h-14 md:w-16 md:h-16 rounded-xl flex flex-col items-center justify-center shrink-0 ${
                isUpcoming ? "bg-brand-blue-primary" : "bg-gray-600"
              }`}
            >
              <span className="text-[10px] md:text-xs text-white/70 uppercase">
                {concertDate.toLocaleDateString("es-DO", { month: "short" })}
              </span>
              <span className="text-xl md:text-2xl font-bold text-white leading-none">
                {concertDate.getDate()}
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="text-lg md:text-xl font-bold text-white capitalize">
                  {concertDate.toLocaleDateString("es-DO", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </h2>
                {isUpcoming && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500 text-white uppercase font-medium">
                    Próximo
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-sm md:text-base">
                {concertDate.toLocaleTimeString("es-DO", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* Edit Button */}
          {canManageEvents && (
            <button
              onClick={() => setShowEditModal(true)}
              className="p-2 md:p-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <Pencil size={18} />
            </button>
          )}
        </div>

        {/* Location & Event */}
        <div className="space-y-2">
          {displayConcert.location && (
            <div className="flex items-center gap-2 text-gray-300">
              <MapPin size={16} className="text-gray-500 shrink-0" />
              <span className="text-sm md:text-base">{displayConcert.location}</span>
            </div>
          )}
          {displayConcert.event && (
            <Link
              href={`/events`}
              className="flex items-center gap-2 text-gray-400 hover:text-brand-yellow transition-colors group"
            >
              <Calendar size={16} className="text-gray-500 group-hover:text-brand-yellow shrink-0" />
              <span className="text-sm">{displayConcert.event.name}</span>
              <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          )}
        </div>

        {/* Notes */}
        {displayConcert.notes && (
          <div className="mt-4 p-3 rounded-xl bg-surface-100/50 border border-surface-200/30">
            <div className="flex items-start gap-2">
              <FileText size={14} className="text-gray-500 mt-0.5 shrink-0" />
              <p className="text-sm text-gray-300">{displayConcert.notes}</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 md:gap-4">
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
        <div className="bg-surface-100/50 p-3 md:p-4 rounded-xl border border-surface-200/50 text-center">
          <div className="text-xl md:text-3xl font-bold text-white">{eventSongsCount}</div>
          <div className="text-[10px] md:text-sm text-gray-400 mt-1">Del evento</div>
        </div>
      </div>

      {/* Setlist Section */}
      <div className="bg-surface-100/30 p-4 md:p-6 rounded-2xl border border-surface-200/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2 text-white font-semibold text-lg">
            <div className="w-8 h-8 rounded-lg bg-brand-yellow/20 flex items-center justify-center">
              <Music size={16} className="text-brand-yellow" />
            </div>
            Setlist
          </h3>
          {canManageEvents && !showAddSong && (
            <div className="flex items-center gap-2">
              {concertSongs.length === 0 && eventSongsCount > 0 && (
                <button
                  onClick={handleCopyFromEvent}
                  disabled={copySongsFromEvent.isPending}
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5 disabled:opacity-50"
                >
                  <Copy size={14} />
                  <span className="hidden sm:inline">Copiar del evento</span>
                </button>
              )}
              <button
                onClick={() => setShowAddSong(true)}
                className="flex items-center gap-1.5 text-sm text-brand-yellow hover:text-brand-yellow/80 transition-colors px-3 py-1.5 rounded-lg hover:bg-brand-yellow/10"
              >
                <Plus size={16} />
                Agregar
              </button>
            </div>
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
                    disabled={addSongToConcert.isPending}
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
      <div className="bg-surface-100/30 p-4 md:p-6 rounded-2xl border border-surface-200/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2 text-white font-semibold text-lg">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Video size={16} className="text-purple-400" />
            </div>
            Media del Concierto
            {assets.length > 0 && (
              <span className="text-xs text-gray-500 font-normal ml-2">
                ({assets.length} {assets.length === 1 ? "archivo" : "archivos"})
              </span>
            )}
          </h3>
          {canManageEvents && !showUploadMedia && (
            <button
              onClick={() => setShowUploadMedia(true)}
              className="flex items-center gap-1.5 text-sm text-purple-400 hover:text-purple-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-purple-500/10"
            >
              <Upload size={16} />
              Subir
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
