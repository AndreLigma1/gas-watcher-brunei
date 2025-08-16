import { cn } from "@/lib/utils";
import { DeviceStatus } from "@/types/device";

interface StatusBadgeProps {
  status: DeviceStatus;
  className?: string;
}

const statusConfig = {
  online: {
    label: "Online",
    className: "bg-status-online-bg text-status-online border-status-online/20"
  },
  warning: {
    label: "Warning",
    className: "bg-status-warning-bg text-status-warning border-status-warning/20"
  },
  critical: {
    label: "Critical",
    className: "bg-status-critical-bg text-status-critical border-status-critical/20"
  },
  offline: {
    label: "Offline",
    className: "bg-status-offline-bg text-status-offline border-status-offline/20"
  }
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-smooth",
        config.className,
        className
      )}
    >
      <span 
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "online" && "bg-status-online",
          status === "warning" && "bg-status-warning",
          status === "critical" && "bg-status-critical",
          status === "offline" && "bg-status-offline"
        )}
      />
      {config.label}
    </span>
  );
}