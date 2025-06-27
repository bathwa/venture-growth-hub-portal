// Deterministic Rule Based Engine (DRBE)
// Centralized business logic for validation, workflow, and AI output control

export type OpportunityType = 'going_concern' | 'order_fulfillment' | 'project_partnership';
export type OpportunityStatus = 'draft' | 'under_review' | 'published' | 'funded' | 'closed';
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'skipped' | 'overdue';

export interface Opportunity {
  title: string;
  type: OpportunityType;
  status: OpportunityStatus;
  fields: Record<string, any>;
}

export interface Milestone {
  target_date: string; // ISO date
  status: MilestoneStatus;
  last_update: string; // ISO date
}

export const DRBE = {
  validateOpportunity(opportunity: Opportunity): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!opportunity.title) errors.push('Title is required');
    if (opportunity.type === 'going_concern' && !opportunity.fields.equity_offered) {
      errors.push('Equity offered is required for Going Concern');
    }
    if (opportunity.type === 'order_fulfillment' && !opportunity.fields.order_details) {
      errors.push('Order details required for Order Fulfillment');
    }
    if (opportunity.type === 'project_partnership' && !opportunity.fields.partner_roles) {
      errors.push('Partner roles required for Project Partnership');
    }
    // Add more rules as needed
    return { valid: errors.length === 0, errors };
  },

  evaluateMilestoneStatus(milestone: Milestone): MilestoneStatus {
    const now = new Date();
    const target = new Date(milestone.target_date);
    if (milestone.status === 'completed') return 'completed';
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
    // Add more AI output checks as needed
    return output;
  },

  // Add more deterministic rules as needed
};

// --- Payments & Transaction Flows ---
export interface Payment {
  amount: number;
  reference: string;
  proof_file?: string;
  status: string;
  from_user_id?: string;
  to_user_id?: string;
}

export const validatePayment = (payment: Payment): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  if (!payment.amount || payment.amount <= 0) errors.push('Amount must be positive');
  if (!payment.reference) errors.push('Reference is required');
  if ((payment.status === 'pending' || payment.status === 'awaiting_admin') && !payment.proof_file) errors.push('Proof of payment is required');
  return { valid: errors.length === 0, errors };
};

// --- User Onboarding & KYC/AML ---
export interface UserProfile {
  full_name: string;
  email: string;
  phone?: string;
  kyc_docs?: string[];
  kyc_status?: string;
}

export const validateUserProfile = (profile: UserProfile): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  if (!profile.full_name) errors.push('Full name is required');
  if (!profile.email) errors.push('Email is required');
  // Add more rules as needed
  return { valid: errors.length === 0, errors };
};

export const validateKYC = (profile: UserProfile): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  if (!profile.kyc_docs || profile.kyc_docs.length === 0) errors.push('KYC documents are required');
  if (profile.kyc_status !== 'approved') errors.push('KYC not approved');
  return { valid: errors.length === 0, errors };
};

// --- Agreement & E-Signature Workflows ---
export interface Agreement {
  type: string;
  signed_by: string[];
  required_signers: string[];
  status: string;
}

export const validateAgreement = (agreement: Agreement): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  agreement.required_signers.forEach(signer => {
    if (!agreement.signed_by.includes(signer)) errors.push(`Missing signature: ${signer}`);
  });
  if (agreement.status === 'active' && errors.length > 0) errors.push('Agreement cannot be active until all signatures are present');
  return { valid: errors.length === 0, errors };
};

// --- Notifications & Escalations ---
export const shouldNotify = (eventType: string, entity: any): boolean => {
  // Example: notify on overdue, red-flag, or missing proof
  if (eventType === 'milestone' && entity.status === 'overdue') return true;
  if (eventType === 'payment' && (!entity.proof_file || entity.status === 'pending')) return true;
  return false;
};

export const shouldEscalate = (eventType: string, entity: any): boolean => {
  // Example: escalate if overdue for more than 3 days
  if (eventType === 'milestone' && entity.status === 'overdue') {
    const overdueDays = (Date.now() - new Date(entity.target_date).getTime()) / 86400000;
    return overdueDays > 3;
  }
  return false;
};

// --- RBAC Enforcement ---
export const canPerformAction = (role: string, action: string): boolean => {
  const rolePermissions: Record<string, string[]> = {
    admin: ['approve_payment', 'publish_opportunity', 'view_all'],
    entrepreneur: ['create_opportunity', 'edit_own', 'view_own'],
    investor: ['view_opportunity', 'make_offer'],
    service_provider: ['view_tasks', 'submit_report'],
  };
  return rolePermissions[role]?.includes(action) || false;
};

// --- Opportunity Publishing & Review ---
export const canPublishOpportunity = (opportunity: Opportunity): { canPublish: boolean; errors: string[] } => {
  const { valid, errors } = DRBE.validateOpportunity(opportunity);
  if (!valid) return { canPublish: false, errors };
  // Add more publishing rules as needed
  return { canPublish: true, errors: [] };
};

// --- Monthly/Automated Reporting ---
export const validateReportData = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  if (!data || Object.keys(data).length === 0) errors.push('No data for report');
  // Add more report validation rules as needed
  return { valid: errors.length === 0, errors };
}; 