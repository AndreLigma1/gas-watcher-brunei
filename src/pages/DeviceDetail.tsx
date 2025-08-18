import { useParams, useNavigate } from 'react-router-dom';
import { useDevice } from '@/hooks/useDevices';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { TankLevel } from '@/components/tank-level';

export default function DeviceDetail() {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  
  const { data: device, isLoading: deviceLoading, error: deviceError } = useDevice(deviceId!);

  if (deviceLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-10 w-40" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-6xl mx-auto p-4">
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
              <h1 className="text-2xl font-bold">Device {device.id}</h1>
              <p className="text-muted-foreground">Measurement: {device.measurement}</p>
            </div>
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
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium">
                    {formatDistanceToNow(new Date(device.timestamp), { addSuffix: true })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(device.timestamp), 'PPpp')}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Tank Level & Readings */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Tank Status</h2>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Measurement</p>
                  <p className="text-2xl font-bold">{device.measurement}</p>
                </div>
              </div>
              <TankLevel level={device.tank_level} size="lg" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}