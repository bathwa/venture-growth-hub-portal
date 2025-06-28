// Agreements Module
// Aligned with the new Supabase schema using agreement_status and agreement_type enums

import { supabase } from '@/integrations/supabase/client';

export type AgreementStatus = 'draft' | 'pending' | 'signed' | 'expired' | 'terminated';
export type AgreementType = 'nda' | 'investment_agreement' | 'service_agreement' | 'partnership_agreement' | 'escrow_agreement';

export interface Agreement {
  id: string;
  title: string;
  agreement_type: AgreementType;
  content: string;
  status: AgreementStatus;
  parties: string[]; // Array of user IDs
  signed_by: string[]; // Array of user IDs who have signed
  created_by: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  template_id?: string;
}

export interface AgreementParty {
  id: string;
  name: string;
  role: 'entrepreneur' | 'investor' | 'pool' | 'service_provider' | 'incubator' | 'accelerator' | 'advisor' | 'creditor' | 'partner' | 'employee' | 'other';
  type: 'individual' | 'company' | 'partnership' | 'trust' | 'foundation';
  email?: string;
  phone?: string;
  address?: string;
  registration_number?: string;
  tax_id?: string;
  signature_authority?: string;
  percentage_ownership?: number;
  investment_amount?: number;
  responsibilities?: string[];
  rights?: string[];
  obligations?: string[];
}

export interface AgreementTemplate {
  id: string;
  name: string;
  description: string;
  category: 'investment' | 'nda' | 'partnership' | 'service' | 'employment' | 'pool' | 'escrow' | 'other';
  parties: AgreementParty[];
  variables: AgreementVariable[];
  sections: AgreementSection[];
  conditions: AgreementCondition[];
  is_customizable: boolean;
  requires_signatures: boolean;
  auto_generate: boolean;
  content: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AgreementVariable {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'currency' | 'percentage' | 'email' | 'phone' | 'address' | 'select' | 'multiselect' | 'boolean';
  required: boolean;
  default_value?: any;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: string;
  };
  placeholder?: string;
  help_text?: string;
}

export interface AgreementSection {
  id: string;
  title: string;
  content: string;
  order: number;
  is_required: boolean;
  is_customizable: boolean;
  variables: string[]; // Variable keys used in this section
}

export interface AgreementCondition {
  id: string;
  name: string;
  description: string;
  trigger: 'on_signature' | 'on_funding' | 'on_milestone' | 'on_date' | 'manual';
  conditions: {
    field: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'exists' | 'not_exists';
    value: any;
  }[];
  actions: {
    type: 'notify' | 'release_funds' | 'update_status' | 'create_task' | 'send_document' | 'trigger_workflow';
    target: string;
    parameters: Record<string, any>;
  }[];
}

export interface GeneratedAgreement {
  id: string;
  template_id: string;
  title: string;
  parties: AgreementParty[];
  variables: Record<string, any>;
  content: string;
  status: 'draft' | 'pending_signature' | 'signed' | 'active' | 'completed' | 'terminated';
  created_at: string;
  updated_at: string;
  signed_at?: string;
  expires_at?: string;
  opportunity_id?: string;
  pool_id?: string;
  escrow_id?: string;
  signatures: AgreementSignature[];
  conditions_met: string[];
  conditions_pending: string[];
}

export interface AgreementSignature {
  party_id: string;
  party_name: string;
  party_role: string;
  signed_at: string;
  ip_address?: string;
  user_agent?: string;
  signature_method: 'electronic' | 'digital' | 'manual';
  signature_data?: string;
}

