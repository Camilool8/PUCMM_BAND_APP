"use client";

import { useRouter } from "next/navigation";
import { useConcert } from "@/hooks/use-concerts";
import { useSection } from "@/hooks/use-sections";
import ConcertContent from "@/components/ConcertContent";
import {
  Calendar,
  MapPin,
  Users,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Users,
  Calendar,
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
  if (!colorName) return "#9333EA";
  const baseName = colorName.split("/")[0];
  return COLOR_MAP[baseName] || "#9333EA";
};

interface ConcertClientProps {
  concertId: string;
}

export default function ConcertClient({ concertId }: ConcertClientProps) {
  const router = useRouter();
  const { data: concert, isLoading, error } = useConcert(concertId);
  const { data: conciertosSection } = useSection("conciertos");

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

  if (error || !concert) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-surface-50 flex items-center justify-center">
          <Calendar size={32} className="text-gray-500" />
        </div>
        <p className="text-gray-400 mb-2">Concierto no encontrado</p>
        <button
          onClick={() => router.push("/concerts")}
          className="text-sm text-brand-blue-primary hover:underline"
        >
          Volver a conciertos
        </button>
      </div>
    );
  }

  const concertDate = new Date(concert.date);
  const isUpcoming = concertDate >= new Date();

  const concertEventBanner = concert.event?.bannerUrl;
  const concertEventGradientFrom = concert.event?.iconGradientFrom;
  const concertEventGradientTo = concert.event?.iconGradientTo;

  const gradientFrom = getColor(concertEventGradientFrom || null) || (isUpcoming ? "#0033A0" : "#4B5563");
  const gradientTo = getColor(concertEventGradientTo || null) || (isUpcoming ? "#4F46E5" : "#374151");
  const bannerUrl = concertEventBanner;

  const headerTitle = concertDate.toLocaleDateString("es-DO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const headerSubtitle = `${concert.event?.name || "Evento"} - ${concert.location || "Sin ubicacion"}`;

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
              <img src={bannerUrl} alt={headerTitle} className="w-full h-full object-cover" />
            ) : (
              <Calendar size={48} className="text-white/90 md:w-16 md:h-16" />
            )}
          </div>

          <div className="flex-1 min-w-0 pb-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs md:text-sm font-medium text-white/60 uppercase tracking-wider">
                Concierto
              </p>
              {isUpcoming && (
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-500 text-white uppercase font-medium">
                  Proximo
                </span>
              )}
            </div>
            <h1 className="text-xl md:text-4xl font-black text-white capitalize truncate">
              {headerTitle}
            </h1>
            <p className="text-sm text-gray-300 mt-1 hidden md:block truncate">
              {headerSubtitle}
            </p>
            {concert.location && (
              <p className="text-sm text-gray-300 mt-1 flex items-center gap-1.5 md:hidden">
                <MapPin size={12} />
                <span className="truncate">{concert.location}</span>
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Concert Content */}
      <ConcertContent
        concert={concert}
        onBack={() => router.push("/concerts")}
      />
    </div>
  );
}
