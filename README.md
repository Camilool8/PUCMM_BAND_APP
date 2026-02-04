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
- Copiado de setlist desde evento a concierto
- Galeria multimedia (fotos y videos de conciertos)
- Visor de partituras PDF integrado

### Usuarios y Permisos

- Autenticacion via Azure AD (dominio @ce.pucmm.edu.do)
- Roles: SUPERADMIN, SECTION_LEADER, MEMBER, ALUMNI_GUEST
- Perfiles personalizables (avatar, instrumentos, biografia)
- Control de acceso basado en roles

### Personalizacion

- Secciones con banners, iconos y colores configurables
- Filtros por genero musical
- Interfaz responsive (mobile-first)

## Tech Stack

### Backend

- NestJS 11 / TypeScript
- PostgreSQL 16 / Prisma ORM
- Azure AD (passport-azure-ad)
- class-validator

### Frontend

- Next.js 16 / React 19 / TypeScript
- Tailwind CSS 4
- TanStack Query v5
- MSAL React
- @dnd-kit (drag-and-drop)
- react-pdf

## Architecture

```
PUCMM_BAND_APP/
├── api/                    # NestJS Backend
│   ├── prisma/             # Schema, migrations, seed
│   ├── src/
│   │   ├── auth/           # Azure AD authentication
│   │   ├── songs/          # Songs CRUD
│   │   ├── users/          # User management
│   │   ├── events/         # Events CRUD
│   │   ├── concerts/       # Concerts CRUD
│   │   ├── uploads/        # File uploads
│   │   └── repertoire-sections/
│   └── uploads/            # Stored files
└── web/                    # Next.js Frontend
    ├── app/                # Pages (songs, events, concerts)
    ├── components/         # UI components
    ├── hooks/              # TanStack Query hooks
    └── lib/                # API client, utilities
```

## Data Model

- **User**: Roles, perfil (avatar, instrumentos, bio)
- **Song**: Metadatos, estado, voces, votos, ISRC
- **Event**: Tipo de evento, setlist planificado
- **Concert**: Fecha, ubicacion, setlist ejecutado
- **Asset**: Archivos adjuntos (partituras, videos)
- **RepertoireSection**: Configuracion visual de secciones

## Roles

| Rol            | Permisos                                                                     |
| -------------- | ---------------------------------------------------------------------------- |
| SUPERADMIN     | Gestion completa de usuarios, canciones, eventos, conciertos y configuracion |
| SECTION_LEADER | Gestion de canciones, eventos y conciertos                                   |
| MEMBER         | Sugerir canciones, votar, editar perfil                                      |
| ALUMNI_GUEST   | Solo lectura                                                                 |

## Development Setup

### Prerequisites

- Node.js 20+
- Docker
- Azure AD tenant

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
AZURE_AD_CLIENT_ID=
AZURE_AD_CLIENT_SECRET=
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
```

### Web

```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_AZURE_AD_TENANT_ID=
NEXT_PUBLIC_AZURE_AD_CLIENT_ID=
```
