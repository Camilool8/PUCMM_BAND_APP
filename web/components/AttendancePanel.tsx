"use client";

import { useState, useCallback } from "react";
import {
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Loader2,
  Shield,
  UserCheck,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCheckIn, useAdminMarkAttendance, useRemoveAttendance } from "@/hooks/use-rehearsals";
import { useMembers } from "@/hooks/use-users";
import type { Rehearsal, RehearsalAttendance } from "@/lib/api";

interface AttendancePanelProps {
  rehearsal: Rehearsal;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  PRESENT: { label: "Presente", color: "emerald", icon: CheckCircle2 },
  ABSENT: { label: "Ausente", color: "red", icon: XCircle },
  LATE: { label: "Tarde", color: "amber", icon: Clock },
  EXCUSED: { label: "Excusado", color: "blue", icon: AlertTriangle },
};

export default function AttendancePanel({ rehearsal }: AttendancePanelProps) {
  const { user, canManageUsers } = useAuth();
  const checkIn = useCheckIn();
  const adminMark = useAdminMarkAttendance();
  const removeAttendance = useRemoveAttendance();
  const { data: allUsers } = useMembers();

  const [geoError, setGeoError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [adminDropdownUserId, setAdminDropdownUserId] = useState<string | null>(null);

  const attendances = rehearsal.attendances || [];
  const myAttendance = attendances.find((a) => a.userId === user?.id);

  const handleCheckIn = useCallback(async () => {
    setGeoError(null);
    setIsGettingLocation(true);

    if (!navigator.geolocation) {
      setGeoError("Tu navegador no soporta geolocalización. Intenta abrir esta página en Chrome o Safari.");
      setIsGettingLocation(false);
      return;
    }

    // Check permission state first (if Permissions API is available)
    if (navigator.permissions) {
      try {
        const permStatus = await navigator.permissions.query({ name: "geolocation" });
        if (permStatus.state === "denied") {
          setGeoError(
            "El acceso a tu ubicación está bloqueado. " +
            "Ve a los ajustes de tu navegador → Permisos del sitio → Ubicación, y permite el acceso. " +
            "Luego recarga la página."
          );
          setIsGettingLocation(false);
          return;
        }
      } catch {
        // Permissions API not supported for geolocation in this browser, continue normally
      }
    }

    const submitPosition = async (position: GeolocationPosition) => {
      try {
        await checkIn.mutateAsync({
          rehearsalId: rehearsal.id,
          data: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
        setGeoError(null);
      } catch (err: any) {
        if (err?.message?.includes("403")) {
          setGeoError("Estás fuera del rango permitido para registrar asistencia.");
        } else {
          setGeoError("Error al registrar asistencia. Intenta de nuevo.");
        }
      }
    };

    // Manual safety timeout in case the browser never calls either callback
    let resolved = false;
    const safetyTimer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        setIsGettingLocation(false);
        setGeoError(
          "No se pudo obtener tu ubicación a tiempo. Asegúrate de que: " +
          "1) La ubicación/GPS esté activada en tu dispositivo, " +
          "2) Hayas dado permiso de ubicación a este sitio. " +
          "Luego intenta de nuevo."
        );
      }
    }, 20000);

    // Phase 1: Try with high accuracy (GPS hardware)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(safetyTimer);
        setIsGettingLocation(false);
        await submitPosition(position);
      },
      (err) => {
        if (resolved) return;

        // PERMISSION_DENIED → no point retrying
        if (err.code === err.PERMISSION_DENIED) {
          resolved = true;
          clearTimeout(safetyTimer);
          setIsGettingLocation(false);
          setGeoError(
            "Debes permitir el acceso a tu ubicación. " +
            "Si ya lo permitiste y sigue sin funcionar: " +
            "1) Cierra y vuelve a abrir el navegador, " +
            "2) Ve a Ajustes → Privacidad → Ubicación y verifica que esté activada."
          );
          return;
        }

        // Phase 2: Fallback — try without high accuracy (network-based, faster)
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            if (resolved) return;
            resolved = true;
            clearTimeout(safetyTimer);
            setIsGettingLocation(false);
            await submitPosition(position);
          },
          (fallbackErr) => {
            if (resolved) return;
            resolved = true;
            clearTimeout(safetyTimer);
            setIsGettingLocation(false);
            switch (fallbackErr.code) {
              case fallbackErr.POSITION_UNAVAILABLE:
                setGeoError(
                  "No se pudo obtener tu ubicación. Asegúrate de que el GPS/ubicación " +
                  "esté activado en los ajustes de tu dispositivo."
                );
                break;
              case fallbackErr.TIMEOUT:
                setGeoError(
                  "Tiempo de espera agotado. Verifica que el GPS esté activado e intenta de nuevo."
                );
                break;
              default:
                setGeoError("Error al obtener ubicación. Intenta de nuevo.");
            }
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }, [checkIn, rehearsal.id]);

  const handleAdminMark = async (userId: string, status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED") => {
    await adminMark.mutateAsync({
      rehearsalId: rehearsal.id,
      data: { userId, status },
    });
    setAdminDropdownUserId(null);
  };

  const handleRemoveAttendance = async (userId: string) => {
    await removeAttendance.mutateAsync({ rehearsalId: rehearsal.id, userId });
    setAdminDropdownUserId(null);
  };

  const attendedUserIds = new Set(attendances.map((a) => a.userId));
  const unregisteredUsers = allUsers?.filter((u) => !attendedUserIds.has(u.id)) || [];

  return (
    <div className="bg-surface-100/30 p-4 md:p-6 rounded-2xl border border-surface-200/30">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h3 className="flex items-center gap-2 text-white font-semibold text-base sm:text-lg">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Users size={14} className="text-emerald-400 sm:w-4 sm:h-4" />
          </div>
          Asistencia
          {attendances.length > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white/10 text-white font-medium">
              {attendances.length}
            </span>
          )}
        </h3>
      </div>

      {/* My Check-in Status */}
      {user && !canManageUsers && (
        <div className="mb-4">
          {myAttendance ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium">Asistencia registrada</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(myAttendance.checkedInAt).toLocaleTimeString("es-DO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {" • "}
                  {STATUS_CONFIG[myAttendance.status]?.label || myAttendance.status}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={handleCheckIn}
                disabled={isGettingLocation || checkIn.isPending}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGettingLocation || checkIn.isPending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {isGettingLocation ? "Obteniendo ubicación..." : "Registrando..."}
                  </>
                ) : (
                  <>
                    <MapPin size={18} />
                    Registrar Asistencia
                  </>
                )}
              </button>
              {geoError && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertTriangle size={16} className="text-red-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-red-400">{geoError}</p>
                    <button
                      onClick={handleCheckIn}
                      disabled={isGettingLocation || checkIn.isPending}
                      className="mt-2 text-xs text-red-300 underline underline-offset-2 hover:text-white transition-colors disabled:opacity-50"
                    >
                      Reintentar
                    </button>
                  </div>
                </div>
              )}
              <p className="text-[10px] text-gray-500 text-center">
                Debes estar cerca de {rehearsal.location?.name || "la ubicación"} para registrar asistencia.
                {" "}Usa Chrome o Safari para mejores resultados.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Admin Check-in Button */}
      {user && canManageUsers && !myAttendance && (
        <div className="mb-4">
          <button
            onClick={handleCheckIn}
            disabled={isGettingLocation || checkIn.isPending}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGettingLocation || checkIn.isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {isGettingLocation ? "Obteniendo ubicación..." : "Registrando..."}
              </>
            ) : (
              <>
                <MapPin size={18} />
                Registrar Mi Asistencia
              </>
            )}
          </button>
          {geoError && (
            <div className="flex items-start gap-2 p-3 mt-2 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertTriangle size={16} className="text-red-400 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-red-400">{geoError}</p>
                <button
                  onClick={handleCheckIn}
                  disabled={isGettingLocation || checkIn.isPending}
                  className="mt-2 text-xs text-red-300 underline underline-offset-2 hover:text-white transition-colors disabled:opacity-50"
                >
                  Reintentar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Attendance List */}
      {attendances.length > 0 && (
        <div className="space-y-1.5">
          {attendances.map((attendance) => {
            const statusCfg = STATUS_CONFIG[attendance.status] || STATUS_CONFIG.PRESENT;
            const StatusIcon = statusCfg.icon;
            const isDropdownOpen = adminDropdownUserId === attendance.userId;

            return (
              <div
                key={attendance.id}
                className="flex items-center gap-3 p-2.5 md:p-3 rounded-xl bg-surface-100/50 border border-surface-200/30 group"
              >
                {/* Avatar */}
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-surface-200 flex items-center justify-center shrink-0 overflow-hidden">
                  {attendance.user?.avatarUrl ? (
                    <img src={attendance.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <UserCheck size={14} className="text-gray-500" />
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white truncate">{attendance.user?.name || "Usuario"}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-${statusCfg.color}-500/20 text-${statusCfg.color}-400`}>
                      {statusCfg.label}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {new Date(attendance.checkedInAt).toLocaleTimeString("es-DO", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {attendance.markedBy && (
                      <span className="text-[10px] text-gray-600 flex items-center gap-0.5">
                        <Shield size={8} /> Admin
                      </span>
                    )}
                  </div>
                </div>

                {/* Admin Actions */}
                {canManageUsers && (
                  <div className="relative">
                    <button
                      onClick={() => setAdminDropdownUserId(isDropdownOpen ? null : attendance.userId)}
                      className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                    >
                      <ChevronDown size={14} />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute right-0 top-full mt-1 z-10 bg-surface-100 border border-surface-200 rounded-xl shadow-xl p-1.5 min-w-[140px] animate-fade-in">
                        {(["PRESENT", "LATE", "EXCUSED", "ABSENT"] as const).map((status) => {
                          const cfg = STATUS_CONFIG[status];
                          return (
                            <button
                              key={status}
                              onClick={() => handleAdminMark(attendance.userId, status)}
                              disabled={adminMark.isPending}
                              className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors hover:bg-white/5 ${
                                attendance.status === status ? "text-white font-medium" : "text-gray-400"
                              }`}
                            >
                              {cfg.label}
                            </button>
                          );
                        })}
                        <div className="border-t border-white/5 mt-1 pt-1">
                          <button
                            onClick={() => handleRemoveAttendance(attendance.userId)}
                            disabled={removeAttendance.isPending}
                            className="w-full text-left px-3 py-1.5 text-xs rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Admin: Mark Unregistered Users */}
      {canManageUsers && unregisteredUsers.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide font-medium">
            Sin registrar ({unregisteredUsers.length})
          </p>
          <div className="space-y-1">
            {unregisteredUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-3 p-2 md:p-2.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-surface-200 flex items-center justify-center shrink-0 overflow-hidden">
                  {u.avatarUrl ? (
                    <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-gray-500 font-medium">
                      {(u.name || u.email).slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 flex-1 min-w-0 truncate">
                  {u.name || u.email}
                </p>
                <div className="flex items-center gap-1">
                  {(["PRESENT", "LATE", "ABSENT"] as const).map((status) => {
                    const cfg = STATUS_CONFIG[status];
                    const Ic = cfg.icon;
                    return (
                      <button
                        key={status}
                        onClick={() => handleAdminMark(u.id, status)}
                        disabled={adminMark.isPending}
                        title={cfg.label}
                        className={`p-1.5 rounded-lg text-${cfg.color}-400/60 hover:text-${cfg.color}-400 hover:bg-${cfg.color}-500/10 transition-all disabled:opacity-50`}
                      >
                        <Ic size={14} />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {attendances.length === 0 && !canManageUsers && !myAttendance && user && (
        <div className="text-center py-4">
          <p className="text-xs text-gray-500">Aún no se han registrado asistencias</p>
        </div>
      )}
    </div>
  );
}
