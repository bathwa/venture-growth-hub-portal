import { Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { UserManagement } from "@/components/admin/UserManagement";
import { PaymentManagement } from "@/components/admin/PaymentManagement";
import { PlatformSettings } from "@/components/admin/PlatformSettings";
import { AdminPoolManagement } from "@/components/admin/PoolManagement";
import { AdminEscrowManagement } from "@/components/admin/EscrowManagement";
import { OpportunityOversight } from "@/components/admin/OpportunityOversight";
import { ReportsAnalytics } from "@/components/admin/ReportsAnalytics";
import TemplateManagement from "@/components/admin/TemplateManagement";
import AdminDocumentWorkspace from "@/components/admin/AdminDocumentWorkspace";
import ObserverManagement from "@/components/ui/observer-management";
import NotificationCenter from "@/components/ui/notification-center";
import { useState } from "react";

const AdminDashboard = () => {
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  const handleOpenNotifications = () => {
    setIsNotificationCenterOpen(true);
  };

  const handleCloseNotifications = () => {
    setIsNotificationCenterOpen(false);
  };

  // Mock user data - in real app this would come from auth context
  const mockUserId = "admin-001";
  const mockEntityId = "platform";
  const mockEntityName = "Platform Overview";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader onOpenNotifications={handleOpenNotifications} />
          <main className="flex-1 p-6 bg-gray-50">
            <Routes>
              <Route index element={<AdminOverview />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="payments" element={<PaymentManagement />} />
              <Route path="settings" element={<PlatformSettings />} />
              <Route path="pools" element={<AdminPoolManagement userId={mockUserId} />} />
              <Route path="escrow" element={<AdminEscrowManagement userId={mockUserId} />} />
              <Route path="opportunities" element={<OpportunityOversight />} />
              <Route path="reports" element={<ReportsAnalytics />} />
              <Route path="templates" element={<TemplateManagement />} />
              <Route path="documents" element={<AdminDocumentWorkspace />} />
              <Route 
                path="observers" 
                element={
                  <ObserverManagement
                    userId={mockUserId}
                    entityId={mockEntityId}
                    entityType="company"
                    entityName={mockEntityName}
                  />
                } 
              />
            </Routes>
          </main>
        </div>
      </div>
      
      {/* Notification Center */}
      <NotificationCenter 
        isOpen={isNotificationCenterOpen} 
        onClose={handleCloseNotifications} 
      />
    </SidebarProvider>
  );
};

export default AdminDashboard;
