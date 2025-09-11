import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth-context';
import { useDevices } from '@/hooks/useDevices';
import { useSearch } from '@/hooks/useSearch';
import { DeviceCard } from '@/components/device-card';
import UserCard from '@/components/user-card';
import { useConsumersByDistributor } from '@/hooks/useConsumersByDistributor';
import { Card } from '@/components/ui/card';
import { Activity } from 'lucide-react';

const DistributorDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  // Show all users for this distributor
  const { data: consumers, isLoading: usersLoading, error: usersError } = useConsumersByDistributor(user?.distributor_id);
  const [selectedUser, setSelectedUser] = React.useState<{ consumer_id: string; name: string } | null>(null);
  const [showUsers, setShowUsers] = React.useState(true);
  const [showDevices, setShowDevices] = React.useState(true);
  // User search
  const [userQuery, setUserQuery] = React.useState('');
  const filteredConsumers = React.useMemo(() => {
    if (!userQuery.trim()) return consumers || [];
    return (consumers || []).filter((c: any) =>
      c.name.toLowerCase().includes(userQuery.toLowerCase()) ||
      c.consumer_id.toLowerCase().includes(userQuery.toLowerCase())
    );
  }, [consumers, userQuery]);
  // When a user is selected, show their devices
  const filterObj = selectedUser ? { consumer_id: selectedUser.consumer_id } : undefined;
  const { data: devices, isLoading: devicesLoading, error: devicesError } = useDevices(filterObj);
  // Device search
  const { query, setQuery, results } = useSearch({
    data: devices || [],
    searchFields: ['id', 'location', 'tank_type']
  });
  const handleUserClick = (consumer_id: string) => {
    const userObj = consumers.find((c: any) => c.consumer_id === consumer_id);
    setSelectedUser(userObj);
  };
  const handleDeviceClick = (deviceId: string) => {
    navigate(`/device/${deviceId}`);
  };
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card shadow-sm">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center gap-3 mb-6 justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Distributor Dashboard</h1>
                <p className="text-muted-foreground">Users managed by your distributor</p>
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
      </div>
      <div className="max-w-7xl mx-auto p-6">
        {!selectedUser ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Users</h2>
              <button
                className="px-3 py-1 rounded bg-muted text-sm"
                onClick={() => setShowUsers((v) => !v)}
              >
                {showUsers ? 'Hide' : 'Show'} Users
              </button>
            </div>
            {showUsers && (
              <>
                <input
                  className="mb-4 px-3 py-2 border rounded w-full max-w-md"
                  placeholder="Search users by name or ID..."
                  value={userQuery}
                  onChange={e => setUserQuery(e.target.value)}
                />
                {usersLoading ? (
                  <p>Loading users...</p>
                ) : usersError ? (
                  <p className="text-red-500">Failed to load users</p>
                ) : filteredConsumers && filteredConsumers.length === 0 ? (
                  <Card className="p-8 text-center">No users found for this distributor.</Card>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredConsumers.map((c: any) => (
                      <UserCard key={c.consumer_id} user={c} onClick={handleUserClick} showStaticImage />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <>
            <button className="mb-4 px-3 py-1 rounded bg-muted" onClick={() => setSelectedUser(null)}>
              ← Back to Users
            </button>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Devices for {selectedUser.name}</h2>
              <button
                className="px-3 py-1 rounded bg-muted text-sm"
                onClick={() => setShowDevices((v) => !v)}
              >
                {showDevices ? 'Hide' : 'Show'} Devices
              </button>
            </div>
            {showDevices && (
              <>
                <input
                  className="mb-4 px-3 py-2 border rounded w-full max-w-md"
                  placeholder="Search devices by ID, location, or tank type..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
                {devicesLoading ? (
                  <p>Loading devices...</p>
                ) : devicesError ? (
                  <p className="text-red-500">Failed to load devices</p>
                ) : results.length === 0 ? (
                  <Card className="p-8 text-center">No devices found for this user.</Card>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {results.map((device) => (
                      <DeviceCard
                        key={device.id}
                        device={device}
                        onClick={() => handleDeviceClick(device.id)}
                        alert={device.measurement !== undefined && device.measurement < 20}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DistributorDashboard;
