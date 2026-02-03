"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTourContext } from "./TourProvider";
import { resolveSelector } from "@/lib/tour-engine";

type PopoverSide = "top" | "bottom" | "left" | "right";

interface Position {
  x: number;
  y: number;
  side: PopoverSide;
  arrowX?: number;
}

const POPOVER_MARGIN = 16;
const ARROW_SIZE = 10;

export function TourPopover() {
  const {
    isRunning,
    currentStep,
    currentStepIndex,
    steps,
    nextStep,
    prevStep,
    stopTour,
  } = useTourContext();

  const [position, setPosition] = useState<Position | null>(null);
  const [mounted, setMounted] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const calculatePosition = useCallback(() => {
    if (!currentStep || !popoverRef.current) return;

    const popoverRect = popoverRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Resolve responsive selector
    const elementSelector = resolveSelector(currentStep.element);

    // If no element, center the popover
    if (!elementSelector) {
      setPosition({
        x: (viewportWidth - popoverRect.width) / 2,
        y: (viewportHeight - popoverRect.height) / 2,
        side: "bottom",
      });
      return;
    }

    const element = document.querySelector(elementSelector);
    if (!element) {
      // Element not found, center the popover
      setPosition({
        x: (viewportWidth - popoverRect.width) / 2,
        y: (viewportHeight - popoverRect.height) / 2,
        side: "bottom",
      });
      return;
    }

    const targetRect = element.getBoundingClientRect();
    const preferredSide = currentStep.popover?.side || "bottom";

    // Calculate available space on each side
    const spaceTop = targetRect.top - POPOVER_MARGIN;
    const spaceBottom = viewportHeight - targetRect.bottom - POPOVER_MARGIN;
    const spaceLeft = targetRect.left - POPOVER_MARGIN;
    const spaceRight = viewportWidth - targetRect.right - POPOVER_MARGIN;

    // Determine best side based on available space
    let side = preferredSide;
    const popoverHeight = popoverRect.height;
    const popoverWidth = popoverRect.width;

    // Check if preferred side has enough space
    if (side === "top" && spaceTop < popoverHeight) {
      side = spaceBottom >= popoverHeight ? "bottom" : (spaceTop > spaceBottom ? "top" : "bottom");
    } else if (side === "bottom" && spaceBottom < popoverHeight) {
      side = spaceTop >= popoverHeight ? "top" : (spaceBottom > spaceTop ? "bottom" : "top");
    } else if (side === "left" && spaceLeft < popoverWidth) {
      side = spaceRight >= popoverWidth ? "right" : (spaceLeft > spaceRight ? "left" : "right");
    } else if (side === "right" && spaceRight < popoverWidth) {
      side = spaceLeft >= popoverWidth ? "left" : (spaceRight > spaceLeft ? "right" : "left");
    }

    // Calculate position based on side
    let x = 0;
    let y = 0;
    let arrowX: number | undefined;

    const padding = 8; // Padding around highlighted element

    switch (side) {
      case "top":
        x = targetRect.left + (targetRect.width - popoverWidth) / 2;
        y = targetRect.top - popoverHeight - ARROW_SIZE - padding;
        break;
      case "bottom":
        x = targetRect.left + (targetRect.width - popoverWidth) / 2;
        y = targetRect.bottom + ARROW_SIZE + padding;
        break;
      case "left":
        x = targetRect.left - popoverWidth - ARROW_SIZE - padding;
        y = targetRect.top + (targetRect.height - popoverHeight) / 2;
        break;
      case "right":
        x = targetRect.right + ARROW_SIZE + padding;
        y = targetRect.top + (targetRect.height - popoverHeight) / 2;
        break;
    }

    // Clamp to viewport bounds
    const clampedX = Math.max(POPOVER_MARGIN, Math.min(x, viewportWidth - popoverWidth - POPOVER_MARGIN));
    const clampedY = Math.max(POPOVER_MARGIN, Math.min(y, viewportHeight - popoverHeight - POPOVER_MARGIN));

    // Calculate arrow offset if popover was clamped horizontally
    if (side === "top" || side === "bottom") {
      const targetCenterX = targetRect.left + targetRect.width / 2;
      arrowX = Math.max(20, Math.min(targetCenterX - clampedX, popoverWidth - 20));
    }

    setPosition({
      x: clampedX,
      y: clampedY,
      side,
      arrowX,
    });
  }, [currentStep]);

  // Recalculate position when step changes
  useEffect(() => {
    if (!isRunning || !currentStep) {
      setPosition(null);
      return;
    }

    // Wait for DOM to settle
    const timer = setTimeout(calculatePosition, 150);

    // Update on resize/scroll
    window.addEventListener("resize", calculatePosition);
    window.addEventListener("scroll", calculatePosition, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", calculatePosition);
      window.removeEventListener("scroll", calculatePosition, true);
    };
  }, [isRunning, currentStep, currentStepIndex, calculatePosition]);

  // Also recalculate when popover mounts
  useEffect(() => {
    if (popoverRef.current) {
      calculatePosition();
    }
  }, [mounted, calculatePosition]);

  if (!isRunning || !currentStep || !mounted) return null;

  const portalRoot = document.getElementById("tour-root");
  if (!portalRoot) return null;

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const totalSteps = steps.length;

  return createPortal(
    <div
      ref={popoverRef}
      className="tour-popover"
      style={{
        position: "fixed",
        left: position?.x ?? -9999,
        top: position?.y ?? -9999,
        zIndex: 99999,
        opacity: position ? 1 : 0,
        transform: `translateY(${position ? 0 : 10}px)`,
        transition: "opacity 0.2s ease, transform 0.2s ease",
      }}
    >
      {/* Close button */}
      <button
        onClick={stopTour}
        className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all z-10"
        aria-label="Cerrar tour"
      >
        <X size={16} />
      </button>

      {/* Content */}
      <div className="p-5 pr-10">
        {currentStep.popover?.title && (
          <h3 className="text-base font-semibold text-brand-yellow mb-2">
            {currentStep.popover.title}
          </h3>
        )}
        {currentStep.popover?.description && (
          <p className="text-sm text-gray-400 leading-relaxed">
            {currentStep.popover.description}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 pb-4 pt-2 border-t border-white/5 flex items-center justify-between gap-4">
        {/* Progress */}
        <span className="text-xs text-gray-500">
          {currentStepIndex + 1} de {totalSteps}
        </span>

        {/* Navigation buttons */}
        <div className="flex items-center gap-2">
          {!isFirstStep && (
            <button
              onClick={prevStep}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Anterior</span>
            </button>
          )}
          <button
            onClick={nextStep}
            className="flex items-center gap-1 px-4 py-1.5 text-sm font-semibold bg-brand-yellow text-brand-blue-primary rounded-lg hover:bg-brand-yellow/90 transition-all"
          >
            {isLastStep ? (
              "Finalizar"
            ) : (
              <>
                <span>Siguiente</span>
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Arrow */}
      {position && resolveSelector(currentStep.element) && (
        <Arrow
          side={position.side}
          offsetX={position.arrowX}
        />
      )}
    </div>,
    portalRoot
  );
}

interface ArrowProps {
  side: PopoverSide;
  offsetX?: number;
}

function Arrow({ side, offsetX }: ArrowProps) {
  const baseStyle: React.CSSProperties = {
    position: "absolute",
    width: 0,
    height: 0,
    borderStyle: "solid",
  };

  const arrowColor = "#1a1f2e"; // Match popover background

  switch (side) {
    case "top":
      return (
        <div
          style={{
            ...baseStyle,
            bottom: -ARROW_SIZE,
            left: offsetX ?? "50%",
            transform: offsetX ? "translateX(-50%)" : "translateX(-50%)",
            borderWidth: `${ARROW_SIZE}px ${ARROW_SIZE}px 0 ${ARROW_SIZE}px`,
            borderColor: `${arrowColor} transparent transparent transparent`,
          }}
        />
      );
    case "bottom":
      return (
        <div
          style={{
            ...baseStyle,
            top: -ARROW_SIZE,
            left: offsetX ?? "50%",
            transform: offsetX ? "translateX(-50%)" : "translateX(-50%)",
            borderWidth: `0 ${ARROW_SIZE}px ${ARROW_SIZE}px ${ARROW_SIZE}px`,
            borderColor: `transparent transparent ${arrowColor} transparent`,
          }}
        />
      );
    case "left":
      return (
        <div
          style={{
            ...baseStyle,
            right: -ARROW_SIZE,
            top: "50%",
            transform: "translateY(-50%)",
            borderWidth: `${ARROW_SIZE}px 0 ${ARROW_SIZE}px ${ARROW_SIZE}px`,
            borderColor: `transparent transparent transparent ${arrowColor}`,
          }}
        />
      );
    case "right":
      return (
        <div
          style={{
            ...baseStyle,
            left: -ARROW_SIZE,
            top: "50%",
            transform: "translateY(-50%)",
            borderWidth: `${ARROW_SIZE}px ${ARROW_SIZE}px ${ARROW_SIZE}px 0`,
            borderColor: `transparent ${arrowColor} transparent transparent`,
          }}
        />
      );
  }
}

export default TourPopover;
