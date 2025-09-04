
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Activity } from 'lucide-react';

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
                <h1 className="text-2xl font-bold">Distributor Management</h1>
                <p className="text-muted-foreground">List of all distributors and their users</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto p-6">
        {loading ? (
          <Card className="p-8 text-center">Loading distributors...</Card>
        ) : error ? (
          <Card className="p-8 text-center text-red-500">{error}</Card>
        ) : distributors.length === 0 ? (
          <Card className="p-8 text-center">No distributors found</Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {distributors.map(dist => (
              <Card key={dist.distributor_id} className="p-4">
                <div className="font-semibold">{dist.name}</div>
                <div className="text-xs text-muted-foreground mb-2">ID: {dist.distributor_id}</div>
                <div className="mt-2">
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
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DistributorManagement;
