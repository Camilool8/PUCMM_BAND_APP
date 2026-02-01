"use client";

import { useState, useRef, useEffect } from "react";
import { Bug, ChevronDown, Shield, Users, Music, Eye } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { Role } from "@/lib/api";

const ROLE_OPTIONS: { role: Role | null; label: string; description: string; icon: typeof Shield }[] = [
  { role: null, label: "Mi Rol Real", description: "Super Admin", icon: Shield },
  { role: "SUPERADMIN", label: "Admin", description: "Puede editar todo", icon: Shield },
  { role: "MEMBER", label: "Miembro", description: "Puede sugerir", icon: Music },
  { role: "ALUMNI_GUEST", label: "Estudiante", description: "Solo puede ver", icon: Eye },
];

export default function DevViewToggle() {
  const { showDevToggle, devViewRole, setDevRole, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!showDevToggle || !user?.isSuperAdmin) {
    return null;
  }

  const currentOption = ROLE_OPTIONS.find((opt) => opt.role === devViewRole) || ROLE_OPTIONS[0];
  const Icon = currentOption.icon;

  const getButtonColor = () => {
    if (devViewRole === null) return "bg-purple-500/20 border-purple-500/50 text-purple-400";
    if (devViewRole === "SUPERADMIN") return "bg-purple-500/20 border-purple-500/50 text-purple-400";
    if (devViewRole === "MEMBER") return "bg-blue-500/20 border-blue-500/50 text-blue-400";
    return "bg-amber-500/20 border-amber-500/50 text-amber-400";
  };

  return (
    <div ref={dropdownRef} className="fixed bottom-20 right-4 z-50">
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-48 bg-surface-50 border border-surface-100 rounded-xl shadow-xl overflow-hidden animate-fade-in">
          {ROLE_OPTIONS.map((option) => {
            const OptionIcon = option.icon;
            const isSelected = option.role === devViewRole;
            return (
              <button
                key={option.role ?? "real"}
                onClick={() => {
                  setDevRole(option.role);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                  ${isSelected ? "bg-brand-blue-primary/20 text-white" : "text-gray-300 hover:bg-surface-100"}
                `}
              >
                <OptionIcon size={16} className={isSelected ? "text-brand-yellow" : "text-gray-500"} />
                <div>
                  <p className="text-sm font-medium">{option.label}</p>
                  <p className="text-xs text-gray-500">{option.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-full
          text-xs font-medium shadow-lg border transition-all
          ${getButtonColor()}
          hover:scale-105 active:scale-95
        `}
      >
        <Bug size={14} />
        <Icon size={14} />
        <span>{currentOption.label}</span>
        <ChevronDown size={12} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
    </div>
  );
}
