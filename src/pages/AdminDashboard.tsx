import React from 'react';

const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      {/* Add admin-specific features here */}
      <p>Welcome, admin! This page is for admin-specific features and management.</p>
    </div>
  );
};

export default AdminDashboard;
