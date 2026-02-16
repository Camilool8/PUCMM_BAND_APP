# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PUCMM Band App - A repertoire management system for the PUCMM university band. Monorepo with NestJS backend (`/api`) and Next.js frontend (`/web`).

**Production URLs:**
- App: https://pucmm-band.cjoga.cloud
- API: https://pucmm-band-api.cjoga.cloud

## Commands

### Development
```bash
# Start PostgreSQL (required first)
docker-compose up -d

# Backend (runs on port 3001)
cd api && npm run start:dev

# Frontend (runs on port 3000)
cd web && npm run dev
```

### Database
```bash
cd api
npx prisma migrate dev      # Apply migrations
npx prisma migrate reset    # Reset database
npx prisma db seed          # Seed SUPERADMIN + default sections
npx prisma studio           # Visual database browser
npx prisma db push          # Push schema without migration
```

### Testing & Linting
```bash
# Backend only
cd api
npm run test                # Run tests
npm run test:watch          # Watch mode
npm run test:cov            # Coverage
npm run lint                # ESLint with autofix
npm run format              # Prettier
```

### Build
```bash
cd api && npm run build     # NestJS build
cd web && npm run build     # Next.js build
```

## Architecture

### Backend (`/api`)
- **NestJS 11** with modular architecture
- **Prisma ORM** for PostgreSQL (schema at `prisma/schema.prisma`)
- **Multi-provider auth**: Azure AD, Google OAuth, email/password
- **Unified auth guard** validates app JWT first, falls back to Azure AD
- **class-validator** for DTO validation
- **bcrypt** for password hashing (12 rounds)

Module structure:
```
src/
├── auth/                    # Multi-provider authentication
│   ├── azure-ad.strategy.ts # Azure AD JWT validation + user upsert
│   ├── azure-ad.guard.ts    # Azure AD guard
│   ├── unified-auth.guard.ts # Validates app JWT first, falls back to Azure AD
│   ├── auth.service.ts      # Email/password login, registration, Google OAuth
│   ├── auth.controller.ts   # POST /auth/login, /auth/register, GET /auth/google
│   ├── google.strategy.ts   # Google OAuth strategy
│   ├── roles.guard.ts       # Role-based access control
│   └── roles.decorator.ts   # @Roles() decorator
├── prisma/                  # PrismaService wrapper
├── songs/                   # Songs CRUD (controller, service, DTOs)
├── users/                   # User management + profile updates
│   ├── users.controller.ts  # GET /me, PATCH /me/profile, GET /, PATCH /:id/role
│   ├── users.service.ts
│   └── dto/
│       └── update-profile.dto.ts
├── uploads/                 # File upload system
│   ├── uploads.controller.ts # POST /image, /pdf, /video, /asset
│   ├── uploads.service.ts
│   └── uploads.module.ts
├── repertoire-sections/     # Customizable section headers
│   ├── repertoire-sections.controller.ts
│   ├── repertoire-sections.service.ts
│   └── dto/
│       └── update-section.dto.ts
├── events/                  # Events CRUD (recurring event types)
│   ├── events.controller.ts # GET/POST/PATCH/DELETE + song management + blocks
│   ├── events.service.ts
│   └── dto/
│       ├── create-event.dto.ts
│       └── update-event.dto.ts
├── concerts/                # Concerts CRUD (performance dates)
│   ├── concerts.controller.ts # GET/POST/PATCH/DELETE + setlist + copy-from-event
│   ├── concerts.service.ts    # Transforms songsPlayed → songs for frontend
│   └── dto/
│       ├── create-concert.dto.ts
│       └── update-concert.dto.ts
├── rehearsals/              # Rehearsals CRUD + attendance
│   ├── rehearsals.controller.ts # Full CRUD + songs + blocks + attendance + check-in
│   ├── rehearsals.service.ts
│   └── dto/
│       ├── create-rehearsal.dto.ts
│       ├── update-rehearsal.dto.ts
│       ├── add-song.dto.ts
│       ├── add-songs-bulk.dto.ts
│       ├── reorder-setlist.dto.ts
│       ├── create-block.dto.ts
│       ├── update-block.dto.ts
│       ├── check-in.dto.ts
│       └── admin-attendance.dto.ts
├── locations/               # GPS locations for attendance validation
│   ├── locations.controller.ts # CRUD (SUPERADMIN only for writes)
│   ├── locations.service.ts
│   └── dto/
│       ├── create-location.dto.ts
│       └── update-location.dto.ts
├── organizations/           # Multi-tenancy configuration
│   ├── organizations.controller.ts # GET /config (public), PATCH / (SUPERADMIN)
│   └── organizations.service.ts
├── music-metadata/          # Music platform link resolver
│   ├── music-metadata.controller.ts # POST /resolve, GET /search, POST /detect-platform
│   ├── music-metadata.service.ts
│   └── providers/           # Spotify, YouTube, Apple Music integrations
├── public-metadata/         # Public SEO/OG tag endpoints (no auth)
│   └── public-metadata.controller.ts # GET /public/metadata/{concert|event|rehearsal|song}/:id
├── app.module.ts            # Root module with ConfigModule
└── main.ts                  # Bootstrap with CORS + static files
```

