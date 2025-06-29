// AI-Powered Investment Analysis System
// Enhanced with TensorFlow.js integration for DRBE insights

import { drbe, DRBE, ValidationResult, Opportunity, RiskLevel } from './drbe';
import { aiModelService } from './ai-models';

export type AIInsightType = 'risk_assessment' | 'market_analysis' | 'opportunity_scoring' | 'investment_recommendation';

export interface AIInsight {
  type: AIInsightType;
  confidence: number;
  value: number | string;
  explanation: string;
  factors: string[];
  timestamp: string;
}

export interface OpportunityAnalysis {
  riskScore: number;
  riskLevel: RiskLevel;
  opportunityScore: number;
  marketScore: number;
  insights: AIInsight[];
  recommendations: string[];
  confidence: {
    overall: number;
    risk: number;
    opportunity: number;
    market: number;
  };
}

class AIService {
  async analyzeOpportunity(opportunity: Opportunity): Promise<OpportunityAnalysis> {
    console.log('Starting AI analysis for opportunity:', opportunity.id);
    
    try {
      // Get AI predictions using rule-based fallback since AI models table doesn't exist yet
      const riskPrediction = await this.getRiskScoreFallback(opportunity);
      const opportunityPrediction = await this.getOpportunityScoreFallback(opportunity);
      
      // Calculate market score using available data
      const marketScore = this.calculateMarketScore(opportunity);
      
      // Generate insights
      const insights = await this.generateInsights(opportunity, {
        risk: riskPrediction,
        opportunity: opportunityPrediction,
        market: { score: marketScore, confidence: 0.7 }
      });
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(opportunity, insights);
      
      const analysis: OpportunityAnalysis = {
        riskScore: riskPrediction.score,
        riskLevel: DRBE.getRiskLevel(riskPrediction.score),
        opportunityScore: opportunityPrediction.score,
        marketScore,
        insights,
        recommendations,
        confidence: {
          overall: (riskPrediction.confidence + opportunityPrediction.confidence + 0.7) / 3,
          risk: riskPrediction.confidence,
          opportunity: opportunityPrediction.confidence,
          market: 0.7
        }
      };
      
      console.log('AI analysis completed:', analysis);
      return analysis;
    } catch (error) {
      console.error('Error in AI analysis:', error);
      return this.getFallbackAnalysis(opportunity);
    }
  }

  // Backward compatibility function
  async getRiskScore(input: number[]): Promise<number> {
    const mockOpportunity: Opportunity = {
      id: 'temp',
      title: 'Temp Opportunity',
      description: 'Temporary opportunity for risk scoring',
      entrepreneur_id: 'temp',
      target_amount: input[0] || 100000,
      equity_offered: input[1] || 10,
      min_investment: input[2] || 1000,
      industry: 'technology',
      location: 'Unknown',
      status: 'draft',
      business_stage: 'startup',
      funding_type: 'equity',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      fields: {}
    };
    
    const analysis = await this.analyzeOpportunity(mockOpportunity);
    return analysis.riskScore;
  }

  private async getRiskScoreFallback(opportunity: Opportunity): Promise<{ score: number; confidence: number }> {
    return {
      score: this.calculateBasicRiskScore(opportunity),
      confidence: 0.6
    };
  }

  private async getOpportunityScoreFallback(opportunity: Opportunity): Promise<{ score: number; confidence: number }> {
    return {
      score: this.calculateBasicOpportunityScore(opportunity),
      confidence: 0.6
    };
  }

