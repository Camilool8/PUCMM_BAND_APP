"use client";

import { createContext } from "react";
import type { IPublicClientApplication, AccountInfo } from "@azure/msal-browser";

export interface MsalContextValue {
  instance: IPublicClientApplication;
  accounts: AccountInfo[];
  inProgress: string;
  isAuthenticated: boolean;
}

// Context is null when Azure AD is not configured
export const MsalContext = createContext<MsalContextValue | null>(null);
