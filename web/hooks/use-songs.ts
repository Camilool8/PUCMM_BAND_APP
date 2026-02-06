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

// ============================================================================
// Voting
// ============================================================================

export function useMyVotes() {
  return useQuery({
    queryKey: ["my-votes"],
    queryFn: () => api.getMyVotes(),
  });
}

export function useVoteSong() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (songId: string) => api.voteSong(songId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
      queryClient.invalidateQueries({ queryKey: ["my-votes"] });
      toast.success("Voto registrado");
    },
    onError: () => {
      toast.error("No se pudo votar");
    },
  });
}

export function useUnvoteSong() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (songId: string) => api.unvoteSong(songId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
      queryClient.invalidateQueries({ queryKey: ["my-votes"] });
      toast.success("Voto eliminado");
    },
    onError: () => {
      toast.error("No se pudo eliminar el voto");
    },
  });
}

export function useAddGoldenVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (songId: string) => api.addGoldenVote(songId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
      queryClient.invalidateQueries({ queryKey: ["my-votes"] });
      toast.success("Voto dorado asignado");
    },
    onError: () => {
      toast.error("No se pudo asignar el voto dorado");
    },
  });
}

export function useRemoveGoldenVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (songId: string) => api.removeGoldenVote(songId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
      queryClient.invalidateQueries({ queryKey: ["my-votes"] });
      toast.success("Voto dorado removido");
    },
    onError: () => {
      toast.error("No se pudo remover el voto dorado");
    },
  });
}

// ============================================================================
// Lead Vocals
// ============================================================================

export function useAddLeadVocal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ songId, userId }: { songId: string; userId: string }) =>
      api.addLeadVocal(songId, userId),
    onSuccess: (_, { songId }) => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
      queryClient.invalidateQueries({ queryKey: ["songs", songId] });
      toast.success("Voz principal asignada");
    },
    onError: () => {
      toast.error("No se pudo asignar la voz");
    },
  });
}

export function useRemoveLeadVocal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ songId, userId }: { songId: string; userId: string }) =>
      api.removeLeadVocal(songId, userId),
    onSuccess: (_, { songId }) => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
      queryClient.invalidateQueries({ queryKey: ["songs", songId] });
      toast.success("Voz principal removida");
    },
    onError: () => {
      toast.error("No se pudo remover la voz");
    },
  });
}

export function useSetLeadVocals() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ songId, userIds }: { songId: string; userIds: string[] }) =>
      api.setLeadVocals(songId, userIds),
    onSuccess: (_, { songId }) => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
      queryClient.invalidateQueries({ queryKey: ["songs", songId] });
      toast.success("Voces principales actualizadas");
    },
    onError: () => {
      toast.error("No se pudieron actualizar las voces");
    },
  });
}

// ============================================================================
// Duplicate Detection
// ============================================================================

export function useCheckDuplicate() {
  return useMutation({
    mutationFn: ({ title, artist, isrc }: { title: string; artist: string; isrc?: string }) =>
      api.checkDuplicate(title, artist, isrc),
  });
}
