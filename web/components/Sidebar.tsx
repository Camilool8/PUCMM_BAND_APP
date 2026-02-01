"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Music, LogOut, Users, Shield } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import AdminUsersModal from "./AdminUsersModal";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, effectiveRole, canManageUsers, logout } = useAuth();
  const [showUsersModal, setShowUsersModal] = useState(false);

  return (
    <>
      <aside className="fixed left-0 top-0 h-full w-64 bg-black/40 border-r border-white/5 flex-col z-40 hidden md:flex">
        {/* Logo */}
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tighter flex items-center gap-2">
            <span className="w-8 h-8 bg-brand-blue-primary text-brand-yellow rounded-full flex items-center justify-center text-lg font-black">
              P
            </span>
            <span>
              Band<span className="text-brand-yellow">App</span>
            </span>
          </h1>
          <p className="text-xs text-gray-500 mt-1 ml-10">PUCMM Repertoire</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          <Link
            href="/"
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition-colors ${
              pathname === "/"
                ? "bg-brand-blue-primary text-white shadow-lg shadow-blue-900/50"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Home size={20} />
            Inicio
          </Link>
          <Link
            href="/songs"
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition-colors ${
              pathname === "/songs"
                ? "bg-brand-blue-primary text-white shadow-lg shadow-blue-900/50"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Music size={20} />
            Repertorio
          </Link>

          {/* Admin Section */}
          {canManageUsers && (
            <div className="pt-4">
              <h3 className="text-xs font-bold text-purple-400/60 uppercase tracking-wider mb-3 px-4 flex items-center gap-2">
                <Shield size={12} />
                Admin
              </h3>
              <button
                onClick={() => setShowUsersModal(true)}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Users size={20} />
                Gestionar Usuarios
              </button>
            </div>
          )}

          {/* Coming Soon Section */}
          <div className="pt-6">
            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3 px-4">
              Próximamente
            </h3>
            <div className="space-y-1 px-4">
              <p className="text-xs text-gray-600 flex items-center gap-2">
                <span>📅</span> Eventos
              </p>
              <p className="text-xs text-gray-600 flex items-center gap-2">
                <span>🎵</span> Géneros
              </p>
              <p className="text-xs text-gray-600 flex items-center gap-2">
                <span>🎤</span> Conciertos
              </p>
            </div>
          </div>
        </nav>

        {/* User Section */}
        {user && (
          <div className="p-4 border-t border-white/5 bg-linear-to-t from-brand-blue-primary/20 to-transparent">
            <div className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-white/5 transition">
              <div className="w-8 h-8 rounded-full bg-brand-yellow text-brand-blue-primary flex items-center justify-center font-bold text-sm">
                {user.initials}
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-400 truncate flex items-center gap-1">
                  {user.isSuperAdmin && <Shield size={10} className="text-purple-400" />}
                  {user.displayRole}
                </p>
              </div>
              <button
                onClick={logout}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title="Cerrar sesión"
              >
                <LogOut size={16} className="text-gray-500 hover:text-white" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Admin Users Modal */}
      <AdminUsersModal isOpen={showUsersModal} onClose={() => setShowUsersModal(false)} />
    </>
  );
}
