
import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // On mount, check for token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setUser({ ...decoded });
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
      setUser(res.data.user);
      localStorage.setItem("token", res.data.token);
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
    localStorage.removeItem("token");
  };

  return { user, error, loading, login, logout };
}
