import { toast } from "sonner";

// Spanish messages for common actions
export const TOAST_MESSAGES = {
  // Songs
  SONG_CREATED: "Canción creada exitosamente",
  SONG_UPDATED: "Canción actualizada",
  SONG_DELETED: "Canción eliminada",
  SONG_SUGGESTION_SENT: "Sugerencia enviada para revisión",
  STATUS_CHANGED: "Estado actualizado",

  // Users
  ROLE_UPDATED: "Rol actualizado exitosamente",

  // Errors
  ERROR_GENERIC: "Ocurrió un error. Intenta de nuevo.",
  ERROR_NETWORK: "Error de conexión. Verifica tu red.",
};

// Wrapper functions for consistent usage
export const showToast = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  loading: (message: string) => toast.loading(message),
  dismiss: (id?: string | number) => toast.dismiss(id),
};
