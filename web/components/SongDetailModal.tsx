"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Mic2,
  FileMusic,
  Calendar,
  Music,
  CheckCircle2,
  PlayCircle,
  Clock,
  Archive,
  Trash2,
  Shield,
  Pencil,
  X,
  Check,
  User,
  FileText,
  ExternalLink,
  Loader2,
  Play,
  Video,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { FileDropzone } from "@/components/ui/FileDropzone";
import StatusBadge from "./StatusBadge";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateSong, useDeleteSong, useAddLeadVocal, useRemoveLeadVocal } from "@/hooks/use-songs";
import { useUsers } from "@/hooks/use-users";
import { useSongAssets, useCreateAsset, useDeleteAsset } from "@/hooks/use-upload";
import { useResolveMusicLink } from "@/hooks/use-music-metadata";
import { isMusicLink, formatDurationFromMs } from "@/hooks/use-music-metadata";
import type { Song, SongStatus, Asset, UploadResponse, DbUser } from "@/lib/api";
import { env } from "@/lib/env";

// Dynamic import to avoid SSR issues with react-pdf
const PDFViewerModal = dynamic(() => import("./PDFViewerModal"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <Loader2 size={32} className="text-brand-yellow animate-spin" />
    </div>
  ),
});

// Platform icons as SVG
const SpotifyIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className || "w-5 h-5"} fill="currentColor">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
  </svg>
);

const YouTubeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className || "w-5 h-5"} fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const AppleMusicIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className || "w-5 h-5"} fill="currentColor">
    <path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.99c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.4-1.336.53-2.3 1.452-2.865 2.78-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.801.42.127.856.187 1.293.228.555.053 1.11.06 1.667.06h11.03a12.5 12.5 0 001.57-.1c.822-.106 1.596-.35 2.295-.81a5.046 5.046 0 001.88-2.207c.186-.42.293-.87.37-1.324.113-.675.138-1.358.137-2.04-.002-3.8 0-7.595-.003-11.393zm-6.423 3.99v5.712c0 .417-.058.827-.244 1.206-.29.59-.76.962-1.388 1.14-.35.1-.706.157-1.07.173-.95.042-1.785-.455-2.105-1.392-.227-.665-.198-1.342.124-1.987.31-.62.823-1.017 1.478-1.223.376-.118.77-.174 1.16-.222.376-.046.75-.098 1.13-.15V8.687a.588.588 0 00-.003-.063.21.21 0 00-.194-.18c-.065-.008-.13-.003-.193.006-.76.097-1.52.197-2.28.298l-3.674.483a.287.287 0 00-.193.096.248.248 0 00-.048.163v7.418c0 .31-.02.618-.11.916-.213.7-.63 1.222-1.302 1.503-.374.157-.77.227-1.175.25-.928.054-1.77-.338-2.158-1.303-.232-.574-.24-1.167-.078-1.758.217-.79.706-1.353 1.463-1.668.37-.154.76-.227 1.155-.267.453-.046.907-.095 1.36-.144v-.003-.004-5.26c0-.083.002-.167.017-.25.03-.17.126-.287.293-.326.1-.024.203-.037.306-.05l3.896-.51 3.468-.456c.106-.013.212-.032.318-.035.17-.005.287.098.324.265.015.067.02.138.02.208z"/>
  </svg>
);

interface SongDetailModalProps {
  song: Song | null;
  onClose: () => void;
}

type TabType = "info" | "scores" | "media";

