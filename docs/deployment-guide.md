# Deploying a New Organization

The app supports single-organization deployment with configurable branding, authentication, and domain restrictions. All organization-specific values are driven by deployment variables and seed data — no source code changes are required.

## Runtime Configuration Architecture

The frontend uses a dual-source config approach:
- **Development**: `process.env` (Next.js injects `NEXT_PUBLIC_*` at build time)
- **Production (Docker)**: `window.__ENV__` injected at container startup by `web/entrypoint.sh` into `public/config.js`

Brand colors are further overridden at runtime by `OrgConfigProvider`, which fetches `GET /organizations/config` from the API and applies CSS custom properties (`--color-brand-primary`, `--color-brand-secondary`, `--color-brand-accent`) to the document root.

### How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│  Docker Container Startup                                       │
│  entrypoint.sh reads env vars → writes public/config.js         │
│  (window.__ENV__ = { NEXT_PUBLIC_API_URL, ORG_NAME, ... })      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Browser loads config.js before React                           │
│  web/lib/env.ts reads window.__ENV__ (runtime) or               │
│  process.env (build time) via getEnvValue()                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  OrgConfigProvider (web/providers/OrgConfigProvider.tsx)         │
│  Fetches GET /organizations/config from the API                 │
│  Applies brand colors as CSS custom properties on <html>        │
│  Provides org config via React Context (useOrgConfig hook)      │
└─────────────────────────────────────────────────────────────────┘
```

## Step 1: Azure AD Setup

1. Create an App Registration in the new organization's Azure AD tenant
2. Note the **Tenant ID**, **Client ID**, and **Client Secret**
3. Register redirect URIs:
   - `https://<your-frontend-url>` (production)
   - `http://localhost:3000` (development)
4. Grant `User.Read` API permission
5. Under "Authentication", enable ID tokens

## Step 2: Database Setup

Update `db/docker-compose.yml` with new credentials:

| Variable | Default | Description |
|----------|---------|-------------|
| `container_name` | `pucmm_band_db` | Docker container name |
| `POSTGRES_USER` | `pucmm_band` | Database user |
| `POSTGRES_PASSWORD` | `pucmm_band_2024` | Database password |
| `POSTGRES_DB` | `pucmm_band` | Database name |
| Ports | `5433:5432` | Host:container port mapping |

The `db/init-db.sh` script also creates a `platform_admin` database automatically.

Then start the database, run migrations, and seed:
```bash
docker-compose -f db/docker-compose.yml up -d
cd api && npx prisma migrate dev && SEED_ORG=my-org npx prisma db seed
```

## Step 3: Seed Data (`api/prisma/seeds/`)

Seed data is organized by organization in JSON files under `api/prisma/seeds/`. The `SEED_ORG` env var selects which file to use (default: `pucmm-band`).

```
prisma/seeds/
├── pucmm-band.json    # PUCMM Band (default)
└── _template.json     # Template for new organizations
```

### Creating a New Organization Seed

1. Copy `_template.json` to `<your-slug>.json`:
   ```bash
   cp api/prisma/seeds/_template.json api/prisma/seeds/my-org.json
   ```

2. Edit the JSON file with your organization's values:

| Section | Field | Example | Description |
|---------|-------|---------|-------------|
| root | `superadminEmail` | `admin@myuni.edu` | Initial SUPERADMIN email (must match `allowedEmailDomains`) |
| `organization` | `name` | `My University Band` | Display name shown in UI |
| | `slug` | `my-org` | URL-safe identifier (must be unique) |
| | `domain` | `my-org.example.com` | Production domain |
| | `colorPrimary` | `#0033A0` | Primary brand color (hex) |
| | `colorSecondary` | `#FFD200` | Secondary brand color (hex) |
| | `colorAccent` | `#D22630` | Accent brand color (hex) |
| | `allowedEmailDomains` | `["myuni.edu"]` | Email domains allowed to log in |
| | `locale` | `es` | Language/locale code |
| `authProviders` | `azureAd.enabled` | `true` | Enable Azure AD login |
| | `google.enabled` | `false` | Enable Google login (also needs `GOOGLE_CLIENT_ID` env var) |
| | `emailPassword.enabled` | `false` | Enable email/password (also needs `ENABLE_EMAIL_PASSWORD_AUTH` env var) |
| `repertoireSections` | `[].title` | `Active Repertoire` | Localized section titles and labels |

3. Run the seed:
   ```bash
   SEED_ORG=my-org npx prisma db seed
   ```

### Auth Provider Conditions

Each auth provider requires **both** `enabled: true` in the JSON **and** the corresponding env vars:

