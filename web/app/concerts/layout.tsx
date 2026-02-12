import type { Metadata } from "next";
import { env } from "@/lib/env";

const orgName = env.orgName;

export const metadata: Metadata = {
  title: "Conciertos",
  description: `Historial de conciertos y presentaciones de ${orgName}`,
  openGraph: {
    title: `Conciertos | ${orgName}`,
    description: `Historial de conciertos y presentaciones de ${orgName}`,
    type: "website",
    siteName: orgName,
    images: [
      {
        url: `${env.siteUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: `${orgName} - Conciertos`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Conciertos | ${orgName}`,
    description: `Historial de conciertos y presentaciones de ${orgName}`,
    images: [`${env.siteUrl}/opengraph-image`],
  },
};

export default function ConcertsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
