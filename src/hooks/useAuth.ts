

import { useState, useEffect } from "react";
import axios from "axios";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // On mount, check for user info
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const login = async (name: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post("/api/login", { name, password });
      // Assume backend returns user info directly (not JWT)
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      setLoading(false);
      return res.data;
    } catch (e: any) {
      setError(e.response?.data?.error || "Login failed");
      setLoading(false);
      return null;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return { user, error, loading, login, logout };
}
