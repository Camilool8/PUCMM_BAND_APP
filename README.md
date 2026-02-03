# PUCMM Band App

Sistema Integral de Gestión de Repertorio para la Banda Universitaria PUCMM.

Una plataforma centralizada "Todo en Uno" para la gestión artística y logística de la banda universitaria. El sistema orquesta el ciclo de vida completo de una presentación: desde la sugerencia de una canción, su aprobación, asignación de voces, ensayo, hasta la ejecución en vivo.

## Tech Stack

### Backend (`/api`)

- **Framework:** NestJS 11 (Node.js)
- **Base de Datos:** PostgreSQL 16 con Prisma ORM
- **Autenticación:** Azure AD (passport-azure-ad)
- **Validación:** class-validator, class-transformer
- **Lenguaje:** TypeScript 5.x

### Frontend (`/web`)

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS 4
- **State Management:** TanStack Query v5
- **Auth:** MSAL React (Azure AD)
- **Iconos:** Lucide React
- **Drag & Drop:** @dnd-kit/core, @dnd-kit/sortable
- **PDF Viewer:** react-pdf
- **Accesibilidad:** focus-trap-react
- **Lenguaje:** TypeScript 5.x

### Infrastructure

- **Database:** PostgreSQL 16 (Docker)
- **Container:** Docker Compose
- **File Storage:** Local filesystem (`/api/uploads/`)

## Project Structure

```
PUCMM_BAND_APP/
├── api/                          # NestJS Backend
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema
│   │   ├── seed.ts               # Database seeding (SUPERADMIN + default sections)
│   │   └── migrations/           # Database migrations
│   ├── src/
│   │   ├── auth/                 # Azure AD authentication
│   │   │   ├── azure-ad.strategy.ts  # JWT validation + user upsert
│   │   │   ├── azure-ad.guard.ts     # Auth guard
│   │   │   ├── roles.guard.ts        # Role-based access control
│   │   │   └── roles.decorator.ts    # @Roles() decorator
│   │   ├── prisma/               # Prisma service
│   │   ├── songs/                # Songs CRUD module
│   │   ├── users/                # Users management module
│   │   │   ├── users.controller.ts   # /users endpoints + profile updates
│   │   │   ├── users.service.ts
│   │   │   └── dto/
│   │   │       └── update-profile.dto.ts
│   │   ├── uploads/              # File upload module
│   │   │   ├── uploads.controller.ts # /uploads endpoints
│   │   │   ├── uploads.service.ts
│   │   │   └── uploads.module.ts
│   │   ├── repertoire-sections/  # Customizable section headers
│   │   │   ├── repertoire-sections.controller.ts
│   │   │   ├── repertoire-sections.service.ts
│   │   │   ├── repertoire-sections.module.ts
│   │   │   └── dto/
│   │   │       └── update-section.dto.ts
│   │   ├── events/                # Events CRUD module
│   │   │   ├── events.controller.ts
│   │   │   ├── events.service.ts
│   │   │   ├── events.module.ts
│   │   │   └── dto/
│   │   │       ├── create-event.dto.ts
│   │   │       └── update-event.dto.ts
│   │   ├── concerts/              # Concerts CRUD module
│   │   │   ├── concerts.controller.ts
│   │   │   ├── concerts.service.ts
│   │   │   ├── concerts.module.ts
│   │   │   └── dto/
│   │   │       ├── create-concert.dto.ts
│   │   │       └── update-concert.dto.ts
│   │   └── main.ts
│   ├── uploads/                  # Uploaded files storage
│   │   ├── images/               # Cover images, avatars, banners
│   │   ├── scores/               # PDF scores, sheet music
│   │   └── videos/               # Concert recordings, practice videos
│   └── test/
├── web/                          # Next.js Frontend
│   ├── app/
│   │   ├── songs/page.tsx        # Repertorio (playlist view with dynamic sections)
│   │   ├── events/page.tsx       # Events management (tabs per event)
│   │   ├── concerts/page.tsx     # Concerts section (upcoming/past/detail)
│   │   ├── globals.css           # Design tokens & theme
│   │   ├── layout.tsx
│   │   └── page.tsx              # Dashboard home
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Modal.tsx         # Compound modal (Modal.Header, Modal.Body, Modal.Footer)
│   │   │   └── FileDropzone.tsx  # Drag-and-drop upload with progress
│   │   ├── Sidebar.tsx           # Navigation with admin section + user avatar
│   │   ├── BottomNav.tsx         # Mobile navigation with profile button
│   │   ├── SongRow.tsx           # List row component
│   │   ├── SongDetailModal.tsx   # Song detail + admin actions
│   │   ├── SuggestionModal.tsx   # Add song form
│   │   ├── AdminSongModal.tsx    # Admin song creation
│   │   ├── StatusBadge.tsx       # Status indicator
│   │   ├── AdminUsersModal.tsx   # User management (SUPERADMIN)
│   │   ├── UserProfileModal.tsx  # User profile editing (avatar, instruments, bio)
│   │   ├── SectionSettingsModal.tsx # Admin section customization (banner, icon, colors)
│   │   ├── DevViewToggle.tsx     # Dev mode admin/student toggle
│   │   ├── AuthGuard.tsx         # Protected routes
│   │   ├── EventRow.tsx          # Event list row with icon
│   │   ├── EventContent.tsx      # Event detail view with setlist & concerts (drag-drop)
│   │   ├── EventDetailModal.tsx  # Quick event preview modal
│   │   ├── CreateEventModal.tsx  # Event create/edit form
│   │   ├── ConcertContent.tsx    # Concert detail view with setlist management (drag-drop)
│   │   ├── CreateConcertModal.tsx # Concert create/edit form
│   │   ├── ConcertDetailModal.tsx # Quick concert preview modal
│   │   ├── MediaGallery.tsx      # Video/image gallery with lightbox
│   │   ├── PDFViewerModal.tsx    # PDF score viewer with pagination
│   │   └── SortableSongItem.tsx  # Draggable song row for setlists
│   ├── hooks/
│   │   ├── use-songs.ts          # TanStack Query hooks for songs
│   │   ├── use-users.ts          # TanStack Query hooks for users + profile updates
│   │   ├── use-sections.ts       # TanStack Query hooks for repertoire sections
│   │   ├── use-events.ts         # TanStack Query hooks for events + song management
│   │   ├── use-concerts.ts       # TanStack Query hooks for concerts + setlist
│   │   ├── use-upload.ts         # File upload with progress tracking
│   │   └── use-auth.ts           # Authentication state & permissions
│   ├── lib/
│   │   ├── api.ts                # API client with types
│   │   ├── msal-config.ts        # Azure AD config
│   │   └── utils.ts
│   └── providers/
│       └── index.tsx             # MSAL + Query providers
├── docker-compose.yml            # PostgreSQL container
├── CLAUDE.md                     # AI assistant instructions
├── Banda_App_Diseno.md           # Design System documentation
└── Banda_App_Requisitos.md       # Software Requirements (SRS)
```

