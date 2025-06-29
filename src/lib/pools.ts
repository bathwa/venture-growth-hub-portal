
import { supabase } from '@/integrations/supabase/client';

export interface Pool {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: string;
  target_amount: number;
  currency: string;
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
  risk_profile: string;
  investment_strategy?: string;
  metadata: any;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface InvestmentPool extends Pool {}

export interface PoolMember {
  id: string;
  pool_id: string;
  user_id: string;
  role: string;
  status: string;
  committed_amount: number;
  invested_amount: number;
  distributed_amount: number;
  voting_power: number;
  kyc_verified: boolean;
  investment_preferences: string[];
  metadata: any;
  joined_at: string;
  created_at: string;
}

export interface PoolInvestment {
  id: string;
  pool_id: string;
  opportunity_id?: string;
  amount: number;
  currency: string;
  status: string;
  proposed_by?: string;
  proposed_at?: string;
  investment_date?: string;
  exit_date?: string;
  return_percentage?: number;
  voting_deadline?: string;
  notes?: string;
  metadata: any;
  created_at: string;
}

export interface PoolVote {
  id: string;
  investment_id?: string;
  member_id?: string;
  vote_type: string;
  comments?: string;
  voted_at?: string;
  created_at: string;
}

export class PoolService {
  static async createPool(poolData: any): Promise<Pool> {
    try {
      const { data, error } = await supabase
        .from('investment_pools')
        .insert(poolData)
        .select()
        .single();

      if (error) throw error;
      return data as Pool;
    } catch (error) {
      console.error('Create pool error:', error);
      throw error;
    }
  }

  static async getPools(): Promise<Pool[]> {
    try {
      const { data, error } = await supabase
        .from('investment_pools')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Pool[];
    } catch (error) {
      console.error('Get pools error:', error);
      throw error;
    }
  }

  static async getPool(id: string): Promise<Pool | null> {
    try {
      const { data, error } = await supabase
        .from('investment_pools')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Pool;
    } catch (error) {
      console.error('Get pool error:', error);
      return null;
    }
  }

  static async updatePool(id: string, updates: Partial<Pool>): Promise<Pool> {
    try {
      // Ensure status is a valid database enum value
      const dbUpdates = { ...updates };
      if (dbUpdates.status && typeof dbUpdates.status === 'string') {
        const validStatuses = ['forming', 'active', 'investing', 'distributing', 'closed', 'cancelled'];
        if (!validStatuses.includes(dbUpdates.status)) {
          dbUpdates.status = 'active'; // Default fallback
        }
      }

      const { data, error } = await supabase
        .from('investment_pools')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Pool;
    } catch (error) {
      console.error('Update pool error:', error);
      throw error;
    }
  }

  static async deletePool(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('investment_pools')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Delete pool error:', error);
      throw error;
    }
  }
}

// Export individual functions for backward compatibility
export const createPool = (poolData: any) => PoolService.createPool(poolData);
export const getPools = () => PoolService.getPools();
export const getPool = (id: string) => PoolService.getPool(id);
export const updatePool = (id: string, updates: Partial<Pool>) => PoolService.updatePool(id, updates);
export const deletePool = (id: string) => PoolService.deletePool(id);

// Mock implementations for missing functions
export const createInvestmentPool = createPool;
export const getPoolsByUser = async (userId: string): Promise<Pool[]> => {
  console.log('Mock: Getting pools by user', userId);
  return [];
};

export const getPoolsWhereMember = async (userId: string): Promise<Pool[]> => {
  console.log('Mock: Getting pools where user is member', userId);
  return [];
};

export const getInvestmentPool = getPool;

export const getPoolMembers = async (poolId: string): Promise<PoolMember[]> => {
  console.log('Mock: Getting pool members', poolId);
  return [];
};

export const addPoolMember = async (poolId: string, memberData: any): Promise<PoolMember> => {
  console.log('Mock: Adding pool member', poolId, memberData);
  return {
    id: `member-${Date.now()}`,
    pool_id: poolId,
    user_id: memberData.user_id,
    role: memberData.role || 'investor',
    status: 'active',
    committed_amount: 0,
    invested_amount: 0,
    distributed_amount: 0,
    voting_power: 0,
    kyc_verified: false,
    investment_preferences: [],
    metadata: {},
    joined_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  };
};

export const getPoolInvestments = async (poolId: string): Promise<PoolInvestment[]> => {
  console.log('Mock: Getting pool investments', poolId);
  return [];
};

export const voteOnInvestment = async (investmentId: string, memberId: string, vote: string): Promise<PoolVote> => {
  console.log('Mock: Voting on investment', investmentId, memberId, vote);
  return {
    id: `vote-${Date.now()}`,
    investment_id: investmentId,
    member_id: memberId,
    vote_type: vote,
    voted_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  };
};

export const getInvestmentVotes = async (investmentId: string): Promise<PoolVote[]> => {
  console.log('Mock: Getting investment votes', investmentId);
  return [];
};

export const executeInvestment = async (investmentId: string): Promise<void> => {
  console.log('Mock: Executing investment', investmentId);
};

export const getPoolStats = async (poolId: string): Promise<any> => {
  console.log('Mock: Getting pool stats', poolId);
  return {
    totalInvestments: 0,
    totalValue: 0,
    totalReturns: 0,
    memberCount: 0
  };
};

export const activatePool = async (poolId: string): Promise<Pool> => {
  console.log('Mock: Activating pool', poolId);
  return updatePool(poolId, { status: 'active' });
};

export const closePool = async (poolId: string): Promise<Pool> => {
  console.log('Mock: Closing pool', poolId);
  return updatePool(poolId, { status: 'closed' });
};

export const proposeInvestment = async (poolId: string, investmentData: any): Promise<PoolInvestment> => {
  console.log('Mock: Proposing investment', poolId, investmentData);
  return {
    id: `investment-${Date.now()}`,
    pool_id: poolId,
    opportunity_id: investmentData.opportunity_id,
    amount: investmentData.amount,
    currency: investmentData.currency || 'USD',
    status: 'proposed',
    proposed_by: investmentData.proposed_by,
    proposed_at: new Date().toISOString(),
    metadata: {},
    created_at: new Date().toISOString()
  };
};
