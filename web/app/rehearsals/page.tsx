"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useRehearsals, useRehearsal } from "@/hooks/use-rehearsals";
import { useSection } from "@/hooks/use-sections";
import { useAuth } from "@/hooks/use-auth";
import RehearsalContent from "@/components/RehearsalContent";
import CreateRehearsalModal from "@/components/CreateRehearsalModal";
import SectionSettingsModal from "@/components/SectionSettingsModal";
import LocationsModal from "@/components/LocationsModal";
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
  Plus,
  ClipboardCheck,
  Music,
  type LucideIcon,
} from "lucide-react";
import type { Rehearsal } from "@/lib/api";

const ICON_MAP: Record<string, LucideIcon> = {
  Users,
  Calendar,
  Clock,
  LayoutGrid,
  Music,
  ClipboardCheck,
};

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
  "emerald-600": "#059669",
  "teal-500": "#14B8A6",
  "teal-600": "#0D9488",
  "pink-500": "#EC4899",
  "gray-500": "#6B7280",
  "gray-600": "#4B5563",
  "gray-700": "#374151",
};

const getColor = (colorName: string | null): string => {
  if (!colorName) return "#059669";
  const baseName = colorName.split("/")[0];
  return COLOR_MAP[baseName] || "#059669";
};

type TabFilter = "todos" | "proximos" | "pasados" | string;

