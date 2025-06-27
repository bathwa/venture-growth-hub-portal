// Document Generator
// Merges templates with specific system data fields for controlled document generation

import { Template, generateFromTemplate } from './templates';
import { AgreementType } from './agreements';

export interface DocumentField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'email' | 'phone' | 'currency';
  required: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
  source?: 'user_input' | 'system_data' | 'calculated';
  systemField?: string; // Maps to system data field
  defaultValue?: string;
}

export interface DocumentForm {
  id: string;
  name: string;
  templateId: string;
  fields: DocumentField[];
  userRole: 'entrepreneur' | 'investor' | 'service_provider' | 'admin';
  context: 'opportunity' | 'investment' | 'service' | 'general';
  isActive: boolean;
}

export interface SystemData {
  opportunity?: {
    id: string;
    title: string;
    description: string;
    funding_goal: number;
    equity_offered: number;
    company_name: string;
    entrepreneur_name: string;
    created_at: string;
  };
  investment?: {
    id: string;
    amount: number;
    equity_percentage: number;
    investor_name: string;
    investment_date: string;
    status: string;
  };
  user?: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    company_name?: string;
    role: string;
  };
  pool?: {
    id: string;
    name: string;
    total_funds: number;
    manager_name: string;
  };
}

export class DocumentGenerator {
  private forms: DocumentForm[] = [];

  constructor() {
    this.initializeDefaultForms();
  }

  private initializeDefaultForms() {
    // NDA Form for Entrepreneurs
    this.forms.push({
      id: 'nda-entrepreneur',
      name: 'Non-Disclosure Agreement',
      templateId: 'nda-standard',
      userRole: 'entrepreneur',
      context: 'opportunity',
      isActive: true,
      fields: [
        {
          id: 'disclosing_party',
          label: 'Your Company Name',
          type: 'text',
          required: true,
          source: 'user_input',
          defaultValue: ''
        },
        {
          id: 'receiving_party',
          label: 'Receiving Party Name',
          type: 'text',
          required: true,
          source: 'user_input',
          defaultValue: ''
        },
        {
          id: 'purpose',
          label: 'Purpose of Disclosure',
          type: 'textarea',
          required: true,
          source: 'user_input',
          defaultValue: 'Investment evaluation and due diligence'
        },
        {
          id: 'duration',
          label: 'Agreement Duration',
          type: 'select',
          required: true,
          source: 'user_input',
          validation: {
            options: ['1 year', '2 years', '3 years', '5 years', 'Indefinite']
          },
          defaultValue: '2 years'
        },
        {
          id: 'jurisdiction',
          label: 'Governing Law Jurisdiction',
          type: 'text',
          required: true,
          source: 'user_input',
          defaultValue: 'United States'
        },
        {
          id: 'date',
          label: 'Agreement Date',
          type: 'date',
          required: true,
          source: 'system_data',
          systemField: 'current_date'
        }
      ]
    });

    // Investment Agreement Form for Investors
    this.forms.push({
      id: 'investment-agreement-investor',
      name: 'Investment Agreement',
      templateId: 'investment-agreement',
      userRole: 'investor',
      context: 'investment',
      isActive: true,
      fields: [
        {
          id: 'company_name',
          label: 'Company Name',
          type: 'text',
          required: true,
          source: 'system_data',
          systemField: 'opportunity.company_name'
        },
        {
          id: 'company_type',
          label: 'Company Type',
          type: 'select',
          required: true,
          source: 'user_input',
          validation: {
            options: ['Corporation', 'LLC', 'Partnership', 'Sole Proprietorship']
          },
          defaultValue: 'Corporation'
        },
        {
          id: 'investor_name',
          label: 'Investor Name',
          type: 'text',
          required: true,
          source: 'system_data',
          systemField: 'user.full_name'
        },
        {
          id: 'investment_amount',
          label: 'Investment Amount',
          type: 'currency',
          required: true,
          source: 'system_data',
          systemField: 'investment.amount'
        },
        {
          id: 'equity_percentage',
          label: 'Equity Percentage',
          type: 'number',
          required: true,
          source: 'system_data',
          systemField: 'investment.equity_percentage'
        },
        {
          id: 'closing_date',
          label: 'Closing Date',
          type: 'date',
          required: true,
          source: 'user_input',
          defaultValue: ''
        },
        {
          id: 'use_of_funds',
          label: 'Use of Funds',
          type: 'textarea',
          required: true,
          source: 'user_input',
          defaultValue: ''
        },
        {
          id: 'jurisdiction',
          label: 'Governing Law',
          type: 'text',
          required: true,
          source: 'user_input',
          defaultValue: 'United States'
        },
        {
          id: 'date',
          label: 'Agreement Date',
          type: 'date',
          required: true,
          source: 'system_data',
          systemField: 'current_date'
        }
      ]
    });

    // Service Agreement Form for Service Providers
    this.forms.push({
      id: 'service-agreement-provider',
      name: 'Service Agreement',
      templateId: 'service-agreement',
      userRole: 'service_provider',
      context: 'service',
      isActive: true,
      fields: [
        {
          id: 'service_provider',
          label: 'Service Provider Name',
          type: 'text',
          required: true,
          source: 'system_data',
          systemField: 'user.full_name'
        },
        {
          id: 'client',
          label: 'Client Name',
          type: 'text',
          required: true,
          source: 'user_input',
          defaultValue: ''
        },
        {
          id: 'services_description',
          label: 'Services Description',
          type: 'textarea',
          required: true,
          source: 'user_input',
          defaultValue: ''
        },
        {
          id: 'start_date',
          label: 'Start Date',
          type: 'date',
          required: true,
          source: 'user_input',
          defaultValue: ''
        },
        {
          id: 'end_date',
          label: 'End Date',
          type: 'date',
          required: true,
          source: 'user_input',
          defaultValue: ''
        },
        {
          id: 'compensation_amount',
          label: 'Compensation Amount',
          type: 'currency',
          required: true,
          source: 'user_input',
          defaultValue: ''
        },
        {
          id: 'payment_terms',
          label: 'Payment Terms',
          type: 'select',
          required: true,
          source: 'user_input',
          validation: {
            options: ['Net 30', 'Net 60', 'Net 90', 'Upon completion', 'Monthly', 'Weekly']
          },
          defaultValue: 'Net 30'
        },
        {
          id: 'notice_period',
          label: 'Notice Period for Termination',
          type: 'select',
          required: true,
          source: 'user_input',
          validation: {
            options: ['30 days', '60 days', '90 days', 'Immediate']
          },
          defaultValue: '30 days'
        },
        {
          id: 'date',
          label: 'Agreement Date',
          type: 'date',
          required: true,
          source: 'system_data',
          systemField: 'current_date'
        }
      ]
    });
  }