| Provider | JSON field | Required env vars |
|----------|-----------|-------------------|
| Azure AD | `authProviders.azureAd` | `AZURE_AD_TENANT_ID`, `AZURE_AD_CLIENT_ID` |
| Google | `authProviders.google` | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| Email/Password | `authProviders.emailPassword` | `ENABLE_EMAIL_PASSWORD_AUTH=true` |

Auth secrets (tenant IDs, client IDs, secrets) are **never** stored in the JSON — they come exclusively from environment variables.

## Step 4: API Environment Variables

Set these in `api/.env` for the new organization:

```bash
# === Required ===
DATABASE_URL=postgresql://user:pass@localhost:5433/dbname
AZURE_AD_TENANT_ID=<new-tenant-id>
AZURE_AD_TENANT_NAME=<org-email-domain>       # e.g., "myuniversity.edu"
AZURE_AD_CLIENT_ID=<new-client-id>
AZURE_AD_CLIENT_SECRET=<new-client-secret>
CORS_ORIGINS=https://your-frontend.example.com # Comma-separated if multiple
FRONTEND_URL=https://your-frontend.example.com
JWT_SECRET=<generate-a-strong-secret>
PORT=3001
NODE_ENV=production

# === Optional: Additional Auth Providers ===
GOOGLE_CLIENT_ID=<google-client-id>
GOOGLE_CLIENT_SECRET=<google-client-secret>
ENABLE_EMAIL_PASSWORD_AUTH=true                # Set to "true" to enable

# === Optional: Music Metadata APIs ===
SPOTIFY_CLIENT_ID=<spotify-id>
SPOTIFY_CLIENT_SECRET=<spotify-secret>
GETSONGBPM_API_KEY=<api-key>
```

### CORS Configuration

The API (`src/main.ts`) always allows `localhost:3000` and `127.0.0.1:3000` for development. Production origins must be added via `CORS_ORIGINS` (comma-separated):

```bash
CORS_ORIGINS=https://myband.example.com,https://staging.myband.example.com
```

## Step 5: Frontend Environment Variables

Set these in `web/.env.local` (development) or as Docker env vars (production):

```bash
NEXT_PUBLIC_API_URL=https://your-api.example.com
NEXT_PUBLIC_SITE_URL=https://your-frontend.example.com
NEXT_PUBLIC_AZURE_AD_TENANT_ID=<new-tenant-id>
NEXT_PUBLIC_AZURE_AD_CLIENT_ID=<new-client-id>
NEXT_PUBLIC_ORG_NAME=My Band App                          # Fallback: "Band App"
NEXT_PUBLIC_ORG_DESCRIPTION=Repertoire management system  # Fallback: "Band Management System"
API_INTERNAL_URL=http://api-service:3001                  # Server-only: for SSR in Kubernetes
```

In Docker, these are injected at runtime via `entrypoint.sh` into `window.__ENV__` — **no rebuild needed** when changing values.

### Frontend Variables Reference

| Variable | Used For | Fallback |
|----------|----------|----------|
| `NEXT_PUBLIC_API_URL` | All API calls from browser | `http://localhost:3001` |
| `NEXT_PUBLIC_SITE_URL` | SEO metadata base URL | `http://localhost:3000` |
| `NEXT_PUBLIC_AZURE_AD_TENANT_ID` | MSAL auth config | Empty (multi-tenant) |
| `NEXT_PUBLIC_AZURE_AD_CLIENT_ID` | MSAL auth config | — |
| `NEXT_PUBLIC_ORG_NAME` | Page title, OG tags | `Band App` |
| `NEXT_PUBLIC_ORG_DESCRIPTION` | Meta description | `Band Management System` |
| `API_INTERNAL_URL` | SSR server-side fetches | Falls back to `NEXT_PUBLIC_API_URL` |

## Step 6: Build & Deploy

```bash
# Build Docker images
docker build -t myorg-api ./api
docker build -t myorg-web ./web

# Run backend
docker run -d \
  -e DATABASE_URL=postgresql://... \
  -e AZURE_AD_TENANT_ID=xxx \
  -e AZURE_AD_CLIENT_ID=xxx \
  -e AZURE_AD_CLIENT_SECRET=xxx \
  -e CORS_ORIGINS=https://myband.example.com \
  -e JWT_SECRET=xxx \
  -p 3001:3001 \
  myorg-api

# Run frontend (env vars injected at runtime by entrypoint.sh)
docker run -d \
  -e NEXT_PUBLIC_API_URL=https://api.myband.example.com \
  -e NEXT_PUBLIC_SITE_URL=https://myband.example.com \
  -e NEXT_PUBLIC_AZURE_AD_CLIENT_ID=xxx \
  -e NEXT_PUBLIC_ORG_NAME="My Band" \
  -e NEXT_PUBLIC_ORG_DESCRIPTION="Repertoire management for My Band" \
  -p 3000:3000 \
  myorg-web
```

