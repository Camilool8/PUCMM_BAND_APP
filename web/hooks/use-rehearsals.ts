"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  api,
  Rehearsal,
  CreateRehearsalDto,
  UpdateRehearsalDto,
  CreateBlockDto,
  UpdateBlockDto,
  CheckInDto,
  AdminAttendanceDto,
} from "@/lib/api";
import { TOAST_MESSAGES } from "@/lib/toast";

// ── Queries ────────────────────────────────────────────────────

export function useRehearsals() {
  return useQuery({
    queryKey: ["rehearsals"],
    queryFn: () => api.getRehearsals(),
  });
}

export function useRehearsalsByEvent(eventId: string) {
  return useQuery({
    queryKey: ["rehearsals", "event", eventId],
    queryFn: () => api.getRehearsalsByEvent(eventId),
    enabled: !!eventId,
  });
}

export function useRehearsal(id: string) {
  return useQuery({
    queryKey: ["rehearsals", id],
    queryFn: () => api.getRehearsal(id),
    enabled: !!id,
  });
}

// ── CRUD Mutations ─────────────────────────────────────────────

export function useCreateRehearsal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRehearsalDto) => api.createRehearsal(data),
    onSuccess: (rehearsal) => {
      queryClient.invalidateQueries({ queryKey: ["rehearsals"] });
      if (rehearsal.eventId) {
        queryClient.invalidateQueries({ queryKey: ["rehearsals", "event", rehearsal.eventId] });
        queryClient.invalidateQueries({ queryKey: ["events", rehearsal.eventId] });
        queryClient.invalidateQueries({ queryKey: ["events"] });
      }
      toast.success(TOAST_MESSAGES.REHEARSAL_CREATED);
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.ERROR_GENERIC);
    },
  });
}

export function useUpdateRehearsal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRehearsalDto }) =>
      api.updateRehearsal(id, data),
    onSuccess: (rehearsal, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["rehearsals"] });
      queryClient.invalidateQueries({ queryKey: ["rehearsals", id] });
      if (rehearsal.eventId) {
        queryClient.invalidateQueries({ queryKey: ["rehearsals", "event", rehearsal.eventId] });
        queryClient.invalidateQueries({ queryKey: ["events", rehearsal.eventId] });
        queryClient.invalidateQueries({ queryKey: ["events"] });
      }
      toast.success(TOAST_MESSAGES.REHEARSAL_UPDATED);
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.ERROR_GENERIC);
    },
  });
}

export function useDeleteRehearsal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, eventId }: { id: string; eventId?: string | null }) =>
      api.deleteRehearsal(id),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["rehearsals"] });
      if (eventId) {
        queryClient.invalidateQueries({ queryKey: ["rehearsals", "event", eventId] });
        queryClient.invalidateQueries({ queryKey: ["events", eventId] });
        queryClient.invalidateQueries({ queryKey: ["events"] });
      }
      toast.success(TOAST_MESSAGES.REHEARSAL_DELETED);
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.ERROR_GENERIC);
    },
  });
}

// ── Song Management ────────────────────────────────────────────

export function useAddSongToRehearsal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rehearsalId, songId }: { rehearsalId: string; songId: string }) =>
      api.addSongToRehearsal(rehearsalId, songId),
    onSuccess: (rehearsal, { rehearsalId }) => {
      queryClient.invalidateQueries({ queryKey: ["rehearsals"] });
      queryClient.invalidateQueries({ queryKey: ["rehearsals", rehearsalId] });
      toast.success(TOAST_MESSAGES.SONG_ADDED_TO_REHEARSAL);
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.ERROR_GENERIC);
    },
  });
}

export function useAddSongsToRehearsalBulk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rehearsalId, songIds }: { rehearsalId: string; songIds: string[] }) =>
      api.addSongsToRehearsalBulk(rehearsalId, songIds),
    onSuccess: (rehearsal, { rehearsalId }) => {
      queryClient.invalidateQueries({ queryKey: ["rehearsals"] });
      queryClient.invalidateQueries({ queryKey: ["rehearsals", rehearsalId] });
      toast.success(TOAST_MESSAGES.SONGS_ADDED_TO_REHEARSAL_BULK);
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.ERROR_GENERIC);
    },
  });
}

export function useRemoveSongFromRehearsal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rehearsalId, songId }: { rehearsalId: string; songId: string }) =>
      api.removeSongFromRehearsal(rehearsalId, songId),
    onSuccess: (rehearsal, { rehearsalId }) => {
      queryClient.invalidateQueries({ queryKey: ["rehearsals"] });
      queryClient.invalidateQueries({ queryKey: ["rehearsals", rehearsalId] });
      toast.success(TOAST_MESSAGES.SONG_REMOVED_FROM_REHEARSAL);
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.ERROR_GENERIC);
    },
  });
}

export function useCopyEventSongsToRehearsal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rehearsalId: string) => api.copyEventSongsToRehearsal(rehearsalId),
    onSuccess: (rehearsal, rehearsalId) => {
      queryClient.invalidateQueries({ queryKey: ["rehearsals"] });
      queryClient.invalidateQueries({ queryKey: ["rehearsals", rehearsalId] });
      toast.success(TOAST_MESSAGES.SONGS_COPIED_FROM_EVENT_TO_REHEARSAL);
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.ERROR_GENERIC);
    },
  });
}

