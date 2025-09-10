import { useParams, useNavigate } from 'react-router-dom';
import { useDevice } from '@/hooks/useDevices';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { GLOBAL_TIMEZONE } from '@/lib/utils';
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
              <p className="text-muted-foreground">Tank Level: {device.tank_level}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Main Tank Display */}
        <Card className="p-8 md:p-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Tank Level Status</h2>
            <p className="text-muted-foreground">Real-time monitoring data</p>
          </div>
          <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-12">
            <div className="relative flex-shrink-0 flex justify-center items-center md:self-start">
              <TankLevel 
                level={device.tank_level} 
                size="lg" 
                className="transform scale-150 md:scale-200" />
            </div>
            <div className="text-center md:text-left space-y-4 mt-16 md:mt-0">
              <p className="text-xl text-muted-foreground">Current Tank Level</p>
              <p className="text-lg text-muted-foreground">{device.tank_level_cm} cm</p>
            </div>
          </div>
        </Card>

        {/* Details Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Device Info */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Device Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Device ID</p>
                <p className="font-medium text-lg">{device.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tank Level (cm)</p>
                <p className="font-medium text-lg">{device.tank_level_cm} cm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Percentage</p>
                <p className="font-medium text-lg">{device.measurement}%</p>
              </div>
            </div>
          </Card>

          {/* Last Updated */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Last Updated</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {formatDistanceToNow(new Date(device.timestamp), { addSuffix: true })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatInTimeZone(new Date(device.timestamp), GLOBAL_TIMEZONE, 'PPpp')}
                  </p>
                  <p className="text-xs text-muted-foreground">Brunei Time</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Status */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Tank Status</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className={`font-medium text-lg ${
                  device.tank_level >= 70 ? 'text-green-600' : 
                  device.tank_level >= 30 ? 'text-yellow-600' : 
                  'text-red-600'
                }`}>
                  {device.tank_level >= 70 ? 'High' : 
                   device.tank_level >= 30 ? 'Medium' : 
                   'Low'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Level</p>
                <p className="font-medium text-lg">{device.tank_level}%</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}