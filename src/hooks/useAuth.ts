
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
      localStorage.setItem("token", res.data.token);
      // Set user from decoded JWT for immediate redirect
      const decoded: any = jwtDecode(res.data.token);
      setUser({ ...decoded });
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
