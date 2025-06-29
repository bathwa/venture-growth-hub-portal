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

export const getAgreements = async (): Promise<Agreement[]> => {
  // try {
  //   const { data, error } = await supabase
  //     .from('agreements')
  //     .select('*');

  //   if (error) {
  //     console.error('Error fetching agreements:', error);
  //     return [];
  //   }

  //   return data.map(agreement => ({
  //     id: agreement.id,
  //     title: agreement.title,
  //     type: agreement.type as AgreementType,
  //     parties: agreement.parties,
  //     status: agreement.status as Agreement['status'],
  //     createdAt: new Date(agreement.created_at),
  //     content: agreement.content,
  //   }));
  // } catch (error) {
  //   console.error('Error fetching agreements:', error);
  //   return [];
  // }
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