## Quick Start

### 1. Start Database

```bash
docker-compose up -d
```

### 2. Backend Setup

```bash
cd api
npm install
npx prisma migrate dev
npx prisma db seed          # Creates SUPERADMIN user + default sections
npm run start:dev
```

API runs on http://localhost:3001

### 3. Frontend Setup

```bash
cd web
npm install
npm run dev
```

App runs on http://localhost:3000

---

## Development Progress

### Phase 1: Core ✅ Complete

#### ✅ Infrastructure

| Feature                  | Status  | Notes                                                               |
| ------------------------ | ------- | ------------------------------------------------------------------- |
| NestJS project structure | ✅ Done | Modular architecture                                                |
| Prisma schema            | ✅ Done | User, Song, Event, Concert, Asset, Tag, AuditLog, RepertoireSection |
| Docker PostgreSQL        | ✅ Done | Port 5433 (avoids conflicts)                                        |
| Next.js 16 + React 19    | ✅ Done | App Router with providers                                           |
| TanStack Query           | ✅ Done | API state management                                                |
| Design System tokens     | ✅ Done | PUCMM colors, typography, spacing                                   |

#### ✅ Authentication & Authorization

| Feature                   | Status  | Notes                                     |
| ------------------------- | ------- | ----------------------------------------- |
| Azure AD Login            | ✅ Done | MSAL React integration                    |
| Backend JWT Validation    | ✅ Done | passport-azure-ad BearerStrategy          |
| User Upsert on Login      | ✅ Done | Creates/updates user in DB on first login |
| Role-Based Access Control | ✅ Done | `@Roles()` decorator + `RolesGuard`       |
| SUPERADMIN hardcoded      | ✅ Done | `jcjg0001@ce.pucmm.edu.do`                |
| Domain restriction        | ✅ Done | Only `@ce.pucmm.edu.do` emails            |

#### ✅ UI Components

