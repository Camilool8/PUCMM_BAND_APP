"use client";

import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useOrgConfig } from "@/hooks/use-org-config";
import { Music, LogIn } from "lucide-react";
import EmailPasswordForm from "@/components/EmailPasswordForm";

interface AuthGuardProps {
  children: ReactNode;
}

// Google "G" logo as inline SVG for brand compliance
function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.97 10.97 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading, login } = useAuth();
  const orgConfig = useOrgConfig();

  // Show loading state while auth is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex-1 bg-surface-0 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-brand-blue-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Music size={32} className="text-brand-yellow" />
          </div>
          <p className="text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    const hasAzure = orgConfig.authProviders.some(
      (p) => p.provider === "azure_ad"
    );
    const hasGoogle = orgConfig.authProviders.some(
      (p) => p.provider === "google"
    );
    const hasEmailPassword = orgConfig.authProviders.some(
      (p) => p.provider === "email_password"
    );
    const azureProvider = orgConfig.authProviders.find(
      (p) => p.provider === "azure_ad"
    );
    const googleProvider = orgConfig.authProviders.find(
      (p) => p.provider === "google"
    );

    return (
      <div className="min-h-screen w-full flex-1 bg-surface-0 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-brand-blue-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-900/50">
              {orgConfig.logoUrl ? (
                <img
                  src={orgConfig.logoUrl}
                  alt={orgConfig.name}
                  className="w-12 h-12 object-contain"
                />
              ) : (
                <span className="text-4xl font-black text-brand-yellow">
                  {orgConfig.logoInitial || orgConfig.name[0]}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold">
              Band<span className="text-brand-yellow">App</span>
            </h1>
            <p className="text-gray-400 mt-2">{orgConfig.name}</p>
          </div>

          {/* Login Card */}
          <div className="bg-surface-50 rounded-2xl p-8 border border-white/5 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-2 text-center">
              Bienvenido
            </h2>
            <p className="text-gray-400 text-sm text-center mb-6">
              Inicia sesión para acceder al sistema de gestión de repertorio.
            </p>

            <div className="space-y-3">
              {/* Azure AD button */}
              {hasAzure && (
                <button
                  onClick={() => login("azure_ad")}
                  className="w-full bg-brand-blue-primary hover:bg-brand-blue-hover text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-900/50"
                >
                  <LogIn size={20} />
                  {azureProvider?.displayName || "Cuenta Institucional"}
                </button>
              )}

              {/* Google button */}
              {hasGoogle && (
                <button
                  onClick={() => login("google")}
                  className="w-full bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  <GoogleIcon size={20} />
                  {googleProvider?.displayName || "Continuar con Google"}
                </button>
              )}

              {/* Divider before email/password form */}
              {hasEmailPassword && (hasAzure || hasGoogle) && (
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-xs text-gray-500">o</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>
              )}

              {/* Email/password form */}
              {hasEmailPassword && (
                <EmailPasswordForm
                  allowedEmailDomains={orgConfig.allowedEmailDomains}
                />
              )}

              {/* Fallback if no providers configured */}
              {!hasAzure && !hasGoogle && !hasEmailPassword && (
                <button
                  onClick={() => login()}
                  className="w-full bg-brand-blue-primary hover:bg-brand-blue-hover text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-900/50"
                >
                  <LogIn size={20} />
                  Iniciar Sesión
                </button>
              )}
            </div>

            {orgConfig.allowedEmailDomains.length > 0 && (
              <p className="text-xs text-gray-500 text-center mt-4">
                Solo usuarios con correo{" "}
                {orgConfig.allowedEmailDomains.map((domain, i) => (
                  <span key={domain}>
                    {i > 0 && " o "}
                    <span className="text-brand-yellow">@{domain}</span>
                  </span>
                ))}
              </p>
            )}
          </div>

          {/* Footer */}
          <p className="text-center text-gray-600 text-xs mt-8">
            Sistema de Gestión de Repertorio Musical
            <br />
            {orgConfig.name}
          </p>
        </div>
      </div>
    );
  }

  // User is authenticated - render children
  return <>{children}</>;
}
