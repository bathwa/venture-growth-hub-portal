
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
      const { data, error } = await supabase
        .from('investment_pools')
        .update(updates)
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
