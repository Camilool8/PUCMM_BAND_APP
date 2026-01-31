import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "PUCMM Band App",
  description: "Gestión de repertorio de la Banda PUCMM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={cn(inter.variable, "bg-surface-0 text-text-primary min-h-screen flex antialiased")}>
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 ml-64 p-8 mb-24">
           {children}
        </main>

        {/* Player Bar Placeholder */}
        <div className="fixed bottom-0 left-0 right-0 h-20 bg-surface-50 border-t border-surface-100 z-50 flex items-center justify-center text-text-secondary">
          Player Bar Component (Placeholder)
        </div>
      </body>
    </html>
  );
}