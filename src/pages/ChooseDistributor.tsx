import { useState } from "react";
import { useDistributors } from "@/hooks/useDistributors";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

const ChooseDistributor = () => {
  const { distributors, loading, error } = useDistributors();
  const [selected, setSelected] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  // Get registration info from state
  const { name, password, role } = location.state || {};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    // Complete registration with distributor_id
    try {
      await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password, role, distributor_id: selected })
      });
      navigate("/login");
    } catch {
      // handle error
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="p-8 w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">Choose Distributor</h2>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500 text-sm">{error}</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <select
              className="border rounded px-2 py-1 w-full"
              value={selected}
              onChange={e => setSelected(e.target.value)}
              required
            >
              <option value="" disabled>Select distributor</option>
              {distributors.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <Button type="submit" className="w-full">Register</Button>
          </form>
        )}
      </Card>
    </div>
  );
};

export default ChooseDistributor;
