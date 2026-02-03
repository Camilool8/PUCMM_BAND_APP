import type { TourStep } from "./tour-engine";
import { navigate, openModal, closeModal, wait, click } from "./tour-engine";

// ============================================================================
// Types (re-exported from TourProvider for convenience)
// ============================================================================

export type MiniTourId =
  // Navigation
  | "nav-overview"
  // Songs
  | "songs-browse"
  | "songs-suggest"
  | "songs-vote"
  | "songs-admin"
  | "songs-details"
  // Events
  | "events-browse"
  | "events-admin"
  | "events-setlist"
  // Concerts
  | "concerts-browse"
  | "concerts-admin"
  // Profile
  | "profile-edit"
  // Admin
  | "users-admin";

export type AggregatedTourId = "welcome" | "role-upgrade";
export type TourId = MiniTourId | AggregatedTourId;
export type UserRole = "SUPERADMIN" | "SECTION_LEADER" | "MEMBER" | "ALUMNI_GUEST";

export interface MiniTour {
  id: MiniTourId;
  title: string;
  description: string;
  icon: string;
  category: "navigation" | "songs" | "events" | "concerts" | "profile" | "admin";
  minRole: UserRole;
  steps: TourStep[];
  targetPage?: string;
}

export interface AggregatedTour {
  id: AggregatedTourId;
  title: string;
  description: string;
  icon: string;
  getMiniTourIds: (role: UserRole, previousRole?: UserRole) => MiniTourId[];
}

// ============================================================================
// Role Hierarchy
// ============================================================================

const ROLE_HIERARCHY: Record<UserRole, number> = {
  ALUMNI_GUEST: 0,
  MEMBER: 1,
  SECTION_LEADER: 2,
  SUPERADMIN: 3,
};

export function isRoleUpgrade(previousRole: UserRole, currentRole: UserRole): boolean {
  return ROLE_HIERARCHY[currentRole] > ROLE_HIERARCHY[previousRole];
}

export function getNewCapabilities(previousRole: UserRole, currentRole: UserRole): MiniTourId[] {
  const prevLevel = ROLE_HIERARCHY[previousRole];
  const currLevel = ROLE_HIERARCHY[currentRole];

  if (currLevel <= prevLevel) return [];

  const newTours: MiniTourId[] = [];

  // ALUMNI_GUEST -> MEMBER
  if (prevLevel < 1 && currLevel >= 1) {
    newTours.push("songs-suggest", "songs-vote", "profile-edit");
  }

  // MEMBER -> SECTION_LEADER
  if (prevLevel < 2 && currLevel >= 2) {
    newTours.push("songs-admin", "events-admin", "concerts-admin", "events-setlist");
  }

  // SECTION_LEADER -> SUPERADMIN
  if (prevLevel < 3 && currLevel >= 3) {
    newTours.push("users-admin");
  }

  return newTours;
}

// ============================================================================
// Mini Tours Definitions
// ============================================================================