| Feature                  | Status  | Notes                                                       |
| ------------------------ | ------- | ----------------------------------------------------------- |
| Dark theme UI            | ✅ Done | Spotify-inspired design                                     |
| Sidebar navigation       | ✅ Done | Admin section + user profile with avatar                    |
| Songs page               | ✅ Done | Dynamic sections with customizable headers                  |
| SongRow component        | ✅ Done | Status badges, click to open detail                         |
| SongDetailModal          | ✅ Done | Admin can change status & delete                            |
| SuggestionModal          | ✅ Done | Working form for song suggestions                           |
| StatusBadge              | ✅ Done | Ready/Rehearsing/Pending/Archived states                    |
| BottomNav                | ✅ Done | Mobile navigation with profile button                       |
| Dashboard home           | ✅ Done | Stats cards with depth, progress bar                        |
| AdminUsersModal          | ✅ Done | SUPERADMIN can manage user roles                            |
| DevViewToggle            | ✅ Done | Toggle admin/student view in dev mode                       |
| Reusable Modal           | ✅ Done | Compound component (Modal.Header, Modal.Body, Modal.Footer) |
| FileDropzone             | ✅ Done | Drag-and-drop upload with progress tracking                 |
| **UserProfileModal**     | ✅ Done | Edit avatar, instruments, phone, bio                        |
| **SectionSettingsModal** | ✅ Done | Customize section banners, icons, colors                    |

#### ✅ Admin Features

| Feature                      | Status  | Notes                                                                         |
| ---------------------------- | ------- | ----------------------------------------------------------------------------- |
| **Role-Based UI Visibility** | ✅ Done | `canManageUsers`, `canManageSongs`, `canSuggestSongs`, `canEditProfile` flags |
| **User Management**          | ✅ Done | List all users, change roles (SECTION_LEADER, MEMBER, ALUMNI_GUEST)           |
| **SUPERADMIN Protection**    | ✅ Done | Cannot change SUPERADMIN role, Shield icon indicator                          |
| **Song Status Management**   | ✅ Done | Admins can change status via grid buttons                                     |
| **Inline Song Editing**      | ✅ Done | Edit title, artist, BPM, key directly in SongDetailModal                      |
| **Song Deletion**            | ✅ Done | Delete with confirmation dialog, optimistic updates                           |
| **Dev View Toggle**          | ✅ Done | SUPERADMIN can simulate Member/Student view in development                    |
| **Sidebar Admin Section**    | ✅ Done | "Admin" section visible only to SUPERADMIN with Shield icon                   |
| **Permission Guards**        | ✅ Done | Backend `@Roles()` decorator + `RolesGuard` for endpoint protection           |
| **Section Customization**    | ✅ Done | Admins can edit section titles, banners, icons, and color themes              |

#### ✅ APIs

| Endpoint                           | Method | Auth            | Description                                                  |
| ---------------------------------- | ------ | --------------- | ------------------------------------------------------------ |
| `/songs`                           | GET    | User            | List all songs                                               |
| `/songs/:id`                       | GET    | User            | Get song by ID                                               |
| `/songs`                           | POST   | User            | Create new song                                              |
| `/songs/:id`                       | PATCH  | User            | Update song (status, etc.)                                   |
| `/songs/:id`                       | DELETE | User            | Delete song                                                  |
| `/users/me`                        | GET    | User            | Get current user info                                        |
| `/users/me/profile`                | PATCH  | MEMBER+         | Update user profile (name, avatar, instruments, phone, bio)  |
| `/users`                           | GET    | SUPERADMIN      | List all users                                               |
| `/users/:id/role`                  | PATCH  | SUPERADMIN      | Change user role                                             |
| `/uploads/image`                   | POST   | User            | Upload image (max 15MB)                                      |
| `/uploads/pdf`                     | POST   | User            | Upload PDF score (max 150MB)                                 |
| `/uploads/video`                   | POST   | User            | Upload video (max 1.5GB)                                     |
| `/uploads/asset`                   | POST   | User            | Link uploaded file to song/concert                           |
| `/uploads/song/:id/assets`         | GET    | User            | Get assets for a song                                        |
| `/uploads/concert/:id/assets`      | GET    | User            | Get assets for a concert                                     |
| `/uploads/asset/:id`               | DELETE | User            | Delete asset and file                                        |
| `/repertoire-sections`             | GET    | User            | List all repertoire sections                                 |
| `/repertoire-sections/:key`        | GET    | User            | Get section by key                                           |
| `/repertoire-sections/:key`        | PATCH  | SECTION_LEADER+ | Update section settings                                      |
| `/repertoire-sections/:key/banner` | DELETE | SECTION_LEADER+ | Clear section banner                                         |
| `/events`                          | GET    | User            | List all events                                              |
| `/events/:id`                      | GET    | User            | Get event with songs and concerts                            |
| `/events`                          | POST   | SECTION_LEADER+ | Create new event                                             |
| `/events/:id`                      | PATCH  | SECTION_LEADER+ | Update event                                                 |
| `/events/:id`                      | DELETE | SECTION_LEADER+ | Delete event                                                 |
| `/events/:id/songs`                | POST   | SECTION_LEADER+ | Add song to event                                            |
| `/events/:id/songs/:songId`        | DELETE | SECTION_LEADER+ | Remove song from event                                       |
| `/concerts`                        | GET    | User            | List all concerts (with event relation)                      |
| `/concerts/event/:eventId`         | GET    | User            | List concerts for specific event                             |
| `/concerts/:id`                    | GET    | User            | Get concert with songs and event                             |
| `/concerts`                        | POST   | SECTION_LEADER+ | Create new concert                                           |
| `/concerts/:id`                    | PATCH  | SECTION_LEADER+ | Update concert                                               |
| `/concerts/:id`                    | DELETE | SECTION_LEADER+ | Delete concert                                               |
| `/concerts/:id/songs`              | POST   | SECTION_LEADER+ | Add song to concert setlist                                  |
| `/concerts/:id/songs/:songId`      | DELETE | SECTION_LEADER+ | Remove song from concert setlist                             |
| `/concerts/:id/copy-from-event`    | POST   | SECTION_LEADER+ | Copy all songs from parent event to concert                  |
| `/events/:id/songs/reorder`        | PATCH  | SECTION_LEADER+ | Reorder songs in event setlist                               |
| `/concerts/:id/songs/reorder`      | PATCH  | SECTION_LEADER+ | Reorder songs in concert setlist                             |
| `/music-metadata/resolve`          | POST   | User            | Resolve music link (Spotify/YouTube/Apple Music) to metadata |
| `/music-metadata/search`           | GET    | User            | Search song by title/artist                                  |
| `/music-metadata/detect-platform`  | POST   | User            | Detect music platform from URL                               |
| `/songs/:id/vote`                  | POST   | User            | Add vote to a song                                           |
| `/songs/:id/vote`                  | DELETE | User            | Remove vote from a song                                      |
| `/songs/votes/me`                  | GET    | User            | Get current user's voted song IDs                            |
| `/songs/:id/lead-vocals/:userId`   | POST   | SECTION_LEADER+ | Add lead vocal to a song                                     |
| `/songs/:id/lead-vocals/:userId`   | DELETE | SECTION_LEADER+ | Remove lead vocal from a song                                |
| `/songs/check-duplicate`           | POST   | User            | Check if song already exists by ISRC or title/artist         |

