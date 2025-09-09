import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const DistributorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [distributor, setDistributor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/distributors/${id}`)
      .then(res => {
        setDistributor(res.data.item);
        setLoading(false);
      })
      .catch(e => {
        setError('Failed to fetch distributor details');
        setLoading(false);
      });
  }, [id]);

  if (loading) return <Card className="p-8 text-center">Loading distributor...</Card>;
  if (error) return <Card className="p-8 text-center text-red-500">{error}</Card>;
  if (!distributor) return <Card className="p-8 text-center">Distributor not found</Card>;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full p-6">
        <Button variant="outline" className="mb-4" onClick={() => navigate(-1)}>
          ← Back
        </Button>
        <Card className="p-8 shadow-lg rounded-xl border border-gray-200">
          <h2 className="text-2xl font-bold mb-2 text-primary">{distributor.name}</h2>
          <div className="text-muted-foreground mb-2 font-mono">ID: {distributor.distributor_id}</div>
          <div className="mb-2"><b>Manufacturer:</b> {distributor.manufacturer_name || distributor.manufacturer_id}</div>
          <div className="mb-2"><b>Created:</b> {distributor.created_at ? new Date(distributor.created_at).toLocaleString() : '-'}</div>
          <div className="mb-2"><b>Updated:</b> {distributor.updated_at ? new Date(distributor.updated_at).toLocaleString() : '-'}</div>
        </Card>
      </div>
    </div>
  );
};

export default DistributorDetail;
