import type { Configuration } from "@azure/msal-browser";
import { env } from "./env";

// Function to get config - only called on client side
export function getMsalConfig(): Configuration {
  const tenantId = env.azureAdTenantId;
  const authority = tenantId
    ? `https://login.microsoftonline.com/${tenantId}`
    : "https://login.microsoftonline.com/organizations";

  return {
    auth: {
      clientId: env.azureAdClientId || "",
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

// Function to get API request scopes - called at runtime to support Docker config
export function getApiRequest() {
  return {
    scopes: [`api://${env.azureAdClientId}/access_as_user`],
  };
}
