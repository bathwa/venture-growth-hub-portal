import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Download, Copy, Eye, FileText } from 'lucide-react';
import { Template, generateFromTemplate } from '@/lib/templates';

interface TemplatePreviewProps {
  template: Template;
  onGenerate?: (content: string, variables: Record<string, string>) => void;
  onDownload?: (content: string, filename: string) => void;
  className?: string;
}

export default function TemplatePreview({
  template,
  onGenerate,
  onDownload,
  className
}: TemplatePreviewProps) {
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [previewContent, setPreviewContent] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'variables' | 'preview'>('variables');

  // Initialize variables with placeholders
  useEffect(() => {
    const initialVariables: Record<string, string> = {};
    template.variables.forEach(variable => {
      initialVariables[variable] = `[${variable}]`;
    });
    setVariables(initialVariables);
  }, [template]);

  // Generate preview content when variables change
  useEffect(() => {
    const content = generateFromTemplate(template.id, variables);
    setPreviewContent(content);
  }, [template, variables]);

  const handleVariableChange = (variable: string, value: string) => {
    setVariables(prev => ({
      ...prev,
      [variable]: value
    }));
  };

  const handleGenerate = () => {
    if (onGenerate) {
      onGenerate(previewContent, variables);
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      const filename = `${template.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.txt`;
      onDownload(previewContent, filename);
    } else {
      // Default download behavior
      const blob = new Blob([previewContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(previewContent);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
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
    <div className={`space-y-4 ${className}`}>
      {/* Template Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <CardTitle className="text-xl">{template.name}</CardTitle>
              <p className="text-muted-foreground">{template.description}</p>
              <div className="flex gap-2">
                <Badge className={getTemplateTypeColor(template.type)}>
                  {template.type}
                </Badge>
                <Badge variant="outline">
                  {template.variables.length} variables
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyToClipboard}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
              <Button
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Template Content */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'variables' | 'preview')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="variables" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Fill Variables
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="variables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Template Variables</CardTitle>
              <p className="text-sm text-muted-foreground">
                Fill in the variables below to generate your document
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {template.variables.map((variable) => (
                  <div key={variable} className="space-y-2">
                    <label className="text-sm font-medium">
                      {variable.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </label>
                    {variable.includes('description') || variable.includes('summary') || 
                     variable.includes('notes') || variable.includes('discussion') ? (
                      <Textarea
                        value={variables[variable] || ''}
                        onChange={(e) => handleVariableChange(variable, e.target.value)}
                        placeholder={`Enter ${variable.replace(/_/g, ' ')}`}
                        className="min-h-[80px]"
                      />
                    ) : (
                      <Input
                        value={variables[variable] || ''}
                        onChange={(e) => handleVariableChange(variable, e.target.value)}
                        placeholder={`Enter ${variable.replace(/_/g, ' ')}`}
                      />
                    )}
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button onClick={handleGenerate} className="flex items-center gap-2">
                  Generate Document
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('preview')}
                  className="flex items-center gap-2"
                >
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Preview</CardTitle>
              <p className="text-sm text-muted-foreground">
                Preview your generated document
              </p>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 bg-muted/50 min-h-[500px] whitespace-pre-wrap font-mono text-sm overflow-auto">
                {previewContent || 'Fill in the variables to see the preview...'}
              </div>

              <div className="flex gap-2 mt-4">
                <Button onClick={handleGenerate} className="flex items-center gap-2">
                  Generate Document
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCopyToClipboard}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 