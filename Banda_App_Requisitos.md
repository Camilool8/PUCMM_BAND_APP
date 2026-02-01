# Especificación de Requerimientos de Software (SRS) - v2.0

## Sistema Integral de Gestión de Repertorio - Banda PUCMM

### 1. Visión del Producto

Una plataforma centralizada "Todo en Uno" para la gestión artística y logística de la banda universitaria. El sistema no solo gestiona canciones, sino que orquesta el ciclo de vida completo de una presentación: desde la sugerencia de una canción, su aprobación, asignación de voces, ensayo, hasta la ejecución en vivo. El objetivo es que los miembros de la banda puedan ver el repertorio de la banda por cada presentación que se realiza en la universidad, ya sea por nombre de eventos recurrentes o por género de canciones.

### 2. Arquitectura y Stack Tecnológico (Producción)

#### 2.1 Backend & Infraestructura

- **Core Framework:** NestJS (Node.js) con arquitectura hexagonal. Facilita la separación de lógica de negocio, adaptadores e infraestructura.
- **Base de Datos:** PostgreSQL 16 con extensión `pg_trgm` para búsquedas difusas (fuzzy search) de canciones.
- **ORM:** Prisma o TypeORM con migraciones automatizadas.
- **Storage:** Uso del filesystem del servidor (Pod/Contenedor/PVC) donde vive el API para almacenamiento de partituras (PDF) y videos de referencia.

#### 2.2 Frontend

- **Framework:** Next.js 14 (App Router) para renderizado híbrido (SSR para SEO en páginas públicas, CSR para dashboard privado).
- **State Management:** Zustand (global UI state) + TanStack Query (server state & caching).
- **Validación de Formularios:** React Hook Form + Zod (validación estricta de esquemas).

#### 2.3 Integraciones (APIs)

- **Azure Active Directory (Azure AD):** Para autenticación de usuarios.
- **Spotify Web API:** Búsqueda de metadatos (ISRC, BPM, Key, Release Date).
- **YouTube Data API v3:** Validación de enlaces de video y extracción de miniaturas.

### 3. Requerimientos Funcionales Detallados

#### 3.1 Módulo de Gestión de Usuarios y Roles (RBAC)

El sistema debe implementar Control de Acceso Basado en Roles (RBAC) granular.

- **RF-001: Autenticación Federada.** Login vía Azure AD (cualquier tenant) permitiendo el registro y acceso únicamente a usuarios cuyo correo termine en `@ce.pucmm.edu.do`.
- **RF-002: Perfilamiento Automático.** Al primer login, intentar extraer información básica del perfil si está disponible.
- **RF-003: Roles del Sistema.**
  - `SuperAdmin` (Director): Acceso total, borrado físico, gestión de admins.
  - `SectionLeader` (Jefe de Cuerda): Puede aprobar sugerencias de su sección, editar estados de ensayo, pero no borrar canciones.
  - `Member` (Músico): Ver repertorio, descargar partituras, sugerir canciones, marcar asistencia.
  - `Alumni/Guest`: Acceso de solo lectura a eventos históricos.

#### 3.2 Módulo de Inteligencia Musical (Smart Metadata)

- **RF-004: Ingesta Inteligente (Link-to-Song).**
  - **Input:** El usuario pega una URL (Spotify Track, YouTube Video, Apple Music).
  - **Proceso:** El backend detecta el proveedor, consulta la API correspondiente.
  - **Output:** Autocompleta: Título, Artista, Álbum, Año, BPM (si disponible), Key (si disponible), Duración, Cover Art (640x640px).
- **RF-005: Detección de Duplicados.** Antes de guardar, el sistema compara el `ISRC` (si existe) o realiza una búsqueda difusa por `Título + Artista`. Si hay >85% de coincidencia, alerta al usuario: _"Esta canción parece ya existir en el evento 'Navidad 2024'"_.

#### 3.3 Módulo de Repertorio y Archivos

- **RF-006: Versionamiento de Canciones.** Capacidad de tener múltiples versiones de una misma canción (ej: "Versión Estudio", "Versión En Vivo", "Remix Merengue").
- **RF-007: Gestor de Partituras.**
  - Subida de archivos PDF/Sibelius/MusicXML.
  - Etiquetado por instrumento (ej: "Alto Sax", "Trumpet 1").
  - **Visor PDF integrado:** Los usuarios deben poder ver la partitura en el navegador (móvil/tablet) sin descargarla obligatoriamente.