// Default agreement templates
export const DEFAULT_AGREEMENT_TEMPLATES: AgreementTemplate[] = [
  {
    id: 'investment-agreement',
    name: 'Investment Agreement',
    description: 'Standard investment agreement between parties',
    category: 'investment',
    parties: [
      {
        id: 'entrepreneur',
        name: 'Entrepreneur/Company',
        role: 'entrepreneur',
        type: 'company',
        responsibilities: ['Provide business plan', 'Meet milestones', 'Provide regular updates'],
        rights: ['Receive investment', 'Use funds for business purposes'],
        obligations: ['Diligent business operation', 'Transparency', 'Compliance']
      },
      {
        id: 'investor',
        name: 'Investor',
        role: 'investor',
        type: 'individual',
        responsibilities: ['Provide investment capital', 'Support business growth'],
        rights: ['Receive equity/returns', 'Access to information', 'Voting rights'],
        obligations: ['Timely funding', 'Confidentiality', 'No interference']
      }
    ],
    variables: [
      {
        key: 'company_name',
        label: 'Company Name',
        type: 'text',
        required: true,
        placeholder: 'Enter company name'
      },
      {
        key: 'investment_amount',
        label: 'Investment Amount',
        type: 'currency',
        required: true,
        validation: { min: 1000 }
      },
      {
        key: 'equity_percentage',
        label: 'Equity Percentage',
        type: 'percentage',
        required: true,
        validation: { min: 0, max: 100 }
      },
      {
        key: 'investment_date',
        label: 'Investment Date',
        type: 'date',
        required: true
      },
      {
        key: 'business_description',
        label: 'Business Description',
        type: 'text',
        required: true,
        placeholder: 'Describe the business and investment purpose'
      }
    ],
    sections: [
      {
        id: 'preamble',
        title: 'Preamble',
        content: 'This Investment Agreement (the "Agreement") is entered into on {investment_date} between {company_name} (the "Company") and the Investor(s) listed below.',
        order: 1,
        is_required: true,
        is_customizable: false,
        variables: ['investment_date', 'company_name']
      },
      {
        id: 'investment_terms',
        title: 'Investment Terms',
        content: 'The Investor agrees to invest {investment_amount} in exchange for {equity_percentage}% equity in the Company.',
        order: 2,
        is_required: true,
        is_customizable: true,
        variables: ['investment_amount', 'equity_percentage']
      },
      {
        id: 'business_purpose',
        title: 'Business Purpose',
        content: 'The investment will be used for: {business_description}',
        order: 3,
        is_required: true,
        is_customizable: true,
        variables: ['business_description']
      }
    ],
    conditions: [
      {
        id: 'funding_release',
        name: 'Funding Release',
        description: 'Release funds upon agreement signature',
        trigger: 'on_signature',
        conditions: [
          { field: 'status', operator: 'equals', value: 'signed' }
        ],
        actions: [
          {
            type: 'release_funds',
            target: 'escrow_account',
            parameters: { amount: '{investment_amount}' }
          }
        ]
      }
    ],
    is_customizable: true,
    requires_signatures: true,
    auto_generate: true,
    content: '',
    created_by: '',
    created_at: '',
    updated_at: ''
  },
  {
    id: 'nda-agreement',
    name: 'Non-Disclosure Agreement',
    description: 'Confidentiality agreement between parties',
    category: 'nda',
    parties: [
      {
        id: 'disclosing_party',
        name: 'Disclosing Party',
        role: 'entrepreneur',
        type: 'company',
        responsibilities: ['Provide confidential information'],
        rights: ['Protection of confidential information'],
        obligations: ['Mark information as confidential']
      },
      {
        id: 'receiving_party',
        name: 'Receiving Party',
        role: 'investor',
        type: 'individual',
        responsibilities: ['Protect confidential information'],
        rights: ['Use information for evaluation purposes'],
        obligations: ['Maintain confidentiality', 'Return or destroy information']
      }
    ],
    variables: [
      {
        key: 'confidential_period',
        label: 'Confidentiality Period (months)',
        type: 'number',
        required: true,
        default_value: 24,
        validation: { min: 1, max: 120 }
      },
      {
        key: 'purpose',
        label: 'Purpose of Disclosure',
        type: 'text',
        required: true,
        placeholder: 'e.g., Investment evaluation, partnership discussions'
      }
    ],
    sections: [
      {
        id: 'confidentiality_obligation',
        title: 'Confidentiality Obligation',
        content: 'The Receiving Party agrees to maintain the confidentiality of all information disclosed by the Disclosing Party for a period of {confidential_period} months from the date of disclosure.',
        order: 1,
        is_required: true,
        is_customizable: true,
        variables: ['confidential_period']
      }
    ],
    conditions: [],
    is_customizable: true,
    requires_signatures: true,
    auto_generate: true,
    content: '',
    created_by: '',
    created_at: '',
    updated_at: ''
  },
  {
    id: 'pool-investment-agreement',
    name: 'Pool Investment Agreement',
    description: 'Agreement for pooled investment with multiple investors',
    category: 'pool',
    parties: [
      {
        id: 'pool_manager',
        name: 'Pool Manager',
        role: 'pool',
        type: 'individual',
        responsibilities: ['Manage pooled funds', 'Make investment decisions', 'Provide reports'],
        rights: ['Management fees', 'Decision making authority'],
        obligations: ['Fiduciary duty', 'Transparency', 'Regular reporting']
      },
      {
        id: 'pool_members',
        name: 'Pool Members',
        role: 'investor',
        type: 'individual',
        responsibilities: ['Provide capital', 'Vote on major decisions'],
        rights: ['Proportional returns', 'Voting rights', 'Transparency'],
        obligations: ['Timely contributions', 'Confidentiality']
      }
    ],
    variables: [
      {
        key: 'pool_name',
        label: 'Pool Name',
        type: 'text',
        required: true,
        placeholder: 'Enter pool name'
      },
      {
        key: 'total_pool_amount',
        label: 'Total Pool Amount',
        type: 'currency',
        required: true
      },
      {
        key: 'management_fee',
        label: 'Management Fee (%)',
        type: 'percentage',
        required: true,
        default_value: 2,
        validation: { min: 0, max: 10 }
      },
      {
        key: 'carried_interest',
        label: 'Carried Interest (%)',
        type: 'percentage',
        required: true,
        default_value: 20,
        validation: { min: 0, max: 50 }
      }
    ],
    sections: [
      {
        id: 'pool_structure',
        title: 'Pool Structure',
        content: 'The {pool_name} investment pool is established with a total capital commitment of {total_pool_amount}.',
        order: 1,
        is_required: true,
        is_customizable: true,
        variables: ['pool_name', 'total_pool_amount']
      },
      {
        id: 'fee_structure',
        title: 'Fee Structure',
        content: 'Management fee: {management_fee}% annually. Carried interest: {carried_interest}% of profits.',
        order: 2,
        is_required: true,
        is_customizable: true,
        variables: ['management_fee', 'carried_interest']
      }
    ],
    conditions: [],
    is_customizable: true,
    requires_signatures: true,
    auto_generate: true,
    content: '',
    created_by: '',
    created_at: '',
    updated_at: ''
  }
];

