"use client";

import { ReactNode, useState, useEffect, useRef } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MsalProvider } from "@azure/msal-react";
import {
  PublicClientApplication,
  EventType,
  EventMessage,
  AuthenticationResult,
  IPublicClientApplication,
} from "@azure/msal-browser";
import { getMsalConfig } from "@/lib/msal-config";
import { Toaster } from "sonner";

export function Providers({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const msalInstanceRef = useRef<IPublicClientApplication | null>(null);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  useEffect(() => {
    const initializeMsal = async () => {
      try {
        // Create MSAL instance only on client side
        const msalInstance = new PublicClientApplication(getMsalConfig());
        msalInstanceRef.current = msalInstance;

        // Initialize MSAL
        await msalInstance.initialize();

        // Handle redirect response (important for login flow)
        const response = await msalInstance.handleRedirectPromise();
        if (response) {
          console.log("Login successful:", response.account?.username);
        }

        // Set active account if one exists
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0 && !msalInstance.getActiveAccount()) {
          msalInstance.setActiveAccount(accounts[0]);
        }

        // Listen for login events
        msalInstance.addEventCallback((event: EventMessage) => {
          if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
            const payload = event.payload as AuthenticationResult;
            msalInstance.setActiveAccount(payload.account);
          }
        });

        setIsInitialized(true);
      } catch (error) {
        console.error("MSAL initialization error:", error);
        setIsInitialized(true); // Still render to show error state
      }
    };

    initializeMsal();
  }, []);

  // Show loading while MSAL initializes
  if (!isInitialized || !msalInstanceRef.current) {
    return (
      <div className="min-h-screen bg-surface-0 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-brand-blue-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl font-black text-brand-yellow">P</span>
          </div>
          <p className="text-gray-400">Inicializando...</p>
        </div>
      </div>
    );
  }

  return (
    <MsalProvider instance={msalInstanceRef.current}>
      <QueryClientProvider client={queryClient}>
        {children}
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
      </QueryClientProvider>
    </MsalProvider>
  );
}
