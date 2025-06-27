// Enhanced Deterministic Rule Based Engine (DRBE)
// Provides consistent, rule-based validation and decision making

export type OpportunityType = 'going_concern' | 'order_fulfillment' | 'asset_purchase' | 'real_estate' | 'technology_licensing';
export type OpportunityStatus = 'draft' | 'pending_review' | 'published' | 'funded' | 'completed' | 'cancelled';
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ValidationSeverity = 'info' | 'warning' | 'error' | 'critical';
export type PaymentStatus = 'pending' | 'awaiting_admin' | 'scheduled' | 'completed' | 'failed';

export interface Milestone {
  id?: string;
  title: string;
  description?: string;
  target_date: string;
  status: MilestoneStatus;
  last_update: string;
  completion_percentage?: number;
  dependencies?: string[];
  assigned_to?: string;
  budget?: number;
  actual_cost?: number;
}

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  severity: ValidationSeverity;
  condition: (data: any) => boolean;
  message: (data: any) => string;
  category: 'financial' | 'legal' | 'operational' | 'technical' | 'compliance';
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  info: string[];
  riskScore: number;
  recommendations: string[];
  complianceStatus: 'compliant' | 'non_compliant' | 'requires_review';
}

export interface Opportunity {
  id: string;
  title: string;
  type: OpportunityType;
  status: OpportunityStatus;
  fields: Record<string, any>;
  milestones: Milestone[];
  created_at: string;
  updated_at: string;
  created_by: string;
  risk_level?: RiskLevel;
  validation_results?: ValidationResult;
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

// --- Legacy Functions for Backward Compatibility ---

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

export class DRBE {
  private static instance: DRBE;
  private validationRules: ValidationRule[] = [];

  private constructor() {
    this.initializeRules();
  }

  public static getInstance(): DRBE {
    if (!DRBE.instance) {
      DRBE.instance = new DRBE();
    }
    return DRBE.instance;
  }

  private initializeRules() {
    // Financial Rules
    this.validationRules.push(
      {
        id: 'financial_01',
        name: 'Equity Percentage Validation',
        description: 'Ensure equity offered is within acceptable range',
        severity: 'error',
        category: 'financial',
        condition: (data: Opportunity) => {
          const equity = parseFloat(data.fields.equity_offered) || 0;
          return equity >= 1 && equity <= 100;
        },
        message: (data: Opportunity) => `Equity offered (${data.fields.equity_offered}%) must be between 1% and 100%`
      },
      {
        id: 'financial_02',
        name: 'Funding Amount Validation',
        description: 'Validate funding amount is reasonable',
        severity: 'warning',
        category: 'financial',
        condition: (data: Opportunity) => {
          const amount = parseFloat(data.fields.funding_amount) || 0;
          return amount >= 1000 && amount <= 10000000;
        },
        message: (data: Opportunity) => `Funding amount ($${data.fields.funding_amount}) should be between $1,000 and $10M`
      },
      {
        id: 'financial_03',
        name: 'Revenue Projection Validation',
        description: 'Check if revenue projections are realistic',
        severity: 'warning',
        category: 'financial',
        condition: (data: Opportunity) => {
          const currentRevenue = parseFloat(data.fields.current_revenue) || 0;
          const projectedRevenue = parseFloat(data.fields.projected_revenue) || 0;
          return projectedRevenue <= currentRevenue * 10; // Max 10x growth
        },
        message: (data: Opportunity) => `Projected revenue growth seems unrealistic (${data.fields.projected_revenue} vs ${data.fields.current_revenue})`
      }
    );

    // Legal Rules
    this.validationRules.push(
      {
        id: 'legal_01',
        name: 'Required Documents Check',
        description: 'Ensure all required legal documents are present',
        severity: 'error',
        category: 'legal',
        condition: (data: Opportunity) => {
          const requiredDocs = ['business_plan', 'financial_statements', 'legal_structure'];
          return requiredDocs.every(doc => data.fields[doc] === 'true');
        },
        message: (data: Opportunity) => 'Missing required legal documents: Business Plan, Financial Statements, Legal Structure'
      },
      {
        id: 'legal_02',
        name: 'Intellectual Property Check',
        description: 'Validate IP ownership and protection',
        severity: 'warning',
        category: 'legal',
        condition: (data: Opportunity) => {
          return data.fields.ip_protection === 'true' || data.fields.ip_protection === 'pending';
        },
        message: (data: Opportunity) => 'Intellectual property protection should be secured or in progress'
      }
    );

    // Operational Rules
    this.validationRules.push(
      {
        id: 'operational_01',
        name: 'Team Size Validation',
        description: 'Check if team size is appropriate for the opportunity',
        severity: 'info',
        category: 'operational',
        condition: (data: Opportunity) => {
          const teamSize = parseInt(data.fields.team_size) || 0;
          const fundingAmount = parseFloat(data.fields.funding_amount) || 0;
          return teamSize >= 1 && (fundingAmount < 100000 || teamSize <= 20);
        },
        message: (data: Opportunity) => `Team size (${data.fields.team_size}) should be appropriate for funding amount`
      },
      {
        id: 'operational_02',
        name: 'Market Validation',
        description: 'Ensure market research is conducted',
        severity: 'warning',
        category: 'operational',
        condition: (data: Opportunity) => {
          return data.fields.market_research === 'true' || data.fields.market_size;
        },
        message: (data: Opportunity) => 'Market research should be conducted and documented'
      }
    );

    // Technical Rules
    this.validationRules.push(
      {
        id: 'technical_01',
        name: 'Technology Readiness',
        description: 'Check technology readiness level',
        severity: 'warning',
        category: 'technical',
        condition: (data: Opportunity) => {
          const trl = parseInt(data.fields.technology_readiness_level) || 0;
          return trl >= 4; // Minimum TRL 4 for investment
        },
        message: (data: Opportunity) => `Technology readiness level (${data.fields.technology_readiness_level}) should be at least 4`
      },
      {
        id: 'technical_02',
        name: 'Scalability Check',
        description: 'Validate scalability potential',
        severity: 'info',
        category: 'technical',
        condition: (data: Opportunity) => {
          return data.fields.scalable === 'true' || data.fields.scalability_plan;
        },
        message: (data: Opportunity) => 'Scalability plan should be documented'
      }
    );

    // Compliance Rules
    this.validationRules.push(
      {
        id: 'compliance_01',
        name: 'Regulatory Compliance',
        description: 'Check regulatory compliance status',
        severity: 'error',
        category: 'compliance',
        condition: (data: Opportunity) => {
          return data.fields.regulatory_compliant === 'true' || data.fields.compliance_status === 'compliant';
        },
        message: (data: Opportunity) => 'Regulatory compliance must be confirmed'
      },
      {
        id: 'compliance_02',
        name: 'KYC/AML Check',
        description: 'Validate KYC/AML compliance',
        severity: 'error',
        category: 'compliance',
        condition: (data: Opportunity) => {
          return data.fields.kyc_complete === 'true' && data.fields.aml_check === 'true';
        },
        message: (data: Opportunity) => 'KYC and AML checks must be completed'
      }
    );
  }

