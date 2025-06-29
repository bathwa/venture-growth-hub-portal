
import { supabase } from '@/integrations/supabase/client';

export type AgreementType = 'investment' | 'nda' | 'pool' | 'service';

export interface Agreement {
  id: string;
  title: string;
  type: AgreementType;
  parties: string[];
  status: 'draft' | 'pending' | 'signed' | 'expired';
  createdAt: Date;
  content?: string;
}

export interface AgreementTemplate {
  id: string;
  name: string;
  type: AgreementType;
  template: string;
  variables: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const getAgreements = async (): Promise<Agreement[]> => {
  // Return mock data for now - will be replaced with real Supabase data later
  return [
    {
      id: '1',
      title: 'Investment Agreement',
      type: 'investment',
      parties: ['Investor A', 'Company B'],
      status: 'signed',
      createdAt: new Date(),
      content: 'This is a sample investment agreement.'
    },
    {
      id: '2',
      title: 'Non-Disclosure Agreement',
      type: 'nda',
      parties: ['Party X', 'Party Y'],
      status: 'pending',
      createdAt: new Date(),
      content: 'This is a sample non-disclosure agreement.'
    },
    {
      id: '3',
      title: 'Pool Agreement',
      type: 'pool',
      parties: ['Pool Manager', 'Member 1', 'Member 2'],
      status: 'draft',
      createdAt: new Date(),
      content: 'This is a sample pool agreement.'
    },
    {
      id: '4',
      title: 'Service Agreement',
      type: 'service',
      parties: ['Client A', 'Service Provider B'],
      status: 'expired',
      createdAt: new Date(),
      content: 'This is a sample service agreement.'
    },
  ];
};

export const getAgreementTemplates = async (): Promise<AgreementTemplate[]> => {
  return [
    {
      id: '1',
      name: 'Standard Investment Agreement',
      type: 'investment',
      template: 'Investment agreement template content...',
      variables: ['investor_name', 'company_name', 'amount', 'equity_percentage'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Basic NDA',
      type: 'nda',
      template: 'Non-disclosure agreement template content...',
      variables: ['party1_name', 'party2_name', 'effective_date'],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
};
