
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { DRBE, Milestone, MilestoneStatus } from "@/lib/drbe";

export function EntrepreneurOverview() {
  const navigate = useNavigate();

  const stats = [
    { title: "Active Opportunities", value: "3", subtitle: "2 published, 1 draft" },
    { title: "Total Funding Received", value: "$250K", subtitle: "Across all opportunities" },
    { title: "Pending Offers", value: "5", subtitle: "Requiring your response" },
    { title: "Active Milestones", value: "8", subtitle: "2 due this week" },
  ];

  const opportunities = [
    {
      id: 1,
      title: "Green Energy Startup",
      status: "published",
      funding: "$100K",
      target: "$500K",
      progress: 20,
      offers: 3,
      nextMilestone: "Product Prototype - Due in 5 days"
    },
    {
      id: 2,
      title: "AI Healthcare Platform",
      status: "published",
      funding: "$150K",
      target: "$750K",
      progress: 20,
      offers: 2,
      nextMilestone: "Market Research - Due in 12 days"
    },
    {
      id: 3,
      title: "Sustainable Fashion Brand",
      status: "draft",
      funding: "$0",
      target: "$300K",
      progress: 0,
      offers: 0,
      nextMilestone: "Complete business plan"
    }
  ];

  const recentActivity = [
    { action: "New investment offer received", opportunity: "Green Energy Startup", amount: "$75K", time: "2 hours ago" },
    { action: "Milestone updated", opportunity: "AI Healthcare Platform", detail: "Market analysis completed", time: "1 day ago" },
    { action: "Investor inquiry", opportunity: "Green Energy Startup", detail: "Additional documentation requested", time: "2 days ago" },
  ];

  // Mock milestones
  const milestones: Milestone[] = [
    {
      title: "Product Development",
      target_date: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
      status: "pending",
      last_update: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      title: "Market Research",
      target_date: new Date(Date.now() + 86400000 * 3).toISOString(), // in 3 days
      status: "pending",
      last_update: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      title: "Legal Documentation",
      target_date: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
      status: "completed",
      last_update: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
  ];

  function getMilestoneStatus(milestone: Milestone): MilestoneStatus {
    return DRBE.evaluateMilestoneStatus(milestone);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
        <Button onClick={() => navigate('/entrepreneur/create-opportunity')}>
          + Create New Opportunity
        </Button>
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
              <p className="text-sm text-gray-600">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle>My Opportunities</CardTitle>
            <CardDescription>Overview of your investment opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {opportunities.map((opportunity) => (
                <div key={opportunity.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{opportunity.title}</h4>
                    <Badge variant={opportunity.status === 'published' ? 'default' : 'secondary'}>
                      {opportunity.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Funding Progress</span>
                      <span>{opportunity.funding} / {opportunity.target}</span>
                    </div>
                    <Progress value={opportunity.progress} className="h-2" />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{opportunity.offers} offers</span>
                      <span>{opportunity.progress}% funded</span>
                    </div>
                    <p className="text-sm text-blue-600">{opportunity.nextMilestone}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates on your opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-sm">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.opportunity}</p>
                  {activity.amount && (
                    <p className="text-sm font-medium text-green-600">{activity.amount}</p>
                  )}
                  {activity.detail && (
                    <p className="text-sm text-gray-600">{activity.detail}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Milestones Section */}
      <Card>
        <CardHeader>
          <CardTitle>Milestones</CardTitle>
          <CardDescription>Track your progress and see overdue milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {milestones.map((milestone, idx) => {
              const status = getMilestoneStatus(milestone);
              return (
                <div key={idx} className="flex items-center gap-4 p-2 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{milestone.title}</div>
                    <div className="text-sm text-gray-600">Target: {new Date(milestone.target_date).toLocaleDateString()}</div>
                    <div className="text-sm text-gray-600">Last update: {new Date(milestone.last_update).toLocaleDateString()}</div>
                  </div>
                  <Badge variant={status === 'overdue' ? 'destructive' : status === 'completed' ? 'default' : 'secondary'}>
                    {status === 'overdue' ? 'Overdue 🚩' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col" onClick={() => navigate('/entrepreneur/create-opportunity')}>
              <span className="text-2xl mb-2">➕</span>
              Create Opportunity
            </Button>
            <Button variant="outline" className="h-20 flex-col" onClick={() => navigate('/entrepreneur/offers')}>
              <span className="text-2xl mb-2">💼</span>
              View Offers
            </Button>
            <Button variant="outline" className="h-20 flex-col" onClick={() => navigate('/entrepreneur/reports')}>
              <span className="text-2xl mb-2">📊</span>
              Update Progress
            </Button>
            <Button variant="outline" className="h-20 flex-col" onClick={() => navigate('/entrepreneur/profile')}>
              <span className="text-2xl mb-2">👤</span>
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
