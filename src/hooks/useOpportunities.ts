
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  industry: string;
  location: string;
  targetAmount: number;
  equityOffered: number;
  minInvestment: number;
  maxInvestment?: number;
  fundingType: 'equity' | 'debt' | 'convertible';
  businessStage: 'idea' | 'startup' | 'growth' | 'mature';
  status: 'draft' | 'published' | 'funded' | 'closed';
  useOfFunds?: string;
  website?: string;
  linkedin?: string;
  pitchDeckUrl?: string;
  views: number;
  interestedInvestors: number;
  totalRaised: number;
  riskScore?: number;
  expectedReturn?: number;
  timeline?: number;
  teamSize?: number;
  foundedYear?: number;
  tags?: string[];
  entrepreneurId: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  closedAt?: Date;
}

export const useOpportunities = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedOpportunities = data?.map(opp => ({
        id: opp.id,
        title: opp.title,
        description: opp.description,
        industry: opp.industry,
        location: opp.location,
        targetAmount: Number(opp.target_amount),
        equityOffered: Number(opp.equity_offered),
        minInvestment: Number(opp.min_investment),
        maxInvestment: opp.max_investment ? Number(opp.max_investment) : undefined,
        fundingType: opp.funding_type as Opportunity['fundingType'],
        businessStage: opp.business_stage as Opportunity['businessStage'],
        status: opp.status as Opportunity['status'],
        useOfFunds: opp.use_of_funds,
        website: opp.website,
        linkedin: opp.linkedin,
        pitchDeckUrl: opp.pitch_deck_url,
        views: opp.views || 0,
        interestedInvestors: opp.interested_investors || 0,
        totalRaised: Number(opp.total_raised || 0),
        riskScore: opp.risk_score ? Number(opp.risk_score) : undefined,
        expectedReturn: opp.expected_return ? Number(opp.expected_return) : undefined,
        timeline: opp.timeline,
        teamSize: opp.team_size,
        foundedYear: opp.founded_year,
        tags: opp.tags,
        entrepreneurId: opp.entrepreneur_id,
        createdAt: new Date(opp.created_at),
        updatedAt: new Date(opp.updated_at),
        publishedAt: opp.published_at ? new Date(opp.published_at) : undefined,
        closedAt: opp.closed_at ? new Date(opp.closed_at) : undefined
      })) || [];

      setOpportunities(formattedOpportunities);
    } catch (err) {
      console.error('Error fetching opportunities:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch opportunities');
    } finally {
      setLoading(false);
    }
  };

  const createOpportunity = async (opportunityData: Omit<Opportunity, 'id' | 'views' | 'interestedInvestors' | 'totalRaised' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'closedAt'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('opportunities')
        .insert({
          entrepreneur_id: user.id,
          title: opportunityData.title,
          description: opportunityData.description,
          industry: opportunityData.industry,
          location: opportunityData.location,
          target_amount: opportunityData.targetAmount,
          equity_offered: opportunityData.equityOffered,
          min_investment: opportunityData.minInvestment,
          max_investment: opportunityData.maxInvestment,
          funding_type: opportunityData.fundingType,
          business_stage: opportunityData.businessStage,
          status: opportunityData.status,
          use_of_funds: opportunityData.useOfFunds,
          website: opportunityData.website,
          linkedin: opportunityData.linkedin,
          pitch_deck_url: opportunityData.pitchDeckUrl,
          expected_return: opportunityData.expectedReturn,
          timeline: opportunityData.timeline,
          team_size: opportunityData.teamSize,
          founded_year: opportunityData.foundedYear,
          tags: opportunityData.tags
        })
        .select()
        .single();

      if (error) throw error;

      await fetchOpportunities();
      return data;
    } catch (err) {
      console.error('Error creating opportunity:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  return {
    opportunities,
    loading,
    error,
    createOpportunity,
    refetch: fetchOpportunities
  };
};
