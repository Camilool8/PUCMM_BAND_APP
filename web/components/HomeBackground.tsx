"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import {
  getBackgroundStyles,
  isCustomImageBackground,
  DEFAULT_BACKGROUND_ID,
} from "@/lib/background-presets";

/**
 * HomeBackground component renders the user's customized background.
 * Uses Portal to render at body level for full viewport coverage.
 * Only visible on the home page.
 */
export default function HomeBackground() {
  const pathname = usePathname();
  const { dbUser } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only show on home page
  if (pathname !== "/") return null;
  if (!mounted) return null;

  // Get user's background preference
  const userBackground = dbUser?.homeBackground || DEFAULT_BACKGROUND_ID;
  const backgroundStyles = getBackgroundStyles(userBackground);
  const hasCustomImage = isCustomImageBackground(userBackground);

  const backgroundElement = (
    <div
      id="home-background"
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    >
      {/* Base layer - dark background */}
      <div className="absolute inset-0 bg-surface-0" />

      {/* User's background layer */}
      <div className="absolute inset-0" style={backgroundStyles}>
        {/* Blur overlay for custom images */}
        {hasCustomImage && (
          <div
            className="absolute inset-0"
            style={{
              backdropFilter: "blur(60px)",
              WebkitBackdropFilter: "blur(60px)",
              backgroundColor: "rgba(10, 10, 15, 0.7)",
            }}
          />
        )}
      </div>
      {/* Gradient fade to bottom for content readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface-0/30 to-surface-0" />
    </div>
  );

  return createPortal(backgroundElement, document.body);
}
