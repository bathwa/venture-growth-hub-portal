import React from 'react';
import { PoolManagement } from '@/components/ui/pool-management';

interface AdminPoolManagementProps {
  userId: string;
}

export function AdminPoolManagement({ userId }: AdminPoolManagementProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Pool Management</h1>
        <p className="text-gray-600 mt-2">
          Monitor and manage all investment pools across the platform
        </p>
      </div>
      
      <PoolManagement userId={userId} userRole="admin" />
    </div>
  );
} 