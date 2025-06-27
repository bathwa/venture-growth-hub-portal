import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, FileText, Filter } from 'lucide-react';
import { Template, ALL_TEMPLATES, getTemplatesByType } from '@/lib/templates';

interface TemplateBrowserProps {
  onSelectTemplate: (template: Template) => void;
  selectedTemplate?: Template;
  className?: string;
}

export default function TemplateBrowser({
  onSelectTemplate,
  selectedTemplate,
  className
}: TemplateBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSubtype, setSelectedSubtype] = useState<string>('all');

  // Filter templates based on search and type
  const filteredTemplates = ALL_TEMPLATES.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || template.type === selectedType;
    const matchesSubtype = selectedSubtype === 'all' || template.subtype === selectedSubtype;
    
    return matchesSearch && matchesType && matchesSubtype;
  });

  // Get unique types and subtypes for filters
  const types = ['all', ...Array.from(new Set(ALL_TEMPLATES.map(t => t.type)))];
  const subtypes = ['all', ...Array.from(new Set(ALL_TEMPLATES.map(t => t.subtype)))];

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

  const getTemplateIcon = (type: string) => {
    switch (type) {
      case 'agreement':
        return '📄';
      case 'report':
        return '📊';
      case 'financial':
        return '💰';
      case 'payment':
        return '💳';
      case 'general':
        return '📝';
      default:
        return '📄';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Template Browser
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  {types.map(type => (
                    <SelectItem key={type} value={type}>
                      {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={selectedSubtype} onValueChange={setSelectedSubtype}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by subtype" />
                </SelectTrigger>
                <SelectContent>
                  {subtypes.map(subtype => (
                    <SelectItem key={subtype} value={subtype}>
                      {subtype === 'all' ? 'All Subtypes' : subtype.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results count */}
          <div className="text-sm text-muted-foreground">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
          </div>
        </CardContent>
      </Card>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <Card
            key={template.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedTemplate?.id === template.id
                ? 'ring-2 ring-primary bg-primary/5'
                : 'hover:border-primary/50'
            }`}
            onClick={() => onSelectTemplate(template)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getTemplateIcon(template.type)}</span>
                  <div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <Badge className={`text-xs ${getTemplateTypeColor(template.type)}`}>
                      {template.type}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {template.description}
              </p>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {template.variables.length} variables
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTemplate(template);
                  }}
                >
                  Use Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters to find the template you need.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 