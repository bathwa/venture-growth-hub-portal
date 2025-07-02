
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { InvestorSidebar } from '@/components/investor/InvestorSidebar';
import { InvestorHeader } from '@/components/investor/InvestorHeader';
import { InvestorOverview } from '@/components/investor/InvestorOverview';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/loading-spinner';

const InvestorDashboard = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner text="Loading investor dashboard..." />
      </div>
    );
  }

  if (!user || user.role !== 'investor') {
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
      sidebar={<InvestorSidebar />}
      header={<InvestorHeader />}
    >
      <div className="p-6">
        <InvestorOverview />
      </div>
    </AppLayout>
  );
};

export default InvestorDashboard;
