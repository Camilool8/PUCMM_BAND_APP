"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  X,
  Pencil,
  Trash2,
  Music,
  Plus,
  Users,
  TreePine,
  GraduationCap,
  PartyPopper,
  Sparkles,
  Star,
  Heart,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/hooks/use-auth";
import { useEvent, useDeleteEvent, useAddSongToEvent, useRemoveSongFromEvent } from "@/hooks/use-events";
import { useSongs } from "@/hooks/use-songs";
import type { Event } from "@/lib/api";

interface EventDetailModalProps {
  event: Event | null;
  onClose: () => void;
  onEdit: (event: Event) => void;
}

// Icon mapping from string name to Lucide icon
const ICON_MAP: Record<string, LucideIcon> = {
  TreePine,
  GraduationCap,
  PartyPopper,
  Sparkles,
  Calendar,
  Music,
  Star,
  Heart,
  Zap,
};

// Color mapping from Tailwind class names to hex values
const COLOR_MAP: Record<string, string> = {
  "red-600": "#DC2626",
  "red-700": "#B91C1C",
  "blue-600": "#2563EB",
  "blue-700": "#1D4ED8",
  "purple-600": "#9333EA",
  "purple-700": "#7C3AED",
  "brand-blue-primary": "#0033A0",
  "indigo-600": "#4F46E5",
  "amber-500": "#F59E0B",
  "orange-600": "#EA580C",
  "emerald-500": "#10B981",
  "teal-600": "#0D9488",
  "pink-500": "#EC4899",
  "rose-600": "#E11D48",
};

const getColor = (colorName: string | null): string => {
  if (!colorName) return "#0033A0";
  const baseName = colorName.split("/")[0];
  return COLOR_MAP[baseName] || "#0033A0";
};

