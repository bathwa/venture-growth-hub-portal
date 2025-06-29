import { supabase } from '@/integrations/supabase/client';

export interface Opportunity {
  id: string;
  entrepreneur_id: string;
  title: string;
  description: string;
  industry: string;
  location: string;
  target_amount: number;
  equity_offered: number;
  min_investment: number;
  max_investment?: number;
  funding_type: string;
  business_stage: string;
  status: 'draft' | 'pending' | 'published' | 'funded' | 'closed' | 'cancelled';
  use_of_funds?: string;
  website?: string;
  linkedin?: string;
  pitch_deck_url?: string;
  views: number;
  interested_investors: number;
  total_raised: number;
  risk_score?: number;
  expected_return?: number;
  timeline?: number;
  team_size?: number;
  founded_year?: number;
  tags?: string[];
  created_at: string;
  updated_at: string;
  published_at?: string;
  closed_at?: string;
}

export interface CreateOpportunityData extends Partial<Opportunity> {
  entrepreneur_id: string;
  title: string;
  description: string;
  industry: string;
  location: string;
  target_amount: number;
  equity_offered: number;
  min_investment: number;
  max_investment?: number;
  funding_type: string;
  business_stage: string;
  status: string;
  use_of_funds?: string;
  website?: string;
  linkedin?: string;
  pitch_deck_url?: string;
  views?: number;
  interested_investors?: number;
  total_raised?: number;
  risk_score?: number;
  expected_return?: number;
  timeline?: number;
  team_size?: number;
  founded_year?: number;
  tags?: string[];
  type?: string;
  currency?: string;
  created_by?: string;
}

export const mapStatusToDb = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    'under_review': 'pending',
    'reviewing': 'pending',
    'draft': 'draft',
    'pending': 'pending', 
    'published': 'published',
    'funded': 'funded',
    'closed': 'closed',
    'cancelled': 'cancelled'
  };
  return statusMap[status] || 'draft';
};

export const validateOpportunity = (data: CreateOpportunityData): boolean => {
  if (!data.entrepreneur_id) return false;
  if (!data.title) return false;
  if (!data.description) return false;
  if (!data.industry) return false;
  if (!data.location) return false;
  if (!data.target_amount || data.target_amount <= 0) return false;
  if (!data.equity_offered || data.equity_offered <= 0) return false;
  if (!data.min_investment || data.min_investment <= 0) return false;
  if (!data.funding_type) return false;
  if (!data.business_stage) return false;
  if (!data.status) return false;
  return true;
};

export const createOpportunity = async (opportunityData: CreateOpportunityData): Promise<Opportunity> => {
  try {
    console.log('Creating opportunity with data:', opportunityData);
    
    // Add missing fields for CreateOpportunityData compatibility
    const completeData = {
      ...opportunityData,
      type: opportunityData.type || 'standard',
      currency: opportunityData.currency || 'USD',
      created_by: opportunityData.created_by || opportunityData.entrepreneur_id,
      status: mapStatusToDb(opportunityData.status || 'draft')
    };

    const { data, error } = await supabase
      .from('opportunities')
      .insert(completeData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Opportunity created successfully:', data);
    return data as Opportunity;
  } catch (error) {
    console.error('Create opportunity error:', error);
    throw error;
  }
};

export const getOpportunities = async (): Promise<Opportunity[]> => {
  try {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Opportunity[];
  } catch (error) {
    console.error('Get opportunities error:', error);
    return [];
  }
};

export const getOpportunity = async (id: string): Promise<Opportunity | null> => {
  try {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Opportunity;
  } catch (error) {
    console.error('Get opportunity error:', error);
    return null;
  }
};

export const updateOpportunity = async (id: string, updates: Partial<Opportunity>): Promise<Opportunity> => {
  try {
    // Map status to database enum if provided
    const dbUpdates = { ...updates };
    if (dbUpdates.status) {
      dbUpdates.status = mapStatusToDb(dbUpdates.status);
    }

    const { data, error } = await supabase
      .from('opportunities')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Opportunity;
  } catch (error) {
    console.error('Update opportunity error:', error);
    throw error;
  }
};

export const deleteOpportunity = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('opportunities')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Delete opportunity error:', error);
    throw error;
  }
};

export const publishOpportunity = async (id: string): Promise<Opportunity> => {
  try {
    const { data, error } = await supabase
      .from('opportunities')
      .update({ 
        status: 'published',
        published_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Opportunity;
  } catch (error) {
    console.error('Publish opportunity error:', error);
    throw error;
  }
};

export const incrementViews = async (id: string): Promise<void> => {
  try {
    // Use a simple update instead of RPC since we don't have the increment function
    const opportunity = await getOpportunity(id);
    if (opportunity) {
      await updateOpportunity(id, { views: (opportunity.views || 0) + 1 });
    }
  } catch (error) {
    console.error('Increment views error:', error);
  }
};
