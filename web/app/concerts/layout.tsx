import type { Metadata } from "next";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Conciertos",
  description: "Historial de conciertos y presentaciones de la Banda Universitaria PUCMM",
  openGraph: {
    title: "Conciertos | PUCMM Band",
    description: "Historial de conciertos y presentaciones de la Banda Universitaria PUCMM",
    type: "website",
    siteName: "PUCMM Band",
    images: [
      {
        url: `${env.siteUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "PUCMM Band - Conciertos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Conciertos | PUCMM Band",
    description: "Historial de conciertos y presentaciones de la Banda Universitaria PUCMM",
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