export default function EventDetailModal({ event, onClose, onEdit }: EventDetailModalProps) {
  const { canManageEvents } = useAuth();
  const { data: fullEvent } = useEvent(event?.id || "");
  const { data: allSongs } = useSongs();
  const deleteEvent = useDeleteEvent();
  const addSongToEvent = useAddSongToEvent();
  const removeSongFromEvent = useRemoveSongFromEvent();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddSong, setShowAddSong] = useState(false);

  // Reset states when event changes
  useEffect(() => {
    setShowDeleteConfirm(false);
    setShowAddSong(false);
  }, [event]);

  if (!event) return null;

  const displayEvent = fullEvent || event;

  // Get icon component from iconName
  const IconComponent = displayEvent.iconName ? ICON_MAP[displayEvent.iconName] : Calendar;
  const EventIcon = IconComponent || Calendar;

  // Get gradient colors
  const gradientFrom = getColor(displayEvent.iconGradientFrom);
  const gradientTo = getColor(displayEvent.iconGradientTo);

  const eventSongs = displayEvent.songs || [];
  const eventConcerts = displayEvent.concerts || [];

  // Filter out songs already in the event
  const availableSongs = allSongs?.filter(
    (song) => !eventSongs.some((es) => es.id === song.id)
  ) || [];

  const handleDelete = async () => {
    await deleteEvent.mutateAsync(event.id);
    onClose();
  };

  const handleAddSong = async (songId: string) => {
    await addSongToEvent.mutateAsync({ eventId: event.id, songId });
    setShowAddSong(false);
  };

  const handleRemoveSong = async (songId: string) => {
    await removeSongFromEvent.mutateAsync({ eventId: event.id, songId });
  };

  const handleClose = () => {
    setShowDeleteConfirm(false);
    setShowAddSong(false);
    onClose();
  };

  return (
    <Modal isOpen={!!event} onClose={handleClose} size="lg" showCloseButton={false}>
      {/* Custom Header with Image */}
      <div
        className="relative h-44 md:h-52 shrink-0"
        style={{
          background: displayEvent.bannerUrl
            ? undefined
            : `linear-gradient(to bottom, ${gradientFrom}60, ${gradientTo}30, transparent)`,
        }}
      >
        {/* Background image */}
        {displayEvent.bannerUrl && (
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `url(${displayEvent.bannerUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-surface-50/50 to-surface-50" />

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
            onClick={() => onEdit(displayEvent)}
            className="absolute top-4 right-16 z-10 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white transition-all duration-200"
          >
            <Pencil size={16} />
          </button>
        )}

        {/* Content */}
        <div className="absolute inset-x-0 bottom-0 flex items-end gap-4 md:gap-6 p-5 md:p-6">
          {/* Event Icon */}
          <div
            className="w-20 h-20 md:w-28 md:h-28 rounded-xl md:rounded-2xl shadow-2xl border-2 border-white/10 overflow-hidden shrink-0 ring-1 ring-black/20 flex items-center justify-center"
            style={{
              background: displayEvent.bannerUrl
                ? `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})`
                : `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})`,
            }}
          >
            {displayEvent.bannerUrl ? (
              <img src={displayEvent.bannerUrl} alt={displayEvent.name} className="w-full h-full object-cover" />
            ) : (
              <EventIcon size={36} className="text-white/90 md:w-12 md:h-12" />
            )}
          </div>

          {/* Event Info */}
          <div className="flex-1 min-w-0 pb-1">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-1 truncate drop-shadow-lg">
              {displayEvent.name}
            </h2>
            {displayEvent.description && (
              <p className="text-sm text-white/70 mt-2 line-clamp-2">{displayEvent.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Body Content */}
      <Modal.Body className="space-y-5">
        {/* Stats */}
        <div className="flex gap-4">
          <div className="flex-1 bg-surface-100/50 p-4 rounded-xl border border-surface-200/50 text-center">
            <div className="text-2xl font-bold text-white">{eventSongs.length}</div>
            <div className="text-xs text-gray-400 mt-1">Canciones</div>
          </div>
          <div className="flex-1 bg-surface-100/50 p-4 rounded-xl border border-surface-200/50 text-center">
            <div className="text-2xl font-bold text-white">{eventConcerts.length}</div>
            <div className="text-xs text-gray-400 mt-1">Conciertos</div>
          </div>
        </div>

        {/* Songs Section */}
        <div className="bg-surface-100/30 p-4 rounded-2xl border border-surface-200/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2 text-white font-semibold">
              <div className="w-8 h-8 rounded-lg bg-brand-yellow/20 flex items-center justify-center">
                <Music size={16} className="text-brand-yellow" />
              </div>
              Canciones del Evento
            </h3>
            {canManageEvents && !showAddSong && (
              <button
                onClick={() => setShowAddSong(true)}
                className="flex items-center gap-1.5 text-sm text-brand-yellow hover:text-brand-yellow/80 transition-colors"
              >
                <Plus size={16} />
                Agregar
              </button>
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
                      disabled={addSongToEvent.isPending}
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
          {eventSongs.length > 0 ? (
            <div className="space-y-1">
              {eventSongs.map((song) => (
                <div
                  key={song.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-all group"
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
                  {canManageEvents && (
                    <button
                      onClick={() => handleRemoveSong(song.id)}
                      disabled={removeSongFromEvent.isPending}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic text-center py-4">
              No hay canciones asignadas a este evento
            </p>
          )}
        </div>

        {/* Concerts Section */}
        <div className="bg-surface-100/30 p-4 rounded-2xl border border-surface-200/30">
          <h3 className="flex items-center gap-2 text-white font-semibold mb-3">
            <div className="w-8 h-8 rounded-lg bg-brand-yellow/20 flex items-center justify-center">
              <Users size={16} className="text-brand-yellow" />
            </div>
            Conciertos
          </h3>
          {eventConcerts.length > 0 ? (
            <div className="space-y-2">
              {eventConcerts.map((concert) => (
                <div
                  key={concert.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-surface-100/50 border border-surface-200/30"
                >
                  <Calendar size={16} className="text-gray-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white">
                      {new Date(concert.date).toLocaleDateString("es-DO", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    {concert.location && (
                      <p className="text-xs text-gray-500">{concert.location}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic text-center py-4">
              No hay conciertos programados
            </p>
          )}
        </div>

        {/* Admin Actions */}
        {canManageEvents && (
          <div className="pt-4 border-t border-surface-200/50">
            {showDeleteConfirm ? (
              <div className="flex items-center justify-between bg-red-500/10 p-4 rounded-xl border border-red-500/30 animate-in fade-in duration-200">
                <p className="text-sm text-red-400">¿Eliminar este evento?</p>
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
      </Modal.Body>

      {/* Footer with metadata */}
      <div className="shrink-0 px-6 py-4 border-t border-white/5 text-center">
        <p className="text-xs text-gray-500">
          Creado el{" "}
          {new Date(displayEvent.createdAt).toLocaleDateString("es-DO", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
    </Modal>
  );
}
