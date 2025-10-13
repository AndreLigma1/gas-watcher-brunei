import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth-context';
import { useDevices } from '@/hooks/useDevices';
import { useSearch } from '@/hooks/useSearch';
import { DeviceCard } from '@/components/device-card';
import UserCard from '@/components/user-card';
import { useConsumersByDistributor } from '@/hooks/useConsumersByDistributor';
import { Card } from '@/components/ui/card';
import { Activity, Bell, CheckCircle2 } from 'lucide-react';
import { useDistributorAlerts } from '@/hooks/useDistributorAlerts';

const DistributorDashboard = () => {
  const [activeTab, setActiveTab] = React.useState<'users' | 'alerts'>('users');
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

  // Auto-update alerts for all devices above 65%
  React.useEffect(() => {
    if (Array.isArray(results)) {
      results.forEach((device) => {
        if (device && typeof device.tank_level === 'number' && device.tank_level > 65) {
          fetch('/api/alerts/auto-update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deviceId: device.id, tankLevel: device.tank_level }),
          });
        }
      });
    }
  }, [results]);

  // Alerts for this distributor
  const { alerts, loading: alertsLoading, error: alertsError, refetch: refetchAlerts } = useDistributorAlerts(user?.distributor_id);

  // Dismiss/resolve alert
  const resolveAlert = async (alertId) => {
    try {
      const res = await fetch(`/api/alerts/${alertId}/resolve`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to resolve alert');
      refetchAlerts();
    } catch (e) {
      alert(e.message);
    }
  };
  // ...existing code...
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
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  Distributor Dashboard
                  {alerts && alerts.length > 0 && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded bg-red-500 text-white text-xs font-semibold animate-pulse">
                      <Bell className="w-4 h-4 mr-1" />
                      {alerts.length} New Alert{alerts.length > 1 ? 's' : ''}
                    </span>
                  )}
                </h1>
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
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-4">
            <button
              className={`px-4 py-2 rounded ${activeTab === 'users' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}
              onClick={() => setActiveTab('users')}
            >
              Users & Devices
            </button>
            <button
              className={`px-4 py-2 rounded ${activeTab === 'alerts' ? 'bg-red-500 text-white' : 'bg-muted text-muted-foreground'}`}
              onClick={() => setActiveTab('alerts')}
            >
              Alerts
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'alerts' ? (
          <>
            <h2 className="text-xl font-semibold mb-4">Alerts</h2>
            {alertsLoading ? (
              <p>Loading alerts...</p>
            ) : alertsError ? (
              <p className="text-red-500">Failed to load alerts</p>
            ) : alerts && alerts.length === 0 ? (
              <Card className="p-8 text-center">No alerts found.</Card>
            ) : (
              <div className="bg-red-100 border border-red-300 rounded p-3 flex flex-col gap-2 mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <Bell className="text-red-500 w-5 h-5" />
                  <span className="font-medium text-red-700">Alerted Devices</span>
                </div>
                <div className="flex flex-col gap-2">
                  {alerts.map(alert => (
                    <div key={alert.id} className="flex items-center gap-2 bg-white rounded p-2 border border-red-200">
                      <span className="font-semibold text-red-700">Device:</span> <span>{alert.device_id}</span>
                      <span className="font-semibold text-red-700 ml-2">User:</span> <span>{alert.consumer_name}</span>
                      <span className="font-semibold text-red-700 ml-2">Location:</span> <span>{alert.location}</span>
                      <span className="font-semibold text-red-700 ml-2">Tank Level:</span> <span>{alert.tank_level}</span>
                      <button
                        className="flex items-center gap-1 px-2 py-1 rounded bg-green-600 text-white text-xs hover:bg-green-700 ml-auto"
                        onClick={() => resolveAlert(alert.id)}
                      >
                        <CheckCircle2 className="w-4 h-4" /> Resolve
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          !selectedUser ? (
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
                    // Find alert for this device
                    const deviceAlert = alerts?.find(alert => alert.device_id === device.id);
                    return (
                      <div
                        key={device?.id}
                        className={deviceAlert ? 'relative bg-red-100 border-2 border-red-500 rounded-lg' : 'relative'}
                        style={{ minHeight: 0 }}
                      >
                        <DeviceCard
                          device={device}
                          onClick={() => handleDeviceClick(device?.id)}
                        />
                        {deviceAlert && (
                          <div style={{ pointerEvents: 'auto' }} className="absolute top-2 right-2 flex flex-col items-end z-20">
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-red-500 text-white text-xs font-semibold animate-pulse mb-1 shadow-lg">
                              Alert!
                            </span>
                            <button
                              className="flex items-center gap-1 px-2 py-1 rounded bg-green-600 text-white text-xs hover:bg-green-700 shadow-lg"
                              onClick={e => { e.stopPropagation(); resolveAlert(deviceAlert.id); }}
                            >
                              <CheckCircle2 className="w-4 h-4" /> Resolve
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )
        )}
      </div>
    </div>
  );
}

export default DistributorDashboard;
