import { useEffect, useState } from 'react';
import { DeviceCard } from '@/components/device-card';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [selectedUserDevices, setSelectedUserDevices] = useState<any[]>([]);
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get('/api/consumers'),
      axios.get('/api/devices')
    ])
      .then(([userRes, deviceRes]) => {
        const allUsers = (userRes.data.items || []).filter((u: any) => u.role === 'user');
        setUsers(allUsers);
        setDevices(deviceRes.data || []);
        setLoading(false);
      })
      .catch(e => {
        setError('Failed to fetch users or devices');
        setLoading(false);
      });
  }, []);

  // Device count per user
  const deviceCountMap = devices.reduce((acc: Record<string, number>, d: any) => {
    if (d.consumer_id) acc[d.consumer_id] = (acc[d.consumer_id] || 0) + 1;
    return acc;
  }, {});

  // Filtered users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) || String(user.consumer_id).includes(search);
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`/api/consumers/${userId}`);
      setUsers(users.filter(u => u.consumer_id !== userId));
    } catch (e) {
      alert('Failed to delete user');
    }
  };

  const handleSuspend = async (userId: string) => {
    if (!window.confirm('Suspend this user?')) return;
    try {
      await axios.post(`/api/consumers/${userId}/suspend`, { status: 'not active' });
      setUsers(users.map(u => u.consumer_id === userId ? { ...u, status: 'not active' } : u));
    } catch (e) {
      alert('Failed to suspend user');
    }
  };

  const handleUnsuspend = async (userId: string) => {
    if (!window.confirm('Unsuspend this user?')) return;
    try {
      await axios.post(`/api/consumers/${userId}/unsuspend`, { status: 'active' });
      setUsers(users.map(u => u.consumer_id === userId ? { ...u, status: 'active' } : u));
    } catch (e) {
      alert('Failed to unsuspend user');
    }
  };

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
              <h1 className="text-2xl font-bold">User Management</h1>
              <p className="text-muted-foreground">List of all users</p>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Search by name or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <select
            className="border rounded px-2 py-2 text-sm max-w-xs"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="not active">Not Active</option>
          </select>
        </div>
        {loading ? (
          <Card className="p-8 text-center">Loading users...</Card>
        ) : error ? (
          <Card className="p-8 text-center text-red-500">{error}</Card>
        ) : filteredUsers.length === 0 ? (
          <Card className="p-8 text-center">No users found</Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredUsers.map(user => (
              <Card
                key={user.consumer_id}
                className="p-4 flex flex-col gap-3 hover:shadow-lg hover:scale-[1.02] transition"
              >
                <div className="flex items-center gap-3">
                  <img
                    src="/placeholder.svg"
                    alt="Profile"
                    className="w-12 h-12 rounded-full border object-cover bg-muted"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-lg">{user.name}</div>
                    <div className="text-xs text-muted-foreground">ID: {user.consumer_id}</div>
                    <div className="text-xs text-muted-foreground">Status: {user.status || '-'}</div>
                  </div>
                </div>
                <div className="text-sm mt-2 mb-2">
                  <b>Devices:</b> {deviceCountMap[user.consumer_id] || 0}
                </div>
                <div className="flex gap-2 mt-auto">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/user-detail/${user.consumer_id}`)}>
                    View
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    setSelectedUserDevices(devices.filter((d: any) => d.consumer_id === user.consumer_id));
                    setSelectedUserName(user.name);
                    setShowDeviceModal(true);
                  }}>
                    View Devices
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(user.consumer_id)}>
                    Delete
                  </Button>
                  {user.status === 'not active' ? (
                    <Button variant="secondary" size="sm" onClick={() => handleUnsuspend(user.consumer_id)}>
                      Unsuspend
                    </Button>
                  ) : (
                    <Button variant="secondary" size="sm" onClick={() => handleSuspend(user.consumer_id)}>
                      Suspend
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      {/* Device Modal (moved outside card map) */}
      {showDeviceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
              onClick={() => setShowDeviceModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4">Devices for {selectedUserName}</h2>
            {selectedUserDevices.length === 0 ? (
              <div className="text-center text-muted-foreground">No devices found for this user.</div>
            ) : (
              <div
                className="grid gap-4 md:grid-cols-2"
                style={{ maxHeight: '400px', overflowY: 'auto' }}
              >
                {selectedUserDevices.map((device: any) => (
                  <DeviceCard key={device.id} device={device} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
