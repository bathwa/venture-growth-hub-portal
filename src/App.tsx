import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { PWAProvider } from "./contexts/PWAContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import EntrepreneurDashboard from "./pages/entrepreneur/EntrepreneurDashboard";
import InvestorDashboard from "./pages/investor/InvestorDashboard";
import ServiceProviderDashboard from "./pages/service-provider/ServiceProviderDashboard";
import ObserverDashboard from "./pages/observer/ObserverDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(user?.role || '')) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AppContent = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/entrepreneur/*" 
          element={
            <ProtectedRoute allowedRoles={['entrepreneur']}>
              <EntrepreneurDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/investor/*" 
          element={
            <ProtectedRoute allowedRoles={['investor', 'pool']}>
              <InvestorDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/service-provider/*" 
          element={
            <ProtectedRoute allowedRoles={['service_provider']}>
              <ServiceProviderDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/observer/*" 
          element={
            <ProtectedRoute allowedRoles={['observer']}>
              <ObserverDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <PWAProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </AuthProvider>
      </PWAProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
