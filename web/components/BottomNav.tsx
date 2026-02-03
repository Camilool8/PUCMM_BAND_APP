"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Music, Calendar, Users, User, Ticket } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import AdminUsersModal from "./AdminUsersModal";
import UserProfileModal from "./UserProfileModal";

export default function BottomNav() {
  const pathname = usePathname();
  const { user, canManageUsers } = useAuth();
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const NAV_ITEMS = [
    { href: "/", icon: Home, label: "Inicio" },
    { href: "/songs", icon: Music, label: "Repertorio" },
    { href: "/events", icon: Calendar, label: "Eventos" },
    { href: "/concerts", icon: Ticket, label: "Conciertos" },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-strong border-t border-white/5 pb-safe">
        <div className="flex items-center justify-around h-16">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
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

          {/* Admin Users Button - Only for admins */}
          {canManageUsers && (
            <button
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
      </nav>

      {/* Modals */}
      <AdminUsersModal isOpen={showUsersModal} onClose={() => setShowUsersModal(false)} />
      <UserProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </>
  );
}
