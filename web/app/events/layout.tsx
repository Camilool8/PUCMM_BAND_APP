import type { Metadata } from "next";
import { env } from "@/lib/env";

const orgName = env.orgName;

export const metadata: Metadata = {
  title: "Eventos",
  description: `Eventos y presentaciones de ${orgName} - Navidad, Graduaciones, y mas`,
  openGraph: {
    title: `Eventos | ${orgName}`,
    description: `Eventos y presentaciones de ${orgName} - Navidad, Graduaciones, y mas`,
    type: "website",
    siteName: orgName,
    images: [
      {
        url: `${env.siteUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: `${orgName} - Eventos`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Eventos | ${orgName}`,
    description: `Eventos y presentaciones de ${orgName}`,
    images: [`${env.siteUrl}/opengraph-image`],
  },
};

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
