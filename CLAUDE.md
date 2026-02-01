# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PUCMM Band App - A repertoire management system for the PUCMM university band. Monorepo with NestJS backend (`/api`) and Next.js frontend (`/web`).

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
- **Azure AD** authentication via `passport-azure-ad` (BearerStrategy)
- Domain restricted to `@ce.pucmm.edu.do` emails

Module structure:
```
src/
├── auth/          # Azure AD strategy & guards
├── prisma/        # PrismaService wrapper
├── songs/         # Songs CRUD (controller, service, DTOs)
├── app.module.ts  # Root module with ConfigModule
└── main.ts        # Bootstrap with CORS config
```

### Frontend (`/web`)
- **Next.js 16** with App Router
- **React 19** with TanStack Query v5 for server state
- **MSAL React** for Azure AD authentication
- **Tailwind CSS 4** with custom design tokens

Key patterns:
```
app/                    # App Router pages
components/             # React components
hooks/use-songs.ts      # TanStack Query hooks (useSongs, useCreateSong, etc.)
hooks/use-auth.ts       # Auth state hook
lib/api.ts              # API client class with Bearer token
lib/msal-config.ts      # Azure AD MSAL configuration
providers/index.tsx     # MSAL + QueryClient providers wrapper
```

### Data Models (Prisma)
- **User**: Roles (SUPERADMIN, SECTION_LEADER, MEMBER, ALUMNI_GUEST)
- **Song**: Status (PENDING, REHEARSING, READY, ARCHIVED), includes BPM, key, ISRC. Can be linked to Events (planned) or Concerts (actually played).
- **SongVersion**: Arrangements (Studio, Live, Remix)
- **Event**: Recurring event types (e.g., "Navidad", "Graduación"). Contains planned songs.
- **Concert**: Specific performance dates within an Event. Records songs played and videos.
- **Asset**: File attachments (scores on songs, videos on songs or concerts)
- **Tag**: Genre/category labels

### Authentication Flow
1. Frontend: MSAL acquires token from Azure AD
2. `useAuth()` hook manages auth state and token
3. `api.ts` client attaches `Authorization: Bearer {token}`
4. Backend: `AzureAdGuard` validates token with passport-azure-ad
5. Domain validation ensures `@ce.pucmm.edu.do` only

## Design System

Brand colors defined in `web/app/globals.css`:
- `brand-blue-primary`: #0033A0 (PUCMM blue)
- `brand-yellow`: #FFD200
- `brand-red`: #D22630
- Surface colors: `surface-0`, `surface-50`, `surface-100` (dark theme)

Custom utilities: `text-display`, `text-h1`, `glass`, `animate-fade-in`, `scrollbar-hide`

## Environment Variables

### API (`api/.env`)
```
DATABASE_URL=postgresql://pucmm_band:pucmm_band_2024@localhost:5433/pucmm_band
AZURE_AD_TENANT_ID=
AZURE_AD_CLIENT_ID=
AZURE_AD_CLIENT_SECRET=
PORT=3001
```

### Web (`web/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_AZURE_AD_TENANT_ID=
NEXT_PUBLIC_AZURE_AD_CLIENT_ID=
```

## Ports
- PostgreSQL: 5433 (mapped to container 5432)
- API: 3001
- Web: 3000