### Phase 2: Gestión ✅ Complete

| Feature                     | Status  | Notes                                                        |
| --------------------------- | ------- | ------------------------------------------------------------ |
| **File Upload System**      | ✅ Done | Images (15MB), PDFs (150MB), Videos (1.5GB)                  |
| **FileDropzone Component**  | ✅ Done | Drag-and-drop with progress tracking                         |
| **User Profile System**     | ✅ Done | Avatar upload, instruments, phone, bio                       |
| **Repertoire Sections**     | ✅ Done | Customizable headers with banners, icons, colors             |
| **Blurred Banner Effect**   | ✅ Done | Backdrop blur with dark gradient overlay                     |
| Custom Covers/Banners       | ✅ Done | Upload images for sections                                   |
| **Events module**           | ✅ Done | CRUD for events (Navidad, Graduación, etc.) with setlist     |
| **Concerts module**         | ✅ Done | Performance dates, dedicated page, setlist per concert       |
| **Concerts Navigation**     | ✅ Done | Sidebar + BottomNav links, upcoming/past tabs                |
| **Concert from Event Link** | ✅ Done | Click concert in event → navigate to /concerts?concert={id}  |
| **Copy Setlist Feature**    | ✅ Done | Copy songs from event to concert setlist                     |
| **Concert photos/videos**   | ✅ Done | MediaGallery component with lightbox for videos/images       |
| **Setlists drag-and-drop**  | ✅ Done | @dnd-kit integration with touch support, persisted order     |
| **Time calculation**        | ✅ Done | formatDuration utility, shows total setlist duration         |
| **PDF viewer**              | ✅ Done | react-pdf integration in PDFViewerModal with zoom/pagination |
| **Link song to user**       | ✅ Done | suggestedBy relation populated on song creation, shown in UI |

### Phase 3: Social (In Progress)

