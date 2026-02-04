"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSong } from "@/hooks/use-songs";
import SongDetailModal from "@/components/SongDetailModal";
import { Music } from "lucide-react";

interface SongClientProps {
  songId: string;
}

export default function SongClient({ songId }: SongClientProps) {
  const router = useRouter();
  const { data: song, isLoading, error } = useSong(songId);

  // Redirect to songs page and open modal there
  useEffect(() => {
    if (song) {
      // Navigate to songs page with the song ID in URL
      router.replace(`/songs?song=${songId}`);
    }
  }, [song, songId, router]);

  if (isLoading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="h-48 rounded-xl bg-surface-50 animate-shimmer" />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
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

  if (error || !song) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-surface-50 flex items-center justify-center">
          <Music size={32} className="text-gray-500" />
        </div>
        <p className="text-gray-400 mb-2">Cancion no encontrada</p>
        <button
          onClick={() => router.push("/songs")}
          className="text-sm text-brand-blue-primary hover:underline"
        >
          Volver al repertorio
        </button>
      </div>
    );
  }

  // Show loading while redirecting
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-50 animate-pulse flex items-center justify-center">
          <Music size={24} className="text-gray-400" />
        </div>
        <p className="text-gray-400">Cargando cancion...</p>
      </div>
    </div>
  );
}
