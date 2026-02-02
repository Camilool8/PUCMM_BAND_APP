"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Library,
  Clock,
  Archive,
  Music,
  Sparkles,
  Star,
  Heart,
  Zap,
  Check,
  Trash2,
  ImageIcon,
  type LucideIcon,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { useSection, useUpdateSection, useClearSectionBanner } from "@/hooks/use-sections";
import type { UploadResponse } from "@/lib/api";

interface SectionSettingsModalProps {
  sectionKey: string;
  isOpen: boolean;
  onClose: () => void;
}

// Available icons for sections
const ICON_OPTIONS: { name: string; icon: LucideIcon; label: string }[] = [
  { name: "Library", icon: Library, label: "Biblioteca" },
  { name: "Clock", icon: Clock, label: "Reloj" },
  { name: "Archive", icon: Archive, label: "Archivo" },
  { name: "Music", icon: Music, label: "Música" },
  { name: "Sparkles", icon: Sparkles, label: "Destellos" },
  { name: "Star", icon: Star, label: "Estrella" },
  { name: "Heart", icon: Heart, label: "Corazón" },
  { name: "Zap", icon: Zap, label: "Rayo" },
];

// Predefined gradient themes
const GRADIENT_THEMES = [
  {
    name: "Azul PUCMM",
    gradientFrom: "brand-blue-primary/40",
    gradientVia: "indigo-600/20",
    iconGradientFrom: "brand-blue-primary",
    iconGradientTo: "indigo-600",
  },
  {
    name: "Ámbar",
    gradientFrom: "amber-500/30",
    gradientVia: "orange-600/10",
    iconGradientFrom: "amber-500",
    iconGradientTo: "orange-600",
  },
  {
    name: "Gris",
    gradientFrom: "gray-600/30",
    gradientVia: "gray-700/10",
    iconGradientFrom: "gray-500",
    iconGradientTo: "gray-700",
  },
  {
    name: "Esmeralda",
    gradientFrom: "emerald-500/30",
    gradientVia: "teal-600/10",
    iconGradientFrom: "emerald-500",
    iconGradientTo: "teal-600",
  },
  {
    name: "Rosa",
    gradientFrom: "pink-500/30",
    gradientVia: "rose-600/10",
    iconGradientFrom: "pink-500",
    iconGradientTo: "rose-600",
  },
  {
    name: "Púrpura",
    gradientFrom: "purple-500/30",
    gradientVia: "violet-600/10",
    iconGradientFrom: "purple-500",
    iconGradientTo: "violet-600",
  },
];