export const miniTours: MiniTour[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // NAVIGATION
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "nav-overview",
    title: "Navegación",
    description: "Conoce las secciones de la app",
    icon: "Compass",
    category: "navigation",
    minRole: "ALUMNI_GUEST",
    steps: [
      {
        id: "nav-welcome",
        popover: {
          title: "¡Bienvenido a PUCMM Band!",
          description: "Te mostraremos cómo navegar. En móvil usa la barra inferior, en desktop el menú lateral.",
        },
      },
      {
        id: "nav-home",
        element: {
          mobile: "[data-tour='nav-home-mobile']",
          desktop: "[data-tour='nav-home']",
        },
        popover: {
          title: "Inicio",
          description: "Tu página principal con estadísticas y accesos rápidos.",
          side: "top",
        },
      },
      {
        id: "nav-songs",
        element: {
          mobile: "[data-tour='nav-songs-mobile']",
          desktop: "[data-tour='nav-songs']",
        },
        popover: {
          title: "Repertorio",
          description: "Todas las canciones organizadas por estado.",
          side: "top",
        },
      },
      {
        id: "nav-events",
        element: {
          mobile: "[data-tour='nav-events-mobile']",
          desktop: "[data-tour='nav-events']",
        },
        popover: {
          title: "Eventos",
          description: "Eventos como Navidad, Graduación, con sus setlists.",
          side: "top",
        },
      },
      {
        id: "nav-more-mobile",
        element: {
          mobile: "[data-tour='nav-more']",
          desktop: "", // No element on desktop, step will be skipped visually
        },
        popover: {
          title: "Menú Más",
          description: "Toca aquí para ver Conciertos y Guías.",
          side: "top",
        },
        onNext: [click("[data-tour='nav-more']")],
      },
      {
        id: "nav-concerts",
        waitFor: "[data-tour='nav-concerts-mobile'], [data-tour='nav-concerts']",
        element: {
          mobile: "[data-tour='nav-concerts-mobile']",
          desktop: "[data-tour='nav-concerts']",
        },
        popover: {
          title: "Conciertos",
          description: "Ve las presentaciones próximas y pasadas.",
          side: "top",
        },
      },
      {
        id: "nav-guides",
        element: {
          mobile: "[data-tour='nav-guides-mobile']",
          desktop: "[data-tour='nav-guides']",
        },
        popover: {
          title: "Guías",
          description: "Tutoriales y ayuda sobre cada sección.",
          side: "top",
        },
      },
      {
        id: "nav-user",
        element: {
          mobile: "[data-tour='user-menu-mobile']",
          desktop: "[data-tour='user-menu']",
        },
        popover: {
          title: "Tu Perfil",
          description: "Accede a tu perfil y configuración.",
          side: "top",
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SONGS - BROWSE
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "songs-browse",
    title: "Explorar Repertorio",
    description: "Navega y busca canciones",
    icon: "Music",
    category: "songs",
    minRole: "ALUMNI_GUEST",
    targetPage: "/songs",
    steps: [
      {
        id: "songs-browse-1",
        beforeShow: [navigate("/songs")],
        waitFor: "[data-tour='section-header']",
        element: "[data-tour='section-header']",
        popover: {
          title: "Repertorio de la Banda",
          description: "Aquí encontrarás todas las canciones. El encabezado muestra la sección actual.",
          side: "bottom",
        },
      },
      {
        id: "songs-browse-2",
        element: "[data-tour='section-tabs']",
        popover: {
          title: "Filtrar por Estado",
          description: "Usa estas pestañas para ver: Repertorio activo (listas y ensayando), Sugerencias (pendientes) o Archivo.",
          side: "bottom",
        },
      },
      {
        id: "songs-browse-3",
        element: "[data-tour='song-row']",
        popover: {
          title: "Ver Detalles",
          description: "Haz clic en cualquier canción para ver información completa: letra, acordes, enlaces a Spotify/YouTube, partituras, y más.",
          side: "bottom",
        },
        allowInteraction: true,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SONGS - DETAILS (with modal interaction)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "songs-details",
    title: "Detalles de Canción",
    description: "Entiende toda la información disponible",
    icon: "FileText",
    category: "songs",
    minRole: "ALUMNI_GUEST",
    targetPage: "/songs",
    steps: [
      {
        id: "songs-details-1",
        beforeShow: [navigate("/songs")],
        waitFor: "[data-tour='song-row']",
        element: "[data-tour='song-row']",
        popover: {
          title: "Información de la Canción",
          description: "Haz clic en cualquier canción para ver sus detalles completos.",
          side: "bottom",
        },
        onNext: [openModal("song-detail")],
      },
      {
        id: "songs-details-2",
        waitFor: "[data-tour='song-detail-header']",
        element: "[data-tour='song-detail-header']",
        popover: {
          title: "Información Principal",
          description: "Aquí ves la carátula, título, artista, BPM y tonalidad. Todo lo básico para conocer la canción.",
          side: "bottom",
        },
      },
      {
        id: "songs-details-3",
        element: "[data-tour='song-platform-links']",
        popover: {
          title: "Escucha la Canción",
          description: "Accede directamente a Spotify, YouTube o Apple Music para escuchar la versión original.",
          side: "bottom",
        },
      },
      {
        id: "songs-details-4",
        element: "[data-tour='song-tabs']",
        popover: {
          title: "Pestañas de Contenido",
          description: "Navega entre Info (estado y voces), Partituras (PDFs) y Media (videos de ensayo).",
          side: "bottom",
        },
      },
      {
        id: "songs-details-5",
        element: "[data-tour='song-tab-scores']",
        popover: {
          title: "Partituras",
          description: "Aquí encontrarás las partituras en PDF. Puedes verlas directamente o descargarlas.",
          side: "bottom",
        },
        onNext: [click("[data-tour='song-tab-scores']")],
      },
      {
        id: "songs-details-6",
        element: "[data-tour='song-tab-media']",
        popover: {
          title: "Videos y Media",
          description: "Videos de ensayos, pistas de práctica y otro material multimedia.",
          side: "bottom",
        },
        onNext: [closeModal("song-detail")],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SONGS - SUGGEST (Member only - admins use songs-admin)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "songs-suggest",
    title: "Sugerir Canciones",
    description: "Propón nuevas canciones para el repertorio",
    icon: "Sparkles",
    category: "songs",
    minRole: "MEMBER",
    targetPage: "/songs",
    steps: [
      {
        id: "songs-suggest-1",
        beforeShow: [navigate("/songs")],
        waitFor: "[data-tour='suggest-song-btn']",
        popover: {
          title: "¡Sugiere Canciones!",
          description: "Como miembro, puedes proponer canciones para que la banda las considere.",
        },
      },
      {
        id: "songs-suggest-2",
        element: "[data-tour='suggest-song-btn']",
        popover: {
          title: "Botón de Sugerir",
          description: "Haz clic aquí para abrir el formulario de sugerencia. ¡Vamos a hacer una demo!",
          side: "left",
        },
        onNext: [openModal("suggestion")],
      },
      {
        id: "songs-suggest-3",
        waitFor: "[data-tour='suggestion-modal']",
        element: "[data-tour='suggestion-link-input']",
        popover: {
          title: "Paso 1: Pega un Enlace",
          description: "Copia un enlace de Spotify, YouTube o Apple Music. Por ejemplo: https://open.spotify.com/track/0Dm43YLUlGdePpSbI1ct8h",
          side: "bottom",
        },
      },
      {
        id: "songs-suggest-4",
        element: "[data-tour='suggestion-preview']",
        popover: {
          title: "Vista Previa Automática",
          description: "La información de la canción se carga automáticamente: título, artista, carátula, BPM y tonalidad. Puedes editarla si es necesario.",
          side: "left",
        },
      },
      {
        id: "songs-suggest-5",
        popover: {
          title: "Paso 2: Revisa y Envía",
          description: "Verifica que los datos sean correctos y presiona 'Enviar Sugerencia'. Aparecerá en la pestaña 'Sugerencias' para revisión de los administradores.",
        },
        onNext: [closeModal("suggestion")],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SONGS - VOTE (Member+)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "songs-vote",
    title: "Votar por Sugerencias",
    description: "Apoya las canciones que te gustan",
    icon: "ThumbsUp",
    category: "songs",
    minRole: "MEMBER",
    targetPage: "/songs",
    steps: [
      {
        id: "songs-vote-1",
        beforeShow: [navigate("/songs")],
        popover: {
          title: "Sistema de Votación",
          description: "Puedes votar por las canciones sugeridas para mostrar tu apoyo. Las más votadas tienen mayor probabilidad de ser aprobadas.",
        },
      },
      {
        id: "songs-vote-2",
        popover: {
          title: "Cómo Votar",
          description: "Ve a la pestaña 'Sugerencias', haz clic en una canción y usa el botón de voto. Solo puedes votar una vez por canción.",
        },
      },
      {
        id: "songs-vote-3",
        popover: {
          title: "Contador de Votos",
          description: "Verás cuántos votos tiene cada sugerencia. Los administradores consideran esto al decidir qué canciones aprobar.",
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SONGS - ADMIN (Section Leader+)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "songs-admin",
    title: "Administrar Canciones",
    description: "Gestiona el repertorio completo",
    icon: "Settings",
    category: "songs",
    minRole: "SECTION_LEADER",
    targetPage: "/songs",
    steps: [
      {
        id: "songs-admin-1",
        beforeShow: [navigate("/songs")],
        waitFor: "[data-tour='add-song-btn']",
        popover: {
          title: "Gestión del Repertorio",
          description: "Como administrador, tienes control total sobre las canciones.",
        },
      },
      {
        id: "songs-admin-2",
        element: "[data-tour='add-song-btn']",
        popover: {
          title: "Agregar Canción",
          description: "Añade canciones directamente al repertorio con cualquier estado, sin pasar por sugerencias.",
          side: "left",
        },
        allowInteraction: true,
      },
      {
        id: "songs-admin-3",
        popover: {
          title: "Cambiar Estado",
          description: "En el detalle de cada canción puedes cambiar su estado: PENDING, REHEARSING, READY o ARCHIVED.",
        },
      },
      {
        id: "songs-admin-4",
        popover: {
          title: "Editar Información",
          description: "Modifica título, artista, BPM, tonalidad, género, enlaces y toda la información.",
        },
      },
      {
        id: "songs-admin-5",
        popover: {
          title: "Subir Partituras",
          description: "Sube archivos PDF con las partituras. Puedes etiquetar cada una por instrumento.",
        },
      },
      {
        id: "songs-admin-6",
        popover: {
          title: "Asignar Voces",
          description: "Selecciona qué miembros serán los cantantes de cada canción.",
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // EVENTS - BROWSE
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "events-browse",
    title: "Explorar Eventos",
    description: "Ve los eventos de la banda",
    icon: "Calendar",
    category: "events",
    minRole: "ALUMNI_GUEST",
    targetPage: "/events",
    steps: [
      {
        id: "events-browse-1",
        beforeShow: [navigate("/events")],
        waitFor: "[data-tour='events-header']",
        element: "[data-tour='events-header']",
        popover: {
          title: "Eventos de la Banda",
          description: "Los eventos son tipos recurrentes como Navidad, Graduación, etc. Cada uno tiene su setlist y conciertos.",
          side: "bottom",
        },
      },
      {
        id: "events-browse-2",
        element: "[data-tour='event-tabs']",
        popover: {
          title: "Seleccionar Evento",
          description: "Cada pestaña es un evento diferente. Haz clic en uno para ver sus detalles.",
          side: "bottom",
        },
        onNext: [click("[data-tour='event-tab-first']")],
      },
      {
        id: "events-browse-3",
        waitFor: "[data-tour='event-setlist']",
        element: "[data-tour='event-setlist']",
        popover: {
          title: "Setlist del Evento",
          description: "Aquí ves todas las canciones planificadas para este evento. Haz clic en cualquiera para ver sus detalles completos.",
          side: "top",
        },
      },
      {
        id: "events-browse-4",
        element: "[data-tour='event-concerts']",
        popover: {
          title: "Conciertos del Evento",
          description: "Lista de presentaciones programadas. Cada concierto tiene su propio setlist que puede variar del evento.",
          side: "top",
        },
      },
      {
        id: "events-browse-5",
        popover: {
          title: "Ver un Concierto",
          description: "Haz clic en cualquier concierto para ver su setlist específico, ubicación, hora y multimedia.",
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // EVENTS - ADMIN
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "events-admin",
    title: "Administrar Eventos",
    description: "Crea y gestiona eventos",
    icon: "CalendarPlus",
    category: "events",
    minRole: "SECTION_LEADER",
    targetPage: "/events",
    steps: [
      {
        id: "events-admin-1",
        beforeShow: [navigate("/events")],
        waitFor: "[data-tour='create-event-btn']",
        popover: {
          title: "Gestión de Eventos",
          description: "Como administrador, puedes crear nuevos eventos y personalizar los existentes.",
        },
      },
      {
        id: "events-admin-2",
        element: "[data-tour='create-event-btn']",
        popover: {
          title: "Crear Evento",
          description: "Haz clic aquí para crear un nuevo evento con nombre, tipo, banner e iconos personalizados.",
          side: "left",
        },
        allowInteraction: true,
      },
      {
        id: "events-admin-3",
        popover: {
          title: "Personalizar Apariencia",
          description: "Cada evento puede tener su propio banner, icono y colores para identificarlo fácilmente.",
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // EVENTS - SETLIST
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "events-setlist",
    title: "Gestionar Setlist",
    description: "Organiza las canciones del evento",
    icon: "ListMusic",
    category: "events",
    minRole: "SECTION_LEADER",
    targetPage: "/events",
    steps: [
      {
        id: "events-setlist-1",
        beforeShow: [navigate("/events")],
        popover: {
          title: "Setlist del Evento",
          description: "El setlist es la lista de canciones planificadas. Aprende a gestionarlo.",
        },
      },
      {
        id: "events-setlist-2",
        popover: {
          title: "Agregar Canciones",
          description: "Usa el botón 'Agregar' para buscar y añadir canciones del repertorio al setlist.",
        },
      },
      {
        id: "events-setlist-3",
        popover: {
          title: "Reordenar con Drag & Drop",
          description: "Arrastra las canciones para cambiar su orden. Se guarda automáticamente.",
        },
      },
      {
        id: "events-setlist-4",
        popover: {
          title: "Duración Total",
          description: "Verás la duración total estimada basada en las canciones agregadas.",
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CONCERTS - BROWSE
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "concerts-browse",
    title: "Explorar Conciertos",
    description: "Ve las presentaciones de la banda",
    icon: "Ticket",
    category: "concerts",
    minRole: "ALUMNI_GUEST",
    targetPage: "/concerts",
    steps: [
      {
        id: "concerts-browse-1",
        beforeShow: [navigate("/concerts")],
        waitFor: "[data-tour='concerts-header']",
        element: "[data-tour='concerts-header']",
        popover: {
          title: "Conciertos",
          description: "Aquí encontrarás todas las presentaciones de la banda, tanto próximas como pasadas.",
          side: "bottom",
        },
      },
      {
        id: "concerts-browse-2",
        element: "[data-tour='concerts-tabs']",
        popover: {
          title: "Filtrar Conciertos",
          description: "'Todos' muestra todo, 'Próximos' los que vienen, 'Pasados' el historial.",
          side: "bottom",
        },
      },
      {
        id: "concerts-browse-3",
        element: "[data-tour='concert-card']",
        popover: {
          title: "Tarjeta de Concierto",
          description: "Cada tarjeta muestra la fecha, ubicación y evento. Haz clic para ver los detalles.",
          side: "bottom",
        },
        onNext: [click("[data-tour='concert-card']")],
      },
      {
        id: "concerts-browse-4",
        waitFor: "[data-tour='concert-setlist']",
        element: "[data-tour='concert-setlist']",
        popover: {
          title: "Setlist del Concierto",
          description: "Las canciones específicas de esta presentación. Puede ser diferente al setlist del evento.",
          side: "top",
        },
      },
      {
        id: "concerts-browse-5",
        element: "[data-tour='concert-media']",
        popover: {
          title: "Multimedia del Concierto",
          description: "Fotos y videos de la presentación. Los administradores pueden subir contenido aquí.",
          side: "top",
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CONCERTS - ADMIN
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "concerts-admin",
    title: "Administrar Conciertos",
    description: "Crea y gestiona conciertos",
    icon: "CalendarCheck",
    category: "concerts",
    minRole: "SECTION_LEADER",
    targetPage: "/concerts",
    steps: [
      {
        id: "concerts-admin-1",
        beforeShow: [navigate("/concerts")],
        waitFor: "[data-tour='concerts-header']",
        popover: {
          title: "Gestión de Conciertos",
          description: "Como administrador, puedes crear conciertos, gestionar setlists y subir multimedia.",
        },
      },
      {
        id: "concerts-admin-2",
        popover: {
          title: "Crear desde Eventos",
          description: "Los conciertos se crean desde la página de Eventos. Cada concierto pertenece a un evento específico.",
        },
      },
      {
        id: "concerts-admin-3",
        element: "[data-tour='concert-card']",
        popover: {
          title: "Editar Concierto",
          description: "Haz clic en un concierto para editar sus detalles, setlist o subir multimedia.",
          side: "bottom",
        },
        onNext: [click("[data-tour='concert-card']")],
      },
      {
        id: "concerts-admin-4",
        waitFor: "[data-tour='concert-setlist']",
        element: "[data-tour='concert-setlist']",
        popover: {
          title: "Gestionar Setlist",
          description: "Agrega canciones, reordénalas con drag & drop, o usa 'Copiar del Evento' para empezar rápido.",
          side: "top",
        },
      },
      {
        id: "concerts-admin-5",
        element: "[data-tour='concert-media']",
        popover: {
          title: "Subir Multimedia",
          description: "Aquí puedes subir fotos y videos del concierto. Usa el botón 'Subir media' para agregar contenido.",
          side: "top",
        },
      },
      {
        id: "concerts-admin-6",
        element: "[data-tour='concert-upload-btn']",
        popover: {
          title: "Botón de Subir",
          description: "Haz clic aquí para subir videos o imágenes del concierto.",
          side: "left",
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PROFILE (Member+)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "profile-edit",
    title: "Tu Perfil",
    description: "Personaliza tu información",
    icon: "User",
    category: "profile",
    minRole: "MEMBER",
    steps: [
      {
        id: "profile-edit-1",
        element: {
          mobile: "[data-tour='user-menu-mobile']",
          desktop: "[data-tour='user-menu']",
        },
        popover: {
          title: "Abrir Perfil",
          description: "Toca aquí para ver y editar tu perfil.",
          side: "top",
        },
        allowInteraction: true,
      },
      {
        id: "profile-edit-2",
        popover: {
          title: "Foto de Perfil",
          description: "Toca tu avatar para subir una foto.",
        },
      },
      {
        id: "profile-edit-3",
        popover: {
          title: "Instrumentos",
          description: "Selecciona qué instrumentos tocas.",
        },
      },
      {
        id: "profile-edit-4",
        popover: {
          title: "Contacto",
          description: "Agrega teléfono y bio para que te contacten.",
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // USERS ADMIN (Superadmin)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "users-admin",
    title: "Administrar Usuarios",
    description: "Gestiona roles y permisos",
    icon: "Users",
    category: "admin",
    minRole: "SUPERADMIN",
    steps: [
      {
        id: "users-admin-1",
        element: {
          mobile: "[data-tour='nav-users-mobile']",
          desktop: "[data-tour='nav-users']",
        },
        popover: {
          title: "Gestión de Usuarios",
          description: "Toca aquí para abrir el panel de usuarios.",
          side: "top",
        },
        allowInteraction: true,
      },
      {
        id: "users-admin-2",
        popover: {
          title: "Roles",
          description: "SUPERADMIN: Todo. SECTION_LEADER: Repertorio. MEMBER: Sugerir. GUEST: Solo ver.",
        },
      },
      {
        id: "users-admin-3",
        popover: {
          title: "Cambiar Rol",
          description: "Toca un usuario para cambiar su rol. Se aplica al instante.",
        },
      },
      {
        id: "users-admin-4",
        popover: {
          title: "Nuevos Usuarios",
          description: "Entran como GUEST. Cámbialos a MEMBER para que participen.",
        },
      },
    ],
  },
];

// ============================================================================
// Aggregated Tours
// ============================================================================

export const aggregatedTours: AggregatedTour[] = [
  {
    id: "welcome",
    title: "Tour de Bienvenida",
    description: "Conoce todas las funciones disponibles para tu rol",
    icon: "Sparkles",
    getMiniTourIds: (role: UserRole) => {
      const tours: MiniTourId[] = ["nav-overview"];

      // Everyone gets browse tours
      tours.push("songs-browse", "songs-details", "events-browse", "concerts-browse");

      // Member features (but NOT admin - admins use songs-admin instead)
      if (role === "MEMBER") {
        tours.push("songs-suggest", "profile-edit");
      }

      // Section Leader+ features - they don't suggest, they add directly
      if (ROLE_HIERARCHY[role] >= ROLE_HIERARCHY.SECTION_LEADER) {
        tours.push("songs-admin", "events-admin", "events-setlist", "concerts-admin", "profile-edit");
      }

      // Superadmin features
      if (role === "SUPERADMIN") {
        tours.push("users-admin");
      }

      return tours;
    },
  },
  {
    id: "role-upgrade",
    title: "Nuevas Funcionalidades",
    description: "Ve qué puedes hacer con tu nuevo rol",
    icon: "ArrowUpCircle",
    getMiniTourIds: (role: UserRole, previousRole?: UserRole) => {
      if (!previousRole) return [];
      return getNewCapabilities(previousRole, role);
    },
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

export function getMiniToursForRole(role: UserRole): MiniTour[] {
  return miniTours.filter(
    (tour) => ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[tour.minRole]
  );
}

export function getMiniToursByCategory(role: UserRole): Record<string, MiniTour[]> {
  const available = getMiniToursForRole(role);
  return available.reduce((acc, tour) => {
    if (!acc[tour.category]) {
      acc[tour.category] = [];
    }
    acc[tour.category].push(tour);
    return acc;
  }, {} as Record<string, MiniTour[]>);
}

export function getMiniTour(id: MiniTourId): MiniTour | undefined {
  return miniTours.find((t) => t.id === id);
}

export function getAggregatedTourSteps(
  tourId: AggregatedTourId,
  role: UserRole,
  previousRole?: UserRole
): TourStep[] {
  const aggregated = aggregatedTours.find((t) => t.id === tourId);
  if (!aggregated) return [];

  const miniTourIds = aggregated.getMiniTourIds(role, previousRole);
  const steps: TourStep[] = [];

  for (const id of miniTourIds) {
    const miniTour = getMiniTour(id);
    if (miniTour) {
      steps.push(...miniTour.steps);
    }
  }

  return steps;
}

export function estimateTourDuration(stepCount: number): string {
  const seconds = stepCount * 6;
  const minutes = Math.ceil(seconds / 60);
  return minutes <= 1 ? "1 min" : `${minutes} min`;
}

// ============================================================================
// Category Labels
// ============================================================================

export const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  navigation: { label: "Navegación", icon: "Compass" },
  songs: { label: "Repertorio", icon: "Music" },
  events: { label: "Eventos", icon: "Calendar" },
  concerts: { label: "Conciertos", icon: "Ticket" },
  profile: { label: "Perfil", icon: "User" },
  admin: { label: "Administración", icon: "Shield" },
};
