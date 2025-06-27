import { Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, FileText, TrendingUp, Calendar, AlertCircle, RefreshCw, CheckCircle, Clock, User } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Observer, getObserversByUser, getObserverByEmail, getObserverAccessLog, logObserverAccess } from "@/lib/observers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

export default function ObserverDashboard() {
  const [observerData, setObserverData] = useState<Observer | null>(null);
  const [accessLogs, setAccessLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock recent activity - in real app this would come from a separate table
  const recentActivity = [
    {
      id: 1,
      action: "Viewed Progress Report",
      date: new Date(Date.now() - 86400000).toISOString(),
      entity: "Tech Startup Alpha"
    },
    {
      id: 2,
      action: "Viewed Financial Update",
      date: new Date(Date.now() - 86400000 * 3).toISOString(),
      entity: "Tech Startup Alpha"
    },
    {
      id: 3,
      action: "Viewed Opportunity Details",
      date: new Date(Date.now() - 86400000 * 5).toISOString(),
      entity: "Tech Startup Alpha"
    }
  ];

  useEffect(() => {
    fetchObserverData();
  }, []);

  const fetchObserverData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Not authenticated');
      }

      // Get observer record for this user
      const { data: observers, error: observerError } = await supabase
        .from('observers')
        .select('*')
        .eq('email', user.email)
        .eq('status', 'active')
        .single();

      if (observerError) {
        if (observerError.code === 'PGRST116') {
          // No observer record found
          setObserverData(null);
        } else {
          throw observerError;
        }
      } else {
        setObserverData(observers);
        const logs = await getObserverAccessLog(observers.id);
        setAccessLogs(logs);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load observer data');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await fetchObserverData();
    setIsRefreshing(false);
  };

  const handleAccessResource = async (resource: string, action: string) => {
    if (!observerData) return;
    
    try {
      await logObserverAccess(observerData.id, action, resource);
      // Refresh access logs
      const logs = await getObserverAccessLog(observerData.id);
      setAccessLogs(logs);
    } catch (err) {
      console.error('Error logging access:', err);
    }
  };

  const getPermissionStatus = (permissionType: string) => {
    if (!observerData) return false;
    return observerData.permissions.some(perm => perm.type === permissionType);
  };

  const getRecentActivity = () => {
    return accessLogs.slice(0, 10).map(log => ({
      ...log,
      timeAgo: getTimeAgo(new Date(log.accessed_at))
    }));
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-48" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-48" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No observer access
  if (!observerData) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Observer Dashboard</h1>
            <p className="text-muted-foreground">
              Access to investment information
            </p>
          </div>
          <Badge variant="outline" className="bg-red-50 text-red-700">
            No Access
          </Badge>
        </div>

        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Observer Access</h2>
            <p className="text-muted-foreground mb-4">
              You don't have observer access to any investment opportunities.
            </p>
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Observer Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {observerData.name}. You have read-only access to {observerData.entity_type} activities.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Active Observer
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Observer Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Observer Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{observerData.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{observerData.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Relationship</p>
              <p className="font-medium capitalize">{observerData.relationship}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Access Granted By</p>
              <p className="font-medium">{observerData.granted_by_role}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <Badge variant={observerData.status === 'active' ? 'default' : 'secondary'}>
                {observerData.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Access Since</p>
              <p className="font-medium">
                {new Date(observerData.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permissions Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Your Permissions
          </CardTitle>
          <CardDescription>
            You have read-only access to the following resources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {observerData.permissions.map((permission, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">{permission.type.replace(/_/g, ' ')}</p>
                  <p className="text-sm text-gray-500">{permission.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{accessLogs.length}</div>
                <p className="text-xs text-muted-foreground">
                  +{accessLogs.filter(log => 
                    new Date(log.accessed_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  ).length} this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Permissions</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{observerData.permissions.length}</div>
                <p className="text-xs text-muted-foreground">
                  Read-only access granted
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Access</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {observerData.last_accessed ? 
                    getTimeAgo(new Date(observerData.last_accessed)) : 
                    'Never'
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  {observerData.last_accessed ? 
                    new Date(observerData.last_accessed).toLocaleDateString() : 
                    'No activity yet'
                  }
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Access the resources you have permission to view
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getPermissionStatus('view_opportunity') && (
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-start gap-2"
                    onClick={() => handleAccessResource('opportunity_details', 'view_opportunity')}
                  >
                    <FileText className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-medium">View Opportunity</p>
                      <p className="text-sm text-gray-500">Access opportunity details</p>
                    </div>
                  </Button>
                )}

                {getPermissionStatus('view_milestones') && (
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-start gap-2"
                    onClick={() => handleAccessResource('milestones', 'view_milestones')}
                  >
                    <TrendingUp className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-medium">View Milestones</p>
                      <p className="text-sm text-gray-500">Check progress updates</p>
                    </div>
                  </Button>
                )}

                {getPermissionStatus('view_documents') && (
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-start gap-2"
                    onClick={() => handleAccessResource('documents', 'view_documents')}
                  >
                    <FileText className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-medium">View Documents</p>
                      <p className="text-sm text-gray-500">Access legal documents</p>
                    </div>
                  </Button>
                )}

                {getPermissionStatus('view_financials') && (
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-start gap-2"
                    onClick={() => handleAccessResource('financials', 'view_financials')}
                  >
                    <TrendingUp className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-medium">View Financials</p>
                      <p className="text-sm text-gray-500">Check financial reports</p>
                    </div>
                  </Button>
                )}

                {getPermissionStatus('view_reports') && (
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-start gap-2"
                    onClick={() => handleAccessResource('reports', 'view_reports')}
                  >
                    <FileText className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-medium">View Reports</p>
                      <p className="text-sm text-gray-500">Access progress reports</p>
                    </div>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your recent access to resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              {getRecentActivity().length > 0 ? (
                <div className="space-y-4">
                  {getRecentActivity().map((log, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Eye className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{log.action.replace(/_/g, ' ')}</p>
                        <p className="text-sm text-gray-500">{log.resource}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{log.timeAgo}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(log.accessed_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No activity recorded yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Resources</CardTitle>
              <CardDescription>
                Resources you have permission to access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {observerData.permissions.map((permission, index) => (
                  <Card key={index} className="border-dashed">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        {permission.type.replace(/_/g, ' ')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{permission.description}</p>
                      <Button 
                        variant="outline" 
                        onClick={() => handleAccessResource(permission.type, permission.type)}
                      >
                        Access Resource
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t">
        <div className="text-center text-sm text-gray-500">
          <p>Observer access granted by {observerData.granted_by_role}</p>
          <p>Access expires: {observerData.access_expiry ? 
            new Date(observerData.access_expiry).toLocaleDateString() : 
            'No expiration'
          }</p>
        </div>
      </div>
    </div>
  );
} 