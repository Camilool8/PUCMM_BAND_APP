"use client";

import { useState, useEffect } from "react";
import { Calendar, MapPin, FileText, Copy } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useCreateConcert, useUpdateConcert, useCopyEventSongsToConcert } from "@/hooks/use-concerts";
import type { Concert, Event } from "@/lib/api";

interface CreateConcertModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  editConcert?: Concert | null;
}

export default function CreateConcertModal({
  isOpen,
  onClose,
  event,
  editConcert,
}: CreateConcertModalProps) {
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [copyFromEvent, setCopyFromEvent] = useState(true);

  const createConcert = useCreateConcert();
  const updateConcert = useUpdateConcert();
  const copySongs = useCopyEventSongsToConcert();
  const isEditing = !!editConcert;

  // Load edit data when modal opens or editConcert changes
  useEffect(() => {
    if (!isOpen) return;

    if (editConcert) {
      // Format date for datetime-local input (local timezone)
      const concertDate = new Date(editConcert.date);
      // Use local date/time format for the input
      const year = concertDate.getFullYear();
      const month = String(concertDate.getMonth() + 1).padStart(2, '0');
      const day = String(concertDate.getDate()).padStart(2, '0');
      const hours = String(concertDate.getHours()).padStart(2, '0');
      const minutes = String(concertDate.getMinutes()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;

      setDate(formattedDate);
      setLocation(editConcert.location || "");
      setNotes(editConcert.notes || "");
      setCopyFromEvent(false);
    } else {
      // Default to next week at 7pm for new concerts
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      nextWeek.setHours(19, 0, 0, 0);
      const year = nextWeek.getFullYear();
      const month = String(nextWeek.getMonth() + 1).padStart(2, '0');
      const day = String(nextWeek.getDate()).padStart(2, '0');
      setDate(`${year}-${month}-${day}T19:00`);
      setLocation("");
      setNotes("");
      setCopyFromEvent(true);
    }
  }, [editConcert, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && editConcert) {
      await updateConcert.mutateAsync({
        id: editConcert.id,
        data: {
          date: new Date(date).toISOString(),
          location: location || undefined,
          notes: notes || undefined,
        },
      });
    } else {
      const concert = await createConcert.mutateAsync({
        eventId: event.id,
        date: new Date(date).toISOString(),
        location: location || undefined,
        notes: notes || undefined,
      });

      // Copy songs from event if checkbox is checked
      if (copyFromEvent && concert.id) {
        await copySongs.mutateAsync(concert.id);
      }
    }

    resetForm();
    onClose();
  };

  const resetForm = () => {
    setDate("");
    setLocation("");
    setNotes("");
    setCopyFromEvent(true);
  };

  const handleClose = () => {
    if (!isEditing) {
      resetForm();
    }
    onClose();
  };

  const isPending = createConcert.isPending || updateConcert.isPending || copySongs.isPending;

  // Format preview date
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

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <form onSubmit={handleSubmit} className="flex flex-col">
        <Modal.Header
          icon={<Calendar size={24} />}
          subtitle={isEditing ? "Modificar los detalles del concierto" : `Agregar un concierto a ${event.name}`}
        >
          {isEditing ? "Editar Concierto" : "Nuevo Concierto"}
        </Modal.Header>

        <Modal.Body className="space-y-5">
          {/* Preview */}
          <div className="bg-surface-100/50 p-4 rounded-xl border border-surface-200/50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-brand-blue-primary flex items-center justify-center shrink-0">
                <Calendar size={20} className="text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white font-medium capitalize">{previewDate}</p>
                {location && (
                  <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-1">
                    <MapPin size={12} />
                    {location}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {event.name}
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
                className="w-full bg-surface-100/80 border border-surface-200 rounded-xl pl-11 pr-4 py-3.5 text-white focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20 outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="block text-xs text-gray-400 uppercase tracking-wide font-medium">
              Ubicación
            </label>
            <div className="relative">
              <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ej: Auditorio Principal PUCMM"
                className="w-full bg-surface-100/80 border border-surface-200 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder:text-gray-500 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20 outline-none transition-all duration-200"
              />
            </div>
          </div>

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
                placeholder="Información adicional sobre el concierto..."
                rows={2}
                className="w-full bg-surface-100/80 border border-surface-200 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder:text-gray-500 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20 outline-none transition-all duration-200 resize-none"
              />
            </div>
          </div>

          {/* Copy from Event - only for new concerts */}
          {!isEditing && (event.songs?.length || event._count?.songs || 0) > 0 && (
            <label className="flex items-start gap-3 p-4 rounded-xl bg-surface-100/30 border border-surface-200/30 cursor-pointer hover:bg-surface-100/50 transition-colors">
              <input
                type="checkbox"
                checked={copyFromEvent}
                onChange={(e) => setCopyFromEvent(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded border-surface-200 bg-surface-100 text-brand-yellow focus:ring-brand-yellow/30"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Copy size={14} className="text-brand-yellow" />
                  <span className="text-sm text-white font-medium">Copiar setlist del evento</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Iniciar con las {event.songs?.length || event._count?.songs || 0} canciones del setlist de {event.name}
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
            disabled={isPending || !date}
            className="flex-1 py-3.5 rounded-xl bg-brand-yellow hover:bg-brand-yellow/90 text-brand-blue-primary font-bold shadow-lg shadow-brand-yellow/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-brand-blue-primary/30 border-t-brand-blue-primary rounded-full animate-spin" />
                {isEditing ? "Guardando..." : "Creando..."}
              </span>
            ) : isEditing ? (
              "Guardar Cambios"
            ) : (
              "Crear Concierto"
            )}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
