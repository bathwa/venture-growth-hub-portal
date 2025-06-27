import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';
import { notificationManager } from '@/lib/notifications';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface NotificationBellProps {
  onOpenNotifications: () => void;
  className?: string;
}

export default function NotificationBell({ onOpenNotifications, className }: NotificationBellProps) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchNotificationCount();
    }
  }, [user?.id]);

  const fetchNotificationCount = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const stats = await notificationManager.getNotificationStats(user.id);
      setUnreadCount(stats.unread);
    } catch (error) {
      console.error('Failed to fetch notification count:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    onOpenNotifications();
    // Mark notifications as read when opening
    if (unreadCount > 0 && user?.id) {
      notificationManager.markAllAsRead(user.id);
      setUnreadCount(0);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={`relative ${className}`}
      disabled={isLoading}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
} 