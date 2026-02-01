"use client";

import { useState, useMemo } from "react";
import { useSongs } from "@/hooks/use-songs";
import { useAuth } from "@/hooks/use-auth";
import SongRow from "@/components/SongRow";
import SongDetailModal from "@/components/SongDetailModal";
import SuggestionModal from "@/components/SuggestionModal";
import AdminSongModal from "@/components/AdminSongModal";
import { Plus, Search, Music, X, Sparkles, Archive } from "lucide-react";
import type { Song } from "@/lib/api";

type TabType = "repertorio" | "sugerencias" | "archivadas";

export default function SongsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("repertorio");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { data: songs, isLoading, error } = useSongs();
  const { canSuggestSongs, canManageSongs } = useAuth();

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
      {/* Hero Header */}
      <header className="relative -mx-4 md:-mx-8 -mt-4 md:-mt-8 px-4 md:px-8 pt-4 md:pt-8 pb-6 bg-linear-to-b from-brand-blue-primary/30 to-transparent">
        <div className="flex items-end gap-4 md:gap-6">
          {/* Album Art */}
          <div className="w-20 h-20 md:w-40 md:h-40 shrink-0 rounded-xl md:rounded-2xl bg-linear-to-br from-brand-blue-primary to-indigo-700 shadow-2xl flex items-center justify-center border border-white/10">
            <span className="text-4xl md:text-6xl">🎵</span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pb-1">
            <p className="text-xs md:text-sm font-medium text-white/60 uppercase tracking-wider mb-1">
              {activeTab === "repertorio" ? "Repertorio" : activeTab === "sugerencias" ? "Sugerencias" : "Archivo"}
            </p>
            <h1 className="text-xl md:text-4xl font-black text-white truncate">
              {activeTab === "repertorio" ? "Tu Biblioteca" : activeTab === "sugerencias" ? "Canciones Sugeridas" : "Canciones Archivadas"}
            </h1>
            <p className="text-sm text-gray-300 mt-1 hidden md:block">
              {filteredSongs.length} canciones • PUCMM Band
            </p>
          </div>
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
    </div>
  );
}
