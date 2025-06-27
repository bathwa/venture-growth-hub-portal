// Agreements Module
// Aligned with the new Supabase schema using agreement_status and agreement_type enums

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

export interface AgreementTemplate {
  id: string;
  name: string;
  agreement_type: AgreementType;
  content: string;
  variables: string[]; // Template variables like {{company_name}}, {{amount}}, etc.
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AgreementSignature {
  id: string;
  agreement_id: string;
  user_id: string;
  signed_at: string;
  ip_address?: string;
  user_agent?: string;
}

export class AgreementManager {
  private agreements: Agreement[] = [];
  private templates: AgreementTemplate[] = [];

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
}

// Export a singleton instance
export const agreementManager = new AgreementManager();

// Helper functions
export const getAgreementById = (id: string) => agreementManager.getAgreement(id);
export const getUserPendingAgreements = (userId: string) => agreementManager.getPendingAgreements(userId);
export const isAgreementFullySigned = (id: string) => agreementManager.isFullySigned(id);
export const hasUserSignedAgreement = (agreementId: string, userId: string) => agreementManager.hasUserSigned(agreementId, userId); 