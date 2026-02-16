"use client";

import { ReactNode, useState, useEffect, useRef, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MsalProvider } from "@azure/msal-react";
import {
  PublicClientApplication,
  EventType,
  EventMessage,
  AuthenticationResult,
  IPublicClientApplication,
} from "@azure/msal-browser";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { getMsalConfig } from "@/lib/msal-config";
import { Toaster } from "sonner";
import { OrgConfigProvider } from "./OrgConfigProvider";
import { useOrgConfig } from "@/hooks/use-org-config";
import { MsalContext } from "@/hooks/use-msal-context";
import { MusicPlayerProvider } from "@/contexts/music-player-context";

const toasterEl = (
  <Toaster
    position="top-center"
    toastOptions={{
      style: {
        background: "#1a1f2e",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "#f1f5f9",
      },
    }}
    richColors
  />
);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <OrgConfigProvider>
      <InnerProviders>{children}</InnerProviders>
    </OrgConfigProvider>
  );
}

function InnerProviders({ children }: { children: ReactNode }) {
  const orgConfig = useOrgConfig();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  // Check if Azure AD is configured for this org
  const azureProvider = useMemo(
    () => orgConfig.authProviders.find((p) => p.provider === "azure_ad"),
    [orgConfig.authProviders]
  );

  // If Azure AD is configured, render with MSAL
  if (azureProvider) {
    return (
      <MsalWrapper azureProvider={azureProvider}>
        <QueryClientProvider client={queryClient}>
          <MusicPlayerProvider>
            {children}
          </MusicPlayerProvider>
          {toasterEl}
        </QueryClientProvider>
      </MsalWrapper>
    );
  }

  // No Azure AD — skip MSAL entirely, provide null MsalContext
  return (
    <MsalContext.Provider value={null}>
      <QueryClientProvider client={queryClient}>
        <MusicPlayerProvider>
          {children}
        </MusicPlayerProvider>
        {toasterEl}
      </QueryClientProvider>
    </MsalContext.Provider>
  );
}

// Initializes MSAL and wraps children in MsalProvider + MsalBridge
function MsalWrapper({
  children,
  azureProvider,
}: {
  children: ReactNode;
  azureProvider: { tenantId?: string; clientId?: string };
}) {
  const orgConfig = useOrgConfig();
  const [isInitialized, setIsInitialized] = useState(false);
  const msalInstanceRef = useRef<IPublicClientApplication | null>(null);

  useEffect(() => {
    const initializeMsal = async () => {
      try {
        const msalConfig = getMsalConfig({
          tenantId: azureProvider.tenantId,
          clientId: azureProvider.clientId,
        });

        const msalInstance = new PublicClientApplication(msalConfig);
        msalInstanceRef.current = msalInstance;

        await msalInstance.initialize();

        const response = await msalInstance.handleRedirectPromise();
        if (response) {
          console.log("Login successful:", response.account?.username);
        }

        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0 && !msalInstance.getActiveAccount()) {
          msalInstance.setActiveAccount(accounts[0]);
        }

        msalInstance.addEventCallback((event: EventMessage) => {
          if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
            const payload = event.payload as AuthenticationResult;
            msalInstance.setActiveAccount(payload.account);
          }
        });

        setIsInitialized(true);
      } catch (error) {
        console.error("MSAL initialization error:", error);
        setIsInitialized(true);
      }
    };

    initializeMsal();
  }, [azureProvider]);

  if (!isInitialized || !msalInstanceRef.current) {
    return (
      <div className="min-h-screen bg-surface-0 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-brand-blue-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl font-black text-brand-yellow">
              {orgConfig.logoInitial || orgConfig.name[0]}
            </span>
          </div>
          <p className="text-gray-400">Inicializando...</p>
        </div>
      </div>
    );
  }

  return (
    <MsalProvider instance={msalInstanceRef.current}>
      <MsalBridge>{children}</MsalBridge>
    </MsalProvider>
  );
}

// Bridge component: reads MSAL hooks (which require MsalProvider) and provides them via MsalContext
function MsalBridge({ children }: { children: ReactNode }) {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  return (
    <MsalContext.Provider
      value={{ instance, accounts, inProgress, isAuthenticated }}
    >
      {children}
    </MsalContext.Provider>
  );
}
