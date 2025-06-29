
import * as tf from '@tensorflow/tfjs';

export interface AIInput {
  equity_offered?: number;
  target_amount?: number;
  team_size?: number;
  market_size?: number;
  competition_level?: number;
  industry?: string;
  location?: string;
  business_stage?: string;
  views?: number;
  interested_investors?: number;
}

// Database opportunity interface matching actual schema
interface DatabaseOpportunity {
  id: string;
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
  views: number;
  interested_investors: number;
  total_raised: number;
  risk_score?: number;
  expected_return?: number;
  timeline?: number;
  team_size?: number;
  founded_year?: number;
  tags?: string[];
  entrepreneur_id: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  closed_at?: string;
}

export const getRiskScore = async (input: number[]): Promise<number> => {
  try {
    console.log('Mock AI: Calculating risk score for input:', input);
    
    // Mock risk calculation based on equity offered
    const equityOffered = input[0] || 0;
    let riskScore = 0.5; // Base risk
    
    if (equityOffered > 50) {
      riskScore = 0.8; // High risk for high equity
    } else if (equityOffered > 25) {
      riskScore = 0.6; // Medium risk
    } else if (equityOffered > 10) {
      riskScore = 0.4; // Low-medium risk
    } else {
      riskScore = 0.3; // Low risk
    }
    
    // Add some randomness
    riskScore += (Math.random() - 0.5) * 0.2;
    riskScore = Math.max(0, Math.min(1, riskScore)); // Clamp between 0 and 1
    
    console.log('Mock AI: Risk score calculated:', riskScore);
    return riskScore;
  } catch (error) {
    console.error('Risk scoring error (falling back to default):', error);
    return 0.5; // Default medium risk
  }
};

export const getMarketAnalysis = async (opportunity: DatabaseOpportunity): Promise<{
  market_size: number;
  growth_rate: number;
  competition_level: number;
  market_timing_score: number;
}> => {
  try {
    console.log('Mock AI: Analyzing market for opportunity:', opportunity.title);
    
    // Mock market analysis based on industry and other factors
    const industryMultipliers: { [key: string]: number } = {
      'technology': 1.2,
      'healthcare': 1.1,
      'finance': 1.0,
      'energy': 0.9,
      'retail': 0.8,
    };
    
    const multiplier = industryMultipliers[opportunity.industry.toLowerCase()] || 1.0;
    
    const analysis = {
      market_size: Math.floor((Math.random() * 1000 + 100) * multiplier), // Million USD
      growth_rate: Math.random() * 20 + 5, // 5-25% growth
      competition_level: Math.random() * 10 + 1, // 1-10 scale
      market_timing_score: Math.random() * 10 + 1, // 1-10 scale
    };
    
    console.log('Mock AI: Market analysis completed:', analysis);
    return analysis;
  } catch (error) {
    console.error('Market analysis error:', error);
    return {
      market_size: 500,
      growth_rate: 10,
      competition_level: 5,
      market_timing_score: 5
    };
  }
};

export const getInvestmentRecommendations = async (
  investor_profile: any,
  opportunities: DatabaseOpportunity[]
): Promise<{
  recommended_opportunities: string[];
  risk_assessment: { [opportunityId: string]: number };
  expected_returns: { [opportunityId: string]: number };
}> => {
  try {
    console.log('Mock AI: Generating investment recommendations');
    
    const recommendations = {
      recommended_opportunities: opportunities.slice(0, 3).map(opp => opp.id),
      risk_assessment: {} as { [opportunityId: string]: number },
      expected_returns: {} as { [opportunityId: string]: number },
    };
    
    opportunities.forEach(opp => {
      recommendations.risk_assessment[opp.id] = Math.random();
      recommendations.expected_returns[opp.id] = Math.random() * 50 + 10; // 10-60% returns
    });
    
    console.log('Mock AI: Recommendations generated:', recommendations);
    return recommendations;
  } catch (error) {
    console.error('Investment recommendations error:', error);
    return {
      recommended_opportunities: [],
      risk_assessment: {},
      expected_returns: {}
    };
  }
};

export const getDueDiligenceScore = async (opportunity: DatabaseOpportunity): Promise<{
  overall_score: number;
  financial_score: number;
  team_score: number;
  market_score: number;
  technology_score: number;
  legal_score: number;
}> => {
  try {
    console.log('Mock AI: Calculating due diligence score for:', opportunity.title);
    
    const scores = {
      overall_score: Math.random() * 10 + 1,
      financial_score: Math.random() * 10 + 1,
      team_score: Math.random() * 10 + 1,
      market_score: Math.random() * 10 + 1,
      technology_score: Math.random() * 10 + 1,
      legal_score: Math.random() * 10 + 1,
    };
    
    // Calculate overall as average
    scores.overall_score = (
      scores.financial_score +
      scores.team_score +
      scores.market_score +
      scores.technology_score +
      scores.legal_score
    ) / 5;
    
    console.log('Mock AI: Due diligence scores:', scores);
    return scores;
  } catch (error) {
    console.error('Due diligence scoring error:', error);
    return {
      overall_score: 5,
      financial_score: 5,
      team_score: 5,
      market_score: 5,
      technology_score: 5,
      legal_score: 5
    };
  }
};

export const getPortfolioOptimization = async (
  current_investments: any[],
  risk_tolerance: number,
  target_return: number
): Promise<{
  recommended_allocation: { [opportunityId: string]: number };
  expected_portfolio_return: number;
  portfolio_risk_score: number;
  diversification_score: number;
}> => {
  try {
    console.log('Mock AI: Optimizing portfolio');
    
    const optimization = {
      recommended_allocation: {} as { [opportunityId: string]: number },
      expected_portfolio_return: target_return * (0.8 + Math.random() * 0.4), // ±20%
      portfolio_risk_score: risk_tolerance * (0.9 + Math.random() * 0.2), // ±10%
      diversification_score: Math.random() * 10 + 1,
    };
    
    // Mock allocations for current investments
    current_investments.forEach((inv, index) => {
      optimization.recommended_allocation[inv.id] = Math.random() * 30 + 10; // 10-40%
    });
    
    console.log('Mock AI: Portfolio optimization completed:', optimization);
    return optimization;
  } catch (error) {
    console.error('Portfolio optimization error:', error);
    return {
      recommended_allocation: {},
      expected_portfolio_return: target_return,
      portfolio_risk_score: risk_tolerance,
      diversification_score: 5
    };
  }
};

// AI Model Manager for backward compatibility
class AIModelManager {
  async getRiskScore(input: number[]): Promise<number> {
    return getRiskScore(input);
  }

  async getMarketAnalysis(opportunity: DatabaseOpportunity) {
    return getMarketAnalysis(opportunity);
  }

  async getInvestmentRecommendations(investor_profile: any, opportunities: DatabaseOpportunity[]) {
    return getInvestmentRecommendations(investor_profile, opportunities);
  }

  async getDueDiligenceScore(opportunity: DatabaseOpportunity) {
    return getDueDiligenceScore(opportunity);
  }

  async getPortfolioOptimization(current_investments: any[], risk_tolerance: number, target_return: number) {
    return getPortfolioOptimization(current_investments, risk_tolerance, target_return);
  }

  // Helper method that matches the test expectations
  calculateRiskScore(opportunity: any): number {
    // Simple synchronous risk calculation for testing
    const equity = opportunity.equity_offered || 0;
    if (equity > 50) return 80;
    if (equity > 25) return 60;
    if (equity > 10) return 40;
    return 30;
  }
}

export const aiModelManager = new AIModelManager();
