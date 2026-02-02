"use client";

import { useState, useMemo } from "react";
import { useSongs } from "@/hooks/use-songs";
import { useSections } from "@/hooks/use-sections";
import { useAuth } from "@/hooks/use-auth";
import SongRow from "@/components/SongRow";
import SongDetailModal from "@/components/SongDetailModal";
import SuggestionModal from "@/components/SuggestionModal";
import AdminSongModal from "@/components/AdminSongModal";
import SectionSettingsModal from "@/components/SectionSettingsModal";
import {
  Plus,
  Search,
  Music,
  X,
  Sparkles,
  Archive,
  Library,
  Clock,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { Song, RepertoireSection } from "@/lib/api";

type TabType = "repertorio" | "sugerencias" | "archivadas";

// Icon mapping for dynamic icon names
const ICON_MAP: Record<string, LucideIcon> = {
  Library,
  Clock,
  Archive,
  Music,
  Sparkles,
};

// Fallback config when API data is loading
const FALLBACK_CONFIG: Record<TabType, Partial<RepertoireSection>> = {
  repertorio: {
    title: "Repertorio Activo",
    subtitle: "Canciones listas y en ensayo",
    iconName: "Library",
    gradientFrom: "brand-blue-primary/40",
    gradientVia: "indigo-600/20",
    gradientTo: "transparent",
    iconGradientFrom: "brand-blue-primary",
    iconGradientTo: "indigo-600",
  },
  sugerencias: {
    title: "Sugerencias Pendientes",
    subtitle: "Canciones esperando aprobación",
    iconName: "Clock",
    gradientFrom: "amber-500/30",
    gradientVia: "orange-600/10",
    gradientTo: "transparent",
    iconGradientFrom: "amber-500",
    iconGradientTo: "orange-600",
  },
  archivadas: {
    title: "Archivo",
    subtitle: "Canciones que ya no tocamos",
    iconName: "Archive",
    gradientFrom: "gray-600/30",
    gradientVia: "gray-700/10",
    gradientTo: "transparent",
    iconGradientFrom: "gray-500",
    iconGradientTo: "gray-700",
  },
};

export default function SongsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("repertorio");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showSectionSettings, setShowSectionSettings] = useState(false);

  const { data: songs, isLoading, error } = useSongs();
  const { data: sections } = useSections();
  const { canSuggestSongs, canManageSongs } = useAuth();

  // Get active section config from API or use fallback
  const sectionConfig = useMemo(() => {
    const apiSection = sections?.find((s) => s.key === activeTab);
    const fallback = FALLBACK_CONFIG[activeTab];

    return {
      title: apiSection?.title || fallback.title || "",
      subtitle: apiSection?.subtitle || fallback.subtitle || "",
      iconName: apiSection?.iconName || fallback.iconName || "Music",
      bannerUrl: apiSection?.bannerUrl || null,
      gradientFrom: apiSection?.gradientFrom || fallback.gradientFrom || "gray-600/30",
      gradientVia: apiSection?.gradientVia || fallback.gradientVia || "gray-700/10",
      gradientTo: apiSection?.gradientTo || fallback.gradientTo || "transparent",
      iconGradientFrom: apiSection?.iconGradientFrom || fallback.iconGradientFrom || "gray-500",
      iconGradientTo: apiSection?.iconGradientTo || fallback.iconGradientTo || "gray-700",
    };
  }, [sections, activeTab]);

  const TabIcon = ICON_MAP[sectionConfig.iconName] || Music;

  // Filter songs based on active tab and search query
  const filteredSongs = useMemo(() => {
    if (!songs) return [];

    let filtered = songs;

    // Tab filtering
    if (activeTab === "repertorio") {
      filtered = filtered.filter((s) => s.status === "REHEARSING" || s.status === "READY");
    } else if (activeTab === "sugerencias") {
      filtered = filtered.filter((s) => s.status === "PENDING");
    } else if (activeTab === "archivadas") {
      filtered = filtered.filter((s) => s.status === "ARCHIVED");
    }

    // Search filtering
    if (searchQuery) {
      filtered = filtered.filter(
        (song) =>
          song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [songs, activeTab, searchQuery]);

  // Counts for tab badges
  const repertoireCount = songs?.filter((s) => s.status === "REHEARSING" || s.status === "READY").length || 0;
  const suggestionsCount = songs?.filter((s) => s.status === "PENDING").length || 0;
  const archivedCount = songs?.filter((s) => s.status === "ARCHIVED").length || 0;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Hero Header with Blurred Banner Support */}
      <header className="relative -mx-4 md:-mx-8 -mt-4 md:-mt-8 px-4 md:px-8 pt-4 md:pt-8 pb-6 overflow-hidden">
        {/* Background: Either blurred banner or gradient */}
        {sectionConfig.bannerUrl ? (
          <>
            {/* Blurred banner image */}
            <div
              className="absolute inset-0 bg-cover bg-center scale-110"
              style={{ backgroundImage: `url(${sectionConfig.bannerUrl})` }}
            />
            {/* Blur overlay */}
            <div className="absolute inset-0 backdrop-blur-2xl" />
            {/* Dark gradient overlay for readability */}
            <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/60 to-surface-0" />
          </>
        ) : (
          /* Default gradient background */
          <div
            className={`absolute inset-0 bg-linear-to-b from-${sectionConfig.gradientFrom} via-${sectionConfig.gradientVia} to-${sectionConfig.gradientTo}`}
          />
        )}

        {/* Content */}
        <div className="relative flex items-end gap-4 md:gap-6">
          {/* Tab Icon / Album Art */}
          <div
            className={`w-20 h-20 md:w-36 md:h-36 shrink-0 rounded-xl md:rounded-2xl shadow-2xl flex items-center justify-center border border-white/10 overflow-hidden ${
              sectionConfig.bannerUrl
                ? "bg-black/30 backdrop-blur-sm"
                : `bg-linear-to-br from-${sectionConfig.iconGradientFrom} to-${sectionConfig.iconGradientTo}`
            }`}
          >
            {sectionConfig.bannerUrl ? (
              <img
                src={sectionConfig.bannerUrl}
                alt={sectionConfig.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <TabIcon size={48} className="text-white/90 md:w-16 md:h-16" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pb-1">
            <p className="text-xs md:text-sm font-medium text-white/60 uppercase tracking-wider mb-1">
              PUCMM Band
            </p>
            <h1 className="text-xl md:text-4xl font-black text-white truncate">
              {sectionConfig.title}
            </h1>
            <p className="text-sm text-gray-300 mt-1 hidden md:block">
              {sectionConfig.subtitle} • {filteredSongs.length} canciones
            </p>
          </div>

          {/* Admin Settings Button */}
          {canManageSongs && (
            <button
              onClick={() => setShowSectionSettings(true)}
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-all"
              title="Configurar sección"
            >
              <Settings size={18} className="text-white/80" />
            </button>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-surface-100 pb-2 -mt-2">
        <button
          onClick={() => setActiveTab("repertorio")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === "repertorio"
              ? "bg-brand-blue-primary text-white"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Repertorio
          <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-white/10">{repertoireCount}</span>
        </button>

        {/* Only show Sugerencias tab to admins */}
        {canManageSongs && (
          <button
            onClick={() => setActiveTab("sugerencias")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === "sugerencias"
                ? "bg-brand-blue-primary text-white"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Sugerencias
            {suggestionsCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-red-500/80 text-white animate-pulse">
                {suggestionsCount}
              </span>
            )}
          </button>
        )}

        {/* Archivadas tab - visible to all but only admins can archive */}
        {canManageSongs && (
          <button
            onClick={() => setActiveTab("archivadas")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === "archivadas"
                ? "bg-brand-blue-primary text-white"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Archivadas
            {archivedCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-white/10">
                {archivedCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-3">
        {/* Admin: Show "Nueva Cancion" button */}
        {canManageSongs && (
          <button
            onClick={() => setShowAdminModal(true)}
            className="flex items-center gap-2 bg-brand-yellow text-brand-blue-primary px-4 py-2.5 rounded-full text-sm font-bold shadow-lg transition-bounce hover:scale-105 active:scale-95"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span className="hidden sm:inline">Nueva Cancion</span>
          </button>
        )}

        {/* Non-admin members: Show "Sugerir" button */}
        {canSuggestSongs && !canManageSongs && (
          <button
            onClick={() => setShowSuggestionModal(true)}
            className="flex items-center gap-2 bg-surface-100 text-white px-4 py-2.5 rounded-full text-sm font-medium border border-surface-200 transition-smooth hover:border-white/20"
          >
            <Sparkles size={18} />
            <span className="hidden sm:inline">Sugerir</span>
          </button>
        )}

        {/* Search Toggle (Mobile) */}
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="md:hidden w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center transition-smooth hover:border-white/20"
        >
          {showSearch ? <X size={18} /> : <Search size={18} />}
        </button>

        {/* Search Bar (Desktop) */}
        <div className="hidden md:flex items-center gap-2 glass px-4 py-2.5 rounded-full border border-white/10 flex-1 max-w-sm">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Buscar canción o artista..."
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

        {/* Song Count */}
        <span className="text-sm text-gray-400 ml-auto">{filteredSongs.length} canciones</span>
      </div>

      {/* Mobile Search Bar */}
      {showSearch && (
        <div className="md:hidden animate-fade-in">
          <div className="flex items-center gap-2 glass px-4 py-3 rounded-xl border border-white/10">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Buscar canción o artista..."
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
              className="h-16 rounded-xl bg-surface-50 animate-shimmer"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="glass rounded-xl p-4 border border-red-500/20 text-red-400 animate-fade-in">
          <p className="font-medium">Error al cargar las canciones</p>
          <p className="text-sm text-red-400/70 mt-1">Verifica que el servidor esté corriendo.</p>
        </div>
      )}

      {/* Songs List */}
      {!isLoading && !error && filteredSongs.length > 0 && (
        <div className="space-y-1">
          {filteredSongs.map((song, idx) => (
            <div key={song.id} className="animate-fade-in" style={{ animationDelay: `${idx * 30}ms` }}>
              <SongRow song={song} index={idx} onClick={setSelectedSong} />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredSongs.length === 0 && (
        <div className="text-center py-16 animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-surface-50 flex items-center justify-center">
            {activeTab === "sugerencias" ? (
              <Sparkles size={32} className="text-gray-500" />
            ) : activeTab === "archivadas" ? (
              <Archive size={32} className="text-gray-500" />
            ) : (
              <Music size={32} className="text-gray-500" />
            )}
          </div>
          <p className="text-gray-400 mb-4">
            {searchQuery
              ? "No se encontraron canciones"
              : activeTab === "sugerencias"
              ? "No hay sugerencias pendientes"
              : activeTab === "archivadas"
              ? "No hay canciones archivadas"
              : "Aún no hay canciones en el repertorio"}
          </p>
          {!searchQuery && activeTab === "repertorio" && canManageSongs && (
            <button
              onClick={() => setShowAdminModal(true)}
              className="text-brand-yellow font-medium hover:underline"
            >
              Agregar la primera cancion
            </button>
          )}
          {!searchQuery && activeTab === "repertorio" && canSuggestSongs && !canManageSongs && (
            <button
              onClick={() => setShowSuggestionModal(true)}
              className="text-brand-yellow font-medium hover:underline"
            >
              Sugerir la primera cancion
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      <SongDetailModal song={selectedSong} onClose={() => setSelectedSong(null)} />
      <SuggestionModal isOpen={showSuggestionModal} onClose={() => setShowSuggestionModal(false)} />
      <AdminSongModal isOpen={showAdminModal} onClose={() => setShowAdminModal(false)} />

      {/* Section Settings Modal */}
      <SectionSettingsModal
        sectionKey={activeTab}
        isOpen={showSectionSettings}
        onClose={() => setShowSectionSettings(false)}
      />
    </div>
  );
}