| Feature                    | Status     | Notes                                                            |
| -------------------------- | ---------- | ---------------------------------------------------------------- |
| **Music Link Integration** | ✅ Done    | Paste Spotify/YouTube/Apple Music link to auto-fill song data    |
| **Spotify API**            | ✅ Done    | Title, artist, cover, duration, ISRC via Spotify Web API         |
| **YouTube/Apple Music**    | ✅ Done    | Link resolution via Odesli API, converts to Spotify for lookup   |
| **BPM/Key Detection**      | ✅ Done    | ReccoBeats API for tempo/key (Spotify deprecated audio features) |
| **Genre Detection**        | ✅ Done    | iTunes API extracts genre from `primaryGenreName` field          |
| **Duplicate Detection**    | ✅ Done    | ISRC + title/artist matching prevents duplicate suggestions      |
| **Voting System**          | ✅ Done    | Members can upvote song suggestions, vote count shown in list    |
| **Lead Vocals Assignment** | ✅ Done    | Assign singers to songs via SongDetailModal dropdown             |
| **Events in Song Detail**  | ✅ Done    | See which events a song belongs to, click to navigate            |
| **Enhanced Song List**     | ✅ Done    | Genre, duration, platform quick-links (Spotify/YT/Apple) icons   |
| **Genre Filter**           | ✅ Done    | Filter songs by genre with scrollable chips in repertoire page   |
| Comments system            | ❌ Pending | Per-song threads                                                 |
| Push notifications         | ❌ Pending | PWA notifications                                                |
| Email notifications        | ❌ Pending | Event updates                                                    |
| Mode "On Stage"            | ❌ Pending | Live performance view                                            |

### Phase 4: Advanced (Not Started)

| Feature             | Status     | Notes                    |
| ------------------- | ---------- | ------------------------ |
| Analytics dashboard | ❌ Pending | Most played songs, etc.  |
| Version history     | ❌ Pending | Song version tracking    |
| Audit log UI        | ❌ Pending | Admin activity view      |
| A-B repeat player   | ❌ Pending | Practice mode for videos |

---

## Role System

| Role               | Permissions                                                                 |
| ------------------ | --------------------------------------------------------------------------- |
| **SUPERADMIN**     | Manage users, manage songs, customize sections, view all data, assign roles |
| **SECTION_LEADER** | Manage songs (change status, delete), customize sections, view all data     |
| **MEMBER**         | Suggest songs, edit own profile, view all data                              |
| **ALUMNI_GUEST**   | View all data (read-only, cannot edit profile)                              |

### Permission Flags (Frontend)

The `useAuth()` hook exposes these permission flags:

```typescript
canManageUsers; // SUPERADMIN only - access to AdminUsersModal
canManageSongs; // SUPERADMIN or SECTION_LEADER - edit/delete songs, change status, customize sections
canManageEvents; // SUPERADMIN or SECTION_LEADER - create/edit/delete events and concerts
canSuggestSongs; // SUPERADMIN, SECTION_LEADER, or MEMBER - create new songs
canEditProfile; // SUPERADMIN, SECTION_LEADER, or MEMBER - edit own profile (not ALUMNI_GUEST)
isAdmin; // SUPERADMIN or SECTION_LEADER - general admin UI elements
```

### Permission Guards (Backend)

Protected endpoints use the `@Roles()` decorator:

```typescript
@Roles(Role.SUPERADMIN)
@Get()
findAllUsers() { ... }  // Only SUPERADMIN can list users
```

### Dev Mode Toggle

In development, the SUPERADMIN (`jcjg0001@ce.pucmm.edu.do`) sees a floating button to toggle between Admin View and Student View. This allows testing the student experience without logging out. The toggle persists in localStorage.

---

## Data Model

```
User ──────────< Song >────────── Event
  │               │                 │
  │               │                 ├── EventSong (junction with order)
  │               │                 │
  │               │                 └── Concert (performance dates)
  ├── SongVote    ├── SongVersion        │
  │               ├── Asset ─────────────┼── ConcertSong (junction with order)
  └── AuditLog    └── Tag ───────────────┘

User >──── leadVocals ────< Song (many-to-many)

RepertoireSection (independent - customizable UI headers)
```

### Models

- **User**: Band members with roles + profile data (avatarUrl, instruments[], phone, bio)
- **Song**: Musical pieces with metadata (title, artist, BPM, key, genre, status, coverUrl, durationMs, suggestedBy, leadVocals)
- **SongVote**: Junction table for user votes on songs (voting system for suggestions)
- **SongVersion**: Different arrangements (Studio, Live, Remix)
- **Event**: Recurring event types (e.g., "Navidad", "Graduación"). Contains planned songs via EventSong junction table with ordering.
- **EventSong**: Junction table linking Event↔Song with `order` field for setlist ordering.
- **Concert**: Specific performance dates within an Event. Has its own setlist via ConcertSong junction table.
- **ConcertSong**: Junction table linking Concert↔Song with `order` field for setlist ordering.
- **Asset**: Files attached to songs or concerts (scores, videos, images)
- **Tag**: Genre/category labels
- **AuditLog**: Activity tracking
- **RepertoireSection**: Customizable section headers (title, subtitle, iconName, bannerUrl, gradient colors). Default sections: repertorio, sugerencias, archivadas, eventos, conciertos.

## File Upload System

