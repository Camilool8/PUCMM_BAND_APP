"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Music, Calendar, Users, User, BookOpen, MoreHorizontal, X, Ticket, Settings } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import AdminUsersModal from "./AdminUsersModal";
import UserProfileModal from "./UserProfileModal";

export default function BottomNav() {
  const pathname = usePathname();
  const { user, canManageUsers } = useAuth();
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Main navigation items - always visible
  const MAIN_NAV_ITEMS = [
    { href: "/", icon: Home, label: "Inicio", tour: "nav-home-mobile" },
    { href: "/songs", icon: Music, label: "Repertorio", tour: "nav-songs-mobile" },
    { href: "/events", icon: Calendar, label: "Eventos", tour: "nav-events-mobile" },
  ];

  // More menu items
  const MORE_NAV_ITEMS = [
    { href: "/concerts", icon: Ticket, label: "Conciertos", tour: "nav-concerts-mobile" },
    { href: "/guides", icon: BookOpen, label: "Guías", tour: "nav-guides-mobile" },
  ];

  const isMoreActive = MORE_NAV_ITEMS.some((item) => pathname === item.href);

  return (
    <>
      <nav data-tour="sidebar-mobile" className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-strong border-t border-white/5 pb-safe">
        <div className="flex items-center justify-around h-16">
          {/* Main Nav Items */}
          {MAIN_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                data-tour={item.tour}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-smooth touch-active ${
                  isActive ? "text-brand-yellow" : "text-gray-400"
                }`}
              >
                <div
                  className={`relative p-2 rounded-xl transition-smooth ${
                    isActive ? "bg-brand-yellow/10" : ""
                  }`}
                >
                  <Icon
                    size={22}
                    className={isActive ? "stroke-[2.5]" : "stroke-[1.5]"}
                  />
                  {isActive && (
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-yellow" />
                  )}
                </div>
                <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
              </Link>
            );
          })}

          {/* More Menu Button */}
          <button
            data-tour="nav-more"
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-smooth touch-active ${
              isMoreActive || showMoreMenu ? "text-brand-yellow" : "text-gray-400"
            }`}
          >
            <div
              className={`relative p-2 rounded-xl transition-smooth ${
                isMoreActive ? "bg-brand-yellow/10" : ""
              }`}
            >
              <MoreHorizontal
                size={22}
                className={isMoreActive ? "stroke-[2.5]" : "stroke-[1.5]"}
              />
              {isMoreActive && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-yellow" />
              )}
            </div>
            <span className="text-[10px] font-medium mt-0.5">Más</span>
          </button>

          {/* Admin Users Button - Only for admins */}
          {canManageUsers && (
            <button
              data-tour="nav-users-mobile"
              onClick={() => setShowUsersModal(true)}
              className="flex flex-col items-center justify-center flex-1 h-full transition-smooth touch-active text-purple-400"
            >
              <div className="p-2 rounded-xl">
                <Users size={22} className="stroke-[1.5]" />
              </div>
              <span className="text-[10px] font-medium mt-0.5">Usuarios</span>
            </button>
          )}

          {/* Profile Button with Avatar */}
          <button
            data-tour="user-menu-mobile"
            onClick={() => setShowProfileModal(true)}
            className="flex flex-col items-center justify-center flex-1 h-full transition-smooth touch-active text-gray-400"
          >
            <div className="p-1">
              {user?.avatarUrl ? (
                <div className="w-7 h-7 rounded-full overflow-hidden border border-white/20">
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-linear-to-br from-brand-yellow to-amber-500 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-brand-blue-primary">
                    {user?.initials || <User size={14} />}
                  </span>
                </div>
              )}
            </div>
            <span className="text-[10px] font-medium mt-0.5">Perfil</span>
          </button>
        </div>

        {/* More Menu Popup */}
        {showMoreMenu && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMoreMenu(false)}
            />
            {/* Menu */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-surface-100 border border-surface-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="p-2">
                {MORE_NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      data-tour={item.tour}
                      onClick={() => setShowMoreMenu(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive
                          ? "bg-brand-yellow/20 text-brand-yellow"
                          : "text-gray-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </nav>

      {/* Modals */}
      <AdminUsersModal isOpen={showUsersModal} onClose={() => setShowUsersModal(false)} />
      <UserProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </>
  );
}
