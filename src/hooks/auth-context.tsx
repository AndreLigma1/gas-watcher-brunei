import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

interface AuthContextType {
  user: any;
  error: string | null;
  loading: boolean;
  login: (name: string, password: string) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <AuthContext.Provider value={{ user, error, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
