"use client";

import { useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, UploadResponse, Asset, AssetType, CreateAssetDto } from "@/lib/api";

// File size limits (must match backend)
export const FILE_LIMITS = {
  image: 15 * 1024 * 1024,       // 15 MB
  pdf: 150 * 1024 * 1024,        // 150 MB
  video: 1.5 * 1024 * 1024 * 1024, // 1.5 GB
};

// Allowed MIME types
export const ALLOWED_TYPES = {
  image: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  pdf: ["application/pdf"],
  video: ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"],
};

// Human-readable file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Validate file before upload
export function validateFile(
  file: File,
  type: "image" | "pdf" | "video"
): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > FILE_LIMITS[type]) {
    return {
      valid: false,
      error: `El archivo es muy grande. Máximo: ${formatFileSize(FILE_LIMITS[type])}`,
    };
  }

  // Check MIME type
  if (!ALLOWED_TYPES[type].includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de archivo no permitido. Tipos aceptados: ${ALLOWED_TYPES[type].join(", ")}`,
    };
  }

  return { valid: true };
}

export interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

// ============================================================================
// Upload Hook with Progress Tracking
// ============================================================================

export function useUpload(type: "image" | "pdf" | "video") {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });

  const reset = useCallback(() => {
    setState({ isUploading: false, progress: 0, error: null });
  }, []);

  const upload = useCallback(
    async (file: File): Promise<UploadResponse | null> => {
      // Validate file
      const validation = validateFile(file, type);
      if (!validation.valid) {
        setState({ isUploading: false, progress: 0, error: validation.error || "Invalid file" });
        toast.error(validation.error || "Archivo inválido");
        return null;
      }

      setState({ isUploading: true, progress: 0, error: null });

      try {
        const uploadFn =
          type === "image"
            ? api.uploadImage
            : type === "pdf"
            ? api.uploadPdf
            : api.uploadVideo;

        const response = await uploadFn.call(api, file, (progress) => {
          setState((prev) => ({ ...prev, progress }));
        });

        setState({ isUploading: false, progress: 100, error: null });
        toast.success("Archivo subido exitosamente");
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error al subir archivo";
        setState({ isUploading: false, progress: 0, error: errorMessage });
        toast.error(errorMessage);
        return null;
      }
    },
    [type]
  );

  return {
    ...state,
    upload,
    reset,
  };
}

// ============================================================================
// Asset Mutations
// ============================================================================

export function useCreateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAssetDto) => api.createAsset(data),
    onSuccess: (_, variables) => {
      if (variables.songId) {
        queryClient.invalidateQueries({ queryKey: ["assets", "song", variables.songId] });
      }
      if (variables.concertId) {
        queryClient.invalidateQueries({ queryKey: ["assets", "concert", variables.concertId] });
      }
      toast.success("Archivo vinculado exitosamente");
    },
    onError: () => {
      toast.error("Error al vincular archivo");
    },
  });
}

export function useDeleteAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      toast.success("Archivo eliminado");
    },
    onError: () => {
      toast.error("Error al eliminar archivo");
    },
  });
}

// ============================================================================
// Asset Queries
// ============================================================================

export function useSongAssets(songId: string) {
  return useQuery({
    queryKey: ["assets", "song", songId],
    queryFn: () => api.getAssetsBySong(songId),
    enabled: !!songId,
  });
}

export function useConcertAssets(concertId: string) {
  return useQuery({
    queryKey: ["assets", "concert", concertId],
    queryFn: () => api.getAssetsByConcert(concertId),
    enabled: !!concertId,
  });
}