export default function SectionSettingsModal({
  sectionKey,
  isOpen,
  onClose,
}: SectionSettingsModalProps) {
  const { data: section, isLoading } = useSection(sectionKey);
  const updateSection = useUpdateSection();
  const clearBanner = useClearSectionBanner();

  // Form state
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [iconName, setIconName] = useState("Library");
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [showBannerUploader, setShowBannerUploader] = useState(false);

  // Initialize form with section data
  useEffect(() => {
    if (section) {
      setTitle(section.title || "");
      setSubtitle(section.subtitle || "");
      setIconName(section.iconName || "Library");
      setBannerUrl(section.bannerUrl || null);

      // Find matching theme
      const themeIndex = GRADIENT_THEMES.findIndex(
        (t) =>
          t.gradientFrom === section.gradientFrom &&
          t.iconGradientFrom === section.iconGradientFrom
      );
      setSelectedTheme(themeIndex >= 0 ? themeIndex : 0);
    }
  }, [section]);

  const handleBannerUpload = (response: UploadResponse) => {
    const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}${response.file.url}`;
    setBannerUrl(fullUrl);
    setShowBannerUploader(false);
  };

  const handleRemoveBanner = async () => {
    setBannerUrl(null);
  };

  const handleSave = async () => {
    const theme = GRADIENT_THEMES[selectedTheme];

    await updateSection.mutateAsync({
      key: sectionKey,
      data: {
        title,
        subtitle,
        iconName,
        bannerUrl: bannerUrl || undefined,
        gradientFrom: theme.gradientFrom,
        gradientVia: theme.gradientVia,
        gradientTo: "transparent",
        iconGradientFrom: theme.iconGradientFrom,
        iconGradientTo: theme.iconGradientTo,
      },
    });

    // If banner was removed, also clear it on backend
    if (!bannerUrl && section?.bannerUrl) {
      await clearBanner.mutateAsync(sectionKey);
    }

    onClose();
  };

  const hasChanges =
    title !== (section?.title || "") ||
    subtitle !== (section?.subtitle || "") ||
    iconName !== (section?.iconName || "Library") ||
    bannerUrl !== (section?.bannerUrl || null) ||
    GRADIENT_THEMES[selectedTheme]?.gradientFrom !== section?.gradientFrom;

  if (isLoading) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Header icon={<Settings size={24} />} subtitle={`Configurar sección: ${sectionKey}`}>
        Configurar Sección
      </Modal.Header>

      <Modal.Body className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Título de la sección
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Repertorio Activo"
            className="w-full bg-surface-100/50 border border-surface-200 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/50 outline-none"
          />
        </div>

        {/* Subtitle */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Subtítulo
          </label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Ej: Canciones listas y en ensayo"
            className="w-full bg-surface-100/50 border border-surface-200 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/50 outline-none"
          />
        </div>

        {/* Icon Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-3">
            Ícono de la sección
          </label>
          <div className="grid grid-cols-4 gap-2">
            {ICON_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = iconName === option.name;
              return (
                <button
                  key={option.name}
                  onClick={() => setIconName(option.name)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                    isSelected
                      ? "bg-brand-blue-primary/20 border-brand-blue-primary text-white"
                      : "bg-surface-100/50 border-surface-200 text-gray-400 hover:border-white/30 hover:text-white"
                  }`}
                >
                  <Icon size={24} />
                  <span className="text-xs">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Banner Image */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-3">
            <ImageIcon size={16} />
            Banner de la sección
          </label>

          {bannerUrl ? (
            <div className="relative rounded-xl overflow-hidden border border-surface-200">
              {/* Preview */}
              <div className="relative h-32">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${bannerUrl})` }}
                />
                <div className="absolute inset-0 backdrop-blur-xl" />
                <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/60 to-surface-0" />
                <div className="absolute bottom-3 left-3 text-white text-sm font-medium">
                  Vista previa del banner
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between p-3 bg-surface-100/50">
                <span className="text-sm text-gray-400 truncate flex-1">
                  Banner personalizado
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowBannerUploader(true)}
                    className="px-3 py-1.5 text-sm bg-surface-100 border border-surface-200 rounded-lg text-gray-300 hover:text-white hover:border-white/30 transition-all"
                  >
                    Cambiar
                  </button>
                  <button
                    onClick={handleRemoveBanner}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowBannerUploader(!showBannerUploader)}
              className="w-full p-4 border-2 border-dashed border-surface-200 rounded-xl text-gray-400 hover:border-white/30 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <ImageIcon size={20} />
              <span>Agregar banner personalizado</span>
            </button>
          )}

          {/* Banner Uploader */}
          {showBannerUploader && (
            <div className="mt-3 animate-fade-in">
              <FileDropzone
                type="image"
                label="Subir banner"
                description="Imagen panorámica recomendada (1920x400)"
                onUploadComplete={handleBannerUpload}
              />
            </div>
          )}
        </div>

        {/* Gradient Theme (only shown when no banner) */}
        {!bannerUrl && (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">
              Tema de colores
            </label>
            <div className="grid grid-cols-3 gap-2">
              {GRADIENT_THEMES.map((theme, index) => (
                <button
                  key={theme.name}
                  onClick={() => setSelectedTheme(index)}
                  className={`relative p-3 rounded-xl border transition-all overflow-hidden ${
                    selectedTheme === index
                      ? "border-brand-yellow ring-1 ring-brand-yellow/50"
                      : "border-surface-200 hover:border-white/30"
                  }`}
                >
                  {/* Gradient preview */}
                  <div
                    className={`absolute inset-0 bg-linear-to-br from-${theme.iconGradientFrom} to-${theme.iconGradientTo} opacity-30`}
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
        )}
      </Modal.Body>

      {/* Footer */}
      <div className="shrink-0 px-6 py-4 border-t border-white/5 bg-surface-100/30 flex items-center justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={updateSection.isPending || !hasChanges}
          className="flex items-center gap-2 px-5 py-2 bg-brand-yellow text-brand-blue-primary font-medium rounded-lg hover:bg-brand-yellow/90 transition-all disabled:opacity-50"
        >
          {updateSection.isPending ? (
            <>
              <span className="w-4 h-4 border-2 border-brand-blue-primary/30 border-t-brand-blue-primary rounded-full animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Check size={18} />
              Guardar
            </>
          )}
        </button>
      </div>
    </Modal>
  );
}
