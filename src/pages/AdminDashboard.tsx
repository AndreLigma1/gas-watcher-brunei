import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth-context';
import { useDevices } from '@/hooks/useDevices';
import { useSearch } from '@/hooks/useSearch';
import { DeviceCard } from '@/components/device-card';
import { SearchBar } from '@/components/search-bar';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Activity, AlertTriangle } from 'lucide-react';
import { fetchFilterOptions } from '@/lib/fetchFilterOptions';
import UserManagement from './UserManagement';
import DistributorManagement from './DistributorManagement';
import DeviceManagement from './DeviceManagement';

const MENU = [
  { key: 'user', label: 'User Management', component: <UserManagement /> },
  { key: 'distributor', label: 'Distributor Management', component: <DistributorManagement /> },
  { key: 'device', label: 'Device Management', component: <DeviceManagement /> },
];

const AdminDashboard = () => {
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

  // Get user from auth context
  const { user, logout } = useAuth();

  // If user is 'user' role, always filter by their consumer_id
  // If user is 'distributor' role, always filter by their distributor_id
  let filterObj: any = undefined;
  if (user?.role === 'user') {
    filterObj = { consumer_id: user.consumer_id };
  } else if (user?.role === 'distributor') {
    filterObj = { distributor_id: user.distributor_id };
  } else if (filterType === 'manufacturer' && filterId) {
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

  const [selectedMenu, setSelectedMenu] = useState('user');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card shadow-sm">
        <div className="max-w-7xl mx-auto p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage users, distributors, and devices</p>
            </div>
          </div>
          <button
            className="ml-auto px-4 py-2 rounded bg-destructive text-white hover:bg-destructive/80 text-sm"
            onClick={() => { logout(); navigate('/login'); }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Admin Menu */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex gap-4 mb-8">
          {MENU.map((item) => (
            <button
              key={item.key}
              className={`px-4 py-2 rounded font-medium border ${selectedMenu === item.key ? 'bg-primary text-white' : 'bg-card text-primary border-primary'}`}
              onClick={() => setSelectedMenu(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="bg-card rounded shadow p-4">
          {MENU.find((item) => item.key === selectedMenu)?.component}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

