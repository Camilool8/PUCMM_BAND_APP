"use client";

import { useCallback, useEffect, useState, useContext } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { loginRequest } from "@/lib/msal-config";
import { api, DbUser, Role } from "@/lib/api";
import { env } from "@/lib/env";
import { authToken } from "@/lib/auth-token";
import { MsalContext } from "@/hooks/use-msal-context";

// SUPERADMIN is determined by the backend (from Organization config)
// The frontend checks role === "SUPERADMIN" instead of matching email

export interface User {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatarUrl: string | null;
  role: Role;
  displayRole: string;
  isSuperAdmin: boolean;
}

// Role display names in Spanish
const ROLE_DISPLAY_NAMES: Record<Role, string> = {
  SUPERADMIN: "Administrador",
  MEMBER: "Miembro",
  STUDENT_GUEST: "Estudiante/Invitado",
};

export function useAuth() {
  const queryClient = useQueryClient();
  const msalContext = useContext(MsalContext);

  // App token state (for Google/email-password auth)
  const [appToken, setAppToken] = useState<string | null>(() => authToken.get());

  // Dev mode view role (stored in localStorage)
  const [devViewRole, setDevViewRole] = useState<Role | null>(null);

  // Initialize dev mode state from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("devViewRole");
      if (stored && ["SUPERADMIN", "MEMBER", "STUDENT_GUEST"].includes(stored)) {
        setDevViewRole(stored as Role);
      }
    }
  }, []);

  // Set dev view role
  const setDevRole = useCallback((role: Role | null) => {
    setDevViewRole(role);
    if (role === null) {
      localStorage.removeItem("devViewRole");
    } else {
      localStorage.setItem("devViewRole", role);
    }
  }, []);

  // MSAL state (may not be available if Azure AD is not configured)
  const msalInstance = msalContext?.instance ?? null;
  const msalAccounts = msalContext?.accounts ?? [];
  const msalInProgress = msalContext?.inProgress ?? "none";
  const msalAccount = msalAccounts[0] ?? null;
  const isAzureAuthenticated = msalContext?.isAuthenticated ?? false;

  // Combined authentication state
  const isAuthenticated = isAzureAuthenticated || !!appToken;

  // Acquire token — works for both Azure AD and app JWT
  const acquireToken = useCallback(async () => {
    // If we have an app token (Google/email-password), use it directly
    if (appToken) {
      api.setAccessToken(appToken);
      return appToken;
    }

    // Otherwise, try Azure AD
    if (!msalInstance || !msalAccount) return null;

    try {
      const response = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account: msalAccount,
      });
      const token = response.idToken || response.accessToken;
      api.setAccessToken(token);
      return token;
    } catch (error) {
      console.error("Token acquisition failed:", error);
      await msalInstance.acquireTokenRedirect(loginRequest);
      return null;
    }
  }, [msalInstance, msalAccount, appToken]);

  // Fetch user data from backend
  const { data: dbUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ["user", "me"],
    queryFn: async () => {
      await acquireToken();
      return api.getMe();
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Build user object from DB user data
  const user: User | null = dbUser
    ? {
        id: dbUser.id,
        name: dbUser.name || msalAccount?.name || msalAccount?.username?.split("@")[0] || "Usuario",
        email: dbUser.email,
        initials: getInitials(dbUser.name || msalAccount?.name || msalAccount?.username || "U"),
        avatarUrl: dbUser.avatarUrl || null,
        role: dbUser.role,
        displayRole: ROLE_DISPLAY_NAMES[dbUser.role],
        isSuperAdmin: dbUser.role === "SUPERADMIN",
      }
    : null;

  // Effective role for UI (respects dev mode toggle)
  const effectiveRole: Role | null = user
    ? devViewRole && user.isSuperAdmin
      ? devViewRole
      : user.role
    : null;

  const isAdmin = effectiveRole === "SUPERADMIN";
  const canManageUsers = effectiveRole === "SUPERADMIN";
  const canManageSongs = effectiveRole === "SUPERADMIN";
  const canEditSongs = effectiveRole === "SUPERADMIN" || effectiveRole === "MEMBER";
  const canManageEvents = effectiveRole === "SUPERADMIN";
  const canSuggestSongs = effectiveRole === "SUPERADMIN" || effectiveRole === "MEMBER";
  const canVote = effectiveRole === "SUPERADMIN" || effectiveRole === "MEMBER";
  const canEditProfile = effectiveRole === "SUPERADMIN" || effectiveRole === "MEMBER";
  const canUploadMedia = effectiveRole === "SUPERADMIN" || effectiveRole === "MEMBER";
  const canDeleteAssets = effectiveRole === "SUPERADMIN";
  const canManageRehearsals = effectiveRole === "SUPERADMIN";
  const canCheckIn = effectiveRole === "SUPERADMIN" || effectiveRole === "MEMBER";

  const showDevToggle =
    process.env.NODE_ENV === "development" &&
    user?.role === "SUPERADMIN";

  // Login by provider type
  const login = useCallback(async (provider?: string) => {
    switch (provider) {
      case "google": {
        const apiUrl = env.apiUrl || "http://localhost:3001";
        window.location.href = `${apiUrl}/auth/google`;
        return;
      }
      case "email_password":
        // Handled by the EmailPasswordForm component directly
        return;
      case "azure_ad":
      default:
        if (msalInstance) {
          try {
            await msalInstance.loginRedirect(loginRequest);
          } catch (error) {
            console.error("Login failed:", error);
          }
        }
        return;
    }
  }, [msalInstance]);

  // Login with email/password
  const loginWithPassword = useCallback(async (email: string, password: string) => {
    const response = await api.login(email, password);
    authToken.set(response.accessToken, "email_password");
    setAppToken(response.accessToken);
    api.setAccessToken(response.accessToken);
    return response;
  }, []);

  // Register with email/password
  const registerWithPassword = useCallback(async (email: string, password: string, name?: string) => {
    const response = await api.register(email, password, name);
    authToken.set(response.accessToken, "email_password");
    setAppToken(response.accessToken);
    api.setAccessToken(response.accessToken);
    return response;
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      api.setAccessToken(null);
      authToken.clear();
      setAppToken(null);
      queryClient.clear();

      if (isAzureAuthenticated && msalInstance) {
        await msalInstance.logoutRedirect({
          postLogoutRedirectUri: window.location.origin,
        });
      } else {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [msalInstance, queryClient, isAzureAuthenticated]);

  // Acquire token on mount when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      acquireToken();
    }
  }, [isAuthenticated, acquireToken]);

  // Determine loading state
  const isLoading = msalContext
    ? msalInProgress !== "none" || isLoadingUser
    : isLoadingUser;

  return {
    user,
    dbUser,
    effectiveRole,
    isAuthenticated,
    isLoading,
    isAdmin,
    canManageUsers,
    canManageSongs,
    canEditSongs,
    canManageEvents,
    canSuggestSongs,
    canVote,
    canEditProfile,
    canUploadMedia,
    canDeleteAssets,
    canManageRehearsals,
    canCheckIn,
    // Dev mode
    showDevToggle,
    devViewRole,
    setDevRole,
    // Actions
    login,
    loginWithPassword,
    registerWithPassword,
    logout,
    acquireToken,
  };
}

// Helper functions
function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
