
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { PoolSidebar } from '@/components/pool/PoolSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, DollarSign, TrendingUp, Building } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/loading-spinner';

const PoolDashboard = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner text="Loading pool dashboard..." />
      </div>
    );
  }

  if (!user || user.role !== 'pool') {
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
        <PoolSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b bg-white flex items-center justify-between px-6">
            <h1 className="text-xl font-semibold text-gray-900">Pool Management</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Welcome, {user.name}</span>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Pool Dashboard</h1>
                  <p className="text-gray-600 mt-2">Manage your investment pool</p>
                </div>
                <Button>
                  Create New Pool
                </Button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Pool Value</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$500K</div>
                    <p className="text-xs text-green-600 font-medium">+8.2% this month</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pool Members</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">25</div>
                    <p className="text-xs text-green-600 font-medium">+3 new members</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
                    <Building className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-blue-600 font-medium">Across 4 sectors</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Returns</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12.5%</div>
                    <p className="text-xs text-green-600 font-medium">Above target</p>
                  </CardContent>
                </Card>
              </div>

              {/* Pool Management */}
              <Card>
                <CardHeader>
                  <CardTitle>Pool Management</CardTitle>
                  <CardDescription>Manage your investment pools and member allocations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2].map((pool) => (
                      <div key={pool} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div>
                          <h3 className="font-medium">Tech Investment Pool #{pool}</h3>
                          <p className="text-sm text-gray-600">25 members • $250K total value</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="default">Active</Badge>
                            <Badge variant="outline">High Performance</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">15.3% ROI</p>
                          <Button variant="outline" size="sm" className="mt-2">
                            Manage Pool
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

export default PoolDashboard;
