
// Observer Management System
// Handles observer access grants and permissions

import { supabase } from '@/integrations/supabase/client';

export interface ObserverPermission {
  type: string;
  scope: string;
  description: string;
}

export interface Observer {
  id: string;
  name: string;
  email: string;
  relationship: string;
  entity_id: string;
  entity_type: string;
  permissions: ObserverPermission[];
  status: string;
  granted_by: string;
  granted_by_role: string;
  access_expiry?: string;
  last_accessed?: string;
  created_at: string;
  metadata?: any;
}

export interface ObserverInvitation {
  id: string;
  name: string;
  email: string;
  relationship: string;
  entity_id: string;
  entity_type: string;
  permissions: ObserverPermission[];
  status: string;
  invited_by: string;
  invited_at: string;
  expires_at: string;
  token: string;
}

export interface ObserverStats {
  totalObservers: number;
  activeObservers: number;
  pendingInvitations: number;
  revokedObservers: number;
}

class ObserverService {
  async getObservers(entityId: string, entityType: string): Promise<Observer[]> {
    const { data, error } = await supabase
      .from('observers')
      .select('*')
      .eq('entity_id', entityId)
      .eq('entity_type', entityType)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Transform the data to match our interface
    return (data || []).map(obs => ({
      ...obs,
      permissions: this.parsePermissions(obs.permissions)
    })) as Observer[];
  }

  async getObserversByUser(userId: string, entityId: string, entityType: string): Promise<Observer[]> {
    return this.getObservers(entityId, entityType);
  }