- **RF-008: Video Referencia Local.**
  - Subida de archivos `.mp4` optimizados.
  - Reproductor HTML5 personalizado con funciones de bucle (A-B repeat) y control de velocidad (0.5x, 0.75x) para facilitar el ensayo/práctica.

#### 3.4 Módulo de Eventos, Conciertos y Setlists

- **RF-009: Setlists Dinámicos.**
  - Interfaz Drag-and-Drop para reordenar canciones.
  - Bloques de "Intermedio" o "Discurso" que no son canciones pero suman tiempo.
- **RF-010: Cálculo de Tiempo Real.** Sumatoria automática de la duración de las canciones + tiempos de transición configurables (ej: 30s entre canciones) para estimar la duración total del show.
- **RF-011: Modo "On Stage" (Live).** Vista simplificada para usar en tablet durante el show: Texto gigante, fondo negro puro, setlist vertical, acceso a partitura en 1 toque.

- **RF-014: Sugerencias a Repertorio o Evento.**
  - Los miembros pueden sugerir canciones al **repertorio general** (sin evento específico) o directamente a un **evento específico**.
  - Al sugerir a un evento, la canción aparece en el setlist del evento como "Pendiente".
  - Las canciones del repertorio general pueden ser agregadas a eventos posteriormente por el Admin.

- **RF-015: Gestión de Conciertos (Performances).**
  - Cada Evento puede tener múltiples **Conciertos** (fechas específicas donde se realizó la presentación).
  - Un Concierto registra:
    - `fecha` y `lugar` de la presentación.
    - `canciones tocadas` (por defecto hereda las del Evento, pero puede modificarse si hubo cambios improvisados).
    - `videos` del concierto (video completo o por canción).
    - `notas` opcionales (ej: "El bajo falló en la canción 3").
  - Los miembros pueden navegar a un Evento, ver la pestaña "Conciertos", seleccionar una fecha y ver las canciones que se tocaron ese día con sus videos.

- **RF-016: Videos de Concierto.**
  - Cada Concierto puede tener:
    - Un **video completo** del show.
    - **Videos individuales** por canción tocada.
  - Los videos se almacenan como Assets del tipo `VIDEO` relacionados al Concierto.
  - Reproductor HTML5 con controles de velocidad y bucle A-B.

#### 3.5 Módulo de Colaboración

- **RF-012: Comentarios Contextuales.** Hilo de comentarios por canción (ej: "Cuidado con el corte en el minuto 2:15").
- **RF-013: Notificaciones.**
  - Push Notification (PWA) y Email cuando: "Se ha subido la partitura de Saxofón para 'Bachata Rosa'", "Tu sugerencia ha sido aprobada".

### 4. Modelo de Datos (Esquema Relacional Simplificado)

| Entidad      | Campos Clave                                                                                   | Relaciones                                                   |
| :----------- | :--------------------------------------------------------------------------------------------- | :----------------------------------------------------------- |
| **User**     | `id`, `email`, `role`, `instruments[]`, `phone`                                                | `OneToMany` Sugerencias, `ManyToMany` Canciones (LeadVocals) |
| **Song**     | `id`, `title`, `artist`, `bpm`, `key`, `status` (`PENDING`, `REHEARSING`, `READY`, `ARCHIVED`), `eventId?` | `OneToMany` Versiones, `ManyToMany` Tags/Genres, `ManyToOne` Event (opcional) |
| **Event**    | `id`, `name`, `description`, `type` (recurrente)                                               | `OneToMany` Songs, `OneToMany` Concerts                      |
| **Concert**  | `id`, `date`, `location`, `notes`, `eventId`                                                   | `ManyToOne` Event, `ManyToMany` Songs (tocadas), `OneToMany` Assets (videos) |
| **Asset**    | `id`, `type` (`SCORE`, `VIDEO`, `AUDIO`), `url`, `instrument_tag`, `songId?`, `concertId?`     | `ManyToOne` Song (opcional), `ManyToOne` Concert (opcional)  |
| **AuditLog** | `id`, `user_id`, `action`, `timestamp`, `metadata`                                             | `ManyToOne` User                                             |

### 6. Plan de Desarrollo: Fases

1.  **Fase 1 (Core):** Auth, CRUD de Canciones, Integración Spotify, Listados básicos.
2.  **Fase 2 (Gestión):** Eventos, Setlists, Roles y Permisos, Subida de Archivos.
3.  **Fase 3 (Social):** Comentarios, Notificaciones, Modo Live.
4.  **Fase 4 (Advanced):** Analytics (canciones más tocadas), Historial de versiones.
