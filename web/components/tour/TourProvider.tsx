"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import type { TourStep, TourAction, ModalControls } from "@/lib/tour-engine";
import { resolveSelector } from "@/lib/tour-engine";

// Storage keys
const COMPLETED_TOURS_KEY = "pucmm-band-tours-completed-v4";
const WELCOME_SEEN_KEY = "pucmm-band-welcome-seen-v4";
const LAST_ROLE_KEY = "pucmm-band-last-role";

export type MiniTourId =
  | "nav-overview"
  | "songs-browse"
  | "songs-suggest"
  | "songs-vote"
  | "songs-admin"
  | "songs-details"
  | "events-browse"
  | "events-admin"
  | "events-setlist"
  | "concerts-browse"
  | "concerts-admin"
  | "profile-edit"
  | "users-admin";

export type AggregatedTourId = "welcome" | "role-upgrade";
export type TourId = MiniTourId | AggregatedTourId;
export type UserRole = "SUPERADMIN" | "SECTION_LEADER" | "MEMBER" | "ALUMNI_GUEST";

interface TourContextType {
  // Tour state
  isRunning: boolean;
  currentStepIndex: number;
  currentStep: TourStep | null;
  steps: TourStep[];
  tourId: TourId | null;

  // Tour control
  startTour: (tourId: TourId, steps: TourStep[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  stopTour: () => void;
  goToStep: (index: number) => void;

  // Modal registry
  registerModal: (id: string, controls: ModalControls) => void;
  unregisterModal: (id: string) => void;
  openModal: (id: string) => Promise<boolean>;
  closeModal: (id: string) => Promise<boolean>;
  closeAllModals: () => void;

  // Persistence
  hasSeenWelcome: boolean;
  completedTours: MiniTourId[];
  markTourCompleted: (tourId: MiniTourId) => void;
  markWelcomeSeen: () => void;
  resetAllTours: () => void;

  // Role tracking
  lastKnownRole: UserRole | null;
  saveRole: (role: UserRole) => void;
}

const TourContext = createContext<TourContextType | null>(null);

interface TourProviderProps {
  children: ReactNode;
}

export function TourProvider({ children }: TourProviderProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Tour state
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [tourId, setTourId] = useState<TourId | null>(null);

  // Modal registry
  const modalRegistryRef = useRef<Map<string, ModalControls>>(new Map());

  // Persistence state
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
  const [completedTours, setCompletedTours] = useState<MiniTourId[]>([]);
  const [lastKnownRole, setLastKnownRole] = useState<UserRole | null>(null);

  // Navigation tracking
  const pendingNavigationRef = useRef<string | null>(null);
  const actionQueueRef = useRef<TourAction[]>([]);

  // Load persisted state on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedTours = localStorage.getItem(COMPLETED_TOURS_KEY);
      const storedWelcome = localStorage.getItem(WELCOME_SEEN_KEY);
      const storedRole = localStorage.getItem(LAST_ROLE_KEY);

      if (storedTours) {
        setCompletedTours(JSON.parse(storedTours));
      }
      setHasSeenWelcome(storedWelcome === "true");
      if (storedRole) {
        setLastKnownRole(storedRole as UserRole);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Handle navigation completion
  useEffect(() => {
    if (pendingNavigationRef.current && pathname === pendingNavigationRef.current) {
      pendingNavigationRef.current = null;
      // Process any pending actions after navigation
      processActionQueue();
    }
  }, [pathname]);

  const processActionQueue = useCallback(async () => {
    while (actionQueueRef.current.length > 0) {
      const action = actionQueueRef.current.shift();
      if (action) {
        await executeAction(action);
      }
    }
  }, []);

  const executeAction = useCallback(async (action: TourAction): Promise<boolean> => {
    switch (action.type) {
      case "navigate": {
        if (pathname !== action.path) {
          pendingNavigationRef.current = action.path;
          router.push(action.path);
          // Wait for navigation
          return new Promise((resolve) => {
            const checkNavigation = setInterval(() => {
              if (pendingNavigationRef.current === null) {
                clearInterval(checkNavigation);
                resolve(true);
              }
            }, 100);
            // Timeout after 5 seconds
            setTimeout(() => {
              clearInterval(checkNavigation);
              pendingNavigationRef.current = null;
              resolve(false);
            }, 5000);
          });
        }
        return true;
      }

      case "click": {
        const element = document.querySelector(action.selector);
        if (element instanceof HTMLElement) {
          element.click();
          return true;
        }
        return false;
      }

      case "open-modal": {
        const controls = modalRegistryRef.current.get(action.modalId);
        if (controls) {
          await controls.open();
          return true;
        }
        return false;
      }

      case "close-modal": {
        if (action.modalId) {
          const controls = modalRegistryRef.current.get(action.modalId);
          if (controls) {
            await controls.close();
            return true;
          }
        }
        return false;
      }

      case "wait": {
        const timeout = action.timeout || 3000;
        const startTime = Date.now();
        return new Promise((resolve) => {
          const checkElement = setInterval(() => {
            const element = document.querySelector(action.selector);
            if (element) {
              clearInterval(checkElement);
              resolve(true);
            } else if (Date.now() - startTime > timeout) {
              clearInterval(checkElement);
              resolve(false);
            }
          }, 100);
        });
      }

      case "scroll": {
        const element = document.querySelector(action.selector);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          return true;
        }
        return false;
      }

      default:
        return false;
    }
  }, [pathname, router]);

  const executeActions = useCallback(async (actions: TourAction[]): Promise<boolean> => {
    for (const action of actions) {
      const success = await executeAction(action);
      if (!success) {
        console.warn("[Tour] Action failed:", action);
      }
    }
    return true;
  }, [executeAction]);

  const waitForElement = useCallback(async (selector: string, timeout = 3000): Promise<boolean> => {
    const startTime = Date.now();
    return new Promise((resolve) => {
      const checkElement = setInterval(() => {
        const element = document.querySelector(selector);
        if (element) {
          clearInterval(checkElement);
          resolve(true);
        } else if (Date.now() - startTime > timeout) {
          clearInterval(checkElement);
          resolve(false);
        }
      }, 100);
    });
  }, []);

  // Helper to check if a step should be skipped (e.g., mobile-only step on desktop)
  const shouldSkipStep = useCallback((step: TourStep): boolean => {
    if (!step.element) return false;
    const resolved = resolveSelector(step.element);
    // Skip if selector resolves to empty string (viewport-specific step not applicable)
    return resolved === "";
  }, []);

  // Tour control functions
  const startTour = useCallback(async (id: TourId, tourSteps: TourStep[]) => {
    if (tourSteps.length === 0) return;

    // Find the first non-skipped step
    let startIndex = 0;
    while (startIndex < tourSteps.length && shouldSkipStep(tourSteps[startIndex])) {
      startIndex++;
    }

    if (startIndex >= tourSteps.length) return;

    setTourId(id);
    setSteps(tourSteps);
    setCurrentStepIndex(startIndex);
    setIsRunning(true);

    // Execute beforeShow actions for first step
    const firstStep = tourSteps[startIndex];
    if (firstStep.beforeShow) {
      await executeActions(firstStep.beforeShow);
    }

    // Wait for element if specified
    if (firstStep.waitFor) {
      await waitForElement(firstStep.waitFor);
    }
  }, [executeActions, waitForElement, shouldSkipStep]);

  const nextStep = useCallback(async () => {
    const currentStep = steps[currentStepIndex];

    // Execute onNext actions for current step
    if (currentStep?.onNext) {
      await executeActions(currentStep.onNext);
    }

    let nextIndex = currentStepIndex + 1;

    // Skip steps that don't apply to current viewport
    while (nextIndex < steps.length && shouldSkipStep(steps[nextIndex])) {
      nextIndex++;
    }

    if (nextIndex >= steps.length) {
      // Tour completed
      stopTour();
      return;
    }

    const nextStepData = steps[nextIndex];

    // Execute beforeShow actions for next step
    if (nextStepData.beforeShow) {
      await executeActions(nextStepData.beforeShow);
    }

    // Wait for element if specified
    if (nextStepData.waitFor) {
      await waitForElement(nextStepData.waitFor);
    }

    setCurrentStepIndex(nextIndex);
  }, [currentStepIndex, steps, executeActions, waitForElement, shouldSkipStep]);

  const prevStep = useCallback(async () => {
    if (currentStepIndex <= 0) return;

    let prevIndex = currentStepIndex - 1;

    // Skip steps that don't apply to current viewport
    while (prevIndex >= 0 && shouldSkipStep(steps[prevIndex])) {
      prevIndex--;
    }

    if (prevIndex < 0) return;

    const prevStepData = steps[prevIndex];

    // Execute beforeShow actions for previous step
    if (prevStepData.beforeShow) {
      await executeActions(prevStepData.beforeShow);
    }

    // Wait for element if specified
    if (prevStepData.waitFor) {
      await waitForElement(prevStepData.waitFor);
    }

    setCurrentStepIndex(prevIndex);
  }, [currentStepIndex, steps, executeActions, waitForElement, shouldSkipStep]);

  const stopTour = useCallback(() => {
    // Close any open modals
    closeAllModals();

    setIsRunning(false);
    setCurrentStepIndex(0);
    setSteps([]);
    setTourId(null);
  }, []);

  const goToStep = useCallback(async (index: number) => {
    if (index < 0 || index >= steps.length) return;

    const targetStep = steps[index];

    if (targetStep.beforeShow) {
      await executeActions(targetStep.beforeShow);
    }

    if (targetStep.waitFor) {
      await waitForElement(targetStep.waitFor);
    }

    setCurrentStepIndex(index);
  }, [steps, executeActions, waitForElement]);

  // Modal registry functions
  const registerModal = useCallback((id: string, controls: ModalControls) => {
    modalRegistryRef.current.set(id, controls);
  }, []);

  const unregisterModal = useCallback((id: string) => {
    modalRegistryRef.current.delete(id);
  }, []);

  const openModal = useCallback(async (id: string): Promise<boolean> => {
    const controls = modalRegistryRef.current.get(id);
    if (controls) {
      await controls.open();
      return true;
    }
    return false;
  }, []);

  const closeModal = useCallback(async (id: string): Promise<boolean> => {
    const controls = modalRegistryRef.current.get(id);
    if (controls) {
      await controls.close();
      return true;
    }
    return false;
  }, []);

  const closeAllModals = useCallback(() => {
    modalRegistryRef.current.forEach((controls) => {
      controls.close();
    });
  }, []);

  // Persistence functions
  const markTourCompleted = useCallback((id: MiniTourId) => {
    setCompletedTours((prev) => {
      if (prev.includes(id)) return prev;
      const newCompleted = [...prev, id];
      localStorage.setItem(COMPLETED_TOURS_KEY, JSON.stringify(newCompleted));
      return newCompleted;
    });
  }, []);

  const markWelcomeSeen = useCallback(() => {
    setHasSeenWelcome(true);
    localStorage.setItem(WELCOME_SEEN_KEY, "true");
  }, []);

  const saveRole = useCallback((role: UserRole) => {
    setLastKnownRole(role);
    localStorage.setItem(LAST_ROLE_KEY, role);
  }, []);

  const resetAllTours = useCallback(() => {
    setCompletedTours([]);
    setHasSeenWelcome(false);
    localStorage.removeItem(COMPLETED_TOURS_KEY);
    localStorage.removeItem(WELCOME_SEEN_KEY);
  }, []);

  const currentStep = steps[currentStepIndex] || null;

  const value: TourContextType = {
    isRunning,
    currentStepIndex,
    currentStep,
    steps,
    tourId,
    startTour,
    nextStep,
    prevStep,
    stopTour,
    goToStep,
    registerModal,
    unregisterModal,
    openModal,
    closeModal,
    closeAllModals,
    hasSeenWelcome,
    completedTours,
    markTourCompleted,
    markWelcomeSeen,
    resetAllTours,
    lastKnownRole,
    saveRole,
  };

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTourContext() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error("useTourContext must be used within a TourProvider");
  }
  return context;
}
