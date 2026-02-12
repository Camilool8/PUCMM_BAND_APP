import type { Metadata } from "next";
import { env } from "@/lib/env";

const orgName = env.orgName;

export const metadata: Metadata = {
  title: "Repertorio",
  description: `Repertorio musical de ${orgName} - Canciones activas, sugerencias y archivo`,
  openGraph: {
    title: `Repertorio | ${orgName}`,
    description: `Repertorio musical de ${orgName} - Canciones activas, sugerencias y archivo`,
    type: "website",
    siteName: orgName,
    images: [
      {
        url: `${env.siteUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: `${orgName} - Repertorio`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Repertorio | ${orgName}`,
    description: `Repertorio musical de ${orgName}`,
    images: [`${env.siteUrl}/opengraph-image`],
  },
};

export default function SongsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
