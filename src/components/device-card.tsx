import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { TankDevice } from "@/types/device";
import { formatDistanceToNow } from "date-fns";
import { Gauge, MapPin, Thermometer, Battery, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeviceCardProps {
  device: TankDevice;
  onClick?: () => void;
}

export function DeviceCard({ device, onClick }: DeviceCardProps) {
  const {
    tankId,
    label,
    gasType,
    location,
    status,
    lastReadingAt,
    attributes
  } = device;

  const isClickable = !!onClick;

  return (
    <Card 
      className={cn(
        "p-4 transition-all duration-200 hover:shadow-md",
        isClickable && "cursor-pointer hover:shadow-lg hover:scale-[1.02]",
        status === "critical" && "ring-1 ring-status-critical/20",
        status === "warning" && "ring-1 ring-status-warning/20"
      )}
      onClick={onClick}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-card-foreground">{label}</h3>
            <p className="text-sm text-muted-foreground">{tankId}</p>
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Gas Type & Location */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <div className={cn(
              "h-2 w-2 rounded-full",
              gasType === "LPG" && "bg-blue-500",
              gasType === "CO2" && "bg-green-500",
              gasType === "CH4" && "bg-orange-500",
              gasType === "O2" && "bg-purple-500",
              gasType === "Other" && "bg-gray-500"
            )} />
            <span className="font-medium">{gasType}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{location}</span>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {attributes.fillPercent !== undefined && (
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-muted-foreground" />
              <span>Fill: {attributes.fillPercent}%</span>
            </div>
          )}
          {attributes.temperatureC !== undefined && (
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-muted-foreground" />
              <span>{attributes.temperatureC}°C</span>
            </div>
          )}
          {attributes.batteryPercent !== undefined && (
            <div className="flex items-center gap-2">
              <Battery className="h-4 w-4 text-muted-foreground" />
              <span>{attributes.batteryPercent}%</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatDistanceToNow(new Date(lastReadingAt), { addSuffix: true })}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}