### Frontend (`/web`)
- **Next.js 16** with App Router
- **React 19** with TanStack Query v5 for server state
- **MSAL React** for Azure AD authentication
- **Tailwind CSS 4** with custom design tokens
- **Leaflet / react-leaflet** for map-based location picking
- **Framer Motion** for animations
- **focus-trap-react** for accessible modals

Key patterns:
```
app/                         # App Router pages
├── songs/page.tsx           # Repertoire with dynamic section headers
├── events/page.tsx          # Events with tabs per event + EventContent
├── concerts/page.tsx        # Concerts with upcoming/past/detail tabs
├── rehearsals/              # Rehearsal pages
│   ├── page.tsx             # Rehearsal listing (Todos, Próximos, Pasados)
│   └── [id]/page.tsx        # Individual rehearsal detail
├── guides/page.tsx          # Guides/documentation
├── page.tsx                 # Dashboard home
├── api/og/                  # Dynamic OG image routes
│   ├── concert/[id]/route.tsx
│   ├── event/[id]/route.tsx
│   ├── rehearsal/[id]/route.tsx
│   └── song/[id]/route.tsx
└── globals.css              # Design tokens
components/
├── ui/
│   ├── Modal.tsx            # Compound modal component
│   └── FileDropzone.tsx     # Drag-and-drop upload
├── player/                  # Music player components
├── tour/                    # Tour guide components
├── SongRow.tsx              # Playlist-style row
├── StatusBadge.tsx          # Status indicator
├── UserProfileModal.tsx     # Profile editing
├── SectionSettingsModal.tsx  # Section customization
├── AdminUsersModal.tsx      # User management
├── EventRow.tsx             # Event list item with icon
├── EventContent.tsx         # Event detail with setlist + concerts list
├── CreateEventModal.tsx     # Event create/edit form
├── ConcertContent.tsx       # Concert detail with setlist management
├── CreateConcertModal.tsx   # Concert create/edit form
├── RehearsalContent.tsx     # Rehearsal detail (setlist, attendance)
├── CreateRehearsalModal.tsx # Rehearsal create/edit with location picker
├── AttendancePanel.tsx      # Attendance tracking with GPS check-in
├── LocationsModal.tsx       # Location management with map picker
└── ...
contexts/
└── music-player-context.tsx # Music player state management
hooks/
├── use-songs.ts             # TanStack Query for songs
├── use-users.ts             # TanStack Query for users + useUpdateProfile
├── use-sections.ts          # TanStack Query for repertoire sections
├── use-events.ts            # TanStack Query for events + song management
├── use-concerts.ts          # TanStack Query for concerts + setlist
├── use-rehearsals.ts        # TanStack Query for rehearsals + attendance + blocks
├── use-locations.ts         # TanStack Query for locations CRUD
├── use-upload.ts            # File upload with progress
├── use-auth.ts              # Auth state + permission flags
├── use-org-config.ts        # Organization configuration
├── use-music-metadata.ts    # Music metadata resolution
├── use-msal-context.ts      # MSAL context hook
└── use-tour.ts              # Tour/guide functionality
lib/
├── api.ts                   # API client class with all methods
├── msal-config.ts           # Azure AD MSAL configuration
└── utils.ts                 # cn() utility for classnames
providers/
├── index.tsx                # MSAL + QueryClient providers
└── OrgConfigProvider.tsx    # Organization configuration provider
```