  // Enhanced opportunity validation
  public validateOpportunity(opportunity: Opportunity): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const info: string[] = [];
    let riskScore = 0;

    // Run all validation rules
    this.validationRules.forEach(rule => {
      try {
        if (!rule.condition(opportunity)) {
          const message = rule.message(opportunity);
          switch (rule.severity) {
            case 'error':
            case 'critical':
              errors.push(message);
              riskScore += 10;
              break;
            case 'warning':
              warnings.push(message);
              riskScore += 5;
              break;
            case 'info':
              info.push(message);
              riskScore += 1;
              break;
          }
        }
      } catch (error) {
        console.error(`Error in validation rule ${rule.id}:`, error);
      }
    });

    // Additional milestone validation
    const milestoneValidation = this.validateMilestones(opportunity.milestones);
    errors.push(...milestoneValidation.errors);
    warnings.push(...milestoneValidation.warnings);
    info.push(...milestoneValidation.info);
    riskScore += milestoneValidation.riskScore;

    // Calculate compliance status
    const complianceStatus = this.calculateComplianceStatus(errors, warnings);

    // Generate recommendations
    const recommendations = this.generateRecommendations(opportunity, errors, warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      info,
      riskScore: Math.min(riskScore, 100), // Cap at 100
      recommendations,
      complianceStatus
    };
  }

