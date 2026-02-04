import { Metadata } from "next";
import ConcertClient from "./ConcertClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface ConcertMetadata {
  id: string;
  eventName: string;
  date: string;
  location: string | null;
  bannerUrl: string | null;
}

async function getConcertMetadata(id: string): Promise<ConcertMetadata | null> {
  try {
    const res = await fetch(`${API_URL}/public/metadata/concert/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-DO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const concert = await getConcertMetadata(id);

  if (!concert) {
    return {
      title: "Concierto | PUCMM Band",
      description: "Detalles del concierto",
    };
  }

  const title = `${formatDate(concert.date)} | PUCMM Band`;
  const description = `${concert.eventName}${concert.location ? ` - ${concert.location}` : ""}`;
  const ogImageUrl = `/api/og/concert/${id}`;

  return {
    title,
    description,
    openGraph: {
      title: formatDate(concert.date),
      description,
      type: "website",
      siteName: "PUCMM Band",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `Concierto ${concert.eventName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: formatDate(concert.date),
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function ConcertPage({ params }: Props) {
  const { id } = await params;
  return <ConcertClient concertId={id} />;
}