### Data Models (Prisma)
- **Organization**: Multi-tenancy (name, slug, domain, branding colors, allowedEmailDomains, superadminEmail)
- **AuthProvider**: Per-org auth config (azure_ad, google, email_password)
- **User**: Roles + profile data (avatarUrl, instruments[], phone, bio) + multi-auth (passwordHash, googleId, authProvider, emailVerified)
- **Song**: Status (PENDING, REHEARSING, READY, ARCHIVED), BPM, key, ISRC
- **SongVersion**: Arrangements (Studio, Live, Remix)
- **Event**: Recurring event types (e.g., "Navidad", "Graduación")
- **EventBlock**: Non-song setlist items for events (INTERLUDE, INTRODUCTION, BREAK, TRANSITION, CUSTOM)
- **Concert**: Specific performance dates within an Event
- **ConcertBlock**: Non-song setlist items for concerts
- **Rehearsal**: Scheduled rehearsals with optional event link and GPS location
- **RehearsalSong**: Junction table for rehearsal-song with ordering
- **RehearsalBlock**: Non-song setlist items for rehearsals
- **RehearsalAttendance**: Attendance tracking (PRESENT, ABSENT, LATE, EXCUSED) with GPS coords
- **Location**: GPS coordinates (latitude, longitude) + radiusMeters for check-in validation
- **Asset**: File attachments (scores, videos, audio) linked to songs/concerts/rehearsals
- **Tag**: Genre/category labels
- **AuditLog**: Activity tracking
- **RepertoireSection**: Customizable UI headers (title, subtitle, iconName, bannerUrl, gradients)

### Authentication Flow
1. **Azure AD**: Frontend MSAL acquires token → backend validates via passport-azure-ad
2. **Google OAuth**: Frontend redirects to `/auth/google` → backend handles callback, issues app JWT
3. **Email/Password**: Frontend posts to `/auth/login` or `/auth/register` → backend validates, issues app JWT
4. **Unified guard**: `UnifiedAuthGuard` validates app JWT first (fast), falls back to Azure AD
5. Domain validation ensures only allowed email domains (configured per organization)
6. User is upserted in DB on first login, accounts linked by email across providers

### Permission System
```typescript
// Roles: SUPERADMIN, MEMBER, STUDENT_GUEST
// Frontend (use-auth.ts)
const {
  isAdmin,             // SUPERADMIN only
  canManageUsers,      // SUPERADMIN only
  canManageSongs,      // SUPERADMIN only
  canEditSongs,        // SUPERADMIN or MEMBER
  canManageEvents,     // SUPERADMIN only
  canSuggestSongs,     // SUPERADMIN or MEMBER
  canEditProfile,      // SUPERADMIN or MEMBER (not STUDENT_GUEST)
  canManageRehearsals, // SUPERADMIN only
} = useAuth();

// Backend (roles.guard.ts)
@Roles(Role.SUPERADMIN)
@Patch(':key')
updateSection() { ... }

@Roles(Role.SUPERADMIN)
@Post()
createConcert() { ... }
```

## Design System

Brand colors defined in `web/app/globals.css`:
- `brand-blue-primary`: #0033A0 (PUCMM blue)
- `brand-yellow`: #FFD200
- `brand-red`: #D22630
- Surface colors: `surface-0`, `surface-50`, `surface-100` (dark theme)

Custom utilities: `text-display`, `text-h1`, `glass`, `glass-strong`, `animate-fade-in`, `animate-shimmer`, `scrollbar-hide`, `transition-smooth`, `transition-bounce`

### Tailwind CSS Notes
- Use `bg-linear-to-b` and `bg-linear-to-br` (Tailwind 4 canonical syntax)
- Avoid `bg-gradient-to-*` (older syntax, still works but linter warns)

### Mobile-First Design Guidelines
**CRITICAL**: This app is primarily used on mobile devices. Always design mobile-first.

1. **Admin Controls Must Always Be Visible**
   - Never hide admin buttons/controls on mobile with `hidden md:flex`
   - Use smaller sizes on mobile: `w-8 h-8 md:w-10 md:h-10`
   - Admin features should be accessible on all screen sizes

2. **Horizontal Scrolling for Tabs/Navigation**
   - Use `overflow-x-auto scrollbar-hide` for tab containers
   - Add `whitespace-nowrap shrink-0` to tab buttons
   - Reduce padding on mobile: `px-3 md:px-4 py-1.5 md:py-2`

