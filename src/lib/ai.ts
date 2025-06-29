// Enhanced TensorFlow.js AI Models
// Provides offline AI capabilities for risk assessment, opportunity analysis, and decision support

import * as tf from '@tensorflow/tfjs';
import { drbe, ValidationResult, Opportunity, RiskLevel } from './drbe';

export interface AIModelConfig {
  name: string;
  version: string;
  inputFeatures: string[];
  outputClasses: string[];
  modelPath?: string;
  threshold: number;
}

export interface AIAnalysisResult {
  modelName: string;
  confidence: number;
  prediction: any;
  riskScore: number;
  recommendations: string[];
  factors: Record<string, number>;
  timestamp: string;
  validated: boolean;
}

export interface RiskAssessmentResult {
  overallRisk: number;
  riskLevel: RiskLevel;
  categoryRisks: {
    financial: number;
    operational: number;
    technical: number;
    legal: number;
    market: number;
  };
  riskFactors: string[];
  mitigationStrategies: string[];
  confidence: number;
}

export interface OpportunityAnalysisResult {
  attractiveness: number;
  feasibility: number;
  marketPotential: number;
  teamStrength: number;
  investmentReadiness: number;
  recommendations: string[];
  redFlags: string[];
  greenFlags: string[];
}

class AIModelManager {
  private models: Map<string, tf.LayersModel> = new Map();
  private configs: Map<string, AIModelConfig> = new Map();
  private isInitialized = false;

  constructor() {
    this.initializeModels();
  }

  private async initializeModels() {
    try {
      // Initialize TensorFlow.js
      await tf.ready();
      console.log('TensorFlow.js initialized');

      // Define model configurations
      this.setupModelConfigs();

      // Load pre-trained models (if available)
      await this.loadModels();

      this.isInitialized = true;
      console.log('AI Model Manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AI models:', error);
      // Fallback to rule-based models
      this.isInitialized = true;
    }
  }

  private setupModelConfigs() {
    // Risk Assessment Model
    this.configs.set('risk_assessment', {
      name: 'Risk Assessment Model',
      version: '2.0',
      inputFeatures: [
        'equity_offered', 'funding_amount', 'team_size', 'market_size',
        'technology_readiness', 'revenue_projection', 'competition_level',
        'regulatory_compliance', 'intellectual_property', 'financial_stability'
      ],
      outputClasses: ['low', 'medium', 'high', 'critical'],
      threshold: 0.7
    });

    // Opportunity Analysis Model
    this.configs.set('opportunity_analysis', {
      name: 'Opportunity Analysis Model',
      version: '2.0',
      inputFeatures: [
        'market_growth_rate', 'competitive_advantage', 'team_experience',
        'technology_innovation', 'financial_projections', 'regulatory_environment',
        'scalability_potential', 'exit_strategy', 'customer_validation'
      ],
      outputClasses: ['poor', 'fair', 'good', 'excellent'],
      threshold: 0.6
    });

    // Investment Recommendation Model
    this.configs.set('investment_recommendation', {
      name: 'Investment Recommendation Model',
      version: '2.0',
      inputFeatures: [
        'risk_score', 'expected_roi', 'investment_horizon', 'liquidity_needs',
        'diversification_benefit', 'market_timing', 'due_diligence_score'
      ],
      outputClasses: ['avoid', 'hold', 'invest', 'aggressive_invest'],
      threshold: 0.65
    });

    // Compliance Check Model
    this.configs.set('compliance_check', {
      name: 'Compliance Check Model',
      version: '2.0',
      inputFeatures: [
        'kyc_status', 'aml_check', 'regulatory_licenses', 'tax_compliance',
        'legal_structure', 'documentation_completeness', 'audit_history'
      ],
      outputClasses: ['non_compliant', 'requires_review', 'compliant'],
      threshold: 0.8
    });
  }

  private async loadModels() {
    // In a real implementation, you would load pre-trained models
    // For now, we'll create simple rule-based models
    for (const [modelName, config] of this.configs) {
      const model = this.createRuleBasedModel(config);
      this.models.set(modelName, model);
    }
  }

