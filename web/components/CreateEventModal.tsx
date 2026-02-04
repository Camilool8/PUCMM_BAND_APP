"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  TreePine,
  GraduationCap,
  PartyPopper,
  Sparkles,
  Star,
  Heart,
  Zap,
  Music,
  Check,
  type LucideIcon,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { useCreateEvent, useUpdateEvent } from "@/hooks/use-events";
import type { Event } from "@/lib/api";
import { env } from "@/lib/env";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  editEvent?: Event | null;
}

// Available icons for events
const ICON_OPTIONS: { name: string; icon: LucideIcon; label: string }[] = [
  { name: "TreePine", icon: TreePine, label: "Navidad" },
  { name: "GraduationCap", icon: GraduationCap, label: "Graduación" },
  { name: "PartyPopper", icon: PartyPopper, label: "Fiesta" },
  { name: "Sparkles", icon: Sparkles, label: "Especial" },
  { name: "Calendar", icon: Calendar, label: "Calendario" },
  { name: "Music", icon: Music, label: "Música" },
  { name: "Star", icon: Star, label: "Estrella" },
  { name: "Heart", icon: Heart, label: "Corazón" },
  { name: "Zap", icon: Zap, label: "Rayo" },
];

// Color mapping from Tailwind class names to hex values
const COLOR_MAP: Record<string, string> = {
  "red-600": "#DC2626",
  "red-700": "#B91C1C",
  "blue-600": "#2563EB",
  "blue-700": "#1D4ED8",
  "purple-600": "#9333EA",
  "purple-700": "#7C3AED",
  "brand-blue-primary": "#0033A0",
  "indigo-600": "#4F46E5",
  "amber-500": "#F59E0B",
  "orange-600": "#EA580C",
  "emerald-500": "#10B981",
  "teal-600": "#0D9488",
  "pink-500": "#EC4899",
  "rose-600": "#E11D48",
  "gray-500": "#6B7280",
  "gray-700": "#374151",
};

const getColor = (colorName: string): string => COLOR_MAP[colorName] || colorName;

// Predefined gradient themes for events
const GRADIENT_THEMES = [
  {
    name: "Navidad",
    gradientFrom: "red-600/60",
    gradientVia: "red-700/40",
    iconGradientFrom: "red-600",
    iconGradientTo: "red-700",
  },
  {
    name: "Graduación",
    gradientFrom: "blue-600/60",
    gradientVia: "blue-700/40",
    iconGradientFrom: "blue-600",
    iconGradientTo: "blue-700",
  },
  {
    name: "PUCMM",
    gradientFrom: "brand-blue-primary/40",
    gradientVia: "indigo-600/20",
    iconGradientFrom: "brand-blue-primary",
    iconGradientTo: "indigo-600",
  },
  {
    name: "Púrpura",
    gradientFrom: "purple-600/60",
    gradientVia: "purple-700/40",
    iconGradientFrom: "purple-600",
    iconGradientTo: "purple-700",
  },
  {
    name: "Dorado",
    gradientFrom: "amber-500/40",
    gradientVia: "orange-600/20",
    iconGradientFrom: "amber-500",
    iconGradientTo: "orange-600",
  },
  {
    name: "Esmeralda",
    gradientFrom: "emerald-500/40",
    gradientVia: "teal-600/20",
    iconGradientFrom: "emerald-500",
    iconGradientTo: "teal-600",
  },
];

