"use client";

import { useState } from "react";
import { Users, Shield, ShieldCheck, User, GraduationCap, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useUsers, useUpdateUserRole } from "@/hooks/use-users";
import type { DbUser, Role } from "@/lib/api";

interface AdminUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ROLE_OPTIONS: { value: Role; label: string; icon: React.ReactNode; color: string }[] = [
  {
    value: "SECTION_LEADER",
    label: "Jefe de Cuerda",
    icon: <ShieldCheck size={14} />,
    color: "text-blue-400",
  },
  {
    value: "MEMBER",
    label: "Miembro",
    icon: <User size={14} />,
    color: "text-gray-400",
  },
  {
    value: "ALUMNI_GUEST",
    label: "Egresado",
    icon: <GraduationCap size={14} />,
    color: "text-amber-400",
  },
];

const ROLE_DISPLAY: Record<Role, { label: string; color: string; bgColor: string }> = {
  SUPERADMIN: { label: "Super Admin", color: "text-purple-400", bgColor: "bg-purple-500/20" },
  SECTION_LEADER: { label: "Jefe de Cuerda", color: "text-blue-400", bgColor: "bg-blue-500/20" },
  MEMBER: { label: "Miembro", color: "text-gray-400", bgColor: "bg-gray-500/20" },
  ALUMNI_GUEST: { label: "Egresado", color: "text-amber-400", bgColor: "bg-amber-500/20" },
};

export default function AdminUsersModal({ isOpen, onClose }: AdminUsersModalProps) {
  const { data: users, isLoading, error } = useUsers();
  const updateRole = useUpdateUserRole();
  const [editingUser, setEditingUser] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: Role) => {
    await updateRole.mutateAsync({ userId, role: newRole });
    setEditingUser(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Header
        icon={<Users size={24} />}
        subtitle={`${users?.length || 0} usuarios registrados`}
      >
        Gestionar Usuarios
      </Modal.Header>

      <Modal.Body>
        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-[72px] rounded-xl bg-surface-100/50 animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <X size={24} className="text-red-400" />
            </div>
            <p className="text-red-400 font-medium">Error al cargar usuarios</p>
            <p className="text-sm text-gray-500 mt-1">Intenta de nuevo mas tarde</p>
          </div>
        )}

        {/* User List */}
        {!isLoading && !error && users && (
          <div className="space-y-2">
            {users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                isEditing={editingUser === user.id}
                onEdit={() => setEditingUser(user.id)}
                onCancelEdit={() => setEditingUser(null)}
                onRoleChange={(role) => handleRoleChange(user.id, role)}
                isUpdating={updateRole.isPending}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && users?.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-100 flex items-center justify-center">
              <Users size={24} className="text-gray-500" />
            </div>
            <p className="text-gray-400">No hay usuarios registrados</p>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}

// ============================================================================
// User Row Component
// ============================================================================

interface UserRowProps {
  user: DbUser;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onRoleChange: (role: Role) => void;
  isUpdating: boolean;
}

function UserRow({
  user,
  isEditing,
  onEdit,
  onCancelEdit,
  onRoleChange,
  isUpdating,
}: UserRowProps) {
  const isSuperAdmin = user.role === "SUPERADMIN";
  const roleInfo = ROLE_DISPLAY[user.role];

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-100/30 border border-surface-200/30 hover:border-surface-200/60 transition-all duration-200">
      {/* Avatar */}
      <div className="w-11 h-11 rounded-full bg-linear-to-br from-brand-blue-primary to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg">
        {getInitials(user.name || user.email)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium truncate flex items-center gap-2">
          {user.name || "Sin nombre"}
          {isSuperAdmin && (
            <Shield size={14} className="text-purple-400 shrink-0" />
          )}
        </p>
        <p className="text-sm text-gray-500 truncate">{user.email}</p>
      </div>

      {/* Role Badge / Editor */}
      {isEditing && !isSuperAdmin ? (
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {ROLE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onRoleChange(option.value)}
              disabled={isUpdating}
              className={`
                flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
                border transition-all duration-200 disabled:opacity-50
                ${
                  user.role === option.value
                    ? "bg-brand-blue-primary border-brand-blue-primary text-white shadow-md"
                    : "bg-surface-100/80 border-surface-200 text-gray-400 hover:border-white/20 hover:text-white"
                }
              `}
            >
              {option.icon}
              <span className="hidden sm:inline">{option.label}</span>
            </button>
          ))}
          <button
            onClick={onCancelEdit}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          onClick={onEdit}
          disabled={isSuperAdmin}
          className={`
            flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
            transition-all duration-200
            ${roleInfo.bgColor} ${roleInfo.color}
            ${isSuperAdmin ? "cursor-not-allowed opacity-75" : "hover:opacity-80 hover:scale-105 active:scale-95"}
          `}
        >
          {roleInfo.label}
        </button>
      )}
    </div>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
