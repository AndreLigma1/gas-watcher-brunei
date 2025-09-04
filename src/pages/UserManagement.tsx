import { useEffect, useState } from 'react';
import axios from 'axios';

// List all users with role 'user'
const UserManagement = () => {
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

  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Users</h2>
      <ul className="space-y-2">
        {users.map(user => (
          <li key={user.consumer_id} className="border rounded p-3">
            <div className="font-semibold">{user.name}</div>
            <div className="text-xs text-muted-foreground">ID: {user.consumer_id}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserManagement;
