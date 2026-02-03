"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Music, Calendar, LogOut, Users, Shield, Settings, Ticket, BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import AdminUsersModal from "./AdminUsersModal";
import UserProfileModal from "./UserProfileModal";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, canManageUsers, logout } = useAuth();
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    <>
      <aside data-tour="sidebar" className="fixed left-0 top-0 h-full w-64 bg-black/40 border-r border-white/5 flex-col z-40 hidden md:flex">
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
            data-tour="nav-home"
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
            data-tour="nav-songs"
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition-colors ${
              pathname === "/songs"
                ? "bg-brand-blue-primary text-white shadow-lg shadow-blue-900/50"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Music size={20} />
            Repertorio
          </Link>
          <Link
            href="/events"
            data-tour="nav-events"
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition-colors ${
              pathname === "/events"
                ? "bg-brand-blue-primary text-white shadow-lg shadow-blue-900/50"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Calendar size={20} />
            Eventos
          </Link>
          <Link
            href="/concerts"
            data-tour="nav-concerts"
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition-colors ${
              pathname === "/concerts"
                ? "bg-brand-blue-primary text-white shadow-lg shadow-blue-900/50"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Ticket size={20} />
            Conciertos
          </Link>
          <Link
            href="/guides"
            data-tour="nav-guides"
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition-colors ${
              pathname === "/guides"
                ? "bg-brand-blue-primary text-white shadow-lg shadow-blue-900/50"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <BookOpen size={20} />
            Guias
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
                data-tour="nav-users"
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Users size={20} />
                Gestionar Usuarios
              </button>
            </div>
          )}
        </nav>

        {/* User Section */}
        {user && (
          <div data-tour="user-menu" className="p-4 border-t border-white/5 bg-linear-to-t from-brand-blue-primary/20 to-transparent">
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-white/5 transition group"
            >
              {/* Avatar */}
              <div className="relative w-9 h-9 rounded-full overflow-hidden bg-brand-yellow text-brand-blue-primary flex items-center justify-center font-bold text-sm shrink-0">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user.initials
                )}
                {/* Edit indicator on hover */}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Settings size={14} className="text-white" />
                </div>
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-400 truncate flex items-center gap-1">
                  {user.isSuperAdmin && <Shield size={10} className="text-purple-400" />}
                  {user.displayRole}
                </p>
              </div>
            </button>
            {/* Logout button */}
            <button
              onClick={logout}
              className="flex items-center gap-2 w-full mt-2 px-4 py-2 text-xs text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <LogOut size={14} />
              Cerrar sesión
            </button>
          </div>
        )}
      </aside>

      {/* Modals */}
      <AdminUsersModal isOpen={showUsersModal} onClose={() => setShowUsersModal(false)} />
      <UserProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </>
  );
}
