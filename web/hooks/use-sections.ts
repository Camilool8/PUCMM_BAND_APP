"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, RepertoireSection, UpdateSectionDto } from "@/lib/api";

export function useSections() {
  return useQuery({
    queryKey: ["repertoire-sections"],
    queryFn: () => api.getSections(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSection(key: string) {
  return useQuery({
    queryKey: ["repertoire-sections", key],
    queryFn: () => api.getSection(key),
    enabled: !!key,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, data }: { key: string; data: UpdateSectionDto }) =>
      api.updateSection(key, data),
    onSuccess: (updatedSection) => {
      // Update the sections list cache
      queryClient.setQueryData<RepertoireSection[]>(
        ["repertoire-sections"],
        (old) =>
          old?.map((section) =>
            section.key === updatedSection.key ? updatedSection : section
          )
      );
      // Update the individual section cache
      queryClient.setQueryData(
        ["repertoire-sections", updatedSection.key],
        updatedSection
      );
    },
  });
}

export function useClearSectionBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (key: string) => api.clearSectionBanner(key),
    onSuccess: (updatedSection) => {
      queryClient.setQueryData<RepertoireSection[]>(
        ["repertoire-sections"],
        (old) =>
          old?.map((section) =>
            section.key === updatedSection.key ? updatedSection : section
          )
      );
      queryClient.setQueryData(
        ["repertoire-sections", updatedSection.key],
        updatedSection
      );
    },
  });
}
