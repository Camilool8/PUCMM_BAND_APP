"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useEvents, useEvent } from "@/hooks/use-events";
import { useSection } from "@/hooks/use-sections";
import { useAuth } from "@/hooks/use-auth";
import EventRow from "@/components/EventRow";
import EventDetailModal from "@/components/EventDetailModal";
import CreateEventModal from "@/components/CreateEventModal";
import SectionSettingsModal from "@/components/SectionSettingsModal";
import EventContent from "@/components/EventContent";
import {
  Plus,
  Search,
  Calendar,
  X,
  LayoutGrid,
  Settings,
  TreePine,
  GraduationCap,
  PartyPopper,
  Sparkles,
  Star,
  Heart,
  Zap,
  Music,
  Library,
  Clock,
  Archive,
  type LucideIcon,
} from "lucide-react";
import type { Event } from "@/lib/api";

// Icon mapping from string name to Lucide icon
const ICON_MAP: Record<string, LucideIcon> = {
  TreePine,
  GraduationCap,
  PartyPopper,
  Sparkles,
  Calendar,
  Music,
  Star,
  Heart,
  Zap,
  Library,
  Clock,
  Archive,
  LayoutGrid,
};

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
  "gray-500": "#6B7280",
  "gray-600": "#4B5563",
  "gray-700": "#374151",
};

const getColor = (colorName: string | null): string => {
  if (!colorName) return "#0033A0";
  const baseName = colorName.split("/")[0];
  return COLOR_MAP[baseName] || "#0033A0";
};

