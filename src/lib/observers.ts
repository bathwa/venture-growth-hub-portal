// Observer Management System
// Allows users to grant limited read-only access to persons of interest

import { supabase } from '@/integrations/supabase/client';

export interface Observer {
  id: string;
  name: string;
  email: string;
  relationship: string;
  granted_by: string;
  granted_by_role: string;
  entity_id: string;
  entity_type: string;
  permissions: ObserverPermission[];
  status: 'active' | 'pending' | 'revoked';
  created_at: string;
  last_accessed?: string;
  access_expiry?: string;
}

export interface ObserverPermission {
  type: string;
  scope: 'read_only';
  description: string;
}

export interface ObserverInvitation {
  id: string;
  email: string;
  name: string;
  relationship: string;
  entity_id: string;
  entity_type: string;
  permissions: ObserverPermission[];
  status: 'pending' | 'accepted' | 'expired';
  invited_by: string;
  invited_at: string;
  expires_at: string;
  token: string;
}

export interface ObserverAccessLog {
  id: string;
  observer_id: string;
  action: string;
  resource: string;
  accessed_at: string;
  ip_address?: string;
  user_agent?: string;
}

// --- Supabase-backed functions ---

// Get observers granted by a specific user (optionally filter by entity)
export async function getObserversByUser(userId: string, entityId?: string, entityType?: string): Promise<Observer[]> {
  let query = supabase
    .from('observers')
    .select('*')
    .eq('granted_by', userId);
  if (entityId) query = query.eq('entity_id', entityId);
  if (entityType) query = query.eq('entity_type', entityType);
  const { data, error } = await query;
  if (error) throw error;
  return data as Observer[];
}

// Get pending invitations for a user (optionally filter by entity)
export async function getPendingInvitations(userId: string, entityId?: string, entityType?: string): Promise<ObserverInvitation[]> {
  let query = supabase
    .from('observer_invitations')
    .select('*')
    .eq('invited_by', userId)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString());
  if (entityId) query = query.eq('entity_id', entityId);
  if (entityType) query = query.eq('entity_type', entityType);
  const { data, error } = await query;
  if (error) throw error;
  return data as ObserverInvitation[];
}

// Invite an observer (create invitation row)
export async function inviteObserver({
  email,
  name,
  relationship,
  entityId,
  entityType,
  permissions,
  inviterId
}: {
  email: string;
  name: string;
  relationship: string;
  entityId: string;
  entityType: string;
  permissions: ObserverPermission[];
  inviterId: string;
}): Promise<ObserverInvitation> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const token = `token-${Math.random().toString(36).substr(2, 9)}`;
  const { data, error } = await supabase
    .from('observer_invitations')
    .insert([
      {
        email,
        name,
        relationship,
        entity_id: entityId,
        entity_type: entityType,
        permissions,
        status: 'pending',
        invited_by: inviterId,
        invited_at: new Date().toISOString(),
        expires_at: expiresAt,
        token
      }
    ])
    .select()
    .single();
  if (error) throw error;
  return data as ObserverInvitation;
}

// Accept invitation and create observer
export async function acceptInvitation(token: string, observerEmail: string): Promise<Observer | null> {
  // First, get the invitation
  const { data: invitation, error: inviteError } = await supabase
    .from('observer_invitations')
    .select('*')
    .eq('token', token)
    .eq('status', 'pending')
    .single();
  
  if (inviteError || !invitation || new Date(invitation.expires_at) < new Date()) {
    return null;
  }

  // Get user role for the inviter
  const { data: user } = await supabase.auth.getUser();
  const inviterRole = await getUserRole(invitation.invited_by);

  // Create observer
  const { data: observer, error: observerError } = await supabase
    .from('observers')
    .insert([
      {
        name: invitation.name,
        email: observerEmail,
        relationship: invitation.relationship,
        granted_by: invitation.invited_by,
        granted_by_role: inviterRole,
        entity_id: invitation.entity_id,
        entity_type: invitation.entity_type,
        permissions: invitation.permissions,
        status: 'active',
        created_at: new Date().toISOString()
      }
    ])
    .select()
    .single();

  if (observerError) throw observerError;

  // Update invitation status to accepted
  await supabase
    .from('observer_invitations')
    .update({ status: 'accepted' })
    .eq('id', invitation.id);

  return observer as Observer;
}

// Revoke observer access (set status to revoked)
export async function revokeObserver(observerId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('observers')
    .update({ status: 'revoked' })
    .eq('id', observerId)
    .eq('granted_by', userId);
  if (error) throw error;
  return true;
}

