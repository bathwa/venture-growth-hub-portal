
import { supabase } from '@/integrations/supabase/client';

export interface Agreement {
  id: string;
  agreement_type: string;
  content: any;
  parties: any;
  variables: any;
  status: string;
  document_id?: string;
  signed_at?: string;
  expires_at?: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export class AgreementManager {
  static async createAgreement(agreementData: any): Promise<Agreement> {
    try {
      const { data, error } = await supabase
        .from('agreements')
        .insert(agreementData)
        .select()
        .single();

      if (error) throw error;
      return data as Agreement;
    } catch (error) {
      console.error('Create agreement error:', error);
      throw error;
    }
  }

  static async getAgreements(): Promise<Agreement[]> {
    try {
      const { data, error } = await supabase
        .from('agreements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Agreement[];
    } catch (error) {
      console.error('Get agreements error:', error);
      return [];
    }
  }

  static async getAgreement(id: string): Promise<Agreement | null> {
    try {
      const { data, error } = await supabase
        .from('agreements')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Agreement;
    } catch (error) {
      console.error('Get agreement error:', error);
      return null;
    }
  }

  static async updateAgreement(id: string, updates: Partial<Agreement>): Promise<Agreement> {
    try {
      const { data, error } = await supabase
        .from('agreements')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Agreement;
    } catch (error) {
      console.error('Update agreement error:', error);
      throw error;
    }
  }

  static async deleteAgreement(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('agreements')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Delete agreement error:', error);
      throw error;
    }
  }
}

// Export individual functions for backward compatibility
export const createAgreement = (agreementData: any) => AgreementManager.createAgreement(agreementData);
export const getAgreements = () => AgreementManager.getAgreements();
export const getAgreement = (id: string) => AgreementManager.getAgreement(id);
export const updateAgreement = (id: string, updates: Partial<Agreement>) => AgreementManager.updateAgreement(id, updates);
export const deleteAgreement = (id: string) => AgreementManager.deleteAgreement(id);
