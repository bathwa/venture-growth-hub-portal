
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function AdminOverview() {
  const stats = [
    { title: "Total Users", value: "1,247", change: "+12% from last month", color: "text-green-600" },
    { title: "Active Opportunities", value: "89", change: "+5% from last week", color: "text-blue-600" },
    { title: "Total Investments", value: "$2.4M", change: "+8% from last month", color: "text-purple-600" },
    { title: "Pending Payments", value: "23", change: "Needs attention", color: "text-orange-600" },
  ];

  const recentActivities = [
    { action: "New user registration", user: "john.doe@example.com", time: "5 minutes ago", type: "user" },
    { action: "Payment approved", amount: "$50,000", time: "15 minutes ago", type: "payment" },
    { action: "Opportunity submitted", title: "Tech Startup Funding", time: "1 hour ago", type: "opportunity" },
    { action: "Milestone updated", opportunity: "Green Energy Project", time: "2 hours ago", type: "milestone" },
  ];

  const pendingActions = [
    { title: "Review new opportunities", count: 5, priority: "high" },
    { title: "Approve payments", count: 8, priority: "high" },
    { title: "User verification requests", count: 12, priority: "medium" },
    { title: "Pool approval requests", count: 3, priority: "low" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
        <Button>Generate Report</Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardDescription>{stat.title}</CardDescription>
              <CardTitle className="text-2xl">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-sm ${stat.color}`}>{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest platform activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-gray-600">
                      {activity.user || activity.amount || activity.title || activity.opportunity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{activity.time}</p>
                    <Badge variant="outline" className="mt-1">
                      {activity.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Actions</CardTitle>
            <CardDescription>Items requiring your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingActions.map((action, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{action.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant={action.priority === 'high' ? 'destructive' : 
                                action.priority === 'medium' ? 'default' : 'secondary'}
                      >
                        {action.priority}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{action.count}</p>
                    <Button variant="outline" size="sm" className="mt-1">
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <span className="text-2xl mb-2">👤</span>
              Add User
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <span className="text-2xl mb-2">🏦</span>
              Create Pool
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <span className="text-2xl mb-2">💰</span>
              Process Payment
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <span className="text-2xl mb-2">📊</span>
              View Reports
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
