"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSongs, useMyVotes } from "@/hooks/use-songs";
import { useEvents } from "@/hooks/use-events";
import { useConcerts } from "@/hooks/use-concerts";
import { useUsers } from "@/hooks/use-users";
import { useAuth } from "@/hooks/use-auth";
import SongDetailModal from "@/components/SongDetailModal";
import { CachedImage } from "@/components/ui/CachedImage";
import {
  Music,
  ChevronRight,
  TrendingUp,
  Plus,
  Clock,
  Calendar,
  Ticket,
  Users,
  Sparkles,
  ThumbsUp,
  Mic2,
  Star,
  Eye,
  Shield,
  CheckCircle2,
  AlertCircle,
  Play,
  BookOpen,
} from "lucide-react";
import type { Song } from "@/lib/api";

export default function Home() {
  const { data: songs, isLoading: loadingSongs } = useSongs();
  const { data: events } = useEvents();
  const { data: concerts } = useConcerts();
  const { data: users } = useUsers();
  const { data: myVotes } = useMyVotes();
  const { user, canSuggestSongs, isAdmin } = useAuth();
  const firstName = user?.name.split(" ")[0] || "Usuario";
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  // Calculate stats
  const stats = useMemo(() => {
    const ready = songs?.filter((s) => s.status === "READY").length || 0;
    const rehearsing = songs?.filter((s) => s.status === "REHEARSING").length || 0;
    const pending = songs?.filter((s) => s.status === "PENDING").length || 0;
    const total = songs?.length || 0;
    return { ready, rehearsing, pending, total };
  }, [songs]);

  // My suggestions (for members)
  const mySuggestions = useMemo(() => {
    if (!songs || !user) return [];
    return songs.filter((s) => s.suggestedById === user.id).slice(0, 3);
  }, [songs, user]);

  // Count of songs I voted for
  const myVotesCount = myVotes?.length || 0;

  // Songs where I'm lead vocal
  const myLeadVocalSongs = useMemo(() => {
    if (!songs || !user) return [];
    return songs.filter((s) => s.leadVocals?.some((v) => v.id === user.id)).slice(0, 3);
  }, [songs, user]);

  // Upcoming concerts (sorted by date, future only)
  const upcomingConcerts = useMemo(() => {
    if (!concerts) return [];
    const now = new Date();
    return concerts
      .filter((c) => new Date(c.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  }, [concerts]);

  // Recent pending songs (for admin review)
  const pendingSongs = useMemo(() => {
    if (!songs) return [];
    return songs.filter((s) => s.status === "PENDING").slice(0, 5);
  }, [songs]);

  // Recent songs
  const recentSongs = songs?.slice(0, 5) || [];

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos dias";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-8">
      {/* Header - Role-aware greeting */}
      <header className="pt-2">
        <p className="text-gray-400 text-sm mb-1">{getGreeting()}</p>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
          Hola, {firstName}
          {user?.isSuperAdmin && <Shield size={20} className="text-purple-400" />}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isAdmin
            ? "Panel de administracion"
            : user?.role === "STUDENT_GUEST"
            ? "Vista de estudiante"
            : "Centro de miembro"}
        </p>
      </header>

      {/* ============================================= */}
      {/* ADMIN VIEW */}
      {/* ============================================= */}
      {isAdmin && (
        <>
          {/* Admin Quick Stats */}
          <section data-tour="admin-stats" className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-2xl p-4 bg-surface-50 border border-surface-100 shadow-lg shadow-black/20">
              <div className="flex items-center gap-2 mb-2">
                <Music size={16} className="text-brand-yellow" />
                <span className="text-xs text-gray-400 uppercase tracking-wide">Repertorio</span>
              </div>
              <p className="text-2xl font-black text-white">{stats.total}</p>
              <p className="text-xs text-gray-500">{stats.ready} listas</p>
            </div>

            <div className="rounded-2xl p-4 bg-surface-50 border border-surface-100 shadow-lg shadow-black/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-amber-400" />
                <span className="text-xs text-gray-400 uppercase tracking-wide">Pendientes</span>
              </div>
              <p className="text-2xl font-black text-amber-400">{stats.pending}</p>
              <p className="text-xs text-gray-500">por revisar</p>
            </div>

            <div className="rounded-2xl p-4 bg-surface-50 border border-surface-100 shadow-lg shadow-black/20">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={16} className="text-blue-400" />
                <span className="text-xs text-gray-400 uppercase tracking-wide">Eventos</span>
              </div>
              <p className="text-2xl font-black text-white">{events?.length || 0}</p>
              <p className="text-xs text-gray-500">activos</p>
            </div>

            <div className="rounded-2xl p-4 bg-surface-50 border border-surface-100 shadow-lg shadow-black/20">
              <div className="flex items-center gap-2 mb-2">
                <Users size={16} className="text-purple-400" />
                <span className="text-xs text-gray-400 uppercase tracking-wide">Miembros</span>
              </div>
              <p className="text-2xl font-black text-white">{users?.length || 0}</p>
              <p className="text-xs text-gray-500">registrados</p>
            </div>
          </section>

          {/* Admin Quick Actions */}
          <section data-tour="admin-actions" className="grid grid-cols-3 gap-3">
            <Link
              href="/songs"
              className="rounded-xl p-4 bg-linear-to-br from-brand-blue-primary/20 to-brand-blue-primary/5 border border-brand-blue-primary/30 hover:border-brand-blue-primary/50 transition-all group"
            >
              <Plus size={20} className="text-brand-yellow mb-2" />
              <p className="text-sm font-medium text-white group-hover:text-brand-yellow transition-colors">
                Agregar Cancion
              </p>
            </Link>

            <Link
              href="/events"
              className="rounded-xl p-4 bg-linear-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30 hover:border-blue-500/50 transition-all group"
            >
              <Calendar size={20} className="text-blue-400 mb-2" />
              <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                Ver Eventos
              </p>
            </Link>

            <Link
              href="/concerts"
              className="rounded-xl p-4 bg-linear-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30 hover:border-purple-500/50 transition-all group"
            >
              <Ticket size={20} className="text-purple-400 mb-2" />
              <p className="text-sm font-medium text-white group-hover:text-purple-400 transition-colors">
                Ver Conciertos
              </p>
            </Link>
          </section>

          {/* Pending Suggestions for Review */}
          {pendingSongs.length > 0 && (
            <section data-tour="pending-suggestions" className="rounded-2xl p-5 bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <AlertCircle size={18} className="text-amber-400" />
                  Sugerencias Pendientes
                </h2>
                <Link href="/songs" className="text-xs text-amber-400 hover:underline">
                  Ver todas →
                </Link>
              </div>
              <div className="space-y-2">
                {pendingSongs.map((song) => (
                  <button
                    key={song.id}
                    onClick={() => setSelectedSong(song)}
                    className="flex items-center gap-3 p-3 w-full text-left bg-surface-50/50 rounded-xl hover:bg-surface-50 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-surface-100 flex items-center justify-center shrink-0 overflow-hidden">
                      {song.coverUrl ? (
                        <CachedImage src={song.coverUrl} alt={song.title} className="w-full h-full" />
                      ) : (
                        <Music size={16} className="text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate group-hover:text-brand-yellow">
                        {song.title}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {song.artist}
                        {song.suggestedBy && (
                          <span className="text-gray-500"> · por {song.suggestedBy.name}</span>
                        )}
                      </p>
                    </div>
                    {(song._count?.votes ?? 0) > 0 && (
                      <span className="text-xs text-amber-400 flex items-center gap-1 shrink-0">
                        <ThumbsUp size={12} />
                        {song._count?.votes}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* ============================================= */}
      {/* MEMBER VIEW (non-admin, not student_guest) */}
      {/* ============================================= */}
      {!isAdmin && user?.role !== "STUDENT_GUEST" && (
        <>
          {/* Member Stats */}
          <section data-tour="member-stats" className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl p-4 bg-surface-50 border border-surface-100 shadow-lg shadow-black/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-brand-yellow" />
                <span className="text-[10px] text-gray-400 uppercase tracking-wide">Sugeridas</span>
              </div>
              <p className="text-2xl font-black text-white">{mySuggestions.length}</p>
            </div>

            <div className="rounded-2xl p-4 bg-surface-50 border border-surface-100 shadow-lg shadow-black/20">
              <div className="flex items-center gap-2 mb-2">
                <ThumbsUp size={16} className="text-green-400" />
                <span className="text-[10px] text-gray-400 uppercase tracking-wide">Votadas</span>
              </div>
              <p className="text-2xl font-black text-white">{myVotesCount}</p>
            </div>

            <div className="rounded-2xl p-4 bg-surface-50 border border-surface-100 shadow-lg shadow-black/20">
              <div className="flex items-center gap-2 mb-2">
                <Mic2 size={16} className="text-purple-400" />
                <span className="text-[10px] text-gray-400 uppercase tracking-wide">Voz Principal</span>
              </div>
              <p className="text-2xl font-black text-white">{myLeadVocalSongs.length}</p>
            </div>
          </section>

          {/* Quick Action - Suggest Song */}
          <Link
            href="/songs"
            data-tour="suggest-action"
            className="flex items-center gap-4 rounded-2xl p-5 bg-linear-to-r from-brand-blue-primary/30 to-indigo-600/20 border border-brand-blue-primary/30 hover:border-brand-yellow/50 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-brand-yellow/20 flex items-center justify-center shrink-0">
              <Plus size={24} className="text-brand-yellow" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white group-hover:text-brand-yellow transition-colors">
                Sugerir una Cancion
              </h3>
              <p className="text-sm text-gray-400">Comparte tu musica favorita con la banda</p>
            </div>
            <ChevronRight size={20} className="text-gray-500 group-hover:text-white transition-colors" />
          </Link>

          {/* My Lead Vocals */}
          {myLeadVocalSongs.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <Mic2 size={18} className="text-purple-400" />
                  Mis Voces Principales
                </h2>
              </div>
              <div className="space-y-2">
                {myLeadVocalSongs.map((song) => (
                  <button
                    key={song.id}
                    onClick={() => setSelectedSong(song)}
                    className="flex items-center gap-3 p-3 w-full text-left bg-surface-50 rounded-xl border border-surface-100 hover:border-purple-500/30 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-surface-100 flex items-center justify-center shrink-0 overflow-hidden">
                      {song.coverUrl ? (
                        <CachedImage src={song.coverUrl} alt={song.title} className="w-full h-full" />
                      ) : (
                        <Music size={16} className="text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate group-hover:text-purple-400">
                        {song.title}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                    </div>
                    <Star size={16} className="text-purple-400 shrink-0" />
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* My Suggestions Status */}
          {mySuggestions.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <Sparkles size={18} className="text-brand-yellow" />
                  Mis Sugerencias
                </h2>
              </div>
              <div className="space-y-2">
                {mySuggestions.map((song) => (
                  <button
                    key={song.id}
                    onClick={() => setSelectedSong(song)}
                    className="flex items-center gap-3 p-3 w-full text-left bg-surface-50 rounded-xl border border-surface-100 hover:border-white/20 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-surface-100 flex items-center justify-center shrink-0 overflow-hidden">
                      {song.coverUrl ? (
                        <CachedImage src={song.coverUrl} alt={song.title} className="w-full h-full" />
                      ) : (
                        <Music size={16} className="text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate group-hover:text-brand-yellow">
                        {song.title}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {song.status === "READY" && <CheckCircle2 size={16} className="text-green-400" />}
                      {song.status === "REHEARSING" && <Play size={16} className="text-yellow-400" />}
                      {song.status === "PENDING" && <Clock size={16} className="text-gray-400" />}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* ============================================= */}
      {/* STUDENT_GUEST VIEW (Read-only) */}
      {/* ============================================= */}
      {user?.role === "STUDENT_GUEST" && (
        <>
          {/* Read-only notice */}
          <div className="rounded-2xl p-4 bg-blue-500/10 border border-blue-500/20 flex items-center gap-3">
            <Eye size={20} className="text-blue-400 shrink-0" />
            <div>
              <p className="text-sm text-white font-medium">Modo Vista</p>
              <p className="text-xs text-gray-400">
                Como invitado, puedes explorar el repertorio y proximos eventos
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <section className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl p-4 bg-surface-50 border border-surface-100 shadow-lg shadow-black/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={16} className="text-green-400" />
                <span className="text-[10px] text-gray-400 uppercase tracking-wide">Listas</span>
              </div>
              <p className="text-2xl font-black text-white">{stats.ready}</p>
            </div>

            <div className="rounded-2xl p-4 bg-surface-50 border border-surface-100 shadow-lg shadow-black/20">
              <div className="flex items-center gap-2 mb-2">
                <Play size={16} className="text-yellow-400" />
                <span className="text-[10px] text-gray-400 uppercase tracking-wide">Ensayando</span>
              </div>
              <p className="text-2xl font-black text-white">{stats.rehearsing}</p>
            </div>

            <div className="rounded-2xl p-4 bg-surface-50 border border-surface-100 shadow-lg shadow-black/20">
              <div className="flex items-center gap-2 mb-2">
                <Music size={16} className="text-brand-yellow" />
                <span className="text-[10px] text-gray-400 uppercase tracking-wide">Total</span>
              </div>
              <p className="text-2xl font-black text-white">{stats.total}</p>
            </div>
          </section>
        </>
      )}

      {/* ============================================= */}
      {/* COMMON SECTIONS (all roles) */}
      {/* ============================================= */}

      {/* Upcoming Concerts */}
      {upcomingConcerts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Ticket size={18} className="text-purple-400" />
              Proximos Conciertos
            </h2>
            <Link href="/concerts" className="text-sm text-gray-400 hover:text-white flex items-center gap-1">
              Ver todos <ChevronRight size={16} />
            </Link>
          </div>
          <div className="space-y-2">
            {upcomingConcerts.map((concert) => (
              <Link
                key={concert.id}
                href={`/concerts?concert=${concert.id}`}
                className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl border border-surface-100 hover:border-purple-500/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-purple-500/30 to-pink-500/30 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] text-purple-300 uppercase">
                    {new Date(concert.date).toLocaleDateString("es-DO", { month: "short" })}
                  </span>
                  <span className="text-lg font-bold text-white leading-none">
                    {new Date(concert.date).getDate()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate group-hover:text-purple-400">
                    {concert.event?.name || "Concierto"}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {concert.location || "Ubicacion por confirmar"} · {concert._count?.songs || 0} canciones
                  </p>
                </div>
                <ChevronRight size={16} className="text-gray-500 group-hover:text-white shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Repertoire Progress (for all roles) */}
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
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: `${(stats.ready / stats.total) * 100}%` }}
              />
              <div
                className="h-full bg-yellow-500 transition-all duration-500"
                style={{ width: `${(stats.rehearsing / stats.total) * 100}%` }}
              />
              <div
                className="h-full bg-red-500 transition-all duration-500"
                style={{ width: `${(stats.pending / stats.total) * 100}%` }}
              />
            </>
          )}
        </div>

        <div className="flex justify-between mt-3 text-xs">
          <span className="text-green-400 flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            {stats.ready} listas
          </span>
          <span className="text-yellow-400 flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
            {stats.rehearsing} ensayando
          </span>
          <span className="text-red-400 flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            {stats.pending} pendientes
          </span>
        </div>
      </section>

      {/* Recent Songs */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Clock size={18} className="text-brand-yellow" />
            Canciones Recientes
          </h2>
          <Link href="/songs" className="text-sm text-gray-400 hover:text-white flex items-center gap-1">
            Ver todas <ChevronRight size={16} />
          </Link>
        </div>

        {loadingSongs ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-surface-50 animate-shimmer" />
            ))}
          </div>
        ) : recentSongs.length > 0 ? (
          <div className="space-y-2">
            {recentSongs.map((song) => (
              <button
                key={song.id}
                onClick={() => setSelectedSong(song)}
                className="flex items-center gap-3 p-3 w-full text-left bg-surface-50 rounded-xl border border-surface-100 hover:border-white/20 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-surface-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {song.coverUrl ? (
                    <CachedImage src={song.coverUrl} alt={song.title} className="w-full h-full" />
                  ) : (
                    <Music size={16} className="text-gray-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate group-hover:text-brand-yellow">
                    {song.title}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {song.artist}
                    {song.genre && <span className="text-gray-500"> · {song.genre}</span>}
                  </p>
                </div>
                <div
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    song.status === "READY"
                      ? "bg-green-400"
                      : song.status === "REHEARSING"
                      ? "bg-yellow-400"
                      : "bg-red-400"
                  }`}
                />
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-surface-50 rounded-xl border border-surface-100">
            <Music size={32} className="mx-auto mb-3 text-gray-500" />
            <p className="text-gray-400 text-sm mb-3">No hay canciones aun</p>
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

      {/* Quick Access Cards */}
      <section className="grid grid-cols-3 gap-3">
        <Link
          href="/songs"
          className="rounded-2xl p-4 bg-surface-50 border border-surface-100 hover:border-brand-yellow/30 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-brand-blue-primary to-indigo-600 flex items-center justify-center mb-3">
            <Music size={20} className="text-white" />
          </div>
          <h3 className="font-semibold text-white group-hover:text-brand-yellow transition-colors">
            Repertorio
          </h3>
          <p className="text-xs text-gray-400">{stats.total} canciones</p>
        </Link>

        <Link
          href="/events"
          className="rounded-2xl p-4 bg-surface-50 border border-surface-100 hover:border-blue-500/30 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-3">
            <Calendar size={20} className="text-white" />
          </div>
          <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">Eventos</h3>
          <p className="text-xs text-gray-400">{events?.length || 0} eventos</p>
        </Link>

        <Link
          href="/guides"
          className="rounded-2xl p-4 bg-surface-50 border border-surface-100 hover:border-amber-500/30 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-3">
            <BookOpen size={20} className="text-white" />
          </div>
          <h3 className="font-semibold text-white group-hover:text-amber-400 transition-colors">Guias</h3>
          <p className="text-xs text-gray-400">Tutoriales</p>
        </Link>
      </section>

      {/* Song Detail Modal */}
      <SongDetailModal song={selectedSong} onClose={() => setSelectedSong(null)} />
    </div>
  );
}
