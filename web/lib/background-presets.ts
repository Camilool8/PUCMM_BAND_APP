// Home background presets configuration
// Users can choose from these presets or upload a custom image

export interface BackgroundPreset {
  id: string;
  name: string;
  description: string;
  // CSS gradient or image styling
  style: {
    background: string;
    // Optional additional layers
    overlay?: string;
  };
  // Preview thumbnail gradient (simplified for selection UI)
  preview: string;
}

// Default background - attractive PUCMM-themed gradient
export const DEFAULT_BACKGROUND_ID = "pucmm-night";

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: "pucmm-night",
    name: "PUCMM Nocturno",
    description: "Azul institucional con destellos dorados",
    style: {
      background: `
        radial-gradient(ellipse at 20% 0%, rgba(0, 51, 160, 0.4) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 20%, rgba(255, 210, 0, 0.15) 0%, transparent 40%),
        radial-gradient(ellipse at 40% 80%, rgba(79, 70, 229, 0.2) 0%, transparent 50%),
        radial-gradient(ellipse at 90% 90%, rgba(0, 51, 160, 0.3) 0%, transparent 40%)
      `,
    },
    preview: "linear-gradient(135deg, #0033A0 0%, #1a1a2e 50%, #FFD200 100%)",
  },
  {
    id: "aurora",
    name: "Aurora Boreal",
    description: "Tonos verdes y azules vibrantes",
    style: {
      background: `
        radial-gradient(ellipse at 10% 20%, rgba(16, 185, 129, 0.3) 0%, transparent 50%),
        radial-gradient(ellipse at 70% 10%, rgba(6, 182, 212, 0.25) 0%, transparent 45%),
        radial-gradient(ellipse at 30% 70%, rgba(79, 70, 229, 0.2) 0%, transparent 50%),
        radial-gradient(ellipse at 90% 80%, rgba(16, 185, 129, 0.2) 0%, transparent 40%)
      `,
    },
    preview: "linear-gradient(135deg, #10B981 0%, #0891B2 50%, #4F46E5 100%)",
  },
  {
    id: "sunset",
    name: "Atardecer",
    description: "Naranjas y rosas cálidos",
    style: {
      background: `
        radial-gradient(ellipse at 0% 0%, rgba(251, 146, 60, 0.3) 0%, transparent 50%),
        radial-gradient(ellipse at 100% 30%, rgba(236, 72, 153, 0.25) 0%, transparent 45%),
        radial-gradient(ellipse at 50% 100%, rgba(239, 68, 68, 0.2) 0%, transparent 50%),
        radial-gradient(ellipse at 20% 60%, rgba(251, 146, 60, 0.15) 0%, transparent 40%)
      `,
    },
    preview: "linear-gradient(135deg, #FB923C 0%, #EC4899 50%, #EF4444 100%)",
  },
  {
    id: "midnight",
    name: "Medianoche",
    description: "Azules profundos y púrpuras",
    style: {
      background: `
        radial-gradient(ellipse at 30% 10%, rgba(99, 102, 241, 0.25) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 50%, rgba(139, 92, 246, 0.2) 0%, transparent 45%),
        radial-gradient(ellipse at 10% 80%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
        radial-gradient(ellipse at 60% 90%, rgba(99, 102, 241, 0.15) 0%, transparent 40%)
      `,
    },
    preview: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #3B82F6 100%)",
  },
  {
    id: "forest",
    name: "Bosque",
    description: "Verdes naturales y terrosos",
    style: {
      background: `
        radial-gradient(ellipse at 20% 20%, rgba(34, 197, 94, 0.25) 0%, transparent 50%),
        radial-gradient(ellipse at 70% 30%, rgba(16, 185, 129, 0.2) 0%, transparent 45%),
        radial-gradient(ellipse at 40% 80%, rgba(20, 184, 166, 0.2) 0%, transparent 50%),
        radial-gradient(ellipse at 90% 70%, rgba(34, 197, 94, 0.15) 0%, transparent 40%)
      `,
    },
    preview: "linear-gradient(135deg, #22C55E 0%, #10B981 50%, #14B8A6 100%)",
  },
  {
    id: "cherry",
    name: "Cereza",
    description: "Rojos y rosas intensos",
    style: {
      background: `
        radial-gradient(ellipse at 10% 10%, rgba(239, 68, 68, 0.3) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 20%, rgba(236, 72, 153, 0.25) 0%, transparent 45%),
        radial-gradient(ellipse at 30% 70%, rgba(244, 63, 94, 0.2) 0%, transparent 50%),
        radial-gradient(ellipse at 90% 90%, rgba(239, 68, 68, 0.2) 0%, transparent 40%)
      `,
    },
    preview: "linear-gradient(135deg, #EF4444 0%, #EC4899 50%, #F43F5E 100%)",
  },
  {
    id: "ocean",
    name: "Océano",
    description: "Azules y turquesas marinos",
    style: {
      background: `
        radial-gradient(ellipse at 0% 30%, rgba(6, 182, 212, 0.3) 0%, transparent 50%),
        radial-gradient(ellipse at 60% 10%, rgba(59, 130, 246, 0.25) 0%, transparent 45%),
        radial-gradient(ellipse at 80% 70%, rgba(14, 165, 233, 0.2) 0%, transparent 50%),
        radial-gradient(ellipse at 20% 90%, rgba(6, 182, 212, 0.2) 0%, transparent 40%)
      `,
    },
    preview: "linear-gradient(135deg, #06B6D4 0%, #3B82F6 50%, #0EA5E9 100%)",
  },
  {
    id: "golden",
    name: "Dorado",
    description: "Amarillos y ámbar elegantes",
    style: {
      background: `
        radial-gradient(ellipse at 20% 10%, rgba(245, 158, 11, 0.3) 0%, transparent 50%),
        radial-gradient(ellipse at 70% 40%, rgba(251, 191, 36, 0.25) 0%, transparent 45%),
        radial-gradient(ellipse at 30% 80%, rgba(234, 179, 8, 0.2) 0%, transparent 50%),
        radial-gradient(ellipse at 90% 70%, rgba(245, 158, 11, 0.15) 0%, transparent 40%)
      `,
    },
    preview: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 50%, #EAB308 100%)",
  },
  {
    id: "minimal",
    name: "Minimalista",
    description: "Gris sutil y elegante",
    style: {
      background: `
        radial-gradient(ellipse at 30% 20%, rgba(107, 114, 128, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse at 70% 70%, rgba(75, 85, 99, 0.1) 0%, transparent 45%)
      `,
    },
    preview: "linear-gradient(135deg, #374151 0%, #1F2937 50%, #4B5563 100%)",
  },
];

