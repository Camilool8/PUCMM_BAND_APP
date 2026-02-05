"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pause, Mic, Coffee, ArrowRightLeft, Hash, Trash2, Pencil } from "lucide-react";
import type { SetlistBlock, BlockType } from "@/lib/api";

const BLOCK_ICONS: Record<BlockType, React.ElementType> = {
  INTERLUDE: Pause,
  INTRODUCTION: Mic,
  BREAK: Coffee,
  TRANSITION: ArrowRightLeft,
  CUSTOM: Hash,
};

const BLOCK_COLORS: Record<BlockType, string> = {
  INTERLUDE: "text-purple-400 bg-purple-500/20",
  INTRODUCTION: "text-blue-400 bg-blue-500/20",
  BREAK: "text-amber-400 bg-amber-500/20",
  TRANSITION: "text-emerald-400 bg-emerald-500/20",
  CUSTOM: "text-gray-400 bg-gray-500/20",
};

export const BLOCK_LABELS: Record<BlockType, string> = {
  INTERLUDE: "Interludio",
  INTRODUCTION: "Introduccion",
  BREAK: "Descanso",
  TRANSITION: "Transicion",
  CUSTOM: "Personalizado",
};

interface SortableBlockItemProps {
  block: SetlistBlock;
  sortableId: string;
  index: number;
  onEdit?: (block: SetlistBlock) => void;
  onRemove?: (blockId: string, e: React.MouseEvent) => void;
  isRemoving?: boolean;
  canReorder?: boolean;
  canRemove?: boolean;
}

export default function SortableBlockItem({
  block,
  sortableId,
  index,
  onEdit,
  onRemove,
  isRemoving,
  canReorder = false,
  canRemove = false,
}: SortableBlockItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sortableId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : undefined,
  };

  const Icon = BLOCK_ICONS[block.type] || Hash;
  const colorClass = BLOCK_COLORS[block.type] || BLOCK_COLORS.CUSTOM;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 md:gap-3 p-2 md:p-2.5 rounded-xl transition-all group
        border border-dashed border-white/10 bg-surface-100/20
        ${isDragging ? "bg-surface-100/80 shadow-lg" : ""}`}
    >
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

      <div className="w-6 md:w-8 text-center text-xs md:text-sm text-gray-500 shrink-0">
        {index + 1}
      </div>

      <div className={`w-10 h-10 md:w-11 md:h-11 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
        <Icon size={16} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm text-white/80 truncate">{block.label}</p>
        <p className="text-xs text-gray-500 truncate">
          {block.durationMinutes ? `${block.durationMinutes} min` : BLOCK_LABELS[block.type] || block.type.toLowerCase()}
        </p>
      </div>

      {canRemove && onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(block);
          }}
          className="md:opacity-0 md:group-hover:opacity-100 p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
        >
          <Pencil size={14} />
        </button>
      )}

      {canRemove && onRemove && (
        <button
          onClick={(e) => onRemove(block.id, e)}
          disabled={isRemoving}
          className="md:opacity-0 md:group-hover:opacity-100 p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}
