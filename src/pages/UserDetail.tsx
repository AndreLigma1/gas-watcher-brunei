import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';

const UserDetail = () => {
  const { id } = useParams();
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
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-2">{user.name}</h2>
          <div className="text-muted-foreground mb-2">ID: {user.consumer_id}</div>
          <div className="mb-2">Role: {user.role}</div>
          <div>Distributor: {user.distributor_name || user.distributor_id}</div>
        </Card>
      </div>
    </div>
  );
};

export default UserDetail;
