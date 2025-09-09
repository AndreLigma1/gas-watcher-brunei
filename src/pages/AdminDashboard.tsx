import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/hooks/auth-context';
import { Card } from '@/components/ui/card';
import { Activity, Menu as MenuIcon, User as UserIcon, Users, Package } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import AdminNameStatusForm from '@/components/AdminNameStatusForm';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Hamburger Menu */}
      <div className="border-b bg-card shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="mr-2">
                  <MenuIcon />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b font-bold text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5" /> Admin Menu
                  </div>
                  <nav className="flex-1 p-4 flex flex-col gap-2">
                    <Button variant="ghost" className="justify-start" onClick={() => navigate('/user-management')}><Users className="mr-2" />Users</Button>
                    <Button variant="ghost" className="justify-start" onClick={() => navigate('/distributor-management')}><Package className="mr-2" />Distributors</Button>
                    <Button variant="ghost" className="justify-start" onClick={() => navigate('/device-management')}><Activity className="mr-2" />Devices</Button>
                  </nav>
                  <div className="p-4 border-t">
                    <Button variant="destructive" className="w-full" onClick={() => { logout(); navigate('/login'); }}>Logout</Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
              <Activity className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold">Admin Dashboard</span>
          </div>
        </div>
      </div>
      {/* Main content area: Admin Profile */}
      <div className="max-w-7xl mx-auto p-6">
        {loading ? (
          <Card className="p-8 text-center">Loading profile...</Card>
        ) : error ? (
          <Card className="p-8 text-center text-red-500">{error}</Card>
        ) : profile ? (
          <>
            <Card className="max-w-md w-full p-8 mb-6 mx-auto">
              <h2 className="text-2xl font-bold mb-4">Admin Profile</h2>
              <div className="mb-2"><b>Username:</b> {profile.name}</div>
              <div className="mb-2"><b>Real Name:</b> {profile.real_name || '-'}</div>
              <div className="mb-2"><b>Date Created:</b> {profile.created_at ? new Date(profile.created_at).toLocaleString() : '-'}</div>
              <div className="mb-2"><b>Account Status:</b> {profile.status || '-'}</div>
            </Card>
            <AdminNameStatusForm profile={profile} onProfileUpdate={setProfile} />
          </>
        ) : (
          <Card className="p-8 text-center">Profile not found</Card>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;

