
import React, { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { EntrepreneurSidebar } from '@/components/entrepreneur/EntrepreneurSidebar';
import { EntrepreneurHeader } from '@/components/entrepreneur/EntrepreneurHeader';
import { EntrepreneurOverview } from '@/components/entrepreneur/EntrepreneurOverview';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/loading-spinner';

const EntrepreneurDashboard = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner text="Loading entrepreneur dashboard..." />
      </div>
    );
  }

  if (!user || user.role !== 'entrepreneur') {
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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <EntrepreneurSidebar />
        <div className="flex-1 flex flex-col">
          <EntrepreneurHeader />
          <main className="flex-1 p-6 overflow-auto">
            <EntrepreneurOverview />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default EntrepreneurDashboard;
