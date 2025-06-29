
export type OpportunityType = 'going_concern' | 'order_fulfillment' | 'project_partnership';
export type OpportunityStatus = 'draft' | 'pending' | 'published' | 'funded' | 'closed' | 'under_review';
export type PaymentStatus = 'pending' | 'awaiting_admin' | 'scheduled' | 'completed' | 'failed';
export type MilestoneStatus = 'pending' | 'completed' | 'overdue';

export interface Milestone {
  title: string;
  target_date: string;
  status: string;
  last_update: string;
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

interface Payment {
  amount: number;
  currency: string;
  reference_number: string;
  status: PaymentStatus;
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

  validateAIOutput: (type: string, value: number): number => {
    if (type === 'risk_score') {
      // Ensure risk score is between 0 and 1
      return Math.max(0, Math.min(1, value));
    }
    return value;
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
  }
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};
