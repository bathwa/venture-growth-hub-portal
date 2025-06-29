
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Bell, Settings, Trash2, Eye, EyeOff, Filter, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  notificationManager,
  getNotificationStats,
  type Notification, 
  type NotificationStats,
  type NotificationPreferences,
  type NotificationType,
  type NotificationPriority,
  type NotificationStatus
} from '@/lib/notifications';
import { toast } from 'sonner';

interface NotificationCenterProps {
  className?: string;
}

export default function NotificationCenter({ className }: NotificationCenterProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({ total: 0, unread: 0, urgent: 0, today: 0, week: 0 });
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedType, setSelectedType] = useState<NotificationType | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<NotificationPriority | 'all'>('all');
  const [showRead, setShowRead] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      fetchStats();
      fetchPreferences();
    }
  }, [user?.id, selectedType, selectedPriority, showRead]);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const options: any = {
        limit: 50,
        status: showRead ? undefined : ('unread' as NotificationStatus),
        type: selectedType === 'all' ? undefined : selectedType,
        priority: selectedPriority === 'all' ? undefined : selectedPriority
      };

      const data = await notificationManager.getNotifications(user.id, options);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!user?.id) return;
    
    try {
      const statsData = await getNotificationStats(user.id);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch notification stats:', error);
    }
  };

  const fetchPreferences = async () => {
    if (!user?.id) return;
    
    try {
      const prefs = await notificationManager.getNotificationPreferences(user.id);
      setPreferences(prefs);
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationManager.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, is_read: true, read_at: new Date().toISOString(), status: 'read' as NotificationStatus }
            : n
        )
      );
      fetchStats();
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    
    try {
      await notificationManager.markAllAsRead(user.id);
      setNotifications(prev => 
        prev.map(n => ({ 
          ...n, 
          is_read: true, 
          read_at: new Date().toISOString(),
          status: 'read' as NotificationStatus
        }))
      );
      fetchStats();
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await notificationManager.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      fetchStats();
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const handlePreferenceChange = async (key: keyof NotificationPreferences, value: any) => {
    if (!user?.id || !preferences) return;
    
    try {
      const updates = { [key]: value };
      const updatedPrefs = await notificationManager.updateNotificationPreferences(user.id, updates);
      setPreferences(updatedPrefs);
      toast.success('Preferences updated');
    } catch (error) {
      console.error('Failed to update preferences:', error);
      toast.error('Failed to update preferences');
    }
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getTypeColor = (type: NotificationType) => {
    switch (type) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'destructive';
      case 'success':
        return 'default';
      case 'info':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'unread' && notification.is_read) return false;
    if (activeTab === 'urgent' && notification.priority !== 'urgent') return false;
    return true;
  });

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Please sign in to view notifications</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Stay updated with your latest activities and system updates
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={stats.unread === 0}
              >
                Mark All Read
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.unread}</div>
              <div className="text-sm text-muted-foreground">Unread</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
              <div className="text-sm text-muted-foreground">Urgent</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.today}</div>
              <div className="text-sm text-muted-foreground">Today</div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="urgent">Urgent</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <Filter className="h-4 w-4" />
                  <Select value={selectedType} onValueChange={(value: NotificationType | 'all') => setSelectedType(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="milestone">Milestone</SelectItem>
                      <SelectItem value="kyc">KYC</SelectItem>
                      <SelectItem value="agreement">Agreement</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedPriority} onValueChange={(value: NotificationPriority | 'all') => setSelectedPriority(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-read"
                      checked={showRead}
                      onCheckedChange={setShowRead}
                    />
                    <Label htmlFor="show-read">Show Read</Label>
                  </div>
                </div>

                <ScrollArea className="h-96">
                  {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading notifications...</div>
                  ) : filteredNotifications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No notifications found</div>
                  ) : (
                    <div className="space-y-3">
                      {filteredNotifications.map((notification) => (
                        <Card key={notification.id} className={`p-4 ${!notification.is_read ? 'border-blue-200 bg-blue-50' : ''}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">{notification.title}</h4>
                                <Badge variant={getPriorityColor(notification.priority)}>
                                  {notification.priority}
                                </Badge>
                                <Badge variant={getTypeColor(notification.type)}>
                                  {notification.type}
                                </Badge>
                                {!notification.is_read && (
                                  <Badge variant="secondary">New</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{new Date(notification.created_at).toLocaleDateString()}</span>
                                {notification.action_url && (
                                  <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                                    {notification.action_text || 'View Details'}
                                  </Button>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {!notification.is_read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteNotification(notification.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="unread" className="mt-4">
              <ScrollArea className="h-96">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No unread notifications</div>
                ) : (
                  <div className="space-y-3">
                    {filteredNotifications.map((notification) => (
                      <Card key={notification.id} className="p-4 border-blue-200 bg-blue-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{notification.title}</h4>
                              <Badge variant={getPriorityColor(notification.priority)}>
                                {notification.priority}
                              </Badge>
                              <Badge variant="secondary">New</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {notification.message}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="urgent" className="mt-4">
              <ScrollArea className="h-96">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No urgent notifications</div>
                ) : (
                  <div className="space-y-3">
                    {filteredNotifications.map((notification) => (
                      <Card key={notification.id} className="p-4 border-red-200 bg-red-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{notification.title}</h4>
                              <Badge variant="destructive">URGENT</Badge>
                              {!notification.is_read && <Badge variant="secondary">New</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {notification.message}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {!notification.is_read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteNotification(notification.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="settings" className="mt-4">
              {preferences && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                        <Switch
                          id="email-notifications"
                          checked={preferences.email_notifications}
                          onCheckedChange={(checked) => handlePreferenceChange('email_notifications', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="push-notifications">Push Notifications</Label>
                        <Switch
                          id="push-notifications"
                          checked={preferences.push_notifications}
                          onCheckedChange={(checked) => handlePreferenceChange('push_notifications', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="sms-notifications">SMS Notifications</Label>
                        <Switch
                          id="sms-notifications"
                          checked={preferences.sms_notifications}
                          onCheckedChange={(checked) => handlePreferenceChange('sms_notifications', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="in-app-notifications">In-App Notifications</Label>
                        <Switch
                          id="in-app-notifications"
                          checked={preferences.in_app_notifications}
                          onCheckedChange={(checked) => handlePreferenceChange('in_app_notifications', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-3">Notification Categories</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="investments-category">Investment Updates</Label>
                        <Switch
                          id="investments-category"
                          checked={preferences.categories.investments}
                          onCheckedChange={(checked) => 
                            handlePreferenceChange('categories', { ...preferences.categories, investments: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="system-category">System Notifications</Label>
                        <Switch
                          id="system-category"
                          checked={preferences.categories.system}
                          onCheckedChange={(checked) => 
                            handlePreferenceChange('categories', { ...preferences.categories, system: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="security-category">Security Alerts</Label>
                        <Switch
                          id="security-category"
                          checked={preferences.categories.security}
                          onCheckedChange={(checked) => 
                            handlePreferenceChange('categories', { ...preferences.categories, security: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="marketing-category">Marketing Communications</Label>
                        <Switch
                          id="marketing-category"
                          checked={preferences.categories.marketing}
                          onCheckedChange={(checked) => 
                            handlePreferenceChange('categories', { ...preferences.categories, marketing: checked })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label htmlFor="frequency">Notification Frequency</Label>
                    <Select
                      value={preferences.frequency}
                      onValueChange={(value) => handlePreferenceChange('frequency', value)}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="daily">Daily Digest</SelectItem>
                        <SelectItem value="weekly">Weekly Summary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
