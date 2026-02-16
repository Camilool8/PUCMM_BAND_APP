"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTour } from "@/hooks/use-tour";

/**
 * This component triggers tours for users:
 * 1. Welcome tour for new users
 * 2. Role upgrade tour when a user's role has been upgraded
 *
 * Place this component in the layout so it runs on every page load.
 */
export default function WelcomeTourTrigger() {
  const { isAuthenticated, effectiveRole, isLoading } = useAuth();
  const {
    startWelcomeTour,
    startRoleUpgradeTour,
    hasSeenWelcome,
    pendingRoleUpgradeTour,
    isRunning,
    hydrated,
  } = useTour();
  const [hasMounted, setHasMounted] = useState(false);

  // Wait for client-side mount
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Trigger appropriate tour when ready
  useEffect(() => {
    if (!hasMounted || !hydrated || !isAuthenticated || isLoading || !effectiveRole || isRunning) {
      return;
    }

    // Small delay to ensure the DOM is fully ready
    const timer = setTimeout(() => {
      // Priority 1: Role upgrade tour (for returning users with new role)
      if (pendingRoleUpgradeTour) {
        console.log("[WelcomeTourTrigger] Starting role upgrade tour");
        startRoleUpgradeTour();
        return;
      }

      // Priority 2: Welcome tour (for new users)
      if (!hasSeenWelcome) {
        console.log("[WelcomeTourTrigger] Starting welcome tour");
        startWelcomeTour();
      }
    }, 1500); // Slightly longer delay for the custom system

    return () => clearTimeout(timer);
  }, [
    hasMounted,
    hydrated,
    isAuthenticated,
    isLoading,
    effectiveRole,
    hasSeenWelcome,
    pendingRoleUpgradeTour,
    isRunning,
    startWelcomeTour,
    startRoleUpgradeTour,
  ]);

  // This component doesn't render anything visible
  return null;
}
