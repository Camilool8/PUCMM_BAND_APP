/**
 * Runtime environment configuration
 *
 * In development: reads from process.env (Next.js injects NEXT_PUBLIC_* at build time)
 * In production (Docker): reads from window.__ENV__ (injected by entrypoint.sh)
 */

type EnvConfig = {
  NEXT_PUBLIC_API_URL: string;
  NEXT_PUBLIC_SITE_URL: string;
  NEXT_PUBLIC_AZURE_AD_CLIENT_ID: string;
  NEXT_PUBLIC_AZURE_AD_TENANT_ID: string;
  // Server-only env vars (not prefixed with NEXT_PUBLIC_)
  API_INTERNAL_URL?: string;
};

declare global {
  interface Window {
    __ENV__?: EnvConfig;
  }
}

function getEnvValue(key: keyof EnvConfig): string {
  // Server-side or build time: use process.env
  if (typeof window === "undefined") {
    return process.env[key] || "";
  }

  // Client-side: prefer window.__ENV__ (runtime), fallback to process.env (build time)
  if (window.__ENV__ && window.__ENV__[key]) {
    return window.__ENV__[key];
  }

  return process.env[key] || "";
}

export const env = {
  /** Public API URL - use for client-side fetches and public URLs */
  get apiUrl(): string {
    return getEnvValue("NEXT_PUBLIC_API_URL") || "https://pucmm-band-api.cjoga.cloud";
  },
  /** Internal API URL - use for server-side fetches (SSR/generateMetadata) */
  get apiUrlInternal(): string {
    // On server: prefer internal URL for Kubernetes, fallback to public URL
    if (typeof window === "undefined") {
      return process.env.API_INTERNAL_URL || this.apiUrl;
    }
    // On client: always use public URL
    return this.apiUrl;
  },
  get siteUrl(): string {
    return getEnvValue("NEXT_PUBLIC_SITE_URL") || "https://pucmm-band.cjoga.cloud";
  },
  get azureAdClientId(): string {
    return getEnvValue("NEXT_PUBLIC_AZURE_AD_CLIENT_ID");
  },
  get azureAdTenantId(): string {
    return getEnvValue("NEXT_PUBLIC_AZURE_AD_TENANT_ID");
  },
};
