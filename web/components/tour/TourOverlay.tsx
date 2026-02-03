"use client";

import { useEffect, useState, useCallback } from "react";
import { useTourContext } from "./TourProvider";
import { resolveSelector } from "@/lib/tour-engine";

interface ElementRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function TourOverlay() {
  const { isRunning, currentStep, stopTour } = useTourContext();
  const [targetRect, setTargetRect] = useState<ElementRect | null>(null);

  const updateTargetRect = useCallback(() => {
    const elementSelector = resolveSelector(currentStep?.element);
    if (!elementSelector) {
      setTargetRect(null);
      return;
    }

    const element = document.querySelector(elementSelector);
    if (element) {
      const rect = element.getBoundingClientRect();
      const padding = 8; // Spotlight padding
      setTargetRect({
        x: rect.left - padding,
        y: rect.top - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      });
    } else {
      setTargetRect(null);
    }
  }, [currentStep?.element]);

  // Update rect on step change and set up observers
  useEffect(() => {
    if (!isRunning) {
      setTargetRect(null);
      return;
    }

    // Small delay to let the DOM settle after navigation/modal opens
    const timer = setTimeout(updateTargetRect, 100);

    // Set up resize observer for the target element
    const resizeObserver = new ResizeObserver(updateTargetRect);
    const mutationObserver = new MutationObserver(updateTargetRect);

    const elementSelector = resolveSelector(currentStep?.element);
    if (elementSelector) {
      const element = document.querySelector(elementSelector);
      if (element) {
        resizeObserver.observe(element);
      }
    }

    // Observe body for DOM changes that might affect element position
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    // Update on scroll
    const handleScroll = () => updateTargetRect();
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll);

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isRunning, currentStep?.element, updateTargetRect]);

  if (!isRunning) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    // Only stop tour if clicking directly on overlay, not on spotlight area
    if (e.target === e.currentTarget) {
      stopTour();
    }
  };

  return (
    <div
      className="tour-overlay"
      onClick={handleOverlayClick}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99990,
        pointerEvents: isRunning ? "auto" : "none",
      }}
    >
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <mask id="tour-spotlight-mask">
            {/* White background = visible area */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black spotlight = cut out area */}
            {targetRect && (
              <rect
                x={targetRect.x}
                y={targetRect.y}
                width={targetRect.width}
                height={targetRect.height}
                rx="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        {/* Dark overlay with spotlight cut out */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.75)"
          mask="url(#tour-spotlight-mask)"
        />
      </svg>

      {/* Spotlight highlight border */}
      {targetRect && (
        <div
          className="tour-spotlight-highlight"
          style={{
            position: "absolute",
            left: targetRect.x,
            top: targetRect.y,
            width: targetRect.width,
            height: targetRect.height,
            borderRadius: "12px",
            border: "2px solid rgba(255, 210, 0, 0.6)",
            boxShadow: "0 0 0 4px rgba(255, 210, 0, 0.15), 0 0 20px rgba(255, 210, 0, 0.2)",
            pointerEvents: "none",
            transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      )}
    </div>
  );
}
