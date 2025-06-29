
import * as tf from '@tensorflow/tfjs';
import { supabase } from '@/integrations/supabase/client';

export interface AIModel {
  id: string;
  name: string;
  description: string;
  model_type: 'risk_assessment' | 'opportunity_scoring' | 'market_analysis';
  model_url: string;
  version: string;
  is_active: boolean;
  accuracy_score: number;
  training_date: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface AIPrediction {
  id: string;
  model_id: string;
  entity_type: 'opportunity' | 'investment' | 'user';
  entity_id: string;
  prediction_type: string;
  input_data: any;
  output_data: any;
  confidence_score: number;
  created_at: string;
  created_by: string;
}

class AIModelService {
  private models: Map<string, tf.LayersModel> = new Map();

  async loadModel(modelUrl: string): Promise<tf.LayersModel> {
    try {
      if (this.models.has(modelUrl)) {
        return this.models.get(modelUrl)!;
      }

      console.log(`Loading AI model from: ${modelUrl}`);
      const model = await tf.loadLayersModel(modelUrl);
      this.models.set(modelUrl, model);
      return model;
    } catch (error) {
      console.error('Error loading AI model:', error);
      throw new Error(`Failed to load AI model: ${error}`);
    }
  }

  async getActiveModels(): Promise<AIModel[]> {
    const { data, error } = await supabase
      .from('ai_models')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as AIModel[];
  }

  async predictRiskScore(opportunityData: any): Promise<{ score: number; confidence: number }> {
    try {
      const models = await this.getActiveModels();
      const riskModel = models.find(m => m.model_type === 'risk_assessment');
      
      if (!riskModel) {
        // Fallback to rule-based scoring
        return this.calculateRuleBasedRiskScore(opportunityData);
      }

      const model = await this.loadModel(riskModel.model_url);
      
      // Prepare input tensor
      const inputFeatures = this.prepareRiskAssessmentInput(opportunityData);
      const inputTensor = tf.tensor2d([inputFeatures]);
      
      // Make prediction
      const prediction = model.predict(inputTensor) as tf.Tensor;
      const predictionData = await prediction.data();
      
      // Clean up tensors
      inputTensor.dispose();
      prediction.dispose();
      
      const score = predictionData[0] * 100; // Convert to percentage
      const confidence = Math.min(predictionData[1] || 0.8, 1.0);
      
      // Store prediction
      await this.storePrediction({
        model_id: riskModel.id,
        entity_type: 'opportunity',
        entity_id: opportunityData.id,
        prediction_type: 'risk_score',
        input_data: opportunityData,
        output_data: { score, confidence },
        confidence_score: confidence
      });
      
      return { score, confidence };
    } catch (error) {
      console.error('Error in AI risk prediction:', error);
      return this.calculateRuleBasedRiskScore(opportunityData);
    }
  }

  async predictOpportunityScore(opportunityData: any): Promise<{ score: number; confidence: number }> {
    try {
      const models = await this.getActiveModels();
      const scoringModel = models.find(m => m.model_type === 'opportunity_scoring');
      
      if (!scoringModel) {
        return this.calculateRuleBasedOpportunityScore(opportunityData);
      }

      const model = await this.loadModel(scoringModel.model_url);
      
      const inputFeatures = this.prepareOpportunityScoringInput(opportunityData);
      const inputTensor = tf.tensor2d([inputFeatures]);
      
      const prediction = model.predict(inputTensor) as tf.Tensor;
      const predictionData = await prediction.data();
      
      inputTensor.dispose();
      prediction.dispose();
      
      const score = predictionData[0] * 100;
      const confidence = Math.min(predictionData[1] || 0.75, 1.0);
      
      await this.storePrediction({
        model_id: scoringModel.id,
        entity_type: 'opportunity',
        entity_id: opportunityData.id,
        prediction_type: 'opportunity_score',
        input_data: opportunityData,
        output_data: { score, confidence },
        confidence_score: confidence
      });
      
      return { score, confidence };
    } catch (error) {
      console.error('Error in AI opportunity scoring:', error);
      return this.calculateRuleBasedOpportunityScore(opportunityData);
    }
  }

