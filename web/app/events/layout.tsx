import type { Metadata } from "next";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Eventos",
  description: "Eventos y presentaciones de la Banda Universitaria PUCMM - Navidad, Graduaciones, y mas",
  openGraph: {
    title: "Eventos | PUCMM Band",
    description: "Eventos y presentaciones de la Banda Universitaria PUCMM - Navidad, Graduaciones, y mas",
    type: "website",
    siteName: "PUCMM Band",
    images: [
      {
        url: `${env.siteUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "PUCMM Band - Eventos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eventos | PUCMM Band",
    description: "Eventos y presentaciones de la Banda Universitaria PUCMM",
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