  // Get forms for a specific user role and context
  getForms(userRole: string, context?: string): DocumentForm[] {
    return this.forms.filter(form => 
      form.userRole === userRole && 
      form.isActive &&
      (!context || form.context === context)
    );
  }

  // Get a specific form by ID
  getForm(formId: string): DocumentForm | undefined {
    return this.forms.find(form => form.id === formId);
  }

  // Generate document from form and data
  generateDocument(
    formId: string, 
    userInputs: Record<string, string>, 
    systemData: SystemData
  ): { success: boolean; content?: string; errors?: string[] } {
    const form = this.getForm(formId);
    if (!form) {
      return { success: false, errors: ['Form not found'] };
    }

    const errors: string[] = [];
    const variables: Record<string, string> = {};

    // Process each field
    form.fields.forEach(field => {
      let value = '';

      if (field.source === 'user_input') {
        value = userInputs[field.id] || field.defaultValue || '';
      } else if (field.source === 'system_data') {
        value = this.getSystemDataValue(field.systemField!, systemData) || field.defaultValue || '';
      } else if (field.source === 'calculated') {
        value = this.calculateFieldValue(field.id, userInputs, systemData) || field.defaultValue || '';
      }

      // Validate required fields
      if (field.required && !value) {
        errors.push(`${field.label} is required`);
      }

      // Validate field based on type and validation rules
      const validationError = this.validateField(field, value);
      if (validationError) {
        errors.push(validationError);
      }

      variables[field.id] = value;
    });

    if (errors.length > 0) {
      return { success: false, errors };
    }

    // Generate document from template
    const content = generateFromTemplate(form.templateId, variables);
    
    return { success: true, content };
  }

  private getSystemDataValue(fieldPath: string, systemData: SystemData): string {
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
  }

  private calculateFieldValue(
    fieldId: string, 
    userInputs: Record<string, string>, 
    systemData: SystemData
  ): string {
    // Add calculation logic for computed fields
    switch (fieldId) {
      case 'total_investment':
        return (systemData.investment?.amount || 0).toString();
      case 'equity_value':
        const amount = systemData.investment?.amount || 0;
        const percentage = systemData.investment?.equity_percentage || 0;
        return ((amount * percentage) / 100).toString();
      default:
        return '';
    }
  }

  private validateField(field: DocumentField, value: string): string | null {
    if (!value) return null;

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
  }

  // Auto-generate reports from system data
  generateReport(
    reportType: string, 
    systemData: SystemData,
    additionalData?: Record<string, any>
  ): { success: boolean; content?: string; errors?: string[] } {
    const template = this.getReportTemplate(reportType);
    if (!template) {
      return { success: false, errors: ['Report template not found'] };
    }

    const variables = this.extractReportVariables(template, systemData, additionalData);
    const content = generateFromTemplate(template.id, variables);

    return { success: true, content };
  }

  private getReportTemplate(reportType: string): Template | undefined {
    // This would fetch from templates library
    const reportTemplates = [
      { id: 'investment-journey-report', type: 'investment_journey' },
      { id: 'due-diligence-report', type: 'due_diligence' }
    ];

    const template = reportTemplates.find(t => t.type === reportType);
    return template as any; // Simplified for now
  }

  private extractReportVariables(
    template: Template, 
    systemData: SystemData, 
    additionalData?: Record<string, any>
  ): Record<string, string> {
    const variables: Record<string, string> = {};

    // Map system data to template variables
    if (systemData.opportunity) {
      variables.opportunity_name = systemData.opportunity.title;
      variables.company_name = systemData.opportunity.company_name;
      variables.investment_amount = systemData.opportunity.funding_goal.toString();
    }

    if (systemData.investment) {
      variables.investment_date = systemData.investment.investment_date;
      variables.current_status = systemData.investment.status;
    }

    if (systemData.user) {
      variables.prepared_by = systemData.user.full_name;
    }

    // Add current date
    variables.generated_date = new Date().toISOString().split('T')[0];
    variables.report_period = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });

    // Add additional data
    if (additionalData) {
      Object.assign(variables, additionalData);
    }

    return variables;
  }
}

// Export singleton instance
export const documentGenerator = new DocumentGenerator();

// Helper functions
export const getDocumentForms = (userRole: string, context?: string) => 
  documentGenerator.getForms(userRole, context);

export const generateDocument = (
  formId: string, 
  userInputs: Record<string, string>, 
  systemData: SystemData
) => documentGenerator.generateDocument(formId, userInputs, systemData);

export const generateReport = (
  reportType: string, 
  systemData: SystemData,
  additionalData?: Record<string, any>
) => documentGenerator.generateReport(reportType, systemData, additionalData); 