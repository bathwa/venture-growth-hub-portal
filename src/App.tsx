
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from 'next-themes';
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

// Entrepreneur Pages
import CreateOpportunity from '@/pages/entrepreneur/opportunities/create';
import OpportunitiesList from '@/pages/entrepreneur/opportunities/index';

// Components
import LoadingSpinner from '@/components/ui/loading-spinner';

// Get dashboard route based on user role
const getDashboardRoute = (role: string): string => {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'entrepreneur':
      return '/entrepreneur';
    case 'investor':
    case 'pool':
      return '/investor';
    case 'service_provider':
      return '/service-provider';
    case 'observer':
      return '/observer';
    default:
      return '/';
  }
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Checking permissions..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const dashboardRoute = getDashboardRoute(user.role);
    return <Navigate to={dashboardRoute} replace />;
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

// App Routes Component
function AppRoutes() {
  const { user, isAuthenticated, isLoading } = useAuth();

  console.log('🎯 AppRoutes render:', { isLoading, isAuthenticated, userRole: user?.role });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner text="Loading application..." size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/" 
        element={
          isAuthenticated && user ? (
            <Navigate to={getDashboardRoute(user.role)} replace />
          ) : (
            <Index />
          )
        } 
      />
      
      <Route 
        path="/login" 
        element={
          isAuthenticated && user ? (
            <Navigate to={getDashboardRoute(user.role)} replace />
          ) : (
            <Login />
          )
        } 
      />
      
      <Route 
        path="/signup" 
        element={
          isAuthenticated && user ? (
            <Navigate to={getDashboardRoute(user.role)} replace />
          ) : (
            <Signup />
          )
        } 
      />

      {/* Protected Dashboard Routes */}
      <Route path="/admin" element={<DashboardRoute role="admin" component={AdminDashboard} />} />
      <Route path="/entrepreneur" element={<DashboardRoute role="entrepreneur" component={EntrepreneurDashboard} />} />
      <Route path="/investor" element={<DashboardRoute role="investor" component={InvestorDashboard} />} />
      <Route path="/pool" element={<DashboardRoute role="pool" component={PoolDashboard} />} />
      <Route path="/service-provider" element={<DashboardRoute role="service_provider" component={ServiceProviderDashboard} />} />
      <Route path="/observer" element={<DashboardRoute role="observer" component={ObserverDashboard} />} />

      {/* Entrepreneur Pages */}
      <Route path="/entrepreneur/opportunities/create" element={<DashboardRoute role="entrepreneur" component={CreateOpportunity} />} />
      <Route path="/entrepreneur/opportunities" element={<DashboardRoute role="entrepreneur" component={OpportunitiesList} />} />

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
          <ThemeProvider>
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
          </ThemeProvider>
        </PWAProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
