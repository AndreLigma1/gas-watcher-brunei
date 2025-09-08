import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth-context';
import { Card } from '@/components/ui/card';
import { Activity, Menu as MenuIcon, User as UserIcon, Users, Package } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Loading and error UI removed (no data fetching in AdminDashboard)

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
                    <Button variant="ghost" className="justify-start" onClick={() => navigate('/admin-profile')}><UserIcon className="mr-2" />Profile</Button>
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
      {/* Main content area (empty for now) */}
      <div className="max-w-7xl mx-auto p-6">
        <Card className="p-8 text-center text-muted-foreground">Welcome, admin! Use the menu to manage users, distributors, devices, or view your profile.</Card>
      </div>
    </div>
  );
}

export default AdminDashboard;