// Agreement management functions
export class AgreementManager {
  private agreements: Agreement[] = [];
  private templates: AgreementTemplate[] = DEFAULT_AGREEMENT_TEMPLATES;

  constructor() {}

  // Set agreements data
  setAgreements(agreements: Agreement[]) {
    this.agreements = agreements;
  }

  // Set templates data
  setTemplates(templates: AgreementTemplate[]) {
    this.templates = templates;
  }

  // Get agreement by ID
  getAgreement(id: string): Agreement | undefined {
    return this.agreements.find(agreement => agreement.id === id);
  }

  // Get agreements by type
  getAgreementsByType(type: AgreementType): Agreement[] {
    return this.agreements.filter(agreement => agreement.agreement_type === type);
  }

  // Get agreements by status
  getAgreementsByStatus(status: AgreementStatus): Agreement[] {
    return this.agreements.filter(agreement => agreement.status === status);
  }

  // Get user's agreements
  getUserAgreements(userId: string): Agreement[] {
    return this.agreements.filter(agreement => 
      agreement.parties.includes(userId) || agreement.created_by === userId
    );
  }

  // Get pending agreements for user
  getPendingAgreements(userId: string): Agreement[] {
    return this.getUserAgreements(userId).filter(agreement => 
      agreement.status === 'pending' && !agreement.signed_by.includes(userId)
    );
  }