  private createRuleBasedModel(config: AIModelConfig): tf.LayersModel {
    // Create a simple neural network for each model type
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [config.inputFeatures.length],
          units: 16,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 8,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: config.outputClasses.length,
          activation: 'softmax'
        })
      ]
    });

    model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  // Enhanced risk assessment with multiple factors
  public async assessRisk(opportunity: Opportunity): Promise<RiskAssessmentResult> {
    const input = this.extractRiskFeatures(opportunity);
    const prediction = await this.runModel('risk_assessment', input);
    
    const riskScore = this.calculateRiskScore(opportunity, prediction);
    const riskLevel = drbe.getRiskLevel(riskScore);
    
    const categoryRisks = this.assessCategoryRisks(opportunity);
    const riskFactors = this.identifyRiskFactors(opportunity, prediction);
    const mitigationStrategies = this.generateMitigationStrategies(riskFactors);
    
    return {
      overallRisk: riskScore,
      riskLevel,
      categoryRisks,
      riskFactors,
      mitigationStrategies,
      confidence: prediction.confidence
    };
  }

  // Enhanced opportunity analysis
  public async analyzeOpportunity(opportunity: Opportunity): Promise<OpportunityAnalysisResult> {
    const input = this.extractOpportunityFeatures(opportunity);
    const prediction = await this.runModel('opportunity_analysis', input);
    
    const attractiveness = this.calculateAttractiveness(opportunity, prediction);
    const feasibility = this.calculateFeasibility(opportunity);
    const marketPotential = this.calculateMarketPotential(opportunity);
    const teamStrength = this.calculateTeamStrength(opportunity);
    const investmentReadiness = this.calculateInvestmentReadiness(opportunity);
    
    const recommendations = this.generateOpportunityRecommendations(opportunity, prediction);
    const redFlags = this.identifyRedFlags(opportunity);
    const greenFlags = this.identifyGreenFlags(opportunity);
    
    return {
      attractiveness,
      feasibility,
      marketPotential,
      teamStrength,
      investmentReadiness,
      recommendations,
      redFlags,
      greenFlags
    };
  }

  // Investment recommendation
  public async getInvestmentRecommendation(
    opportunity: Opportunity, 
    investorProfile: any
  ): Promise<AIAnalysisResult> {
    const input = this.extractInvestmentFeatures(opportunity, investorProfile);
    const prediction = await this.runModel('investment_recommendation', input);
    
    const recommendations = this.generateInvestmentRecommendations(opportunity, investorProfile, prediction);
    const factors = this.analyzeInvestmentFactors(opportunity, investorProfile);
    
    return {
      modelName: 'investment_recommendation',
      confidence: prediction.confidence,
      prediction: prediction.class,
      riskScore: prediction.riskScore,
      recommendations,
      factors,
      timestamp: new Date().toISOString(),
      validated: drbe.validateAIOutput('investment_recommendation', prediction.class) !== prediction.class
    };
  }

  // Compliance check
  public async checkCompliance(opportunity: Opportunity): Promise<AIAnalysisResult> {
    const input = this.extractComplianceFeatures(opportunity);
    const prediction = await this.runModel('compliance_check', input);
    
    const recommendations = this.generateComplianceRecommendations(opportunity, prediction);
    const factors = this.analyzeComplianceFactors(opportunity);
    
    return {
      modelName: 'compliance_check',
      confidence: prediction.confidence,
      prediction: prediction.class,
      riskScore: prediction.riskScore,
      recommendations,
      factors,
      timestamp: new Date().toISOString(),
      validated: drbe.validateAIOutput('compliance_check', prediction.class) !== prediction.class
    };
  }

  // Run a specific model
  private async runModel(modelName: string, input: number[]): Promise<any> {
    const model = this.models.get(modelName);
    const config = this.configs.get(modelName);
    
    if (!model || !config) {
      throw new Error(`Model ${modelName} not found`);
    }

    try {
      // Normalize input
      const normalizedInput = this.normalizeInput(input, config);
      const tensor = tf.tensor2d([normalizedInput]);
      
      // Run prediction
      const prediction = await model.predict(tensor) as tf.Tensor;
      const predictionArray = await prediction.array();
      
      // Get the highest probability class
      const probabilities = predictionArray[0];
      const maxIndex = probabilities.indexOf(Math.max(...probabilities));
      const confidence = probabilities[maxIndex];
      const predictedClass = config.outputClasses[maxIndex];
      
      // Calculate risk score based on prediction
      const riskScore = this.calculatePredictionRiskScore(probabilities, config);
      
      tensor.dispose();
      prediction.dispose();
      
      return {
        class: predictedClass,
        confidence,
        riskScore,
        probabilities
      };
    } catch (error) {
      console.error(`Error running model ${modelName}:`, error);
      // Return fallback prediction
      return {
        class: config.outputClasses[0],
        confidence: 0.5,
        riskScore: 50,
        probabilities: new Array(config.outputClasses.length).fill(1 / config.outputClasses.length)
      };
    }
  }

  // Feature extraction methods with safe property access
  private extractRiskFeatures(opportunity: Opportunity): number[] {
    const features = [];
    
    // Financial features
    features.push(parseFloat(opportunity.fields.equity_offered || '0') || 0);
    features.push(parseFloat(opportunity.fields.funding_amount || '0') || 0);
    features.push(parseFloat(opportunity.fields.current_revenue || '0') || 0);
    features.push(parseFloat(opportunity.fields.projected_revenue || '0') || 0);
    
    // Operational features
    features.push(parseInt(opportunity.fields.team_size || '0') || 0);
    features.push(parseFloat(opportunity.fields.market_size || '0') || 0);
    features.push(parseInt(opportunity.fields.competition_level || '0') || 0);
    
    // Technical features
    features.push(parseInt(opportunity.fields.technology_readiness_level || '0') || 0);
    features.push(opportunity.fields.ip_protection === 'true' ? 1 : 0);
    
    // Compliance features
    features.push(opportunity.fields.regulatory_compliant === 'true' ? 1 : 0);
    
    return features;
  }

  private extractOpportunityFeatures(opportunity: Opportunity): number[] {
    const features = [];
    
    // Market features
    features.push(parseFloat(opportunity.fields.market_growth_rate || '0') || 0);
    features.push(parseFloat(opportunity.fields.competitive_advantage || '0') || 0);
    features.push(parseFloat(opportunity.fields.customer_validation || '0') || 0);
    
    // Team features
    features.push(parseFloat(opportunity.fields.team_experience || '0') || 0);
    features.push(parseInt(opportunity.fields.team_size || '0') || 0);
    
    // Technology features
    features.push(parseFloat(opportunity.fields.technology_innovation || '0') || 0);
    features.push(parseFloat(opportunity.fields.scalability_potential || '0') || 0);
    
    // Financial features
    features.push(parseFloat(opportunity.fields.financial_projections || '0') || 0);
    features.push(parseFloat(opportunity.fields.exit_strategy || '0') || 0);
    
    return features;
  }

  private extractInvestmentFeatures(opportunity: Opportunity, investorProfile: any): number[] {
    const features = [];
    
    // Risk features
    features.push(parseFloat(opportunity.fields.risk_score || '50') || 50);
    features.push(parseFloat(opportunity.fields.expected_roi || '0') || 0);
    
    // Investment features
    features.push(parseInt(investorProfile.investment_horizon) || 5);
    features.push(parseFloat(investorProfile.liquidity_needs) || 0);
    features.push(parseFloat(investorProfile.diversification_benefit) || 0);
    
    // Market features
    features.push(parseFloat(opportunity.fields.market_timing || '0') || 0);
    features.push(parseFloat(opportunity.fields.due_diligence_score || '0') || 0);
    
    return features;
  }

  private extractComplianceFeatures(opportunity: Opportunity): number[] {
    const features = [];
    
    // KYC/AML features
    features.push(opportunity.fields.kyc_complete === 'true' ? 1 : 0);
    features.push(opportunity.fields.aml_check === 'true' ? 1 : 0);
    
    // Regulatory features
    features.push(opportunity.fields.regulatory_licenses === 'true' ? 1 : 0);
    features.push(opportunity.fields.tax_compliance === 'true' ? 1 : 0);
    
    // Legal features
    features.push(opportunity.fields.legal_structure === 'complete' ? 1 : 0);
    features.push(parseFloat(opportunity.fields.documentation_completeness || '0') || 0);
    
    // Audit features
    features.push(opportunity.fields.audit_history === 'clean' ? 1 : 0);
    
    return features;
  }

  // Helper methods
  private normalizeInput(input: number[], config: AIModelConfig): number[] {
    // Simple min-max normalization
    return input.map((value, index) => {
      const feature = config.inputFeatures[index];
      // Apply feature-specific normalization
      switch (feature) {
        case 'equity_offered':
          return Math.min(value / 100, 1);
        case 'funding_amount':
          return Math.min(value / 10000000, 1);
        case 'team_size':
          return Math.min(value / 50, 1);
        case 'technology_readiness_level':
          return value / 9;
        default:
          return Math.min(Math.max(value, 0), 1);
      }
    });
  }

  private calculateRiskScore(opportunity: Opportunity, prediction: any): number {
    let riskScore = 0;
    
    // Base risk from AI prediction
    riskScore += prediction.riskScore;
    
    // Additional risk factors with safe property access
    const equityOffered = parseFloat(opportunity.fields.equity_offered || '0');
    if (equityOffered > 50) riskScore += 10;
    
    const fundingAmount = parseFloat(opportunity.fields.funding_amount || '0');
    if (fundingAmount > 5000000) riskScore += 15;
    
    const teamSize = parseInt(opportunity.fields.team_size || '0');
    if (teamSize < 2) riskScore += 20;
    
    const techReadiness = parseInt(opportunity.fields.technology_readiness_level || '0');
    if (techReadiness < 4) riskScore += 25;
    
    if (opportunity.fields.regulatory_compliant !== 'true') riskScore += 30;
    
    return Math.min(riskScore, 100);
  }

  private calculatePredictionRiskScore(probabilities: number[], config: AIModelConfig): number {
    // Calculate risk score based on probability distribution
    let riskScore = 0;
    
    if (config.outputClasses.includes('critical')) {
      const criticalIndex = config.outputClasses.indexOf('critical');
      riskScore += probabilities[criticalIndex] * 100;
    }
    
    if (config.outputClasses.includes('high')) {
      const highIndex = config.outputClasses.indexOf('high');
      riskScore += probabilities[highIndex] * 75;
    }
    
    if (config.outputClasses.includes('medium')) {
      const mediumIndex = config.outputClasses.indexOf('medium');
      riskScore += probabilities[mediumIndex] * 50;
    }
    
    if (config.outputClasses.includes('low')) {
      const lowIndex = config.outputClasses.indexOf('low');
      riskScore += probabilities[lowIndex] * 25;
    }
    
    return Math.min(riskScore, 100);
  }

  private assessCategoryRisks(opportunity: Opportunity) {
    return {
      financial: this.calculateFinancialRisk(opportunity),
      operational: this.calculateOperationalRisk(opportunity),
      technical: this.calculateTechnicalRisk(opportunity),
      legal: this.calculateLegalRisk(opportunity),
      market: this.calculateMarketRisk(opportunity)
    };
  }

  private calculateFinancialRisk(opportunity: Opportunity): number {
    let risk = 0;
    const equityOffered = parseFloat(opportunity.fields.equity_offered || '0');
    if (equityOffered > 50) risk += 20;
    
    const fundingAmount = parseFloat(opportunity.fields.funding_amount || '0');
    if (fundingAmount > 5000000) risk += 25;
    
    const projectedRevenue = parseFloat(opportunity.fields.projected_revenue || '0');
    const currentRevenue = parseFloat(opportunity.fields.current_revenue || '0');
    if (projectedRevenue > currentRevenue * 10) risk += 30;
    
    return Math.min(risk, 100);
  }

  private calculateOperationalRisk(opportunity: Opportunity): number {
    let risk = 0;
    const teamSize = parseInt(opportunity.fields.team_size || '0');
    if (teamSize < 2) risk += 40;
    
    if (!opportunity.fields.market_research) risk += 25;
    
    const milestones = opportunity.milestones || [];
    if (milestones.length === 0) risk += 20;
    
    return Math.min(risk, 100);
  }

  private calculateTechnicalRisk(opportunity: Opportunity): number {
    let risk = 0;
    const techReadiness = parseInt(opportunity.fields.technology_readiness_level || '0');
    if (techReadiness < 4) risk += 35;
    
    if (opportunity.fields.ip_protection !== 'true') risk += 30;
    if (!opportunity.fields.scalable) risk += 20;
    return Math.min(risk, 100);
  }

  private calculateLegalRisk(opportunity: Opportunity): number {
    let risk = 0;
    if (opportunity.fields.regulatory_compliant !== 'true') risk += 50;
    if (opportunity.fields.kyc_complete !== 'true') risk += 30;
    if (opportunity.fields.aml_check !== 'true') risk += 30;
    return Math.min(risk, 100);
  }

  private calculateMarketRisk(opportunity: Opportunity): number {
    let risk = 0;
    const competitionLevel = parseInt(opportunity.fields.competition_level || '0');
    if (competitionLevel > 7) risk += 25;
    
    const marketSize = parseFloat(opportunity.fields.market_size || '0');
    if (marketSize < 1000000) risk += 20;
    if (!opportunity.fields.customer_validation) risk += 30;
    
    return Math.min(risk, 100);
  }

  private identifyRiskFactors(opportunity: Opportunity, prediction: any): string[] {
    const factors: string[] = [];
    
    const equityOffered = parseFloat(opportunity.fields.equity_offered || '0');
    if (equityOffered > 50) {
      factors.push('High equity offering may indicate desperation');
    }
    
    const teamSize = parseInt(opportunity.fields.team_size || '0');
    if (teamSize < 2) {
      factors.push('Small team size increases operational risk');
    }
    
    const techReadiness = parseInt(opportunity.fields.technology_readiness_level || '0');
    if (techReadiness < 4) {
      factors.push('Low technology readiness level');
    }
    
    if (opportunity.fields.regulatory_compliant !== 'true') {
      factors.push('Regulatory compliance not confirmed');
    }
    
    return factors;
  }

  private generateMitigationStrategies(riskFactors: string[]): string[] {
    const strategies: string[] = [];
    
    riskFactors.forEach(factor => {
      if (factor.includes('equity')) {
        strategies.push('Consider reducing equity offering or providing additional value');
      }
      if (factor.includes('team')) {
        strategies.push('Expand team or provide detailed hiring plan');
      }
      if (factor.includes('technology')) {
        strategies.push('Improve technology readiness before seeking investment');
      }
      if (factor.includes('regulatory')) {
        strategies.push('Complete regulatory compliance requirements');
      }
    });
    
    return strategies;
  }

  private calculateAttractiveness(opportunity: Opportunity, prediction: any): number {
    let score = 0;
    
    // Market factors
    const marketGrowthRate = parseFloat(opportunity.fields.market_growth_rate || '0');
    if (marketGrowthRate > 10) score += 20;
    
    const competitiveAdvantage = parseFloat(opportunity.fields.competitive_advantage || '0');
    if (competitiveAdvantage > 7) score += 15;
    
    // Team factors
    const teamExperience = parseFloat(opportunity.fields.team_experience || '0');
    if (teamExperience > 5) score += 15;
    
    const teamSize = parseInt(opportunity.fields.team_size || '0');
    if (teamSize > 3) score += 10;
    
    // Technology factors
    const techInnovation = parseFloat(opportunity.fields.technology_innovation || '0');
    if (techInnovation > 7) score += 15;
    
    const scalabilityPotential = parseFloat(opportunity.fields.scalability_potential || '0');
    if (scalabilityPotential > 7) score += 15;
    
    // Financial factors
    const financialProjections = parseFloat(opportunity.fields.financial_projections || '0');
    if (financialProjections > 7) score += 10;
    
    return Math.min(score, 100);
  }

  private calculateFeasibility(opportunity: Opportunity): number {
    let score = 0;
    
    const techReadiness = parseInt(opportunity.fields.technology_readiness_level || '0');
    if (techReadiness >= 6) score += 25;
    
    const teamSize = parseInt(opportunity.fields.team_size || '0');
    if (teamSize >= 3) score += 20;
    
    if (opportunity.fields.market_research === 'true') score += 20;
    if (opportunity.fields.regulatory_compliant === 'true') score += 20;
    if (opportunity.fields.financial_statements === 'true') score += 15;
    
    return Math.min(score, 100);
  }

  private calculateMarketPotential(opportunity: Opportunity): number {
    let score = 0;
    
    const marketSize = parseFloat(opportunity.fields.market_size || '0');
    if (marketSize > 10000000) score += 25;
    
    const marketGrowthRate = parseFloat(opportunity.fields.market_growth_rate || '0');
    if (marketGrowthRate > 15) score += 25;
    
    const customerValidation = parseFloat(opportunity.fields.customer_validation || '0');
    if (customerValidation > 7) score += 25;
    
    const competitionLevel = parseInt(opportunity.fields.competition_level || '0');
    if (competitionLevel < 5) score += 25;
    
    return Math.min(score, 100);
  }

  private calculateTeamStrength(opportunity: Opportunity): number {
    let score = 0;
    
    const teamExperience = parseFloat(opportunity.fields.team_experience || '0');
    if (teamExperience > 8) score += 30;
    
    const teamSize = parseInt(opportunity.fields.team_size || '0');
    if (teamSize > 5) score += 25;
    
    if (opportunity.fields.team_background === 'diverse') score += 25;
    if (opportunity.fields.team_commitment === 'full_time') score += 20;
    
    return Math.min(score, 100);
  }

  private calculateInvestmentReadiness(opportunity: Opportunity): number {
    let score = 0;
    
    if (opportunity.fields.business_plan === 'true') score += 20;
    if (opportunity.fields.financial_statements === 'true') score += 20;
    if (opportunity.fields.legal_structure === 'true') score += 15;
    if (opportunity.fields.kyc_complete === 'true') score += 15;
    if (opportunity.fields.aml_check === 'true') score += 15;
    if (opportunity.fields.regulatory_compliant === 'true') score += 15;
    
    return Math.min(score, 100);
  }

  private generateOpportunityRecommendations(opportunity: Opportunity, prediction: any): string[] {
    const recommendations: string[] = [];
    
    if (parseFloat(opportunity.fields.team_experience) < 5) {
      recommendations.push('Consider adding experienced team members');
    }
    
    if (parseFloat(opportunity.fields.market_growth_rate) < 10) {
      recommendations.push('Focus on high-growth market segments');
    }
    
    if (opportunity.fields.customer_validation !== 'true') {
      recommendations.push('Conduct customer validation studies');
    }
    
    if (parseFloat(opportunity.fields.technology_innovation) < 7) {
      recommendations.push('Enhance technology innovation and differentiation');
    }
    
    return recommendations;
  }

  private identifyRedFlags(opportunity: Opportunity): string[] {
    const redFlags: string[] = [];
    
    if (opportunity.fields.regulatory_compliant !== 'true') {
      redFlags.push('Regulatory compliance not confirmed');
    }
    
    if (parseInt(opportunity.fields.team_size) < 2) {
      redFlags.push('Insufficient team size');
    }
    
    if (parseInt(opportunity.fields.technology_readiness_level) < 4) {
      redFlags.push('Technology not ready for investment');
    }
    
    if (parseFloat(opportunity.fields.equity_offered) > 80) {
      redFlags.push('Excessive equity offering');
    }
    
    return redFlags;
  }

  private identifyGreenFlags(opportunity: Opportunity): string[] {
    const greenFlags: string[] = [];
    
    if (opportunity.fields.regulatory_compliant === 'true') {
      greenFlags.push('Regulatory compliance confirmed');
    }
    
    if (parseFloat(opportunity.fields.team_experience) > 8) {
      greenFlags.push('Experienced team');
    }
    
    if (parseFloat(opportunity.fields.market_growth_rate) > 20) {
      greenFlags.push('High-growth market');
    }
    
    if (opportunity.fields.customer_validation === 'true') {
      greenFlags.push('Customer validation completed');
    }
    
    return greenFlags;
  }

  private generateInvestmentRecommendations(opportunity: Opportunity, investorProfile: any, prediction: any): string[] {
    const recommendations: string[] = [];
    
    if (prediction.class === 'avoid') {
      recommendations.push('Consider avoiding this investment due to high risk');
    } else if (prediction.class === 'hold') {
      recommendations.push('Monitor the opportunity and wait for better conditions');
    } else if (prediction.class === 'invest') {
      recommendations.push('Consider making a moderate investment');
    } else if (prediction.class === 'aggressive_invest') {
      recommendations.push('Consider making a significant investment');
    }
    
    return recommendations;
  }

  private analyzeInvestmentFactors(opportunity: Opportunity, investorProfile: any): Record<string, number> {
    return {
      risk_tolerance: parseFloat(investorProfile.risk_tolerance) || 0.5,
      investment_horizon: parseInt(investorProfile.investment_horizon) || 5,
      liquidity_needs: parseFloat(investorProfile.liquidity_needs) || 0.3,
      diversification_benefit: parseFloat(investorProfile.diversification_benefit) || 0.6
    };
  }

  private generateComplianceRecommendations(opportunity: Opportunity, prediction: any): string[] {
    const recommendations: string[] = [];
    
    if (prediction.class === 'non_compliant') {
      recommendations.push('Complete all compliance requirements before proceeding');
      recommendations.push('Address KYC/AML requirements');
      recommendations.push('Ensure regulatory licenses are in place');
    } else if (prediction.class === 'requires_review') {
      recommendations.push('Review compliance documentation');
      recommendations.push('Verify regulatory status');
    }
    
    return recommendations;
  }

  private analyzeComplianceFactors(opportunity: Opportunity): Record<string, number> {
    return {
      kyc_complete: opportunity.fields.kyc_complete === 'true' ? 1 : 0,
      aml_check: opportunity.fields.aml_check === 'true' ? 1 : 0,
      regulatory_licenses: opportunity.fields.regulatory_licenses === 'true' ? 1 : 0,
      tax_compliance: opportunity.fields.tax_compliance === 'true' ? 1 : 0,
      legal_structure: opportunity.fields.legal_structure === 'complete' ? 1 : 0
    };
  }

  public isReady(): boolean {
    return this.isInitialized;
  }

  public getModelInfo(modelName: string): AIModelConfig | undefined {
    return this.configs.get(modelName);
  }
}

// Export singleton instance
export const aiModelManager = new AIModelManager();

// Legacy function for backward compatibility
export async function getRiskScore(input: number[]): Promise<number> {
  const mockOpportunity: Opportunity = {
    id: 'mock',
    title: 'Mock Opportunity',
    type: 'going_concern',
    status: 'draft',
    fields: {
      equity_offered: input[0]?.toString() || '0',
      funding_amount: input[1]?.toString() || '0',
      team_size: input[2]?.toString() || '0'
    },
    milestones: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'mock'
  };

  const riskAssessment = await aiModelManager.assessRisk(mockOpportunity);
  return drbe.validateAIOutput('risk_score', riskAssessment.overallRisk);
}
