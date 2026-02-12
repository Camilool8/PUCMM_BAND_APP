import { Metadata } from "next";
import EventClient from "./EventClient";
import { env } from "@/lib/env";

interface EventMetadata {
  id: string;
  name: string;
  description: string | null;
  bannerUrl: string | null;
  iconName: string | null;
}

async function getEventMetadata(id: string): Promise<EventMetadata | null> {
  try {
    const res = await fetch(`${env.apiUrlInternal}/public/metadata/event/${id}`, {
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

  // Always use absolute URL for OG image
  const ogImageUrl = `${env.siteUrl}/api/og/event/${id}`;

  if (!event) {
    return {
      title: `Evento | ${env.orgName}`,
      description: `Detalles del evento - ${env.orgName}`,
      openGraph: {
        title: "Evento",
        description: `Detalles del evento - ${env.orgName}`,
        type: "website",
        siteName: env.orgName,
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `Evento ${env.orgName}`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `Evento | ${env.orgName}`,
        description: `Detalles del evento - ${env.orgName}`,
        images: [ogImageUrl],
      },
    };
  }

  const title = `${event.name} | ${env.orgName}`;
  const description = event.description || `Evento ${event.name} - ${env.orgName}`;

  return {
    title,
    description,
    openGraph: {
      title: event.name,
      description,
      type: "website",
      siteName: env.orgName,
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
