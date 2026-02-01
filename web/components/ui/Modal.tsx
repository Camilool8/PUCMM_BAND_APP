"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import FocusTrap from "focus-trap-react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// Modal Context
// ============================================================================

interface ModalContextValue {
  onClose: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

function useModalContext() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("Modal compound components must be used within a Modal");
  }
  return context;
}

// ============================================================================
// Types
// ============================================================================

type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  size?: ModalSize;
  children: ReactNode;
  className?: string;
  showCloseButton?: boolean;
  closeOnEscape?: boolean;
  closeOnBackdrop?: boolean;
}

interface ModalHeaderProps {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  subtitle?: string;
}

interface ModalBodyProps {
  children: ReactNode;
  className?: string;
}

interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

// ============================================================================
// Size Variants
// ============================================================================

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-[95vw] md:max-w-[90vw]",
};

// ============================================================================
// Hooks
// ============================================================================

function useLockBodyScroll(lock: boolean) {
  useEffect(() => {
    if (!lock) return;

    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [lock]);
}

function usePortalRoot() {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let root = document.getElementById("modal-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "modal-root";
      document.body.appendChild(root);
    }
    setPortalRoot(root);
  }, []);

  return portalRoot;
}

// ============================================================================
// Main Modal Component
// ============================================================================

function Modal({
  isOpen,
  onClose,
  size = "md",
  children,
  className,
  showCloseButton = true,
  closeOnEscape = true,
  closeOnBackdrop = true,
}: ModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const portalRoot = usePortalRoot();

  useLockBodyScroll(isOpen);

  // Handle open/close animation states
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay to ensure DOM is ready for animation
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      // Wait for exit animation before unmounting
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Escape key handler
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === "Escape") {
        onClose();
      }
    },
    [closeOnEscape, onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, handleEscape]);

  // Backdrop click handler
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!portalRoot || !shouldRender) return null;

  const modalContent = (
    <ModalContext.Provider value={{ onClose }}>
      <FocusTrap
        active={isOpen}
        focusTrapOptions={{
          allowOutsideClick: true,
          escapeDeactivates: false, // We handle escape ourselves
          fallbackFocus: "[data-modal-container]",
        }}
      >
        <div
          className={cn(
            "fixed inset-0 z-9999 flex items-center justify-center p-4",
            "transition-opacity duration-200 ease-out",
            isAnimating ? "opacity-100" : "opacity-0",
          )}
          onClick={handleBackdropClick}
          data-modal-backdrop
        >
          {/* Backdrop */}
          <div
            className={cn(
              "absolute inset-0 bg-black/70 backdrop-blur-xl",
              "transition-opacity duration-200",
              isAnimating ? "opacity-100" : "opacity-0",
            )}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div
            role="dialog"
            aria-modal="true"
            data-modal-container
            tabIndex={-1}
            className={cn(
              // Base styles
              "relative w-full",
              sizeClasses[size],
              // Visual styles
              "bg-surface-50/95 backdrop-blur-2xl",
              "border border-white/10",
              "rounded-2xl md:rounded-3xl",
              "shadow-2xl shadow-black/50",
              // Animation
              "transition-all duration-300 ease-out",
              isAnimating
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 translate-y-3",
              // Layout
              "max-h-[90vh] flex flex-col overflow-hidden",
              className,
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            {showCloseButton && (
              <button
                onClick={onClose}
                className={cn(
                  "absolute top-4 right-4 z-10",
                  "p-2 rounded-full",
                  "bg-white/5 hover:bg-white/10",
                  "text-gray-400 hover:text-white",
                  "transition-all duration-150",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow",
                )}
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            )}

            {children}
          </div>
        </div>
      </FocusTrap>
    </ModalContext.Provider>
  );

  return createPortal(modalContent, portalRoot);
}

// ============================================================================
// Compound Components
// ============================================================================

function ModalHeader({
  children,
  className,
  icon,
  subtitle,
}: ModalHeaderProps) {
  return (
    <div
      className={cn(
        "shrink-0 px-6 pt-6 pb-4",
        "border-b border-white/5",
        className,
      )}
    >
      <div className="flex items-start gap-4 pr-8">
        {icon && (
          <div className="shrink-0 w-12 h-12 rounded-xl bg-brand-blue-primary/20 flex items-center justify-center text-brand-blue-primary">
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="text-xl md:text-2xl font-bold text-white truncate">
            {children}
          </h2>
          {subtitle && (
            <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ModalBody({ children, className }: ModalBodyProps) {
  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto",
        "px-6 py-4",
        "scrollbar-hide",
        className,
      )}
    >
      {children}
    </div>
  );
}

function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div
      className={cn(
        "shrink-0 px-6 py-4",
        "border-t border-white/5",
        "bg-surface-100/30",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Attach compound components
// ============================================================================

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export { Modal, useModalContext };
export type { ModalProps, ModalSize };