3. **Responsive Text & Spacing**
   - Text: `text-sm md:text-base` or `text-xs md:text-sm`
   - Gaps: `gap-1.5 md:gap-2` or `gap-2 md:gap-3`
   - Padding: `px-3 md:px-4`, `py-2 md:py-2.5`

4. **Icon Sizes**
   - Mobile: `size={16}` or explicit `w-4 h-4`
   - Desktop: `md:w-[18px] md:h-[18px]` or `md:w-5 md:h-5`

5. **Touch Targets**
   - Minimum touch target: 44x44px on mobile
   - Use `py-2` minimum for buttons
   - Add `active:scale-95` for touch feedback

6. **Common Mobile Patterns**
```tsx
// Scrollable tabs
<div className="flex gap-1.5 md:gap-2 overflow-x-auto scrollbar-hide">
  <button className="px-3 md:px-4 py-1.5 md:py-2 text-sm md:text-base whitespace-nowrap shrink-0">
    Tab
  </button>
</div>

// Always-visible admin button
<button className="flex w-8 h-8 md:w-10 md:h-10 ...">
  <Icon size={16} className="md:w-[18px] md:h-[18px]" />
</button>

// Responsive action bar
<div className="flex items-center gap-2 md:gap-3">
  <span className="text-xs md:text-sm ml-auto whitespace-nowrap">Info</span>
</div>
```

## Reusable Patterns

### Modal Component (Compound Pattern)
```tsx
import { Modal } from "@/components/ui/Modal";

<Modal isOpen={isOpen} onClose={onClose} size="lg">
  <Modal.Header icon={<Icon />} subtitle="Subtitle">
    Title
  </Modal.Header>
  <Modal.Body className="space-y-4">
    {/* Content */}
  </Modal.Body>
  {/* Optional footer - not a compound component, use div directly */}
  <div className="shrink-0 px-6 py-4 border-t border-white/5 bg-surface-100/30">
    <button>Save</button>
  </div>
</Modal>
```

### File Upload with Progress
```tsx
import { FileDropzone } from "@/components/ui/FileDropzone";
import { useUpload } from "@/hooks/use-upload";

// Component approach
<FileDropzone
  type="image"  // "image" | "pdf" | "video"
  label="Upload Image"
  description="Max 15MB"
  onUploadComplete={(response) => {
    const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}${response.file.url}`;
    setImageUrl(fullUrl);
  }}
/>

// Hook approach for custom UI
const { upload, isUploading, progress, error } = useUpload("image");
const response = await upload(file);
```

### TanStack Query Hooks
```tsx
// Fetching
const { data: songs, isLoading, error } = useSongs();
const { data: sections } = useSections();
const { data: users } = useUsers();  // SUPERADMIN only
const { data: events } = useEvents();
const { data: event } = useEvent(eventId);  // With full relations
const { data: concerts } = useConcerts();
const { data: concert } = useConcert(concertId);  // With songs
const { data: rehearsals } = useRehearsals();
const { data: rehearsal } = useRehearsal(rehearsalId);  // With songs + attendance
const { data: locations } = useLocations();

// Song mutations
const createSong = useCreateSong();
const updateProfile = useUpdateProfile();
const updateSection = useUpdateSection();

await createSong.mutateAsync({ title: "Song", artist: "Artist" });
await updateProfile.mutateAsync({ name: "New Name", instruments: ["Piano"] });
await updateSection.mutateAsync({ key: "repertorio", data: { title: "New Title" } });

// Events mutations
const createEvent = useCreateEvent();
const addSongToEvent = useAddSongToEvent();
await createEvent.mutateAsync({ name: "Navidad 2024", type: "Navidad" });
await addSongToEvent.mutateAsync({ eventId, songId });

// Concerts mutations
const createConcert = useCreateConcert();
const copySongs = useCopyEventSongsToConcert();
await createConcert.mutateAsync({ eventId, date: new Date().toISOString(), location: "Auditorio" });
await copySongs.mutateAsync(concertId);  // Copy all songs from parent event

// Rehearsal mutations
const createRehearsal = useCreateRehearsal();
const addSongToRehearsal = useAddSongToRehearsal();
const checkIn = useCheckIn();
const markAttendance = useAdminMarkAttendance();
const addBlock = useAddBlockToRehearsal();
const reorderSetlist = useReorderRehearsalSetlist();
await createRehearsal.mutateAsync({ date: new Date().toISOString(), locationId, eventId });
await checkIn.mutateAsync({ rehearsalId, latitude: 18.5, longitude: -69.9 });
await markAttendance.mutateAsync({ rehearsalId, userId, status: "PRESENT" });