const STATUS_OPTIONS: {
  value: SongStatus;
  label: string;
  icon: React.ReactNode;
  color: string;
  activeColor: string;
  description: string;
}[] = [
  {
    value: "PENDING",
    label: "Pendiente",
    icon: <Clock size={16} />,
    color: "text-red-400 border-red-500/30 hover:bg-red-500/10",
    activeColor: "text-red-400 bg-red-500/20 border-red-500/50 ring-2 ring-red-500/30",
    description: "Sugerencia nueva, sin revisar",
  },
  {
    value: "REHEARSING",
    label: "Ensayando",
    icon: <PlayCircle size={16} />,
    color: "text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10",
    activeColor: "text-yellow-400 bg-yellow-500/20 border-yellow-500/50 ring-2 ring-yellow-500/30",
    description: "En proceso de montaje",
  },
  {
    value: "READY",
    label: "Lista",
    icon: <CheckCircle2 size={16} />,
    color: "text-green-400 border-green-500/30 hover:bg-green-500/10",
    activeColor: "text-green-400 bg-green-500/20 border-green-500/50 ring-2 ring-green-500/30",
    description: "Montada y lista para tocar",
  },
  {
    value: "ARCHIVED",
    label: "Archivada",
    icon: <Archive size={16} />,
    color: "text-gray-400 border-gray-500/30 hover:bg-gray-500/10",
    activeColor: "text-gray-400 bg-gray-500/20 border-gray-500/50 ring-2 ring-gray-500/30",
    description: "Ya no se toca activamente",
  },
];