  // Check if user has signed agreement
  hasUserSigned(agreementId: string, userId: string): boolean {
    const agreement = this.getAgreement(agreementId);
    return agreement ? agreement.signed_by.includes(userId) : false;
  }

  // Check if agreement is fully signed
  isFullySigned(agreementId: string): boolean {
    const agreement = this.getAgreement(agreementId);
    if (!agreement) return false;
    
    return agreement.signed_by.length === agreement.parties.length;
  }

  // Get template by type
  getTemplateByType(type: AgreementType): AgreementTemplate | undefined {
    return this.templates.find(template => 
      template.agreement_type === type && template.is_active
    );
  }

  // Generate agreement from template
  generateFromTemplate(
    templateId: string, 
    variables: Record<string, string>
  ): string {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) return '';

    let content = template.content;
    
    // Replace template variables
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, value);
    });

    return content;
  }

  // Validate agreement
  validateAgreement(agreement: Partial<Agreement>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!agreement.title) {
      errors.push('Agreement title is required');
    }

    if (!agreement.content) {
      errors.push('Agreement content is required');
    }

    if (!agreement.parties || agreement.parties.length === 0) {
      errors.push('At least one party is required');
    }

    if (agreement.expires_at) {
      const expiryDate = new Date(agreement.expires_at);
      if (expiryDate <= new Date()) {
        errors.push('Expiry date must be in the future');
      }
    }

    return { valid: errors.length === 0, errors };
  }

  // Get agreement status display
  getStatusDisplay(status: AgreementStatus): string {
    switch (status) {
      case 'draft':
        return '📝 Draft';
      case 'pending':
        return '⏳ Pending Signature';
      case 'signed':
        return '✅ Signed';
      case 'expired':
        return '⏰ Expired';
      case 'terminated':
        return '❌ Terminated';
      default:
        return '❓ Unknown';
    }
  }

  // Get agreement status color
  getStatusColor(status: AgreementStatus): string {
    switch (status) {
      case 'draft':
        return 'text-gray-600';
      case 'pending':
        return 'text-yellow-600';
      case 'signed':
        return 'text-green-600';
      case 'expired':
        return 'text-red-600';
      case 'terminated':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }

  // Get agreement type display
  getTypeDisplay(type: AgreementType): string {
    switch (type) {
      case 'nda':
        return 'Non-Disclosure Agreement';
      case 'investment_agreement':
        return 'Investment Agreement';
      case 'service_agreement':
        return 'Service Agreement';
      case 'partnership_agreement':
        return 'Partnership Agreement';
      case 'escrow_agreement':
        return 'Escrow Agreement';
      default:
        return 'Unknown Agreement';
    }
  }

  // Check if agreement is expired
  isExpired(agreementId: string): boolean {
    const agreement = this.getAgreement(agreementId);
    if (!agreement || !agreement.expires_at) return false;
    
    return new Date(agreement.expires_at) <= new Date();
  }

  // Get agreements that need attention
  getAgreementsNeedingAttention(userId: string): Agreement[] {
    const userAgreements = this.getUserAgreements(userId);
    
    return userAgreements.filter(agreement => {
      // Pending agreements user hasn't signed
      if (agreement.status === 'pending' && !agreement.signed_by.includes(userId)) {
        return true;
      }
      
      // Expired agreements
      if (this.isExpired(agreement.id)) {
        return true;
      }
      
      // Agreements expiring soon (within 7 days)
      if (agreement.expires_at) {
        const expiryDate = new Date(agreement.expires_at);
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        
        if (expiryDate <= sevenDaysFromNow && expiryDate > new Date()) {
          return true;
        }
      }
      
      return false;
    });
  }

  // Get agreement statistics
  getAgreementStats(userId: string) {
    const userAgreements = this.getUserAgreements(userId);
    
    return {
      total: userAgreements.length,
      draft: userAgreements.filter(a => a.status === 'draft').length,
      pending: userAgreements.filter(a => a.status === 'pending').length,
      signed: userAgreements.filter(a => a.status === 'signed').length,
      expired: userAgreements.filter(a => a.status === 'expired').length,
      terminated: userAgreements.filter(a => a.status === 'terminated').length,
      needsAttention: this.getAgreementsNeedingAttention(userId).length,
    };
  }

  // Get all templates
  getTemplates(category?: string): AgreementTemplate[] {
    if (category) {
      return this.templates.filter(t => t.category === category);
    }
    return this.templates;
  }

  // Get template by ID
  getTemplate(id: string): AgreementTemplate | undefined {
    return this.templates.find(t => t.id === id);
  }

  // Add custom template
  addTemplate(template: AgreementTemplate): void {
    this.templates.push(template);
  }

  // Generate agreement from template
  generateAgreement(
    templateId: string,
    variables: Record<string, any>,
    parties: AgreementParty[],
    opportunityId?: string
  ): GeneratedAgreement {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Validate required variables
    const requiredVars = template.variables.filter(v => v.required);
    for (const reqVar of requiredVars) {
      if (!variables[reqVar.key]) {
        throw new Error(`Required variable ${reqVar.key} is missing`);
      }
    }

    // Generate content by replacing variables in sections
    let content = '';
    for (const section of template.sections.sort((a, b) => a.order - b.order)) {
      let sectionContent = section.content;
      
      // Replace variables in section content
      for (const varKey of section.variables) {
        const value = variables[varKey];
        if (value !== undefined) {
          sectionContent = sectionContent.replace(new RegExp(`{${varKey}}`, 'g'), String(value));
        }
      }
      
      content += `\n\n## ${section.title}\n\n${sectionContent}`;
    }

    return {
      id: `agreement_${Date.now()}`,
      template_id: templateId,
      title: template.name,
      parties,
      variables,
      content,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      signatures: [],
      conditions_met: [],
      conditions_pending: template.conditions.map(c => c.id),
      opportunity_id: opportunityId
    };
  }

  // Add party to agreement
  addParty(agreement: GeneratedAgreement, party: AgreementParty): GeneratedAgreement {
    return {
      ...agreement,
      parties: [...agreement.parties, party],
      updated_at: new Date().toISOString()
    };
  }

  // Sign agreement
  signAgreement(
    agreement: GeneratedAgreement,
    partyId: string,
    signatureData?: string
  ): GeneratedAgreement {
    const party = agreement.parties.find(p => p.id === partyId);
    if (!party) {
      throw new Error(`Party ${partyId} not found in agreement`);
    }

    const signature: AgreementSignature = {
      party_id: partyId,
      party_name: party.name,
      party_role: party.role,
      signed_at: new Date().toISOString(),
      signature_method: 'electronic',
      signature_data: signatureData
    };

    const signatures = [...agreement.signatures, signature];
    const allPartiesSigned = agreement.parties.every(p => 
      signatures.some(s => s.party_id === p.id)
    );

    return {
      ...agreement,
      signatures,
      status: allPartiesSigned ? 'signed' : 'pending_signature',
      signed_at: allPartiesSigned ? new Date().toISOString() : agreement.signed_at,
      updated_at: new Date().toISOString()
    };
  }

  // Check and execute conditions
  checkConditions(agreement: GeneratedAgreement): GeneratedAgreement {
    const template = this.getTemplate(agreement.template_id);
    if (!template) return agreement;

    const conditionsMet: string[] = [...agreement.conditions_met];
    const conditionsPending: string[] = [];

    for (const condition of template.conditions) {
      if (conditionsMet.includes(condition.id)) continue;

      let shouldExecute = true;
      for (const cond of condition.conditions) {
        const value = agreement.variables[cond.field] || agreement.status;
        let meetsCondition = false;

        switch (cond.operator) {
          case 'equals':
            meetsCondition = value === cond.value;
            break;
          case 'not_equals':
            meetsCondition = value !== cond.value;
            break;
          case 'greater_than':
            meetsCondition = Number(value) > Number(cond.value);
            break;
          case 'less_than':
            meetsCondition = Number(value) < Number(cond.value);
            break;
          case 'contains':
            meetsCondition = String(value).includes(String(cond.value));
            break;
          case 'not_contains':
            meetsCondition = !String(value).includes(String(cond.value));
            break;
          case 'exists':
            meetsCondition = value !== undefined && value !== null;
            break;
          case 'not_exists':
            meetsCondition = value === undefined || value === null;
            break;
        }

        if (!meetsCondition) {
          shouldExecute = false;
          break;
        }
      }

      if (shouldExecute) {
        conditionsMet.push(condition.id);
        // Execute actions
        for (const action of condition.actions) {
          this.executeAction(action, agreement);
        }
      } else {
        conditionsPending.push(condition.id);
      }
    }

    return {
      ...agreement,
      conditions_met: conditionsMet,
      conditions_pending: conditionsPending,
      updated_at: new Date().toISOString()
    };
  }

  private executeAction(action: any, agreement: GeneratedAgreement): void {
    // Implementation would integrate with other systems
    console.log(`Executing action: ${action.type} for agreement ${agreement.id}`);
  }
}

