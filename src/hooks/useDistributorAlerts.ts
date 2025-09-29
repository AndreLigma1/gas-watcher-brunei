import { useEffect, useState } from 'react';

export function useDistributorAlerts(distributorId) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAlerts = async () => {
    if (!distributorId) return;
    setLoading(true);
    setError(null);
    try {
  const res = await fetch(`/api/alerts?distributor_id=${distributorId}&status=0`);
      if (!res.ok) throw new Error('Failed to fetch alerts');
      const data = await res.json();
      setAlerts(data.items || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Optionally poll every 30s
    // const interval = setInterval(fetchAlerts, 30000);
    // return () => clearInterval(interval);
  }, [distributorId]);

  return { alerts, loading, error, refetch: fetchAlerts };
}
