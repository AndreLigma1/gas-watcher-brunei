import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/consumers/${id}`)
      .then(res => {
        setUser(res.data.item);
        setLoading(false);
      })
      .catch(e => {
        setError('Failed to fetch user details');
        setLoading(false);
      });
  }, [id]);

  if (loading) return <Card className="p-8 text-center">Loading user...</Card>;
  if (error) return <Card className="p-8 text-center text-red-500">{error}</Card>;
  if (!user) return <Card className="p-8 text-center">User not found</Card>;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full p-6">
        <Button variant="outline" className="mb-4" onClick={() => navigate(-1)}>
          ← Back
        </Button>
        <Card className="p-8 shadow-lg rounded-xl border border-gray-200">
          <h2 className="text-2xl font-bold mb-2 text-primary">{user.name}</h2>
          <div className="text-muted-foreground mb-2 font-mono">ID: {user.consumer_id}</div>
          <div className="mb-2"><b>Role:</b> {user.role}</div>
          <div className="mb-2"><b>Distributor:</b> {user.distributor_name || user.distributor_id}</div>
          <div className="mb-2"><b>Created:</b> {user.created_at ? new Date(user.created_at).toLocaleString() : '-'}</div>
          <div className="mb-2"><b>Updated:</b> {user.updated_at ? new Date(user.updated_at).toLocaleString() : '-'}</div>
        </Card>
      </div>
    </div>
  );
};

export default UserDetail;
