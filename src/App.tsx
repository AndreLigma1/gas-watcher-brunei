import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";


import DeviceDetail from "./pages/DeviceDetail";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ChooseDistributor from "./pages/ChooseDistributor";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";
import DistributorManagement from "./pages/DistributorManagement";
import DeviceManagement from "./pages/DeviceManagement";
import AdminProfile from "./pages/AdminProfile";
import UserDetail from "./pages/UserDetail";
import DistributorDetail from "./pages/DistributorDetail";
import DeviceDetailAdmin from "./pages/DeviceDetailAdmin";
import DistributorDashboard from "./pages/DistributorDashboard";
import UserDashboard from "./pages/UserDashboard";
import NotFoundRole from "./pages/NotFoundRole";
import { AuthProvider, useAuth } from "@/hooks/auth-context";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const queryClient = new QueryClient();


function RequireAuth({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (!user && location.pathname !== "/login") {
      navigate("/login");
    }
  }, [user, location.pathname, navigate]);
  if (!user && location.pathname !== "/login") return null;
  return children;
}


function RoleRouter() {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === 'admin') return <AdminDashboard />;
  if (user.role === 'distributor') return <DistributorDashboard />;
  if (user.role === 'user') return <UserDashboard />;
  return <NotFoundRole />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/choose-distributor" element={<ChooseDistributor />} />
            <Route path="/" element={<RequireAuth><RoleRouter /></RequireAuth>} />
            <Route path="/device/:deviceId" element={<RequireAuth><DeviceDetail /></RequireAuth>} />
            {/* Admin Management Routes */}
            <Route path="/user-management" element={<RequireAuth><UserManagement /></RequireAuth>} />
            <Route path="/distributor-management" element={<RequireAuth><DistributorManagement /></RequireAuth>} />
            <Route path="/device-management" element={<RequireAuth><DeviceManagement /></RequireAuth>} />
            <Route path="/admin-profile" element={<RequireAuth><AdminProfile /></RequireAuth>} />
            <Route path="/user-detail/:id" element={<RequireAuth><UserDetail /></RequireAuth>} />
            <Route path="/distributor-detail/:id" element={<RequireAuth><DistributorDetail /></RequireAuth>} />
            <Route path="/device-detail-admin/:id" element={<RequireAuth><DeviceDetailAdmin /></RequireAuth>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
