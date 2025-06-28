import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { StatisticsService } from '@/lib/statistics';
import { toast } from 'sonner';
import { 
  Briefcase, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  DollarSign,
  Users,
  FileText,
  TrendingUp
} from 'lucide-react';

const ServiceProviderDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    totalEarnings: 0,
    activeClients: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const mockTasks = [
    {
      id: 1,
      title: "Legal Review - Tech Startup Funding",
      client: "TechCorp Inc.",
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
      status: "pending",
      priority: "high",
      earnings: 2500
    },
    {
      id: 2,
      title: "Financial Audit - Healthcare Platform",
      client: "HealthTech Solutions",
      dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
      status: "pending",
      priority: "medium",
      earnings: 1800
    },
    {
      id: 3,
      title: "Contract Drafting - Real Estate Investment",
      client: "RealEstate Ventures",
      dueDate: new Date(Date.now() - 86400000 * 1).toISOString(),
      status: "completed",
      priority: "high",
      earnings: 3200
    },
    {
      id: 4,
      title: "Due Diligence - E-commerce Platform",
      client: "ShopTech",
      dueDate: new Date(Date.now() - 86400000 * 2).toISOString(),
      status: "overdue",
      priority: "high",
      earnings: 2800
    }
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      // In a real app, this would fetch from the database
      const dashboardStats = await StatisticsService.getDashboardStatistics(user?.id || '', 'service_provider');
      setStats({
        totalTasks: mockTasks.length,
        completedTasks: mockTasks.filter(task => task.status === 'completed').length,
        pendingTasks: mockTasks.filter(task => task.status === 'pending').length,
        overdueTasks: mockTasks.filter(task => task.status === 'overdue').length,
        totalEarnings: mockTasks.reduce((sum, task) => sum + task.earnings, 0),
        activeClients: new Set(mockTasks.map(task => task.client)).size
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Service Provider Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}</p>
        </div>
        <Button>
          <Briefcase className="h-4 w-4 mr-2" />
          View All Tasks
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedTasks} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeClients}</div>
            <p className="text-xs text-muted-foreground">
              Current engagements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingTasks}</div>
            <p className="text-xs text-muted-foreground">
              {stats.overdueTasks} overdue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
          <CardDescription>
            Your current service provider tasks and deadlines
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mockTasks.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks assigned</h3>
              <p className="text-gray-600">
                You'll see your assigned tasks here when they become available
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {mockTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-gray-900">{task.title}</h3>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Client: {task.client}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      <span>${task.earnings.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(task.status)}>
                      {task.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <FileText className="h-6 w-6 mb-2" />
              <span>Submit Report</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <Clock className="h-6 w-6 mb-2" />
              <span>Update Timeline</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <DollarSign className="h-6 w-6 mb-2" />
              <span>Request Payment</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceProviderDashboard;
