import type { Metadata } from "next";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Repertorio",
  description: "Repertorio musical de la Banda Universitaria PUCMM - Canciones activas, sugerencias y archivo",
  openGraph: {
    title: "Repertorio | PUCMM Band",
    description: "Repertorio musical de la Banda Universitaria PUCMM - Canciones activas, sugerencias y archivo",
    type: "website",
    siteName: "PUCMM Band",
    images: [
      {
        url: `${env.siteUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "PUCMM Band - Repertorio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Repertorio | PUCMM Band",
    description: "Repertorio musical de la Banda Universitaria PUCMM",
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
