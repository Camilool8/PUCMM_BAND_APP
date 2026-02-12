"use client";

import { ReactNode, useState, useEffect } from "react";
import { OrgConfig, OrgConfigContext } from "@/hooks/use-org-config";
import { env } from "@/lib/env";

function applyBrandColors(colors: OrgConfig["colors"]) {
  const root = document.documentElement;
  root.style.setProperty("--color-brand-primary", colors.primary);
  root.style.setProperty("--color-brand-secondary", colors.secondary);
  root.style.setProperty("--color-brand-accent", colors.accent);

  // Compute hover variant (darker shade)
  root.style.setProperty(
    "--color-brand-primary-hover",
    `color-mix(in srgb, ${colors.primary} 70%, black)`
  );
}

export function OrgConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<OrgConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiUrl = env.apiUrl || "http://localhost:3001";

    fetch(`${apiUrl}/organizations/config`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: OrgConfig) => {
        setConfig(data);
        applyBrandColors(data.colors);
      })
      .catch((err) => {
        console.error("Failed to fetch org config:", err);
        setError(err.message);
        // Provide fallback config so the app can still render
        const fallback: OrgConfig = {
          name: "Band App",
          slug: "band-app",
          description: null,
          logoUrl: null,
          logoInitial: "B",
          colors: {
            primary: "#0033A0",
            secondary: "#FFD200",
            accent: "#D22630",
          },
          allowedEmailDomains: [],
          metaTitle: "Band App",
          metaDescription: null,
          locale: "es",
          authProviders: [],
        };
        setConfig(fallback);
      });
  }, []);

  if (!config) {
    return (
      <div className="min-h-screen bg-surface-0 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-brand-blue-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl font-black text-brand-yellow">
              &#9835;
            </span>
          </div>
          <p className="text-gray-400">Inicializando...</p>
          {error && (
            <p className="text-red-400 text-xs mt-2">Error: {error}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <OrgConfigContext.Provider value={config}>
      {children}
    </OrgConfigContext.Provider>
  );
}
