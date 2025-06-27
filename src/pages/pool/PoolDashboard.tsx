import { Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, TrendingUp, Users, DollarSign } from "lucide-react";
import PoolDocumentWorkspace from "@/components/pool/PoolDocumentWorkspace";
import { PoolSidebar } from "@/components/pool/PoolSidebar";

const PoolOverview = () => {
  const poolStats = {
    totalFunds: 10000000,
    investedAmount: 6500000,
    activeInvestments: 8,
    totalLPs: 45,
    avgReturn: 18.5
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Venture Growth Fund I</h1>
          <p className="text-muted-foreground">
            Investment Pool Management Dashboard
          </p>
        </div>
        <Badge variant="outline" className="bg-purple-50 text-purple-700">
          Pool Manager
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Pool Size</p>
                <p className="text-2xl font-bold">${(poolStats.totalFunds / 1000000).toFixed(1)}M</p>
              </div>
              <Building2 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Invested Amount</p>
                <p className="text-2xl font-bold">${(poolStats.investedAmount / 1000000).toFixed(1)}M</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Investments</p>
                <p className="text-2xl font-bold">{poolStats.activeInvestments}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Return</p>
                <p className="text-2xl font-bold">{poolStats.avgReturn}%</p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Pool Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Investment in TechCorp Inc.</h4>
                <p className="text-sm text-muted-foreground">$2,000,000 Series A investment</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Completed</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">LP Meeting Scheduled</h4>
                <p className="text-sm text-muted-foreground">Quarterly update with limited partners</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Due Diligence - StartupXYZ</h4>
                <p className="text-sm text-muted-foreground">Financial and legal review in progress</p>
              </div>
              <Badge className="bg-orange-100 text-orange-800">In Progress</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const PoolDashboard = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <PoolSidebar />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-6 bg-gray-50">
            <Routes>
              <Route index element={<PoolOverview />} />
              <Route path="documents" element={<PoolDocumentWorkspace />} />
              <Route path="investments" element={<div>Investment Management</div>} />
              <Route path="lps" element={<div>Limited Partner Management</div>} />
              <Route path="reports" element={<div>Pool Reports</div>} />
              <Route path="profile" element={<div>Pool Profile</div>} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default PoolDashboard; 