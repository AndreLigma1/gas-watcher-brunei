import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from 'axios';

const AdminNameStatusForm = ({ profile, onProfileUpdate }: { profile: any, onProfileUpdate: (p: any) => void }) => {
  const [realName, setRealName] = useState(profile?.real_name || '');
  const [status, setStatus] = useState(profile?.status || 'active');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await axios.post('/api/admin-profile/update', {
        real_name: realName,
        status,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      onProfileUpdate(res.data.profile);
      setSuccess(true);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 mb-6 max-w-md mx-auto">
      <h3 className="text-lg font-bold mb-4">Edit Admin Profile</h3>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Real Name</label>
        <Input value={realName} onChange={e => setRealName(e.target.value)} placeholder="Enter real name" />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Account Status</label>
        <select className="border rounded px-2 py-1 w-full" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="active">Active</option>
          <option value="not active">Not Active</option>
        </select>
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">Profile updated!</div>}
      <Button onClick={handleSave} disabled={loading}>
        {loading ? 'Saving...' : 'Save Changes'}
      </Button>
    </Card>
  );
};

export default AdminNameStatusForm;
