// Investment Pool Management System
// Manages investment pools for collective investment opportunities

import { supabase } from '@/integrations/supabase/client';

export type PoolStatus = 'forming' | 'active' | 'investing' | 'distributing' | 'closed' | 'cancelled';
export type PoolType = 'syndicate' | 'fund' | 'collective' | 'angel_group';
export type MemberRole = 'manager' | 'investor' | 'advisor' | 'observer';
export type VoteType = 'approve' | 'reject' | 'abstain';

export interface InvestmentPool {
  id: string;
  name: string;
  description: string;
  type: PoolType;
  status: PoolStatus;
  target_amount: number;
  minimum_investment: number;
  maximum_investment: number;
  currency: string;
  created_by: string;
  manager_id: string;
  created_at: string;
  updated_at: string;
  investment_strategy: string;
  risk_profile: 'conservative' | 'moderate' | 'aggressive';
  term_length_months: number;
  management_fee_percentage: number;
  performance_fee_percentage: number;
  auto_approve_investments: boolean;
  require_majority_vote: boolean;
  max_members: number;
  current_members: number;
  total_committed: number;
  total_invested: number;
  total_distributed: number;
}

export interface PoolMember {
  id: string;
  pool_id: string;
  user_id: string;
  role: MemberRole;
  committed_amount: number;
  invested_amount: number;
  distributed_amount: number;
  joined_at: string;
  status: 'active' | 'pending' | 'suspended' | 'left';
  voting_power: number;
  kyc_verified: boolean;
  investment_preferences: string[];
}

export interface PoolInvestment {
  id: string;
  pool_id: string;
  opportunity_id: string;
  amount: number;
  currency: string;
  status: 'proposed' | 'voting' | 'approved' | 'rejected' | 'invested' | 'exited';
  proposed_by: string;
  proposed_at: string;
  voting_deadline?: string;
  investment_date?: string;
  exit_date?: string;
  return_percentage?: number;
  notes?: string;
}

export interface PoolVote {
  id: string;
  investment_id: string;
  member_id: string;
  vote_type: VoteType;
  voted_at: string;
  comments?: string;
}

export interface PoolDistribution {
  id: string;
  pool_id: string;
  investment_id: string;
  amount: number;
  currency: string;
  distribution_date: string;
  distribution_type: 'dividend' | 'capital_return' | 'exit_proceeds';
  per_member_breakdown: Record<string, number>;
}

// --- Supabase-backed functions ---

