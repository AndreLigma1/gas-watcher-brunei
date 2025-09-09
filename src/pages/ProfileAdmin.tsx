import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/auth-context';
import axios from 'axios';
import AdminNameStatusForm from '@/components/AdminNameStatusForm';

const ProfileAdmin = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    axios.get('/api/admin-profile', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => {
        setProfile(res.data.profile);
        setLoading(false);
      })
      .catch(e => {
        setError('Failed to load profile');
        setLoading(false);
      });
  }, []);

  if (loading) return <Card className="p-8 text-center">Loading profile...</Card>;
  if (error) return <Card className="p-8 text-center text-red-500">{error}</Card>;
  if (!profile) return <Card className="p-8 text-center">Profile not found</Card>;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <Card className="max-w-md w-full p-8 mb-6">
        <h2 className="text-2xl font-bold mb-4">Admin Profile</h2>
        <div className="mb-2"><b>Username:</b> {profile.name}</div>
        <div className="mb-2"><b>Real Name:</b> {profile.real_name || '-'}</div>
        <div className="mb-2"><b>Date Created:</b> {profile.created_at ? new Date(profile.created_at).toLocaleString() : '-'}</div>
        <div className="mb-2"><b>Account Status:</b> {profile.status || '-'}</div>
      </Card>
      <AdminNameStatusForm profile={profile} onProfileUpdate={setProfile} />
    </div>
  );
};

export default ProfileAdmin;