export default function RehearsalsPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabFilter>("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showSectionSettings, setShowSectionSettings] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLocationsModal, setShowLocationsModal] = useState(false);

  const { data: rehearsals, isLoading, error } = useRehearsals();
  const { data: ensayosSection } = useSection("ensayos");
  const { canManageEvents } = useAuth();

  // URL query param ?rehearsal=id is handled by next.config.ts redirect to /rehearsals/[id]

  const selectedRehearsalId = useMemo(() => {
    if (activeTab === "todos" || activeTab === "proximos" || activeTab === "pasados") {
      return null;
    }
    return activeTab;
  }, [activeTab]);

  const { data: fullSelectedRehearsal } = useRehearsal(selectedRehearsalId || "");

  const selectedRehearsal = useMemo(() => {
    if (!selectedRehearsalId || !rehearsals) return null;
    return rehearsals.find((r) => r.id === selectedRehearsalId) || null;
  }, [selectedRehearsalId, rehearsals]);

  const displayRehearsal = fullSelectedRehearsal || selectedRehearsal;

  const { upcomingRehearsals, pastRehearsals, allRehearsals } = useMemo(() => {
    if (!rehearsals) return { upcomingRehearsals: [], pastRehearsals: [], allRehearsals: [] };

    const now = new Date();
    const upcoming: Rehearsal[] = [];
    const past: Rehearsal[] = [];

    for (const rehearsal of rehearsals) {
      if (new Date(rehearsal.date) >= now) {
        upcoming.push(rehearsal);
      } else {
        past.push(rehearsal);
      }
    }

    upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    past.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      upcomingRehearsals: upcoming,
      pastRehearsals: past,
      allRehearsals: [...upcoming, ...past],
    };
  }, [rehearsals]);

  const filteredRehearsals = useMemo(() => {
    let list: Rehearsal[] = [];

    if (activeTab === "todos") {
      list = allRehearsals;
    } else if (activeTab === "proximos") {
      list = upcomingRehearsals;
    } else if (activeTab === "pasados") {
      list = pastRehearsals;
    } else {
      return [];
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return list.filter(
        (rehearsal) =>
          rehearsal.location?.name?.toLowerCase().includes(query) ||
          rehearsal.event?.name?.toLowerCase().includes(query) ||
          rehearsal.notes?.toLowerCase().includes(query)
      );
    }

    return list;
  }, [activeTab, allRehearsals, upcomingRehearsals, pastRehearsals, searchQuery]);

  const handleRehearsalClick = (rehearsal: Rehearsal) => {
    router.push(`/rehearsals/${rehearsal.id}`);
  };

  const isRehearsalSelected = !!displayRehearsal;

  const sectionIcon = ensayosSection?.iconName ? ICON_MAP[ensayosSection.iconName] : Music;
  const SectionIcon = sectionIcon || Music;
  const sectionGradientFrom = getColor(ensayosSection?.iconGradientFrom || null);
  const sectionGradientTo = getColor(ensayosSection?.iconGradientTo || null);

  const rehearsalDate = displayRehearsal ? new Date(displayRehearsal.date) : null;
  const isUpcoming = rehearsalDate ? rehearsalDate >= new Date() : false;

  const rehearsalEventBanner = displayRehearsal?.event?.bannerUrl;
  const rehearsalEventGradientFrom = displayRehearsal?.event?.iconGradientFrom;
  const rehearsalEventGradientTo = displayRehearsal?.event?.iconGradientTo;

  const gradientFrom = isRehearsalSelected
    ? getColor(rehearsalEventGradientFrom || null) || (isUpcoming ? "#059669" : "#4B5563")
    : sectionGradientFrom;
  const gradientTo = isRehearsalSelected
    ? getColor(rehearsalEventGradientTo || null) || (isUpcoming ? "#14B8A6" : "#374151")
    : sectionGradientTo;
  const bannerUrl = isRehearsalSelected ? rehearsalEventBanner : ensayosSection?.bannerUrl;

  const headerTitle = isRehearsalSelected
    ? rehearsalDate?.toLocaleDateString("es-DO", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : (ensayosSection?.title || "Ensayos");

  const headerSubtitle = isRehearsalSelected
    ? `${displayRehearsal?.event?.name || "Ensayo general"} • ${displayRehearsal?.location?.name || "Sin ubicación"}`
    : (ensayosSection?.subtitle || `Programa de ensayos y asistencia • ${rehearsals?.length || 0} ensayos`);

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
              <img src={bannerUrl} alt={headerTitle || ""} className="w-full h-full object-cover" />
            ) : isRehearsalSelected ? (
              <ClipboardCheck size={48} className="text-white/90 md:w-16 md:h-16" />
            ) : (
              <SectionIcon size={48} className="text-white/90 md:w-16 md:h-16" />
            )}
          </div>

          <div className="flex-1 min-w-0 pb-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs md:text-sm font-medium text-white/60 uppercase tracking-wider">
                {isRehearsalSelected ? "Ensayo" : "Ensayos"}
              </p>
              {isRehearsalSelected && isUpcoming && (
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
            {isRehearsalSelected && displayRehearsal?.location && (
              <p className="text-sm text-gray-300 mt-1 flex items-center gap-1.5 md:hidden">
                <MapPin size={12} />
                <span className="truncate">{displayRehearsal.location.name}</span>
              </p>
            )}
          </div>

          {canManageEvents && !isRehearsalSelected && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowLocationsModal(true)}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all"
                title="Gestionar ubicaciones"
              >
                <MapPin size={16} className="md:w-[18px] md:h-[18px]" />
              </button>
              <button
                onClick={() => setShowSectionSettings(true)}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all"
                title="Configurar sección"
              >
                <Settings size={16} className="md:w-[18px] md:h-[18px]" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-1.5 md:gap-2 border-b border-surface-100 pb-2 -mt-2 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab("todos")}
          className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-sm md:text-base font-medium transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === "todos"
              ? "bg-emerald-600 text-white"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <LayoutGrid size={14} />
          Todos
          <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-white/10">
            {allRehearsals.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("proximos")}
          className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-sm md:text-base font-medium transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === "proximos"
              ? "bg-emerald-600 text-white"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Clock size={14} />
          Próximos
          {upcomingRehearsals.length > 0 && (
            <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full font-medium ${
              activeTab === "proximos" ? "bg-white/20 text-white" : "bg-emerald-500 text-white"
            }`}>
              {upcomingRehearsals.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("pasados")}
          className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-sm md:text-base font-medium transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === "pasados"
              ? "bg-emerald-600 text-white"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <CheckCircle2 size={14} />
          Pasados
          {pastRehearsals.length > 0 && (
            <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
              activeTab === "pasados" ? "bg-white/20 text-white" : "bg-white/10 text-gray-300"
            }`}>
              {pastRehearsals.length}
            </span>
          )}
        </button>

        {isRehearsalSelected && (
          <div className="w-px h-6 self-center bg-surface-200 mx-1" />
        )}

        {isRehearsalSelected && displayRehearsal && (
          <button className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-sm md:text-base font-medium bg-emerald-600 text-white whitespace-nowrap shrink-0 flex items-center gap-1.5">
            <ClipboardCheck size={14} />
            {rehearsalDate?.toLocaleDateString("es-DO", {
              day: "numeric",
              month: "short",
            })}
          </button>
        )}
      </div>

      {/* Content */}
      {!isRehearsalSelected ? (
        <>
          {/* Action Bar */}
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="md:hidden w-9 h-9 rounded-full glass border border-white/10 flex items-center justify-center transition-smooth hover:border-white/20"
            >
              {showSearch ? <X size={16} /> : <Search size={16} />}
            </button>

            <div className="hidden md:flex items-center gap-2 glass px-4 py-2.5 rounded-full border border-white/10 flex-1 max-w-sm">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Buscar ensayo..."
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

            <span className="text-xs md:text-sm text-gray-400 ml-auto whitespace-nowrap">
              {filteredRehearsals.length} ensayos
            </span>

            {canManageEvents && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-all shrink-0"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Nuevo Ensayo</span>
              </button>
            )}
          </div>

          {/* Mobile Search Bar */}
          {showSearch && (
            <div className="md:hidden animate-fade-in">
              <div className="flex items-center gap-2 glass px-4 py-3 rounded-xl border border-white/10">
                <Search size={16} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar ensayo..."
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

          {/* Loading */}
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

          {/* Error */}
          {error && (
            <div className="glass rounded-xl p-4 border border-red-500/20 text-red-400 animate-fade-in">
              <p className="font-medium">Error al cargar los ensayos</p>
              <p className="text-sm text-red-400/70 mt-1">Verifica que el servidor esté corriendo.</p>
            </div>
          )}

          {/* Rehearsals List */}
          {!isLoading && !error && filteredRehearsals.length > 0 && (
            <div className="space-y-2">
              {filteredRehearsals.map((rehearsal, idx) => {
                const date = new Date(rehearsal.date);
                const isUpcomingRehearsal = date >= new Date();
                const songsCount = rehearsal.songs?.length || rehearsal._count?.songs || 0;
                const attendanceCount = rehearsal.attendances?.length || rehearsal._count?.attendances || 0;

                return (
                  <div
                    key={rehearsal.id}
                    onClick={() => handleRehearsalClick(rehearsal)}
                    className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-surface-100/30 border border-surface-200/30 hover:border-white/10 transition-all cursor-pointer group animate-fade-in"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    {/* Date Icon */}
                    <div
                      className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex flex-col items-center justify-center shrink-0 ${
                        isUpcomingRehearsal ? "bg-emerald-600" : "bg-gray-600"
                      }`}
                    >
                      <span className="text-[10px] text-white/70 uppercase">
                        {date.toLocaleDateString("es-DO", { month: "short" })}
                      </span>
                      <span className="text-lg md:text-xl font-bold text-white leading-none">
                        {date.getDate()}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm md:text-base text-white font-medium capitalize truncate">
                          {date.toLocaleDateString("es-DO", {
                            weekday: "long",
                            year: "numeric",
                          })}
                        </p>
                        {isUpcomingRehearsal && (
                          <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-500 text-white uppercase font-medium shrink-0">
                            Próximo
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 md:gap-3 mt-0.5 md:mt-1 flex-wrap">
                        <p className="text-xs md:text-sm text-gray-400 truncate">
                          {rehearsal.event?.name || "Ensayo general"}
                        </p>
                        {rehearsal.location && (
                          <p className="text-xs text-gray-500 flex items-center gap-1 truncate max-w-[120px] sm:max-w-none">
                            <MapPin size={10} className="shrink-0" />
                            <span className="truncate">{rehearsal.location.name}</span>
                          </p>
                        )}
                        {songsCount > 0 && (
                          <span className="text-xs text-gray-500 shrink-0">
                            {songsCount} canciones
                          </span>
                        )}
                        {attendanceCount > 0 && (
                          <span className="text-xs text-gray-500 shrink-0 flex items-center gap-1">
                            <Users size={10} />
                            {attendanceCount}
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
          {!isLoading && !error && filteredRehearsals.length === 0 && (
            <div className="text-center py-16 animate-fade-in">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-surface-50 flex items-center justify-center">
                <ClipboardCheck size={32} className="text-gray-500" />
              </div>
              <p className="text-gray-400 mb-2">
                {searchQuery
                  ? "No se encontraron ensayos"
                  : activeTab === "proximos"
                  ? "No hay ensayos próximos"
                  : activeTab === "pasados"
                  ? "No hay ensayos pasados"
                  : "Aún no hay ensayos"}
              </p>
              {canManageEvents && !searchQuery && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-2 text-emerald-400 text-sm hover:underline"
                >
                  Crear el primer ensayo
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        displayRehearsal && (
          <RehearsalContent
            rehearsal={displayRehearsal}
            onBack={() => setActiveTab("todos")}
          />
        )
      )}

      {/* Modals */}
      <SectionSettingsModal
        sectionKey="ensayos"
        isOpen={showSectionSettings}
        onClose={() => setShowSectionSettings(false)}
      />

      <CreateRehearsalModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      <LocationsModal
        isOpen={showLocationsModal}
        onClose={() => setShowLocationsModal(false)}
      />
    </div>
  );
}
