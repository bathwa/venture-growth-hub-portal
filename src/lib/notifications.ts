// Notification Management System
// Handles all notifications, alerts, and communication across the platform

import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  user_id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'milestone' | 'payment' | 'agreement' | 'kyc' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'unread' | 'read' | 'archived';
  action_required: boolean;
  action_url?: string;
  action_text?: string;
  expires_at?: string;
  created_at: string;
  read_at?: string;
  metadata?: {
    source_entity?: string;
    source_type?: string;
    related_ids?: string[];
    tags?: string[];
  };
  is_read: boolean;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: Notification['type'];
  title_template: string;
  message_template: string;
  priority: Notification['priority'];
  action_required: boolean;
  action_url_template?: string;
  action_text?: string;
  expires_in_hours?: number;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  in_app_enabled: boolean;
  types: {
    [key in Notification['type']]: {
      email: boolean;
      push: boolean;
      sms: boolean;
      in_app: boolean;
    };
  };
  quiet_hours: {
    enabled: boolean;
    start_time: string; // HH:mm format
    end_time: string; // HH:mm format
    timezone: string;
  };
  updated_at: string;
}

// Default notification templates
export const DEFAULT_NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'milestone-due',
    name: 'Milestone Due',
    type: 'milestone',
    title_template: 'Milestone Due: {{milestone_name}}',
    message_template: 'The milestone "{{milestone_name}}" for {{opportunity_title}} is due on {{due_date}}. Please update the status.',
    priority: 'high',
    action_required: true,
    action_url_template: '/entrepreneur/opportunities/{{opportunity_id}}/milestones',
    action_text: 'Update Milestone',
    expires_in_hours: 72,
    variables: ['milestone_name', 'opportunity_title', 'due_date', 'opportunity_id'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'milestone-overdue',
    name: 'Milestone Overdue',
    type: 'warning',
    title_template: 'Milestone Overdue: {{milestone_name}}',
    message_template: 'The milestone "{{milestone_name}}" for {{opportunity_title}} is overdue by {{days_overdue}} days.',
    priority: 'urgent',
    action_required: true,
    action_url_template: '/entrepreneur/opportunities/{{opportunity_id}}/milestones',
    action_text: 'Update Milestone',
    expires_in_hours: 168,
    variables: ['milestone_name', 'opportunity_title', 'days_overdue', 'opportunity_id'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'payment-received',
    name: 'Payment Received',
    type: 'success',
    title_template: 'Payment Received: {{amount}}',
    message_template: 'Payment of {{amount}} has been received for {{opportunity_title}}.',
    priority: 'medium',
    action_required: false,
    action_url_template: '/investor/opportunities/{{opportunity_id}}',
    action_text: 'View Details',
    expires_in_hours: 168,
    variables: ['amount', 'opportunity_title', 'opportunity_id'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'payment-due',
    name: 'Payment Due',
    type: 'payment',
    title_template: 'Payment Due: {{amount}}',
    message_template: 'Payment of {{amount}} is due for {{opportunity_title}} on {{due_date}}.',
    priority: 'high',
    action_required: true,
    action_url_template: '/investor/payments',
    action_text: 'Make Payment',
    expires_in_hours: 72,
    variables: ['amount', 'opportunity_title', 'due_date'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'agreement-pending',
    name: 'Agreement Pending Signature',
    type: 'agreement',
    title_template: 'Agreement Pending: {{agreement_title}}',
    message_template: 'The {{agreement_title}} agreement is pending your signature.',
    priority: 'high',
    action_required: true,
    action_url_template: '/agreements/{{agreement_id}}',
    action_text: 'Sign Agreement',
    expires_in_hours: 168,
    variables: ['agreement_title', 'agreement_id'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'kyc-required',
    name: 'KYC Verification Required',
    type: 'kyc',
    title_template: 'KYC Verification Required',
    message_template: 'Please complete your KYC verification to continue using the platform.',
    priority: 'high',
    action_required: true,
    action_url_template: '/kyc/verification',
    action_text: 'Complete KYC',
    expires_in_hours: 168,
    variables: [],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'kyc-approved',
    name: 'KYC Approved',
    type: 'success',
    title_template: 'KYC Verification Approved',
    message_template: 'Your KYC verification has been approved. You can now access all platform features.',
    priority: 'medium',
    action_required: false,
    action_url_template: '/dashboard',
    action_text: 'Go to Dashboard',
    expires_in_hours: 168,
    variables: [],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'opportunity-published',
    name: 'Opportunity Published',
    type: 'success',
    title_template: 'Opportunity Published: {{opportunity_title}}',
    message_template: 'Your opportunity "{{opportunity_title}}" has been published and is now visible to investors.',
    priority: 'medium',
    action_required: false,
    action_url_template: '/entrepreneur/opportunities/{{opportunity_id}}',
    action_text: 'View Opportunity',
    expires_in_hours: 168,
    variables: ['opportunity_title', 'opportunity_id'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'investment-received',
    name: 'Investment Received',
    type: 'success',
    title_template: 'Investment Received: {{amount}}',
    message_template: 'You have received an investment of {{amount}} from {{investor_name}} for {{opportunity_title}}.',
    priority: 'high',
    action_required: false,
    action_url_template: '/entrepreneur/opportunities/{{opportunity_id}}',
    action_text: 'View Details',
    expires_in_hours: 168,
    variables: ['amount', 'investor_name', 'opportunity_title', 'opportunity_id'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pool-invitation',
    name: 'Pool Invitation',
    type: 'info',
    title_template: 'Pool Invitation: {{pool_name}}',
    message_template: 'You have been invited to join the investment pool "{{pool_name}}" with a minimum contribution of {{min_contribution}}.',
    priority: 'medium',
    action_required: true,
    action_url_template: '/pools/{{pool_id}}/invitation',
    action_text: 'View Invitation',
    expires_in_hours: 168,
    variables: ['pool_name', 'min_contribution', 'pool_id'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'system-maintenance',
    name: 'System Maintenance',
    type: 'system',
    title_template: 'Scheduled Maintenance: {{maintenance_title}}',
    message_template: 'System maintenance is scheduled for {{maintenance_date}} from {{start_time}} to {{end_time}}. Some features may be temporarily unavailable.',
    priority: 'medium',
    action_required: false,
    expires_in_hours: 24,
    variables: ['maintenance_title', 'maintenance_date', 'start_time', 'end_time'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'security-alert',
    name: 'Security Alert',
    type: 'error',
    title_template: 'Security Alert: {{alert_title}}',
    message_template: '{{alert_message}}. Please review your account security settings.',
    priority: 'urgent',
    action_required: true,
    action_url_template: '/security/settings',
    action_text: 'Review Security',
    expires_in_hours: 168,
    variables: ['alert_title', 'alert_message'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Notification Manager Class
export class NotificationManager {
  private notifications: Notification[] = [];
  private templates: NotificationTemplate[] = DEFAULT_NOTIFICATION_TEMPLATES;
  private preferences: Map<string, NotificationPreferences> = new Map();

  constructor() {
    this.loadPreferences();
  }

  // Create a new notification
  async createNotification(
    userId: string,
    templateId: string,
    variables: Record<string, any>,
    metadata?: Record<string, any>
  ): Promise<Notification> {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) {
      throw new Error(`Notification template ${templateId} not found`);
    }

    // Validate required variables
    for (const variable of template.variables) {
      if (!variables[variable]) {
        throw new Error(`Required variable ${variable} is missing for template ${templateId}`);
      }
    }

    // Generate title and message by replacing variables
    let title = template.title_template;
    let message = template.message_template;
    let actionUrl = template.action_url_template;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      title = title.replace(regex, String(value));
      message = message.replace(regex, String(value));
      if (actionUrl) {
        actionUrl = actionUrl.replace(regex, String(value));
      }
    }

    // Calculate expiration
    const expiresAt = template.expires_in_hours 
      ? new Date(Date.now() + template.expires_in_hours * 60 * 60 * 1000).toISOString()
      : undefined;

    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      type: template.type,
      title,
      message,
      data: variables,
      priority: template.priority,
      status: 'unread',
      action_required: template.action_required,
      action_url: actionUrl,
      action_text: template.action_text,
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
      metadata,
      is_read: false,
    };

    this.notifications.push(notification);
    
    // Send notification based on user preferences
    await this.sendNotification(notification);
    
    return notification;
  }

  // Send notification through appropriate channels
  private async sendNotification(notification: Notification): Promise<void> {
    const preferences = this.preferences.get(notification.user_id);
    if (!preferences) return;

    const typePreferences = preferences.types[notification.type];
    if (!typePreferences) return;

    // Check quiet hours
    if (preferences.quiet_hours.enabled && this.isInQuietHours(preferences.quiet_hours)) {
      // Only send urgent notifications during quiet hours
      if (notification.priority !== 'urgent') {
        return;
      }
    }

    // Send through enabled channels
    if (typePreferences.in_app && preferences.in_app_enabled) {
      // In-app notification is already created
      console.log('In-app notification created:', notification.id);
    }

    if (typePreferences.email && preferences.email_enabled) {
      await this.sendEmailNotification(notification);
    }

    if (typePreferences.push && preferences.push_enabled) {
      await this.sendPushNotification(notification);
    }

    if (typePreferences.sms && preferences.sms_enabled) {
      await this.sendSMSNotification(notification);
    }
  }

  // Get notifications for a user
  async getUserNotifications(
    userId: string,
    options: {
      status?: Notification['status'];
      type?: Notification['type'];
      priority?: Notification['priority'];
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<Notification[]> {
    let filtered = this.notifications.filter(n => n.user_id === userId);

    if (options.status) {
      filtered = filtered.filter(n => n.status === options.status);
    }

    if (options.type) {
      filtered = filtered.filter(n => n.type === options.type);
    }

    if (options.priority) {
      filtered = filtered.filter(n => n.priority === options.priority);
    }

    // Remove expired notifications
    filtered = filtered.filter(n => !n.expires_at || new Date(n.expires_at) > new Date());

    // Sort by priority and creation date
    filtered.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || 50;
    return filtered.slice(offset, offset + limit);
  }

  // Mark notification as read
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === notificationId && n.user_id === userId);
    if (notification && notification.status === 'unread') {
      notification.status = 'read';
      notification.read_at = new Date().toISOString();
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId: string, type?: Notification['type']): Promise<void> {
    const notifications = this.notifications.filter(n => 
      n.user_id === userId && 
      n.status === 'unread' &&
      (!type || n.type === type)
    );

    for (const notification of notifications) {
      notification.status = 'read';
      notification.read_at = new Date().toISOString();
    }
  }

  // Archive notification
  async archiveNotification(notificationId: string, userId: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === notificationId && n.user_id === userId);
    if (notification) {
      notification.status = 'archived';
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    this.notifications = this.notifications.filter(n => !(n.id === notificationId && n.user_id === userId));
  }

  // Get notification statistics
  async getNotificationStats(userId: string): Promise<{
    total: number;
    unread: number;
    read: number;
    archived: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
    actionRequired: number;
  }> {
    const userNotifications = this.notifications.filter(n => n.user_id === userId);
    
    const byType: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    
    for (const notification of userNotifications) {
      byType[notification.type] = (byType[notification.type] || 0) + 1;
      byPriority[notification.priority] = (byPriority[notification.priority] || 0) + 1;
    }

    return {
      total: userNotifications.length,
      unread: userNotifications.filter(n => n.status === 'unread').length,
      read: userNotifications.filter(n => n.status === 'read').length,
      archived: userNotifications.filter(n => n.status === 'archived').length,
      byType,
      byPriority,
      actionRequired: userNotifications.filter(n => n.action_required && n.status === 'unread').length,
    };
  }

  // Update user preferences
  async updatePreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<void> {
    const existing = this.preferences.get(userId) || this.getDefaultPreferences(userId);
    const updated = { ...existing, ...preferences, updated_at: new Date().toISOString() };
    this.preferences.set(userId, updated);
    this.savePreferences();
  }

  // Get user preferences
  async getPreferences(userId: string): Promise<NotificationPreferences> {
    return this.preferences.get(userId) || this.getDefaultPreferences(userId);
  }

  // Add custom template
  async addTemplate(template: NotificationTemplate): Promise<void> {
    this.templates.push(template);
  }

  // Get all templates
  async getTemplates(): Promise<NotificationTemplate[]> {
    return this.templates.filter(t => t.is_active);
  }

  // Bulk create notifications
  async bulkCreateNotifications(
    userIds: string[],
    templateId: string,
    variables: Record<string, any>,
    metadata?: Record<string, any>
  ): Promise<Notification[]> {
    const notifications: Notification[] = [];
    
    for (const userId of userIds) {
      try {
        const notification = await this.createNotification(userId, templateId, variables, metadata);
        notifications.push(notification);
      } catch (error) {
        console.error(`Failed to create notification for user ${userId}:`, error);
      }
    }
    
    return notifications;
  }

  // Clean up expired notifications
  async cleanupExpiredNotifications(): Promise<number> {
    const now = new Date();
    const beforeCount = this.notifications.length;
    
    this.notifications = this.notifications.filter(n => 
      !n.expires_at || new Date(n.expires_at) > now
    );
    
    return beforeCount - this.notifications.length;
  }

  // Private helper methods
  private getDefaultPreferences(userId: string): NotificationPreferences {
    return {
      user_id: userId,
      email_enabled: true,
      push_enabled: true,
      sms_enabled: false,
      in_app_enabled: true,
      types: {
        info: { email: true, push: true, sms: false, in_app: true },
        success: { email: true, push: true, sms: false, in_app: true },
        warning: { email: true, push: true, sms: true, in_app: true },
        error: { email: true, push: true, sms: true, in_app: true },
        milestone: { email: true, push: true, sms: false, in_app: true },
        payment: { email: true, push: true, sms: true, in_app: true },
        agreement: { email: true, push: true, sms: false, in_app: true },
        kyc: { email: true, push: true, sms: false, in_app: true },
        system: { email: true, push: true, sms: false, in_app: true },
      },
      quiet_hours: {
        enabled: false,
        start_time: '22:00',
        end_time: '08:00',
        timezone: 'UTC',
      },
      updated_at: new Date().toISOString(),
    };
  }

  private isInQuietHours(quietHours: NotificationPreferences['quiet_hours']): boolean {
    if (!quietHours.enabled) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMinute] = quietHours.start_time.split(':').map(Number);
    const [endHour, endMinute] = quietHours.end_time.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    if (startMinutes <= endMinutes) {
      return currentTime >= startMinutes && currentTime <= endMinutes;
    } else {
      // Crosses midnight
      return currentTime >= startMinutes || currentTime <= endMinutes;
    }
  }

  private async sendEmailNotification(notification: Notification): Promise<void> {
    // Implementation would integrate with email service
    console.log('Sending email notification:', notification.id);
  }

  private async sendPushNotification(notification: Notification): Promise<void> {
    // Implementation would integrate with push notification service
    console.log('Sending push notification:', notification.id);
  }

  private async sendSMSNotification(notification: Notification): Promise<void> {
    // Implementation would integrate with SMS service
    console.log('Sending SMS notification:', notification.id);
  }

  private loadPreferences(): void {
    try {
      const stored = localStorage.getItem('notification_preferences');
      if (stored) {
        const parsed = JSON.parse(stored);
        for (const [userId, prefs] of Object.entries(parsed)) {
          this.preferences.set(userId, prefs as NotificationPreferences);
        }
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
  }

  private savePreferences(): void {
    try {
      const preferencesObj: Record<string, NotificationPreferences> = {};
      for (const [userId, prefs] of this.preferences.entries()) {
        preferencesObj[userId] = prefs;
      }
      localStorage.setItem('notification_preferences', JSON.stringify(preferencesObj));
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
    }
  }
}

// Export singleton instance
export const notificationManager = new NotificationManager();

// Convenience functions for common notification types
export const createMilestoneNotification = (
  userId: string,
  milestoneName: string,
  opportunityTitle: string,
  dueDate: string,
  opportunityId: string,
  isOverdue: boolean = false
) => {
  const templateId = isOverdue ? 'milestone-overdue' : 'milestone-due';
  const daysOverdue = isOverdue ? Math.ceil((Date.now() - new Date(dueDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
  
  return notificationManager.createNotification(userId, templateId, {
    milestone_name: milestoneName,
    opportunity_title: opportunityTitle,
    due_date: dueDate,
    opportunity_id: opportunityId,
    ...(isOverdue && { days_overdue: daysOverdue }),
  });
};

export const createPaymentNotification = (
  userId: string,
  amount: string,
  opportunityTitle: string,
  dueDate?: string,
  isReceived: boolean = false
) => {
  const templateId = isReceived ? 'payment-received' : 'payment-due';
  
  return notificationManager.createNotification(userId, templateId, {
    amount,
    opportunity_title: opportunityTitle,
    ...(dueDate && { due_date: dueDate }),
  });
};

export const createAgreementNotification = (
  userId: string,
  agreementTitle: string,
  agreementId: string
) => {
  return notificationManager.createNotification(userId, 'agreement-pending', {
    agreement_title: agreementTitle,
    agreement_id: agreementId,
  });
};

export const createKYCNotification = (
  userId: string,
  isApproved: boolean = false
) => {
  const templateId = isApproved ? 'kyc-approved' : 'kyc-required';
  return notificationManager.createNotification(userId, templateId, {});
};

export const createOpportunityNotification = (
  userId: string,
  opportunityTitle: string,
  opportunityId: string,
  isPublished: boolean = false
) => {
  const templateId = isPublished ? 'opportunity-published' : 'opportunity-updated';
  return notificationManager.createNotification(userId, templateId, {
    opportunity_title: opportunityTitle,
    opportunity_id: opportunityId,
  });
};

export const createInvestmentNotification = (
  userId: string,
  amount: string,
  investorName: string,
  opportunityTitle: string,
  opportunityId: string
) => {
  return notificationManager.createNotification(userId, 'investment-received', {
    amount,
    investor_name: investorName,
    opportunity_title: opportunityTitle,
    opportunity_id: opportunityId,
  });
};

export const createPoolInvitationNotification = (
  userId: string,
  poolName: string,
  minContribution: string,
  poolId: string
) => {
  return notificationManager.createNotification(userId, 'pool-invitation', {
    pool_name: poolName,
    min_contribution: minContribution,
    pool_id: poolId,
  });
};

export const createSystemNotification = (
  userId: string,
  title: string,
  message: string,
  priority: Notification['priority'] = 'medium'
) => {
  return notificationManager.createNotification(userId, 'system-maintenance', {
    maintenance_title: title,
    maintenance_date: new Date().toLocaleDateString(),
    start_time: 'TBD',
    end_time: 'TBD',
  });
};

export const createSecurityAlertNotification = (
  userId: string,
  alertTitle: string,
  alertMessage: string
) => {
  return notificationManager.createNotification(userId, 'security-alert', {
    alert_title: alertTitle,
    alert_message: alertMessage,
  });
};

export class NotificationService {
  static async sendNotification(userId: string, type: string, message: string, data?: any): Promise<Notification> {
    const { data: notif, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        message,
        data: data || {},
        is_read: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    if (error) throw error;
    return notif;
  }

  static async getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async markAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    if (error) throw error;
  }
} 