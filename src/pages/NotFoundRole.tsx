import React from 'react';

const NotFoundRole: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-2">Role Not Supported</h1>
      <p className="text-muted-foreground">Your account does not have a supported role for a dashboard page.</p>
    </div>
  </div>
);

export default NotFoundRole;
