import { useEffect, useState } from "react";
import axios from "axios";

export function useDistributors() {
  const [distributors, setDistributors] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    axios.get("/api/distributors?limit=1000")
      .then(res => {
        setDistributors((res.data.items || []).map((d: any) => ({ id: d.distributor_id, name: d.name })));
        setLoading(false);
      })
      .catch(e => {
        setError(e.response?.data?.error || "Failed to fetch distributors");
        setLoading(false);
      });
  }, []);

  return { distributors, loading, error };
}
