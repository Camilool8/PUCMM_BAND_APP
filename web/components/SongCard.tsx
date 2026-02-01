import { Music } from "lucide-react";
import Image from "next/image";

interface SongCardProps {
  title: string;
  artist: string;
  coverUrl?: string;
}

export default function SongCard({ title, artist, coverUrl }: SongCardProps) {
  return (
    <div className="group bg-surface-50 rounded-xl overflow-hidden hover:scale-[1.02] transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:bg-surface-100">
      <div className="relative aspect-square w-full bg-surface-100">
        {coverUrl ? (
          <Image src={coverUrl} alt={title} fill className="object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-text-tertiary">
            <Music size={32} />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-text-primary font-semibold truncate group-hover:text-brand-yellow transition-colors" title={title}>{title}</h3>
        <p className="text-text-secondary text-sm truncate" title={artist}>{artist}</p>
      </div>
    </div>
  );
}
