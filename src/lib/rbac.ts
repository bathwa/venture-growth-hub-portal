// Role-Based Access Control (RBAC) Module
// Aligned with the new Supabase schema using user_roles table and app_role enum

export type AppRole = 'admin' | 'entrepreneur' | 'investor' | 'pool_member' | 'service_provider';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface RBACPermissions {
  [key: string]: string[];
}

// Define permissions for each role
const ROLE_PERMISSIONS: Record<AppRole, string[]> = {
  admin: [
    'view_all',
    'manage_users',
    'approve_payments',
    'publish_opportunities',
    'manage_pools',
    'view_kyc',
    'manage_agreements',
    'generate_reports',
    'manage_settings',
  ],
  entrepreneur: [
    'create_opportunity',
    'edit_own_opportunity',
    'view_own_opportunity',
    'manage_own_milestones',
    'upload_files',
    'view_own_offers',
    'manage_own_agreements',
    'view_own_payments',
    'update_kyc',
  ],
  investor: [
    'view_opportunities',
    'make_offers',
    'view_own_investments',
    'view_agreements',
    'upload_payment_proof',
    'view_milestones',
  ],
  pool_member: [
    'view_pool_opportunities',
    'vote_on_investments',
    'view_pool_reports',
    'participate_in_pool',
  ],
  service_provider: [
    'view_assigned_tasks',
    'submit_reports',
    'upload_credentials',
    'manage_own_profile',
    'view_opportunity_details',
  ],
};

export class RBAC {
  private userRoles: UserRole[] = [];
  private currentUserId: string | null = null;

  constructor(userId?: string) {
    this.currentUserId = userId || null;
  }

  // Set user roles (call this after fetching from Supabase)
  setUserRoles(roles: UserRole[]) {
    this.userRoles = roles;
  }

  // Set current user ID
  setCurrentUser(userId: string) {
    this.currentUserId = userId;
  }

  // Check if user has a specific role
  hasRole(role: AppRole): boolean {
    return this.userRoles.some(userRole => userRole.role === role);
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles: AppRole[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  // Check if user can perform a specific action
  canPerformAction(action: string): boolean {
    const userRoles = this.userRoles.map(ur => ur.role);
    
    for (const role of userRoles) {
      const permissions = ROLE_PERMISSIONS[role];
      if (permissions && permissions.includes(action)) {
        return true;
      }
    }
    
    return false;
  }

  // Check if user can perform any of the specified actions
  canPerformAnyAction(actions: string[]): boolean {
    return actions.some(action => this.canPerformAction(action));
  }

  // Get all permissions for current user
  getUserPermissions(): string[] {
    const permissions = new Set<string>();
    
    this.userRoles.forEach(userRole => {
      const rolePermissions = ROLE_PERMISSIONS[userRole.role];
      if (rolePermissions) {
        rolePermissions.forEach(permission => permissions.add(permission));
      }
    });
    
    return Array.from(permissions);
  }

  // Check if user can access a specific resource
  canAccessResource(resourceType: string, resourceId: string, action: string): boolean {
    // Admin can access everything
    if (this.hasRole('admin')) return true;

    // Check specific resource access rules
    switch (resourceType) {
      case 'opportunity':
        return this.canAccessOpportunity(resourceId, action);
      case 'payment':
        return this.canAccessPayment(resourceId, action);
      case 'agreement':
        return this.canAccessAgreement(resourceId, action);
      case 'milestone':
        return this.canAccessMilestone(resourceId, action);
      default:
        return this.canPerformAction(action);
    }
  }

  private canAccessOpportunity(opportunityId: string, action: string): boolean {
    // This would need to be implemented with actual opportunity data
    // For now, return true if user can perform the action
    return this.canPerformAction(action);
  }

  private canAccessPayment(paymentId: string, action: string): boolean {
    // This would need to be implemented with actual payment data
    // For now, return true if user can perform the action
    return this.canPerformAction(action);
  }

  private canAccessAgreement(agreementId: string, action: string): boolean {
    // This would need to be implemented with actual agreement data
    // For now, return true if user can perform the action
    return this.canPerformAction(action);
  }

  private canAccessMilestone(milestoneId: string, action: string): boolean {
    // This would need to be implemented with actual milestone data
    // For now, return true if user can perform the action
    return this.canPerformAction(action);
  }
}

// Export a singleton instance
export const rbac = new RBAC();

// Helper functions for common permission checks
export const canCreateOpportunity = () => rbac.canPerformAction('create_opportunity');
export const canViewAllOpportunities = () => rbac.canPerformAction('view_all');
export const canApprovePayments = () => rbac.canPerformAction('approve_payments');
export const canManageUsers = () => rbac.canPerformAction('manage_users');
export const canGenerateReports = () => rbac.canPerformAction('generate_reports'); 