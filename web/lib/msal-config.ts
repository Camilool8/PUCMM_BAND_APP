import type { Configuration } from "@azure/msal-browser";

// Use tenant ID if provided, otherwise use "organizations" for multi-tenant
const authority = process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID
  ? `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID}`
  : "https://login.microsoftonline.com/organizations";

// Function to get config - only called on client side
export function getMsalConfig(): Configuration {
  return {
    auth: {
      clientId: process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID || "",
      authority,
      redirectUri: window.location.origin,
      postLogoutRedirectUri: window.location.origin,
    },
    cache: {
      cacheLocation: "sessionStorage",
    },
    system: {
      loggerOptions: {
        loggerCallback: (level, message, containsPii) => {
          if (containsPii) return;
          // Only log errors and warnings in production
          if (process.env.NODE_ENV === "production") {
            if (level === 1) console.error(message); // LogLevel.Error = 1
            return;
          }
          switch (level) {
            case 1: // LogLevel.Error
              console.error(message);
              break;
            case 2: // LogLevel.Warning
              console.warn(message);
              break;
          }
        },
        logLevel: 2, // LogLevel.Warning
      },
    },
  };
}

export const loginRequest = {
  scopes: ["User.Read", "openid", "profile", "email"],
};

export const apiRequest = {
  scopes: [`api://${process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID}/access_as_user`],
};