// Helper function to get a preset by ID
export function getBackgroundPreset(id: string | null | undefined): BackgroundPreset | null {
  if (!id) return null;
  return BACKGROUND_PRESETS.find((p) => p.id === id) || null;
}

// Helper function to check if a value is a preset ID or a custom URL
export function isPresetBackground(value: string | null | undefined): boolean {
  if (!value) return false;
  return BACKGROUND_PRESETS.some((p) => p.id === value);
}

// Helper function to check if value is a custom image URL
export function isCustomImageBackground(value: string | null | undefined): boolean {
  if (!value) return false;
  return !isPresetBackground(value) && (value.startsWith("http") || value.startsWith("/uploads"));
}

// CSS properties type for SSR compatibility
type CSSProperties = Record<string, string | number | undefined>;

// Get the CSS styles for a background value (preset or custom image)
export function getBackgroundStyles(value: string | null | undefined): CSSProperties {
  // Default background
  if (!value) {
    const defaultPreset = getBackgroundPreset(DEFAULT_BACKGROUND_ID);
    return defaultPreset ? { background: defaultPreset.style.background } : {};
  }

  // Check if it's a preset
  const preset = getBackgroundPreset(value);
  if (preset) {
    return { background: preset.style.background };
  }

  // It's a custom image URL
  return {
    backgroundImage: `url(${value})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
}

// For custom images, we need additional blur overlay
export function getCustomImageOverlayStyles(): CSSProperties {
  return {
    backdropFilter: "blur(40px)",
    WebkitBackdropFilter: "blur(40px)",
  };
}
