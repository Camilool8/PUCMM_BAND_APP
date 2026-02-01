"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, Song, CreateSongDto, UpdateSongDto } from "@/lib/api";
import { TOAST_MESSAGES } from "@/lib/toast";

export function useSongs() {
  return useQuery({
    queryKey: ["songs"],
    queryFn: () => api.getSongs(),
  });
}

export function useSong(id: string) {
  return useQuery({
    queryKey: ["songs", id],
    queryFn: () => api.getSong(id),
    enabled: !!id,
  });
}

export function useCreateSong() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSongDto) => api.createSong(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
      // Differentiate between admin create and suggestion
      const message =
        !data.status || data.status === "PENDING"
          ? TOAST_MESSAGES.SONG_SUGGESTION_SENT
          : TOAST_MESSAGES.SONG_CREATED;
      toast.success(message);
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.ERROR_GENERIC);
    },
  });
}

export function useUpdateSong() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSongDto }) =>
      api.updateSong(id, data),
    onSuccess: (_, { id, data }) => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
      queryClient.invalidateQueries({ queryKey: ["songs", id] });
      // Show specific message for status changes vs field edits
      const message = data.status
        ? TOAST_MESSAGES.STATUS_CHANGED
        : TOAST_MESSAGES.SONG_UPDATED;
      toast.success(message);
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.ERROR_GENERIC);
    },
  });
}

export function useDeleteSong() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteSong(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
      toast.success(TOAST_MESSAGES.SONG_DELETED);
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.ERROR_GENERIC);
    },
  });
}
