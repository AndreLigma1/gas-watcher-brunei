import { useEffect, useState } from "react";
import axios from "axios";

export function useRoles() {
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    axios.get("/api/roles")
      .then(res => {
        setRoles(res.data.roles || []);
        setLoading(false);
      })
      .catch(e => {
        setError(e.response?.data?.error || "Failed to fetch roles");
        setLoading(false);
      });
  }, []);

  return { roles, loading, error };
}
