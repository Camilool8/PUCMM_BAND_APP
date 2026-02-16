"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { usePlayer } from "@/contexts/music-player-context";

export default function MainContent({ children }: { children: ReactNode }) {
  const { isActive } = usePlayer();

  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide transition-[padding-bottom] duration-300",
        isActive ? "pb-40 md:pb-20" : "pb-24 md:pb-8"
      )}
    >
      <div className="animate-fade-in">{children}</div>
    </div>
  );
}
