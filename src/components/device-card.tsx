import { Card } from "@/components/ui/card";
import { Device } from "@/types/device";
import { formatDistanceToNow } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { TankLevel } from "@/components/tank-level";

interface DeviceCardProps {
  device: Device;
  onClick?: () => void;
}

export function DeviceCard({ device, onClick }: DeviceCardProps) {
  const { id, measurement, tank_level_cm, timestamp } = device;
  const isClickable = !!onClick;

  return (
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
          </div>
          <TankLevel level={measurement} size="sm" />
        </div>

        {/* Metrics */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span title={formatInTimeZone(new Date(timestamp), 'Asia/Brunei', 'PPpp')}>
            {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
          </span>
        </div>
      </div>
    </Card>
  );
}