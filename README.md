# PUCMM Band App

Sistema Integral de Gestión de Repertorio para la Banda Universitaria PUCMM.

Una plataforma centralizada "Todo en Uno" para la gestión artística y logística de la banda universitaria. El sistema orquesta el ciclo de vida completo de una presentación: desde la sugerencia de una canción, su aprobación, asignación de voces, ensayo, hasta la ejecución en vivo.

## Tech Stack

### Backend (`/api`)
- **Framework:** NestJS 11 (Node.js)
- **Base de Datos:** PostgreSQL 16 con Prisma ORM
- **Autenticación:** Azure AD (passport-azure-ad)
- **Lenguaje:** TypeScript 5.x

### Frontend (`/web`)
- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS 4
- **State Management:** TanStack Query v5
- **Auth:** MSAL React (Azure AD)
- **Iconos:** Lucide React
- **Lenguaje:** TypeScript 5.x

### Infrastructure
- **Database:** PostgreSQL 16 (Docker)
- **Container:** Docker Compose
- **File Storage:** Local filesystem (planned)

## Project Structure

```
PUCMM_BAND_APP/
├── api/                          # NestJS Backend
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema
│   │   ├── seed.ts               # Database seeding (SUPERADMIN)
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
│   │   │   ├── users.controller.ts   # /users endpoints
│   │   │   ├── users.service.ts
│   │   │   └── dto/
│   │   └── main.ts
│   └── test/
├── web/                          # Next.js Frontend
│   ├── app/
│   │   ├── songs/page.tsx        # Repertorio (playlist view)
│   │   ├── globals.css           # Design tokens & theme
│   │   ├── layout.tsx
│   │   └── page.tsx              # Dashboard home
│   ├── components/
│   │   ├── Sidebar.tsx           # Navigation with admin section
│   │   ├── SongRow.tsx           # List row component
│   │   ├── SongDetailModal.tsx   # Song detail + admin actions
│   │   ├── SuggestionModal.tsx   # Add song form
│   │   ├── StatusBadge.tsx       # Status indicator
│   │   ├── BottomNav.tsx         # Mobile navigation
│   │   ├── AdminUsersModal.tsx   # User management (SUPERADMIN)
│   │   ├── DevViewToggle.tsx     # Dev mode admin/student toggle
│   │   └── AuthGuard.tsx         # Protected routes
│   ├── hooks/
│   │   ├── use-songs.ts          # TanStack Query hooks for songs
│   │   ├── use-users.ts          # TanStack Query hooks for users
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
npx prisma db seed          # Creates SUPERADMIN user
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
| Feature | Status | Notes |
|---------|--------|-------|
| NestJS project structure | ✅ Done | Modular architecture |
| Prisma schema | ✅ Done | User, Song, Event, Concert, Asset, Tag, AuditLog |
| Docker PostgreSQL | ✅ Done | Port 5433 (avoids conflicts) |
| Next.js 16 + React 19 | ✅ Done | App Router with providers |
| TanStack Query | ✅ Done | API state management |
| Design System tokens | ✅ Done | PUCMM colors, typography, spacing |

#### ✅ Authentication & Authorization
| Feature | Status | Notes |
|---------|--------|-------|
| Azure AD Login | ✅ Done | MSAL React integration |
| Backend JWT Validation | ✅ Done | passport-azure-ad BearerStrategy |
| User Upsert on Login | ✅ Done | Creates/updates user in DB on first login |
| Role-Based Access Control | ✅ Done | `@Roles()` decorator + `RolesGuard` |
| SUPERADMIN hardcoded | ✅ Done | `jcjg0001@ce.pucmm.edu.do` |
| Domain restriction | ✅ Done | Only `@ce.pucmm.edu.do` emails |

#### ✅ UI Components
| Feature | Status | Notes |
|---------|--------|-------|
| Dark theme UI | ✅ Done | Spotify-inspired design |
| Sidebar navigation | ✅ Done | Admin section for SUPERADMIN |
| Songs page | ✅ Done | List view with search |
| SongRow component | ✅ Done | Status badges, click to open detail |
| SongDetailModal | ✅ Done | **Admin can change status & delete** |
| SuggestionModal | ✅ Done | Working form for song suggestions |
| StatusBadge | ✅ Done | Ready/Rehearsing/Pending/Archived states |
| BottomNav | ✅ Done | Mobile navigation |
| Dashboard home | ✅ Done | Stats cards with depth, progress bar |
| AdminUsersModal | ✅ Done | SUPERADMIN can manage user roles |
| DevViewToggle | ✅ Done | Toggle admin/student view in dev mode |

#### ✅ APIs
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/songs` | GET | User | List all songs |
| `/songs/:id` | GET | User | Get song by ID |
| `/songs` | POST | User | Create new song |
| `/songs/:id` | PATCH | User | Update song (status, etc.) |
| `/songs/:id` | DELETE | User | Delete song |
| `/users/me` | GET | User | Get current user info |
| `/users` | GET | SUPERADMIN | List all users |
| `/users/:id/role` | PATCH | SUPERADMIN | Change user role |

