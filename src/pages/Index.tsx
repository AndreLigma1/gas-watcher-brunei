import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDevices } from '@/hooks/useDevices';
import { useSearch } from '@/hooks/useSearch';
import { DeviceCard } from '@/components/device-card';
import { SearchBar } from '@/components/search-bar';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { DeviceStatus } from '@/types/device';

const Index = () => {
  const navigate = useNavigate();
  const { data: devices, isLoading, error } = useDevices();
  const { query, setQuery, results } = useSearch({ 
    data: devices || [],
    searchFields: ['label', 'tankId', 'location', 'gasType']
  });

  // Status filter
  const [statusFilter, setStatusFilter] = useState<DeviceStatus | 'all'>('all');
  
  const filteredResults = useMemo(() => {
    if (statusFilter === 'all') return results;
    return results.filter(device => device.status === statusFilter);
  }, [results, statusFilter]);

  const statusCounts = useMemo(() => {
    if (!devices) return { online: 0, warning: 0, critical: 0, offline: 0 };
    
    return devices.reduce((acc, device) => {
      acc[device.status]++;
      return acc;
    }, { online: 0, warning: 0, critical: 0, offline: 0 });
  }, [devices]);

  const handleDeviceClick = (deviceId: string) => {
    navigate(`/device/${deviceId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="max-w-7xl mx-auto p-6">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-10 w-80" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <Alert className="border-status-critical/20 bg-status-critical-bg">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load devices. Please check your connection and try again.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card shadow-sm">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">IoT Gas Monitoring</h1>
              <p className="text-muted-foreground">Monitor gas tanks and devices in real-time</p>
            </div>
          </div>

          {/* Status Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-status-online-bg">
                  <Wifi className="h-4 w-4 text-status-online" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{statusCounts.online}</p>
                  <p className="text-sm text-muted-foreground">Online</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-status-warning-bg">
                  <AlertTriangle className="h-4 w-4 text-status-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{statusCounts.warning}</p>
                  <p className="text-sm text-muted-foreground">Warning</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-status-critical-bg">
                  <AlertTriangle className="h-4 w-4 text-status-critical" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{statusCounts.critical}</p>
                  <p className="text-sm text-muted-foreground">Critical</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-status-offline-bg">
                  <WifiOff className="h-4 w-4 text-status-offline" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{statusCounts.offline}</p>
                  <p className="text-sm text-muted-foreground">Offline</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchBar 
                value={query} 
                onChange={setQuery}
                placeholder="Search by device ID, tank ID, location, or gas type..."
              />
            </div>
            <div className="flex gap-2">
              <Badge 
                variant={statusFilter === 'all' ? 'default' : 'secondary'}
                className="cursor-pointer"
                onClick={() => setStatusFilter('all')}
              >
                All
              </Badge>
              <Badge 
                variant={statusFilter === 'online' ? 'default' : 'secondary'}
                className="cursor-pointer"
                onClick={() => setStatusFilter('online')}
              >
                Online
              </Badge>
              <Badge 
                variant={statusFilter === 'warning' ? 'default' : 'secondary'}
                className="cursor-pointer"
                onClick={() => setStatusFilter('warning')}
              >
                Warning
              </Badge>
              <Badge 
                variant={statusFilter === 'critical' ? 'default' : 'secondary'}
                className="cursor-pointer"
                onClick={() => setStatusFilter('critical')}
              >
                Critical
              </Badge>
              <Badge 
                variant={statusFilter === 'offline' ? 'default' : 'secondary'}
                className="cursor-pointer"
                onClick={() => setStatusFilter('offline')}
              >
                Offline
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Device Grid */}
      <div className="max-w-7xl mx-auto p-6">
        {filteredResults.length === 0 ? (
          <Card className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">No devices found</h3>
            <p className="text-muted-foreground">
              {query ? 'Try adjusting your search terms' : 'No devices match the selected filter'}
            </p>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredResults.map((device) => (
              <DeviceCard
                key={device.id}
                device={device}
                onClick={() => handleDeviceClick(device.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
