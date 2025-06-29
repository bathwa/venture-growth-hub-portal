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

export async function createInvestmentPool(data: {
  name: string;
  description: string;
  type: 'venture' | 'angel' | 'syndicate' | 'fund';
  targetAmount: number;
  minimumInvestment: number;
  maximumInvestment: number;
  currency: string;
  createdBy: string;
  managerId: string;
  investmentStrategy: string;
  riskProfile: string;
  termLength: number;
  managementFee: number;
  performanceFee: number;
  autoApprove: boolean;
  requireVote: boolean;
  maxMembers: number;
}): Promise<InvestmentPool> {
  // Mock implementation for now
  const pool: InvestmentPool = {
    id: `pool-${Date.now()}`,
    name: data.name,
    description: data.description,
    type: data.type,
    status: 'forming',
    target_amount: data.targetAmount,
    minimum_investment: data.minimumInvestment,
    maximum_investment: data.maximumInvestment,
    manager_id: data.managerId,
    term_length_months: data.termLength,
    management_fee_percentage: data.managementFee,
    performance_fee_percentage: data.performanceFee,
    auto_approve_investments: data.autoApprove,
    require_majority_vote: data.requireVote,
    max_members: data.maxMembers,
    current_members: 0,
    total_committed: 0,
    total_invested: 0,
    total_distributed: 0,
    currency: data.currency,
    investment_strategy: data.investmentStrategy,
    risk_profile: data.riskProfile,
    created_by: data.createdBy,
    created_at: new Date(),
    updated_at: new Date(),
    logo_url: '',
    management_fee: data.managementFee,
    carried_interest: data.performanceFee,
    is_active: true
  };
  
  return pool;
}

export async function getPoolsByUser(userId: string): Promise<InvestmentPool[]> {
  // Mock implementation
  return [];
}

export async function getPoolsWhereMember(userId: string): Promise<InvestmentPool[]> {
  // Mock implementation
  return [];
}

export async function getInvestmentPool(poolId: string): Promise<InvestmentPool | null> {
  // Mock implementation
  return null;
}

export async function getPoolMembers(poolId: string): Promise<PoolMember[]> {
  // Mock implementation
  return [];
}

export async function addPoolMember(data: {
  poolId: string;
  userId: string;
  role: 'manager' | 'investor' | 'observer';
  committedAmount: number;
}): Promise<PoolMember> {
  // Mock implementation
  const member: PoolMember = {
    id: `member-${Date.now()}`,
    pool_id: data.poolId,
    user_id: data.userId,
    role: data.role,
    status: 'pending',
    committed_amount: data.committedAmount,
    invested_amount: 0,
    distributed_amount: 0,
    voting_power: 1,
    kyc_verified: false,
    joined_at: new Date()
  };
  
  return member;
}

export async function getPoolInvestments(poolId: string): Promise<PoolInvestment[]> {
  // Mock implementation
  return [];
}

export async function voteOnInvestment(data: {
  investmentId: string;
  memberId: string;
  voteType: string;
  comments: string;
}): Promise<void> {
  // Mock implementation
  return;
}

export async function getInvestmentVotes(investmentId: string): Promise<PoolVote[]> {
  // Mock implementation
  return [];
}

export async function executeInvestment(investmentId: string): Promise<void> {
  // Mock implementation
  return;
}

export async function getPoolStats(poolId: string): Promise<any> {
  // Mock implementation
  return {
    totalMembers: 0,
    activeMembers: 0,
    totalCommitted: 0,
    totalInvested: 0,
    investmentCount: 0,
    activeInvestments: 0,
    fundUtilization: 0
  };
}

export async function activatePool(poolId: string): Promise<void> {
  // Mock implementation
  return;
}

export async function closePool(poolId: string): Promise<void> {
  // Mock implementation
  return;
}

export async function proposeInvestment(data: {
  poolId: string;
  opportunityId: string;
  amount: number;
  currency: string;
  proposedBy: string;
  notes: string;
}): Promise<PoolInvestment> {
  // Mock implementation
  const investment: PoolInvestment = {
    id: `investment-${Date.now()}`,
    pool_id: data.poolId,
    opportunity_id: data.opportunityId,
    proposed_by: data.proposedBy,
    amount: data.amount,
    currency: data.currency,
    status: 'proposed',
    proposed_at: new Date(),
    notes: data.notes,
    created_at: new Date()
  };
  
  return investment;
}
