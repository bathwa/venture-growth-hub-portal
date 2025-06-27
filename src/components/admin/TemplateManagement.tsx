import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Plus, Edit, Eye, Trash2, Download, Upload, Save } from 'lucide-react';
import { AgreementType, AgreementTemplate } from '@/lib/agreements';

interface TemplateManagementProps {
  className?: string;
}

export default function TemplateManagement({ className }: TemplateManagementProps) {
  const [templates, setTemplates] = useState<AgreementTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<AgreementTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewVariables, setPreviewVariables] = useState<Record<string, string>>({});

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockTemplates: AgreementTemplate[] = [
      {
        id: 'nda-001',
        name: 'Standard NDA',
        agreement_type: 'nda',
        content: `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement (the "Agreement") is entered into as of {{date}} by and between:

{{party1_name}} ("Disclosing Party")
{{party2_name}} ("Receiving Party")

1. CONFIDENTIAL INFORMATION
The Receiving Party acknowledges that it may receive confidential and proprietary information from the Disclosing Party.

2. NON-DISCLOSURE
The Receiving Party agrees to maintain the confidentiality of all confidential information and not to disclose it to any third party.

3. TERM
This Agreement shall remain in effect for {{duration}} from the date of execution.

4. GOVERNING LAW
This Agreement shall be governed by the laws of {{jurisdiction}}.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.

{{party1_name}}                    {{party2_name}}
_________________                  _________________
Signature                          Signature`,
        variables: ['date', 'party1_name', 'party2_name', 'duration', 'jurisdiction'],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'investment-001',
        name: 'Investment Agreement',
        agreement_type: 'investment_agreement',
        content: `INVESTMENT AGREEMENT

This Investment Agreement (the "Agreement") is made as of {{date}} between:

{{company_name}} ("Company")
{{investor_name}} ("Investor")

1. INVESTMENT
The Investor agrees to invest {{investment_amount}} in exchange for {{equity_percentage}}% equity in the Company.

2. CLOSING
The closing of this investment shall occur on {{closing_date}}.

3. REPRESENTATIONS
Each party represents that it has the authority to enter into this Agreement.

4. GOVERNING LAW
This Agreement shall be governed by the laws of {{jurisdiction}}.

IN WITNESS WHEREOF, the parties have executed this Agreement.

{{company_name}}                   {{investor_name}}
_________________                  _________________
Signature                          Signature`,
        variables: ['date', 'company_name', 'investor_name', 'investment_amount', 'equity_percentage', 'closing_date', 'jurisdiction'],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    setTemplates(mockTemplates);
  }, []);

  const handleCreateTemplate = () => {
    const newTemplate: AgreementTemplate = {
      id: `template-${Date.now()}`,
      name: 'New Template',
      agreement_type: 'nda',
      content: '',
      variables: [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setSelectedTemplate(newTemplate);
    setIsEditing(true);
  };

  const handleSaveTemplate = () => {
    if (!selectedTemplate) return;

    if (isEditing) {
      // Update existing template
      setTemplates(prev => 
        prev.map(t => t.id === selectedTemplate.id ? selectedTemplate : t)
      );
    } else {
      // Add new template
      setTemplates(prev => [...prev, selectedTemplate]);
    }
    
    setIsEditing(false);
    setSelectedTemplate(null);
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
    if (selectedTemplate?.id === templateId) {
      setSelectedTemplate(null);
      setIsEditing(false);
    }
  };

  const handlePreviewTemplate = (template: AgreementTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewing(true);
    // Initialize preview variables
    const vars: Record<string, string> = {};
    template.variables.forEach(v => {
      vars[v] = `[${v}]`;
    });
    setPreviewVariables(vars);
  };

  const generatePreview = (template: AgreementTemplate, variables: Record<string, string>) => {
    let content = template.content;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, value);
    });
    return content;
  };

  const extractVariables = (content: string): string[] => {
    const regex = /\{\{([^}]+)\}\}/g;
    const variables = new Set<string>();
    let match;
    while ((match = regex.exec(content)) !== null) {
      variables.add(match[1]);
    }
    return Array.from(variables);
  };

  const handleContentChange = (content: string) => {
    if (!selectedTemplate) return;
    
    const variables = extractVariables(content);
    setSelectedTemplate({
      ...selectedTemplate,
      content,
      variables,
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Template Management</h2>
        <Button onClick={handleCreateTemplate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Template
        </Button>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Template List */}
            <Card>
              <CardHeader>
                <CardTitle>Templates ({templates.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="font-semibold">{template.name}</h3>
                        <div className="flex gap-2">
                          <Badge variant="outline">{template.agreement_type}</Badge>
                          <Badge variant={template.is_active ? "default" : "secondary"}>
                            {template.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {template.variables.length} variables
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreviewTemplate(template);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTemplate(template);
                            setIsEditing(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTemplate(template.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Template Editor */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {isEditing ? 'Edit Template' : selectedTemplate ? 'Template Details' : 'Select a Template'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedTemplate ? (
                  <>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="template-name">Template Name</Label>
                        <Input
                          id="template-name"
                          value={selectedTemplate.name}
                          onChange={(e) => setSelectedTemplate({
                            ...selectedTemplate,
                            name: e.target.value
                          })}
                          disabled={!isEditing}
                        />
                      </div>

                      <div>
                        <Label htmlFor="template-type">Agreement Type</Label>
                        <Select
                          value={selectedTemplate.agreement_type}
                          onValueChange={(value: AgreementType) => setSelectedTemplate({
                            ...selectedTemplate,
                            agreement_type: value
                          })}
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="nda">NDA</SelectItem>
                            <SelectItem value="investment_agreement">Investment Agreement</SelectItem>
                            <SelectItem value="service_agreement">Service Agreement</SelectItem>
                            <SelectItem value="partnership_agreement">Partnership Agreement</SelectItem>
                            <SelectItem value="escrow_agreement">Escrow Agreement</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="template-active"
                          checked={selectedTemplate.is_active}
                          onCheckedChange={(checked) => setSelectedTemplate({
                            ...selectedTemplate,
                            is_active: checked
                          })}
                          disabled={!isEditing}
                        />
                        <Label htmlFor="template-active">Active</Label>
                      </div>

                      <Separator />

                      <div>
                        <Label htmlFor="template-content">Template Content</Label>
                        <Textarea
                          id="template-content"
                          value={selectedTemplate.content}
                          onChange={(e) => handleContentChange(e.target.value)}
                          disabled={!isEditing}
                          className="min-h-[300px] font-mono text-sm"
                          placeholder="Enter template content with variables like {{variable_name}}"
                        />
                      </div>

                      <div>
                        <Label>Variables</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedTemplate.variables.map((variable) => (
                            <Badge key={variable} variant="outline">
                              {`{{${variable}}}`}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {isEditing && (
                        <div className="flex gap-2">
                          <Button onClick={handleSaveTemplate} className="flex items-center gap-2">
                            <Save className="h-4 w-4" />
                            Save Template
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsEditing(false);
                              setSelectedTemplate(null);
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Select a template to view or edit
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          {isPreviewing && selectedTemplate ? (
            <Card>
              <CardHeader>
                <CardTitle>Template Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Variables Input */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Fill Variables</h3>
                    {selectedTemplate.variables.map((variable) => (
                      <div key={variable}>
                        <Label htmlFor={`var-${variable}`}>{variable}</Label>
                        <Input
                          id={`var-${variable}`}
                          value={previewVariables[variable] || ''}
                          onChange={(e) => setPreviewVariables(prev => ({
                            ...prev,
                            [variable]: e.target.value
                          }))}
                          placeholder={`Enter ${variable}`}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Preview Output */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Preview</h3>
                    <div className="border rounded-lg p-4 bg-muted/50 min-h-[400px] whitespace-pre-wrap font-mono text-sm">
                      {generatePreview(selectedTemplate, previewVariables)}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsPreviewing(false)}
                  >
                    Close Preview
                  </Button>
                  <Button className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Select a template to preview
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 