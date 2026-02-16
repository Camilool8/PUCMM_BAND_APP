"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRehearsal } from "@/hooks/use-rehearsals";
import { useAuth } from "@/hooks/use-auth";
import RehearsalContent from "@/components/RehearsalContent";
import CreateRehearsalModal from "@/components/CreateRehearsalModal";
import { ClipboardCheck, MapPin, Settings } from "lucide-react";

const COLOR_MAP: Record<string, string> = {
  "red-600": "#DC2626",
  "blue-600": "#2563EB",
  "purple-600": "#9333EA",
  "brand-blue-primary": "#0033A0",
  "indigo-600": "#4F46E5",
  "amber-500": "#F59E0B",
  "emerald-500": "#10B981",
  "emerald-600": "#059669",
  "teal-500": "#14B8A6",
  "teal-600": "#0D9488",
  "pink-500": "#EC4899",
  "gray-500": "#6B7280",
  "gray-600": "#4B5563",
};

const getColor = (colorName: string | null): string => {
  if (!colorName) return "#059669";
  const baseName = colorName.split("/")[0];
  return COLOR_MAP[baseName] || "#059669";
};

function formatRehearsalDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-DO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface RehearsalClientProps {
  rehearsalId: string;
}

export default function RehearsalClient({ rehearsalId }: RehearsalClientProps) {
  const router = useRouter();
  const { data: rehearsal, isLoading, error } = useRehearsal(rehearsalId);
  const { canManageRehearsals } = useAuth();
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

  if (error || !rehearsal) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-surface-50 flex items-center justify-center">
          <ClipboardCheck size={32} className="text-gray-500" />
        </div>
        <p className="text-gray-400 mb-2">Ensayo no encontrado</p>
        <button
          onClick={() => router.push("/rehearsals")}
          className="text-sm text-emerald-400 hover:underline"
        >
          Volver a ensayos
        </button>
      </div>
    );
  }

  const gradientFrom = rehearsal.event ? getColor(rehearsal.event.iconGradientFrom) : "#059669";
  const gradientTo = rehearsal.event ? getColor(rehearsal.event.iconGradientTo) : "#0D9488";
  const bannerUrl = rehearsal.event?.bannerUrl;
  const dateStr = formatRehearsalDate(rehearsal.date);
  const songsCount = rehearsal.setlistItems?.length || rehearsal._count?.songs || 0;

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
              <img src={bannerUrl} alt={dateStr} className="w-full h-full object-cover" />
            ) : (
              <ClipboardCheck size={48} className="text-white/90 md:w-16 md:h-16" />
            )}
          </div>

          <div className="flex-1 min-w-0 pb-1">
            <p className="text-xs md:text-sm font-medium text-white/60 uppercase tracking-wider mb-1">
              Ensayo
            </p>
            <h1 className="text-xl md:text-4xl font-black text-white truncate capitalize">
              {dateStr}
            </h1>
            <p className="text-sm text-gray-300 mt-1 hidden md:block truncate">
              {[rehearsal.event?.name, rehearsal.location?.name].filter(Boolean).join(" - ") || `${songsCount} canciones`}
            </p>
            <p className="text-sm text-gray-300 mt-1 md:hidden flex items-center gap-1">
              <MapPin size={12} />
              {rehearsal.location?.name || `${songsCount} canciones`}
            </p>
          </div>

          {canManageRehearsals && (
            <button
              onClick={() => setShowEditModal(true)}
              className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all"
            >
              <Settings size={18} className="md:w-5 md:h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Rehearsal Content */}
      <RehearsalContent
        rehearsal={rehearsal}
        onBack={() => router.push("/rehearsals")}
      />

      {/* Edit Modal */}
      <CreateRehearsalModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        editRehearsal={rehearsal}
      />
    </div>
  );
}
