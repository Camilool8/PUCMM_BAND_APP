"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, Concert, CreateConcertDto, UpdateConcertDto } from "@/lib/api";
import { TOAST_MESSAGES } from "@/lib/toast";

export function useConcerts() {
  return useQuery({
    queryKey: ["concerts"],
    queryFn: () => api.getConcerts(),
  });
}

export function useConcertsByEvent(eventId: string) {
  return useQuery({
    queryKey: ["concerts", "event", eventId],
    queryFn: () => api.getConcertsByEvent(eventId),
    enabled: !!eventId,
  });
}

export function useConcert(id: string) {
  return useQuery({
    queryKey: ["concerts", id],
    queryFn: () => api.getConcert(id),
    enabled: !!id,
  });
}

export function useCreateConcert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConcertDto) => api.createConcert(data),
    onSuccess: (concert) => {
      queryClient.invalidateQueries({ queryKey: ["concerts"] });
      queryClient.invalidateQueries({ queryKey: ["concerts", "event", concert.eventId] });
      queryClient.invalidateQueries({ queryKey: ["events", concert.eventId] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success(TOAST_MESSAGES.CONCERT_CREATED);
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.ERROR_GENERIC);
    },
  });
}

export function useUpdateConcert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateConcertDto }) =>
      api.updateConcert(id, data),
    onSuccess: (concert, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["concerts"] });
      queryClient.invalidateQueries({ queryKey: ["concerts", id] });
      queryClient.invalidateQueries({ queryKey: ["concerts", "event", concert.eventId] });
      queryClient.invalidateQueries({ queryKey: ["events", concert.eventId] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success(TOAST_MESSAGES.CONCERT_UPDATED);
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.ERROR_GENERIC);
    },
  });
}

export function useDeleteConcert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, eventId }: { id: string; eventId: string }) => api.deleteConcert(id),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["concerts"] });
      queryClient.invalidateQueries({ queryKey: ["concerts", "event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["events", eventId] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success(TOAST_MESSAGES.CONCERT_DELETED);
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.ERROR_GENERIC);
    },
  });
}

export function useAddSongToConcert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ concertId, songId }: { concertId: string; songId: string }) =>
      api.addSongToConcert(concertId, songId),
    onSuccess: (concert, { concertId }) => {
      queryClient.invalidateQueries({ queryKey: ["concerts"] });
      queryClient.invalidateQueries({ queryKey: ["concerts", concertId] });
      queryClient.invalidateQueries({ queryKey: ["concerts", "event", concert.eventId] });
      toast.success(TOAST_MESSAGES.SONG_ADDED_TO_CONCERT);
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.ERROR_GENERIC);
    },
  });
}

export function useRemoveSongFromConcert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ concertId, songId }: { concertId: string; songId: string }) =>
      api.removeSongFromConcert(concertId, songId),
    onSuccess: (concert, { concertId }) => {
      queryClient.invalidateQueries({ queryKey: ["concerts"] });
      queryClient.invalidateQueries({ queryKey: ["concerts", concertId] });
      queryClient.invalidateQueries({ queryKey: ["concerts", "event", concert.eventId] });
      toast.success(TOAST_MESSAGES.SONG_REMOVED_FROM_CONCERT);
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.ERROR_GENERIC);
    },
  });
}

export function useCopyEventSongsToConcert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (concertId: string) => api.copyEventSongsToConcert(concertId),
    onSuccess: (concert, concertId) => {
      queryClient.invalidateQueries({ queryKey: ["concerts"] });
      queryClient.invalidateQueries({ queryKey: ["concerts", concertId] });
      queryClient.invalidateQueries({ queryKey: ["concerts", "event", concert.eventId] });
      toast.success(TOAST_MESSAGES.SONGS_COPIED_FROM_EVENT);
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.ERROR_GENERIC);
    },
  });
}

export function useReorderConcertSongs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ concertId, songIds }: { concertId: string; songIds: string[] }) =>
      api.reorderConcertSongs(concertId, songIds),
    onSuccess: (concert, { concertId }) => {
      queryClient.invalidateQueries({ queryKey: ["concerts"] });
      queryClient.invalidateQueries({ queryKey: ["concerts", concertId] });
      queryClient.invalidateQueries({ queryKey: ["concerts", "event", concert.eventId] });
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.ERROR_GENERIC);
    },
  });
}