// Export singleton instance
export const agreementManager = new AgreementManager();

// Helper functions
export const getAgreementById = (id: string) => agreementManager.getAgreement(id);
export const getUserPendingAgreements = (userId: string) => agreementManager.getPendingAgreements(userId);
export const isAgreementFullySigned = (id: string) => agreementManager.isFullySigned(id);
export const hasUserSignedAgreement = (agreementId: string, userId: string) => agreementManager.hasUserSigned(agreementId, userId);

export interface UserAgreement {
  id: string;
  template_id: string;
  user_id: string;
  status: string;
  signed_at: string | null;
  signature_url: string | null;
  created_at: string;
  updated_at: string;
}

export class AgreementService {
  // Templates
  static async createTemplate(data: Partial<AgreementTemplate>): Promise<AgreementTemplate> {
    const { data: template, error } = await supabase
      .from('agreement_templates')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return template;
  }

  static async getTemplates(): Promise<AgreementTemplate[]> {
    const { data, error } = await supabase
      .from('agreement_templates')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async getTemplate(id: string): Promise<AgreementTemplate | null> {
    const { data, error } = await supabase
      .from('agreement_templates')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  static async updateTemplate(id: string, updates: Partial<AgreementTemplate>): Promise<AgreementTemplate> {
    const { data, error } = await supabase
      .from('agreement_templates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async deleteTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('agreement_templates')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  // User Agreements
  static async createUserAgreement(data: Partial<UserAgreement>): Promise<UserAgreement> {
    const { data: agreement, error } = await supabase
      .from('user_agreements')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return agreement;
  }

  static async getUserAgreements(userId: string): Promise<UserAgreement[]> {
    const { data, error } = await supabase
      .from('user_agreements')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async signAgreement(id: string, signatureUrl: string): Promise<UserAgreement> {
    const { data, error } = await supabase
      .from('user_agreements')
      .update({
        status: 'signed',
        signature_url: signatureUrl,
        signed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
} 