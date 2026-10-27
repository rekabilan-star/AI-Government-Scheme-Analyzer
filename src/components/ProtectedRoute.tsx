import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdminRole?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdminRole = false }) => {
  const { user, isLoading, isAdmin } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Verifying authorization...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdminRole && !isAdmin) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-rose-50 border border-rose-200 rounded-xl text-center">
        <h2 className="text-xl font-bold text-rose-800 mb-2">Access Restricted</h2>
        <p className="text-rose-600 mb-4">
          This section requires administrative privileges. Your account ({user.email}) is registered as a citizen.
        </p>
        <a
          href="/"
          className="inline-block px-5 py-2.5 bg-rose-700 text-white rounded-lg font-medium hover:bg-rose-800 transition-colors"
        >
          Return to Citizen Portal
        </a>
      </div>
    );
  }

  return <>{children}</>;
};
