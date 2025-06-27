
// Deterministic Rule Based Engine (DRBE)
// Centralized business logic for validation, workflow, and AI output control

export type OpportunityType = 'going_concern' | 'order_fulfillment' | 'project_partnership';
export type OpportunityStatus = 'draft' | 'under_review' | 'published' | 'funded' | 'closed';
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'skipped' | 'overdue';
export type OfferStatus = 'pending' | 'accepted' | 'declined' | 'countered' | 'withdrawn';
export type InvestmentStatus = 'pending' | 'active' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'awaiting_admin' | 'scheduled' | 'completed' | 'failed';

export interface Opportunity {
  id?: string;
  title: string;
  type: OpportunityType;
  status: OpportunityStatus;
  description?: string;
  location?: string;
  equity_offered?: number;
  expected_roi?: number;
  primary_currency?: string;
  is_draft?: boolean;
  fields: Record<string, any>;
}

export interface Milestone {
  id?: string;
  opportunity_id?: string;
  title: string;
  description?: string;
  target_date: string; // ISO date
  status: MilestoneStatus;
  progress_notes?: string;
  evidence_file?: string;
  last_update: string; // ISO date
}

export interface Payment {
  id?: string;
  amount: number;
  currency: string;
  reference_number?: string;
  proof_file?: string;
  status: PaymentStatus;
  from_user_id?: string;
  to_user_id?: string;
}

export interface UserProfile {
  id?: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  role_id?: number;
  is_active?: boolean;
  kyc_docs?: string[];
  kyc_status?: string;
}

export interface Agreement {
  id?: string;
  opportunity_id?: string;
  type: string;
  file_url?: string;
  signed_by: string[];
  required_signers: string[];
  endorsed_by?: string[];
  status: string;
}

export interface InvestmentPool {
  id?: string;
  name: string;
  description?: string;
  is_active?: boolean;
  created_by?: string;
}

export interface ServiceProvider {
  id?: string;
  user_id?: string;
  biography?: string;
  expertise?: string;
  credentials_file?: string;
  profile_picture?: string;
  contact_info?: Record<string, any>;
  banking_details?: Record<string, any>;
  is_active?: boolean;
}

export const DRBE = {
  validateOpportunity(opportunity: Opportunity): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!opportunity.title?.trim()) errors.push('Title is required');
    
    // Type-specific validations
    if (opportunity.type === 'going_concern') {
      if (!opportunity.equity_offered || opportunity.equity_offered <= 0) {
        errors.push('Equity offered is required for Going Concern and must be greater than 0');
      }
      if (opportunity.equity_offered && opportunity.equity_offered > 100) {
        errors.push('Equity offered cannot exceed 100%');
      }
    }
    
    if (opportunity.type === 'order_fulfillment' && !opportunity.fields.order_details) {
      errors.push('Order details required for Order Fulfillment');
    }
    
    if (opportunity.type === 'project_partnership' && !opportunity.fields.partner_roles) {
      errors.push('Partner roles required for Project Partnership');
    }

    // General validations
    if (opportunity.expected_roi && opportunity.expected_roi < 0) {
      errors.push('Expected ROI cannot be negative');
    }

    return { valid: errors.length === 0, errors };
  },

  evaluateMilestoneStatus(milestone: Milestone): MilestoneStatus {
    const now = new Date();
    const target = new Date(milestone.target_date);
    
    if (milestone.status === 'completed') return 'completed';
    if (milestone.status === 'skipped') return 'skipped';
    if (now > target && milestone.status !== 'completed') return 'overdue';
    
    return milestone.status;
  },

  validateAIOutput(type: string, output: any): any {
    // Example: Clamp risk scores, override if out of bounds
    if (type === 'risk_score') {
      if (output < 0) return 0;
      if (output > 1) return 1;
      return output;
    }
    
    // Validate entrepreneur reliability scores
    if (type === 'reliability_score') {
      if (output < 0) return 0;
      if (output > 5) return 5;
      return Math.round(output * 100) / 100; // Round to 2 decimal places
    }
    
    return output;
  },

  // Enhanced opportunity publishing rules
  canPublishOpportunity(opportunity: Opportunity): { canPublish: boolean; errors: string[] } {
    const { valid, errors } = this.validateOpportunity(opportunity);
    if (!valid) return { canPublish: false, errors };

    // Additional publishing requirements
    const publishErrors: string[] = [];
    
    if (!opportunity.description?.trim()) {
      publishErrors.push('Description is required for publication');
    }
    
    if (!opportunity.primary_currency) {
      publishErrors.push('Primary currency must be specified');
    }

    return { 
      canPublish: publishErrors.length === 0, 
      errors: publishErrors 
    };
  },

  // Milestone risk assessment
  assessMilestoneRisk(milestones: Milestone[]): { riskLevel: 'low' | 'medium' | 'high'; overdueCount: number; skippedCount: number } {
    const overdue = milestones.filter(m => this.evaluateMilestoneStatus(m) === 'overdue');
    const skipped = milestones.filter(m => m.status === 'skipped');
    
    const overdueCount = overdue.length;
    const skippedCount = skipped.length;
    const totalIssues = overdueCount + skippedCount;
    const riskRatio = totalIssues / Math.max(milestones.length, 1);

    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (riskRatio > 0.5) riskLevel = 'high';
    else if (riskRatio > 0.2) riskLevel = 'medium';

    return { riskLevel, overdueCount, skippedCount };
  }
};

