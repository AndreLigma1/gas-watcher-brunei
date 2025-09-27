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
  // When a user is selected, show their devices
  const filterObj = selectedUser ? { consumer_id: selectedUser.consumer_id } : undefined;
  const { data: devices, isLoading: devicesLoading, error: devicesError } = useDevices(filterObj);
  const { query, setQuery, results } = useSearch({
    data: devices || [],
    searchFields: ['id']
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
            <h2 className="text-xl font-semibold mb-4">Users</h2>
            {usersLoading ? (
              <p>Loading users...</p>
            ) : usersError ? (
              <p className="text-red-500">Failed to load users</p>
            ) : consumers && consumers.length === 0 ? (
              <Card className="p-8 text-center">No users found for this distributor.</Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {consumers.map((c: any) => (
                  <UserCard key={c.consumer_id} user={c} onClick={handleUserClick} />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <button className="mb-4 px-3 py-1 rounded bg-muted" onClick={() => setSelectedUser(null)}>
              ← Back to Users
            </button>
            <h2 className="text-xl font-semibold mb-4">Devices for {selectedUser.name}</h2>
            {devicesLoading ? (
              <p>Loading devices...</p>
            ) : devicesError ? (
              <p className="text-red-500">Failed to load devices</p>
            ) : results.length === 0 ? (
              <Card className="p-8 text-center">No devices found for this user.</Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {results.map((device) => {
                  // Auto-update alert if tank is above 65%
                  React.useEffect(() => {
                    if (device.tank_level !== undefined && device.tank_level > 65) {
                      fetch('/api/alerts/auto-update', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ deviceId: device.id, tankLevel: device.tank_level }),
                      });
                    }
                  }, [device.tank_level, device.id]);
                  return (
                    <DeviceCard
                      key={device.id}
                      device={device}
                      onClick={() => handleDeviceClick(device.id)}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DistributorDashboard;
