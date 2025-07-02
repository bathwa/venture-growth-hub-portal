
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ObserverOverview } from '@/components/observer/ObserverOverview';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Eye, Settings, LogOut } from 'lucide-react';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { toast } from 'sonner';

const ObserverDashboard = () => {
  const { user, isLoading, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner text="Loading observer dashboard..." />
      </div>
    );
  }

  if (!user || user.role !== 'observer') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Observer Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Eye className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Observer Portal</h1>
                <p className="text-sm text-gray-600">Read-only access to assigned entities</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <LanguageToggle />
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Welcome, {user.name}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ObserverOverview />
      </main>
    </div>
  );
};

export default ObserverDashboard;
