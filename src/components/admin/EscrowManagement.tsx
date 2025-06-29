
import React from 'react';
import { EscrowManagement } from '@/components/ui/escrow-management';

interface AdminEscrowManagementProps {
  userId: string;
}

export function AdminEscrowManagement({ userId }: AdminEscrowManagementProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Escrow Management</h1>
        <p className="text-gray-600 mt-2">
          Monitor and manage all escrow accounts across the platform
        </p>
      </div>
      
      <EscrowManagement userId={userId} userRole="entrepreneur" />
    </div>
  );
}
