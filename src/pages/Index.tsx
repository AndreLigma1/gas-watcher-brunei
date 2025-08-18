

import { useNavigate } from 'react-router-dom';
import { useDevices } from '../hooks/data';



const Index = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useDevices();
  const devices = data ?? [];
  const handleDeviceClick = (deviceId: string) => {
    navigate(`/device/${deviceId}`);
  };

  if (isLoading) {
    return <div>Loading…</div>;
  }

  if (error) {
    return <div>Failed to load devices.</div>;
  }

  if (error) {
    return <div>Failed to load devices.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Devices</h1>
        <ul className="divide-y">
          {(Array.isArray(devices) ? devices : []).map((d: any) => (
            <li key={d.id} className="py-2 flex flex-col md:flex-row md:items-center md:gap-4 cursor-pointer" onClick={() => handleDeviceClick(d.id)}>
              <span className="font-mono">{d.id}</span>
              <span>{d.tank_id}</span>
              <span>{d.label}</span>
              <span>{d.gas_type}</span>
              <span>{d.location}</span>
              <span>{d.last_ppm}</span>
              <span>{d.last_reading_at}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Index;