import { Play } from "lucide-react";
import Image from "next/image";

interface SongCardProps {
  title: string;
  artist: string;
  coverUrl?: string;
}

export default function SongCard({ title, artist, coverUrl }: SongCardProps) {
  return (
    <div className="group bg-surface-50 rounded-xl overflow-hidden hover:scale-[1.02] transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md">
      <div className="relative aspect-square w-full bg-surface-100">
        {coverUrl ? (
          <Image src={coverUrl} alt={title} fill className="object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-text-tertiary">
            No Cover
          </div>
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button className="bg-brand-yellow text-surface-0 rounded-full p-3 shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                <Play className="w-6 h-6 fill-current" />
            </button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-text-primary font-semibold truncate" title={title}>{title}</h3>
        <p className="text-text-secondary text-sm truncate" title={artist}>{artist}</p>
      </div>
    </div>
  );
}
