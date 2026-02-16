# PUCMM Band App

Sistema de Gestion de Repertorio para la Banda Universitaria PUCMM.

**App:** https://pucmm-band.cjoga.cloud
**API:** https://pucmm-band-api.cjoga.cloud

## Overview

Plataforma centralizada para la gestion artistica y logistica de la banda universitaria. El sistema maneja el ciclo completo de una presentacion: desde la sugerencia de una cancion, su aprobacion, asignacion de voces, ensayo, hasta la ejecucion en vivo.

## Features

### Gestion de Repertorio

- Catalogo de canciones con estados (Pendiente, Ensayando, Lista, Archivada)
- Sugerencia de canciones via enlaces de Spotify, YouTube o Apple Music
- Extraccion automatica de metadatos (titulo, artista, portada, duracion, BPM, tonalidad, genero)
- Sistema de votacion para sugerencias
- Asignacion de voces principales
- Deteccion de duplicados por ISRC

### Eventos y Conciertos

- Eventos recurrentes (Navidad, Graduacion, Extracurriculares)
- Conciertos con fechas y ubicaciones especificas
- Setlists independientes con drag-and-drop para ordenar
- Bloques de setlist (interludios, introducciones, descansos, transiciones)
- Copiado de setlist desde evento a concierto
- Galeria multimedia (fotos y videos de conciertos)
- Visor de partituras PDF integrado

### Ensayos y Asistencia

- Programacion de ensayos vinculados a eventos
- Gestion de ubicaciones con coordenadas GPS
- Check-in de asistencia con validacion GPS (radio configurable)
- Control de asistencia por admin (Presente, Ausente, Tarde, Excusado)
- Setlists de ensayo con canciones y bloques
- Copiado de canciones desde evento padre

### Resolucion de Metadatos Musicales

- Resolucion automatica de enlaces de Spotify, YouTube y Apple Music
- Extraccion de metadatos: titulo, artista, album, portada, duracion, BPM, tonalidad, genero, ISRC
- Busqueda de canciones por titulo y artista
- Deteccion automatica de plataforma

### Usuarios y Permisos

- Autenticacion multi-proveedor: Azure AD, Google OAuth, email/password
- Dominio restringido configurable por organizacion
- Roles: SUPERADMIN, MEMBER, STUDENT_GUEST
- Perfiles personalizables (avatar, instrumentos, biografia)
- Control de acceso basado en roles

### Multi-tenencia y Organizaciones

- Soporte para multiples organizaciones
- Branding personalizable (logo, colores, nombre)
- Configuracion de proveedores de autenticacion por organizacion
- Endpoint publico de configuracion (sin autenticacion)
- Seed data por organizacion

### Personalizacion

- Secciones con banners, iconos y colores configurables
- Filtros por genero musical
- Interfaz responsive (mobile-first)
- Metadata publica para SEO/OG tags en redes sociales

## Tech Stack

### Backend

- NestJS 11 / TypeScript
- PostgreSQL 16 / Prisma ORM
- Azure AD (passport-azure-ad)
- Google OAuth (passport-google-oauth20)
- JWT (app-issued tokens) + bcrypt
- class-validator

### Frontend

- Next.js 16 / React 19 / TypeScript
- Tailwind CSS 4
- TanStack Query v5
- MSAL React
- @dnd-kit (drag-and-drop)
- react-pdf
- Leaflet / react-leaflet (mapas)
- Framer Motion (animaciones)

## Architecture

```
PUCMM_BAND_APP/
├── api/                    # NestJS Backend
│   ├── prisma/             # Schema, migrations, seed
│   │   └── seeds/          # Per-organization seed data
│   ├── src/
│   │   ├── auth/           # Multi-provider authentication
│   │   ├── songs/          # Songs CRUD
│   │   ├── users/          # User management
│   │   ├── events/         # Events CRUD
│   │   ├── concerts/       # Concerts CRUD
│   │   ├── rehearsals/     # Rehearsals CRUD + attendance
│   │   ├── locations/      # GPS locations for attendance
│   │   ├── organizations/  # Multi-tenancy config
│   │   ├── music-metadata/ # Spotify/YouTube/Apple Music resolver
│   │   ├── public-metadata/ # SEO/OG tag endpoints
│   │   ├── uploads/        # File uploads
│   │   └── repertoire-sections/
│   └── uploads/            # Stored files
└── web/                    # Next.js Frontend
    ├── app/                # Pages (songs, events, concerts, rehearsals, guides)
    │   └── api/og/         # Dynamic OG image routes
    ├── components/         # UI components
    │   ├── player/         # Music player
    │   └── tour/           # Tour guide
    ├── contexts/           # React contexts (music player)
    ├── hooks/              # TanStack Query hooks
    ├── lib/                # API client, utilities
    └── providers/          # MSAL, QueryClient, OrgConfig
```

## Data Model

- **Organization**: Multi-tenancy (branding, auth providers, domain restrictions)
- **User**: Roles, perfil (avatar, instrumentos, bio), multi-auth (passwordHash, googleId)
- **Song**: Metadatos, estado, voces, votos, ISRC
- **Event**: Tipo de evento, setlist planificado, bloques
- **Concert**: Fecha, ubicacion, setlist ejecutado, bloques
- **Rehearsal**: Fecha, ubicacion GPS, setlist, bloques, asistencia
- **Location**: Coordenadas GPS, radio de validacion
- **RehearsalAttendance**: Estado (PRESENT, ABSENT, LATE, EXCUSED), GPS check-in
- **Asset**: Archivos adjuntos (partituras, videos)
- **RepertoireSection**: Configuracion visual de secciones
- **AuthProvider**: Configuracion de proveedores de auth por organizacion

## Roles

| Rol           | Permisos                                                           |
| ------------- | ------------------------------------------------------------------ |
| SUPERADMIN    | Gestion completa: usuarios, canciones, eventos, ensayos, config    |
| MEMBER        | Sugerir canciones, editar canciones, votar, editar perfil          |
| STUDENT_GUEST | Solo lectura                                                       |

## Development Setup

### Prerequisites

- Node.js 20+
- Docker
- Azure AD tenant (or Google OAuth or email/password auth)

### Database

```bash
docker-compose up -d
```

### Backend

```bash
cd api
cp .env.example .env  # Configure environment variables
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

### Frontend

```bash
cd web
cp .env.example .env.local  # Configure environment variables
npm install
npm run dev
```

### Ports

- PostgreSQL: 5433
- API: 3001
- Web: 3000

## Environment Variables

### API

```
DATABASE_URL=postgresql://...
AZURE_AD_TENANT_ID=
AZURE_AD_TENANT_NAME=            # e.g., "ce.pucmm.edu.do"
AZURE_AD_CLIENT_ID=
AZURE_AD_CLIENT_SECRET=
GOOGLE_CLIENT_ID=                # Optional: enables Google OAuth
GOOGLE_CLIENT_SECRET=
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

### Web

```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_AZURE_AD_TENANT_ID=
NEXT_PUBLIC_AZURE_AD_CLIENT_ID=
NEXT_PUBLIC_ORG_NAME=            # Display name (fallback: "Band App")
NEXT_PUBLIC_ORG_DESCRIPTION=     # Meta description (fallback: "Band Management System")
API_INTERNAL_URL=                # Server-only: internal URL for SSR
```
