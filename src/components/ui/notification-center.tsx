import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  XCircle, 
  Clock, 
  Settings, 
  Trash2, 
  Archive,
  Eye,
  EyeOff,
  Mail,
  Smartphone,
  MessageSquare,
  RefreshCw,
  Filter,
  Search,
  MoreVertical,
  ExternalLink
} from 'lucide-react';
import { 
  Notification, 
  NotificationPreferences, 
  notificationManager,
  getNotificationStats 
} from '@/lib/notifications';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export default function NotificationCenter({ 
  isOpen, 
  onClose, 
  className 
}: NotificationCenterProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0,
    archived: 0,
    byType: {} as Record<string, number>,
    byPriority: {} as Record<string, number>,
    actionRequired: 0,
  });
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdatingPreferences, setIsUpdatingPreferences] = useState(false);
  
  // Filter states
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const fetchData = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const [notifs, prefs, notificationStats] = await Promise.all([
        notificationManager.getUserNotifications(user.id),
        notificationManager.getPreferences(user.id),
        notificationManager.getNotificationStats(user.id)
      ]);
      
      setNotifications(notifs);
      setPreferences(prefs);
      setStats(notificationStats);
    } catch (error) {
      console.error('Failed to fetch notification data:', error);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    if (!user?.id) return;
    
    try {
      setIsRefreshing(true);
      await fetchData();
      toast.success('Notifications refreshed');
    } catch (error) {
      console.error('Failed to refresh notifications:', error);
      toast.error('Failed to refresh notifications');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    if (!user?.id) return;
    
    try {
      await notificationManager.markAsRead(notificationId, user.id);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, status: 'read', read_at: new Date().toISOString() } : n)
      );
      setStats(prev => ({ ...prev, unread: prev.unread - 1, read: prev.read + 1 }));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    
    try {
      await notificationManager.markAllAsRead(user.id, filterType === 'all' ? undefined : filterType as any);
      setNotifications(prev => 
        prev.map(n => ({ ...n, status: 'read', read_at: new Date().toISOString() }))
      );
      setStats(prev => ({ 
        ...prev, 
        unread: 0, 
        read: prev.read + prev.unread,
        actionRequired: 0
      }));
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handleArchiveNotification = async (notificationId: string) => {
    if (!user?.id) return;
    
    try {
      await notificationManager.archiveNotification(notificationId, user.id);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, status: 'archived' } : n)
      );
      setStats(prev => ({ 
        ...prev, 
        unread: prev.unread - 1, 
        archived: prev.archived + 1 
      }));
      toast.success('Notification archived');
    } catch (error) {
      console.error('Failed to archive notification:', error);
      toast.error('Failed to archive notification');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (!user?.id) return;
    
    try {
      await notificationManager.deleteNotification(notificationId, user.id);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setStats(prev => ({ ...prev, total: prev.total - 1 }));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const handleUpdatePreferences = async (updates: Partial<NotificationPreferences>) => {
    if (!user?.id || !preferences) return;
    
    try {
      setIsUpdatingPreferences(true);
      const updatedPreferences = { ...preferences, ...updates };
      await notificationManager.updatePreferences(user.id, updatedPreferences);
      setPreferences(updatedPreferences);
      toast.success('Notification preferences updated');
    } catch (error) {
      console.error('Failed to update preferences:', error);
      toast.error('Failed to update preferences');
    } finally {
      setIsUpdatingPreferences(false);
    }
  };

  const handleNotificationAction = (notification: Notification) => {
    if (notification.action_url) {
      // Handle action URL (could be internal navigation or external link)
      if (notification.action_url.startsWith('http')) {
        window.open(notification.action_url, '_blank');
      } else {
        // Internal navigation - you might want to use router here
        window.location.href = notification.action_url;
      }
    }
    
    // Mark as read if not already
    if (notification.status === 'unread') {
      handleMarkAsRead(notification.id);
    }
  };

  // Filter notifications based on current filters
  const filteredNotifications = notifications.filter(notification => {
    if (filterType !== 'all' && notification.type !== filterType) return false;
    if (filterPriority !== 'all' && notification.priority !== filterPriority) return false;
    if (filterStatus !== 'all' && notification.status !== filterStatus) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        notification.title.toLowerCase().includes(query) ||
        notification.message.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Get notification icon based on type
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get status color
  const getStatusColor = (status: Notification['status']) => {
    switch (status) {
      case 'unread':
        return 'bg-blue-100 text-blue-800';
      case 'read':
        return 'bg-gray-100 text-gray-800';
      case 'archived':
        return 'bg-gray-50 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 ${className}`}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold">Notifications</h2>
              <p className="text-sm text-gray-500">
                {stats.unread} unread, {stats.total} total
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Filters */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="milestone">Milestone</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="agreement">Agreement</SelectItem>
                      <SelectItem value="kyc">KYC</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-3 py-1 border rounded-md text-sm w-48"
                  />
                </div>

                {stats.unread > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                  >
                    Mark All Read
                  </Button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 border rounded-lg">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredNotifications.length > 0 ? (
                <div className="p-4 space-y-4">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-4 p-4 border rounded-lg transition-colors ${
                        notification.status === 'unread' ? 'bg-blue-50 border-blue-200' : 'bg-white'
                      }`}
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm">{notification.title}</h4>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getPriorityColor(notification.priority)}`}
                              >
                                {notification.priority}
                              </Badge>
                              {notification.action_required && (
                                <Badge variant="destructive" className="text-xs">
                                  Action Required
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>{new Date(notification.created_at).toLocaleString()}</span>
                              <Badge variant="outline" className={getStatusColor(notification.status)}>
                                {notification.status}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {notification.action_required && notification.action_url && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleNotificationAction(notification)}
                                className="h-8"
                              >
                                {notification.action_text || 'Action'}
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </Button>
                            )}
                            
                            {notification.status === 'unread' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleArchiveNotification(notification.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteNotification(notification.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Bell className="h-12 w-12 mb-4" />
                  <p className="text-lg font-medium">No notifications</p>
                  <p className="text-sm">You're all caught up!</p>
                </div>
              )}
            </div>
          </div>

          {/* Settings Panel */}
          <div className="w-80 border-l bg-gray-50 p-4 overflow-y-auto">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Notification Settings
            </h3>
            
            {preferences ? (
              <div className="space-y-6">
                {/* General Settings */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">General Settings</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-enabled" className="text-sm">Email Notifications</Label>
                      <Switch
                        id="email-enabled"
                        checked={preferences.email_enabled}
                        onCheckedChange={(checked) => 
                          handleUpdatePreferences({ email_enabled: checked })
                        }
                        disabled={isUpdatingPreferences}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push-enabled" className="text-sm">Push Notifications</Label>
                      <Switch
                        id="push-enabled"
                        checked={preferences.push_enabled}
                        onCheckedChange={(checked) => 
                          handleUpdatePreferences({ push_enabled: checked })
                        }
                        disabled={isUpdatingPreferences}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms-enabled" className="text-sm">SMS Notifications</Label>
                      <Switch
                        id="sms-enabled"
                        checked={preferences.sms_enabled}
                        onCheckedChange={(checked) => 
                          handleUpdatePreferences({ sms_enabled: checked })
                        }
                        disabled={isUpdatingPreferences}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="in-app-enabled" className="text-sm">In-App Notifications</Label>
                      <Switch
                        id="in-app-enabled"
                        checked={preferences.in_app_enabled}
                        onCheckedChange={(checked) => 
                          handleUpdatePreferences({ in_app_enabled: checked })
                        }
                        disabled={isUpdatingPreferences}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Quiet Hours */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Quiet Hours</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="quiet-hours-enabled" className="text-sm">Enable Quiet Hours</Label>
                      <Switch
                        id="quiet-hours-enabled"
                        checked={preferences.quiet_hours.enabled}
                        onCheckedChange={(checked) => 
                          handleUpdatePreferences({ 
                            quiet_hours: { ...preferences.quiet_hours, enabled: checked }
                          })
                        }
                        disabled={isUpdatingPreferences}
                      />
                    </div>
                    
                    {preferences.quiet_hours.enabled && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs">Start Time</Label>
                          <Select
                            value={preferences.quiet_hours.start_time}
                            onValueChange={(value) => 
                              handleUpdatePreferences({ 
                                quiet_hours: { ...preferences.quiet_hours, start_time: value }
                              })
                            }
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[...Array(24)].map((_, i) => (
                                <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                                  {i.toString().padStart(2, '0')}:00
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Label className="text-xs">End Time</Label>
                          <Select
                            value={preferences.quiet_hours.end_time}
                            onValueChange={(value) => 
                              handleUpdatePreferences({ 
                                quiet_hours: { ...preferences.quiet_hours, end_time: value }
                              })
                            }
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[...Array(24)].map((_, i) => (
                                <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                                  {i.toString().padStart(2, '0')}:00
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Statistics */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Statistics</h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Notifications</span>
                      <span className="font-medium">{stats.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Unread</span>
                      <span className="font-medium text-blue-600">{stats.unread}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Read</span>
                      <span className="font-medium text-gray-600">{stats.read}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Archived</span>
                      <span className="font-medium text-gray-500">{stats.archived}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Action Required</span>
                      <span className="font-medium text-red-600">{stats.actionRequired}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 