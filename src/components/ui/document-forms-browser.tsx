import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, FileText, Filter } from 'lucide-react';
import { DocumentForm, getDocumentForms } from '@/lib/document-generator';

interface DocumentFormsBrowserProps {
  userRole: 'entrepreneur' | 'investor' | 'service_provider' | 'admin';
  context?: 'opportunity' | 'investment' | 'service' | 'general';
  onSelectForm: (form: DocumentForm) => void;
  selectedForm?: DocumentForm;
  className?: string;
}

export default function DocumentFormsBrowser({
  userRole,
  context,
  onSelectForm,
  selectedForm,
  className
}: DocumentFormsBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContext, setSelectedContext] = useState<string>(context || 'all');

  // Get available forms for the user
  const availableForms = getDocumentForms(userRole, selectedContext === 'all' ? undefined : selectedContext as any);

  // Filter forms based on search
  const filteredForms = availableForms.filter(form => 
    form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    form.context.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const getFormIcon = (context: string) => {
    switch (context) {
      case 'opportunity':
        return '📋';
      case 'investment':
        return '💰';
      case 'service':
        return '🔧';
      case 'general':
        return '📄';
      default:
        return '📄';
    }
  };

  const contexts = [
    { value: 'all', label: 'All Contexts' },
    { value: 'opportunity', label: 'Opportunity' },
    { value: 'investment', label: 'Investment' },
    { value: 'service', label: 'Service' },
    { value: 'general', label: 'General' }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Available Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Context Filter */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={selectedContext} onValueChange={setSelectedContext}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by context" />
                </SelectTrigger>
                <SelectContent>
                  {contexts.map(ctx => (
                    <SelectItem key={ctx.value} value={ctx.value}>
                      {ctx.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results count */}
          <div className="text-sm text-muted-foreground">
            {filteredForms.length} document{filteredForms.length !== 1 ? 's' : ''} available
          </div>
        </CardContent>
      </Card>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredForms.map((form) => (
          <Card
            key={form.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedForm?.id === form.id
                ? 'ring-2 ring-primary bg-primary/5'
                : 'hover:border-primary/50'
            }`}
            onClick={() => onSelectForm(form)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getFormIcon(form.context)}</span>
                  <div>
                    <CardTitle className="text-base">{form.name}</CardTitle>
                    <Badge className={`text-xs ${getContextColor(form.context)}`}>
                      {form.context}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {form.fields.length} field{form.fields.length !== 1 ? 's' : ''} to complete
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {form.fields.slice(0, 3).map(field => (
                      <Badge key={field.id} variant="outline" className="text-xs">
                        {field.type}
                      </Badge>
                    ))}
                    {form.fields.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{form.fields.length - 3}
                      </Badge>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectForm(form);
                    }}
                  >
                    Use Form
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {filteredForms.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No documents found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters to find the document you need.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 