// Update observer permissions
export async function updateObserverPermissions(
  observerId: string, 
  permissions: ObserverPermission[], 
  userId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('observers')
    .update({ permissions })
    .eq('id', observerId)
    .eq('granted_by', userId);
  if (error) throw error;
  return true;
}

// Get observer access logs
export async function getObserverAccessLog(observerId: string, limit: number = 50): Promise<ObserverAccessLog[]> {
  const { data, error } = await supabase
    .from('observer_access_logs')
    .select('*')
    .eq('observer_id', observerId)
    .order('accessed_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as ObserverAccessLog[];
}

// Log observer access
export async function logObserverAccess(
  observerId: string,
  action: string,
  resource: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const { error } = await supabase
    .from('observer_access_logs')
    .insert([
      {
        observer_id: observerId,
        action,
        resource,
        accessed_at: new Date().toISOString(),
        ip_address: ipAddress,
        user_agent: userAgent
      }
    ]);
  if (error) throw error;
}

// Bulk revoke observers
export async function bulkRevokeObservers(observerIds: string[], userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('observers')
    .update({ status: 'revoked' })
    .in('id', observerIds)
    .eq('granted_by', userId);
  if (error) throw error;
  return true;
}

// Get available permissions for an entity type
export function getAvailablePermissions(entityType: string): ObserverPermission[] {
  // This can be made dynamic if you store permissions in DB
  const all: { [key: string]: ObserverPermission[] } = {
    opportunity: [
      { type: 'view_opportunity', scope: 'read_only', description: 'View opportunity details' },
      { type: 'view_milestones', scope: 'read_only', description: 'View progress milestones' },
      { type: 'view_documents', scope: 'read_only', description: 'View documents' },
      { type: 'view_financials', scope: 'read_only', description: 'View financials' },
      { type: 'view_reports', scope: 'read_only', description: 'View progress reports' }
    ],
    investment: [
      { type: 'view_investment', scope: 'read_only', description: 'View investment details' },
      { type: 'view_reports', scope: 'read_only', description: 'View performance reports' },
      { type: 'view_documents', scope: 'read_only', description: 'View documents' }
    ],
    pool: [
      { type: 'view_reports', scope: 'read_only', description: 'View pool reports' },
      { type: 'view_documents', scope: 'read_only', description: 'View legal documents' }
    ],
    company: [
      { type: 'view_reports', scope: 'read_only', description: 'View company reports' },
      { type: 'view_documents', scope: 'read_only', description: 'View company documents' }
    ]
  };
  return all[entityType] || [];
}

// Get relationship options
export function getRelationshipOptions(): { value: string; label: string }[] {
  return [
    { value: 'family', label: 'Family' },
    { value: 'partner', label: 'Partner' },
    { value: 'employee', label: 'Employee' },
    { value: 'creditor', label: 'Creditor' },
    { value: 'advisor', label: 'Advisor' },
    { value: 'other', label: 'Other' }
  ];
}

// Get observer stats for a user (optionally filter by entity)
export async function getObserverStats(userId: string, entityId?: string, entityType?: string) {
  const observers = await getObserversByUser(userId, entityId, entityType);
  const pending = await getPendingInvitations(userId, entityId, entityType);
  return {
    totalObservers: observers.length,
    activeObservers: observers.filter(o => o.status === 'active').length,
    pendingInvitations: pending.length,
    revokedObservers: observers.filter(o => o.status === 'revoked').length
  };
}

// Helper function to get user role
async function getUserRole(userId: string): Promise<string> {
  // This would typically come from a user profile or role table
  // For now, we'll use a simple mapping based on user ID pattern
  if (userId.includes('ent')) return 'entrepreneur';
  if (userId.includes('inv')) return 'investor';
  if (userId.includes('pool')) return 'pool_manager';
  if (userId.includes('admin')) return 'admin';
  return 'user';
}

// Check if observer has specific permission
export function hasPermission(observer: Observer, permissionType: string): boolean {
  if (observer.status !== 'active') return false;
  return observer.permissions.some(perm => perm.type === permissionType);
}

// Get observers by email (for invitation acceptance)
export async function getObserverByEmail(email: string): Promise<Observer | null> {
  const { data, error } = await supabase
    .from('observers')
    .select('*')
    .eq('email', email)
    .eq('status', 'active')
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data as Observer | null;
}

// You can add more functions as needed for accepting invitations, updating permissions, etc. 