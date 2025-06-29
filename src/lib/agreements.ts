
export type AgreementStatus = 'draft' | 'pending' | 'signed' | 'expired' | 'cancelled';

export type AgreementType = 
  | 'nda'
  | 'investment_agreement'
  | 'service_agreement'
  | 'partnership_agreement'
  | 'escrow_agreement';

export interface AgreementTemplate {
  id: string;
  name: string;
  agreement_type: AgreementType;
  content: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Agreement {
  id: string;
  template_id?: string;
  agreement_type: AgreementType;
  status: AgreementStatus;
  parties: Array<{
    name: string;
    email: string;
    role: string;
    signed_at?: Date;
  }>;
  content: {
    template_id?: string;
    filled_content: string;
    variables: Record<string, string>;
  };
  variables: Record<string, string>;
  document_id?: string;
  signed_at?: Date;
  expires_at?: Date;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export const agreementTemplates = {
  create: async (template: Omit<AgreementTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<AgreementTemplate> => {
    // Mock implementation
    return {
      ...template,
      id: `template-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },
  
  update: async (id: string, updates: Partial<AgreementTemplate>): Promise<AgreementTemplate> => {
    // Mock implementation
    throw new Error('Not implemented');
  },
  
  delete: async (id: string): Promise<void> => {
    // Mock implementation
    throw new Error('Not implemented');
  },
  
  getAll: async (): Promise<AgreementTemplate[]> => {
    // Mock implementation
    return [];
  },
  
  getById: async (id: string): Promise<AgreementTemplate | null> => {
    // Mock implementation
    return null;
  }
};
