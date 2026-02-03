"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Music,
  Calendar,
  Ticket,
  User,
  Users,
  Shield,
  Play,
  PlayCircle,
  CheckCircle2,
  RotateCcw,
  BookOpen,
  Compass,
  FileText,
  ThumbsUp,
  Settings,
  CalendarPlus,
  ListMusic,
  CalendarCheck,
  ArrowUpCircle,
  ChevronDown,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTour } from "@/hooks/use-tour";
import {
  type MiniTour,
  type MiniTourId,
  type UserRole,
  getMiniToursByCategory,
  CATEGORY_LABELS,
  estimateTourDuration,
  aggregatedTours,
} from "@/lib/tour-config";

// Icon mapping
const ICON_MAP: Record<string, LucideIcon> = {
  Sparkles,
  Music,
  Calendar,
  Ticket,
  User,
  Users,
  Shield,
  Compass,
  FileText,
  ThumbsUp,
  Settings,
  CalendarPlus,
  ListMusic,
  CalendarCheck,
  ArrowUpCircle,
  BookOpen,
  Play,
};

// ============================================================================
// Mini Tour Card Component
// ============================================================================

function MiniTourCard({
  tour,
  isCompleted,
  onStart,
  isSelected,
  onToggleSelect,
  showCheckbox,
}: {
  tour: MiniTour;
  isCompleted: boolean;
  onStart: () => void;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  showCheckbox?: boolean;
}) {
  const Icon = ICON_MAP[tour.icon] || BookOpen;
  const duration = estimateTourDuration(tour.steps.length);

  return (
    <div
      className={`group relative rounded-xl p-3 md:p-4 transition-all duration-200 ${
        isCompleted
          ? "bg-emerald-500/10 border border-emerald-500/20"
          : "bg-surface-50 border border-surface-100 hover:border-brand-yellow/30"
      }`}
    >
      {/* Completed badge */}
      {isCompleted && (
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
          <CheckCircle2 size={12} className="text-white" />
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Checkbox for batch selection */}
        {showCheckbox && (
          <button
            onClick={onToggleSelect}
            className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
              isSelected
                ? "bg-brand-yellow border-brand-yellow"
                : "border-gray-500 hover:border-gray-400"
            }`}
          >
            {isSelected && <CheckCircle2 size={12} className="text-brand-blue-primary" />}
          </button>
        )}

        {/* Icon */}
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all ${
            isCompleted
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-brand-yellow/20 text-brand-yellow"
          }`}
        >
          <Icon size={20} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white text-sm group-hover:text-brand-yellow transition-colors">
            {tour.title}
          </h4>
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{tour.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] text-gray-500">{tour.steps.length} pasos</span>
            <span className="text-[10px] text-gray-600">•</span>
            <span className="text-[10px] text-gray-500">{duration}</span>
          </div>
        </div>

        {/* Play button - always visible on mobile, hover on desktop */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            console.log("[GuidesPage] Play button clicked for tour:", tour.id);
            onStart();
          }}
          className="shrink-0 w-8 h-8 rounded-full bg-brand-yellow/20 hover:bg-brand-yellow text-brand-yellow hover:text-brand-blue-primary flex items-center justify-center transition-all md:opacity-0 md:group-hover:opacity-100"
          title="Iniciar tour"
        >
          <Play size={14} className="ml-0.5" />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Category Section Component
// ============================================================================

function CategorySection({
  category,
  tours,
  isExpanded,
  onToggle,
  completedTours,
  onStartTour,
  selectedTours,
  onToggleSelect,
  showCheckboxes,
}: {
  category: string;
  tours: MiniTour[];
  isExpanded: boolean;
  onToggle: () => void;
  completedTours: MiniTourId[];
  onStartTour: (id: MiniTourId) => void;
  selectedTours: MiniTourId[];
  onToggleSelect: (id: MiniTourId) => void;
  showCheckboxes: boolean;
}) {
  const categoryInfo = CATEGORY_LABELS[category] || { label: category, icon: "BookOpen" };
  const Icon = ICON_MAP[categoryInfo.icon] || BookOpen;
  const completedCount = tours.filter((t) => completedTours.includes(t.id)).length;

  return (
    <div className="rounded-2xl bg-surface-50/50 border border-surface-100 overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-brand-blue-primary/20 flex items-center justify-center">
          <Icon size={20} className="text-brand-yellow" />
        </div>
        <div className="flex-1 text-left">
          <h3 className="font-semibold text-white">{categoryInfo.label}</h3>
          <p className="text-xs text-gray-400">
            {completedCount}/{tours.length} completados
          </p>
        </div>
        {isExpanded ? (
          <ChevronDown size={20} className="text-gray-400" />
        ) : (
          <ChevronRight size={20} className="text-gray-400" />
        )}
      </button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-2">
              {tours.map((tour) => (
                <MiniTourCard
                  key={tour.id}
                  tour={tour}
                  isCompleted={completedTours.includes(tour.id)}
                  onStart={() => onStartTour(tour.id)}
                  isSelected={selectedTours.includes(tour.id)}
                  onToggleSelect={() => onToggleSelect(tour.id)}
                  showCheckbox={showCheckboxes}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function GuidesPage() {
  const { effectiveRole } = useAuth();
  const {
    startMiniTour,
    startTourSequence,
    startAggregatedTour,
    isMiniTourCompleted,
    resetAllTours,
    completedMiniTours,
    getAvailableMiniTours,
  } = useTour();

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["navigation", "songs"]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedTours, setSelectedTours] = useState<MiniTourId[]>([]);

  // Get tours organized by category
  const toursByCategory = useMemo(() => {
    if (!effectiveRole) return {};
    return getMiniToursByCategory(effectiveRole as UserRole);
  }, [effectiveRole]);

  const allTours = useMemo(() => {
    return Object.values(toursByCategory).flat();
  }, [toursByCategory]);

  // Calculate progress
  const totalTours = allTours.length;
  const completedCount = allTours.filter((t) => completedMiniTours.includes(t.id)).length;
  const progressPercent = totalTours > 0 ? (completedCount / totalTours) * 100 : 0;

  // Calculate total duration for selected tours
  const selectedDuration = useMemo(() => {
    const totalSteps = selectedTours.reduce((acc, id) => {
      const tour = allTours.find((t) => t.id === id);
      return acc + (tour?.steps.length || 0);
    }, 0);
    return estimateTourDuration(totalSteps);
  }, [selectedTours, allTours]);

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Toggle tour selection
  const toggleTourSelection = (id: MiniTourId) => {
    setSelectedTours((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  // Start selected tours as sequence
  const handleStartSelected = () => {
    if (selectedTours.length > 0) {
      startTourSequence(selectedTours);
      setSelectionMode(false);
      setSelectedTours([]);
    }
  };

  // Select all tours
  const handleSelectAll = () => {
    setSelectedTours(allTours.map((t) => t.id));
  };

  // Deselect all
  const handleDeselectAll = () => {
    setSelectedTours([]);
  };

  // Handle reset
  const handleResetAll = () => {
    resetAllTours();
    setShowResetConfirm(false);
  };

  // Handle starting the full welcome tour
  const handleStartWelcomeTour = () => {
    console.log("[GuidesPage] Starting welcome tour, effectiveRole:", effectiveRole);
    startAggregatedTour("welcome");
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-2"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-brand-yellow/20 flex items-center justify-center">
            <BookOpen size={24} className="text-brand-yellow" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Guías y Tutoriales</h1>
            <p className="text-sm text-gray-400">
              Aprende a usar la app con mini-tours interactivos
            </p>
          </div>
        </div>
      </motion.header>

      {/* Progress Card */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-5 bg-surface-50 border border-surface-100 shadow-lg shadow-black/20"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-white">Tu Progreso</h3>
            <p className="text-sm text-gray-400">
              {completedCount} de {totalTours} guías completadas
            </p>
          </div>
          {completedCount > 0 && (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
            >
              <RotateCcw size={14} />
              Reiniciar
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="h-3 bg-surface-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-brand-yellow to-amber-400 rounded-full"
          />
        </div>

        {progressPercent === 100 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-emerald-400 mt-3 flex items-center gap-2"
          >
            <CheckCircle2 size={16} />
            ¡Has completado todas las guías!
          </motion.p>
        )}
      </motion.section>

      {/* Reset Confirmation */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <p className="text-sm text-amber-400 mb-3">
                Esto reiniciará tu progreso en todas las guías. El tour de bienvenida volverá a aparecer.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleResetAll}
                  className="px-4 py-2 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all"
                >
                  Reiniciar Todo
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Actions */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-3"
      >
        {/* Start Full Welcome Tour */}
        <button
          onClick={handleStartWelcomeTour}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-br from-brand-blue-primary/30 to-indigo-600/20 border border-brand-blue-primary/30 hover:border-brand-yellow/50 transition-all group"
        >
          <PlayCircle size={20} className="text-brand-yellow" />
          <span className="font-medium text-white group-hover:text-brand-yellow transition-colors">
            Tour Completo
          </span>
        </button>

        {/* Toggle Selection Mode */}
        <button
          onClick={() => {
            setSelectionMode(!selectionMode);
            if (selectionMode) setSelectedTours([]);
          }}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
            selectionMode
              ? "bg-brand-yellow/20 border-brand-yellow/50 text-brand-yellow"
              : "bg-surface-50 border-surface-100 text-gray-400 hover:text-white hover:border-white/20"
          }`}
        >
          <CheckCircle2 size={20} />
          <span className="font-medium">
            {selectionMode ? "Cancelar Selección" : "Seleccionar Tours"}
          </span>
        </button>
      </motion.section>

      {/* Selection Actions */}
      <AnimatePresence>
        {selectionMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-surface-50 border border-surface-100">
              <span className="text-sm text-gray-400">
                {selectedTours.length} seleccionados
                {selectedTours.length > 0 && ` • ${selectedDuration}`}
              </span>
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={handleSelectAll}
                  className="text-xs text-brand-yellow hover:underline"
                >
                  Seleccionar todo
                </button>
                <button
                  onClick={handleDeselectAll}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Deseleccionar
                </button>
              </div>
              {selectedTours.length > 0 && (
                <button
                  onClick={handleStartSelected}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-yellow text-brand-blue-primary rounded-lg font-medium hover:bg-brand-yellow/90 transition-all"
                >
                  <Play size={16} />
                  Iniciar {selectedTours.length} Tours
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tour Categories */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        {Object.entries(toursByCategory).map(([category, tours]) => (
          <CategorySection
            key={category}
            category={category}
            tours={tours}
            isExpanded={expandedCategories.includes(category)}
            onToggle={() => toggleCategory(category)}
            completedTours={completedMiniTours}
            onStartTour={(id) => startMiniTour(id, true)}
            selectedTours={selectedTours}
            onToggleSelect={toggleTourSelection}
            showCheckboxes={selectionMode}
          />
        ))}
      </motion.section>

      {/* Tips */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl p-5 bg-surface-50 border border-surface-100"
      >
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
          <Sparkles size={18} className="text-brand-yellow" />
          Tips
        </h3>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-brand-yellow">•</span>
            Puedes repetir cualquier guía haciendo clic en ella.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand-yellow">•</span>
            Usa "Seleccionar Tours" para crear tu propia secuencia de aprendizaje.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand-yellow">•</span>
            El "Tour Completo" te muestra todas las guías disponibles para tu rol.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand-yellow">•</span>
            Si tu rol cambia, verás automáticamente las nuevas funciones disponibles.
          </li>
        </ul>
      </motion.section>
    </div>
  );
}
