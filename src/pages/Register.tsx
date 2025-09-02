import { useState } from "react";
import { useRoles } from "@/hooks/useRoles";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate, Link } from "react-router-dom";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const { roles, loading: rolesLoading, error: rolesError } = useRoles();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      if (role === "distributor") {
        // Go to distributor selection page, pass registration info
        navigate("/choose-distributor", { state: { name, password, role } });
        return;
      }
      await axios.post("/api/register", { name, password, role });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (e: any) {
      setError(e.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="p-8 w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Username"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            autoFocus
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <select
            className="border rounded px-2 py-1 w-full"
            value={role}
            onChange={e => setRole(e.target.value)}
            required
            disabled={rolesLoading}
          >
            <option value="" disabled>Select role</option>
            {roles.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          {rolesError && <div className="text-red-500 text-sm">{rolesError}</div>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Registering..." : "Register"}
          </Button>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">Registration successful! Redirecting to login...</div>}
        </form>
        <div className="mt-4 text-center text-sm">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;
