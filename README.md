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
- **Iconos:** Lucide React
- **Lenguaje:** TypeScript 5.x

## Project Structure

```
PUCMM_BAND_APP/
├── api/                    # NestJS Backend
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── src/
│   │   ├── auth/           # Azure AD authentication
│   │   ├── prisma/         # Prisma service
│   │   ├── songs/          # Songs CRUD module
│   │   └── main.ts
│   └── test/
├── web/                    # Next.js Frontend
│   ├── app/
│   │   ├── globals.css     # Design tokens & theme
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   └── SongCard.tsx
│   └── lib/
├── Banda_App_Diseno.md     # Design System documentation
└── Banda_App_Requisitos.md # Software Requirements (SRS)
```

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Azure AD tenant (for authentication)

### Backend Setup

```bash
cd api
npm install
cp .env.example .env  # Configure your environment variables
npx prisma migrate dev
npm run start:dev
```

Required environment variables:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/pucmm_band"
AZURE_AD_TENANT_NAME="your-tenant"
AZURE_AD_CLIENT_ID="your-client-id"
```

### Frontend Setup

```bash
cd web
npm install
npm run dev
```

The app will be available at `http://localhost:3000`

---

## Development Progress

### Phase 1: Core (In Progress)

| Feature | Status | Notes |
|---------|--------|-------|
| NestJS project structure | ✅ Done | Hexagonal architecture ready |
| Prisma schema | ✅ Done | User, Song, Event, Asset, Tag, AuditLog models |
| Songs CRUD API | ✅ Done | Basic CRUD operations |
| Azure AD Strategy | ✅ Done | Domain validation (@ce.pucmm.edu.do) |
| Next.js project | ✅ Done | App Router, React 19 |
| Design System tokens | ✅ Done | Colors, typography, spacing from specs |
| SongCard component | ✅ Done | Grid view with hover effects |
| Sidebar navigation | ✅ Done | Desktop layout |
| Spotify API integration | ❌ Pending | RF-004: Link-to-Song metadata |
| YouTube API integration | ❌ Pending | Video validation & thumbnails |
| Duplicate detection | ❌ Pending | RF-005: ISRC/fuzzy matching |
| Frontend auth flow | ❌ Pending | MSAL integration |
| Song list views | ❌ Pending | Grid + Table views |
| Search bar | ❌ Pending | Global search with Ctrl+K |
| State management | ❌ Pending | Zustand + TanStack Query |
| Form validation | ❌ Pending | React Hook Form + Zod |

### Phase 2: Gestión (Not Started)

| Feature | Status | Notes |
|---------|--------|-------|
| Events module | ❌ Pending | CRUD for events |
| Setlists drag-and-drop | ❌ Pending | RF-009: Dynamic ordering |
| Time calculation | ❌ Pending | RF-010: Show duration |
| File upload (Assets) | ❌ Pending | RF-007: PDF/partituras |
| Video upload | ❌ Pending | RF-008: MP4 with A-B repeat |
| PDF viewer | ❌ Pending | In-browser viewing |
| RBAC middleware | ❌ Pending | Role-based guards |
| User management UI | ❌ Pending | Admin panel |

### Phase 3: Social (Not Started)

| Feature | Status | Notes |
|---------|--------|-------|
| Comments system | ❌ Pending | RF-012: Per-song threads |
| Push notifications | ❌ Pending | RF-013: PWA notifications |
| Email notifications | ❌ Pending | RF-013: Event updates |
| Mode "On Stage" | ❌ Pending | RF-011: Live performance view |
| Bottom navigation | ❌ Pending | Mobile responsive |

### Phase 4: Advanced (Not Started)

| Feature | Status | Notes |
|---------|--------|-------|
| Analytics dashboard | ❌ Pending | Most played songs, etc. |
| Version history | ❌ Pending | Song version tracking |
| Audit log UI | ❌ Pending | Admin activity view |

---

## Data Model

The application uses the following core entities:

- **User**: Band members with roles (SuperAdmin, SectionLeader, Member, Alumni)
- **Song**: Musical pieces with metadata (title, artist, BPM, key, status)
- **SongVersion**: Different arrangements of songs (Studio, Live, Remix)
- **Event**: Performances and shows
- **Asset**: Files attached to songs (scores, videos, audio)
- **Tag**: Genre/category labels
- **AuditLog**: Activity tracking

## Design System

The UI follows an Atomic Design methodology with:

- **Dark mode first** interface (Slate color palette)
- **4px spacing scale** for consistent layouts
- **Inter font family** for UI elements
- **Brand colors**: PUCMM Blue (#0033A0), Yellow (#FFD200), Red (#D22630)

See [Banda_App_Diseno.md](./Banda_App_Diseno.md) for complete design specifications.

## Requirements

Full software requirements are documented in [Banda_App_Requisitos.md](./Banda_App_Requisitos.md).

## License

Private - PUCMM University
