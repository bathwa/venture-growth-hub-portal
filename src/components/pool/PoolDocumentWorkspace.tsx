import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { FileText, Download, Eye, Clock, CheckCircle, Building2 } from 'lucide-react';
import DocumentWorkspace from '@/components/ui/document-workspace';
import { SystemData } from '@/lib/document-generator';

// Mock system data for pool manager
const mockSystemData: SystemData = {
  user: {
    id: 'pool-manager-1',
    full_name: 'Sarah Johnson',
    email: 'sarah@venturefund.com',
    phone: '+1-555-0789',
    company_name: 'Venture Growth Fund I',
    role: 'pool_manager'
  },
  pool: {
    id: 'pool-1',
    name: 'Venture Growth Fund I',
    total_funds: 10000000,
    manager_name: 'Sarah Johnson'
  },
  opportunity: {
    id: 'opp-1',
    title: 'TechCorp Series A Funding',
    description: 'Innovative SaaS platform for business automation',
    funding_goal: 2000000,
    equity_offered: 15,
    company_name: 'TechCorp Inc.',
    entrepreneur_name: 'John Doe',
    created_at: '2024-01-15'
  }
};

const PoolDocumentWorkspace = () => {
  const [activeTab, setActiveTab] = useState('documents');
  const [documentHistory, setDocumentHistory] = useState([
    {
      id: 'doc-1',
      name: 'Pool Investment Agreement - TechCorp Inc.',
      type: 'Investment Agreement',
      status: 'completed',
      date: '2024-02-01',
      company: 'TechCorp Inc.',
      amount: '$2,000,000'
    },
    {
      id: 'doc-2',
      name: 'Pool Performance Report - Q1 2024',
      type: 'Performance Report',
      status: 'completed',
      date: '2024-03-31',
      company: 'Venture Growth Fund I',
      amount: 'Portfolio Report'
    },
    {
      id: 'doc-3',
      name: 'Pool Investment Agreement - StartupXYZ',
      type: 'Investment Agreement',
      status: 'pending',
      date: '2024-04-15',
      company: 'StartupXYZ',
      amount: '$1,500,000'
    }
  ]);

  const handleDocumentGenerated = (content: string, variables: Record<string, string>, form: any) => {
    console.log('Document generated:', { content, variables, form });
    
    // Add to document history
    const newDoc = {
      id: `doc-${Date.now()}`,
      name: `${form.name} - ${variables.company_name || 'New Company'}`,
      type: form.name,
      status: 'draft',
      date: new Date().toISOString().split('T')[0],
      company: variables.company_name || 'Pending',
      amount: variables.investment_amount ? `$${parseInt(variables.investment_amount).toLocaleString()}` : 'TBD'
    };
    
    setDocumentHistory(prev => [newDoc, ...prev]);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'draft':
        return <FileText className="h-4 w-4 text-blue-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'draft':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pool Document Management</h1>
          <p className="text-muted-foreground">
            Generate and manage investment pool documents and agreements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-purple-50 text-purple-700">
            Pool Manager Access
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pool Investments</p>
                <p className="text-2xl font-bold">{documentHistory.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Deals</p>
                <p className="text-2xl font-bold">
                  {documentHistory.filter(doc => doc.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">
                  {documentHistory.filter(doc => doc.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Pool Size</p>
                <p className="text-2xl font-bold">$10M</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Generate Documents
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Pool History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <DocumentWorkspace
            userRole="admin"
            context="investment"
            systemData={mockSystemData}
            onDocumentGenerated={handleDocumentGenerated}
            onDownload={handleDownload}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pool Document History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documentHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No pool documents yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Generate your first pool document to get started.
                    </p>
                    <Button onClick={() => setActiveTab('documents')}>
                      Generate Document
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documentHistory.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(doc.status)}
                          <div>
                            <h4 className="font-medium">{doc.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {doc.company} • {doc.amount} • {doc.date}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(doc.status)}>
                            {doc.status}
                          </Badge>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Information Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Available Documents for Pool Managers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold">Pool Management</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Pool Investment Agreements</li>
                <li>• Limited Partner Agreements</li>
                <li>• Fund Operating Documents</li>
                <li>• Investment Committee Reports</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Performance & Reporting</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Pool Performance Reports</li>
                <li>• Portfolio Company Reports</li>
                <li>• Financial Statements</li>
                <li>• Regulatory Filings</li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 text-purple-900">💡 Pool Management Tips</h4>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Pool documents include all LP and regulatory requirements</li>
              <li>• Investment amounts are validated against pool capacity</li>
              <li>• Performance reports are auto-generated from portfolio data</li>
              <li>• All documents maintain compliance with fund structure</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PoolDocumentWorkspace; 