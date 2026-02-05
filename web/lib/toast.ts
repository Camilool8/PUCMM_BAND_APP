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

  // Events
  EVENT_CREATED: "Evento creado exitosamente",
  EVENT_UPDATED: "Evento actualizado",
  EVENT_DELETED: "Evento eliminado",
  SONG_ADDED_TO_EVENT: "Cancion agregada al evento",
  SONGS_ADDED_TO_EVENT_BULK: "Canciones agregadas al evento",
  SONG_REMOVED_FROM_EVENT: "Cancion removida del evento",
  BLOCK_ADDED_TO_EVENT: "Bloque agregado al setlist",
  BLOCK_UPDATED: "Bloque actualizado",
  BLOCK_REMOVED: "Bloque removido del setlist",

  // Concerts
  CONCERT_CREATED: "Concierto creado exitosamente",
  CONCERT_UPDATED: "Concierto actualizado",
  CONCERT_DELETED: "Concierto eliminado",
  SONG_ADDED_TO_CONCERT: "Canción agregada al concierto",
  SONGS_ADDED_TO_CONCERT_BULK: "Canciones agregadas al concierto",
  SONG_REMOVED_FROM_CONCERT: "Canción removida del concierto",
  SONGS_COPIED_FROM_EVENT: "Setlist copiado del evento",
  BLOCK_ADDED_TO_CONCERT: "Bloque agregado al setlist",

  // Uploads
  UPLOAD_SUCCESS: "Archivo subido exitosamente",
  UPLOAD_ERROR: "Error al subir archivo",
  ASSET_LINKED: "Archivo vinculado exitosamente",
  ASSET_DELETED: "Archivo eliminado",
  FILE_TOO_LARGE: "El archivo es muy grande",
  FILE_TYPE_INVALID: "Tipo de archivo no permitido",

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
