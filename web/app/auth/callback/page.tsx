"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authToken } from "@/lib/auth-token";
import { Music } from "lucide-react";

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    const provider = searchParams.get("provider") || "unknown";
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError(errorParam);
      return;
    }

    if (!token) {
      setError("No se recibió un token de autenticación.");
      return;
    }

    // Store token and redirect to home
    authToken.set(token, provider);
    router.replace("/");
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-surface-0 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Music size={32} className="text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">
            Error de Autenticación
          </h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.replace("/")}
            className="bg-brand-blue-primary hover:bg-brand-blue-hover text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-brand-blue-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Music size={32} className="text-brand-yellow" />
        </div>
        <p className="text-gray-400">Completando inicio de sesión...</p>
      </div>
    </div>
  );
}
