"use client";

import { useState } from "react";
import Link from "next/link";
import { useSongs } from "@/hooks/use-songs";
import { useAuth } from "@/hooks/use-auth";
import SongDetailModal from "@/components/SongDetailModal";
import { Music, ChevronRight, TrendingUp, Plus, Clock } from "lucide-react";
import type { Song } from "@/lib/api";

export default function Home() {
  const { data: songs, isLoading } = useSongs();
  const { user, canSuggestSongs } = useAuth();
  const firstName = user?.name.split(" ")[0] || "Usuario";
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  const stats = {
    ready: songs?.filter((s) => s.status === "READY").length || 0,
    rehearsing: songs?.filter((s) => s.status === "REHEARSING").length || 0,
    pending: songs?.filter((s) => s.status === "PENDING").length || 0,
    total: songs?.length || 0,
  };

  // Get recent songs (last 5 added)
  const recentSongs = songs?.slice(0, 5) || [];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <header className="pt-2">
        <p className="text-gray-400 text-sm mb-1">Bienvenido de vuelta</p>
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          Hola, {firstName}
        </h1>
      </header>

      {/* Quick Stats - Enhanced with depth */}
      <section className="grid grid-cols-3 gap-3">
        <div className="relative rounded-2xl p-4 bg-surface-50 border border-surface-100 shadow-lg shadow-black/20 transition-all hover:shadow-xl hover:shadow-black/30 hover:border-green-500/30 group overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-lg shadow-green-400/50 animate-pulse" />
              <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">Montadas</span>
            </div>
            <p className="text-3xl md:text-4xl font-black text-white">{stats.ready}</p>
          </div>
        </div>

        <div className="relative rounded-2xl p-4 bg-surface-50 border border-surface-100 shadow-lg shadow-black/20 transition-all hover:shadow-xl hover:shadow-black/30 hover:border-yellow-500/30 group overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/50" />
              <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">Ensayando</span>
            </div>
            <p className="text-3xl md:text-4xl font-black text-white">{stats.rehearsing}</p>
          </div>
        </div>

        <div className="relative rounded-2xl p-4 bg-surface-50 border border-surface-100 shadow-lg shadow-black/20 transition-all hover:shadow-xl hover:shadow-black/30 hover:border-red-500/30 group overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-lg shadow-red-400/50" />
              <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">Pendientes</span>
            </div>
            <p className="text-3xl md:text-4xl font-black text-white">{stats.pending}</p>
          </div>
        </div>
      </section>

      {/* Progress Section - Enhanced */}
      <section className="rounded-2xl p-5 bg-surface-50 border border-surface-100 shadow-lg shadow-black/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-blue-primary/30 flex items-center justify-center shadow-inner">
            <TrendingUp size={20} className="text-brand-yellow" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Progreso del Repertorio</h3>
            <p className="text-xs text-gray-400">{stats.total} canciones en total</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-3 bg-surface-100 rounded-full overflow-hidden flex shadow-inner">
          {stats.total > 0 && (
            <>
              <div
                className="h-full bg-green-500 transition-all duration-500 shadow-sm"
                style={{ width: `${(stats.ready / stats.total) * 100}%` }}
              />
              <div
                className="h-full bg-yellow-500 transition-all duration-500 shadow-sm"
                style={{ width: `${(stats.rehearsing / stats.total) * 100}%` }}
              />
              <div
                className="h-full bg-red-500 transition-all duration-500 shadow-sm"
                style={{ width: `${(stats.pending / stats.total) * 100}%` }}
              />
            </>
          )}
          {stats.total === 0 && !isLoading && (
            <div className="h-full w-full bg-surface-200" />
          )}
        </div>

        <div className="flex justify-between mt-3 text-xs">
          <span className="text-green-400 flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-green-400 shadow shadow-green-400/50" />
            {stats.ready} listas
          </span>
          <span className="text-yellow-400 flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-yellow-400 shadow shadow-yellow-400/50" />
            {stats.rehearsing} ensayando
          </span>
          <span className="text-red-400 flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-red-400 shadow shadow-red-400/50" />
            {stats.pending} pendientes
          </span>
        </div>
      </section>

      {/* Recent Songs - Opens modal directly */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock size={18} className="text-brand-yellow" />
            Sugerencias Recientes
          </h2>
          <Link
            href="/songs"
            className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-smooth"
          >
            Ver todas <ChevronRight size={16} />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-surface-50 animate-pulse" />
            ))}
          </div>
        ) : recentSongs.length > 0 ? (
          <div className="space-y-2">
            {recentSongs.map((song) => (
              <button
                key={song.id}
                onClick={() => setSelectedSong(song)}
                className="flex items-center gap-3 p-3 w-full text-left bg-surface-50 rounded-xl border border-surface-100 shadow-md shadow-black/10 hover:border-white/20 hover:shadow-lg transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-surface-100 flex items-center justify-center text-text-tertiary shrink-0 shadow-inner">
                  {song.coverUrl ? (
                    <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Music size={16} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate group-hover:text-brand-yellow transition-smooth">
                    {song.title}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                </div>
                <div
                  className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-lg ${
                    song.status === "READY"
                      ? "bg-green-400 shadow-green-400/50"
                      : song.status === "REHEARSING"
                      ? "bg-yellow-400 shadow-yellow-400/50"
                      : "bg-red-400 shadow-red-400/50"
                  }`}
                />
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-surface-50 rounded-xl border border-surface-100 shadow-md">
            <Music size={32} className="mx-auto mb-3 text-gray-500" />
            <p className="text-gray-400 text-sm mb-3">No hay canciones aún</p>
            {canSuggestSongs && (
              <Link
                href="/songs"
                className="inline-flex items-center gap-2 text-brand-yellow text-sm font-medium hover:underline"
              >
                <Plus size={16} />
                Sugerir la primera
              </Link>
            )}
          </div>
        )}
      </section>

      {/* Quick Access to Repertoire */}
      <Link
        href="/songs"
        className="
          block rounded-2xl p-5 bg-surface-50 border border-surface-100
          shadow-lg shadow-black/20
          transition-all hover:border-brand-yellow/30 hover:shadow-xl hover:shadow-brand-yellow/10 hover:scale-[1.01]
          active:scale-[0.99] group
        "
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-linear-to-br from-brand-blue-primary to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-blue-primary/30">
              <span className="text-2xl">🎵</span>
            </div>
            <div>
              <h3 className="font-bold text-white group-hover:text-brand-yellow transition-smooth">
                Ver Repertorio Completo
              </h3>
              <p className="text-sm text-gray-400">{stats.total} canciones disponibles</p>
            </div>
          </div>
          <ChevronRight
            size={24}
            className="text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-smooth"
          />
        </div>
      </Link>

      {/* Coming Soon Notice */}
      <div className="text-center py-4 border-t border-surface-100">
        <p className="text-xs text-gray-500">
          Próximamente: Gestión de Eventos y Conciertos
        </p>
      </div>

      {/* Song Detail Modal */}
      <SongDetailModal song={selectedSong} onClose={() => setSelectedSong(null)} />
    </div>
  );
}
