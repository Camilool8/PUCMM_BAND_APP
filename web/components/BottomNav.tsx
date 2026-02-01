"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Music, LogOut, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import AdminUsersModal from "./AdminUsersModal";

export default function BottomNav() {
  const pathname = usePathname();
  const { logout, canManageUsers } = useAuth();
  const [showUsersModal, setShowUsersModal] = useState(false);

  const NAV_ITEMS = [
    { href: "/", icon: Home, label: "Inicio" },
    { href: "/songs", icon: Music, label: "Repertorio" },
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

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex flex-col items-center justify-center flex-1 h-full transition-smooth touch-active text-gray-400"
          >
            <div className="p-2 rounded-xl">
              <LogOut size={22} className="stroke-[1.5]" />
            </div>
            <span className="text-[10px] font-medium mt-0.5">Salir</span>
          </button>
        </div>
      </nav>

      {/* Admin Users Modal */}
      <AdminUsersModal isOpen={showUsersModal} onClose={() => setShowUsersModal(false)} />
    </>
  );
}
