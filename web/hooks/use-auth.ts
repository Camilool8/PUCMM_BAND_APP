"use client";

import { useCallback, useEffect, useState } from "react";
import { useMsal, useIsAuthenticated, useAccount } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { loginRequest } from "@/lib/msal-config";
import { api, DbUser, Role } from "@/lib/api";

// Hardcoded SUPERADMIN email (same as backend)
const SUPERADMIN_EMAIL = "jcjg0001@ce.pucmm.edu.do";

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
  SUPERADMIN: "Super Admin",
  SECTION_LEADER: "Jefe de Cuerda",
  MEMBER: "Miembro",
  ALUMNI_GUEST: "Egresado/Invitado",
};

export function useAuth() {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const account = useAccount(accounts[0] || null);
  const queryClient = useQueryClient();

  // Dev mode view role (stored in localStorage)
  // null means use real role, otherwise simulates that role
  const [devViewRole, setDevViewRole] = useState<Role | null>(null);

  // Initialize dev mode state from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("devViewRole");
      if (stored && ["SUPERADMIN", "SECTION_LEADER", "MEMBER", "ALUMNI_GUEST"].includes(stored)) {
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

  // Acquire token silently and set it on the API client
  const acquireToken = useCallback(async () => {
    if (!account) return null;

    try {
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account,
      });
      const token = response.idToken || response.accessToken;
      api.setAccessToken(token);
      return token;
    } catch (error) {
      console.error("Token acquisition failed:", error);
      await instance.acquireTokenRedirect(loginRequest);
      return null;
    }
  }, [instance, account]);

  // Fetch user data from backend
  const { data: dbUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ["user", "me"],
    queryFn: async () => {
      // Ensure we have a token before fetching
      await acquireToken();
      return api.getMe();
    },
    enabled: isAuthenticated && !!account,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Build user object from DB user data
  const user: User | null = dbUser
    ? {
        id: dbUser.id,
        name: dbUser.name || account?.name || account?.username?.split("@")[0] || "Usuario",
        email: dbUser.email,
        initials: getInitials(dbUser.name || account?.name || account?.username || "U"),
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

  const isAdmin = effectiveRole === "SUPERADMIN" || effectiveRole === "SECTION_LEADER";
  const canManageUsers = effectiveRole === "SUPERADMIN";
  const canManageSongs = effectiveRole === "SUPERADMIN" || effectiveRole === "SECTION_LEADER";
  const canManageEvents = effectiveRole === "SUPERADMIN" || effectiveRole === "SECTION_LEADER";
  // Members can suggest, students (ALUMNI_GUEST) can only view
  const canSuggestSongs = effectiveRole === "SUPERADMIN" || effectiveRole === "SECTION_LEADER" || effectiveRole === "MEMBER";
  // Only band members (not ALUMNI_GUEST) can edit their profile
  const canEditProfile = effectiveRole === "SUPERADMIN" || effectiveRole === "SECTION_LEADER" || effectiveRole === "MEMBER";

  // Check if current user is the superadmin (for showing dev toggle)
  const showDevToggle =
    process.env.NODE_ENV === "development" &&
    account?.username?.toLowerCase() === SUPERADMIN_EMAIL;

  // Login with redirect
  const login = useCallback(async () => {
    try {
      await instance.loginRedirect(loginRequest);
    } catch (error) {
      console.error("Login failed:", error);
    }
  }, [instance]);

  // Logout
  const logout = useCallback(async () => {
    try {
      api.setAccessToken(null);
      queryClient.clear();
      await instance.logoutRedirect({
        postLogoutRedirectUri: window.location.origin,
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [instance, queryClient]);

  // Acquire token on mount when authenticated
  useEffect(() => {
    if (isAuthenticated && account) {
      acquireToken();
    }
  }, [isAuthenticated, account, acquireToken]);

  return {
    user,
    dbUser,
    effectiveRole,
    isAuthenticated,
    isLoading: inProgress !== InteractionStatus.None || isLoadingUser,
    isAdmin,
    canManageUsers,
    canManageSongs,
    canManageEvents,
    canSuggestSongs,
    canEditProfile,
    // Dev mode
    showDevToggle,
    devViewRole,
    setDevRole,
    // Actions
    login,
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
