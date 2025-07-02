
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, DollarSign, Users, Target, Clock } from 'lucide-react';

export function EntrepreneurOverview() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Entrepreneur Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your opportunities and track your progress</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create New Opportunity
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Opportunities</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-blue-600 font-medium">2 seeking investment</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$185,000</div>
            <p className="text-xs text-green-600 font-medium">+$25K this month</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Investors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-purple-600 font-medium">8 new this quarter</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Milestones Due</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-orange-600 font-medium">2 overdue</p>
          </CardContent>
        </Card>
      </div>

      {/* My Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle>My Opportunities</CardTitle>
          <CardDescription>Your active investment opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'TechStart Solutions', type: 'Going Concern', target: 150000, raised: 85000, status: 'Active' },
              { name: 'GreenEnergy Project', type: 'Project Partnership', target: 200000, raised: 50000, status: 'Active' },
              { name: 'AgriTech Innovation', type: 'Order Fulfillment', target: 75000, raised: 75000, status: 'Funded' }
            ].map((opportunity, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <h3 className="font-medium">{opportunity.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Raised: ${opportunity.raised.toLocaleString()} of ${opportunity.target.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{opportunity.type}</Badge>
                    <Badge variant={opportunity.status === 'Funded' ? 'default' : 'secondary'}>
                      {opportunity.status}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(opportunity.raised / opportunity.target) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {Math.round((opportunity.raised / opportunity.target) * 100)}% funded
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Manage
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Investment Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Investment Activity</CardTitle>
          <CardDescription>Latest offers and investor interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { investor: 'Michael Sibanda', opportunity: 'TechStart Solutions', amount: 25000, status: 'Accepted', time: '2 hours ago' },
              { investor: 'Investment Pool Alpha', opportunity: 'GreenEnergy Project', amount: 50000, status: 'Pending', time: '1 day ago' },
              { investor: 'Sarah Johnson', opportunity: 'TechStart Solutions', amount: 15000, status: 'Under Review', time: '3 days ago' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{activity.investor}</h4>
                  <p className="text-sm text-gray-600">{activity.opportunity}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${activity.amount.toLocaleString()}</p>
                  <Badge variant={
                    activity.status === 'Accepted' ? 'default' :
                    activity.status === 'Pending' ? 'secondary' : 'outline'
                  }>
                    {activity.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            Upcoming Milestones
          </CardTitle>
          <CardDescription>Track your progress and deliverables</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { title: 'Product Beta Release', opportunity: 'TechStart Solutions', due: '2024-02-15', status: 'In Progress' },
              { title: 'Market Validation Report', opportunity: 'GreenEnergy Project', due: '2024-02-20', status: 'Overdue' },
              { title: 'First Revenue Milestone', opportunity: 'TechStart Solutions', due: '2024-03-01', status: 'Upcoming' }
            ].map((milestone, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{milestone.title}</h4>
                  <p className="text-sm text-gray-600">{milestone.opportunity}</p>
                  <p className="text-xs text-gray-500">Due: {new Date(milestone.due).toLocaleDateString()}</p>
                </div>
                <Badge variant={
                  milestone.status === 'Overdue' ? 'destructive' :
                  milestone.status === 'In Progress' ? 'default' : 'secondary'
                }>
                  {milestone.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
