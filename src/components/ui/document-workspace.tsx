import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, FileText, Eye, Download } from 'lucide-react';
import { DocumentForm, SystemData } from '@/lib/document-generator';
import DocumentFormsBrowser from './document-forms-browser';
import DocumentFormComponent from './document-form';

interface DocumentWorkspaceProps {
  userRole: 'entrepreneur' | 'investor' | 'service_provider' | 'admin';
  context?: 'opportunity' | 'investment' | 'service' | 'general';
  systemData: SystemData;
  onDocumentGenerated?: (content: string, variables: Record<string, string>, form: DocumentForm) => void;
  onDownload?: (content: string, filename: string) => void;
  className?: string;
}

export default function DocumentWorkspace({
  userRole,
  context,
  systemData,
  onDocumentGenerated,
  onDownload,
  className
}: DocumentWorkspaceProps) {
  const [selectedForm, setSelectedForm] = useState<DocumentForm | null>(null);
  const [activeTab, setActiveTab] = useState<'browse' | 'form'>('browse');

  const handleFormSelect = (form: DocumentForm) => {
    setSelectedForm(form);
    setActiveTab('form');
  };

  const handleBackToBrowse = () => {
    setSelectedForm(null);
    setActiveTab('browse');
  };

  const handleDocumentGenerated = (content: string, variables: Record<string, string>) => {
    if (onDocumentGenerated && selectedForm) {
      onDocumentGenerated(content, variables, selectedForm);
    }
  };

  const getContextColor = (context: string) => {
    switch (context) {
      case 'opportunity':
        return 'bg-blue-100 text-blue-800';
      case 'investment':
        return 'bg-green-100 text-green-800';
      case 'service':
        return 'bg-purple-100 text-purple-800';
      case 'general':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Document Generation</h2>
          <p className="text-muted-foreground">
            Generate documents with controlled access and system data integration
          </p>
        </div>
        {selectedForm && (
          <div className="flex items-center gap-2">
            <Badge className={getContextColor(selectedForm.context)}>
              {selectedForm.context}
            </Badge>
            <Badge variant="outline">
              {selectedForm.fields.length} fields
            </Badge>
          </div>
        )}
      </div>

      {/* Navigation */}
      {selectedForm && (
        <Card>
          <CardContent className="pt-6">
            <Button
              variant="outline"
              onClick={handleBackToBrowse}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Documents
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'browse' | 'form')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Browse Documents
          </TabsTrigger>
          <TabsTrigger 
            value="form" 
            className="flex items-center gap-2"
            disabled={!selectedForm}
          >
            <Eye className="h-4 w-4" />
            Fill Form
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <DocumentFormsBrowser
            userRole={userRole}
            context={context}
            onSelectForm={handleFormSelect}
            selectedForm={selectedForm}
          />
        </TabsContent>

        <TabsContent value="form" className="space-y-4">
          {selectedForm ? (
            <DocumentFormComponent
              form={selectedForm}
              systemData={systemData}
              onGenerate={handleDocumentGenerated}
              onDownload={onDownload}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No document selected</h3>
                <p className="text-muted-foreground mb-4">
                  Select a document from the browse tab to fill out the form.
                </p>
                <Button onClick={() => setActiveTab('browse')}>
                  Browse Documents
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      {selectedForm && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setActiveTab('browse')}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Browse More Documents
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveTab('form')}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Fill Form
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information Panel */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">1</span>
              </div>
              <h4 className="font-semibold">Browse Documents</h4>
              <p className="text-sm text-muted-foreground">
                Select from available document templates based on your role and context.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">2</span>
              </div>
              <h4 className="font-semibold">Fill Required Fields</h4>
              <p className="text-sm text-muted-foreground">
                Complete the form with your information. System data is auto-filled where applicable.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">3</span>
              </div>
              <h4 className="font-semibold">Generate & Download</h4>
              <p className="text-sm text-muted-foreground">
                Generate your document and download it for use or submission.
              </p>
            </div>
          </div>
          
          <Separator />
          
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Security & Control</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Templates are admin-controlled and cannot be modified by users</li>
              <li>• System data is automatically integrated to prevent tampering</li>
              <li>• All generated documents are tracked and auditable</li>
              <li>• Role-based access ensures users only see relevant documents</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 