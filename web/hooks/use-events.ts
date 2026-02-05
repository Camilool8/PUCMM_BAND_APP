"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, Event, CreateEventDto, UpdateEventDto, CreateBlockDto, UpdateBlockDto } from "@/lib/api";
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

export function useAddSongsToEventBulk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, songIds }: { eventId: string; songIds: string[] }) =>
      api.addSongsToEventBulk(eventId, songIds),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["events", eventId] });
      toast.success(TOAST_MESSAGES.SONGS_ADDED_TO_EVENT_BULK);
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

export function useReorderEventSongs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, songIds }: { eventId: string; songIds: string[] }) =>
      api.reorderEventSongs(eventId, songIds),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["events", eventId] });
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.ERROR_GENERIC);
    },
  });
}

// Optimistic unified reorder for songs + blocks
export function useReorderEventSetlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, items }: { eventId: string; items: { id: string; itemType: "song" | "block" }[] }) =>
      api.reorderEventSetlist(eventId, items),
    onMutate: async ({ eventId, items }) => {
      await queryClient.cancelQueries({ queryKey: ["events", eventId] });
      const previousEvent = queryClient.getQueryData<Event>(["events", eventId]);

      if (previousEvent?.setlistItems) {
        const reorderedItems = items
          .map((item, index) => {
            const existing = previousEvent.setlistItems!.find((si) => si.id === item.id);
            return existing ? { ...existing, order: index } : null;
          })
          .filter(Boolean);

        queryClient.setQueryData<Event>(["events", eventId], {
          ...previousEvent,
          setlistItems: reorderedItems as Event["setlistItems"],
        });
      }

      return { previousEvent };
    },
    onError: (_err, { eventId }, context) => {
      if (context?.previousEvent) {
        queryClient.setQueryData(["events", eventId], context.previousEvent);
      }
      toast.error(TOAST_MESSAGES.ERROR_GENERIC);
    },
    onSettled: (_, __, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["events", eventId] });
    },
  });
}

// Block CRUD hooks
export function useAddBlockToEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: CreateBlockDto }) =>
      api.addBlockToEvent(eventId, data),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["events", eventId] });
      toast.success(TOAST_MESSAGES.BLOCK_ADDED_TO_EVENT);
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.ERROR_GENERIC);
    },
  });
}

export function useUpdateEventBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, blockId, data }: { eventId: string; blockId: string; data: UpdateBlockDto }) =>
      api.updateEventBlock(eventId, blockId, data),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["events", eventId] });
      toast.success(TOAST_MESSAGES.BLOCK_UPDATED);
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.ERROR_GENERIC);
    },
  });
}

export function useRemoveBlockFromEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, blockId }: { eventId: string; blockId: string }) =>
      api.removeBlockFromEvent(eventId, blockId),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["events", eventId] });
      toast.success(TOAST_MESSAGES.BLOCK_REMOVED);
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.ERROR_GENERIC);
    },
  });
}
