import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { KYCService } from '@/lib/kyc';
import { OpportunityService, Opportunity } from '@/lib/opportunities';
import { PoolService, Pool } from '@/lib/pools';
import { NotificationService, Notification } from '@/lib/notifications';
import { toast } from 'sonner';
import { 
  Users, 
  DollarSign, 
  FileText, 
  Building, 
  Shield, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  kyc_status: string;
  created_at: string;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [pools, setPools] = useState<Pool[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch opportunities
        const opportunitiesData = await OpportunityService.getOpportunities();
        setOpportunities(opportunitiesData);

        // Fetch notifications
        if (user) {
          const notificationsData = await NotificationService.getNotifications(user.id);
          setNotifications(notificationsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getKycStatusText = (status: string) => {
    switch (status) {
      case 'verified': return 'Verified';
      case 'pending': return 'Pending Review';
      case 'rejected': return 'Rejected';
      default: return 'Not Submitted';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'funded': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalUsers = users.length;
  const pendingKycUsers = users.filter(u => u.kyc_status === 'pending').length;
  const totalOpportunities = opportunities.length;
  const publishedOpportunities = opportunities.filter(opp => opp.status === 'published').length;
  const totalPools = pools.length;
  const activePools = pools.filter(pool => pool.status === 'active').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Platform overview and management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/admin/users">
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </Link>
          </Button>
          <Button asChild>
            <Link to="/admin/kyc">
              <Shield className="h-4 w-4 mr-2" />
              KYC Reviews
            </Link>
          </Button>
        </div>
      </div>

      {/* KYC Review Alert */}
      {pendingKycUsers > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">
                  KYC Reviews Pending
                </p>
                <p className="text-sm text-yellow-700">
                  {pendingKycUsers} users are waiting for KYC verification review.
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/kyc">Review KYC</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {pendingKycUsers} pending KYC
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opportunities</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOpportunities}</div>
            <p className="text-xs text-muted-foreground">
              {publishedOpportunities} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investment Pools</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPools}</div>
            <p className="text-xs text-muted-foreground">
              {activePools} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Funding</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${opportunities.reduce((sum, opp) => sum + opp.target_amount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Sought across platform
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Users */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Users</CardTitle>
          <CardDescription>
            Latest user registrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.slice(0, 5).map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge variant="outline">{user.role}</Badge>
                    <Badge className={getKycStatusColor(user.kyc_status)}>
                      {getKycStatusText(user.kyc_status)}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/admin/users/${user.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  {user.kyc_status === 'pending' && (
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/admin/kyc/${user.id}`}>
                        <Shield className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {users.length > 5 && (
              <div className="text-center">
                <Button variant="outline" asChild>
                  <Link to="/admin/users">
                    View All Users
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Opportunities</CardTitle>
          <CardDescription>
            Latest investment opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {opportunities.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No opportunities yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {opportunities.slice(0, 5).map((opportunity) => (
                <div key={opportunity.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{opportunity.title}</h3>
                    <p className="text-sm text-gray-600">{opportunity.industry} • {opportunity.location}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm font-medium text-green-600">
                        ${opportunity.target_amount.toLocaleString()}
                      </span>
                      <Badge className={getStatusColor(opportunity.status)}>
                        {opportunity.status}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {opportunity.views} views
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/admin/opportunities/${opportunity.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}
              {opportunities.length > 5 && (
                <div className="text-center">
                  <Button variant="outline" asChild>
                    <Link to="/admin/opportunities">
                      View All Opportunities
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.slice(0, 5).map((notification) => (
                <div key={notification.id} className={`flex items-start gap-3 p-3 rounded-lg ${notification.is_read ? 'bg-gray-50' : 'bg-blue-50'}`}>
                  <div className="flex-shrink-0">
                    {notification.is_read ? (
                      <CheckCircle className="h-5 w-5 text-gray-400" />
                    ) : (
                      <div className="h-5 w-5 rounded-full bg-blue-500"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