export default function EventsPage() {
  const router = useRouter();

  // "todos" or an event ID
  const [activeTab, setActiveTab] = useState<string>("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editEvent, setEditEvent] = useState<Event | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showSectionSettings, setShowSectionSettings] = useState(false);

  const { data: events, isLoading, error } = useEvents();
  const { data: eventosSection } = useSection("eventos");
  const { canManageEvents } = useAuth();

  // Get selected event from tab
  const selectedTabEvent = useMemo(() => {
    if (activeTab === "todos" || !events) return null;
    return events.find((e) => e.id === activeTab) || null;
  }, [activeTab, events]);

  // Fetch full event data when a specific event is selected
  const { data: fullSelectedEvent } = useEvent(selectedTabEvent?.id || "");
  const displayEvent = fullSelectedEvent || selectedTabEvent;

  // Filter events for "todos" tab
  const filteredEvents = useMemo(() => {
    if (!events || activeTab !== "todos") return [];

    if (searchQuery) {
      return events.filter(
        (event) =>
          event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return events;
  }, [events, activeTab, searchQuery]);

  const handleEventClick = (event: Event) => {
    router.push(`/events/${event.id}`);
  };

  const handleEdit = (event: Event) => {
    setSelectedEvent(null);
    setEditEvent(event);
    setShowCreateModal(true);
  };

  const handleCloseCreate = () => {
    setShowCreateModal(false);
    setEditEvent(null);
  };

  // Dynamic header content based on selected tab
  // If "todos", use eventosSection data; otherwise use selected event data
  const isEventSelected = !!displayEvent;

  // Section header (for "todos" tab)
  const sectionIcon = eventosSection?.iconName ? ICON_MAP[eventosSection.iconName] : Calendar;
  const SectionIcon = sectionIcon || Calendar;
  const sectionGradientFrom = getColor(eventosSection?.iconGradientFrom || null);
  const sectionGradientTo = getColor(eventosSection?.iconGradientTo || null);

  // Event header (for specific event tab)
  const eventIcon = displayEvent?.iconName ? ICON_MAP[displayEvent.iconName] : Calendar;
  const EventIcon = eventIcon || Calendar;
  const eventGradientFrom = getColor(displayEvent?.iconGradientFrom || null);
  const eventGradientTo = getColor(displayEvent?.iconGradientTo || null);

  // Choose which to display
  const HeaderIcon = isEventSelected ? EventIcon : SectionIcon;
  const gradientFrom = isEventSelected ? eventGradientFrom : sectionGradientFrom;
  const gradientTo = isEventSelected ? eventGradientTo : sectionGradientTo;
  const bannerUrl = isEventSelected ? displayEvent?.bannerUrl : eventosSection?.bannerUrl;
  const headerTitle = isEventSelected ? displayEvent?.name : (eventosSection?.title || "Eventos");
  const headerSubtitle = isEventSelected
    ? (displayEvent?.description || `${displayEvent?.songs?.length || displayEvent?._count?.songs || 0} canciones • ${displayEvent?.concerts?.length || displayEvent?._count?.concerts || 0} conciertos`)
    : (eventosSection?.subtitle || `Gestiona los eventos y conciertos de la banda • ${events?.length || 0} eventos`);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Dynamic Hero Header */}
      <header data-tour="events-header" className="relative -mx-4 md:-mx-8 -mt-4 md:-mt-8 px-4 md:px-8 pt-4 md:pt-8 pb-6 overflow-hidden">
        {/* Banner background */}
        {bannerUrl && (
          <>
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${bannerUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div className="absolute inset-0 backdrop-blur-xl" />
            <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/60 to-surface-0" />
          </>
        )}

        {/* Gradient background (no banner) */}
        {!bannerUrl && (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, ${gradientFrom}80, ${gradientTo}40, transparent)`,
            }}
          />
        )}

        {/* Content */}
        <div className="relative flex items-end gap-4 md:gap-6">
          {/* Icon */}
          <div
            className="w-20 h-20 md:w-36 md:h-36 shrink-0 rounded-xl md:rounded-2xl shadow-2xl flex items-center justify-center border border-white/10 overflow-hidden"
            style={{
              background: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})`,
            }}
          >
            {bannerUrl ? (
              <img src={bannerUrl} alt={headerTitle || ""} className="w-full h-full object-cover" />
            ) : (
              <HeaderIcon size={48} className="text-white/90 md:w-16 md:h-16" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pb-1">
            <p className="text-xs md:text-sm font-medium text-white/60 uppercase tracking-wider mb-1">
              {isEventSelected ? "Evento" : "Eventos"}
            </p>
            <h1 className="text-xl md:text-4xl font-black text-white truncate">
              {headerTitle}
            </h1>
            <p className="text-sm text-gray-300 mt-1 hidden md:block">
              {headerSubtitle}
            </p>
          </div>

          {/* Settings button */}
          {canManageEvents && (
            <button
              onClick={() => isEventSelected ? handleEdit(displayEvent!) : setShowSectionSettings(true)}
              className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all"
            >
              <Settings size={18} className="md:w-5 md:h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Tabs - scrollable on mobile */}
      <div data-tour="event-tabs" className="flex gap-1.5 md:gap-2 border-b border-surface-100 pb-2 -mt-2 overflow-x-auto scrollbar-hide">
        {/* "Todos" tab */}
        <button
          onClick={() => setActiveTab("todos")}
          className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-sm md:text-base font-medium transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === "todos"
              ? "bg-brand-blue-primary text-white"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <LayoutGrid size={14} />
          Todos
          <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-white/10">{events?.length || 0}</span>
        </button>

        {/* Dynamic event tabs */}
        {events?.map((event, index) => {
          const IconComponent = event.iconName ? ICON_MAP[event.iconName] : Calendar;
          const Icon = IconComponent || Calendar;
          const isActive = activeTab === event.id;
          const iconColor = getColor(event.iconGradientFrom);

          return (
            <button
              key={event.id}
              data-tour={index === 0 ? "event-tab-first" : undefined}
              onClick={() => setActiveTab(event.id)}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-sm md:text-base font-medium transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                isActive
                  ? "bg-brand-blue-primary text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={14} style={{ color: isActive ? "white" : iconColor }} />
              {event.name}
              {(event._count?.songs || 0) > 0 && (
                <span
                  className={`ml-1 px-1.5 py-0.5 text-xs rounded-full font-medium ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-white/10 text-gray-300"
                  }`}
                >
                  {event._count?.songs}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content based on active tab */}
      {activeTab === "todos" ? (
        <>
          {/* Action Bar */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Admin: Show "Nuevo Evento" button */}
            {canManageEvents && (
              <button
                data-tour="create-event-btn"
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 md:gap-2 bg-brand-yellow text-brand-blue-primary px-3 md:px-4 py-2 md:py-2.5 rounded-full text-sm font-bold shadow-lg transition-bounce hover:scale-105 active:scale-95"
              >
                <Plus size={16} className="md:w-[18px] md:h-[18px]" strokeWidth={2.5} />
                <span className="hidden sm:inline">Nuevo Evento</span>
              </button>
            )}

            {/* Search Toggle (Mobile) */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="md:hidden w-9 h-9 rounded-full glass border border-white/10 flex items-center justify-center transition-smooth hover:border-white/20"
            >
              {showSearch ? <X size={16} /> : <Search size={16} />}
            </button>

            {/* Search Bar (Desktop) */}
            <div className="hidden md:flex items-center gap-2 glass px-4 py-2.5 rounded-full border border-white/10 flex-1 max-w-sm">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Buscar evento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-full placeholder-gray-500 text-white"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-white">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Event Count */}
            <span className="text-xs md:text-sm text-gray-400 ml-auto whitespace-nowrap">{filteredEvents.length} eventos</span>
          </div>

          {/* Mobile Search Bar */}
          {showSearch && (
            <div className="md:hidden animate-fade-in">
              <div className="flex items-center gap-2 glass px-4 py-3 rounded-xl border border-white/10">
                <Search size={16} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar evento..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="bg-transparent border-none outline-none text-sm w-full placeholder-gray-500 text-white"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-white">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 rounded-xl bg-surface-50 animate-shimmer"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="glass rounded-xl p-4 border border-red-500/20 text-red-400 animate-fade-in">
              <p className="font-medium">Error al cargar los eventos</p>
              <p className="text-sm text-red-400/70 mt-1">Verifica que el servidor esté corriendo.</p>
            </div>
          )}

          {/* Events List */}
          {!isLoading && !error && filteredEvents.length > 0 && (
            <div className="space-y-1">
              {filteredEvents.map((event, idx) => (
                <div key={event.id} className="animate-fade-in" style={{ animationDelay: `${idx * 30}ms` }}>
                  <EventRow event={event} index={idx} onClick={handleEventClick} />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredEvents.length === 0 && (
            <div className="text-center py-16 animate-fade-in">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-surface-50 flex items-center justify-center">
                <Calendar size={32} className="text-gray-500" />
              </div>
              <p className="text-gray-400 mb-4">
                {searchQuery ? "No se encontraron eventos" : "Aún no hay eventos creados"}
              </p>
              {!searchQuery && canManageEvents && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="text-brand-yellow font-medium hover:underline"
                >
                  Crear el primer evento
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        /* Event Detail View - no header since main header shows event info */
        displayEvent && (
          <EventContent
            event={displayEvent}
            onEdit={handleEdit}
          />
        )
      )}

      {/* Modals */}
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onEdit={handleEdit}
      />
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={handleCloseCreate}
        editEvent={editEvent}
      />
      <SectionSettingsModal
        sectionKey="eventos"
        isOpen={showSectionSettings}
        onClose={() => setShowSectionSettings(false)}
      />
    </div>
  );
}
