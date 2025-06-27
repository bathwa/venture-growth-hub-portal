import React, { useState } from 'react';
import { Template, ALL_TEMPLATES } from '@/lib/templates';
import TemplateBrowser from './template-browser';
import TemplatePreview from './template-preview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Eye, ArrowLeft } from 'lucide-react';

interface UserTemplateWorkspaceProps {
  userRole: 'entrepreneur' | 'investor' | 'service_provider' | 'admin' | 'general';
  contextType?: 'agreement' | 'report' | 'financial' | 'payment' | 'general';
  onDocumentGenerated?: (content: string, variables: Record<string, string>, template: Template) => void;
  className?: string;
}

export default function UserTemplateWorkspace({
  userRole,
  contextType,
  onDocumentGenerated,
  className
}: UserTemplateWorkspaceProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [activeTab, setActiveTab] = useState<'browse' | 'preview'>('browse');

  // Filter templates by contextType and userRole
  const filteredTemplates = ALL_TEMPLATES.filter(template => {
    if (contextType && template.type !== contextType) return false;
    // Optionally, filter by userRole for more advanced logic
    // For now, all roles see all templates of the contextType
    return true;
  });

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setActiveTab('preview');
  };

  const handleGenerate = (content: string, variables: Record<string, string>) => {
    if (onDocumentGenerated && selectedTemplate) {
      onDocumentGenerated(content, variables, selectedTemplate);
    }
  };

  const handleBackToBrowse = () => {
    setSelectedTemplate(null);
    setActiveTab('browse');
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Generate Document</h2>
          <p className="text-muted-foreground">
            Browse and generate documents from system templates
          </p>
        </div>
      </div>

      {selectedTemplate && (
        <Card>
          <CardContent className="pt-6">
            <Button
              variant="outline"
              onClick={handleBackToBrowse}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Templates
            </Button>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'browse' | 'preview')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Browse Templates
          </TabsTrigger>
          <TabsTrigger 
            value="preview" 
            className="flex items-center gap-2"
            disabled={!selectedTemplate}
          >
            <Eye className="h-4 w-4" />
            Preview & Generate
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <TemplateBrowser
            onSelectTemplate={handleTemplateSelect}
            selectedTemplate={selectedTemplate}
          />
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          {selectedTemplate ? (
            <TemplatePreview
              template={selectedTemplate}
              onGenerate={handleGenerate}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No template selected</h3>
                <p className="text-muted-foreground mb-4">
                  Select a template from the browse tab to preview and generate documents.
                </p>
                <Button onClick={() => setActiveTab('browse')}>
                  Browse Templates
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 