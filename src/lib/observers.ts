
import { supabase } from '@/integrations/supabase/client';

export type ObserverPermission = 'read' | 'comment' | 'download';

export interface Observer {
  id: string;
  name: string;
  email: string;
  relationship?: string;
  entity_id?: string;
  entity_type?: string;
  permissions: ObserverPermission[];
  status: string;
  granted_by?: string;
  granted_by_role?: string;
  access_expiry?: string;
  last_accessed?: string;
  created_at: string;
  metadata: any;
}

export interface ObserverInvitation {
  id: string;
  name: string;
  email: string;
  entity_id?: string;
  entity_type?: string;
  relationship?: string;
  permissions: any;
  status: string;
  expires_at?: string;
  invited_by?: string;
  invited_at: string;
  token: string;
}

export interface PermissionInfo {
  type: string;
  description: string;
}

export interface RelationshipOption {
  value: string;
  label: string;
}

// Mock data for observers
const mockObservers: Observer[] = [
  {
    id: '1',
    name: 'John Observer',
    email: 'john@observer.com',
    relationship: 'advisor',
    entity_id: '1',
    entity_type: 'opportunity',
    permissions: ['read', 'comment'],
    status: 'active',
    granted_by: 'admin-1',
    granted_by_role: 'admin',
    access_expiry: '2024-12-31T23:59:59Z',
    last_accessed: '2024-01-15T10:30:00Z',
    created_at: '2024-01-01T00:00:00Z',
    metadata: {}
  }
];

const mockInvitations: ObserverInvitation[] = [];

export const getObserversByUser = async (userId: string, entityId?: string, entityType?: string): Promise<Observer[]> => {
  console.log('Mock: Getting observers for user', userId, 'entity', entityId, entityType);
  return mockObservers.filter(observer => observer.granted_by === userId);
};

export const getPendingInvitations = async (userId: string, entityId?: string, entityType?: string): Promise<ObserverInvitation[]> => {
  console.log('Mock: Getting pending invitations for user', userId, 'entity', entityId, entityType);
  return mockInvitations.filter(inv => inv.invited_by === userId && inv.status === 'pending');
};

export const getObserverByEmail = async (email: string): Promise<Observer | null> => {
  console.log('Mock: Getting observer by email', email);
  return mockObservers.find(observer => observer.email === email) || null;
};

export const inviteObserver = async (
  invitationData: {
    name: string;
    email: string;
    entityId: string;
    entityType: string;
    relationship?: string;
    permissions: PermissionInfo[];
    inviterId: string;
  }
): Promise<ObserverInvitation> => {
  console.log('Mock: Inviting observer', invitationData);
  
  const invitation: ObserverInvitation = {
    id: `inv-${Date.now()}`,
    name: invitationData.name,
    email: invitationData.email,
    entity_id: invitationData.entityId,
    entity_type: invitationData.entityType,
    relationship: invitationData.relationship,
    permissions: invitationData.permissions,
    status: 'pending',
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    invited_by: invitationData.inviterId,
    invited_at: new Date().toISOString(),
    token: `token-${Date.now()}`
  };

  mockInvitations.push(invitation);
  return invitation;
};

export const revokeObserver = async (observerId: string, userId: string): Promise<void> => {
  console.log('Mock: Revoking observer access', observerId, 'by user', userId);
  const index = mockObservers.findIndex(obs => obs.id === observerId);
  if (index > -1) {
    mockObservers[index].status = 'revoked';
  }
};

export const getAvailablePermissions = (entityType?: string): PermissionInfo[] => {
  return [
    { type: 'read', description: 'View documents and information' },
    { type: 'comment', description: 'Add comments and feedback' },
    { type: 'download', description: 'Download documents' }
  ];
};

export const getRelationshipOptions = (): RelationshipOption[] => {
  return [
    { value: 'advisor', label: 'Advisor' },
    { value: 'investor', label: 'Investor' },
    { value: 'mentor', label: 'Mentor' },
    { value: 'partner', label: 'Partner' },
    { value: 'consultant', label: 'Consultant' },  
    { value: 'other', label: 'Other' }
  ];
};

export const getObserverStats = async (userId: string, entityId?: string, entityType?: string): Promise<{
  totalObservers: number;
  activeObservers: number;
  pendingInvitations: number;
  revokedObservers: number;
}> => {
  console.log('Mock: Getting observer stats for', userId, 'entity', entityId, entityType);
  return {
    totalObservers: mockObservers.length,
    activeObservers: mockObservers.filter(obs => obs.status === 'active').length,
    pendingInvitations: mockInvitations.filter(inv => inv.status === 'pending').length,
    revokedObservers: mockObservers.filter(obs => obs.status === 'revoked').length
  };
};

export const getObserverAccessLog = async (observerId: string): Promise<any[]> => {
  console.log('Mock: Getting access log for observer', observerId);
  return [
    {
      id: '1',
      observer_id: observerId,
      action: 'view_document',
      resource: 'pitch_deck.pdf',
      accessed_at: new Date().toISOString(),
      ip_address: '192.168.1.1',
      user_agent: 'Mozilla/5.0...',
      metadata: {}
    }
  ];
};

export const logObserverAccess = async (
  observerId: string,
  action: string,
  resource: string,
  metadata?: any
): Promise<void> => {
  console.log('Mock: Logging observer access', { observerId, action, resource, metadata });
};

export const grantObserverAccess = async (
  observerData: {
    name: string;
    email: string;
    entity_id: string;
    entity_type: string;
    permissions: ObserverPermission[];
    relationship?: string;
    access_expiry?: string;
  },
  grantedBy: string
): Promise<Observer> => {
  console.log('Mock: Granting observer access', observerData, 'by', grantedBy);
  
  const observer: Observer = {
    id: `obs-${Date.now()}`,
    name: observerData.name,
    email: observerData.email,
    entity_id: observerData.entity_id,
    entity_type: observerData.entity_type,
    relationship: observerData.relationship,
    permissions: observerData.permissions,
    status: 'active',
    granted_by: grantedBy,
    granted_by_role: 'admin',
    access_expiry: observerData.access_expiry,
    last_accessed: undefined,
    created_at: new Date().toISOString(),
    metadata: {}
  };

  mockObservers.push(observer);
  return observer;
};