## Step 7: Verify Deployment

1. **Organization config**: `GET /organizations/config` returns correct name, colors, and auth providers
2. **Authentication**: Login with an email matching `allowedEmailDomains` succeeds
3. **Brand colors**: Inspect `--color-brand-primary` on `<html>` element matches `colorPrimary`
4. **CORS**: API responses include `Access-Control-Allow-Origin` for your frontend URL
5. **SEO metadata**: `<title>`, `og:title`, `og:description` reflect org name/description
6. **File uploads**: Upload an image and verify it's accessible at `/uploads/images/...`

## What Does NOT Need to Change

- All TypeScript/NestJS source code (auth strategies read config from DB via `OrganizationsService`)
- All React/Next.js components (brand colors are CSS custom properties, not hardcoded)
- Prisma schema (already supports the `Organization` and `AuthProvider` models)
- Auth middleware and guards (domain validation uses `OrganizationsService.getAllowedDomains()`)
- CSS design tokens in `globals.css` (use `var()` fallback pattern, overridden at runtime)

## Optional: Static Assets

For full white-labeling, add organization-specific static files to `web/public/`:

| File | Purpose |
|------|---------|
| `favicon.ico` | Browser tab icon |
| `apple-touch-icon.png` | iOS home screen icon |
| `logo.png` | Full organization logo |
| `manifest.json` | PWA manifest (app name, theme color, icons) |

Note: `web/app/layout.tsx` has `appleWebApp.title` hardcoded to `"BandApp"` — update this if needed for your organization.

## Organization Data Model Reference

```prisma
model Organization {
  name                String              // Display name
  slug                String   @unique    // URL identifier
  domain              String?             // Production domain
  description         String?
  logoUrl             String?             // Full logo URL
  logoInitial         String?             // Fallback avatar character
  colorPrimary        String   @default("#0033A0")
  colorSecondary      String   @default("#FFD200")
  colorAccent         String   @default("#D22630")
  allowedEmailDomains String[]            // Login domain restriction
  superadminEmail     String              // Initial admin email
  metaTitle           String?             // SEO title
  metaDescription     String?             // SEO description
  locale              String   @default("es")
  authProviders       AuthProvider[]
}

model AuthProvider {
  provider      String          // "azure_ad" | "google" | "email_password"
  enabled       Boolean
  isPrimary     Boolean
  displayName   String?         // User-facing label (e.g., "Correo Estudiantil")
  config        Json            // Provider-specific: { tenantId, clientId, clientSecret, ... }
}
```

## Quick Reference: All Deployment Variables

### API (`api/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AZURE_AD_TENANT_ID` | Yes | Azure AD tenant ID |
| `AZURE_AD_TENANT_NAME` | Yes | Organization email domain |
| `AZURE_AD_CLIENT_ID` | Yes | Azure AD app client ID |
| `AZURE_AD_CLIENT_SECRET` | Yes | Azure AD app secret |
| `CORS_ORIGINS` | Yes (prod) | Allowed frontend origins (comma-separated) |
| `FRONTEND_URL` | Yes (prod) | Frontend URL for OAuth callbacks |
| `JWT_SECRET` | Yes | Secret for JWT signing |
| `PORT` | No | Server port (default: 3001) |
| `NODE_ENV` | No | `development` or `production` |
| `GOOGLE_CLIENT_ID` | No | Enables Google OAuth |
| `GOOGLE_CLIENT_SECRET` | No | Required with Google client ID |
| `ENABLE_EMAIL_PASSWORD_AUTH` | No | Set `true` to enable email/password |
| `SPOTIFY_CLIENT_ID` | No | Music metadata enrichment |
| `SPOTIFY_CLIENT_SECRET` | No | Required with Spotify client ID |
| `GETSONGBPM_API_KEY` | No | BPM/key metadata API |

### Frontend (`web/.env.local` or Docker env)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL |
| `NEXT_PUBLIC_SITE_URL` | Yes (prod) | Frontend base URL for SEO |
| `NEXT_PUBLIC_AZURE_AD_TENANT_ID` | Yes | Azure AD tenant ID |
| `NEXT_PUBLIC_AZURE_AD_CLIENT_ID` | Yes | Azure AD client ID |
| `NEXT_PUBLIC_ORG_NAME` | No | Org display name (default: "Band App") |
| `NEXT_PUBLIC_ORG_DESCRIPTION` | No | Org description (default: "Band Management System") |
| `API_INTERNAL_URL` | No | Internal API URL for SSR (Kubernetes) |

### Database (`db/docker-compose.yml`)

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_USER` | `pucmm_band` | Database user |
| `POSTGRES_PASSWORD` | `pucmm_band_2024` | Database password |
| `POSTGRES_DB` | `pucmm_band` | Database name |
