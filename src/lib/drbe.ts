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