export default function SongDetailModal({ song, onClose }: SongDetailModalProps) {
  const router = useRouter();
  const { canManageSongs, canUploadMedia } = useAuth();
  const updateSong = useUpdateSong();
  const deleteSong = useDeleteSong();
  const addLeadVocal = useAddLeadVocal();
  const removeLeadVocal = useRemoveLeadVocal();
  const { data: assets = [], refetch: refetchAssets } = useSongAssets(song?.id || "");
  const { data: allUsers = [] } = useUsers();
  const createAsset = useCreateAsset();
  const deleteAsset = useDeleteAsset();
  const resolveMusicLink = useResolveMusicLink();

  const [activeTab, setActiveTab] = useState<TabType>("info");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editArtist, setEditArtist] = useState("");
  const [editBpm, setEditBpm] = useState("");
  const [editKey, setEditKey] = useState("");
  const [editSpotifyUrl, setEditSpotifyUrl] = useState("");
  const [editYoutubeUrl, setEditYoutubeUrl] = useState("");
  const [editAppleMusicUrl, setEditAppleMusicUrl] = useState("");
  const [editCoverUrl, setEditCoverUrl] = useState("");
  const [linkToResolve, setLinkToResolve] = useState("");

  // PDF viewer state
  const [selectedPdf, setSelectedPdf] = useState<Asset | null>(null);

  // Video viewer state
  const [selectedVideo, setSelectedVideo] = useState<Asset | null>(null);

  // Lead vocal selector state
  const [showLeadVocalSelector, setShowLeadVocalSelector] = useState(false);

  // Asset upload state
  const [uploadingAssetName, setUploadingAssetName] = useState("");
  const [uploadingInstrumentTag, setUploadingInstrumentTag] = useState("");

  // Optimistic status state for immediate UI feedback
  const [currentStatus, setCurrentStatus] = useState<SongStatus | null>(null);

  // Filter assets by type
  const scoreAssets = assets.filter((a) => a.type === "SCORE");
  const videoAssets = assets.filter((a) => a.type === "VIDEO");

  // Check if song has any music links
  const hasMusicLinks = song?.spotifyUrl || song?.youtubeUrl || song?.appleMusicUrl;

  // Initialize edit values when song changes
  useEffect(() => {
    if (song) {
      setEditTitle(song.title);
      setEditArtist(song.artist);
      setEditBpm(song.bpm?.toString() || "");
      setEditKey(song.key || "");
      setEditSpotifyUrl(song.spotifyUrl || "");
      setEditYoutubeUrl(song.youtubeUrl || "");
      setEditAppleMusicUrl(song.appleMusicUrl || "");
      setEditCoverUrl(song.coverUrl || "");
      setCurrentStatus(song.status);
      setIsEditing(false);
      setShowDeleteConfirm(false);
      setSelectedPdf(null);
      setSelectedVideo(null);
      setActiveTab("info");
      setLinkToResolve("");
      setShowLeadVocalSelector(false);
    }
  }, [song]);

  // Auto-resolve link when editing
  useEffect(() => {
    if (linkToResolve && isMusicLink(linkToResolve)) {
      const timer = setTimeout(() => {
        resolveMusicLink.mutate(linkToResolve, {
          onSuccess: (data) => {
            if (data.success && data.metadata) {
              const meta = data.metadata;
              if (meta.bpm) setEditBpm(meta.bpm.toString());
              if (meta.key) setEditKey(meta.key);
              if (meta.coverUrl) setEditCoverUrl(meta.coverUrl);

              // Set URL based on platform
              if (linkToResolve.includes("spotify")) {
                setEditSpotifyUrl(linkToResolve);
              } else if (linkToResolve.includes("youtube") || linkToResolve.includes("youtu.be")) {
                setEditYoutubeUrl(linkToResolve);
              } else if (linkToResolve.includes("apple")) {
                setEditAppleMusicUrl(linkToResolve);
              }
            }
          },
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [linkToResolve]);

  if (!song) return null;

  const handleStatusChange = async (newStatus: SongStatus) => {
    setCurrentStatus(newStatus);
    await updateSong.mutateAsync({ id: song.id, data: { status: newStatus } });
  };

  const handleSaveEdit = async () => {
    await updateSong.mutateAsync({
      id: song.id,
      data: {
        title: editTitle,
        artist: editArtist,
        bpm: editBpm ? parseInt(editBpm) : undefined,
        key: editKey || undefined,
        spotifyUrl: editSpotifyUrl || undefined,
        youtubeUrl: editYoutubeUrl || undefined,
        appleMusicUrl: editAppleMusicUrl || undefined,
        coverUrl: editCoverUrl || undefined,
      },
    });
    setIsEditing(false);
    setLinkToResolve("");
  };

  const handleCancelEdit = () => {
    setEditTitle(song.title);
    setEditArtist(song.artist);
    setEditBpm(song.bpm?.toString() || "");
    setEditKey(song.key || "");
    setEditSpotifyUrl(song.spotifyUrl || "");
    setEditYoutubeUrl(song.youtubeUrl || "");
    setEditAppleMusicUrl(song.appleMusicUrl || "");
    setEditCoverUrl(song.coverUrl || "");
    setIsEditing(false);
    setLinkToResolve("");
  };

  const handleDelete = async () => {
    await deleteSong.mutateAsync(song.id);
    onClose();
  };

  const handleClose = () => {
    setShowDeleteConfirm(false);
    setIsEditing(false);
    setSelectedPdf(null);
    setSelectedVideo(null);
    setShowLeadVocalSelector(false);
    onClose();
  };

  const handleScoreUpload = async (response: UploadResponse) => {
    const fullUrl = `${env.apiUrl}${response.file.url}`;
    await createAsset.mutateAsync({
      type: "SCORE",
      url: fullUrl,
      name: uploadingAssetName || response.file.originalName,
      instrumentTag: uploadingInstrumentTag || undefined,
      songId: song.id,
    });
    setUploadingAssetName("");
    setUploadingInstrumentTag("");
    refetchAssets();
  };

  const handleVideoUpload = async (response: UploadResponse) => {
    const fullUrl = `${env.apiUrl}${response.file.url}`;
    await createAsset.mutateAsync({
      type: "VIDEO",
      url: fullUrl,
      name: uploadingAssetName || response.file.originalName,
      songId: song.id,
    });
    setUploadingAssetName("");
    refetchAssets();
  };

  const handleDeleteAsset = async (assetId: string) => {
    await deleteAsset.mutateAsync(assetId);
    refetchAssets();
  };

  const openMusicLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <Modal isOpen={!!song} onClose={handleClose} size="lg" showCloseButton={false} data-tour="modal-content">
        {/* Custom Header with Cover Art */}
        <div data-tour="song-detail-header" className="relative h-44 md:h-52 bg-linear-to-b from-brand-blue-primary/60 via-brand-blue-primary/30 to-transparent shrink-0">
          {/* Background blur effect */}
          {(editCoverUrl || song.coverUrl) && (
            <div
              className="absolute inset-0 opacity-30 blur-2xl scale-110"
              style={{
                backgroundImage: `url(${editCoverUrl || song.coverUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          )}

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white transition-all duration-200"
          >
            <X size={18} />
          </button>

          {/* Edit button for admins */}
          {canManageSongs && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="absolute top-4 right-16 z-10 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white transition-all duration-200"
            >
              <Pencil size={16} />
            </button>
          )}

          {/* Content */}
          <div className="absolute inset-x-0 bottom-0 flex items-end gap-4 md:gap-6 p-5 md:p-6">
            {/* Album Cover */}
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-xl md:rounded-2xl shadow-2xl border-2 border-white/10 overflow-hidden bg-surface-100 shrink-0 ring-1 ring-black/20">
              {(editCoverUrl || song.coverUrl) ? (
                <img src={editCoverUrl || song.coverUrl || ""} alt={song.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-surface-100 to-surface-200">
                  <Music size={40} className="text-gray-500 md:w-12 md:h-12" />
                </div>
              )}
            </div>

            {/* Song Info - Editable or Static */}
            <div className="flex-1 min-w-0 pb-1">
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-xl font-bold text-white placeholder:text-white/50 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/50 outline-none"
                    placeholder="Titulo"
                  />
                  <input
                    value={editArtist}
                    onChange={(e) => setEditArtist(e.target.value)}
                    className="w-full bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/50 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/50 outline-none"
                    placeholder="Artista"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={editBpm}
                      onChange={(e) => setEditBpm(e.target.value)}
                      placeholder="BPM"
                      min="40"
                      max="300"
                      className="w-24 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/50 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/50 outline-none"
                    />
                    <input
                      value={editKey}
                      onChange={(e) => setEditKey(e.target.value)}
                      placeholder="Tonalidad"
                      className="w-24 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/50 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/50 outline-none"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl md:text-3xl font-black text-white mb-1 truncate drop-shadow-lg">
                    {song.title}
                  </h2>
                  <p className="text-base md:text-lg text-white/80 truncate">{song.artist}</p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {song.bpm && (
                      <span className="text-xs font-bold px-2.5 py-1 bg-brand-blue-primary/90 text-white rounded-full shadow-sm">
                        {song.bpm} BPM
                      </span>
                    )}
                    {song.key && (
                      <span className="text-xs font-bold px-2.5 py-1 bg-brand-yellow text-brand-blue-primary rounded-full shadow-sm">
                        {song.key}
                      </span>
                    )}
                    {song.durationMs && (
                      <span className="text-xs font-medium px-2.5 py-1 bg-white/10 text-white/80 rounded-full">
                        {formatDurationFromMs(song.durationMs)}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Edit mode action bar */}
        {isEditing && (
          <div className="px-6 py-3 bg-surface-100/50 border-b border-surface-200/50 space-y-3">
            {/* Link resolution input */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  value={linkToResolve}
                  onChange={(e) => setLinkToResolve(e.target.value)}
                  placeholder="Pega un enlace de Spotify/YouTube/Apple Music para actualizar metadata..."
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 pr-10 text-sm text-white placeholder:text-gray-500 focus:border-brand-yellow outline-none"
                />
                {resolveMusicLink.isPending && (
                  <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-yellow animate-spin" />
                )}
              </div>
            </div>

            {/* Music links editing */}
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#1DB954]/20 flex items-center justify-center text-[#1DB954] shrink-0">
                  <SpotifyIcon className="w-4 h-4" />
                </div>
                <input
                  value={editSpotifyUrl}
                  onChange={(e) => setEditSpotifyUrl(e.target.value)}
                  placeholder="Spotify URL"
                  className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-gray-500 focus:border-brand-yellow outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FF0000]/20 flex items-center justify-center text-[#FF0000] shrink-0">
                  <YouTubeIcon className="w-4 h-4" />
                </div>
                <input
                  value={editYoutubeUrl}
                  onChange={(e) => setEditYoutubeUrl(e.target.value)}
                  placeholder="YouTube URL"
                  className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-gray-500 focus:border-brand-yellow outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FC3C44]/20 flex items-center justify-center text-[#FC3C44] shrink-0">
                  <AppleMusicIcon className="w-4 h-4" />
                </div>
                <input
                  value={editAppleMusicUrl}
                  onChange={(e) => setEditAppleMusicUrl(e.target.value)}
                  placeholder="Apple Music URL"
                  className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-gray-500 focus:border-brand-yellow outline-none"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={handleCancelEdit}
                disabled={updateSong.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200"
              >
                <X size={16} />
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={updateSong.isPending || !editTitle || !editArtist}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-brand-yellow text-brand-blue-primary font-medium rounded-lg hover:bg-brand-yellow/90 transition-all duration-200 disabled:opacity-50"
              >
                {updateSong.isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-brand-blue-primary/30 border-t-brand-blue-primary rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Guardar
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Music Platform Links - Always visible when not editing */}
        {!isEditing && hasMusicLinks && (
          <div data-tour="song-platform-links" className="px-6 py-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 mr-2">Escuchar en:</span>
              {song.spotifyUrl && (
                <button
                  onClick={() => openMusicLink(song.spotifyUrl!)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1DB954]/10 hover:bg-[#1DB954]/20 text-[#1DB954] transition-all"
                >
                  <SpotifyIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">Spotify</span>
                </button>
              )}
              {song.youtubeUrl && (
                <button
                  onClick={() => openMusicLink(song.youtubeUrl!)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#FF0000]/10 hover:bg-[#FF0000]/20 text-[#FF0000] transition-all"
                >
                  <YouTubeIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">YouTube</span>
                </button>
              )}
              {song.appleMusicUrl && (
                <button
                  onClick={() => openMusicLink(song.appleMusicUrl!)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#FC3C44]/10 hover:bg-[#FC3C44]/20 text-[#FC3C44] transition-all"
                >
                  <AppleMusicIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">Apple</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tabs */}
        {!isEditing && (
          <div data-tour="song-tabs" className="flex gap-1 px-6 pt-4 border-b border-white/5">
            <button
              onClick={() => setActiveTab("info")}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all ${
                activeTab === "info"
                  ? "bg-surface-100 text-white border-b-2 border-brand-yellow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Info
            </button>
            <button
              data-tour="song-tab-scores"
              onClick={() => setActiveTab("scores")}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all flex items-center gap-2 ${
                activeTab === "scores"
                  ? "bg-surface-100 text-white border-b-2 border-brand-yellow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Partituras
              {scoreAssets.length > 0 && (
                <span className="text-xs bg-brand-yellow/20 text-brand-yellow px-1.5 py-0.5 rounded-full">
                  {scoreAssets.length}
                </span>
              )}
            </button>
            <button
              data-tour="song-tab-media"
              onClick={() => setActiveTab("media")}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all flex items-center gap-2 ${
                activeTab === "media"
                  ? "bg-surface-100 text-white border-b-2 border-brand-yellow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Media
              {videoAssets.length > 0 && (
                <span className="text-xs bg-brand-yellow/20 text-brand-yellow px-1.5 py-0.5 rounded-full">
                  {videoAssets.length}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Body Content */}
        <Modal.Body className="space-y-5">
          {/* Info Tab */}
          {activeTab === "info" && !isEditing && (
            <>
              {/* Status Section */}
              <div className="p-4 bg-surface-100/50 rounded-2xl border border-surface-200/50">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-gray-400 font-medium">Estado actual</p>
                  {canManageSongs && (
                    <span className="flex items-center gap-1.5 text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full">
                      <Shield size={12} />
                      Admin
                    </span>
                  )}
                </div>

                {canManageSongs ? (
                  <div className="grid grid-cols-2 gap-2">
                    {STATUS_OPTIONS.map((option) => {
                      const isSelected = currentStatus === option.value;
                      return (
                        <button
                          key={option.value}
                          onClick={() => handleStatusChange(option.value)}
                          disabled={updateSong.isPending}
                          className={`
                            relative flex items-center gap-2 px-3 py-3 rounded-xl border text-sm font-medium
                            transition-all duration-200 disabled:opacity-50
                            ${isSelected ? option.activeColor : `bg-surface-200/30 ${option.color}`}
                          `}
                        >
                          {option.icon}
                          <span>{option.label}</span>
                          {isSelected && (
                            <div className="absolute right-2 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center animate-in zoom-in duration-200">
                              <Check size={12} strokeWidth={3} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <StatusBadge status={song.status} />
                )}
              </div>

              {/* Lead Vocals */}
              <div className="bg-surface-100/30 p-4 rounded-2xl border border-surface-200/30">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="flex items-center gap-2 text-white font-semibold">
                    <div className="w-8 h-8 rounded-lg bg-brand-yellow/20 flex items-center justify-center">
                      <Mic2 size={16} className="text-brand-yellow" />
                    </div>
                    Voces Principales
                  </h3>
                  {canManageSongs && (
                    <button
                      onClick={() => setShowLeadVocalSelector(!showLeadVocalSelector)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <Plus size={16} />
                    </button>
                  )}
                </div>

                {/* Current lead vocals */}
                {song.leadVocals && song.leadVocals.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {song.leadVocals.map((vocalist) => (
                      <div
                        key={vocalist.id}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-yellow/10 border border-brand-yellow/20"
                      >
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-surface-200 shrink-0">
                          {vocalist.avatarUrl ? (
                            <img src={vocalist.avatarUrl} alt={vocalist.name || ""} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User size={12} className="text-gray-500" />
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-brand-yellow font-medium">{vocalist.name || "Usuario"}</span>
                        {canManageSongs && (
                          <button
                            onClick={() => removeLeadVocal.mutate({ songId: song.id, userId: vocalist.id })}
                            disabled={removeLeadVocal.isPending}
                            className="p-0.5 rounded-full text-brand-yellow/60 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No asignado</p>
                )}

                {/* Lead vocal selector dropdown */}
                {showLeadVocalSelector && canManageSongs && (
                  <div className="mt-3 p-2 rounded-xl bg-surface-200/50 border border-surface-200 max-h-48 overflow-y-auto">
                    {allUsers
                      .filter((u: DbUser) => !song.leadVocals?.some((lv) => lv.id === u.id))
                      .map((user: DbUser) => (
                        <button
                          key={user.id}
                          onClick={() => {
                            addLeadVocal.mutate({ songId: song.id, userId: user.id });
                            setShowLeadVocalSelector(false);
                          }}
                          disabled={addLeadVocal.isPending}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-all text-left"
                        >
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-100 shrink-0">
                            {user.avatarUrl ? (
                              <img src={user.avatarUrl} alt={user.name || ""} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <User size={14} className="text-gray-500" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-white truncate">{user.name || user.email}</p>
                            {user.instruments && user.instruments.length > 0 && (
                              <p className="text-xs text-gray-500 truncate">{user.instruments.join(", ")}</p>
                            )}
                          </div>
                        </button>
                      ))}
                    {allUsers.filter((u: DbUser) => !song.leadVocals?.some((lv) => lv.id === u.id)).length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-2">No hay usuarios disponibles</p>
                    )}
                  </div>
                )}
              </div>

              {/* Events */}
              <div className="bg-surface-100/30 p-4 rounded-2xl border border-surface-200/30">
                <h3 className="flex items-center gap-2 text-white font-semibold mb-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-yellow/20 flex items-center justify-center">
                    <Calendar size={16} className="text-brand-yellow" />
                  </div>
                  Eventos
                </h3>
                {song.eventSongs && song.eventSongs.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {song.eventSongs.map((es) => (
                      <button
                        key={es.event.id}
                        onClick={() => {
                          handleClose();
                          router.push(`/events?event=${es.event.id}`);
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-200/50 hover:bg-white/10 border border-surface-200 transition-all group"
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            background: es.event.iconGradientFrom
                              ? `linear-gradient(to bottom right, ${es.event.iconGradientFrom}, ${es.event.gradientFrom || es.event.iconGradientFrom})`
                              : "rgba(59, 130, 246, 0.2)",
                          }}
                        >
                          <Calendar size={14} className="text-white" />
                        </div>
                        <span className="text-sm text-white font-medium group-hover:text-brand-yellow transition-colors">
                          {es.event.name}
                        </span>
                        <ExternalLink size={12} className="text-gray-500 group-hover:text-brand-yellow transition-colors" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">Esta cancion no esta asignada a ningun evento</p>
                )}
              </div>

              {/* Admin Actions */}
              {canManageSongs && (
                <div className="pt-4 border-t border-surface-200/50">
                  {showDeleteConfirm ? (
                    <div className="flex items-center justify-between bg-red-500/10 p-4 rounded-xl border border-red-500/30 animate-in fade-in duration-200">
                      <p className="text-sm text-red-400">Eliminar esta cancion?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleDelete}
                          disabled={deleteSong.isPending}
                          className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-all duration-200 disabled:opacity-50"
                        >
                          {deleteSong.isPending ? "Eliminando..." : "Si, eliminar"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center gap-2 text-sm text-red-400/80 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                      Eliminar cancion
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {/* Scores Tab */}
          {activeTab === "scores" && !isEditing && (
            <div className="space-y-4">
              {/* Existing scores */}
              {scoreAssets.length > 0 ? (
                <div className="space-y-2">
                  {scoreAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-surface-100/50 hover:bg-white/5 transition-all group"
                    >
                      <button
                        onClick={() => setSelectedPdf(asset)}
                        className="flex-1 flex items-center gap-3 text-left"
                      >
                        <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
                          <FileText size={18} className="text-red-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-white truncate group-hover:text-brand-yellow transition-colors">
                            {asset.name || "Partitura"}
                          </p>
                          {asset.instrumentTag && (
                            <p className="text-xs text-gray-500 truncate">{asset.instrumentTag}</p>
                          )}
                        </div>
                        <ExternalLink size={14} className="text-gray-500 group-hover:text-brand-yellow transition-colors shrink-0" />
                      </button>
                      {canManageSongs && (
                        <button
                          onClick={() => handleDeleteAsset(asset.id)}
                          className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileMusic size={40} className="mx-auto text-gray-500 mb-3" />
                  <p className="text-gray-400">No hay partituras adjuntas</p>
                </div>
              )}

              {/* Upload section for members+ */}
              {canUploadMedia && (
                <div className="pt-4 border-t border-surface-200/50 space-y-3">
                  <h4 className="text-sm font-medium text-white flex items-center gap-2">
                    <Plus size={16} />
                    Agregar Partitura
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={uploadingAssetName}
                      onChange={(e) => setUploadingAssetName(e.target.value)}
                      placeholder="Nombre (ej: Partitura General)"
                      className="bg-surface-100/80 border border-surface-200 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-brand-yellow outline-none"
                    />
                    <input
                      value={uploadingInstrumentTag}
                      onChange={(e) => setUploadingInstrumentTag(e.target.value)}
                      placeholder="Instrumento (ej: Alto Sax)"
                      className="bg-surface-100/80 border border-surface-200 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-brand-yellow outline-none"
                    />
                  </div>
                  <FileDropzone
                    type="pdf"
                    onUploadComplete={handleScoreUpload}
                    label="Subir PDF"
                    description="Arrastra o haz clic para subir"
                  />
                </div>
              )}
            </div>
          )}

          {/* Media Tab */}
          {activeTab === "media" && !isEditing && (
            <div className="space-y-4">
              {/* Existing videos */}
              {videoAssets.length > 0 ? (
                <div className="space-y-2">
                  {videoAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-surface-100/50 hover:bg-white/5 transition-all group"
                    >
                      <button
                        onClick={() => setSelectedVideo(asset)}
                        className="flex-1 flex items-center gap-3 text-left"
                      >
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                          <Video size={18} className="text-purple-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-white truncate group-hover:text-brand-yellow transition-colors">
                            {asset.name || "Video"}
                          </p>
                        </div>
                        <Play size={14} className="text-gray-500 group-hover:text-brand-yellow transition-colors shrink-0" />
                      </button>
                      {canManageSongs && (
                        <button
                          onClick={() => handleDeleteAsset(asset.id)}
                          className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Video size={40} className="mx-auto text-gray-500 mb-3" />
                  <p className="text-gray-400">No hay videos adjuntos</p>
                  <p className="text-xs text-gray-500 mt-1">Sube videos de ensayos o pistas de practica</p>
                </div>
              )}

              {/* Upload section for members+ */}
              {canUploadMedia && (
                <div className="pt-4 border-t border-surface-200/50 space-y-3">
                  <h4 className="text-sm font-medium text-white flex items-center gap-2">
                    <Plus size={16} />
                    Agregar Video
                  </h4>
                  <input
                    value={uploadingAssetName}
                    onChange={(e) => setUploadingAssetName(e.target.value)}
                    placeholder="Nombre del video (ej: Ensayo 15-01-2024)"
                    className="w-full bg-surface-100/80 border border-surface-200 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-brand-yellow outline-none"
                  />
                  <FileDropzone
                    type="video"
                    onUploadComplete={handleVideoUpload}
                    label="Subir Video"
                    description="MP4, WebM, MOV o AVI"
                  />
                </div>
              )}
            </div>
          )}
        </Modal.Body>

        {/* Footer with metadata */}
        {!isEditing && (
          <div className="shrink-0 px-6 py-4 border-t border-white/5">
            <div className="flex items-center justify-center gap-3">
              {song.suggestedBy ? (
                <>
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-surface-200 shrink-0">
                    {song.suggestedBy.avatarUrl ? (
                      <img
                        src={song.suggestedBy.avatarUrl}
                        alt={song.suggestedBy.name || ""}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User size={12} className="text-gray-500" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Sugerida por{" "}
                    <span className="text-gray-400 font-medium">
                      {song.suggestedBy.name || "Usuario"}
                    </span>{" "}
                    el{" "}
                    {new Date(song.createdAt).toLocaleDateString("es-DO", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </>
              ) : (
                <p className="text-xs text-gray-500">
                  Agregada el{" "}
                  {new Date(song.createdAt).toLocaleDateString("es-DO", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* PDF Viewer Modal */}
      {selectedPdf && (
        <PDFViewerModal
          isOpen={!!selectedPdf}
          onClose={() => setSelectedPdf(null)}
          url={selectedPdf.url}
          title={selectedPdf.name || "Partitura"}
        />
      )}

      {/* Video Viewer Modal */}
      {selectedVideo && (
        <Modal isOpen={!!selectedVideo} onClose={() => setSelectedVideo(null)} size="xl">
          <Modal.Header icon={<Video size={24} />}>
            {selectedVideo.name || "Video"}
          </Modal.Header>
          <Modal.Body>
            <video
              src={selectedVideo.url}
              controls
              autoPlay
              className="w-full rounded-xl"
              style={{ maxHeight: "70vh" }}
            />
          </Modal.Body>
        </Modal>
      )}
    </>
  );
}
