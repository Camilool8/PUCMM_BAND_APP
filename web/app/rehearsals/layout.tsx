import type { Metadata } from "next";
import { env } from "@/lib/env";

const orgName = env.orgName;

export const metadata: Metadata = {
  title: "Ensayos",
  description: `Programa de ensayos y asistencia de ${orgName}`,
  openGraph: {
    title: `Ensayos | ${orgName}`,
    description: `Programa de ensayos y asistencia de ${orgName}`,
    type: "website",
    siteName: orgName,
    images: [
      {
        url: `${env.siteUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: `${orgName} - Ensayos`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Ensayos | ${orgName}`,
    description: `Programa de ensayos y asistencia de ${orgName}`,
    images: [`${env.siteUrl}/opengraph-image`],
  },
};

export default function RehearsalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
