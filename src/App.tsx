import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { PWAProvider } from '@/contexts/PWAContext';

// Pages
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import NotFound from '@/pages/NotFound';

// Dashboards
import AdminDashboard from '@/pages/admin/AdminDashboard';
import EntrepreneurDashboard from '@/pages/entrepreneur/EntrepreneurDashboard';
import InvestorDashboard from '@/pages/investor/InvestorDashboard';
import PoolDashboard from '@/pages/pool/PoolDashboard';
import ServiceProviderDashboard from '@/pages/service-provider/ServiceProviderDashboard';
import ObserverDashboard from '@/pages/observer/ObserverDashboard';

// Components
import LoadingSpinner from '@/components/ui/loading-spinner';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on user role
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'entrepreneur':
        return <Navigate to="/entrepreneur" replace />;
      case 'investor':
        return <Navigate to="/investor" replace />;
      case 'pool':
        return <Navigate to="/pool" replace />;
      case 'service_provider':
        return <Navigate to="/service-provider" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

// Dashboard Route Component
const DashboardRoute: React.FC<{ role: string; component: React.ComponentType }> = ({ 
  role, 
  component: Component 
}) => {
  return (
    <ProtectedRoute allowedRoles={[role]}>
      <Component />
    </ProtectedRoute>
  );
};

function AppRoutes() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        isAuthenticated ? 
          (user?.role === 'admin' ? <Navigate to="/admin" replace /> :
           user?.role === 'entrepreneur' ? <Navigate to="/entrepreneur" replace /> :
           user?.role === 'investor' || user?.role === 'pool' ? <Navigate to="/investor" replace /> :
           user?.role === 'service_provider' ? <Navigate to="/service-provider" replace /> :
           <Navigate to="/login" replace />) : 
          <Index />
      } />
      <Route path="/login" element={
        isAuthenticated ? 
          (user?.role === 'admin' ? <Navigate to="/admin" replace /> :
           user?.role === 'entrepreneur' ? <Navigate to="/entrepreneur" replace /> :
           user?.role === 'investor' || user?.role === 'pool' ? <Navigate to="/investor" replace /> :
           user?.role === 'service_provider' ? <Navigate to="/service-provider" replace /> :
           <Navigate to="/" replace />) : 
          <Login />
      } />
      <Route path="/signup" element={
        isAuthenticated ? 
          (user?.role === 'admin' ? <Navigate to="/admin" replace /> :
           user?.role === 'entrepreneur' ? <Navigate to="/entrepreneur" replace /> :
           user?.role === 'investor' || user?.role === 'pool' ? <Navigate to="/investor" replace /> :
           user?.role === 'service_provider' ? <Navigate to="/service-provider" replace /> :
           <Navigate to="/" replace />) : 
          <Signup />
      } />

      {/* Protected Dashboard Routes */}
      <Route path="/admin" element={<DashboardRoute role="admin" component={AdminDashboard} />} />
      <Route path="/entrepreneur" element={<DashboardRoute role="entrepreneur" component={EntrepreneurDashboard} />} />
      <Route path="/investor" element={<DashboardRoute role="investor" component={InvestorDashboard} />} />
      <Route path="/pool" element={<DashboardRoute role="pool" component={PoolDashboard} />} />
      <Route path="/service-provider" element={<DashboardRoute role="service_provider" component={ServiceProviderDashboard} />} />
      <Route path="/observer" element={<DashboardRoute role="observer" component={ObserverDashboard} />} />

      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <PWAProvider>
          <div className="min-h-screen bg-gray-50">
            <AppRoutes />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                },
              }}
            />
          </div>
        </PWAProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
