
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { InvestorSidebar } from '@/components/investor/InvestorSidebar';
import { InvestorHeader } from '@/components/investor/InvestorHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, DollarSign, PieChart, Activity } from 'lucide-react';
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

  if (!user || (user.role !== 'investor' && user.role !== 'pool')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const stats = [
    { title: "Portfolio Value", value: "$125,000", change: "+12.5%", icon: DollarSign },
    { title: "Active Investments", value: "8", change: "+2", icon: TrendingUp },
    { title: "ROI", value: "15.3%", change: "+3.2%", icon: PieChart },
    { title: "Total Returns", value: "$18,750", change: "+$2,400", icon: Activity },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <InvestorSidebar />
        <div className="flex-1 flex flex-col">
          <InvestorHeader />
          <main className="flex-1 p-6 overflow-auto">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Investment Dashboard</h1>
                  <p className="text-gray-600 mt-2">Welcome back, {user.name}</p>
                </div>
                <Button>
                  New Investment
                </Button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-green-600 font-medium">{stat.change}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Investment Opportunities */}
              <Card>
                <CardHeader>
                  <CardTitle>Investment Opportunities</CardTitle>
                  <CardDescription>Discover new investment opportunities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div>
                          <h3 className="font-medium">Tech Startup #{item}</h3>
                          <p className="text-sm text-gray-600">Series A • Technology • $2M Target</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary">Verified</Badge>
                            <Badge variant="outline">High Growth</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">15% Expected ROI</p>
                          <Button variant="outline" size="sm" className="mt-2">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default InvestorDashboard;
