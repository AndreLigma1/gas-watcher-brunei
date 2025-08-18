import { Card } from "@/components/ui/card";
import { Device } from "@/types/device";
import { formatDistanceToNow } from "date-fns";
import { Gauge, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeviceCardProps {
  device: Device;
  onClick?: () => void;
}

export function DeviceCard({ device, onClick }: DeviceCardProps) {
  const { id, measurement, tank_level, timestamp } = device;
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
            <p className="text-sm text-muted-foreground">Measurement: {measurement}</p>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-muted-foreground" />
            <span>Tank Level: {tank_level}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatDistanceToNow(new Date(timestamp), { addSuffix: true })}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}