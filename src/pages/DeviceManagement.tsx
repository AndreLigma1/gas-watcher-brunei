
import { useState } from 'react';
import { useDevices } from '@/hooks/useDevices';
import { useSearch } from '@/hooks/useSearch';
import { DeviceCard } from '@/components/device-card';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '@/components/search-bar';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Activity, AlertTriangle } from 'lucide-react';

const DeviceManagement = () => {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState<'manufacturer' | 'distributor' | 'consumer' | null>(null);
  const [filterId, setFilterId] = useState<string>('');

  let filterObj: any = undefined;
  if (filterType === 'manufacturer' && filterId) {
    filterObj = { manufacturer_id: filterId };
  } else if (filterType === 'distributor' && filterId) {
    filterObj = { distributor_id: filterId };
  } else if (filterType === 'consumer' && filterId) {
    filterObj = { consumer_id: filterId };
  }

  const { data: devices, isLoading, error } = useDevices(filterObj);
  const { query, setQuery, results } = useSearch({
    data: devices || [],
    searchFields: ['id']
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card shadow-sm">
        <div className="max-w-7xl mx-auto p-2 flex gap-4">
          <a href="/user-management" className="text-primary underline">Users</a>
          <a href="/distributor-management" className="text-primary underline">Distributors</a>
          <a href="/device-management" className="text-primary underline">Devices</a>
        </div>
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center gap-3 mb-6 justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Device Management</h1>
                <p className="text-muted-foreground">Monitor all devices and tank levels in real-time</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <SearchBar
                value={query}
                onChange={setQuery}
                placeholder="Search by device ID..."
              />
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto p-6">
        {isLoading ? (
          <Card className="p-8 text-center">Loading devices...</Card>
        ) : error ? (
          <Card className="p-8 text-center text-red-500">{error?.toString()}</Card>
        ) : results.length === 0 ? (
          <Card className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">No devices found</h3>
            <p className="text-muted-foreground">
              {query ? 'Try adjusting your search terms' : 'No devices available'}
            </p>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {results.map((device) => (
              <DeviceCard
                key={device.id}
                device={device}
                onClick={() => navigate(`/device-detail-admin/${device.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceManagement;
