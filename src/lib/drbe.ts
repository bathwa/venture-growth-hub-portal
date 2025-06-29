
export type OpportunityType = 'going_concern' | 'order_fulfillment' | 'project_partnership';
export type OpportunityStatus = 'draft' | 'pending' | 'published' | 'funded' | 'closed' | 'under_review';
export type PaymentStatus = 'pending' | 'awaiting_admin' | 'scheduled' | 'completed' | 'failed';
export type MilestoneStatus = 'pending' | 'completed' | 'overdue';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Milestone {
  title: string;
  target_date: string;
  status: string;
  last_update: string;
}

export interface Payment {
  amount: number;
  currency: string;
  reference_number: string;
  status: PaymentStatus;
}

interface OpportunityValidation {
  id: string;
  title: string;
  type: OpportunityType;
  status: OpportunityStatus;
  fields: {
    equity_offered?: string;
    order_details?: string;
    partner_roles?: string;
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface Opportunity {
  id: string;
  title: string;
  type: OpportunityType;
  status: OpportunityStatus;
  fields: {
    equity_offered?: string;
    order_details?: string;
    partner_roles?: string;
    funding_amount?: string;
    current_revenue?: string;
    projected_revenue?: string;
    team_size?: string;
    market_size?: string;
    competition_level?: string;
    technology_readiness_level?: string;
    ip_protection?: string;
    regulatory_compliant?: string;
    market_growth_rate?: string;
    competitive_advantage?: string;
    customer_validation?: string;
    team_experience?: string;
    technology_innovation?: string;
    scalability_potential?: string;
    financial_projections?: string;
    exit_strategy?: string;
    risk_score?: string;
    expected_roi?: string;
    market_timing?: string;
    due_diligence_score?: string;
    kyc_complete?: string;
    aml_check?: string;
    regulatory_licenses?: string;
    tax_compliance?: string;
    legal_structure?: string;
    documentation_completeness?: string;
    audit_history?: string;
    market_research?: string;
    scalable?: string;
    business_plan?: string;
    financial_statements?: string;
    team_background?: string;
    team_commitment?: string;
  };
  milestones?: Milestone[];
  created_at: string;
  updated_at: string;
  created_by: string;
}

export const DRBE = {
  validateOpportunity: (opportunity: OpportunityValidation): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!opportunity.title || opportunity.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (opportunity.type === 'going_concern' && !opportunity.fields.equity_offered) {
      errors.push('Equity offered is required for going concern investments');
    }

    if (opportunity.type === 'order_fulfillment' && !opportunity.fields.order_details) {
      errors.push('Order details are required for order fulfillment investments');
    }

    if (opportunity.type === 'project_partnership' && !opportunity.fields.partner_roles) {
      errors.push('Partner roles are required for project partnerships');
    }

    if (opportunity.fields.equity_offered) {
      const equity = parseFloat(opportunity.fields.equity_offered);
      if (isNaN(equity) || equity <= 0 || equity > 100) {
        errors.push('Equity offered must be between 0 and 100 percent');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  validatePayment: (payment: Payment): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!payment.amount || payment.amount <= 0) {
      errors.push('Payment amount must be greater than 0');
    }

    if (!payment.currency) {
      errors.push('Currency is required');
    }

    if (!payment.reference_number) {
      errors.push('Reference number is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  validateAIOutput: (type: string, value: number): number => {
    if (type === 'risk_score') {
      // Ensure risk score is between 0 and 1
      return Math.max(0, Math.min(1, value));
    }
    return value;
  },

  getRiskLevel: (riskScore: number): RiskLevel => {
    if (riskScore <= 25) return 'low';
    if (riskScore <= 50) return 'medium';
    if (riskScore <= 75) return 'high';
    return 'critical';
  },

  evaluateMilestoneStatus: (milestone: Milestone): MilestoneStatus => {
    if (milestone.status === 'completed') {
      return 'completed';
    }
    
    const now = new Date();
    const dueDate = new Date(milestone.target_date);
    
    if (dueDate < now) {
      return 'overdue';
    }
    
    return 'pending';
  }
};

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface Opportunity {
  id: string;
  title: string;
  type: OpportunityType;
  status: OpportunityStatus;
  fields: {
    equity_offered?: string;
    order_details?: string;
    partner_roles?: string;
  };
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

// Keep the existing DRBE object but also export it as drbe
export const drbe = DRBE;

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const validatePayment = DRBE.validatePayment;
