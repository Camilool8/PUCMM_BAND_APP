"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEvent } from "@/hooks/use-events";
import { useAuth } from "@/hooks/use-auth";
import EventContent from "@/components/EventContent";
import CreateEventModal from "@/components/CreateEventModal";
import {
  Calendar,
  TreePine,
  GraduationCap,
  PartyPopper,
  Sparkles,
  Star,
  Heart,
  Zap,
  Music,
  Library,
  Clock,
  Archive,
  LayoutGrid,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { Event } from "@/lib/api";

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
  Library,
  Clock,
  Archive,
  LayoutGrid,
};

const COLOR_MAP: Record<string, string> = {
  "red-600": "#DC2626",
  "blue-600": "#2563EB",
  "purple-600": "#9333EA",
  "brand-blue-primary": "#0033A0",
  "indigo-600": "#4F46E5",
  "amber-500": "#F59E0B",
  "emerald-500": "#10B981",
  "pink-500": "#EC4899",
  "gray-500": "#6B7280",
  "gray-600": "#4B5563",
};

const getColor = (colorName: string | null): string => {
  if (!colorName) return "#0033A0";
  const baseName = colorName.split("/")[0];
  return COLOR_MAP[baseName] || "#0033A0";
};

interface EventClientProps {
  eventId: string;
}

export default function EventClient({ eventId }: EventClientProps) {
  const router = useRouter();
  const { data: event, isLoading, error } = useEvent(eventId);
  const { canManageEvents } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="h-48 rounded-xl bg-surface-50 animate-shimmer" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-surface-50 animate-shimmer"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-surface-50 flex items-center justify-center">
          <Calendar size={32} className="text-gray-500" />
        </div>
        <p className="text-gray-400 mb-2">Evento no encontrado</p>
        <button
          onClick={() => router.push("/events")}
          className="text-sm text-brand-blue-primary hover:underline"
        >
          Volver a eventos
        </button>
      </div>
    );
  }

  const EventIcon = event.iconName ? ICON_MAP[event.iconName] : Calendar;
  const Icon = EventIcon || Calendar;
  const gradientFrom = getColor(event.iconGradientFrom);
  const gradientTo = getColor(event.iconGradientTo);
  const bannerUrl = event.bannerUrl;

  const songsCount = event.songs?.length || event._count?.songs || 0;
  const concertsCount = event.concerts?.length || event._count?.concerts || 0;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Dynamic Hero Header */}
      <header className="relative -mx-4 md:-mx-8 -mt-4 md:-mt-8 px-4 md:px-8 pt-4 md:pt-8 pb-6 overflow-hidden">
        {bannerUrl && (
          <>
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${bannerUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div className="absolute inset-0 backdrop-blur-xl" />
            <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/60 to-surface-0" />
          </>
        )}

        {!bannerUrl && (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, ${gradientFrom}80, ${gradientTo}40, transparent)`,
            }}
          />
        )}

        <div className="relative flex items-end gap-4 md:gap-6">
          <div
            className="w-20 h-20 md:w-36 md:h-36 shrink-0 rounded-xl md:rounded-2xl shadow-2xl flex items-center justify-center border border-white/10 overflow-hidden"
            style={{
              background: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})`,
            }}
          >
            {bannerUrl ? (
              <img src={bannerUrl} alt={event.name} className="w-full h-full object-cover" />
            ) : (
              <Icon size={48} className="text-white/90 md:w-16 md:h-16" />
            )}
          </div>

          <div className="flex-1 min-w-0 pb-1">
            <p className="text-xs md:text-sm font-medium text-white/60 uppercase tracking-wider mb-1">
              Evento
            </p>
            <h1 className="text-xl md:text-4xl font-black text-white truncate">
              {event.name}
            </h1>
            <p className="text-sm text-gray-300 mt-1 hidden md:block truncate">
              {event.description || `${songsCount} canciones - ${concertsCount} conciertos`}
            </p>
            <p className="text-sm text-gray-300 mt-1 md:hidden">
              {songsCount} canciones - {concertsCount} conciertos
            </p>
          </div>

          {canManageEvents && (
            <button
              onClick={() => setShowEditModal(true)}
              className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all"
            >
              <Settings size={18} className="md:w-5 md:h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Event Content */}
      <EventContent
        event={event}
        onEdit={(_e) => setShowEditModal(true)}
      />

      {/* Edit Modal */}
      <CreateEventModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        editEvent={event}
      />
    </div>
  );
}
