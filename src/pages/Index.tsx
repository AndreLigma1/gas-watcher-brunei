
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDevices } from '@/hooks/useDevices';
import { useSearch } from '@/hooks/useSearch';
import { DeviceCard } from '@/components/device-card';
import { SearchBar } from '@/components/search-bar';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Activity, AlertTriangle } from 'lucide-react';

import { fetchFilterOptions } from '@/lib/fetchFilterOptions';


const Index = () => {
  const navigate = useNavigate();

  // Only one filter can be active at a time
  const [filterType, setFilterType] = useState<'manufacturer' | 'distributor' | 'consumer' | null>(null);
  const [filterId, setFilterId] = useState<string>('');

  // Filter options from API
  const [manufacturers, setManufacturers] = useState<{ id: string; name: string }[]>([]);
  const [distributors, setDistributors] = useState<{ id: string; name: string }[]>([]);
  const [consumers, setConsumers] = useState<{ id: string; name: string }[]>([]);
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [filtersError, setFiltersError] = useState<string | null>(null);

  useEffect(() => {
    setFiltersLoading(true);
    fetchFilterOptions()
      .then(({ manufacturers, distributors, consumers }) => {
        setManufacturers(manufacturers);
        setDistributors(distributors);
        setConsumers(consumers);
        setFiltersLoading(false);
      })
      .catch((e) => {
        setFiltersError('Failed to load filter options');
        setFiltersLoading(false);
      });
  }, []);

  // Build filter object for useDevices hook
  const filterObj =
    filterType === 'manufacturer' && filterId ? { manufacturer_id: filterId } :
    filterType === 'distributor' && filterId ? { distributor_id: filterId } :
    filterType === 'consumer' && filterId ? { consumer_id: filterId } :
    undefined;

  const { data: devices, isLoading, error } = useDevices(filterObj);
  const { query, setQuery, results } = useSearch({
    data: devices || [],
    searchFields: ['id']
  });

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
          <Alert className="border-destructive/50 bg-destructive/10">
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
              <h1 className="text-2xl font-bold">IoT Device Monitoring</h1>
              <p className="text-muted-foreground">Monitor devices and tank levels in real-time</p>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <SearchBar
                value={query}
                onChange={setQuery}
                placeholder="Search by device ID..."
              />
            </div>
            <div className="flex gap-2">
              {/* Manufacturer filter */}
              <select
                className="border rounded px-2 py-1"
                value={filterType === 'manufacturer' ? filterId : ''}
                onChange={e => {
                  setFilterType('manufacturer');
                  setFilterId(e.target.value);
                }}
                disabled={filtersLoading}
              >
                <option value="">Manufacturer</option>
                {manufacturers.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              {/* Distributor filter */}
              <select
                className="border rounded px-2 py-1"
                value={filterType === 'distributor' ? filterId : ''}
                onChange={e => {
                  setFilterType('distributor');
                  setFilterId(e.target.value);
                }}
                disabled={filtersLoading}
              >
                <option value="">Distributor</option>
                {distributors.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              {/* Consumer filter */}
              <select
                className="border rounded px-2 py-1"
                value={filterType === 'consumer' ? filterId : ''}
                onChange={e => {
                  setFilterType('consumer');
                  setFilterId(e.target.value);
                }}
                disabled={filtersLoading}
              >
                <option value="">Consumer</option>
                {consumers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {/* Clear filter button */}
              {(filterType && filterId) && (
                <button
                  className="ml-2 px-2 py-1 border rounded text-xs bg-muted hover:bg-muted/70"
                  onClick={() => { setFilterType(null); setFilterId(''); }}
                >
                  Clear Filter
                </button>
              )}
            </div>
      {filtersError && (
        <div className="text-red-500 text-sm mt-2">{filtersError}</div>
      )}
          </div>
        </div>
      </div>

      {/* Device Grid */}
      <div className="max-w-7xl mx-auto p-6">
        {results.length === 0 ? (
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