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

const ObserverOverview = () => {
  const [observerData, setObserverData] = useState<Observer | null>(null);
  const [accessLogs, setAccessLogs] = useState<ObserverAccessLog[]>([]);
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
              You don't have any active observer access to investment information.
            </p>
            <p className="text-sm text-muted-foreground">
              Contact the person who invited you to check your invitation status.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Observer Dashboard</h1>
          <p className="text-muted-foreground">
            View access to {observerData.entity_id}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={refreshData}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Observer
          </Badge>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Access Info */}
      <Card>
        <CardHeader>
          <CardTitle>Your Access Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Personal Information</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Name:</span>
                  <p className="font-medium">{observerData.name}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <p className="font-medium">{observerData.email}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Relationship:</span>
                  <p className="font-medium">{observerData.relationship}</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Access Details</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Entity:</span>
                  <p className="font-medium">{observerData.entity_id}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Entity Type:</span>
                  <p className="font-medium">{observerData.entity_type}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Access Granted:</span>
                  <p className="font-medium">{new Date(observerData.created_at).toLocaleDateString()}</p>
                </div>
                {observerData.last_accessed && (
                  <div>
                    <span className="text-sm text-muted-foreground">Last Access:</span>
                    <p className="font-medium">{new Date(observerData.last_accessed).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Your Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {observerData.permissions.map((permission, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                <Eye className="h-5 w-5 text-blue-500" />
                <span className="font-medium">{permission.description}</span>
                <Badge variant="outline" className="ml-auto">Read Only</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <FileText className="h-6 w-6" />
              <span>View Documents</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <TrendingUp className="h-6 w-6" />
              <span>View Progress</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Calendar className="h-6 w-6" />
              <span>View Timeline</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{activity.action}</h4>
                  <p className="text-sm text-muted-foreground">{activity.entity}</p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {new Date(activity.date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ObserverDashboard = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-6 bg-gray-50">
            <Routes>
              <Route index element={<ObserverOverview />} />
              <Route path="documents" element={<div>Observer Documents</div>} />
              <Route path="progress" element={<div>Progress Reports</div>} />
              <Route path="timeline" element={<div>Project Timeline</div>} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ObserverDashboard; 