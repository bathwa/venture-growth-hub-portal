import { supabase } from '@/integrations/supabase/client';

export interface PlatformStatistics {
  totalUsers: number;
  totalOpportunities: number;
  totalInvestments: number;
  totalFunding: number;
  activeUsers: number;
  successRate: number;
}

export interface UserStatistics {
  entrepreneurs: number;
  investors: number;
  serviceProviders: number;
  poolManagers: number;
  observers: number;
  admins: number;
}

export interface OpportunityStatistics {
  total: number;
  published: number;
  funded: number;
  pending: number;
  draft: number;
  averageFundingGoal: number;
  averageEquityOffered: number;
}

export interface InvestmentStatistics {
  total: number;
  totalAmount: number;
  averageInvestment: number;
  pending: number;
  completed: number;
  failed: number;
}

export class StatisticsService {
  static async getPlatformStatistics(): Promise<PlatformStatistics> {
    try {
      // Get user count
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Get opportunity count
      const { count: opportunityCount } = await supabase
        .from('opportunities')
        .select('*', { count: 'exact', head: true });

      // Get investment count and total
      const { data: investments, count: investmentCount } = await supabase
        .from('investments')
        .select('amount, status', { count: 'exact' });

      const totalFunding = investments?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;
      const completedInvestments = investments?.filter(inv => inv.status === 'completed').length || 0;
      const successRate = investmentCount > 0 ? (completedInvestments / investmentCount) * 100 : 0;

      // Get active users (users who logged in within last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: activeUserCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', thirtyDaysAgo.toISOString());

      return {
        totalUsers: userCount || 0,
        totalOpportunities: opportunityCount || 0,
        totalInvestments: investmentCount || 0,
        totalFunding,
        activeUsers: activeUserCount || 0,
        successRate: Math.round(successRate * 100) / 100
      };
    } catch (error) {
      console.error('Error fetching platform statistics:', error);
      // Return default values if database is not available
      return {
        totalUsers: 0,
        totalOpportunities: 0,
        totalInvestments: 0,
        totalFunding: 0,
        activeUsers: 0,
        successRate: 0
      };
    }
  }

  static async getUserStatistics(): Promise<UserStatistics> {
    try {
      const { data: users } = await supabase
        .from('users')
        .select('role');

      if (!users) {
        return {
          entrepreneurs: 0,
          investors: 0,
          serviceProviders: 0,
          poolManagers: 0,
          observers: 0,
          admins: 0
        };
      }

      const roleCounts = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        entrepreneurs: roleCounts.entrepreneur || 0,
        investors: roleCounts.investor || 0,
        serviceProviders: roleCounts.service_provider || 0,
        poolManagers: roleCounts.pool || 0,
        observers: roleCounts.observer || 0,
        admins: roleCounts.admin || 0
      };
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      return {
        entrepreneurs: 0,
        investors: 0,
        serviceProviders: 0,
        poolManagers: 0,
        observers: 0,
        admins: 0
      };
    }
  }

  static async getOpportunityStatistics(): Promise<OpportunityStatistics> {
    try {
      const { data: opportunities } = await supabase
        .from('opportunities')
        .select('status, target_amount, equity_offered');

      if (!opportunities || opportunities.length === 0) {
        return {
          total: 0,
          published: 0,
          funded: 0,
          pending: 0,
          draft: 0,
          averageFundingGoal: 0,
          averageEquityOffered: 0
        };
      }

      const statusCounts = opportunities.reduce((acc, opp) => {
        acc[opp.status] = (acc[opp.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const totalFundingGoal = opportunities.reduce((sum, opp) => sum + (opp.target_amount || 0), 0);
      const totalEquityOffered = opportunities.reduce((sum, opp) => sum + (opp.equity_offered || 0), 0);

      return {
        total: opportunities.length,
        published: statusCounts.published || 0,
        funded: statusCounts.funded || 0,
        pending: statusCounts.pending || 0,
        draft: statusCounts.draft || 0,
        averageFundingGoal: Math.round(totalFundingGoal / opportunities.length),
        averageEquityOffered: Math.round((totalEquityOffered / opportunities.length) * 100) / 100
      };
    } catch (error) {
      console.error('Error fetching opportunity statistics:', error);
      return {
        total: 0,
        published: 0,
        funded: 0,
        pending: 0,
        draft: 0,
        averageFundingGoal: 0,
        averageEquityOffered: 0
      };
    }
  }

  static async getInvestmentStatistics(): Promise<InvestmentStatistics> {
    try {
      const { data: investments } = await supabase
        .from('investments')
        .select('amount, status');

      if (!investments || investments.length === 0) {
        return {
          total: 0,
          totalAmount: 0,
          averageInvestment: 0,
          pending: 0,
          completed: 0,
          failed: 0
        };
      }

      const statusCounts = investments.reduce((acc, inv) => {
        acc[inv.status] = (acc[inv.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const totalAmount = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);

      return {
        total: investments.length,
        totalAmount,
        averageInvestment: Math.round(totalAmount / investments.length),
        pending: statusCounts.pending || 0,
        completed: statusCounts.completed || 0,
        failed: statusCounts.failed || 0
      };
    } catch (error) {
      console.error('Error fetching investment statistics:', error);
      return {
        total: 0,
        totalAmount: 0,
        averageInvestment: 0,
        pending: 0,
        completed: 0,
        failed: 0
      };
    }
  }

  static async getAllStatistics() {
    try {
      const [platform, users, opportunities, investments] = await Promise.all([
        this.getPlatformStatistics(),
        this.getUserStatistics(),
        this.getOpportunityStatistics(),
        this.getInvestmentStatistics()
      ]);

      return {
        platform,
        users,
        opportunities,
        investments
      };
    } catch (error) {
      console.error('Error fetching all statistics:', error);
      return {
        platform: await this.getPlatformStatistics(),
        users: await this.getUserStatistics(),
        opportunities: await this.getOpportunityStatistics(),
        investments: await this.getInvestmentStatistics()
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