  private prepareRiskAssessmentInput(data: any): number[] {
    return [
      parseFloat(data.target_amount) || 0,
      parseFloat(data.equity_offered) || 0,
      parseFloat(data.min_investment) || 0,
      data.team_size || 0,
      data.founded_year ? new Date().getFullYear() - data.founded_year : 0,
      data.business_stage === 'idea' ? 1 : data.business_stage === 'startup' ? 2 : 
      data.business_stage === 'growth' ? 3 : data.business_stage === 'established' ? 4 : 5,
      data.funding_type === 'equity' ? 1 : data.funding_type === 'debt' ? 2 : 3,
      parseFloat(data.expected_return) || 0,
      data.timeline || 0,
      data.views || 0,
      data.interested_investors || 0
    ];
  }

  private prepareOpportunityScoringInput(data: any): number[] {
    return [
      parseFloat(data.target_amount) || 0,
      data.team_size || 0,
      data.founded_year ? new Date().getFullYear() - data.founded_year : 0,
      parseFloat(data.expected_return) || 0,
      data.timeline || 0,
      data.views || 0,
      data.interested_investors || 0,
      data.industry ? this.encodeIndustry(data.industry) : 0,
      data.location ? this.encodeLocation(data.location) : 0,
      data.business_stage === 'idea' ? 1 : data.business_stage === 'startup' ? 2 : 
      data.business_stage === 'growth' ? 3 : data.business_stage === 'established' ? 4 : 5
    ];
  }

  private encodeIndustry(industry: string): number {
    const industries = ['technology', 'healthcare', 'finance', 'energy', 'retail', 'manufacturing'];
    return industries.indexOf(industry.toLowerCase()) + 1;
  }

  private encodeLocation(location: string): number {
    // Simple encoding based on major tech hubs
    const locations = ['san francisco', 'new york', 'boston', 'austin', 'seattle', 'los angeles'];
    return locations.findIndex(loc => location.toLowerCase().includes(loc)) + 1;
  }

  private calculateRuleBasedRiskScore(data: any): { score: number; confidence: number } {
    let riskScore = 50; // Base risk score
    
    // Business stage factor
    if (data.business_stage === 'idea') riskScore += 30;
    else if (data.business_stage === 'startup') riskScore += 20;
    else if (data.business_stage === 'growth') riskScore += 10;
    else if (data.business_stage === 'established') riskScore -= 10;
    
    // Team size factor
    if (data.team_size < 3) riskScore += 15;
    else if (data.team_size > 10) riskScore -= 10;
    
    // Funding amount factor
    const targetAmount = parseFloat(data.target_amount) || 0;
    if (targetAmount > 1000000) riskScore += 20;
    else if (targetAmount < 100000) riskScore -= 10;
    
    // Market interest factor
    if (data.interested_investors > 10) riskScore -= 15;
    else if (data.interested_investors < 3) riskScore += 10;
    
    return { 
      score: Math.max(0, Math.min(100, riskScore)), 
      confidence: 0.6 // Lower confidence for rule-based
    };
  }

  private calculateRuleBasedOpportunityScore(data: any): { score: number; confidence: number } {
    let score = 50; // Base score
    
    // Market interest
    score += (data.interested_investors || 0) * 2;
    score += (data.views || 0) * 0.1;
    
    // Business maturity
    if (data.business_stage === 'growth') score += 20;
    else if (data.business_stage === 'established') score += 30;
    else if (data.business_stage === 'startup') score += 10;
    
    // Team size
    if (data.team_size >= 5 && data.team_size <= 15) score += 15;
    
    // Expected return
    const expectedReturn = parseFloat(data.expected_return) || 0;
    if (expectedReturn > 20) score += 10;
    
    return { 
      score: Math.max(0, Math.min(100, score)), 
      confidence: 0.5 
    };
  }

  private async storePrediction(predictionData: Omit<AIPrediction, 'id' | 'created_at' | 'created_by'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_predictions')
        .insert({
          ...predictionData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error storing AI prediction:', error);
    }
  }

  async getPredictionHistory(entityType: string, entityId: string): Promise<AIPrediction[]> {
    const { data, error } = await supabase
      .from('ai_predictions')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as AIPrediction[];
  }
}

export const aiModelService = new AIModelService();
