
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ServiceRequest {
  id: string;
  requestor_id: string;
  associated_entity_id?: string;
  associated_entity_type?: string;
  service_category_id?: string;
  scope_description: string;
  deliverables: string[];
  start_date?: string;
  end_date?: string;
  proposed_budget?: number;
  status: string;
  selected_service_provider_ids: string[];
  attachments: string[];
  created_at: string;
  updated_at: string;
  service_categories?: {
    name: string;
    description: string;
  };
}

export const useServiceRequests = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchRequests = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('service_requests')
        .select(`
          *,
          service_categories (
            name,
            description
          )
        `)
        .eq('requestor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch service requests');
    } finally {
      setLoading(false);
    }
  };

  const createServiceRequest = async (requestData: Partial<ServiceRequest>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('service_requests')
        .insert([{
          ...requestData,
          requestor_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      await fetchRequests();
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create service request');
    }
  };

  const updateServiceRequest = async (id: string, updates: Partial<ServiceRequest>) => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchRequests();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update service request');
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  return {
    requests,
    loading,
    error,
    createServiceRequest,
    updateServiceRequest,
    refetch: fetchRequests
  };
};
