import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import AuthGuard from "@/components/AuthGuard";
import DevViewToggle from "@/components/DevViewToggle";
import { Providers } from "@/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "PUCMM Band App",
  description: "Gestión de repertorio de la Banda PUCMM",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BandApp",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F172A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={cn(
          inter.variable,
          "bg-surface-0 text-text-primary min-h-dvh flex antialiased"
        )}
      >
        <Providers>
          <AuthGuard>
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 md:ml-64 flex flex-col relative overflow-hidden bg-linear-to-b from-surface-100/50 to-surface-0">
              <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 scrollbar-hide">
                <div className="animate-fade-in">{children}</div>
              </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <BottomNav />

            {/* Dev Mode Toggle (only for SUPERADMIN in development) */}
            <DevViewToggle />
          </AuthGuard>
        </Providers>

        {/* Portal root for modals - rendered outside React tree for proper stacking */}
        <div id="modal-root" />
      </body>
    </html>
  );
}
