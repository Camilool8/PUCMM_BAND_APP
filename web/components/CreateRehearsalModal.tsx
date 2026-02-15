"use client";

import { useState, useEffect } from "react";
import { Calendar, MapPin, FileText, Copy, ClipboardCheck } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useLocations } from "@/hooks/use-locations";
import { useEvents } from "@/hooks/use-events";
import { useCreateRehearsal, useUpdateRehearsal, useCopyEventSongsToRehearsal } from "@/hooks/use-rehearsals";
import type { Rehearsal } from "@/lib/api";

interface CreateRehearsalModalProps {
  isOpen: boolean;
  onClose: () => void;
  editRehearsal?: Rehearsal | null;
  defaultEventId?: string;
}

export default function CreateRehearsalModal({
  isOpen,
  onClose,
  editRehearsal,
  defaultEventId,
}: CreateRehearsalModalProps) {
  const [date, setDate] = useState("");
  const [locationId, setLocationId] = useState("");
  const [eventId, setEventId] = useState("");
  const [notes, setNotes] = useState("");
  const [copyFromEvent, setCopyFromEvent] = useState(false);

  const { data: locations } = useLocations();
  const { data: events } = useEvents();
  const createRehearsal = useCreateRehearsal();
  const updateRehearsal = useUpdateRehearsal();
  const copySongs = useCopyEventSongsToRehearsal();
  const isEditing = !!editRehearsal;

  const selectedEvent = events?.find((e) => e.id === eventId);
  const eventSongsCount = selectedEvent?.songs?.length || selectedEvent?._count?.songs || 0;

  useEffect(() => {
    if (!isOpen) return;

    if (editRehearsal) {
      const rehearsalDate = new Date(editRehearsal.date);
      const year = rehearsalDate.getFullYear();
      const month = String(rehearsalDate.getMonth() + 1).padStart(2, "0");
      const day = String(rehearsalDate.getDate()).padStart(2, "0");
      const hours = String(rehearsalDate.getHours()).padStart(2, "0");
      const minutes = String(rehearsalDate.getMinutes()).padStart(2, "0");
      setDate(`${year}-${month}-${day}T${hours}:${minutes}`);
      setLocationId(editRehearsal.locationId);
      setEventId(editRehearsal.eventId || "");
      setNotes(editRehearsal.notes || "");
      setCopyFromEvent(false);
    } else {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      nextWeek.setHours(18, 0, 0, 0);
      const year = nextWeek.getFullYear();
      const month = String(nextWeek.getMonth() + 1).padStart(2, "0");
      const day = String(nextWeek.getDate()).padStart(2, "0");
      setDate(`${year}-${month}-${day}T18:00`);
      setLocationId(locations?.[0]?.id || "");
      setEventId(defaultEventId || "");
      setNotes("");
      setCopyFromEvent(!!defaultEventId);
    }
  }, [editRehearsal, isOpen, locations, defaultEventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && editRehearsal) {
      await updateRehearsal.mutateAsync({
        id: editRehearsal.id,
        data: {
          date: new Date(date).toISOString(),
          locationId,
          notes: notes || undefined,
        },
      });
    } else {
      const rehearsal = await createRehearsal.mutateAsync({
        date: new Date(date).toISOString(),
        locationId,
        eventId: eventId || undefined,
        notes: notes || undefined,
      });

      if (copyFromEvent && eventId && rehearsal.id) {
        await copySongs.mutateAsync(rehearsal.id);
      }
    }

    resetForm();
    onClose();
  };

  const resetForm = () => {
    setDate("");
    setLocationId("");
    setEventId("");
    setNotes("");
    setCopyFromEvent(false);
  };

  const handleClose = () => {
    if (!isEditing) resetForm();
    onClose();
  };

  const isPending = createRehearsal.isPending || updateRehearsal.isPending || copySongs.isPending;

  const previewDate = date
    ? new Date(date).toLocaleDateString("es-DO", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Selecciona una fecha";

  const selectedLocation = locations?.find((l) => l.id === locationId);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <Modal.Header
          icon={<ClipboardCheck size={24} />}
          subtitle={isEditing ? "Modificar los detalles del ensayo" : "Programar un nuevo ensayo"}
        >
          {isEditing ? "Editar Ensayo" : "Nuevo Ensayo"}
        </Modal.Header>

        <Modal.Body className="space-y-5">
          {/* Preview */}
          <div className="bg-surface-100/50 p-4 rounded-xl border border-surface-200/50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0">
                <ClipboardCheck size={20} className="text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white font-medium capitalize">{previewDate}</p>
                {selectedLocation && (
                  <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-1">
                    <MapPin size={12} />
                    {selectedLocation.name}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {selectedEvent?.name || "Ensayo general"}
                </p>
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="block text-xs text-gray-400 uppercase tracking-wide font-medium">
              Fecha y Hora *
            </label>
            <div className="relative">
              <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="datetime-local"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-surface-100/80 border border-surface-200 rounded-xl pl-11 pr-4 py-3.5 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="block text-xs text-gray-400 uppercase tracking-wide font-medium">
              Ubicación *
            </label>
            <div className="relative">
              <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                required
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full bg-surface-100/80 border border-surface-200 rounded-xl pl-11 pr-4 py-3.5 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all duration-200 appearance-none"
              >
                <option value="">Seleccionar ubicación...</option>
                {locations?.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}{location.address ? ` - ${location.address}` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Event (Optional) */}
          {!isEditing && (
            <div className="space-y-2">
              <label className="block text-xs text-gray-400 uppercase tracking-wide font-medium">
                Evento (Opcional)
              </label>
              <div className="relative">
                <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  className="w-full bg-surface-100/80 border border-surface-200 rounded-xl pl-11 pr-4 py-3.5 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all duration-200 appearance-none"
                >
                  <option value="">Ensayo general (sin evento)</option>
                  {events?.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <label className="block text-xs text-gray-400 uppercase tracking-wide font-medium">
              Notas
            </label>
            <div className="relative">
              <FileText size={16} className="absolute left-4 top-4 text-gray-400" />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Información adicional sobre el ensayo..."
                rows={2}
                className="w-full bg-surface-100/80 border border-surface-200 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all duration-200 resize-none"
              />
            </div>
          </div>

          {/* Copy from Event */}
          {!isEditing && eventId && eventSongsCount > 0 && (
            <label className="flex items-start gap-3 p-4 rounded-xl bg-surface-100/30 border border-surface-200/30 cursor-pointer hover:bg-surface-100/50 transition-colors">
              <input
                type="checkbox"
                checked={copyFromEvent}
                onChange={(e) => setCopyFromEvent(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded border-surface-200 bg-surface-100 text-emerald-500 focus:ring-emerald-500/30"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Copy size={14} className="text-emerald-400" />
                  <span className="text-sm text-white font-medium">Copiar setlist del evento</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Iniciar con las {eventSongsCount} canciones del setlist de {selectedEvent?.name}
                </p>
              </div>
            </label>
          )}
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
            disabled={isPending || !date || !locationId}
            className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {isEditing ? "Guardando..." : "Creando..."}
              </span>
            ) : isEditing ? (
              "Guardar Cambios"
            ) : (
              "Crear Ensayo"
            )}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