// Location mutations
const createLocation = useCreateLocation();
await createLocation.mutateAsync({ name: "Auditorio", latitude: 18.5, longitude: -69.9, radiusMeters: 200 });
```

### API Client
```typescript
import { api } from "@/lib/api";

// All methods return typed responses
const songs = await api.getSongs();
const user = await api.getMe();
const sections = await api.getSections();

// Upload with progress callback
const response = await api.uploadImage(file, (progress) => {
  console.log(`${progress}% uploaded`);
});

// Music metadata
const metadata = await api.resolveMusicLink("https://open.spotify.com/track/...");
const results = await api.searchSongMetadata("Despacito", "Luis Fonsi");

// Auth (email/password)
const { token } = await api.login("user@example.com", "password");
await api.register("user@example.com", "password", "John Doe");
```

## File Upload Limits

| Type | Max Size | Formats | Storage Path |
|------|----------|---------|--------------|
| Image | 15 MB | JPEG, PNG, WebP, GIF | `/uploads/images/` |
| PDF | 150 MB | PDF | `/uploads/scores/` |
| Video | 1.5 GB | MP4, WebM, MOV, AVI | `/uploads/videos/` |

## Environment Variables

See [docs/deployment-guide.md](docs/deployment-guide.md) for the full deployment guide including all variables, seed data configuration, and step-by-step instructions for deploying a new organization.

### API (`api/.env`)
```
DATABASE_URL=postgresql://...
AZURE_AD_TENANT_ID=
AZURE_AD_TENANT_NAME=            # e.g., "ce.pucmm.edu.do"
AZURE_AD_CLIENT_ID=
AZURE_AD_CLIENT_SECRET=
GOOGLE_CLIENT_ID=                # Optional: enables Google OAuth
GOOGLE_CLIENT_SECRET=            # Optional
ENABLE_EMAIL_PASSWORD_AUTH=      # Optional: "true" to enable
SPOTIFY_CLIENT_ID=               # Optional: music metadata
SPOTIFY_CLIENT_SECRET=
GETSONGBPM_API_KEY=              # Optional: BPM/key metadata
JWT_SECRET=                      # App-issued JWT tokens
FRONTEND_URL=                    # OAuth callbacks
CORS_ORIGINS=                    # Comma-separated frontend origins
PORT=3001
NODE_ENV=                        # development | production
```

### Web (`web/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_AZURE_AD_TENANT_ID=
NEXT_PUBLIC_AZURE_AD_CLIENT_ID=
NEXT_PUBLIC_ORG_NAME=            # Display name (fallback: "Band App")
NEXT_PUBLIC_ORG_DESCRIPTION=     # Meta description (fallback: "Band Management System")
API_INTERNAL_URL=                # Server-only: internal URL for SSR
```

### Production
```
# App: https://pucmm-band.cjoga.cloud
# API: https://pucmm-band-api.cjoga.cloud
```

## Ports
- PostgreSQL: 5433 (mapped to container 5432)
- API: 3001
- Web: 3000

## Common Implementation Patterns

### Adding a New Backend Module
1. Create folder: `src/module-name/`
2. Create files: `module-name.module.ts`, `module-name.controller.ts`, `module-name.service.ts`
3. Create DTOs in `dto/` subfolder with class-validator decorators
4. Add module to `app.module.ts` imports
5. Run `npm run build` to verify

### Adding a New Frontend Hook
1. Create hook in `hooks/use-feature.ts`
2. Use TanStack Query patterns:
   - `useQuery` for fetching
   - `useMutation` for create/update/delete
   - Update query cache in `onSuccess`
3. Add types to `lib/api.ts`
4. Add API methods to the `ApiClient` class

### Protecting an Endpoint
```typescript
// Backend
@UseGuards(AzureAdGuard)  // Requires authentication
@Roles(Role.SUPERADMIN)   // Requires specific roles
@Patch(':id')
update(@Request() req) {
  const user = req.user.dbUser;  // Access current user
  // Check permissions...
}
```

### Dynamic Tailwind Classes
When using dynamic gradient/color classes from the database:
```tsx
// These work because Tailwind scans for static strings
className={`bg-linear-to-br from-${gradientFrom} to-${gradientTo}`}

