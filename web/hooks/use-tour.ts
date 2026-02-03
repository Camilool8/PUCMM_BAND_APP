"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "./use-auth";
import { useTourContext } from "@/components/tour/TourProvider";
import type { MiniTourId, AggregatedTourId, UserRole } from "@/components/tour/TourProvider";
import type { TourStep, ModalControls } from "@/lib/tour-engine";
import {
  getMiniTour,
  getMiniToursForRole,
  getAggregatedTourSteps,
  isRoleUpgrade,
  getNewCapabilities,
  aggregatedTours,
} from "@/lib/tour-config";

export type { MiniTourId, AggregatedTourId, UserRole };

export function useTour() {
  const { effectiveRole } = useAuth();
  const context = useTourContext();
  const mountedRef = useRef(true);
  const [pendingRoleUpgradeTour, setPendingRoleUpgradeTour] = useState(false);

  // Track role changes for upgrade detection
  useEffect(() => {
    if (!effectiveRole) return;

    const currentRole = effectiveRole as UserRole;

    // Check for role upgrade
    if (context.lastKnownRole && context.lastKnownRole !== currentRole) {
      if (isRoleUpgrade(context.lastKnownRole, currentRole)) {
        setPendingRoleUpgradeTour(true);
      }
    }

    // Save current role
    context.saveRole(currentRole);

    return () => {
      mountedRef.current = false;
    };
  }, [effectiveRole, context.lastKnownRole, context.saveRole]);

  // Handle completion of mini tours within an aggregated tour
  const handleMiniTourComplete = useCallback((tourId: MiniTourId) => {
    if (!mountedRef.current) return;
    context.markTourCompleted(tourId);
  }, [context.markTourCompleted]);

  // Start a mini tour
  const startMiniTour = useCallback(
    (tourId: MiniTourId, forceRestart = false) => {
      if (!effectiveRole) {
        console.warn("[Tour] No effectiveRole, aborting");
        return;
      }

      // Check if already completed (unless forcing restart)
      if (!forceRestart && context.completedTours.includes(tourId)) {
        console.log("[Tour] Tour already completed, skipping");
        return;
      }

      const miniTour = getMiniTour(tourId);
      if (!miniTour) {
        console.warn("[Tour] Mini tour not found:", tourId);
        return;
      }

      console.log("[Tour] Starting tour:", tourId, "with", miniTour.steps.length, "steps");
      context.startTour(tourId, miniTour.steps);
    },
    [effectiveRole, context.completedTours, context.startTour]
  );

  // Start an aggregated tour (welcome or role-upgrade)
  const startAggregatedTour = useCallback(
    (tourId: AggregatedTourId, previousRole?: UserRole) => {
      if (!effectiveRole) {
        console.warn("[Tour] No effectiveRole, aborting aggregated tour");
        return;
      }

      const role = effectiveRole as UserRole;
      const steps = getAggregatedTourSteps(tourId, role, previousRole);

      console.log("[Tour] Starting aggregated tour:", tourId, "with", steps.length, "steps");

      if (steps.length === 0) {
        console.warn("[Tour] No steps found for aggregated tour");
        return;
      }

      // Get mini tour IDs that will be covered
      const aggregated = aggregatedTours.find((t) => t.id === tourId);
      const miniTourIds = aggregated?.getMiniTourIds(role, previousRole) || [];

      context.startTour(tourId, steps);

      // Mark all mini tours as completed when tour ends
      // This will be handled in the stopTour or when tour completes naturally
    },
    [effectiveRole, context.startTour]
  );

  // Start a sequence of specific mini tours
  const startTourSequence = useCallback(
    (tourIds: MiniTourId[]) => {
      if (!effectiveRole || tourIds.length === 0) {
        console.warn("[Tour] No effectiveRole or empty tourIds, aborting sequence");
        return;
      }

      const steps: TourStep[] = [];
      for (const id of tourIds) {
        const miniTour = getMiniTour(id);
        if (miniTour) {
          steps.push(...miniTour.steps);
        }
      }

      console.log("[Tour] Starting tour sequence with", steps.length, "total steps");

      if (steps.length === 0) {
        console.warn("[Tour] No steps found for tour sequence");
        return;
      }

      context.startTour(tourIds[0], steps);
    },
    [effectiveRole, context.startTour]
  );

  // Start welcome tour (only if not seen)
  const startWelcomeTour = useCallback(() => {
    if (!context.hasSeenWelcome) {
      startAggregatedTour("welcome");
      context.markWelcomeSeen();
    }
  }, [context.hasSeenWelcome, startAggregatedTour, context.markWelcomeSeen]);

  // Start role upgrade tour
  const startRoleUpgradeTour = useCallback(() => {
    if (pendingRoleUpgradeTour && context.lastKnownRole) {
      startAggregatedTour("role-upgrade", context.lastKnownRole);
      setPendingRoleUpgradeTour(false);
    }
  }, [pendingRoleUpgradeTour, context.lastKnownRole, startAggregatedTour]);

  // Stop current tour
  const stopTour = useCallback(() => {
    context.stopTour();
  }, [context.stopTour]);

  // Reset all tour progress
  const resetAllTours = useCallback(() => {
    context.resetAllTours();
    setPendingRoleUpgradeTour(false);
  }, [context.resetAllTours]);

  // Check if a mini tour has been completed
  const isMiniTourCompleted = useCallback(
    (tourId: MiniTourId) => {
      return context.completedTours.includes(tourId);
    },
    [context.completedTours]
  );

  // Get available mini tours for current role
  const getAvailableMiniTours = useCallback(() => {
    if (!effectiveRole) return [];
    return getMiniToursForRole(effectiveRole as UserRole);
  }, [effectiveRole]);

  // Get new capabilities from role upgrade
  const getNewCapabilitiesForUpgrade = useCallback(() => {
    if (!effectiveRole || !context.lastKnownRole) return [];
    return getNewCapabilities(context.lastKnownRole, effectiveRole as UserRole);
  }, [effectiveRole, context.lastKnownRole]);

  // Modal registration (for pages to register their modals)
  const registerModal = useCallback(
    (id: string, controls: ModalControls) => {
      context.registerModal(id, controls);
    },
    [context.registerModal]
  );

  const unregisterModal = useCallback(
    (id: string) => {
      context.unregisterModal(id);
    },
    [context.unregisterModal]
  );

  return {
    // Tour control
    startMiniTour,
    startAggregatedTour,
    startTourSequence,
    startWelcomeTour,
    startRoleUpgradeTour,
    stopTour,
    resetAllTours,

    // State
    isRunning: context.isRunning,
    currentTourId: context.tourId,
    currentStep: context.currentStep,
    currentStepIndex: context.currentStepIndex,
    totalSteps: context.steps.length,
    hasSeenWelcome: context.hasSeenWelcome,
    pendingRoleUpgradeTour,
    completedMiniTours: context.completedTours,

    // Navigation
    nextStep: context.nextStep,
    prevStep: context.prevStep,
    goToStep: context.goToStep,

    // Helpers
    isMiniTourCompleted,
    getAvailableMiniTours,
    getNewCapabilitiesForUpgrade,

    // Modal registration
    registerModal,
    unregisterModal,
  };
}
