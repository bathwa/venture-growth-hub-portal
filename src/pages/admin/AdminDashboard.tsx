import { Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { UserManagement } from "@/components/admin/UserManagement";
import { PaymentManagement } from "@/components/admin/PaymentManagement";
import { PlatformSettings } from "@/components/admin/PlatformSettings";
import { InvestmentPoolManagement } from "@/components/admin/InvestmentPoolManagement";
import { EscrowManagement } from "@/components/admin/EscrowManagement";
import { OpportunityOversight } from "@/components/admin/OpportunityOversight";
import { ReportsAnalytics } from "@/components/admin/ReportsAnalytics";
import TemplateManagement from "@/components/admin/TemplateManagement";
import AdminDocumentWorkspace from "@/components/admin/AdminDocumentWorkspace";

const AdminDashboard = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          <main className="flex-1 p-6 bg-gray-50">
            <Routes>
              <Route index element={<AdminOverview />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="payments" element={<PaymentManagement />} />
              <Route path="settings" element={<PlatformSettings />} />
              <Route path="pools" element={<InvestmentPoolManagement />} />
              <Route path="escrow" element={<EscrowManagement />} />
              <Route path="opportunities" element={<OpportunityOversight />} />
              <Route path="reports" element={<ReportsAnalytics />} />
              <Route path="templates" element={<TemplateManagement />} />
              <Route path="documents" element={<AdminDocumentWorkspace />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
