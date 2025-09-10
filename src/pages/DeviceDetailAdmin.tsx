import { useParams } from 'react-router-dom';
import { useDevice } from '@/hooks/useDevices';
import { Card } from '@/components/ui/card';
import { Activity } from 'lucide-react';

const DeviceDetailAdmin = () => {
  const { id } = useParams();
  const { data: device, isLoading, error } = useDevice(id || '');

  if (isLoading) return <Card className="p-8 text-center">Loading device...</Card>;
  if (error) return <Card className="p-8 text-center text-red-500">{error.toString()}</Card>;
  if (!device) return <Card className="p-8 text-center">Device not found</Card>;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
              <Activity className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold">Device {device.id}</h2>
          </div>
          <div className="mb-2">Tank Level: {device.measurement}% ({device.tank_level_cm} cm)</div>
          <div className="mb-2">Last Updated: {device.timestamp}</div>
          <div>Consumer ID: {device.consumer_id}</div>
          <div className="mb-2">Location: {device.location}</div>
          <div className="mb-2">Tank Type: {device.tank_type}</div>
        </Card>
      </div>
    </div>
  );
};

export default DeviceDetailAdmin;
