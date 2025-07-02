
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PoolSidebar } from '@/components/pool/PoolSidebar';
import { PoolHeader } from '@/components/pool/PoolHeader';
import { PoolOverview } from '@/components/pool/PoolOverview';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/loading-spinner';

const PoolDashboard = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner text="Loading pool dashboard..." />
      </div>
    );
  }

  if (!user || user.role !== 'pool') {
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
    <AppLayout
      sidebar={<PoolSidebar />}
      header={<PoolHeader />}
    >
      <div className="p-6">
        <PoolOverview />
      </div>
    </AppLayout>
  );
};

export default PoolDashboard;
