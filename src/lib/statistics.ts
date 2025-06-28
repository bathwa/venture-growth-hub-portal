import { supabase } from '@/integrations/supabase/client';

export interface PlatformStatistics {
  totalInvestments: number;
  totalOpportunities: number;
  totalUsers: number;
  uptime: number;
  totalFundingSought: number;
  totalFundingRaised: number;
  activeOpportunities: number;
  verifiedUsers: number;
}

export class StatisticsService {
  static async getPlatformStatistics(): Promise<PlatformStatistics> {
    try {
      // Get total users
      let totalUsers = 0;
      try {
        const { count } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });
        totalUsers = count || 0;
      } catch (error) {
        console.warn('Users table not found, using default value');
      }

      // Get verified users
      let verifiedUsers = 0;
      try {
        const { count } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('kyc_status', 'verified');
        verifiedUsers = count || 0;
      } catch (error) {
        console.warn('Could not fetch verified users count');
      }

      // Get opportunities
      let opportunities: any[] = [];
      try {
        const { data } = await supabase
          .from('opportunities')
          .select('target_amount, status, created_at');
        opportunities = data || [];
      } catch (error) {
        console.warn('Opportunities table not found, using empty array');
      }

      // Get investments
      let investments: any[] = [];
      try {
        const { data } = await supabase
          .from('investments')
          .select('amount, status');
        investments = data || [];
      } catch (error) {
        console.warn('Investments table not found, using empty array');
      }

      // Calculate statistics
      const totalOpportunities = opportunities.length;
      const activeOpportunities = opportunities.filter(opp => opp.status === 'published').length;
      const totalFundingSought = opportunities.reduce((sum, opp) => sum + (opp.target_amount || 0), 0);
      const totalInvestments = investments.length;
      const totalFundingRaised = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);

      return {
        totalInvestments,
        totalOpportunities,
        totalUsers,
        uptime: 99.9, // This would come from monitoring service
        totalFundingSought,
        totalFundingRaised,
        activeOpportunities,
        verifiedUsers
      };
    } catch (error) {
      console.error('Error fetching platform statistics:', error);
      // Return default values if there's an error
      return {
        totalInvestments: 0,
        totalOpportunities: 0,
        totalUsers: 0,
        uptime: 99.9,
        totalFundingSought: 0,
        totalFundingRaised: 0,
        activeOpportunities: 0,
        verifiedUsers: 0
      };
    }
  }

  static async getDashboardStatistics(userId: string, userRole: string) {
    try {
      let stats = {};

      switch (userRole) {
        case 'entrepreneur':
          let opportunities: any[] = [];
          let entrepreneurInvestments: any[] = [];
          
          try {
            const { data } = await supabase
              .from('opportunities')
              .select('*')
              .eq('entrepreneur_id', userId);
            opportunities = data || [];
          } catch (error) {
            console.warn('Opportunities table not found');
          }

          try {
            if (opportunities.length > 0) {
              const { data } = await supabase
                .from('investments')
                .select('*')
                .in('opportunity_id', opportunities.map(opp => opp.id));
              entrepreneurInvestments = data || [];
            }
          } catch (error) {
            console.warn('Investments table not found');
          }

          stats = {
            totalOpportunities: opportunities.length,
            publishedOpportunities: opportunities.filter(opp => opp.status === 'published').length,
            totalFundingSought: opportunities.reduce((sum, opp) => sum + (opp.target_amount || 0), 0),
            totalInvestments: entrepreneurInvestments.length,
            totalViews: opportunities.reduce((sum, opp) => sum + (opp.views || 0), 0)
          };
          break;

        case 'investor':
          let investorInvestments: any[] = [];
          
          try {
            const { data } = await supabase
              .from('investments')
              .select('*')
              .eq('investor_id', userId);
            investorInvestments = data || [];
          } catch (error) {
            console.warn('Investments table not found');
          }

          stats = {
            totalInvestments: investorInvestments.length,
            totalAmountInvested: investorInvestments.reduce((sum, inv) => sum + (inv.amount || 0), 0),
            activeInvestments: investorInvestments.filter(inv => inv.status === 'active').length
          };
          break;

        case 'admin':
          const platformStats = await this.getPlatformStatistics();
          stats = platformStats;
          break;

        default:
          stats = {};
      }

      return stats;
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
      return {};
    }
  }
} 