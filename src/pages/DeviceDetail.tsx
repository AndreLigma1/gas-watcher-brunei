import { useParams, useNavigate } from 'react-router-dom';
import { useDevice, useDeviceReadings } from '@/hooks/useDevices';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { DeviceChart } from '@/components/device-chart';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Gauge, Thermometer, Battery, Calendar, MapPin, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function DeviceDetail() {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  
  const { data: device, isLoading: deviceLoading, error: deviceError } = useDevice(deviceId!);
  const { data: readings, isLoading: readingsLoading } = useDeviceReadings(deviceId!);

  if (deviceLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-10 w-40" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (deviceError || !device) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Device Not Found</h2>
            <p className="text-muted-foreground">The device you're looking for doesn't exist.</p>
          </Card>
        </div>
      </div>
    );
  }

  const { attributes } = device;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{device.label}</h1>
                <p className="text-muted-foreground">{device.tankId}</p>
              </div>
            </div>
            <StatusBadge status={device.status} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Overview Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Device Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Device Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "h-3 w-3 rounded-full",
                  device.gasType === "LPG" && "bg-blue-500",
                  device.gasType === "CO2" && "bg-green-500",
                  device.gasType === "CH4" && "bg-orange-500",
                  device.gasType === "O2" && "bg-purple-500",
                  device.gasType === "Other" && "bg-gray-500"
                )} />
                <span className="font-medium">{device.gasType} Tank</span>
              </div>
              
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{device.location}</span>
              </div>

              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Last reading: {format(new Date(device.lastReadingAt), 'PPp')}</span>
              </div>

              {attributes.capacityLiters && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Capacity:</span>
                  <span className="font-medium">{attributes.capacityLiters}L</span>
                </div>
              )}

              {attributes.installedAt && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Installed:</span>
                  <span className="font-medium">{format(new Date(attributes.installedAt), 'PP')}</span>
                </div>
              )}

              {attributes.lastInspectionAt && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Last Inspection:</span>
                  <span className="font-medium">{format(new Date(attributes.lastInspectionAt), 'PP')}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Current Metrics */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Current Metrics</h2>
            <div className="grid grid-cols-2 gap-4">
              {attributes.fillPercent !== undefined && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Fill Level</span>
                  </div>
                  <div className="text-2xl font-bold">{attributes.fillPercent}%</div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={cn(
                        "h-2 rounded-full transition-all",
                        attributes.fillPercent > 50 ? "bg-status-online" : 
                        attributes.fillPercent > 20 ? "bg-status-warning" : "bg-status-critical"
                      )}
                      style={{ width: `${attributes.fillPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {attributes.temperatureC !== undefined && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Temperature</span>
                  </div>
                  <div className="text-2xl font-bold">{attributes.temperatureC}°C</div>
                </div>
              )}

              {attributes.pressureKpa !== undefined && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Pressure</span>
                  </div>
                  <div className="text-2xl font-bold">{attributes.pressureKpa} kPa</div>
                </div>
              )}

              {attributes.batteryPercent !== undefined && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Battery className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Battery</span>
                  </div>
                  <div className="text-2xl font-bold">{attributes.batteryPercent}%</div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={cn(
                        "h-2 rounded-full transition-all",
                        attributes.batteryPercent > 30 ? "bg-status-online" : 
                        attributes.batteryPercent > 15 ? "bg-status-warning" : "bg-status-critical"
                      )}
                      style={{ width: `${attributes.batteryPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Notes */}
        {attributes.notes && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Notes</h2>
            </div>
            <p className="text-muted-foreground">{attributes.notes}</p>
          </Card>
        )}

        {/* Chart */}
        <div>
          {readingsLoading ? (
            <Card className="p-6">
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-64 w-full" />
            </Card>
          ) : readings && readings.length > 0 ? (
            <DeviceChart readings={readings} />
          ) : (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">No readings data available</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}