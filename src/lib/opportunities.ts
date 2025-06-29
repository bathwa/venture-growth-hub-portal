import { supabase } from '@/integrations/supabase/client';
import { DRBE, OpportunityType, OpportunityStatus } from '@/lib/drbe';
import { getRiskScore } from '@/lib/ai';

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  type: OpportunityType;
  status: OpportunityStatus;
  equity_offered?: string;
  order_details?: string;
  partner_roles?: string;
  target_amount: number;
  currency: string;
  location: string;
  industry: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  attachments: string[];
  risk_score?: number;
  views: number;
  interested_investors: number;
}

export interface CreateOpportunityData {
  title: string;
  description: string;
  type: OpportunityType;
  equity_offered?: string;
  order_details?: string;
  partner_roles?: string;
  target_amount: number;
  currency: string;
  location: string;
  industry: string;
  created_by: string;
  attachments?: File[];
}

export class OpportunityService {
  static async createOpportunity(data: CreateOpportunityData): Promise<Opportunity> {
    try {
      // DRBE validation with mock id for validation
      const opportunity = {
        id: 'temp-id', // Add temporary id for validation
        title: data.title,
        type: data.type,
        status: 'draft' as OpportunityStatus,
        fields: {
          equity_offered: data.equity_offered,
          order_details: data.order_details,
          partner_roles: data.partner_roles,
        },
      };

      const { valid, errors } = DRBE.validateOpportunity(opportunity);
      if (!valid) {
        throw new Error(`Validation failed: ${errors.join(', ')}`);
      }

      // AI risk scoring
      let riskScore: number | undefined;
      try {
        const input = [parseFloat(data.equity_offered || '0')];
        const score = await getRiskScore(input);
        riskScore = DRBE.validateAIOutput('risk_score', score);
      } catch (e) {
        console.warn('AI risk scoring failed:', e);
      }

      // Upload attachments
      const uploadedPaths: string[] = [];
      if (data.attachments) {
        for (const file of data.attachments) {
          const path = await this.uploadFile(file, data.created_by);
          if (path) uploadedPaths.push(path);
        }
      }

      // Create opportunity in database - using database schema fields
      const { data: opportunityData, error } = await supabase
        .from('opportunities')
        .insert({
          title: data.title,
          description: data.description,
          entrepreneur_id: data.created_by,
          target_amount: data.target_amount,
          equity_offered: parseFloat(data.equity_offered || '0'),
          min_investment: 1000, // Default minimum investment
          funding_type: 'equity',
          business_stage: 'startup',
          industry: data.industry,
          location: data.location,
          status: 'draft',
          views: 0,
          interested_investors: 0,
          risk_score: riskScore
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Map database result to our interface
      return {
        id: opportunityData.id,
        title: opportunityData.title,
        description: opportunityData.description,
        type: data.type,
        status: opportunityData.status as OpportunityStatus,
        equity_offered: data.equity_offered,
        order_details: data.order_details,
        partner_roles: data.partner_roles,
        target_amount: opportunityData.target_amount,
        currency: 'USD', // Default currency
        location: opportunityData.location,
        industry: opportunityData.industry,
        created_by: opportunityData.entrepreneur_id,
        created_at: opportunityData.created_at,
        updated_at: opportunityData.updated_at,
        attachments: uploadedPaths,
        risk_score: opportunityData.risk_score,
        views: opportunityData.views || 0,
        interested_investors: opportunityData.interested_investors || 0
      };
    } catch (error) {
      console.error('Create opportunity error:', error);
      throw error;
    }
  }

  static async getOpportunities(userId: string): Promise<Opportunity[]> {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('entrepreneur_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Map database results to our interface
      return (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        type: 'going_concern' as OpportunityType, // Default type
        status: item.status as OpportunityStatus,
        equity_offered: item.equity_offered?.toString(),
        target_amount: item.target_amount,
        currency: 'USD',
        location: item.location,
        industry: item.industry,
        created_by: item.entrepreneur_id,
        created_at: item.created_at,
        updated_at: item.updated_at,
        attachments: [],
        risk_score: item.risk_score,
        views: item.views || 0,
        interested_investors: item.interested_investors || 0
      }));
    } catch (error) {
      console.error('Get opportunities error:', error);
      throw error;
    }
  }

