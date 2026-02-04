import { Metadata } from "next";
import EventClient from "./EventClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface EventMetadata {
  id: string;
  name: string;
  description: string | null;
  bannerUrl: string | null;
  iconName: string | null;
}

async function getEventMetadata(id: string): Promise<EventMetadata | null> {
  try {
    const res = await fetch(`${API_URL}/public/metadata/event/${id}`, {
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
  const event = await getEventMetadata(id);

  if (!event) {
    return {
      title: "Evento | PUCMM Band",
      description: "Detalles del evento",
    };
  }

  const title = `${event.name} | PUCMM Band`;
  const description = event.description || `Evento ${event.name} - PUCMM Band`;
  const ogImageUrl = `/api/og/event/${id}`;

  return {
    title,
    description,
    openGraph: {
      title: event.name,
      description,
      type: "website",
      siteName: "PUCMM Band",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: event.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: event.name,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function EventPage({ params }: Props) {
  const { id } = await params;
  return <EventClient eventId={id} />;
}