The application supports uploading images, PDF scores, and videos with the following limits:

| Type  | Max Size | Allowed Formats      | Storage Path       |
| ----- | -------- | -------------------- | ------------------ |
| Image | 15 MB    | JPEG, PNG, WebP, GIF | `/uploads/images/` |
| PDF   | 150 MB   | PDF                  | `/uploads/scores/` |
| Video | 1.5 GB   | MP4, WebM, MOV, AVI  | `/uploads/videos/` |

### Frontend Usage

```tsx
import { FileDropzone } from "@/components/ui/FileDropzone";
import { useUpload } from "@/hooks/use-upload";

// Using the FileDropzone component
<FileDropzone
  type="image"
  label="Upload Cover"
  description="JPG, PNG up to 15MB"
  onUploadComplete={(response) => console.log(response.file.url)}
/>;

// Using the hook directly for custom implementations
const { upload, isUploading, progress, error } = useUpload("pdf");
const response = await upload(file);
```

### Backend Endpoints

Files are uploaded via multipart form data:

```bash
# Upload an image
curl -X POST http://localhost:3001/uploads/image \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@cover.jpg"

# Response
{
  "success": true,
  "file": {
    "filename": "uuid.jpg",
    "originalName": "cover.jpg",
    "url": "/uploads/images/uuid.jpg",
    "size": 102400,
    "mimeType": "image/jpeg"
  }
}
```

## User Profile System

Band members (SUPERADMIN, SECTION_LEADER, MEMBER) can edit their profile:

| Field       | Type     | Description                                     |
| ----------- | -------- | ----------------------------------------------- |
| name        | string   | Display name                                    |
| avatarUrl   | string   | Profile picture URL (uploaded via FileDropzone) |
| instruments | string[] | List of instruments (predefined + custom)       |
| phone       | string   | Contact phone number                            |
| bio         | string   | Short biography                                 |

### Frontend Usage

```tsx
import { useUpdateProfile } from "@/hooks/use-users";
import { UserProfileModal } from "@/components/UserProfileModal";

// The modal handles everything including avatar upload
<UserProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />;

// Or use the hook directly
const updateProfile = useUpdateProfile();
await updateProfile.mutateAsync({
  name: "New Name",
  instruments: ["Trompeta", "Saxofón Alto"],
  bio: "Band member since 2020",
});
```

## Repertoire Sections System

Each tab in the songs page (Repertorio, Sugerencias, Archivadas) can be customized by admins:

| Field               | Type   | Description                                             |
| ------------------- | ------ | ------------------------------------------------------- |
| key                 | string | Unique identifier (repertorio, sugerencias, archivadas) |
| title               | string | Display title                                           |
| subtitle            | string | Description text                                        |
| iconName            | string | Lucide icon name (Library, Clock, Archive, Music, etc.) |
| bannerUrl           | string | Custom banner image URL                                 |
| gradientFrom/Via/To | string | Tailwind gradient classes for fallback styling          |
| iconGradientFrom/To | string | Icon background gradient colors                         |

### Blurred Banner Effect

When a banner is set, the header displays:

1. Background image scaled 110% for edge coverage
2. `backdrop-blur-2xl` for frosted glass effect
3. Dark gradient overlay (`from-black/40 via-black/60 to-surface-0`) for text readability
4. Icon/image thumbnail with subtle backdrop blur

### Frontend Usage

```tsx
import { useSections, useUpdateSection } from "@/hooks/use-sections";
import { SectionSettingsModal } from "@/components/SectionSettingsModal";

// Fetch all sections
const { data: sections } = useSections();

// Update a section
const updateSection = useUpdateSection();
await updateSection.mutateAsync({
  key: "repertorio",
  data: {
    title: "Active Repertoire",
    bannerUrl: "/uploads/images/banner.jpg",
    iconName: "Library",
  },
});
```

## UI Design

The UI follows a **Spotify-inspired** dark theme design:

