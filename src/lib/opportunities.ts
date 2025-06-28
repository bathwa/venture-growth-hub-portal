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
      // DRBE validation
      const opportunity = {
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

      // Create opportunity in database
      const { data: opportunityData, error } = await supabase
        .from('opportunities')
        .insert({
          title: data.title,
          description: data.description,
          type: data.type,
          status: 'draft',
          equity_offered: data.equity_offered,
          order_details: data.order_details,
          partner_roles: data.partner_roles,
          target_amount: data.target_amount,
          currency: data.currency,
          location: data.location,
          industry: data.industry,
          created_by: data.created_by,
          attachments: uploadedPaths,
          risk_score: riskScore,
          views: 0,
          interested_investors: 0
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return opportunityData;
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
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
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

      return data;
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
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
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

      return data;
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