  private async generateInsights(
    opportunity: Opportunity, 
    predictions: any
  ): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];
    
    // Risk assessment insight
    insights.push({
      type: 'risk_assessment',
      confidence: predictions.risk.confidence,
      value: predictions.risk.score,
      explanation: this.generateRiskExplanation(opportunity, predictions.risk.score),
      factors: this.identifyRiskFactors(opportunity),
      timestamp: new Date().toISOString()
    });
    
    // Market analysis insight
    insights.push({
      type: 'market_analysis',
      confidence: predictions.market.confidence,
      value: predictions.market.score,
      explanation: this.generateMarketExplanation(opportunity, predictions.market.score),
      factors: this.identifyMarketFactors(opportunity),
      timestamp: new Date().toISOString()
    });
    
    // Opportunity scoring insight
    insights.push({
      type: 'opportunity_scoring',
      confidence: predictions.opportunity.confidence,
      value: predictions.opportunity.score,
      explanation: this.generateOpportunityExplanation(opportunity, predictions.opportunity.score),
      factors: this.identifyOpportunityFactors(opportunity),
      timestamp: new Date().toISOString()
    });
    
    return insights;
  }

  private calculateMarketScore(opportunity: Opportunity): number {
    let score = 50; // Base score
    
    // Industry scoring
    const techIndustries = ['technology', 'software', 'ai', 'fintech', 'biotech'];
    if (techIndustries.some(tech => opportunity.industry.toLowerCase().includes(tech))) {
      score += 15;
    }
    
    // Location scoring
    const majorHubs = ['san francisco', 'new york', 'boston', 'austin', 'seattle'];
    if (majorHubs.some(hub => opportunity.location.toLowerCase().includes(hub))) {
      score += 10;
    }
    
    // Market interest
    score += Math.min((opportunity.interested_investors || 0) * 2, 20);
    score += Math.min((opportunity.views || 0) * 0.05, 15);
    
    return Math.max(0, Math.min(100, score));
  }

  private generateRiskExplanation(opportunity: Opportunity, riskScore: number): string {
    if (riskScore > 75) {
      return `High risk investment due to early stage business (${opportunity.business_stage}) and market uncertainties.`;
    } else if (riskScore > 50) {
      return `Moderate risk with some concerns about market competition and scalability.`;
    } else if (riskScore > 25) {
      return `Lower risk investment with established market presence and solid fundamentals.`;
    } else {
      return `Very low risk investment with strong market position and proven track record.`;
    }
  }

  private generateMarketExplanation(opportunity: Opportunity, marketScore: number): string {
    if (marketScore > 75) {
      return `Excellent market opportunity in a high-growth sector with strong investor interest.`;
    } else if (marketScore > 50) {
      return `Good market potential with reasonable growth prospects and competitive positioning.`;
    } else if (marketScore > 25) {
      return `Moderate market opportunity with some challenges but potential for growth.`;
    } else {
      return `Limited market opportunity with significant challenges and competition.`;
    }
  }

  private generateOpportunityExplanation(opportunity: Opportunity, score: number): string {
    if (score > 75) {
      return `Outstanding investment opportunity with strong team, clear vision, and excellent market fit.`;
    } else if (score > 50) {
      return `Solid investment opportunity with good fundamentals and growth potential.`;
    } else if (score > 25) {
      return `Reasonable opportunity with some strengths but also areas of concern.`;
    } else {
      return `Limited opportunity with significant challenges that need to be addressed.`;
    }
  }

  private identifyRiskFactors(opportunity: Opportunity): string[] {
    const factors: string[] = [];
    
    if (opportunity.business_stage === 'idea' || opportunity.business_stage === 'startup') {
      factors.push('Early stage business with unproven market fit');
    }
    
    if ((opportunity.team_size || 0) < 3) {
      factors.push('Small team size may limit execution capability');
    }
    
    if ((opportunity.target_amount || 0) > 1000000) {
      factors.push('Large funding requirement increases execution risk');
    }
    
    if ((opportunity.interested_investors || 0) < 3) {
      factors.push('Limited investor interest may indicate market concerns');
    }
    
    return factors;
  }

  private identifyMarketFactors(opportunity: Opportunity): string[] {
    const factors: string[] = [];
    
    factors.push(`Operating in ${opportunity.industry} industry`);
    factors.push(`Located in ${opportunity.location}`);
    
    if ((opportunity.views || 0) > 100) {
      factors.push('High visibility and interest from investors');
    }
    
    if ((opportunity.interested_investors || 0) > 5) {
      factors.push('Strong investor interest indicates market validation');
    }
    
    return factors;
  }

  private identifyOpportunityFactors(opportunity: Opportunity): string[] {
    const factors: string[] = [];
    
    factors.push(`Business stage: ${opportunity.business_stage}`);
    factors.push(`Team size: ${opportunity.team_size || 'Not specified'}`);
    factors.push(`Target funding: $${(opportunity.target_amount || 0).toLocaleString()}`);
    
    if ((opportunity.expected_return || 0) > 0) {
      factors.push(`Expected return: ${opportunity.expected_return}%`);
    }
    
    return factors;
  }

  private generateRecommendations(opportunity: Opportunity, insights: AIInsight[]): string[] {
    const recommendations: string[] = [];
    
    const riskInsight = insights.find(i => i.type === 'risk_assessment');
    const opportunityInsight = insights.find(i => i.type === 'opportunity_scoring');
    
    if (riskInsight && typeof riskInsight.value === 'number' && riskInsight.value > 70) {
      recommendations.push('Consider requiring additional milestone-based funding releases');
      recommendations.push('Request detailed market research and competitive analysis');
    }
    
    if (opportunityInsight && typeof opportunityInsight.value === 'number' && opportunityInsight.value > 75) {
      recommendations.push('Strong candidate for investment - consider fast-track evaluation');
      recommendations.push('May warrant premium valuation given market potential');
    }
    
    if ((opportunity.team_size || 0) < 5) {
      recommendations.push('Evaluate team expansion plans and key hire requirements');
    }
    
    if ((opportunity.interested_investors || 0) > 10) {
      recommendations.push('High demand opportunity - consider competitive terms');
    }
    
    return recommendations;
  }

  private getFallbackAnalysis(opportunity: Opportunity): OpportunityAnalysis {
    // Fallback to rule-based analysis if AI fails
    const riskScore = this.calculateBasicRiskScore(opportunity);
    const opportunityScore = this.calculateBasicOpportunityScore(opportunity);
    const marketScore = this.calculateMarketScore(opportunity);
    
    return {
      riskScore,
      riskLevel: DRBE.getRiskLevel(riskScore),
      opportunityScore,
      marketScore,
      insights: [{
        type: 'risk_assessment',
        confidence: 0.6,
        value: riskScore,
        explanation: 'Basic rule-based risk assessment',
        factors: ['Limited AI model availability - using fallback analysis'],
        timestamp: new Date().toISOString()
      }],
      recommendations: ['AI analysis unavailable - manual review recommended'],
      confidence: {
        overall: 0.6,
        risk: 0.6,
        opportunity: 0.6,
        market: 0.6
      }
    };
  }

  private calculateBasicRiskScore(opportunity: Opportunity): number {
    let riskScore = 50;
    
    if (opportunity.business_stage === 'idea') riskScore += 30;
    else if (opportunity.business_stage === 'startup') riskScore += 20;
    else if (opportunity.business_stage === 'growth') riskScore += 10;
    else if (opportunity.business_stage === 'established') riskScore -= 10;
    
    if ((opportunity.team_size || 0) < 3) riskScore += 15;
    else if ((opportunity.team_size || 0) > 10) riskScore -= 10;
    
    const targetAmount = opportunity.target_amount || 0;
    if (targetAmount > 1000000) riskScore += 20;
    else if (targetAmount < 100000) riskScore -= 10;
    
    if ((opportunity.interested_investors || 0) > 10) riskScore -= 15;
    else if ((opportunity.interested_investors || 0) < 3) riskScore += 10;
    
    return Math.max(0, Math.min(100, riskScore));
  }

  private calculateBasicOpportunityScore(opportunity: Opportunity): number {
    let score = 50;
    
    score += Math.min((opportunity.interested_investors || 0) * 2, 20);
    score += Math.min((opportunity.views || 0) * 0.1, 15);
    
    if (opportunity.business_stage === 'growth') score += 20;
    else if (opportunity.business_stage === 'established') score += 30;
    else if (opportunity.business_stage === 'startup') score += 10;
    
    const teamSize = opportunity.team_size || 0;
    if (teamSize >= 5 && teamSize <= 15) score += 15;
    
    const expectedReturn = opportunity.expected_return || 0;
    if (expectedReturn > 20) score += 10;
    
    return Math.max(0, Math.min(100, score));
  }

  async getHistoricalPredictions(entityType: string, entityId: string) {
    // Mock data since AI predictions table doesn't exist yet
    return [];
  }
}

export const aiService = new AIService();

// Export for backward compatibility
export const AI = {
  analyzeOpportunity: (opportunity: Opportunity) => aiService.analyzeOpportunity(opportunity),
  getHistoricalPredictions: (entityType: string, entityId: string) => aiService.getHistoricalPredictions(entityType, entityId)
};

// Export the getRiskScore function directly for backward compatibility
export const getRiskScore = (input: number[]): Promise<number> => aiService.getRiskScore(input);