// ── Setlist Reorder ────────────────────────────────────────────

export function useReorderRehearsalSetlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rehearsalId, items }: { rehearsalId: string; items: { id: string; itemType: "song" | "block" }[] }) =>
      api.reorderRehearsalSetlist(rehearsalId, items),
    onMutate: async ({ rehearsalId, items }) => {
      await queryClient.cancelQueries({ queryKey: ["rehearsals", rehearsalId] });
      const previousRehearsal = queryClient.getQueryData<Rehearsal>(["rehearsals", rehearsalId]);

      if (previousRehearsal?.setlistItems) {
        const reorderedItems = items
          .map((item, index) => {
            const existing = previousRehearsal.setlistItems!.find((si) => si.id === item.id);
            return existing ? { ...existing, order: index } : null;
          })
          .filter(Boolean);

        queryClient.setQueryData<Rehearsal>(["rehearsals", rehearsalId], {
          ...previousRehearsal,
          setlistItems: reorderedItems as Rehearsal["setlistItems"],
        });
      }

      return { previousRehearsal };
    },
    onError: (_err, { rehearsalId }, context) => {
      if (context?.previousRehearsal) {
        queryClient.setQueryData(["rehearsals", rehearsalId], context.previousRehearsal);
      }
      toast.error(TOAST_MESSAGES.ERROR_GENERIC);
    },
    onSettled: (_, __, { rehearsalId }) => {
      queryClient.invalidateQueries({ queryKey: ["rehearsals", rehearsalId] });
    },
  });
}

// ── Block Management ───────────────────────────────────────────

export function useAddBlockToRehearsal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rehearsalId, data }: { rehearsalId: string; data: CreateBlockDto }) =>
      api.addBlockToRehearsal(rehearsalId, data),
    onSuccess: (rehearsal, { rehearsalId }) => {
      queryClient.invalidateQueries({ queryKey: ["rehearsals"] });
      queryClient.invalidateQueries({ queryKey: ["rehearsals", rehearsalId] });
      toast.success(TOAST_MESSAGES.BLOCK_ADDED_TO_REHEARSAL);
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.ERROR_GENERIC);
    },
  });
}

export function useUpdateRehearsalBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rehearsalId, blockId, data }: { rehearsalId: string; blockId: string; data: UpdateBlockDto }) =>
      api.updateRehearsalBlock(rehearsalId, blockId, data),
    onSuccess: (rehearsal, { rehearsalId }) => {
      queryClient.invalidateQueries({ queryKey: ["rehearsals"] });
      queryClient.invalidateQueries({ queryKey: ["rehearsals", rehearsalId] });
      toast.success(TOAST_MESSAGES.BLOCK_UPDATED);
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.ERROR_GENERIC);
    },
  });
}

export function useRemoveBlockFromRehearsal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rehearsalId, blockId }: { rehearsalId: string; blockId: string }) =>
      api.removeBlockFromRehearsal(rehearsalId, blockId),
    onSuccess: (rehearsal, { rehearsalId }) => {
      queryClient.invalidateQueries({ queryKey: ["rehearsals"] });
      queryClient.invalidateQueries({ queryKey: ["rehearsals", rehearsalId] });
      toast.success(TOAST_MESSAGES.BLOCK_REMOVED);
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.ERROR_GENERIC);
    },
  });
}

// ── Attendance ─────────────────────────────────────────────────

export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rehearsalId, data }: { rehearsalId: string; data: CheckInDto }) =>
      api.checkInToRehearsal(rehearsalId, data),
    onSuccess: (rehearsal, { rehearsalId }) => {
      queryClient.invalidateQueries({ queryKey: ["rehearsals", rehearsalId] });
      toast.success(TOAST_MESSAGES.CHECK_IN_SUCCESS);
    },
    onError: (error: any) => {
      const message = error?.message?.includes("403")
        ? TOAST_MESSAGES.CHECK_IN_OUT_OF_RANGE
        : TOAST_MESSAGES.ERROR_GENERIC;
      toast.error(message);
    },
  });
}

export function useAdminMarkAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rehearsalId, data }: { rehearsalId: string; data: AdminAttendanceDto }) =>
      api.adminMarkAttendance(rehearsalId, data),
    onSuccess: (rehearsal, { rehearsalId }) => {
      queryClient.invalidateQueries({ queryKey: ["rehearsals", rehearsalId] });
      toast.success(TOAST_MESSAGES.ATTENDANCE_MARKED);
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.ERROR_GENERIC);
    },
  });
}

export function useRemoveAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rehearsalId, userId }: { rehearsalId: string; userId: string }) =>
      api.removeAttendance(rehearsalId, userId),
    onSuccess: (rehearsal, { rehearsalId }) => {
      queryClient.invalidateQueries({ queryKey: ["rehearsals", rehearsalId] });
      toast.success(TOAST_MESSAGES.ATTENDANCE_REMOVED);
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.ERROR_GENERIC);
    },
  });
}