- **Dark mode first** interface (Slate color palette)
- **Playlist-style** song lists with hover states
- **Dynamic section headers** with customizable banners and blur effects
- **Event cards** with gradient backgrounds
- **Status badges** (Lista, Ensayando, Pendiente, Archivada)
- **Modal dialogs** for song details, forms, and settings
- **Compound components** (Modal.Header, Modal.Body, Modal.Footer)
- **Depth & shadows** for visual hierarchy
- **Brand colors**: PUCMM Blue (#0033A0), Yellow (#FFD200), Red (#D22630)

See [Banda_App_Diseno.md](./docs/Banda_App_Diseno.md) for complete design specifications.

## Music Link Integration

Users can suggest songs by simply pasting a link from Spotify, YouTube, or Apple Music. The system automatically extracts:

- **Title & Artist**: From Spotify track data
- **Cover Art**: High-resolution album artwork
- **Duration**: Track length in milliseconds
- **BPM & Key**: Via ReccoBeats API (since Spotify deprecated audio features)
- **ISRC**: International Standard Recording Code for deduplication

### How It Works

```
User pastes link (Spotify/YouTube/Apple Music)
           ↓
    ┌─────────────────┐
    │  Odesli API     │  ← Resolves any link to Spotify equivalent
    └────────┬────────┘
             ↓
    ┌─────────────────┐
    │  Spotify API    │  ← Fetches title, artist, cover, duration, ISRC
    └────────┬────────┘
             ↓
    ┌─────────────────┐
    │  ReccoBeats     │  ← Fetches BPM and key (free alternative)
    └─────────────────┘
```

### Supported Platforms

| Platform      | Link Format                                 |
| ------------- | ------------------------------------------- |
| Spotify       | `https://open.spotify.com/track/...`        |
| YouTube       | `https://www.youtube.com/watch?v=...`       |
| YouTube       | `https://youtu.be/...`                      |
| YouTube Music | `https://music.youtube.com/watch?v=...`     |
| Apple Music   | `https://music.apple.com/.../album/.../...` |

### Getting Spotify Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create App"
4. Fill in app name (e.g., "PUCMM Band App") and description
5. Add `http://localhost:3001` as Redirect URI
6. Copy the **Client ID** and **Client Secret** to your `.env` file

## Environment Variables

### API (`api/.env`)

```env
DATABASE_URL="postgresql://pucmm_band:pucmm_band_2024@localhost:5433/pucmm_band"
AZURE_AD_TENANT_ID="your-tenant-id"
AZURE_AD_CLIENT_ID="your-client-id"
AZURE_AD_CLIENT_SECRET="your-secret"
PORT=3001

# Music Metadata (Spotify API)
SPOTIFY_CLIENT_ID="your-spotify-client-id"
SPOTIFY_CLIENT_SECRET="your-spotify-client-secret"

# Optional: GetSongBPM API for additional BPM/key data
GETSONGBPM_API_KEY=""
```

### Web (`web/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_AZURE_AD_TENANT_ID="your-tenant-id"
NEXT_PUBLIC_AZURE_AD_CLIENT_ID="your-client-id"
```

## Common Commands

### Database

```bash
cd api
npx prisma migrate dev      # Apply migrations
npx prisma migrate reset    # Reset database
npx prisma db seed          # Seed SUPERADMIN user + default sections
npx prisma studio           # Visual database browser
```

### Development

```bash
# Start everything
docker-compose up -d && cd api && npm run start:dev
# In another terminal
cd web && npm run dev
```

### Build

```bash
cd api && npm run build     # NestJS build
cd web && npm run build     # Next.js build
```

## Reusable Components & Hooks

### Components

| Component              | Location                              | Description                                          |
| ---------------------- | ------------------------------------- | ---------------------------------------------------- |
| `Modal`                | `components/ui/Modal.tsx`             | Compound modal with Header, Body, Footer             |
| `FileDropzone`         | `components/ui/FileDropzone.tsx`      | Drag-and-drop upload with progress                   |
| `StatusBadge`          | `components/StatusBadge.tsx`          | Song status indicator                                |
| `SongRow`              | `components/SongRow.tsx`              | Song row with genre, duration, platform links, votes |
| `UserProfileModal`     | `components/UserProfileModal.tsx`     | Profile editing with avatar upload                   |
| `SectionSettingsModal` | `components/SectionSettingsModal.tsx` | Section customization                                |
| `AdminUsersModal`      | `components/AdminUsersModal.tsx`      | User management                                      |
| `EventRow`             | `components/EventRow.tsx`             | Event list item with icon and counts                 |
| `EventContent`         | `components/EventContent.tsx`         | Event detail view with drag-drop setlist             |
| `CreateEventModal`     | `components/CreateEventModal.tsx`     | Event create/edit form with icon picker              |
| `ConcertContent`       | `components/ConcertContent.tsx`       | Concert detail with drag-drop setlist + media        |
| `CreateConcertModal`   | `components/CreateConcertModal.tsx`   | Concert create/edit form                             |
| `MediaGallery`         | `components/MediaGallery.tsx`         | Video/image gallery with lightbox                    |
| `PDFViewerModal`       | `components/PDFViewerModal.tsx`       | PDF score viewer with pagination & zoom              |
| `SortableSongItem`     | `components/SortableSongItem.tsx`     | Draggable song row for setlist ordering              |

### Hooks

| Hook                         | Location                | Description                             |
| ---------------------------- | ----------------------- | --------------------------------------- |
| `useAuth`                    | `hooks/use-auth.ts`     | Auth state, permissions, user data      |
| `useSongs`                   | `hooks/use-songs.ts`    | Songs CRUD operations                   |
| `useUsers`                   | `hooks/use-users.ts`    | Users list and role management          |
| `useUpdateProfile`           | `hooks/use-users.ts`    | Profile update mutation                 |
| `useSections`                | `hooks/use-sections.ts` | Repertoire sections CRUD                |
| `useEvents`                  | `hooks/use-events.ts`   | Events CRUD + song management           |
| `useEvent(id)`               | `hooks/use-events.ts`   | Single event with full relations        |
| `useConcerts`                | `hooks/use-concerts.ts` | All concerts with event relation        |
| `useConcert(id)`             | `hooks/use-concerts.ts` | Single concert with songs               |
| `useCopyEventSongsToConcert` | `hooks/use-concerts.ts` | Copy setlist from event to concert      |
| `useReorderEventSongs`       | `hooks/use-events.ts`   | Reorder songs in event setlist          |
| `useReorderConcertSongs`     | `hooks/use-concerts.ts` | Reorder songs in concert setlist        |
| `useUpload`                  | `hooks/use-upload.ts`   | File upload with progress               |
| `useConcertAssets`           | `hooks/use-upload.ts`   | Get assets for a concert (videos/media) |
| `useAddVote`                 | `hooks/use-songs.ts`    | Add vote to a song                      |
| `useRemoveVote`              | `hooks/use-songs.ts`    | Remove vote from a song                 |
| `useUserVotes`               | `hooks/use-songs.ts`    | Get current user's voted song IDs       |
| `useAddLeadVocal`            | `hooks/use-songs.ts`    | Add lead vocal singer to a song         |
| `useRemoveLeadVocal`         | `hooks/use-songs.ts`    | Remove lead vocal singer from a song    |

### API Client Methods

| Method                                         | Description                       |
| ---------------------------------------------- | --------------------------------- |
| `api.getSongs()`                               | Fetch all songs                   |
| `api.createSong(data)`                         | Create new song                   |
| `api.updateSong(id, data)`                     | Update song                       |
| `api.deleteSong(id)`                           | Delete song                       |
| `api.getMe()`                                  | Get current user                  |
| `api.updateProfile(data)`                      | Update user profile               |
| `api.getUsers()`                               | List all users (SUPERADMIN)       |
| `api.updateUserRole(id, role)`                 | Change user role                  |
| `api.uploadImage(file, onProgress)`            | Upload image                      |
| `api.uploadPdf(file, onProgress)`              | Upload PDF                        |
| `api.uploadVideo(file, onProgress)`            | Upload video                      |
| `api.getSections()`                            | Get all repertoire sections       |
| `api.updateSection(key, data)`                 | Update section settings           |
| `api.clearSectionBanner(key)`                  | Remove section banner             |
| `api.getEvents()`                              | List all events                   |
| `api.getEvent(id)`                             | Get event with songs and concerts |
| `api.createEvent(data)`                        | Create new event                  |
| `api.updateEvent(id, data)`                    | Update event                      |
| `api.deleteEvent(id)`                          | Delete event                      |
| `api.addSongToEvent(eventId, songId)`          | Add song to event setlist         |
| `api.removeSongFromEvent(eventId, songId)`     | Remove song from event setlist    |
| `api.getConcerts()`                            | List all concerts                 |
| `api.getConcert(id)`                           | Get concert with songs and event  |
| `api.createConcert(data)`                      | Create new concert                |
| `api.updateConcert(id, data)`                  | Update concert                    |
| `api.deleteConcert(id)`                        | Delete concert                    |
| `api.addSongToConcert(concertId, songId)`      | Add song to concert setlist       |
| `api.removeSongFromConcert(concertId, songId)` | Remove song from concert          |
| `api.copyEventSongsToConcert(concertId)`       | Copy event songs to concert       |
| `api.reorderEventSongs(eventId, songIds)`      | Reorder songs in event setlist    |
| `api.reorderConcertSongs(concertId, songIds)`  | Reorder songs in concert setlist  |
| `api.addVote(songId)`                          | Add vote to a song                |
| `api.removeVote(songId)`                       | Remove vote from a song           |
| `api.getUserVotes()`                           | Get current user's voted song IDs |
| `api.addLeadVocal(songId, userId)`             | Add lead vocal to a song          |
| `api.removeLeadVocal(songId, userId)`          | Remove lead vocal from a song     |
| `api.checkDuplicate(title, artist, isrc?)`     | Check if song exists (duplicate)  |

## Requirements

Full software requirements are documented in [Banda_App_Requisitos.md](./docs/Banda_App_Requisitos.md).

## License

Private - PUCMM University
