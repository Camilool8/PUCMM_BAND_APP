export const APP_VERSION = "1.8";

export interface ReleaseHighlight {
  icon: string;
  title: string;
  description: string;
}

export interface ReleaseNote {
  version: string;
  date: string;
  title: string;
  highlights: ReleaseHighlight[];
}

export const releaseNotes: ReleaseNote[] = [
  {
    version: "1.8",
    date: "15 de febrero, 2026",
    title: "Ensayos y Reproductor Musical",
    highlights: [
      {
        icon: "ClipboardCheck",
        title: "Gestión de Ensayos",
        description:
          "Crea y gestiona ensayos con setlists, bloques y asistencia GPS. Controla quién asistió con check-in automático por ubicación.",
      },
      {
        icon: "Music",
        title: "Reproductor en Eventos y Ensayos",
        description:
          "Reproduce el setlist completo directamente desde eventos y ensayos. Navega entre canciones con los controles del reproductor.",
      },
      {
        icon: "Headphones",
        title: "Soporte Spotify",
        description:
          "Spotify gratis reproduce muestras de 30 segundos. Con Spotify Premium, escucha las canciones completas. YouTube funciona para todos sin restricciones.",
      },
      {
        icon: "GraduationCap",
        title: "Tutorial de Ensayos",
        description:
          "Nuevo tutorial disponible en Guías para aprender a usar la sección de ensayos y todas sus funcionalidades.",
      },
    ],
  },
];

const VERSION_SEEN_KEY = "band-app-version-seen";

export function getSeenVersion(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(VERSION_SEEN_KEY);
}

export function markVersionSeen(version: string): void {
  localStorage.setItem(VERSION_SEEN_KEY, version);
}
