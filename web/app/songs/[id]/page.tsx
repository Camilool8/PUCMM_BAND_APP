import { Metadata } from "next";
import SongClient from "./SongClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface SongMetadata {
  id: string;
  title: string;
  artist: string;
  coverUrl: string | null;
  genre: string | null;
}

async function getSongMetadata(id: string): Promise<SongMetadata | null> {
  try {
    const res = await fetch(`${API_URL}/public/metadata/song/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const song = await getSongMetadata(id);

  if (!song) {
    return {
      title: "Cancion | PUCMM Band",
      description: "Detalles de la cancion",
    };
  }

  const title = `${song.title} - ${song.artist} | PUCMM Band`;
  const description = song.genre
    ? `${song.title} de ${song.artist} (${song.genre}) - Repertorio PUCMM Band`
    : `${song.title} de ${song.artist} - Repertorio PUCMM Band`;
  const ogImageUrl = `/api/og/song/${id}`;

  return {
    title,
    description,
    openGraph: {
      title: `${song.title} - ${song.artist}`,
      description,
      type: "music.song",
      siteName: "PUCMM Band",
      images: song.coverUrl
        ? [
            {
              url: ogImageUrl,
              width: 1200,
              height: 630,
              alt: `${song.title} - ${song.artist}`,
            },
          ]
        : [
            {
              url: ogImageUrl,
              width: 1200,
              height: 630,
              alt: `${song.title} - ${song.artist}`,
            },
          ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${song.title} - ${song.artist}`,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function SongPage({ params }: Props) {
  const { id } = await params;
  return <SongClient songId={id} />;
}