  // Enhanced milestone validation
  public validateMilestones(milestones: Milestone[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const info: string[] = [];
    let riskScore = 0;

    if (milestones.length === 0) {
      warnings.push('No milestones defined');
      riskScore += 5;
    }

    milestones.forEach((milestone, index) => {
      // Check for overdue milestones
      if (new Date(milestone.target_date) < new Date() && milestone.status !== 'completed') {
        errors.push(`Milestone "${milestone.title}" is overdue`);
        riskScore += 15;
      }

      // Check for unrealistic completion percentages
      if (milestone.completion_percentage && (milestone.completion_percentage < 0 || milestone.completion_percentage > 100)) {
        errors.push(`Invalid completion percentage for milestone "${milestone.title}"`);
        riskScore += 5;
      }

      // Check for budget overruns
      if (milestone.budget && milestone.actual_cost && milestone.actual_cost > milestone.budget * 1.2) {
        warnings.push(`Milestone "${milestone.title}" has significant budget overrun`);
        riskScore += 10;
      }

      // Check for dependency issues
      if (milestone.dependencies && milestone.dependencies.length > 0) {
        const dependencyMilestones = milestone.dependencies.map(depId => 
          milestones.find(m => m.id === depId)
        ).filter(Boolean);
        
        if (dependencyMilestones.some(dep => dep?.status !== 'completed')) {
          warnings.push(`Milestone "${milestone.title}" has incomplete dependencies`);
          riskScore += 5;
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      info,
      riskScore,
      recommendations: [],
      complianceStatus: 'compliant'
    };
  }

  // Enhanced milestone status evaluation
  public evaluateMilestoneStatus(milestone: Milestone): MilestoneStatus {
    const targetDate = new Date(milestone.target_date);
    const now = new Date();

    if (milestone.status === 'completed') {
      return 'completed';
    }

    if (milestone.status === 'cancelled') {
      return 'cancelled';
    }

    if (targetDate < now) {
      return 'overdue';
    }

    if (milestone.completion_percentage && milestone.completion_percentage > 0) {
      return 'in_progress';
    }

    return 'pending';
  }

  // AI output validation
  public validateAIOutput(type: string, output: any): any {
    switch (type) {
      case 'risk_score':
        const score = parseFloat(output);
        return isNaN(score) ? 50 : Math.max(0, Math.min(100, score));
      
      case 'opportunity_rating':
        const rating = parseFloat(output);
        return isNaN(rating) ? 3 : Math.max(1, Math.min(5, rating));
      
      case 'funding_recommendation':
        return typeof output === 'string' ? output : 'requires_review';
      
      case 'compliance_check':
        return typeof output === 'boolean' ? output : false;
      
      default:
        return output;
    }
  }

  // Calculate compliance status
  private calculateComplianceStatus(errors: string[], warnings: string[]): 'compliant' | 'non_compliant' | 'requires_review' {
    const criticalErrors = errors.filter(error => 
      error.toLowerCase().includes('compliance') || 
      error.toLowerCase().includes('regulatory') ||
      error.toLowerCase().includes('kyc') ||
      error.toLowerCase().includes('aml')
    );

    if (criticalErrors.length > 0) {
      return 'non_compliant';
    }

    if (errors.length > 0 || warnings.length > 5) {
      return 'requires_review';
    }

    return 'compliant';
  }

  // Generate recommendations
  private generateRecommendations(opportunity: Opportunity, errors: string[], warnings: string[]): string[] {
    const recommendations: string[] = [];

    // Financial recommendations
    if (errors.some(e => e.includes('equity'))) {
      recommendations.push('Review and adjust equity offering percentage');
    }

    if (warnings.some(w => w.includes('funding amount'))) {
      recommendations.push('Consider adjusting funding amount based on market conditions');
    }

    // Legal recommendations
    if (errors.some(e => e.includes('documents'))) {
      recommendations.push('Complete all required legal documentation before proceeding');
    }

    if (warnings.some(w => w.includes('intellectual property'))) {
      recommendations.push('Secure intellectual property protection as soon as possible');
    }

    // Operational recommendations
    if (warnings.some(w => w.includes('market research'))) {
      recommendations.push('Conduct comprehensive market research and validation');
    }

    // Technical recommendations
    if (warnings.some(w => w.includes('technology readiness'))) {
      recommendations.push('Improve technology readiness level before seeking investment');
    }

    // Compliance recommendations
    if (errors.some(e => e.includes('compliance'))) {
      recommendations.push('Address all compliance issues before proceeding with investment');
    }

    return recommendations;
  }

  // Get validation rules by category
  public getRulesByCategory(category: string): ValidationRule[] {
    return this.validationRules.filter(rule => rule.category === category);
  }

  // Add custom validation rule
  public addCustomRule(rule: ValidationRule): void {
    this.validationRules.push(rule);
  }

  // Get risk level based on score
  public getRiskLevel(score: number): RiskLevel {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 30) return 'medium';
    return 'low';
  }

  // Validate observer permissions
  public validateObserverAccess(observer: any, resource: string, action: string): boolean {
    if (!observer || observer.status !== 'active') {
      return false;
    }

    const requiredPermission = `${action}_${resource}`;
    return observer.permissions.some((perm: any) => perm.type === requiredPermission);
  }
}

// Export singleton instance
export const drbe = DRBE.getInstance();