  async getObserverInvitations(entityId: string, entityType: string): Promise<ObserverInvitation[]> {
    const { data, error } = await supabase
      .from('observer_invitations')
      .select('*')
      .eq('entity_id', entityId)
      .eq('entity_type', entityType)
      .order('invited_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(inv => ({
      ...inv,
      permissions: this.parsePermissions(inv.permissions)
    })) as ObserverInvitation[];
  }

  async getPendingInvitations(userId: string, entityId: string, entityType: string): Promise<ObserverInvitation[]> {
    return this.getObserverInvitations(entityId, entityType);
  }

  async getObserverStats(userId: string, entityId: string, entityType: string): Promise<ObserverStats> {
    const [observers, invitations] = await Promise.all([
      this.getObservers(entityId, entityType),
      this.getObserverInvitations(entityId, entityType)
    ]);

    return {
      totalObservers: observers.length,
      activeObservers: observers.filter(o => o.status === 'active').length,
      pendingInvitations: invitations.filter(i => i.status === 'pending').length,
      revokedObservers: observers.filter(o => o.status === 'revoked').length
    };
  }

  async inviteObserver(invitation: Omit<ObserverInvitation, 'id' | 'invited_at' | 'token' | 'status'>): Promise<ObserverInvitation> {
    const token = this.generateInvitationToken();
    
    const { data, error } = await supabase
      .from('observer_invitations')
      .insert({
        name: invitation.name,
        email: invitation.email,
        relationship: invitation.relationship,
        entity_id: invitation.entity_id,
        entity_type: invitation.entity_type,
        permissions: this.serializePermissions(invitation.permissions),
        status: 'pending',
        invited_by: invitation.invited_by,
        invited_at: new Date().toISOString(),
        expires_at: invitation.expires_at,
        token
      })
      .select()
      .single();

    if (error) throw error;
    
    return {
      ...data,
      permissions: invitation.permissions
    } as ObserverInvitation;
  }

  async acceptInvitation(token: string): Promise<Observer> {
    // Get invitation
    const { data: invitation, error: invError } = await supabase
      .from('observer_invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single();

    if (invError || !invitation) {
      throw new Error('Invalid or expired invitation');
    }

    // Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      throw new Error('Invitation has expired');
    }

    // Create observer
    const { data, error } = await supabase
      .from('observers')
      .insert({
        name: invitation.name,
        email: invitation.email,
        relationship: invitation.relationship,
        entity_id: invitation.entity_id,
        entity_type: invitation.entity_type,
        permissions: invitation.permissions,
        status: 'active',
        granted_by: invitation.invited_by,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Mark invitation as accepted
    await supabase
      .from('observer_invitations')
      .update({ status: 'accepted' })
      .eq('id', invitation.id);

    return {
      ...data,
      permissions: this.parsePermissions(data.permissions)
    } as Observer;
  }

  async revokeObserver(observerId: string, userId?: string): Promise<void> {
    const { error } = await supabase
      .from('observers')
      .update({ status: 'revoked' })
      .eq('id', observerId);

    if (error) throw error;
  }

  async logObserverAccess(observerId: string, action: string, resource: string): Promise<void> {
    const { error } = await supabase
      .from('observer_access_logs')
      .insert({
        observer_id: observerId,
        action,
        resource,
        accessed_at: new Date().toISOString()
      });

    if (error) throw error;
  }

  private parsePermissions(permissions: any): ObserverPermission[] {
    if (!permissions) return [];
    
    try {
      if (typeof permissions === 'string') {
        return JSON.parse(permissions);
      }
      if (Array.isArray(permissions)) {
        return permissions;
      }
      return [];
    } catch {
      return [];
    }
  }

  private serializePermissions(permissions: ObserverPermission[]): any {
    return permissions; // Supabase will handle JSON serialization
  }

  private generateInvitationToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}

export const observerService = new ObserverService();

// Export individual functions for backward compatibility
export const getObserversByUser = (userId: string, entityId: string, entityType: string) => 
  observerService.getObserversByUser(userId, entityId, entityType);

export const getPendingInvitations = (userId: string, entityId: string, entityType: string) => 
  observerService.getPendingInvitations(userId, entityId, entityType);

export const inviteObserver = (data: { email: string; name: string; relationship: string; entityId: string; entityType: string; permissions: ObserverPermission[]; inviterId: string }) => 
  observerService.inviteObserver({
    email: data.email,
    name: data.name,
    relationship: data.relationship,
    entity_id: data.entityId,
    entity_type: data.entityType,
    permissions: data.permissions,
    invited_by: data.inviterId,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
  });

export const revokeObserver = (observerId: string, userId: string) => 
  observerService.revokeObserver(observerId, userId);

export const getObserverStats = (userId: string, entityId: string, entityType: string) => 
  observerService.getObserverStats(userId, entityId, entityType);

// Mock functions for permissions and relationships
export const getAvailablePermissions = (entityType: string): ObserverPermission[] => {
  return DEFAULT_OBSERVER_PERMISSIONS.investor || [];
};

export const getRelationshipOptions = () => [
  { value: 'investor', label: 'Investor' },
  { value: 'advisor', label: 'Advisor' },
  { value: 'auditor', label: 'Auditor' },
  { value: 'mentor', label: 'Mentor' },
  { value: 'partner', label: 'Partner' },
  { value: 'consultant', label: 'Consultant' }
];

// Default permission sets
export const DEFAULT_OBSERVER_PERMISSIONS: Record<string, ObserverPermission[]> = {
  investor: [
    { type: 'view', scope: 'financial_reports', description: 'View financial reports and statements' },
    { type: 'view', scope: 'milestones', description: 'View milestone progress and updates' },
    { type: 'view', scope: 'basic_info', description: 'View basic opportunity information' }
  ],
  advisor: [
    { type: 'view', scope: 'all_reports', description: 'View all reports and documents' },
    { type: 'view', scope: 'team_updates', description: 'View team and operational updates' },
    { type: 'comment', scope: 'documents', description: 'Comment on documents and reports' }
  ],
  auditor: [
    { type: 'view', scope: 'financial_data', description: 'Full access to financial data' },
    { type: 'view', scope: 'compliance_docs', description: 'View compliance and regulatory documents' },
    { type: 'export', scope: 'financial_reports', description: 'Export financial reports' }
  ],
  mentor: [
    { type: 'view', scope: 'business_metrics', description: 'View business performance metrics' },
    { type: 'view', scope: 'team_info', description: 'View team information and updates' },
    { type: 'comment', scope: 'milestones', description: 'Provide feedback on milestones' }
  ]
};

// Utility functions
export async function grantObserverAccess(
  grantedBy: string,
  observerData: {
    name: string;
    email: string;
    relationship: string;
    entityId: string;
    entityType: string;
    permissions: ObserverPermission[];
    accessExpiry?: string;
  }
): Promise<ObserverInvitation> {
  const expiresAt = observerData.accessExpiry || 
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

  return observerService.inviteObserver({
    name: observerData.name,
    email: observerData.email,
    relationship: observerData.relationship,
    entity_id: observerData.entityId,
    entity_type: observerData.entityType,
    permissions: observerData.permissions,
    invited_by: grantedBy,
    expires_at: expiresAt
  });
}

export async function getObserversForEntity(entityId: string, entityType: string): Promise<Observer[]> {
  return observerService.getObservers(entityId, entityType);
}
