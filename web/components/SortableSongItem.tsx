"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Music, Trash2, ChevronRight } from "lucide-react";
import type { Song } from "@/lib/api";

interface SortableSongItemProps {
  song: Song;
  index: number;
  onSongClick: (song: Song) => void;
  onRemove?: (songId: string, e: React.MouseEvent) => void;
  isRemoving?: boolean;
  canReorder?: boolean;
  canRemove?: boolean;
}

export default function SortableSongItem({
  song,
  index,
  onSongClick,
  onRemove,
  isRemoving,
  canReorder = false,
  canRemove = false,
}: SortableSongItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: song.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSongClick(song)}
      className={`flex items-center gap-2 md:gap-3 p-2 md:p-2.5 rounded-xl hover:bg-white/5 transition-all group cursor-pointer ${
        isDragging ? "bg-surface-100/80 shadow-lg" : ""
      }`}
    >
      {/* Drag Handle */}
      {canReorder && (
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="p-1 text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical size={16} />
        </button>
      )}

      {/* Position number */}
      <div className="w-6 md:w-8 text-center text-xs md:text-sm text-gray-500 shrink-0">
        {index + 1}
      </div>

      {/* Cover */}
      <div className="w-10 h-10 md:w-11 md:h-11 rounded-lg bg-surface-200 flex items-center justify-center shrink-0 overflow-hidden">
        {song.coverUrl ? (
          <img src={song.coverUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <Music size={16} className="text-gray-500" />
        )}
      </div>

      {/* Song Info */}
      <div className="min-w-0 flex-1">
        <p className="text-sm text-white truncate group-hover:text-brand-yellow transition-colors">
          {song.title}
        </p>
        <p className="text-xs text-gray-500 truncate">{song.artist}</p>
      </div>

      {/* Remove Button */}
      {canRemove && onRemove && (
        <button
          onClick={(e) => onRemove(song.id, e)}
          disabled={isRemoving}
          className="opacity-0 group-hover:opacity-100 p-1.5 md:p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
        >
          <Trash2 size={14} />
        </button>
      )}

      {/* Chevron */}
      <ChevronRight
        size={14}
        className="text-gray-600 group-hover:text-gray-400 transition-colors shrink-0 md:w-4 md:h-4"
      />
    </div>
  );
}
