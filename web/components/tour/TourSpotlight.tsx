"use client";

import { useEffect, useState, useCallback, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useTourContext } from "./TourProvider";
import { resolveSelector } from "@/lib/tour-engine";

interface SpotlightCloneProps {
  children: ReactNode;
}

/**
 * TourSpotlight creates an elevated clone of the target element
 * that appears above the overlay for full interactivity during tours.
 *
 * This is an alternative approach to the SVG mask technique.
 * Use when you need the highlighted element to be fully interactive.
 */
export function TourSpotlight() {
  const { isRunning, currentStep } = useTourContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Resolve the element selector for the current viewport
  const elementSelector = resolveSelector(currentStep?.element);

  // If the current step allows interaction, we need to elevate the element
  if (!isRunning || !currentStep?.allowInteraction || !elementSelector) {
    return null;
  }

  if (!mounted) return null;

  const portalRoot = document.getElementById("tour-root");
  if (!portalRoot) return null;

  return createPortal(
    <SpotlightInteractive elementSelector={elementSelector} />,
    portalRoot
  );
}

interface SpotlightInteractiveProps {
  elementSelector: string;
}

function SpotlightInteractive({ elementSelector }: SpotlightInteractiveProps) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  const updateRect = useCallback(() => {
    const element = document.querySelector(elementSelector);
    if (element) {
      setRect(element.getBoundingClientRect());
    }
  }, [elementSelector]);

  useEffect(() => {
    updateRect();

    const resizeObserver = new ResizeObserver(updateRect);
    const element = document.querySelector(elementSelector);
    if (element) {
      resizeObserver.observe(element);
    }

    window.addEventListener("scroll", updateRect, true);
    window.addEventListener("resize", updateRect);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("resize", updateRect);
    };
  }, [elementSelector, updateRect]);

  if (!rect) return null;

  const padding = 8;

  // Create a transparent "pass-through" area over the highlighted element
  // This allows clicks to pass through to the actual element below
  return (
    <div
      style={{
        position: "fixed",
        left: rect.left - padding,
        top: rect.top - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
        zIndex: 99995,
        borderRadius: "12px",
        pointerEvents: "auto",
        cursor: "pointer",
      }}
      onClick={(e) => {
        // Pass the click through to the actual element
        const element = document.querySelector(elementSelector);
        if (element instanceof HTMLElement) {
          // Find the actual clickable element inside if needed
          const clickTarget = element.querySelector("button, a, [role='button']") || element;
          if (clickTarget instanceof HTMLElement) {
            clickTarget.click();
          }
        }
      }}
    />
  );
}

export default TourSpotlight;