### Phase 2: Gestión 🟡 In Progress

| Feature | Status | Notes |
|---------|--------|-------|
| **File Upload System** | ❌ Pending | Local storage for images, PDFs, videos |
| **Custom Covers/Banners** | ❌ Pending | Upload images for songs, events, concerts |
| Events module | ❌ Pending | CRUD for events (Navidad, Graduación, etc.) |
| Concerts module | ❌ Pending | Performance dates within events |
| Concert videos | ❌ Pending | Full show or per-song videos |
| Setlists drag-and-drop | ❌ Pending | Dynamic ordering |
| Time calculation | ❌ Pending | Show duration based on song lengths |
| PDF viewer | ❌ Pending | In-browser score viewing |
| Link song to user (suggester) | ❌ Pending | Track who suggested each song |

### Phase 3: Social (Not Started)

| Feature | Status | Notes |
|---------|--------|-------|
| Comments system | ❌ Pending | Per-song threads |
| Push notifications | ❌ Pending | PWA notifications |
| Email notifications | ❌ Pending | Event updates |
| Mode "On Stage" | ❌ Pending | Live performance view |
| Spotify API integration | ❌ Pending | Auto-fill song metadata |
| YouTube API integration | ❌ Pending | Video validation & thumbnails |
| Duplicate detection | ❌ Pending | ISRC/fuzzy matching |

### Phase 4: Advanced (Not Started)

| Feature | Status | Notes |
|---------|--------|-------|
| Analytics dashboard | ❌ Pending | Most played songs, etc. |
| Version history | ❌ Pending | Song version tracking |
| Audit log UI | ❌ Pending | Admin activity view |
| A-B repeat player | ❌ Pending | Practice mode for videos |

---

## Role System

| Role | Permissions |
|------|-------------|
| **SUPERADMIN** | Manage users, manage songs, view all data, assign roles |
| **SECTION_LEADER** | Manage songs (change status, delete), view all data |
| **MEMBER** | Suggest songs, view all data |
| **ALUMNI_GUEST** | View all data (read-only) |

### Dev Mode Toggle
In development, the SUPERADMIN (`jcjg0001@ce.pucmm.edu.do`) sees a floating button to toggle between Admin View and Student View. This hides all admin features to test the student experience.

---

## Data Model

```
User ──────────< Song >────────── Event
  │               │                 │
  │               │                 ├── Concert (performance dates)
  └── AuditLog    ├── SongVersion   │      │
                  ├── Asset ────────┼──────┘ (videos per concert)
                  └── Tag ──────────┘
```

- **User**: Band members with roles (SuperAdmin, SectionLeader, Member, Alumni)
- **Song**: Musical pieces with metadata (title, artist, BPM, key, status, coverUrl)
- **SongVersion**: Different arrangements (Studio, Live, Remix)
- **Event**: Recurring event types (e.g., "Navidad", "Graduación"). Contains planned songs.
- **Concert**: Specific performance dates within an Event. Records actual songs played and videos.
- **Asset**: Files attached to songs or concerts (scores, videos, audio)
- **Tag**: Genre/category labels
- **AuditLog**: Activity tracking

## UI Design

The UI follows a **Spotify-inspired** dark theme design:

- **Dark mode first** interface (Slate color palette)
- **Playlist-style** song lists with hover states
- **Event cards** with gradient backgrounds
- **Status badges** (Lista, Ensayando, Pendiente, Archivada)
- **Modal dialogs** for song details and forms
- **Depth & shadows** for visual hierarchy
- **Brand colors**: PUCMM Blue (#0033A0), Yellow (#FFD200), Red (#D22630)

See [Banda_App_Diseno.md](./Banda_App_Diseno.md) for complete design specifications.

## Environment Variables

### API (`api/.env`)
```env
DATABASE_URL="postgresql://pucmm_band:pucmm_band_2024@localhost:5433/pucmm_band"
AZURE_AD_TENANT_ID="your-tenant-id"
AZURE_AD_CLIENT_ID="your-client-id"
AZURE_AD_CLIENT_SECRET="your-secret"
PORT=3001
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
npx prisma db seed          # Seed SUPERADMIN user
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

## Requirements

Full software requirements are documented in [Banda_App_Requisitos.md](./Banda_App_Requisitos.md).

## License

Private - PUCMM University
