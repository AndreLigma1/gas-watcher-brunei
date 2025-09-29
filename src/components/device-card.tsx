import { Card } from "@/components/ui/card";
import { Device } from "@/types/device";
import { formatDistanceToNow } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { Calendar } from "lucide-react";
import { cn, GLOBAL_TIMEZONE } from "@/lib/utils";
import { TankLevel } from "@/components/tank-level";

import { CheckCircle2 } from "lucide-react";

interface DeviceCardProps {
  device: Device;
  onClick?: () => void;
  alerted?: boolean;
  onResolveAlert?: () => void;
}

export function DeviceCard({ device, onClick, alerted, onResolveAlert }: DeviceCardProps) {
  const { id, measurement, tank_level_cm, timestamp, location, tank_type } = device;
  const isClickable = !!onClick;

  return (
    <div className={cn("relative", alerted && "bg-red-100 border-2 border-red-500 rounded-lg")}> 
      <Card
        className={cn(
          "p-4 transition-all duration-200 hover:shadow-md",
          isClickable && "cursor-pointer hover:shadow-lg hover:scale-[1.02]"
        )}
        onClick={onClick}
      >
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-card-foreground">Device {id}</h3>
              <p className="text-sm text-muted-foreground">Tank: {measurement}% &bull; {tank_level_cm} cm</p>
              {location && <p className="text-xs text-muted-foreground">Location: {location}</p>}
              {tank_type && <p className="text-xs text-muted-foreground">Tank Type: {tank_type}</p>}
            </div>
            <TankLevel level={measurement} size="sm" />
          </div>

          {/* Metrics */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span title={formatInTimeZone(new Date(timestamp), GLOBAL_TIMEZONE, 'PPpp')}>
              {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
            </span>
          </div>
        </div>
        {alerted && (
          <div style={{ pointerEvents: 'auto' }} className="absolute top-2 right-2 flex flex-col items-end z-20">
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-red-500 text-white text-xs font-semibold animate-pulse mb-1 shadow-lg">
              Alert!
            </span>
            {onResolveAlert && (
              <button
                className="flex items-center gap-1 px-2 py-1 rounded bg-green-600 text-white text-xs hover:bg-green-700 shadow-lg"
                onClick={e => { e.stopPropagation(); onResolveAlert(); }}
              >
                <CheckCircle2 className="w-4 h-4" /> Resolve
              </button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}