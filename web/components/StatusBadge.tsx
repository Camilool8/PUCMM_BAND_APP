import { CheckCircle, Clock, AlertCircle } from "lucide-react";

type SongStatus = "READY" | "REHEARSING" | "PENDING" | "ARCHIVED";

interface StatusBadgeProps {
  status: SongStatus;
}

const statusConfig: Record<SongStatus, { color: string; icon: typeof CheckCircle; label: string }> = {
  READY: { color: "text-green-400 bg-green-400/10", icon: CheckCircle, label: "Montada" },
  REHEARSING: { color: "text-yellow-400 bg-yellow-400/10", icon: Clock, label: "Ensayando" },
  PENDING: { color: "text-red-400 bg-red-400/10", icon: AlertCircle, label: "Pendiente" },
  ARCHIVED: { color: "text-gray-400 bg-gray-400/10", icon: AlertCircle, label: "Archivada" },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color} border border-white/5`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
}
