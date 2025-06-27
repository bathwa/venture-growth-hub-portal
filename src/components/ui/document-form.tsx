import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Download, Eye, AlertCircle } from 'lucide-react';
import { DocumentForm, DocumentField, SystemData, generateDocument } from '@/lib/document-generator';

interface DocumentFormProps {
  form: DocumentForm;
  systemData: SystemData;
  onGenerate?: (content: string, variables: Record<string, string>) => void;
  onDownload?: (content: string, filename: string) => void;
  className?: string;
}

export default function DocumentFormComponent({
  form,
  systemData,
  onGenerate,
  onDownload,
  className
}: DocumentFormProps) {
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Initialize form with default values and system data
  useEffect(() => {
    const initialInputs: Record<string, string> = {};
    
    form.fields.forEach(field => {
      if (field.source === 'user_input' && field.defaultValue) {
        initialInputs[field.id] = field.defaultValue;
      } else if (field.source === 'system_data' && field.systemField) {
        const value = getSystemDataValue(field.systemField, systemData);
        if (value) {
          initialInputs[field.id] = value;
        }
      }
    });
    
    setUserInputs(initialInputs);
  }, [form, systemData]);

  const getSystemDataValue = (fieldPath: string, systemData: SystemData): string => {
    const parts = fieldPath.split('.');
    let current: any = systemData;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return '';
      }
    }

    if (fieldPath === 'current_date') {
      return new Date().toISOString().split('T')[0];
    }

    return current?.toString() || '';
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    setUserInputs(prev => ({
      ...prev,
      [fieldId]: value
    }));

    // Clear error for this field
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    form.fields.forEach(field => {
      const value = userInputs[field.id] || '';

      // Check required fields
      if (field.required && !value) {
        newErrors[field.id] = `${field.label} is required`;
        return;
      }

      // Validate field based on type
      if (value) {
        const validationError = validateField(field, value);
        if (validationError) {
          newErrors[field.id] = validationError;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateField = (field: DocumentField, value: string): string | null => {
    switch (field.type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return `${field.label} must be a valid email address`;
        }
        break;
      case 'number':
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          return `${field.label} must be a valid number`;
        }
        if (field.validation?.min && numValue < field.validation.min) {
          return `${field.label} must be at least ${field.validation.min}`;
        }
        if (field.validation?.max && numValue > field.validation.max) {
          return `${field.label} must be at most ${field.validation.max}`;
        }
        break;
      case 'date':
        const dateValue = new Date(value);
        if (isNaN(dateValue.getTime())) {
          return `${field.label} must be a valid date`;
        }
        break;
      case 'select':
        if (field.validation?.options && !field.validation.options.includes(value)) {
          return `${field.label} must be one of the available options`;
        }
        break;
    }

    return null;
  };

  const handleGenerate = async () => {
    if (!validateForm()) {
      return;
    }

    setIsGenerating(true);
    
    try {
      const result = generateDocument(form.id, userInputs, systemData);
      
      if (result.success && result.content) {
        setGeneratedContent(result.content);
        setShowPreview(true);
        
        if (onGenerate) {
          onGenerate(result.content, userInputs);
        }
      } else {
        setErrors({ general: result.errors?.join(', ') || 'Failed to generate document' });
      }
    } catch (error) {
      setErrors({ general: 'An error occurred while generating the document' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedContent && onDownload) {
      const filename = `${form.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.txt`;
      onDownload(generatedContent, filename);
    }
  };

  const renderField = (field: DocumentField) => {
    const value = userInputs[field.id] || '';
    const error = errors[field.id];
    const isSystemField = field.source === 'system_data';

    const fieldProps = {
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
        handleFieldChange(field.id, e.target.value),
      className: error ? 'border-red-500' : '',
      disabled: isSystemField,
      placeholder: isSystemField ? 'Auto-filled from system data' : `Enter ${field.label.toLowerCase()}`
    };

    return (
      <div key={field.id} className="space-y-2">
        <Label htmlFor={field.id} className="flex items-center gap-2">
          {field.label}
          {field.required && <span className="text-red-500">*</span>}
          {isSystemField && <Badge variant="outline" className="text-xs">Auto-filled</Badge>}
        </Label>
        
        {field.type === 'textarea' ? (
          <Textarea
            {...fieldProps}
            id={field.id}
            rows={4}
          />
        ) : field.type === 'select' ? (
          <Select
            value={value}
            onValueChange={(val) => handleFieldChange(field.id, val)}
            disabled={isSystemField}
          >
            <SelectTrigger className={error ? 'border-red-500' : ''}>
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.validation?.options?.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : field.type === 'date' ? (
          <Input
            {...fieldProps}
            id={field.id}
            type="date"
          />
        ) : field.type === 'number' ? (
          <Input
            {...fieldProps}
            id={field.id}
            type="number"
            min={field.validation?.min}
            max={field.validation?.max}
          />
        ) : field.type === 'email' ? (
          <Input
            {...fieldProps}
            id={field.id}
            type="email"
          />
        ) : field.type === 'currency' ? (
          <Input
            {...fieldProps}
            id={field.id}
            type="number"
            step="0.01"
            min="0"
          />
        ) : (
          <Input
            {...fieldProps}
            id={field.id}
            type="text"
          />
        )}
        
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Form Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6" />
            <div>
              <CardTitle>{form.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Fill in the required information to generate your document
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Error Alert */}
      {errors.general && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}

      {/* Form Fields */}
      <Card>
        <CardHeader>
          <CardTitle>Document Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {form.fields.map(renderField)}
          </div>

          <Separator />

          <div className="flex gap-3">
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Generate Document'}
            </Button>
            
            {generatedContent && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {showPreview && generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle>Document Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-6 bg-muted/50 min-h-[400px] whitespace-pre-wrap font-mono text-sm overflow-auto">
              {generatedContent}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 