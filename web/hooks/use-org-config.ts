"use client";

import { createContext, useContext } from "react";

export interface OrgConfig {
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  logoInitial: string | null;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  allowedEmailDomains: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  locale: string;
  authProviders: {
    provider: string;
    displayName: string | null;
    isPrimary: boolean;
    tenantId?: string;
    clientId?: string;
  }[];
}

export const OrgConfigContext = createContext<OrgConfig | null>(null);

export function useOrgConfig(): OrgConfig {
  const ctx = useContext(OrgConfigContext);
  if (!ctx) {
    throw new Error("useOrgConfig must be used inside OrgConfigProvider");
  }
  return ctx;
}