  static async getOpportunity(id: string): Promise<Opportunity | null> {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      if (!data) return null;

      // Map database result to our interface
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        type: 'going_concern' as OpportunityType,
        status: data.status as OpportunityStatus,
        equity_offered: data.equity_offered?.toString(),
        target_amount: data.target_amount,
        currency: 'USD',
        location: data.location,
        industry: data.industry,
        created_by: data.entrepreneur_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        attachments: [],
        risk_score: data.risk_score,
        views: data.views || 0,
        interested_investors: data.interested_investors || 0
      };
    } catch (error) {
      console.error('Get opportunity error:', error);
      throw error;
    }
  }

  static async updateOpportunity(id: string, updates: Partial<Opportunity>): Promise<Opportunity> {
    try {
      // DRBE validation if type or fields changed
      if (updates.type || updates.equity_offered || updates.order_details || updates.partner_roles) {
        const opportunity = {
          id,
          title: updates.title || '',
          type: updates.type || 'going_concern',
          status: updates.status || 'draft',
          fields: {
            equity_offered: updates.equity_offered,
            order_details: updates.order_details,
            partner_roles: updates.partner_roles,
          },
        };

        const { valid, errors } = DRBE.validateOpportunity(opportunity);
        if (!valid) {
          throw new Error(`Validation failed: ${errors.join(', ')}`);
        }
      }

      // AI risk scoring if equity_offered changed
      if (updates.equity_offered) {
        try {
          const input = [parseFloat(updates.equity_offered)];
          const score = await getRiskScore(input);
          updates.risk_score = DRBE.validateAIOutput('risk_score', score);
        } catch (e) {
          console.warn('AI risk scoring failed:', e);
        }
      }

      const { data, error } = await supabase
        .from('opportunities')
        .update({
          title: updates.title,
          description: updates.description,
          equity_offered: updates.equity_offered ? parseFloat(updates.equity_offered) : undefined,
          target_amount: updates.target_amount,
          industry: updates.industry,
          location: updates.location,
          status: updates.status,
          risk_score: updates.risk_score,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Map back to our interface
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        type: 'going_concern' as OpportunityType,
        status: data.status as OpportunityStatus,
        equity_offered: data.equity_offered?.toString(),
        target_amount: data.target_amount,
        currency: 'USD',
        location: data.location,
        industry: data.industry,
        created_by: data.entrepreneur_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        attachments: [],
        risk_score: data.risk_score,
        views: data.views || 0,
        interested_investors: data.interested_investors || 0
      };
    } catch (error) {
      console.error('Update opportunity error:', error);
      throw error;
    }
  }

  static async deleteOpportunity(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Delete opportunity error:', error);
      throw error;
    }
  }

  static async updateStatus(id: string, status: OpportunityStatus): Promise<Opportunity> {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.getOpportunity(id).then(opp => opp!);
    } catch (error) {
      console.error('Update status error:', error);
      throw error;
    }
  }

  static async incrementViews(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('opportunities')
        .update({ 
          views: supabase.rpc('increment', { row_id: id, column_name: 'views' }),
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Increment views error:', error);
      throw error;
    }
  }

  static async uploadFile(file: File, userId: string): Promise<string | null> {
    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `${userId}/opportunities/${fileName}`;

      const { data, error } = await supabase.storage
        .from('opportunity-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      return filePath;
    } catch (error) {
      console.error('File upload error:', error);
      return null;
    }
  }

  static async deleteFile(filePath: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from('opportunity-files')
        .remove([filePath]);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('File deletion error:', error);
      throw error;
    }
  }

  static getFileUrl(filePath: string): string {
    const { data } = supabase.storage
      .from('opportunity-files')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }

  static validateFile(file: File): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      'application/pdf', 
      'image/jpeg', 
      'image/png', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (file.size > maxSize) {
      errors.push(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    return { valid: errors.length === 0, errors };
  }
}
