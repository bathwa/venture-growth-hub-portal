import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Download, Copy, FileText, Eye } from 'lucide-react';
import { Template } from '@/lib/templates';
import TemplateBrowser from './template-browser';
import TemplatePreview from './template-preview';

interface TemplateWorkspaceProps {
  onGenerate?: (content: string, variables: Record<string, string>, template: Template) => void;
  onDownload?: (content: string, filename: string) => void;
  className?: string;
}

export default function TemplateWorkspace({
  onGenerate,
  onDownload,
  className
}: TemplateWorkspaceProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [activeTab, setActiveTab] = useState<'browse' | 'preview'>('browse');

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setActiveTab('preview');
  };

  const handleGenerate = (content: string, variables: Record<string, string>) => {
    if (onGenerate && selectedTemplate) {
      onGenerate(content, variables, selectedTemplate);
    }
  };

  const handleBackToBrowse = () => {
    setSelectedTemplate(null);
    setActiveTab('browse');
  };

  const getTemplateTypeColor = (type: string) => {
    switch (type) {
      case 'agreement':
        return 'bg-blue-100 text-blue-800';
      case 'report':
        return 'bg-green-100 text-green-800';
      case 'financial':
        return 'bg-purple-100 text-purple-800';
      case 'payment':
        return 'bg-orange-100 text-orange-800';
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
          <h2 className="text-3xl font-bold">Template Workspace</h2>
          <p className="text-muted-foreground">
            Browse, customize, and generate documents from templates
          </p>
        </div>
        {selectedTemplate && (
          <div className="flex items-center gap-2">
            <Badge className={getTemplateTypeColor(selectedTemplate.type)}>
              {selectedTemplate.type}
            </Badge>
            <Badge variant="outline">
              {selectedTemplate.variables.length} variables
            </Badge>
          </div>
        )}
      </div>

      {/* Navigation */}
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

      {/* Main Content */}
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
              onDownload={onDownload}
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

      {/* Quick Actions */}
      {selectedTemplate && (
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
                Browse More Templates
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveTab('preview')}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Preview Template
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 