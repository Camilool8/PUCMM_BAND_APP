/**
 * Tour Engine - Types and utilities for the custom tour system
 */

// ============================================================================
// Responsive Helpers
// ============================================================================

/**
 * Check if the viewport is mobile-sized (under 768px)
 */
export function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
}

/**
 * Get the appropriate selector based on viewport size
 * Returns mobile selector on mobile, desktop selector on desktop
 */
export function responsiveSelector(mobileSelector: string, desktopSelector: string): string {
  return isMobileViewport() ? mobileSelector : desktopSelector;
}

// ============================================================================
// Action Types
// ============================================================================

export type TourAction =
  | { type: "navigate"; path: string }
  | { type: "click"; selector: string }
  | { type: "open-modal"; modalId: string }
  | { type: "close-modal"; modalId?: string }
  | { type: "wait"; selector: string; timeout?: number }
  | { type: "scroll"; selector: string };

// ============================================================================
// Step Types
// ============================================================================

export interface TourStepPopover {
  title: string;
  description: string;
  side?: "top" | "bottom" | "left" | "right";
}

export interface ResponsiveSelector {
  mobile: string;
  desktop: string;
}

export interface TourStep {
  id: string;
  element?: string | ResponsiveSelector; // CSS selector or responsive selectors
  popover: TourStepPopover;

  // Actions
  beforeShow?: TourAction[]; // Actions to execute before showing this step
  onNext?: TourAction[]; // Actions to execute when moving to next step

  // Conditions
  waitFor?: string; // Wait for this selector before showing
  allowInteraction?: boolean; // Let user click the highlighted element
}

/**
 * Resolve a potentially responsive selector to the current viewport's selector
 */
export function resolveSelector(selector: string | ResponsiveSelector | undefined): string | undefined {
  if (!selector) return undefined;
  if (typeof selector === "string") return selector;
  return isMobileViewport() ? selector.mobile : selector.desktop;
}

// ============================================================================
// Modal Registry Types
// ============================================================================

export interface ModalControls {
  open: () => void | Promise<void>;
  close: () => void | Promise<void>;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a navigate action
 */
export function navigate(path: string): TourAction {
  return { type: "navigate", path };
}

/**
 * Create a click action
 */
export function click(selector: string): TourAction {
  return { type: "click", selector };
}

/**
 * Create an open-modal action
 */
export function openModal(modalId: string): TourAction {
  return { type: "open-modal", modalId };
}

/**
 * Create a close-modal action
 */
export function closeModal(modalId?: string): TourAction {
  return { type: "close-modal", modalId };
}

/**
 * Create a wait action
 */
export function wait(selector: string, timeout?: number): TourAction {
  return { type: "wait", selector, timeout };
}

/**
 * Create a scroll action
 */
export function scroll(selector: string): TourAction {
  return { type: "scroll", selector };
}

// ============================================================================
// Step Builder
// ============================================================================

export class TourStepBuilder {
  private step: Partial<TourStep>;

  constructor(id: string) {
    this.step = { id };
  }

  element(selector: string): this {
    this.step.element = selector;
    return this;
  }

  title(title: string): this {
    if (!this.step.popover) {
      this.step.popover = { title: "", description: "" };
    }
    this.step.popover.title = title;
    return this;
  }

  description(description: string): this {
    if (!this.step.popover) {
      this.step.popover = { title: "", description: "" };
    }
    this.step.popover.description = description;
    return this;
  }

  side(side: "top" | "bottom" | "left" | "right"): this {
    if (!this.step.popover) {
      this.step.popover = { title: "", description: "" };
    }
    this.step.popover.side = side;
    return this;
  }

  beforeShow(...actions: TourAction[]): this {
    this.step.beforeShow = actions;
    return this;
  }

  onNext(...actions: TourAction[]): this {
    this.step.onNext = actions;
    return this;
  }

  waitFor(selector: string): this {
    this.step.waitFor = selector;
    return this;
  }

  allowInteraction(allow = true): this {
    this.step.allowInteraction = allow;
    return this;
  }

  build(): TourStep {
    if (!this.step.id || !this.step.popover) {
      throw new Error("TourStep requires id and popover");
    }
    return this.step as TourStep;
  }
}

/**
 * Create a new tour step builder
 */
export function step(id: string): TourStepBuilder {
  return new TourStepBuilder(id);
}
