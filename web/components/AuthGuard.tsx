"use client";

import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Music, LogIn } from "lucide-react";

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading, login } = useAuth();

  // Show loading state while MSAL is initializing
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
    return (
      <div className="min-h-screen w-full flex-1 bg-surface-0 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-brand-blue-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-900/50">
              <span className="text-4xl font-black text-brand-yellow">P</span>
            </div>
            <h1 className="text-3xl font-bold">
              Band<span className="text-brand-yellow">App</span>
            </h1>
            <p className="text-gray-400 mt-2">PUCMM Repertoire System</p>
          </div>

          {/* Login Card */}
          <div className="bg-surface-50 rounded-2xl p-8 border border-white/5 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-2 text-center">
              Bienvenido
            </h2>
            <p className="text-gray-400 text-sm text-center mb-6">
              Inicia sesión con tu cuenta institucional PUCMM para acceder al
              sistema de gestión de repertorio.
            </p>

            <button
              onClick={login}
              className="w-full bg-brand-blue-primary hover:bg-brand-blue-hover text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-900/50"
            >
              <LogIn size={20} />
              Iniciar Sesión con Correo Estudiantil
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Solo usuarios con correo{" "}
              <span className="text-brand-yellow">@ce.pucmm.edu.do</span>
            </p>
          </div>

          {/* Footer */}
          <p className="text-center text-gray-600 text-xs mt-8">
            Sistema de Gestión de Repertorio Musical
            <br />
            Banda Universitaria PUCMM
          </p>
        </div>
      </div>
    );
  }

  // User is authenticated - render children
  return <>{children}</>;
}
