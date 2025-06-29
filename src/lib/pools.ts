
export interface InvestmentPool {
  id: string;
  name: string;
  description?: string;
  type: 'venture' | 'angel' | 'syndicate' | 'fund';
  status: 'forming' | 'active' | 'closed' | 'liquidated';
  target_amount: number;
  minimum_investment: number;
  maximum_investment: number;
  manager_id?: string;
  term_length_months: number;
  management_fee_percentage: number;
  performance_fee_percentage: number;
  auto_approve_investments: boolean;
  require_majority_vote: boolean;
  max_members?: number;
  current_members: number;
  total_committed: number;
  total_invested: number;
  total_distributed: number;
  currency: string;
  investment_strategy?: string;
  risk_profile: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
  metadata?: any;
  logo_url?: string;
  management_fee?: number;
  carried_interest?: number;
  is_active?: boolean;
}

export interface PoolMember {
  id: string;
  pool_id?: string;
  user_id?: string;
  role: 'manager' | 'investor' | 'observer';
  status: string;
  committed_amount: number;
  invested_amount: number;
  distributed_amount: number;
  voting_power: number;
  kyc_verified: boolean;
  joined_at: Date;
  investment_preferences?: string[];
  metadata?: any;
}

export interface PoolInvestment {
  id: string;
  pool_id?: string;
  opportunity_id?: string;
  proposed_by?: string;
  amount: number;
  currency: string;
  status: string;
  proposed_at: Date;
  voting_deadline?: Date;
  investment_date?: Date;
  exit_date?: Date;
  return_percentage?: number;
  notes?: string;
  created_at: Date;
  metadata?: any;
}

export interface PoolDistribution {
  id: string;
  pool_id?: string;
  investment_id?: string;
  distribution_type: string;
  amount: number;
  currency: string;
  distribution_date: Date;
  per_member_breakdown: any;
  created_at: Date;
}

export interface PoolVote {
  id: string;
  member_id?: string;
  investment_id?: string;
  vote_type: string;
  comments?: string;
  voted_at: Date;
  created_at: Date;
}
