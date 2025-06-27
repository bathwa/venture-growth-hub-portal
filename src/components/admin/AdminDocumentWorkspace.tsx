import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { FileText, Settings, Users, Download, Eye } from 'lucide-react';
import DocumentWorkspace from '@/components/ui/document-workspace';
import { SystemData } from '@/lib/document-generator';

// Mock system data for admin
const mockSystemData: SystemData = {
  user: {
    id: 'admin-1',
    full_name: 'System Administrator',
    email: 'admin@venturehub.com',
    role: 'admin'
  },
  opportunity: {
    id: 'opp-1',
    title: 'Tech Startup Funding',
    description: 'Innovative SaaS platform seeking Series A funding',
    funding_goal: 2000000,
    equity_offered: 15,
    company_name: 'TechCorp Inc.',
    entrepreneur_name: 'John Doe',
    created_at: '2024-01-15'
  },
  investment: {
    id: 'inv-1',
    amount: 500000,
    equity_percentage: 5,
    investor_name: 'Angel Investor LLC',
    investment_date: '2024-02-01',
    status: 'active'
  },
  pool: {
    id: 'pool-1',
    name: 'Venture Growth Fund I',
    total_funds: 10000000,
    manager_name: 'Sarah Johnson'
  }
};

const AdminDocumentWorkspace = () => {
  const [activeTab, setActiveTab] = useState('documents');
  const [documentStats, setDocumentStats] = useState({
    totalGenerated: 1247,
    thisMonth: 89,
    pendingApproval: 12,
    templatesActive: 8
  });

  const handleDocumentGenerated = (content: string, variables: Record<string, string>, form: any) => {
    console.log('Document generated:', { content, variables, form });
    // Here you would typically save to database and update stats
    setDocumentStats(prev => ({
      ...prev,
      totalGenerated: prev.totalGenerated + 1,
      thisMonth: prev.thisMonth + 1
    }));
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Document Management</h1>
          <p className="text-muted-foreground">
            Generate, manage, and oversee all platform documents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Admin Access
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Generated</p>
                <p className="text-2xl font-bold">{documentStats.totalGenerated}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">{documentStats.thisMonth}</p>
              </div>
              <Download className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
                <p className="text-2xl font-bold">{documentStats.pendingApproval}</p>
              </div>
              <Eye className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Templates</p>
                <p className="text-2xl font-bold">{documentStats.templatesActive}</p>
              </div>
              <Settings className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Document Generation
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Template Management
          </TabsTrigger>
          <TabsTrigger value="oversight" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Oversight
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <DocumentWorkspace
            userRole="admin"
            systemData={mockSystemData}
            onDocumentGenerated={handleDocumentGenerated}
            onDownload={handleDownload}
          />
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Template Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Manage document templates and form structures. Only admins can modify templates to maintain data integrity.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Active Templates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>NDA Standard</span>
                        <Badge variant="outline">Active</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Investment Agreement</span>
                        <Badge variant="outline">Active</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Service Agreement</span>
                        <Badge variant="outline">Active</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Template Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full" variant="outline">
                      Create New Template
                    </Button>
                    <Button className="w-full" variant="outline">
                      Edit Existing Template
                    </Button>
                    <Button className="w-full" variant="outline">
                      Archive Template
                    </Button>
                    <Button className="w-full" variant="outline">
                      Export Templates
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="oversight" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Document Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Entrepreneurs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">23</p>
                      <p className="text-sm text-muted-foreground">Active users</p>
                      <p className="text-sm text-muted-foreground">156 documents generated</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Investors</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">45</p>
                      <p className="text-sm text-muted-foreground">Active users</p>
                      <p className="text-sm text-muted-foreground">89 documents generated</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Service Providers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">12</p>
                      <p className="text-sm text-muted-foreground">Active users</p>
                      <p className="text-sm text-muted-foreground">34 documents generated</p>
                    </CardContent>
                  </Card>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold mb-2">Recent Document Activity</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <span>John Doe (Entrepreneur) - NDA generated</span>
                      <span className="text-sm text-muted-foreground">2 hours ago</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <span>Angel Investor LLC - Investment Agreement</span>
                      <span className="text-sm text-muted-foreground">4 hours ago</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <span>Legal Services Co. - Service Agreement</span>
                      <span className="text-sm text-muted-foreground">1 day ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDocumentWorkspace; 