// Create new investment pool
export async function createInvestmentPool({
  name,
  description,
  type,
  targetAmount,
  minimumInvestment,
  maximumInvestment,
  currency,
  createdBy,
  managerId,
  investmentStrategy,
  riskProfile,
  termLength,
  managementFee,
  performanceFee,
  autoApprove,
  requireVote,
  maxMembers
}: {
  name: string;
  description: string;
  type: PoolType;
  targetAmount: number;
  minimumInvestment: number;
  maximumInvestment: number;
  currency: string;
  createdBy: string;
  managerId: string;
  investmentStrategy: string;
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  termLength: number;
  managementFee: number;
  performanceFee: number;
  autoApprove: boolean;
  requireVote: boolean;
  maxMembers: number;
}): Promise<InvestmentPool> {
  const { data, error } = await supabase
    .from('investment_pools')
    .insert([
      {
        name,
        description,
        type,
        status: 'forming',
        target_amount: targetAmount,
        minimum_investment: minimumInvestment,
        maximum_investment: maximumInvestment,
        currency,
        created_by: createdBy,
        manager_id: managerId,
        investment_strategy: investmentStrategy,
        risk_profile: riskProfile,
        term_length_months: termLength,
        management_fee_percentage: managementFee,
        performance_fee_percentage: performanceFee,
        auto_approve_investments: autoApprove,
        require_majority_vote: requireVote,
        max_members: maxMembers,
        current_members: 1,
        total_committed: 0,
        total_invested: 0,
        total_distributed: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ])
    .select()
    .single();

  if (error) throw error;

  // Add creator as manager member
  await addPoolMember({
    poolId: data.id,
    userId: createdBy,
    role: 'manager',
    committedAmount: 0
  });

  return data as InvestmentPool;
}

// Get pool by ID
export async function getInvestmentPool(poolId: string): Promise<InvestmentPool | null> {
  const { data, error } = await supabase
    .from('investment_pools')
    .select('*')
    .eq('id', poolId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as InvestmentPool | null;
}

// Get pools by user (created or member)
export async function getPoolsByUser(userId: string): Promise<InvestmentPool[]> {
  const { data, error } = await supabase
    .from('investment_pools')
    .select('*')
    .or(`created_by.eq.${userId},manager_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as InvestmentPool[];
}

// Get pools where user is a member
export async function getPoolsWhereMember(userId: string): Promise<InvestmentPool[]> {
  const { data, error } = await supabase
    .from('pool_members')
    .select(`
      pool_id,
      investment_pools (*)
    `)
    .eq('user_id', userId)
    .eq('status', 'active');

  if (error) throw error;
  return data.map((item: any) => item.investment_pools) as InvestmentPool[];
}

// Add member to pool
export async function addPoolMember({
  poolId,
  userId,
  role,
  committedAmount
}: {
  poolId: string;
  userId: string;
  role: MemberRole;
  committedAmount: number;
}): Promise<PoolMember> {
  // Check if user is already a member
  const existingMember = await getPoolMember(poolId, userId);
  if (existingMember) {
    throw new Error('User is already a member of this pool');
  }

  // Get pool details
  const pool = await getInvestmentPool(poolId);
  if (!pool) throw new Error('Pool not found');

  if (pool.current_members >= pool.max_members) {
    throw new Error('Pool has reached maximum member limit');
  }

  // Calculate voting power based on committed amount
  const votingPower = Math.floor(committedAmount / pool.minimum_investment);

  const { data, error } = await supabase
    .from('pool_members')
    .insert([
      {
        pool_id: poolId,
        user_id: userId,
        role,
        committed_amount: committedAmount,
        invested_amount: 0,
        distributed_amount: 0,
        voting_power: votingPower,
        kyc_verified: false,
        investment_preferences: [],
        status: 'pending',
        joined_at: new Date().toISOString()
      }
    ])
    .select()
    .single();

  if (error) throw error;

  // Update pool member count
  await supabase
    .from('investment_pools')
    .update({
      current_members: pool.current_members + 1,
      total_committed: pool.total_committed + committedAmount,
      updated_at: new Date().toISOString()
    })
    .eq('id', poolId);

  return data as PoolMember;
}

// Get pool member
export async function getPoolMember(poolId: string, userId: string): Promise<PoolMember | null> {
  const { data, error } = await supabase
    .from('pool_members')
    .select('*')
    .eq('pool_id', poolId)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as PoolMember | null;
}

// Get all pool members
export async function getPoolMembers(poolId: string): Promise<PoolMember[]> {
  const { data, error } = await supabase
    .from('pool_members')
    .select('*')
    .eq('pool_id', poolId)
    .order('joined_at', { ascending: true });

  if (error) throw error;
  return data as PoolMember[];
}

// Update member commitment
export async function updateMemberCommitment(
  poolId: string,
  userId: string,
  newAmount: number
): Promise<void> {
  const member = await getPoolMember(poolId, userId);
  if (!member) throw new Error('Member not found');

  const pool = await getInvestmentPool(poolId);
  if (!pool) throw new Error('Pool not found');

  const amountDifference = newAmount - member.committed_amount;

  // Update member
  const { error: memberError } = await supabase
    .from('pool_members')
    .update({
      committed_amount: newAmount,
      voting_power: Math.floor(newAmount / pool.minimum_investment)
    })
    .eq('pool_id', poolId)
    .eq('user_id', userId);

  if (memberError) throw memberError;

  // Update pool totals
  const { error: poolError } = await supabase
    .from('investment_pools')
    .update({
      total_committed: pool.total_committed + amountDifference,
      updated_at: new Date().toISOString()
    })
    .eq('id', poolId);

  if (poolError) throw poolError;
}

// Propose investment
export async function proposeInvestment({
  poolId,
  opportunityId,
  amount,
  currency,
  proposedBy,
  notes
}: {
  poolId: string;
  opportunityId: string;
  amount: number;
  currency: string;
  proposedBy: string;
  notes?: string;
}): Promise<PoolInvestment> {
  const pool = await getInvestmentPool(poolId);
  if (!pool) throw new Error('Pool not found');

  if (pool.status !== 'active' && pool.status !== 'investing') {
    throw new Error('Pool is not in active or investing status');
  }

  const status = pool.auto_approve_investments ? 'approved' : 'voting';
  const votingDeadline = pool.auto_approve_investments ? undefined : 
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('pool_investments')
    .insert([
      {
        pool_id: poolId,
        opportunity_id: opportunityId,
        amount,
        currency,
        status,
        proposed_by: proposedBy,
        proposed_at: new Date().toISOString(),
        voting_deadline: votingDeadline,
        notes
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data as PoolInvestment;
}

// Get pool investments
export async function getPoolInvestments(poolId: string): Promise<PoolInvestment[]> {
  const { data, error } = await supabase
    .from('pool_investments')
    .select('*')
    .eq('pool_id', poolId)
    .order('proposed_at', { ascending: false });

  if (error) throw error;
  return data as PoolInvestment[];
}

// Vote on investment
export async function voteOnInvestment({
  investmentId,
  memberId,
  voteType,
  comments
}: {
  investmentId: string;
  memberId: string;
  voteType: VoteType;
  comments?: string;
}): Promise<PoolVote> {
  // Check if already voted
  const existingVote = await getMemberVote(investmentId, memberId);
  if (existingVote) {
    throw new Error('Member has already voted on this investment');
  }

  const { data, error } = await supabase
    .from('pool_votes')
    .insert([
      {
        investment_id: investmentId,
        member_id: memberId,
        vote_type: voteType,
        voted_at: new Date().toISOString(),
        comments
      }
    ])
    .select()
    .single();

  if (error) throw error;

  // Check if voting is complete and update investment status
  await checkVotingComplete(investmentId);

  return data as PoolVote;
}

// Get member vote
export async function getMemberVote(investmentId: string, memberId: string): Promise<PoolVote | null> {
  const { data, error } = await supabase
    .from('pool_votes')
    .select('*')
    .eq('investment_id', investmentId)
    .eq('member_id', memberId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as PoolVote | null;
}

// Get all votes for investment
export async function getInvestmentVotes(investmentId: string): Promise<PoolVote[]> {
  const { data, error } = await supabase
    .from('pool_votes')
    .select('*')
    .eq('investment_id', investmentId)
    .order('voted_at', { ascending: true });

  if (error) throw error;
  return data as PoolVote[];
}

// Check if voting is complete and update investment status
async function checkVotingComplete(investmentId: string): Promise<void> {
  const votes = await getInvestmentVotes(investmentId);
  const investment = await getPoolInvestment(investmentId);
  if (!investment) return;

  const pool = await getInvestmentPool(investment.pool_id);
  if (!pool) return;

  const members = await getPoolMembers(investment.pool_id);
  const activeMembers = members.filter(m => m.status === 'active');
  const totalVotingPower = activeMembers.reduce((sum, m) => sum + m.voting_power, 0);

  const approveVotes = votes.filter(v => v.vote_type === 'approve');
  const rejectVotes = votes.filter(v => v.vote_type === 'reject');
  
  const approvePower = approveVotes.reduce((sum, v) => {
    const member = activeMembers.find(m => m.id === v.member_id);
    return sum + (member?.voting_power || 0);
  }, 0);

  const rejectPower = rejectVotes.reduce((sum, v) => {
    const member = activeMembers.find(m => m.id === v.member_id);
    return sum + (member?.voting_power || 0);
  }, 0);

  // Check if majority is reached
  const majorityThreshold = totalVotingPower * 0.5;
  let newStatus = investment.status;

  if (approvePower > majorityThreshold) {
    newStatus = 'approved';
  } else if (rejectPower > majorityThreshold) {
    newStatus = 'rejected';
  } else if (votes.length === activeMembers.length) {
    // All members have voted but no majority
    newStatus = approvePower > rejectPower ? 'approved' : 'rejected';
  }

  if (newStatus !== investment.status) {
    await supabase
      .from('pool_investments')
      .update({ status: newStatus })
      .eq('id', investmentId);
  }
}

// Get pool investment by ID
export async function getPoolInvestment(investmentId: string): Promise<PoolInvestment | null> {
  const { data, error } = await supabase
    .from('pool_investments')
    .select('*')
    .eq('id', investmentId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as PoolInvestment | null;
}

// Execute approved investment
export async function executeInvestment(investmentId: string): Promise<void> {
  const investment = await getPoolInvestment(investmentId);
  if (!investment) throw new Error('Investment not found');

  if (investment.status !== 'approved') {
    throw new Error('Investment is not approved');
  }

  const pool = await getInvestmentPool(investment.pool_id);
  if (!pool) throw new Error('Pool not found');

  // Update investment status
  const { error: investmentError } = await supabase
    .from('pool_investments')
    .update({
      status: 'invested',
      investment_date: new Date().toISOString()
    })
    .eq('id', investmentId);

  if (investmentError) throw investmentError;

  // Update pool totals
  const { error: poolError } = await supabase
    .from('investment_pools')
    .update({
      total_invested: pool.total_invested + investment.amount,
      updated_at: new Date().toISOString()
    })
    .eq('id', investment.pool_id);

  if (poolError) throw poolError;
}

// Create distribution
export async function createDistribution({
  poolId,
  investmentId,
  amount,
  currency,
  distributionType,
  memberBreakdown
}: {
  poolId: string;
  investmentId: string;
  amount: number;
  currency: string;
  distributionType: 'dividend' | 'capital_return' | 'exit_proceeds';
  memberBreakdown: Record<string, number>;
}): Promise<PoolDistribution> {
  const { data, error } = await supabase
    .from('pool_distributions')
    .insert([
      {
        pool_id: poolId,
        investment_id: investmentId,
        amount,
        currency,
        distribution_date: new Date().toISOString(),
        distribution_type: distributionType,
        per_member_breakdown: memberBreakdown
      }
    ])
    .select()
    .single();

  if (error) throw error;

  // Update pool totals
  const pool = await getInvestmentPool(poolId);
  if (pool) {
    await supabase
      .from('investment_pools')
      .update({
        total_distributed: pool.total_distributed + amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', poolId);
  }

  return data as PoolDistribution;
}

// Get pool distributions
export async function getPoolDistributions(poolId: string): Promise<PoolDistribution[]> {
  const { data, error } = await supabase
    .from('pool_distributions')
    .select('*')
    .eq('pool_id', poolId)
    .order('distribution_date', { ascending: false });

  if (error) throw error;
  return data as PoolDistribution[];
}

// Get pool statistics
export async function getPoolStats(poolId: string): Promise<any> {
  const pool = await getInvestmentPool(poolId);
  if (!pool) throw new Error('Pool not found');

  const members = await getPoolMembers(poolId);
  const investments = await getPoolInvestments(poolId);
  const distributions = await getPoolDistributions(poolId);

  const stats = {
    totalMembers: members.length,
    activeMembers: members.filter(m => m.status === 'active').length,
    totalCommitted: pool.total_committed,
    totalInvested: pool.total_invested,
    totalDistributed: pool.total_distributed,
    investmentCount: investments.length,
    activeInvestments: investments.filter(i => i.status === 'invested').length,
    distributionCount: distributions.length,
    averageInvestmentSize: investments.length > 0 ? 
      investments.reduce((sum, i) => sum + i.amount, 0) / investments.length : 0,
    fundUtilization: pool.total_committed > 0 ? 
      (pool.total_invested / pool.total_committed) * 100 : 0
  };

  return stats;
}

// Activate pool
export async function activatePool(poolId: string): Promise<void> {
  const pool = await getInvestmentPool(poolId);
  if (!pool) throw new Error('Pool not found');

  if (pool.status !== 'forming') {
    throw new Error('Pool is not in forming status');
  }

  if (pool.total_committed < pool.target_amount * 0.5) {
    throw new Error('Pool has not reached minimum funding threshold');
  }

  const { error } = await supabase
    .from('investment_pools')
    .update({
      status: 'active',
      updated_at: new Date().toISOString()
    })
    .eq('id', poolId);

  if (error) throw error;
}

// Close pool
export async function closePool(poolId: string, reason: string): Promise<void> {
  const { error } = await supabase
    .from('investment_pools')
    .update({
      status: 'closed',
      updated_at: new Date().toISOString()
    })
    .eq('id', poolId);

  if (error) throw error;
} 