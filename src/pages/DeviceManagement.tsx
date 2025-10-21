
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
  const [locationFilter, setLocationFilter] = useState('all');
  const [tankTypeFilter, setTankTypeFilter] = useState('all');
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
  const { query, setQuery, results: searchResults } = useSearch({
    data: devices || [],
    searchFields: ['id']
  });

  // Get unique locations and tank types
  const locations = Array.from(new Set((devices || []).map(d => d.location).filter(Boolean)));
  const tankTypes = Array.from(new Set((devices || []).map(d => d.tank_type).filter(Boolean)));

  // Filter results by location and tank type
  const results = searchResults.filter(d =>
    (locationFilter === 'all' || d.location === locationFilter) &&
    (tankTypeFilter === 'all' || d.tank_type === tankTypeFilter)
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center p-4">
          <button
            className="px-3 py-1 rounded bg-muted text-primary hover:bg-primary/10 text-sm"
            onClick={() => navigate('/')}
          >
            ← Back to Admin Dashboard
          </button>
          <div className="flex items-center gap-3 ml-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Device Management</h1>
              <p className="text-muted-foreground">Monitor all devices and tank levels in real-time</p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <SearchBar
                value={query}
                onChange={setQuery}
                placeholder="Search by device ID..."
              />
            </div>
            <div>
              <label className="mr-2 font-medium">Location:</label>
              <select
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                className="px-2 py-1 rounded border"
              >
                <option value="all">All</option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mr-2 font-medium">Tank Type:</label>
              <select
                value={tankTypeFilter}
                onChange={e => setTankTypeFilter(e.target.value)}
                className="px-2 py-1 rounded border"
              >
                <option value="all">All</option>
                {tankTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
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
