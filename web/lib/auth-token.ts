const TOKEN_KEY = "band_app_token";
const PROVIDER_KEY = "band_app_auth_provider";

export const authToken = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  set(token: string, provider: string) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(PROVIDER_KEY, provider);
  },

  getProvider(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(PROVIDER_KEY);
  },

  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PROVIDER_KEY);
  },
};