export default function CreateEventModal({ isOpen, onClose, editEvent }: CreateEventModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [iconName, setIconName] = useState("TreePine");
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [bannerUrl, setBannerUrl] = useState("");

  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const isEditing = !!editEvent;

  // Load edit data when modal opens
  useEffect(() => {
    if (editEvent) {
      setName(editEvent.name);
      setDescription(editEvent.description || "");
      setIconName(editEvent.iconName || "TreePine");
      setBannerUrl(editEvent.bannerUrl || "");

      // Find matching theme
      const themeIndex = GRADIENT_THEMES.findIndex(
        (t) =>
          t.iconGradientFrom === editEvent.iconGradientFrom
      );
      setSelectedTheme(themeIndex >= 0 ? themeIndex : 0);
    }
  }, [editEvent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const theme = GRADIENT_THEMES[selectedTheme];
    const eventData = {
      name,
      description: description || undefined,
      iconName,
      bannerUrl: bannerUrl || undefined,
      gradientFrom: theme.gradientFrom,
      gradientVia: theme.gradientVia,
      gradientTo: "transparent",
      iconGradientFrom: theme.iconGradientFrom,
      iconGradientTo: theme.iconGradientTo,
    };

    if (isEditing && editEvent) {
      await updateEvent.mutateAsync({ id: editEvent.id, data: eventData });
    } else {
      await createEvent.mutateAsync(eventData);
    }

    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setIconName("TreePine");
    setSelectedTheme(0);
    setBannerUrl("");
  };

  const handleClose = () => {
    if (!isEditing) {
      resetForm();
    }
    onClose();
  };

  const handleImageUpload = (response: { file: { url: string } }) => {
    const fullUrl = `${env.apiUrl}${response.file.url}`;
    setBannerUrl(fullUrl);
  };

  const isPending = createEvent.isPending || updateEvent.isPending;

  // Get current theme colors for preview
  const currentTheme = GRADIENT_THEMES[selectedTheme];
  const previewGradientFrom = getColor(currentTheme.iconGradientFrom);
  const previewGradientTo = getColor(currentTheme.iconGradientTo);

  // Get selected icon component
  const SelectedIcon = ICON_OPTIONS.find((o) => o.name === iconName)?.icon || Calendar;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <Modal.Header
          icon={<Calendar size={24} />}
          subtitle={isEditing ? "Modificar los detalles del evento" : "Crear un nuevo evento para la banda"}
        >
          {isEditing ? "Editar Evento" : "Nuevo Evento"}
        </Modal.Header>

        <Modal.Body className="space-y-5">
          {/* Preview */}
          <div
            className="relative h-28 rounded-xl overflow-hidden border border-white/10"
            style={{
              background: bannerUrl
                ? undefined
                : `linear-gradient(to bottom right, ${previewGradientFrom}60, ${previewGradientTo}30, transparent)`,
            }}
          >
            {bannerUrl && (
              <>
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${bannerUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    opacity: 0.5,
                  }}
                />
                <div className="absolute inset-0 bg-linear-to-b from-transparent to-surface-0/90" />
              </>
            )}
            <div className="absolute inset-0 flex items-center gap-4 p-4">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
                style={{
                  background: `linear-gradient(to bottom right, ${previewGradientFrom}, ${previewGradientTo})`,
                }}
              >
                <SelectedIcon size={28} className="text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white font-bold text-lg truncate">
                  {name || "Nombre del evento"}
                </p>
                {description && (
                  <p className="text-white/60 text-sm truncate">{description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="block text-xs text-gray-400 uppercase tracking-wide font-medium">
              Nombre del Evento *
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Navidad PUCMM"
              autoFocus
              className="w-full bg-surface-100/80 border border-surface-200 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-500 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20 outline-none transition-all duration-200"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-xs text-gray-400 uppercase tracking-wide font-medium">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles adicionales sobre el evento..."
              rows={2}
              className="w-full bg-surface-100/80 border border-surface-200 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-500 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20 outline-none transition-all duration-200 resize-none"
            />
          </div>

          {/* Icon Selection */}
          <div className="space-y-2">
            <label className="block text-xs text-gray-400 uppercase tracking-wide font-medium">
              Ícono del Evento
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {ICON_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = iconName === option.name;
                return (
                  <button
                    key={option.name}
                    type="button"
                    onClick={() => setIconName(option.name)}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-brand-yellow/10 border-brand-yellow text-white ring-1 ring-brand-yellow/50"
                        : "bg-surface-100/50 border-surface-200 text-gray-400 hover:border-white/30 hover:text-white"
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-[10px]">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Theme */}
          <div className="space-y-2">
            <label className="block text-xs text-gray-400 uppercase tracking-wide font-medium">
              Tema de Colores
            </label>
            <div className="grid grid-cols-3 gap-2">
              {GRADIENT_THEMES.map((theme, index) => (
                <button
                  key={theme.name}
                  type="button"
                  onClick={() => setSelectedTheme(index)}
                  className={`relative p-3 rounded-xl border transition-all overflow-hidden ${
                    selectedTheme === index
                      ? "border-brand-yellow ring-1 ring-brand-yellow/50"
                      : "border-surface-200 hover:border-white/30"
                  }`}
                >
                  {/* Gradient preview */}
                  <div
                    className="absolute inset-0 opacity-40"
                    style={{
                      background: `linear-gradient(to bottom right, ${getColor(theme.iconGradientFrom)}, ${getColor(theme.iconGradientTo)})`,
                    }}
                  />
                  <div className="relative text-center">
                    <span className="text-sm text-white">{theme.name}</span>
                    {selectedTheme === index && (
                      <Check
                        size={14}
                        className="absolute -top-1 -right-1 text-brand-yellow"
                      />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Banner Upload */}
          <div className="space-y-2">
            <label className="block text-xs text-gray-400 uppercase tracking-wide font-medium">
              Banner Personalizado (Opcional)
            </label>
            {bannerUrl ? (
              <div className="relative">
                <img
                  src={bannerUrl}
                  alt="Event preview"
                  className="w-full h-24 object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setBannerUrl("")}
                  className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/50 hover:bg-black/70 text-white text-xs transition-all"
                >
                  Quitar
                </button>
              </div>
            ) : (
              <FileDropzone
                type="image"
                label="Subir banner"
                description="Imagen panorámica recomendada (JPG, PNG hasta 15MB)"
                onUploadComplete={handleImageUpload}
              />
            )}
          </div>
        </Modal.Body>

        <Modal.Footer className="flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-3.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-medium transition-all duration-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending || !name}
            className="flex-1 py-3.5 rounded-xl bg-brand-yellow hover:bg-brand-yellow/90 text-brand-blue-primary font-bold shadow-lg shadow-brand-yellow/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-brand-blue-primary/30 border-t-brand-blue-primary rounded-full animate-spin" />
                {isEditing ? "Guardando..." : "Creando..."}
              </span>
            ) : (
              isEditing ? "Guardar Cambios" : "Crear Evento"
            )}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
