import { Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { EntrepreneurSidebar } from "@/components/entrepreneur/EntrepreneurSidebar";
import { EntrepreneurHeader } from "@/components/entrepreneur/EntrepreneurHeader";
import { EntrepreneurOverview } from "@/components/entrepreneur/EntrepreneurOverview";
import { OpportunityManagement } from "@/components/entrepreneur/OpportunityManagement";
import { CreateOpportunity } from "@/components/entrepreneur/CreateOpportunity";
import EntrepreneurDocumentWorkspace from "@/components/entrepreneur/EntrepreneurDocumentWorkspace";
import ObserverManagement from "@/components/ui/observer-management";

const EntrepreneurDashboard = () => {
  // Mock user data - in real app this would come from auth context
  const mockUserId = "ent-001";
  const mockEntityId = "opp-001";
  const mockEntityName = "Tech Startup Alpha";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <EntrepreneurSidebar />
        <div className="flex-1 flex flex-col">
          <EntrepreneurHeader />
          <main className="flex-1 p-6 bg-gray-50">
            <Routes>
              <Route index element={<EntrepreneurOverview />} />
              <Route path="opportunities" element={<OpportunityManagement />} />
              <Route path="create-opportunity" element={<CreateOpportunity />} />
              <Route path="documents" element={<EntrepreneurDocumentWorkspace />} />
              <Route 
                path="observers" 
                element={
                  <ObserverManagement
                    userId={mockUserId}
                    entityId={mockEntityId}
                    entityType="opportunity"
                    entityName={mockEntityName}
                  />
                } 
              />
              <Route path="profile" element={<div>Profile Management</div>} />
              <Route path="offers" element={<div>Investment Offers</div>} />
              <Route path="agreements" element={<div>Agreements</div>} />
              <Route path="reports" element={<div>Progress Reports</div>} />
              <Route path="payouts" element={<div>Payouts</div>} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default EntrepreneurDashboard;
