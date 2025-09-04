import { useEffect, useState } from 'react';
import axios from 'axios';

// List all distributors and their associated users with role 'distributor'
const DistributorManagement = () => {
  const [distributors, setDistributors] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get('/api/distributors'),
      axios.get('/api/consumers')
    ])
      .then(([distRes, userRes]) => {
        setDistributors(distRes.data.items || []);
        setUsers((userRes.data.items || []).filter((u: any) => u.role === 'distributor'));
        setLoading(false);
      })
      .catch(e => {
        setError('Failed to fetch distributors or users');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading distributors...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Distributors</h2>
      <ul className="space-y-4">
        {distributors.map(dist => (
          <li key={dist.distributor_id} className="border rounded p-3">
            <div className="font-semibold">{dist.name}</div>
            <div className="text-xs text-muted-foreground mb-2">ID: {dist.distributor_id}</div>
            <div className="ml-4">
              <div className="font-medium mb-1">Distributor Users:</div>
              <ul className="list-disc list-inside">
                {users.filter(u => u.distributor_id === dist.distributor_id).length === 0 ? (
                  <li className="text-xs text-muted-foreground">No users</li>
                ) : (
                  users.filter(u => u.distributor_id === dist.distributor_id).map(u => (
                    <li key={u.consumer_id} className="text-sm">{u.name} (ID: {u.consumer_id})</li>
                  ))
                )}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DistributorManagement;
