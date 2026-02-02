"use client";

import {
  ChevronRight,
  Calendar,
  Music,
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
import type { Event } from "@/lib/api";

interface EventRowProps {
  event: Event;
  index: number;
  onClick: (event: Event) => void;
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
  "emerald-500": "#10B981",
  "pink-500": "#EC4899",
};

const getColor = (colorName: string | null): string => {
  if (!colorName) return "#6B7280";
  // Handle opacity suffixes like "red-600/60"
  const baseName = colorName.split("/")[0];
  return COLOR_MAP[baseName] || "#6B7280";
};

export default function EventRow({ event, index, onClick }: EventRowProps) {
  const songsCount = event._count?.songs ?? 0;
  const concertsCount = event._count?.concerts ?? 0;

  // Get icon component
  const IconComponent = event.iconName ? ICON_MAP[event.iconName] : Calendar;
  const Icon = IconComponent || Calendar;

  // Get icon gradient colors
  const iconColorFrom = getColor(event.iconGradientFrom);
  const iconColorTo = getColor(event.iconGradientTo);

  return (
    <div
      onClick={() => onClick(event)}
      className="
        group flex items-center gap-3 md:gap-4 p-2.5 md:p-3
        rounded-xl cursor-pointer
        transition-smooth
        hover:bg-white/5 active:bg-white/10
        border border-transparent hover:border-white/5
      "
    >
      {/* Index */}
      <div className="w-6 md:w-8 shrink-0 text-center">
        <span className="text-gray-500 text-sm font-medium">
          {index + 1}
        </span>
      </div>

      {/* Image/Icon */}
      <div className="relative w-11 h-11 md:w-12 md:h-12 rounded-lg overflow-hidden shadow-lg shrink-0 bg-surface-100">
        {event.bannerUrl ? (
          <img
            src={event.bannerUrl}
            alt={event.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background: `linear-gradient(to bottom right, ${iconColorFrom}, ${iconColorTo})`,
            }}
          >
            <Icon size={18} className="text-white/90" />
          </div>
        )}
      </div>

      {/* Name & Description */}
      <div className="flex-1 min-w-0">
        <div className="text-white font-medium truncate text-sm md:text-base group-hover:text-brand-yellow transition-smooth">
          {event.name}
        </div>
        {event.description && (
          <span className="text-gray-400 text-xs md:text-sm truncate block">
            {event.description}
          </span>
        )}
      </div>

      {/* Stats - Hidden on mobile, shown as badges */}
      <div className="hidden sm:flex items-center gap-2">
        <div className="flex items-center gap-1 text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-md">
          <Music size={12} />
          <span>{songsCount}</span>
        </div>
        {concertsCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-md">
            <Users size={12} />
            <span>{concertsCount}</span>
          </div>
        )}
      </div>

      {/* Mobile Stats Indicator */}
      <div className="sm:hidden shrink-0 flex items-center gap-1 text-xs text-gray-400">
        <Music size={12} />
        <span>{songsCount}</span>
      </div>

      {/* Chevron indicator */}
      <ChevronRight
        size={18}
        className="text-gray-500 group-hover:text-gray-300 transition-smooth shrink-0"
      />
    </div>
  );
}
