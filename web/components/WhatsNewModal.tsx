"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/hooks/use-auth";
import { useTour } from "@/hooks/use-tour";
import {
  Sparkles,
  ClipboardCheck,
  Music,
  Headphones,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import {
  APP_VERSION,
  releaseNotes,
  getSeenVersion,
  markVersionSeen,
  type ReleaseHighlight,
} from "@/lib/release-notes";

const ICON_MAP: Record<string, LucideIcon> = {
  ClipboardCheck,
  Music,
  Headphones,
  GraduationCap,
  Sparkles,
};

const ICON_COLORS: Record<string, string> = {
  ClipboardCheck: "text-emerald-400 bg-emerald-400/10",
  Music: "text-brand-yellow bg-brand-yellow/10",
  Headphones: "text-purple-400 bg-purple-400/10",
  GraduationCap: "text-blue-400 bg-blue-400/10",
  Sparkles: "text-amber-400 bg-amber-400/10",
};

function HighlightItem({ highlight }: { highlight: ReleaseHighlight }) {
  const Icon = ICON_MAP[highlight.icon] || Sparkles;
  const colorClass = ICON_COLORS[highlight.icon] || "text-gray-400 bg-gray-400/10";

  return (
    <div className="flex gap-3 p-3 rounded-xl bg-surface-100/40 border border-surface-200/30">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="text-sm font-semibold text-white">{highlight.title}</h4>
        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{highlight.description}</p>
      </div>
    </div>
  );
}

export default function WhatsNewModal() {
  const { isAuthenticated, isLoading } = useAuth();
  const { hasSeenWelcome, isRunning: isTourRunning } = useTour();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || isLoading || isTourRunning || !hasSeenWelcome) return;

    const seenVersion = getSeenVersion();
    if (seenVersion !== APP_VERSION) {
      // Small delay to avoid clashing with other modals/tours
      const timer = setTimeout(() => setIsOpen(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, isTourRunning, hasSeenWelcome]);

  const handleDismiss = () => {
    markVersionSeen(APP_VERSION);
    setIsOpen(false);
  };

  const currentRelease = releaseNotes.find((r) => r.version === APP_VERSION);
  if (!currentRelease) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleDismiss} size="md">
      <Modal.Header
        icon={<Sparkles className="text-brand-yellow" />}
        subtitle={`v${currentRelease.version} - ${currentRelease.date}`}
      >
        {currentRelease.title}
      </Modal.Header>
      <Modal.Body className="space-y-3">
        {currentRelease.highlights.map((highlight, idx) => (
          <HighlightItem key={idx} highlight={highlight} />
        ))}
      </Modal.Body>
      <div className="shrink-0 px-6 py-4 border-t border-white/5 bg-surface-100/30">
        <button
          onClick={handleDismiss}
          className="w-full py-2.5 rounded-xl bg-brand-yellow text-surface-0 font-semibold text-sm hover:bg-brand-yellow/90 transition-all active:scale-[0.98]"
        >
          Entendido
        </button>
      </div>
    </Modal>
  );
}
