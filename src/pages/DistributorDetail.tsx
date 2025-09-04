import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';

const DistributorDetail = () => {
  const { id } = useParams();
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
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-2">{distributor.name}</h2>
          <div className="text-muted-foreground mb-2">ID: {distributor.distributor_id}</div>
          <div>Manufacturer: {distributor.manufacturer_name || distributor.manufacturer_id}</div>
        </Card>
      </div>
    </div>
  );
};

export default DistributorDetail;