// --- Payments & Transaction Flows ---
export const validatePayment = (payment: Payment): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!payment.amount || payment.amount <= 0) errors.push('Amount must be positive');
  if (!payment.currency) errors.push('Currency is required');
  if (!payment.reference_number) errors.push('Reference number is required');
  
  if ((payment.status === 'pending' || payment.status === 'awaiting_admin') && !payment.proof_file) {
    errors.push('Proof of payment is required');
  }
  
  return { valid: errors.length === 0, errors };
};

// --- User Onboarding & KYC/AML ---
export const validateUserProfile = (profile: UserProfile): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!profile.full_name?.trim()) errors.push('Full name is required');
  if (!profile.email?.trim()) errors.push('Email is required');
  
  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (profile.email && !emailRegex.test(profile.email)) {
    errors.push('Valid email address is required');
  }
  
  return { valid: errors.length === 0, errors };
};

export const validateKYC = (profile: UserProfile): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!profile.kyc_docs || profile.kyc_docs.length === 0) {
    errors.push('KYC documents are required');
  }
  if (profile.kyc_status !== 'approved') {
    errors.push('KYC not approved');
  }
  
  return { valid: errors.length === 0, errors };
};

// --- Agreement & E-Signature Workflows ---
export const validateAgreement = (agreement: Agreement): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  agreement.required_signers.forEach(signer => {
    if (!agreement.signed_by.includes(signer)) {
      errors.push(`Missing signature: ${signer}`);
    }
  });
  
  if (agreement.status === 'active' && errors.length > 0) {
    errors.push('Agreement cannot be active until all signatures are present');
  }
  
  return { valid: errors.length === 0, errors };
};

// --- Investment Pool Validation ---
export const validateInvestmentPool = (pool: InvestmentPool): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!pool.name?.trim()) errors.push('Pool name is required');
  if (pool.name && pool.name.length < 3) errors.push('Pool name must be at least 3 characters');
  
  return { valid: errors.length === 0, errors };
};

// --- Service Provider Validation ---
export const validateServiceProvider = (provider: ServiceProvider): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!provider.biography?.trim()) errors.push('Biography is required');
  if (!provider.expertise?.trim()) errors.push('Expertise description is required');
  
  return { valid: errors.length === 0, errors };
};

// --- Notifications & Escalations ---
export const shouldNotify = (eventType: string, entity: any): boolean => {
  if (eventType === 'milestone' && entity.status === 'overdue') return true;
  if (eventType === 'payment' && (!entity.proof_file || entity.status === 'pending')) return true;
  if (eventType === 'offer' && entity.status === 'pending') return true;
  if (eventType === 'agreement' && entity.status === 'unsigned') return true;
  
  return false;
};

export const shouldEscalate = (eventType: string, entity: any): boolean => {
  if (eventType === 'milestone' && entity.status === 'overdue') {
    const overdueDays = (Date.now() - new Date(entity.target_date).getTime()) / (1000 * 60 * 60 * 24);
    return overdueDays > 3;
  }
  
  if (eventType === 'payment' && entity.status === 'pending') {
    const pendingDays = (Date.now() - new Date(entity.created_at).getTime()) / (1000 * 60 * 60 * 24);
    return pendingDays > 7;
  }
  
  return false;
};

// --- RBAC Enforcement ---
export const canPerformAction = (role: string, action: string): boolean => {
  const rolePermissions: Record<string, string[]> = {
    admin: [
      'approve_payment', 'publish_opportunity', 'view_all', 'manage_users', 
      'manage_pools', 'manage_escrow', 'view_reports', 'manage_settings'
    ],
    entrepreneur: [
      'create_opportunity', 'edit_own', 'view_own', 'hire_service_provider',
      'make_payment', 'upload_milestone', 'sign_agreement'
    ],
    investor: [
      'view_opportunity', 'make_offer', 'invest', 'hire_service_provider',
      'sign_agreement', 'view_reports'
    ],
    pool_member: [
      'view_opportunity', 'participate_in_pool', 'vote', 'view_pool_reports'
    ],
    service_provider: [
      'view_tasks', 'submit_report', 'upload_credentials', 'accept_service_request',
      'endorse_agreement'
    ],
  };
  
  return rolePermissions[role]?.includes(action) || false;
};

// --- Monthly/Automated Reporting ---
export const validateReportData = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data || Object.keys(data).length === 0) {
    errors.push('No data available for report generation');
  }
  
  // Validate required report sections
  if (data.opportunities && !Array.isArray(data.opportunities)) {
    errors.push('Opportunities data must be an array');
  }
  
  if (data.investments && !Array.isArray(data.investments)) {
    errors.push('Investments data must be an array');
  }
  
  return { valid: errors.length === 0, errors };
};

// --- Currency & Multi-currency Support ---
export const validateCurrency = (currencyCode: string): boolean => {
  const supportedCurrencies = ['USD', 'EUR', 'GBP', 'ZWL', 'ZAR', 'KES', 'NGN', 'GHS'];
  return supportedCurrencies.includes(currencyCode.toUpperCase());
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    ZWL: 'ZWL',
    ZAR: 'R',
    KES: 'KSh',
    NGN: '₦',
    GHS: '₵'
  };
  
  const symbol = currencySymbols[currency.toUpperCase()] || currency;
  return `${symbol}${amount.toLocaleString()}`;
};
