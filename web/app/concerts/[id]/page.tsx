import { Metadata } from "next";
import ConcertClient from "./ConcertClient";
import { env } from "@/lib/env";

interface ConcertMetadata {
  id: string;
  eventName: string;
  date: string;
  location: string | null;
  bannerUrl: string | null;
}

async function getConcertMetadata(id: string): Promise<ConcertMetadata | null> {
  try {
    const res = await fetch(`${env.apiUrlInternal}/public/metadata/concert/${id}`, {
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

  // Always use absolute URL for OG image
  const ogImageUrl = `${env.siteUrl}/api/og/concert/${id}`;

  if (!concert) {
    // Fallback metadata - still include OG image so it generates dynamically
    return {
      title: "Concierto | PUCMM Band",
      description: "Detalles del concierto - PUCMM Band",
      openGraph: {
        title: "Concierto",
        description: "Detalles del concierto - PUCMM Band",
        type: "website",
        siteName: "PUCMM Band",
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: "Concierto PUCMM Band",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: "Concierto | PUCMM Band",
        description: "Detalles del concierto - PUCMM Band",
        images: [ogImageUrl],
      },
    };
  }

  const title = `${formatDate(concert.date)} | PUCMM Band`;
  const description = `${concert.eventName}${concert.location ? ` - ${concert.location}` : ""}`;

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
