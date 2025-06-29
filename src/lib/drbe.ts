
export type OpportunityType = 'going_concern' | 'order_fulfillment' | 'project_partnership';
export type OpportunityStatus = 'draft' | 'pending' | 'published' | 'funded' | 'closed' | 'under_review';

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

  evaluateMilestoneStatus: (milestone: any): string => {
    if (milestone.completed_at) {
      return 'completed';
    }
    
    const now = new Date();
    const dueDate = new Date(milestone.due_date);
    
    if (dueDate < now) {
      return 'overdue';
    }
    
    return 'pending';
  }
};
