"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, Event, CreateEventDto, UpdateEventDto } from "@/lib/api";
import { TOAST_MESSAGES } from "@/lib/toast";

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: () => api.getEvents(),
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ["events", id],
    queryFn: () => api.getEvent(id),
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEventDto) => api.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success(TOAST_MESSAGES.EVENT_CREATED);
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.ERROR_GENERIC);
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventDto }) =>
      api.updateEvent(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["events", id] });
      toast.success(TOAST_MESSAGES.EVENT_UPDATED);
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.ERROR_GENERIC);
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success(TOAST_MESSAGES.EVENT_DELETED);
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.ERROR_GENERIC);
    },
  });
}

export function useAddSongToEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, songId }: { eventId: string; songId: string }) =>
      api.addSongToEvent(eventId, songId),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["events", eventId] });
      toast.success(TOAST_MESSAGES.SONG_ADDED_TO_EVENT);
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.ERROR_GENERIC);
    },
  });
}

export function useRemoveSongFromEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, songId }: { eventId: string; songId: string }) =>
      api.removeSongFromEvent(eventId, songId),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["events", eventId] });
      toast.success(TOAST_MESSAGES.SONG_REMOVED_FROM_EVENT);
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.ERROR_GENERIC);
    },
  });
}
