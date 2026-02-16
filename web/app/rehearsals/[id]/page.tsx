import { Metadata } from "next";
import RehearsalClient from "./RehearsalClient";
import { env } from "@/lib/env";

interface RehearsalMetadata {
  id: string;
  date: string;
  eventName: string | null;
  locationName: string | null;
  bannerUrl: string | null;
}

async function getRehearsalMetadata(id: string): Promise<RehearsalMetadata | null> {
  try {
    const res = await fetch(`${env.apiUrlInternal}/public/metadata/rehearsal/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-DO", {
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
  const rehearsal = await getRehearsalMetadata(id);
  const ogImageUrl = `${env.siteUrl}/api/og/rehearsal/${id}`;

  if (!rehearsal) {
    return {
      title: `Ensayo | ${env.orgName}`,
      description: `Detalles del ensayo - ${env.orgName}`,
      openGraph: {
        title: "Ensayo",
        description: `Detalles del ensayo - ${env.orgName}`,
        type: "website",
        siteName: env.orgName,
        images: [{ url: ogImageUrl, width: 1200, height: 630, alt: `Ensayo ${env.orgName}` }],
      },
      twitter: {
        card: "summary_large_image",
        title: `Ensayo | ${env.orgName}`,
        description: `Detalles del ensayo - ${env.orgName}`,
        images: [ogImageUrl],
      },
    };
  }

  const dateStr = formatDate(rehearsal.date);
  const title = `Ensayo ${dateStr} | ${env.orgName}`;
  const description = [rehearsal.eventName, rehearsal.locationName].filter(Boolean).join(" - ") || `Ensayo - ${env.orgName}`;

  return {
    title,
    description,
    openGraph: {
      title: `Ensayo - ${dateStr}`,
      description,
      type: "website",
      siteName: env.orgName,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: dateStr }],
    },
    twitter: {
      card: "summary_large_image",
      title: `Ensayo - ${dateStr}`,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function RehearsalPage({ params }: Props) {
  const { id } = await params;
  return <RehearsalClient rehearsalId={id} />;
}
