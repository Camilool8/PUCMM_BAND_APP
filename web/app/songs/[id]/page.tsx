import { Metadata } from "next";
import SongClient from "./SongClient";
import { env } from "@/lib/env";

interface SongMetadata {
  id: string;
  title: string;
  artist: string;
  coverUrl: string | null;
  genre: string | null;
}

async function getSongMetadata(id: string): Promise<SongMetadata | null> {
  try {
    const res = await fetch(`${env.apiUrlInternal}/public/metadata/song/${id}`, {
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

  // Always use absolute URL for OG image
  const ogImageUrl = `${env.siteUrl}/api/og/song/${id}`;

  if (!song) {
    return {
      title: "Cancion | PUCMM Band",
      description: "Detalles de la cancion - PUCMM Band",
      openGraph: {
        title: "Cancion",
        description: "Detalles de la cancion - PUCMM Band",
        type: "music.song",
        siteName: "PUCMM Band",
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: "Cancion PUCMM Band",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: "Cancion | PUCMM Band",
        description: "Detalles de la cancion - PUCMM Band",
        images: [ogImageUrl],
      },
    };
  }

  const title = `${song.title} - ${song.artist} | PUCMM Band`;
  const description = song.genre
    ? `${song.title} de ${song.artist} (${song.genre}) - Repertorio PUCMM Band`
    : `${song.title} de ${song.artist} - Repertorio PUCMM Band`;

  return {
    title,
    description,
    openGraph: {
      title: `${song.title} - ${song.artist}`,
      description,
      type: "music.song",
      siteName: "PUCMM Band",
      images: [
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
