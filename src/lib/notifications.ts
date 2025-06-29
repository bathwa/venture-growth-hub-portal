
import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'investment' | 'opportunity' | 'milestone' | 'payment' | 'document' | 'system';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_read: boolean;
  action_url?: string;
  action_text?: string;
  action_required: boolean;
  expires_at?: Date;
  created_at: Date;
  read_at?: Date;
  data?: any;
  metadata?: any;
}

export interface NotificationStats {
  total: number;
  unread: number;
  highPriority: number;
  actionRequired: number;
}

export const getNotifications = async (userId: string, limit = 20): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data?.map(notification => ({
      ...notification,
      created_at: new Date(notification.created_at),
      read_at: notification.read_at ? new Date(notification.read_at) : undefined,
      expires_at: notification.expires_at ? new Date(notification.expires_at) : undefined
    })) || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

export const getNotificationStats = async (userId: string): Promise<NotificationStats> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    const notifications = data || [];
    
    return {
      total: notifications.length,
      unread: notifications.filter(n => !n.is_read).length,
      highPriority: notifications.filter(n => ['high', 'urgent'].includes(n.priority)).length,
      actionRequired: notifications.filter(n => n.action_required).length
    };
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    return { total: 0, unread: 0, highPriority: 0, actionRequired: 0 };
  }
};

export const markAsRead = async (notificationId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ 
        is_read: true, 
        read_at: new Date().toISOString() 
      })
      .eq('id', notificationId);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

export const createNotification = async (notification: Omit<Notification, 'id' | 'created_at' | 'is_read' | 'read_at'>): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        ...notification,
        expires_at: notification.expires_at?.toISOString(),
        is_read: false
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};
