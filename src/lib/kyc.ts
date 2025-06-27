// Know Your Customer (KYC) Module
// Aligned with the new Supabase schema using kyc_status enum and kyc_docs array

export type KYCStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected';

export interface KYCProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  kyc_docs: string[];
  kyc_status: KYCStatus;
  created_at: string;
  updated_at: string;
}

export interface KYCDocument {
  id: string;
  name: string;
  type: 'id_document' | 'proof_of_address' | 'business_registration' | 'financial_statement' | 'other';
  file_url: string;
  uploaded_at: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
}

export class KYCManager {
  private profile: KYCProfile | null = null;

  constructor(profile?: KYCProfile) {
    this.profile = profile || null;
  }

  // Set KYC profile
  setProfile(profile: KYCProfile) {
    this.profile = profile;
  }

  // Get current KYC status
  getStatus(): KYCStatus {
    return this.profile?.kyc_status || 'not_submitted';
  }

  // Check if KYC is complete
  isComplete(): boolean {
    return this.profile?.kyc_status === 'approved';
  }

  // Check if KYC is pending
  isPending(): boolean {
    return this.profile?.kyc_status === 'pending';
  }

  // Check if KYC is rejected
  isRejected(): boolean {
    return this.profile?.kyc_status === 'rejected';
  }

  // Check if KYC is not submitted
  isNotSubmitted(): boolean {
    return this.profile?.kyc_status === 'not_submitted';
  }

  // Get required documents based on user role
  getRequiredDocuments(role: string): string[] {
    const baseDocuments = [
      'id_document',
      'proof_of_address',
    ];

    switch (role) {
      case 'entrepreneur':
        return [
          ...baseDocuments,
          'business_registration',
          'financial_statement',
          'business_plan',
        ];
      case 'investor':
        return [
          ...baseDocuments,
          'proof_of_funds',
          'investment_experience',
        ];
      case 'service_provider':
        return [
          ...baseDocuments,
          'professional_credentials',
          'business_license',
        ];
      default:
        return baseDocuments;
    }
  }

  // Check if all required documents are uploaded
  hasAllRequiredDocuments(role: string): boolean {
    const required = this.getRequiredDocuments(role);
    const uploaded = this.profile?.kyc_docs || [];
    
    // This is a simplified check - in production you'd want to check document types
    return uploaded.length >= required.length;
  }

  // Validate KYC profile
  validateProfile(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.profile) {
      errors.push('KYC profile not found');
      return { valid: false, errors };
    }

    if (!this.profile.full_name) {
      errors.push('Full name is required');
    }

    if (!this.profile.email) {
      errors.push('Email is required');
    }

    if (this.profile.kyc_status === 'not_submitted' && this.profile.kyc_docs.length === 0) {
      errors.push('At least one KYC document is required');
    }

    return { valid: errors.length === 0, errors };
  }

  // Get KYC status display text
  getStatusDisplay(): string {
    switch (this.profile?.kyc_status) {
      case 'approved':
        return '✅ Approved';
      case 'pending':
        return '⏳ Pending Review';
      case 'rejected':
        return '❌ Rejected';
      case 'not_submitted':
        return '📝 Not Submitted';
      default:
        return '❓ Unknown';
    }
  }

  // Get KYC status color for UI
  getStatusColor(): string {
    switch (this.profile?.kyc_status) {
      case 'approved':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'rejected':
        return 'text-red-600';
      case 'not_submitted':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  }

  // Check if user can proceed with platform actions
  canProceedWithAction(action: string): boolean {
    // Some actions require KYC approval
    const kycRequiredActions = [
      'create_opportunity',
      'make_investment',
      'receive_payment',
      'upload_sensitive_files',
    ];

    if (kycRequiredActions.includes(action)) {
      return this.isComplete();
    }

    // Other actions can proceed with pending KYC
    return this.isComplete() || this.isPending();
  }

  // Get next steps for KYC completion
  getNextSteps(role: string): string[] {
    const steps: string[] = [];

    if (this.isNotSubmitted()) {
      steps.push('Upload required identification documents');
      steps.push('Provide proof of address');
      
      if (role === 'entrepreneur') {
        steps.push('Upload business registration documents');
        steps.push('Provide financial statements');
      } else if (role === 'investor') {
        steps.push('Provide proof of funds');
        steps.push('Share investment experience');
      }
      
      steps.push('Submit for review');
    } else if (this.isPending()) {
      steps.push('Wait for admin review');
      steps.push('Check email for updates');
    } else if (this.isRejected()) {
      steps.push('Review rejection reasons');
      steps.push('Upload corrected documents');
      steps.push('Resubmit for review');
    }

    return steps;
  }
}

// Export a singleton instance
export const kycManager = new KYCManager();

// Helper functions
export const isKYCComplete = () => kycManager.isComplete();
export const isKYCPending = () => kycManager.isPending();
export const canProceedWithKYC = (action: string) => kycManager.canProceedWithAction(action); 