// Make sure the values are valid Tailwind color classes
// e.g., "brand-blue-primary", "indigo-600", "amber-500/30"
```

## Seed Data

Seed data is organized by organization in `prisma/seeds/<org-slug>.json`. The `SEED_ORG` env var selects which file to use (default: `pucmm-band`).

```
prisma/seeds/
├── pucmm-band.json    # PUCMM Band organization data
└── _template.json     # Template for new organizations
```

Each JSON contains: superadmin email, organization branding, auth provider config, and repertoire section labels. Auth secrets (tenant IDs, client IDs) still come from env vars.

```bash
npx prisma db seed                      # Uses pucmm-band by default
SEED_ORG=my-org npx prisma db seed      # Uses prisma/seeds/my-org.json
```

To deploy a new organization:
1. Copy `_template.json` to `<your-slug>.json`
2. Customize the values
3. Run `SEED_ORG=<your-slug> npx prisma db seed`

## Events, Concerts & Rehearsals Architecture

### Events
- Recurring event types (e.g., "Navidad", "Graduación", "Extracurricular")
- Have their own setlist (songs planned for the event) + blocks (interludes, breaks)
- Contain multiple concerts and rehearsals
- Customizable appearance (iconName, bannerUrl, gradients)
- Accessed via `/events` page with tabs per event

### Concerts
- Specific performance dates within an Event
- Have their own setlist (can differ from event's planned songs) + blocks
- Can copy songs from parent event with one click
- Support location, notes, upcoming/past categorization
- Accessed via `/concerts` page with tabs: Todos, Próximos, Pasados
- Direct navigation from events: clicking a concert navigates to `/concerts?concert={id}`

### Rehearsals
- Scheduled practice sessions, optionally linked to an Event
- Have their own setlist (songs + blocks) with drag-and-drop reordering
- GPS-based attendance tracking with location validation
- Attendance statuses: PRESENT, ABSENT, LATE, EXCUSED
- Check-in validates user's GPS coordinates against location's radius
- Admin can manually mark attendance
- Can copy songs from parent event
- Accessed via `/rehearsals` page with tabs: Todos, Próximos, Pasados

### Data Flow
```
Event (Navidad 2024)
├── Planned Songs [songA, songB, songC]
├── Blocks [Introducción, Interludio]
├── Concert (Dec 15, 2024 @ Auditorio)
│   └── Actual Setlist [songA, songC]  ← Can copy from event or customize
├── Concert (Dec 22, 2024 @ Teatro)
│   └── Actual Setlist [songA, songB, songD]
├── Rehearsal (Dec 10, 2024 @ Sala de Ensayo)
│   ├── Setlist [songA, songB, Interludio, songC]
│   └── Attendance [user1: PRESENT, user2: LATE, user3: ABSENT]
└── Rehearsal (Dec 12, 2024 @ Sala de Ensayo)
    ├── Setlist [songA, songC]
    └── Attendance [user1: PRESENT, user2: PRESENT]
```

### Backend Transform Pattern
The concerts service transforms Prisma's `songsPlayed` relation to `songs` for frontend consistency:
```typescript
private transformConcert(concert: any) {
  const { songsPlayed, _count, ...rest } = concert;
  return {
    ...rest,
    songs: songsPlayed || [],
    _count: _count ? { songs: _count.songsPlayed } : undefined,
  };
}
```

## Locations & GPS Attendance

Locations store GPS coordinates used for rehearsal check-in validation:
```typescript
// Location model
{ name, address, latitude, longitude, radiusMeters (default: 200) }

// Check-in validates distance between user's GPS and location
POST /rehearsals/:id/check-in { latitude, longitude }
// Returns error if user is outside the location's radius
```

## Music Metadata Resolution

The music-metadata module resolves platform links to structured metadata:
```typescript
// Resolve a music link
POST /music-metadata/resolve { url: "https://open.spotify.com/track/..." }
// Returns: { title, artist, album, coverUrl, duration, bpm, key, genre, isrc }

// Search by title + artist
GET /music-metadata/search?title=Despacito&artist=Luis+Fonsi

// Detect platform
POST /music-metadata/detect-platform { url: "..." }
// Returns: { platform: "spotify" | "youtube" | "apple_music" }
```
