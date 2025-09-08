
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    axios.get('/api/consumers')
      .then(res => {
        setUsers((res.data.items || []).filter((u: any) => u.role === 'user'));
        setLoading(false);
      })
      .catch(e => {
        setError('Failed to fetch users');
        setLoading(false);
      });
  }, []);

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
        {loading ? (
          <Card className="p-8 text-center">Loading users...</Card>
        ) : error ? (
          <Card className="p-8 text-center text-red-500">{error}</Card>
        ) : users.length === 0 ? (
          <Card className="p-8 text-center">No users found</Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {users.map(user => (
              <Card
                key={user.consumer_id}
                className="p-4 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition"
                onClick={() => navigate(`/user-detail/${user.consumer_id}`)}
              >
                <div className="font-semibold">{user.name}</div>
                <div className="text-xs text-muted-foreground">ID: {user.consumer_id}</div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
