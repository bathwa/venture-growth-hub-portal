
// Notification Management System
// Handles notification creation, delivery, and user preferences

import { supabase } from '@/integrations/supabase/client';

// Map to database enum values
export type NotificationType = 'payment' | 'milestone' | 'info' | 'success' | 'warning' | 'error' | 'agreement' | 'kyc' | 'system';
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
  action_url?: string;
  action_text?: string;
  action_required: boolean;
  data: any;
  is_read: boolean;
  read_at?: string;
  expires_at?: string;
  metadata: any;
  created_at: string;
}

export interface NotificationPreferences {
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  in_app_notifications: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  categories: {
    investments: boolean;
    system: boolean;
    marketing: boolean;
    security: boolean;
  };
}

export interface NotificationStats {
  total: number;
  unread: number;
  urgent: number;
  today: number;
  week: number;
}

class NotificationManager {
  // Create notification
  async createNotification(data: {
    user_id: string;
    title: string;
    message: string;
    type: NotificationType;
    priority?: NotificationPriority;
    action_url?: string;
    action_text?: string;
    action_required?: boolean;
    data?: any;
    expires_at?: string;
  }): Promise<Notification> {
    try {
      // Ensure valid type for database
      const validType = data.type === 'investment' ? 'payment' : data.type;
      
      const notification = {
        user_id: data.user_id,
        title: data.title,
        message: data.message,
        type: validType,
        priority: data.priority || 'medium' as NotificationPriority,
        status: 'unread' as NotificationStatus,
        action_url: data.action_url,
        action_text: data.action_text,
        action_required: data.action_required || false,
        data: data.data || {},
        is_read: false,
        expires_at: data.expires_at,
        metadata: {}
      };

      const { data: created, error } = await supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single();

      if (error) throw error;
      return created as Notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Get notifications for user
  async getNotifications(
    userId: string, 
    options?: {
      limit?: number;
      offset?: number;
      status?: NotificationStatus;
      type?: NotificationType;
      priority?: NotificationPriority;
    }
  ): Promise<Notification[]> {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.type) {
        // Map investment type to valid database enum for queries
        const validType = options.type === 'investment' ? 'payment' : options.type;
        query = query.eq('type', validType);
      }

      if (options?.priority) {
        query = query.eq('priority', options.priority);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []) as Notification[];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
          status: 'read' as NotificationStatus
        })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for user
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
          status: 'read' as NotificationStatus
        })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Get notification statistics
  async getNotificationStats(userId: string): Promise<NotificationStats> {
    try {
      const { data: all, error: allError } = await supabase
        .from('notifications')
        .select('id, is_read, priority, created_at')
        .eq('user_id', userId);

      if (allError) throw allError;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const notifications = all || [];
      
      return {
        total: notifications.length,
        unread: notifications.filter(n => !n.is_read).length,
        urgent: notifications.filter(n => n.priority === 'urgent' && !n.is_read).length,
        today: notifications.filter(n => new Date(n.created_at) >= today).length,
        week: notifications.filter(n => new Date(n.created_at) >= weekAgo).length
      };
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      return { total: 0, unread: 0, urgent: 0, today: 0, week: 0 };
    }
  }

  // Mock preferences until we have the table
  async getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    console.log('Mock: Getting notification preferences for', userId);
    return {
      user_id: userId,
      email_notifications: true,
      push_notifications: true,
      sms_notifications: false,
      in_app_notifications: true,
      frequency: 'immediate',
      categories: {
        investments: true,
        system: true,
        marketing: false,
        security: true
      }
    };
  }

  async updateNotificationPreferences(
    userId: string, 
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    console.log('Mock: Updating notification preferences for', userId, preferences);
    return this.getNotificationPreferences(userId);
  }

  // Utility functions for common notification types
  async notifyInvestmentUpdate(
    userId: string,
    investmentId: string,
    status: string,
    message: string
  ): Promise<void> {
    await this.createNotification({
      user_id: userId,
      title: 'Investment Update',
      message,
      type: 'payment', // Using valid enum value
      priority: 'high',
      action_url: `/investments/${investmentId}`,
      action_text: 'View Investment',
      data: { investment_id: investmentId, status }
    });
  }

  async notifyMilestoneUpdate(
    userId: string,
    milestoneId: string,
    title: string,
    message: string
  ): Promise<void> {
    await this.createNotification({
      user_id: userId,
      title: `Milestone: ${title}`,
      message,
      type: 'milestone',
      priority: 'medium',
      action_url: `/milestones/${milestoneId}`,
      action_text: 'View Milestone',
      data: { milestone_id: milestoneId }
    });
  }

  async notifySystemUpdate(
    userId: string,
    title: string,
    message: string,
    priority: NotificationPriority = 'low'
  ): Promise<void> {
    await this.createNotification({
      user_id: userId,
      title,
      message,
      type: 'system',
      priority,
      data: { system_notification: true }
    });
  }
}

// Export the class as NotificationService for backward compatibility
export const NotificationService = NotificationManager;

export const notificationManager = new NotificationManager();

// Export individual functions for backward compatibility
export const createNotification = (data: Parameters<NotificationManager['createNotification']>[0]) => 
  notificationManager.createNotification(data);

export const getNotifications = (userId: string, options?: Parameters<NotificationManager['getNotifications']>[1]) => 
  notificationManager.getNotifications(userId, options);

export const markAsRead = (notificationId: string) => 
  notificationManager.markAsRead(notificationId);

export const markAllAsRead = (userId: string) => 
  notificationManager.markAllAsRead(userId);

export const deleteNotification = (notificationId: string) => 
  notificationManager.deleteNotification(notificationId);

export const getNotificationStats = (userId: string) => 
  notificationManager.getNotificationStats(userId);

export const getNotificationPreferences = (userId: string) => 
  notificationManager.getNotificationPreferences(userId);

export const updateNotificationPreferences = (userId: string, preferences: Partial<NotificationPreferences>) => 
  notificationManager.updateNotificationPreferences(userId, preferences);

// Utility notification functions
export const notifyInvestmentUpdate = (userId: string, investmentId: string, status: string, message: string) =>
  notificationManager.notifyInvestmentUpdate(userId, investmentId, status, message);

export const notifyMilestoneUpdate = (userId: string, milestoneId: string, title: string, message: string) =>
  notificationManager.notifyMilestoneUpdate(userId, milestoneId, title, message);

export const notifySystemUpdate = (userId: string, title: string, message: string, priority?: NotificationPriority) =>
  notificationManager.notifySystemUpdate(userId, title, message, priority);
