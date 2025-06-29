// Notification Management System
// Handles user notifications and system alerts

import { supabase } from '@/integrations/supabase/client';

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'investment' | 'opportunity' | 'milestone' | 'payment' | 'document' | 'system';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type NotificationStatus = 'unread' | 'read' | 'archived';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  action_required: boolean;
  action_text?: string;
  action_url?: string;
  data?: any;
  metadata?: any;
  is_read: boolean;
  created_at: string;
  read_at?: string;
  expires_at?: string;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  investment_updates: boolean;
  milestone_alerts: boolean;
  payment_notifications: boolean;
  system_announcements: boolean;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  archived: number;
}

class NotificationService {
  async getNotifications(userId: string, limit = 50): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as Notification[];
  }

  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  }

  async getNotificationStats(userId: string): Promise<NotificationStats> {
    const { data, error } = await supabase
      .from('notifications')
      .select('status, is_read')
      .eq('user_id', userId);

    if (error) throw error;

    const stats = data.reduce((acc, notification) => {
      acc.total++;
      if (!notification.is_read) acc.unread++;
      else acc.read++;
      if (notification.status === 'archived') acc.archived++;
      return acc;
    }, { total: 0, unread: 0, read: 0, archived: 0 });

    return stats;
  }

  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ 
        is_read: true, 
        status: 'read' as NotificationStatus,
        read_at: new Date().toISOString() 
      })
      .eq('id', notificationId);

    if (error) throw error;
  }

  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ 
        is_read: true, 
        status: 'read' as NotificationStatus,
        read_at: new Date().toISOString() 
      })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  }

  async createNotification(notification: Omit<Notification, 'id' | 'created_at' | 'is_read'>): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: notification.user_id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority || 'medium',
        status: notification.status || 'unread',
        action_required: notification.action_required || false,
        action_text: notification.action_text,
        action_url: notification.action_url,
        data: notification.data,
        metadata: notification.metadata,
        is_read: false,
        expires_at: notification.expires_at
      })
      .select()
      .single();

    if (error) throw error;
    return data as Notification;
  }

  async deleteNotification(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
  }

  async getNotificationsByType(userId: string, type: NotificationType): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Notification[];
  }

  async updatePreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<void> {
    // Mock implementation since we don't have a preferences table yet
    console.log('Updating notification preferences for user:', userId, preferences);
  }

  async getPreferences(userId: string): Promise<NotificationPreferences> {
    // Mock implementation since we don't have a preferences table yet
    return {
      email_notifications: true,
      push_notifications: true,
      investment_updates: true,
      milestone_alerts: true,
      payment_notifications: true,
      system_announcements: true
    };
  }
}

export const notificationService = new NotificationService();

// Export manager alias for backward compatibility
export const notificationManager = notificationService;

// Export stats function for backward compatibility
export const getNotificationStats = (userId: string) => notificationService.getNotificationStats(userId);

// Utility functions for creating specific notification types
export async function createInvestmentNotification(
  userId: string,
  title: string,
  message: string,
  investmentId: string,
  actionUrl?: string
): Promise<Notification> {
  return notificationService.createNotification({
    user_id: userId,
    title,
    message,
    type: 'investment',
    priority: 'medium',
    status: 'unread',
    action_required: !!actionUrl,
    action_text: actionUrl ? 'View Investment' : undefined,
    action_url: actionUrl,
    data: { investment_id: investmentId },
    metadata: { entity_type: 'investment', entity_id: investmentId }
  });
}

export async function createOpportunityNotification(
  userId: string,
  title: string,
  message: string,
  opportunityId: string,
  actionUrl?: string
): Promise<Notification> {
  return notificationService.createNotification({
    user_id: userId,
    title,
    message,
    type: 'opportunity',
    priority: 'medium',
    status: 'unread',
    action_required: !!actionUrl,
    action_text: actionUrl ? 'View Opportunity' : undefined,
    action_url: actionUrl,
    data: { opportunity_id: opportunityId },
    metadata: { entity_type: 'opportunity', entity_id: opportunityId }
  });
}

export async function createMilestoneNotification(
  userId: string,
  title: string,
  message: string,
  milestoneId: string,
  actionUrl?: string
): Promise<Notification> {
  return notificationService.createNotification({
    user_id: userId,
    title,
    message,
    type: 'milestone',
    priority: 'high',
    status: 'unread',
    action_required: !!actionUrl,
    action_text: actionUrl ? 'View Milestone' : undefined,
    action_url: actionUrl,
    data: { milestone_id: milestoneId },
    metadata: { entity_type: 'milestone', entity_id: milestoneId }
  });
}

export async function createPaymentNotification(
  userId: string,
  title: string,
  message: string,
  paymentId: string,
  actionUrl?: string
): Promise<Notification> {
  return notificationService.createNotification({
    user_id: userId,
    title,
    message,
    type: 'payment',
    priority: 'high',
    status: 'unread',
    action_required: !!actionUrl,
    action_text: actionUrl ? 'View Payment' : undefined,
    action_url: actionUrl,
    data: { payment_id: paymentId },
    metadata: { entity_type: 'payment', entity_id: paymentId }
  });
}

export async function createSystemNotification(
  userId: string,
  title: string,
  message: string,
  priority: NotificationPriority = 'medium'
): Promise<Notification> {
  return notificationService.createNotification({
    user_id: userId,
    title,
    message,
    type: 'system',
    priority,
    status: 'unread',
    action_required: false,
    metadata: { system_notification: true }
  });
}

// Bulk notification functions
export async function notifyInvestorsOfOpportunity(
  opportunityId: string,
  title: string,
  message: string
): Promise<void> {
  // This would typically get a list of relevant investors
  // For now, we'll implement a basic version
  console.log(`Notifying investors about opportunity ${opportunityId}: ${title}`);
}

export async function notifyEntrepreneurOfInvestment(
  entrepreneurId: string,
  investmentId: string,
  investorName: string,
  amount: number
): Promise<void> {
  await createInvestmentNotification(
    entrepreneurId,
    'New Investment Received',
    `${investorName} has invested $${amount.toLocaleString()} in your opportunity.`,
    investmentId,
    `/entrepreneur/investments/${investmentId}`
  );
}

export async function notifyInvestorOfMilestone(
  investorId: string,
  milestoneId: string,
  opportunityTitle: string,
  milestoneTitle: string
): Promise<void> {
  await createMilestoneNotification(
    investorId,
    'Milestone Update',
    `New milestone "${milestoneTitle}" completed for ${opportunityTitle}.`,
    milestoneId,
    `/investor/investments/milestones/${milestoneId}`
  );
}
