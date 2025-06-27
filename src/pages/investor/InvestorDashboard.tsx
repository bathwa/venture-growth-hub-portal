
import { Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const InvestorDashboard = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <div className="flex-1 p-6">
          <h1 className="text-3xl font-bold mb-6">Investor Dashboard</h1>
          <Card>
            <CardHeader>
              <CardTitle>Welcome, Investor!</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Investor dashboard functionality will be implemented here.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default InvestorDashboard;
