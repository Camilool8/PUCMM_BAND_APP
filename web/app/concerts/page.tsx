"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useConcerts, useConcert } from "@/hooks/use-concerts";
import { useSection } from "@/hooks/use-sections";
import { useAuth } from "@/hooks/use-auth";
import ConcertContent from "@/components/ConcertContent";
import SectionSettingsModal from "@/components/SectionSettingsModal";
import {
  Search,
  Calendar,
  X,
  LayoutGrid,
  Settings,
  Users,
  MapPin,
  Clock,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import type { Concert } from "@/lib/api";

// Icon mapping from string name to Lucide icon
const ICON_MAP: Record<string, LucideIcon> = {
  Users,
  Calendar,
  Clock,
  LayoutGrid,
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
  "gray-500": "#6B7280",
  "gray-600": "#4B5563",
  "gray-700": "#374151",
};

const getColor = (colorName: string | null): string => {
  if (!colorName) return "#9333EA";
  const baseName = colorName.split("/")[0];
  return COLOR_MAP[baseName] || "#9333EA";
};

type TabFilter = "todos" | "proximos" | "pasados" | string;

export default function ConcertsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // "todos", "proximos", "pasados", or a concert ID
  const [activeTab, setActiveTab] = useState<TabFilter>("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showSectionSettings, setShowSectionSettings] = useState(false);

  const { data: concerts, isLoading, error } = useConcerts();
  const { data: conciertosSection } = useSection("conciertos");
  const { canManageEvents } = useAuth();

  // Handle URL query param for direct concert navigation
  useEffect(() => {
    const concertId = searchParams.get("concert");
    if (concertId) {
      setActiveTab(concertId);
      // Clear the URL param without navigation
      router.replace("/concerts", { scroll: false });
    }
  }, [searchParams, router]);

  // Get selected concert from tab (if it's a concert ID)
  const selectedConcertId = useMemo(() => {
    if (activeTab === "todos" || activeTab === "proximos" || activeTab === "pasados") {
      return null;
    }
    return activeTab;
  }, [activeTab]);

  // Fetch full concert data when a specific concert is selected
  const { data: fullSelectedConcert } = useConcert(selectedConcertId || "");

  // Find the concert in the list for basic data
  const selectedConcert = useMemo(() => {
    if (!selectedConcertId || !concerts) return null;
    return concerts.find((c) => c.id === selectedConcertId) || null;
  }, [selectedConcertId, concerts]);

  const displayConcert = fullSelectedConcert || selectedConcert;

  // Separate concerts into upcoming and past
  const { upcomingConcerts, pastConcerts, allConcerts } = useMemo(() => {
    if (!concerts) return { upcomingConcerts: [], pastConcerts: [], allConcerts: [] };

    const now = new Date();
    const upcoming: Concert[] = [];
    const past: Concert[] = [];

    for (const concert of concerts) {
      if (new Date(concert.date) >= now) {
        upcoming.push(concert);
      } else {
        past.push(concert);
      }
    }

    // Sort upcoming by date ascending, past by date descending
    upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    past.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      upcomingConcerts: upcoming,
      pastConcerts: past,
      allConcerts: [...upcoming, ...past],
    };
  }, [concerts]);

  // Filter concerts based on active tab and search
  const filteredConcerts = useMemo(() => {
    let list: Concert[] = [];

    if (activeTab === "todos") {
      list = allConcerts;
    } else if (activeTab === "proximos") {
      list = upcomingConcerts;
    } else if (activeTab === "pasados") {
      list = pastConcerts;
    } else {
      // A specific concert is selected, don't show list
      return [];
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return list.filter(
        (concert) =>
          concert.location?.toLowerCase().includes(query) ||
          concert.event?.name?.toLowerCase().includes(query) ||
          concert.notes?.toLowerCase().includes(query)
      );
    }

    return list;
  }, [activeTab, allConcerts, upcomingConcerts, pastConcerts, searchQuery]);

  const handleConcertClick = (concert: Concert) => {
    setActiveTab(concert.id);
  };

  // Dynamic header content based on selected tab
  const isConcertSelected = !!displayConcert;

  // Section header (for list tabs)
  const sectionIcon = conciertosSection?.iconName ? ICON_MAP[conciertosSection.iconName] : Users;
  const SectionIcon = sectionIcon || Users;
  const sectionGradientFrom = getColor(conciertosSection?.iconGradientFrom || null);
  const sectionGradientTo = getColor(conciertosSection?.iconGradientTo || null);

  // Concert header (for specific concert tab)
  const concertDate = displayConcert ? new Date(displayConcert.date) : null;
  const isUpcoming = concertDate ? concertDate >= new Date() : false;

  // Choose which to display
  const gradientFrom = isConcertSelected ? (isUpcoming ? "#0033A0" : "#4B5563") : sectionGradientFrom;
  const gradientTo = isConcertSelected ? (isUpcoming ? "#4F46E5" : "#374151") : sectionGradientTo;
  const bannerUrl = conciertosSection?.bannerUrl;

  const headerTitle = isConcertSelected
    ? concertDate?.toLocaleDateString("es-DO", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : (conciertosSection?.title || "Conciertos");

  const headerSubtitle = isConcertSelected
    ? `${displayConcert?.event?.name || "Evento"} • ${displayConcert?.location || "Sin ubicación"}`
    : (conciertosSection?.subtitle || `Historial de presentaciones • ${concerts?.length || 0} conciertos`);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Dynamic Hero Header */}
      <header className="relative -mx-4 md:-mx-8 -mt-4 md:-mt-8 px-4 md:px-8 pt-4 md:pt-8 pb-6 overflow-hidden">
        {/* Banner background */}
        {bannerUrl && !isConcertSelected && (
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

        {/* Gradient background (no banner or concert selected) */}
        {(!bannerUrl || isConcertSelected) && (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, ${gradientFrom}80, ${gradientTo}40, transparent)`,
            }}
          />
        )}

        {/* Content */}
        <div className="relative flex items-end gap-4 md:gap-6">
          {/* Icon */}
          <div
            className="w-20 h-20 md:w-36 md:h-36 shrink-0 rounded-xl md:rounded-2xl shadow-2xl flex items-center justify-center border border-white/10 overflow-hidden"
            style={{
              background: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})`,
            }}
          >
            {isConcertSelected ? (
              <Calendar size={48} className="text-white/90 md:w-16 md:h-16" />
            ) : bannerUrl ? (
              <img src={bannerUrl} alt={headerTitle || ""} className="w-full h-full object-cover" />
            ) : (
              <SectionIcon size={48} className="text-white/90 md:w-16 md:h-16" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pb-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs md:text-sm font-medium text-white/60 uppercase tracking-wider">
                {isConcertSelected ? "Concierto" : "PUCMM Band"}
              </p>
              {isConcertSelected && isUpcoming && (
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-500 text-white uppercase font-medium">
                  Próximo
                </span>
              )}
            </div>
            <h1 className="text-xl md:text-4xl font-black text-white capitalize truncate">
              {headerTitle}
            </h1>
            <p className="text-sm text-gray-300 mt-1 hidden md:block truncate">
              {headerSubtitle}
            </p>
            {isConcertSelected && displayConcert?.location && (
              <p className="text-sm text-gray-300 mt-1 flex items-center gap-1.5 md:hidden">
                <MapPin size={12} />
                <span className="truncate">{displayConcert.location}</span>
              </p>
            )}
          </div>

          {/* Settings button (only for section, not individual concerts) */}
          {canManageEvents && !isConcertSelected && (
            <button
              onClick={() => setShowSectionSettings(true)}
              className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all"
            >
              <Settings size={18} className="md:w-5 md:h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Tabs - scrollable on mobile */}
      <div className="flex gap-1.5 md:gap-2 border-b border-surface-100 pb-2 -mt-2 overflow-x-auto scrollbar-hide">
        {/* "Todos" tab */}
        <button
          onClick={() => setActiveTab("todos")}
          className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-sm md:text-base font-medium transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === "todos"
              ? "bg-brand-blue-primary text-white"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <LayoutGrid size={14} />
          Todos
          <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-white/10">
            {allConcerts.length}
          </span>
        </button>

        {/* "Próximos" tab */}
        <button
          onClick={() => setActiveTab("proximos")}
          className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-sm md:text-base font-medium transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === "proximos"
              ? "bg-brand-blue-primary text-white"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Clock size={14} />
          Próximos
          {upcomingConcerts.length > 0 && (
            <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full font-medium ${
              activeTab === "proximos" ? "bg-white/20 text-white" : "bg-emerald-500 text-white"
            }`}>
              {upcomingConcerts.length}
            </span>
          )}
        </button>

        {/* "Pasados" tab */}
        <button
          onClick={() => setActiveTab("pasados")}
          className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-sm md:text-base font-medium transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === "pasados"
              ? "bg-brand-blue-primary text-white"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <CheckCircle2 size={14} />
          Pasados
          {pastConcerts.length > 0 && (
            <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
              activeTab === "pasados" ? "bg-white/20 text-white" : "bg-white/10 text-gray-300"
            }`}>
              {pastConcerts.length}
            </span>
          )}
        </button>

        {/* Divider if we have a selected concert */}
        {isConcertSelected && (
          <div className="w-px h-6 self-center bg-surface-200 mx-1" />
        )}

        {/* Selected concert tab */}
        {isConcertSelected && displayConcert && (
          <button
            className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-sm md:text-base font-medium bg-brand-blue-primary text-white whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Calendar size={14} />
            {concertDate?.toLocaleDateString("es-DO", {
              day: "numeric",
              month: "short",
            })}
          </button>
        )}
      </div>

      {/* Content based on active tab */}
      {!isConcertSelected ? (
        <>
          {/* Action Bar */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Search Toggle (Mobile) */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="md:hidden w-9 h-9 rounded-full glass border border-white/10 flex items-center justify-center transition-smooth hover:border-white/20"
            >
              {showSearch ? <X size={16} /> : <Search size={16} />}
            </button>

            {/* Search Bar (Desktop) */}
            <div className="hidden md:flex items-center gap-2 glass px-4 py-2.5 rounded-full border border-white/10 flex-1 max-w-sm">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Buscar concierto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-full placeholder-gray-500 text-white"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-white">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Concert Count */}
            <span className="text-xs md:text-sm text-gray-400 ml-auto whitespace-nowrap">
              {filteredConcerts.length} conciertos
            </span>
          </div>

          {/* Mobile Search Bar */}
          {showSearch && (
            <div className="md:hidden animate-fade-in">
              <div className="flex items-center gap-2 glass px-4 py-3 rounded-xl border border-white/10">
                <Search size={16} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar concierto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="bg-transparent border-none outline-none text-sm w-full placeholder-gray-500 text-white"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-white">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 rounded-xl bg-surface-50 animate-shimmer"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="glass rounded-xl p-4 border border-red-500/20 text-red-400 animate-fade-in">
              <p className="font-medium">Error al cargar los conciertos</p>
              <p className="text-sm text-red-400/70 mt-1">Verifica que el servidor esté corriendo.</p>
            </div>
          )}

          {/* Concerts List */}
          {!isLoading && !error && filteredConcerts.length > 0 && (
            <div className="space-y-2">
              {filteredConcerts.map((concert, idx) => {
                const date = new Date(concert.date);
                const isUpcomingConcert = date >= new Date();
                const songsCount = concert.songs?.length || concert._count?.songs || 0;

                return (
                  <div
                    key={concert.id}
                    onClick={() => handleConcertClick(concert)}
                    className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-surface-100/30 border border-surface-200/30 hover:border-white/10 transition-all cursor-pointer group animate-fade-in"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    {/* Date Icon */}
                    <div
                      className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex flex-col items-center justify-center shrink-0 ${
                        isUpcomingConcert ? "bg-brand-blue-primary" : "bg-gray-600"
                      }`}
                    >
                      <span className="text-[10px] text-white/70 uppercase">
                        {date.toLocaleDateString("es-DO", { month: "short" })}
                      </span>
                      <span className="text-lg md:text-xl font-bold text-white leading-none">
                        {date.getDate()}
                      </span>
                    </div>

                    {/* Concert Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm md:text-base text-white font-medium capitalize truncate">
                          {date.toLocaleDateString("es-DO", {
                            weekday: "long",
                            year: "numeric",
                          })}
                        </p>
                        {isUpcomingConcert && (
                          <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-500 text-white uppercase font-medium shrink-0">
                            Próximo
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 md:gap-3 mt-0.5 md:mt-1 flex-wrap">
                        <p className="text-xs md:text-sm text-gray-400 truncate">
                          {concert.event?.name || "Sin evento"}
                        </p>
                        {concert.location && (
                          <p className="text-xs text-gray-500 flex items-center gap-1 truncate max-w-[120px] sm:max-w-none">
                            <MapPin size={10} className="shrink-0" />
                            <span className="truncate">{concert.location}</span>
                          </p>
                        )}
                        {songsCount > 0 && (
                          <span className="text-xs text-gray-500 shrink-0">
                            {songsCount} canciones
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Time */}
                    <div className="text-right shrink-0">
                      <p className="text-sm md:text-base text-white/80 font-medium">
                        {date.toLocaleTimeString("es-DO", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredConcerts.length === 0 && (
            <div className="text-center py-16 animate-fade-in">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-surface-50 flex items-center justify-center">
                <Calendar size={32} className="text-gray-500" />
              </div>
              <p className="text-gray-400 mb-2">
                {searchQuery
                  ? "No se encontraron conciertos"
                  : activeTab === "proximos"
                  ? "No hay conciertos próximos"
                  : activeTab === "pasados"
                  ? "No hay conciertos pasados"
                  : "Aún no hay conciertos"}
              </p>
              <p className="text-sm text-gray-500">
                Los conciertos se crean desde la sección de Eventos
              </p>
            </div>
          )}
        </>
      ) : (
        /* Concert Detail View */
        displayConcert && (
          <ConcertContent
            concert={displayConcert}
            onBack={() => setActiveTab("todos")}
          />
        )
      )}

      {/* Modals */}
      <SectionSettingsModal
        sectionKey="conciertos"
        isOpen={showSectionSettings}
        onClose={() => setShowSectionSettings(false)}
      />
    </div>
  );
}
