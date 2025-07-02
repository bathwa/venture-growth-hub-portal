
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Clock, FileText, TrendingUp } from 'lucide-react';

export function ObserverOverview() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Observer Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor assigned entities and investment activities</p>
      </div>

      {/* Observer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Observed Entities</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-blue-600 font-medium">5 opportunities, 7 pools</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Updates</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-orange-600 font-medium">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports Generated</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-green-600 font-medium">This month</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Access Level</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">High</div>
            <p className="text-xs text-purple-600 font-medium">Full transparency</p>
          </CardContent>
        </Card>
      </div>

      {/* Observed Entities */}
      <Card>
        <CardHeader>
          <CardTitle>Observed Entities</CardTitle>
          <CardDescription>Entities you have been granted observer access to</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { type: 'opportunity', name: 'TechStart Solutions', status: 'Active', lastUpdate: '2 hours ago', access: 'Full' },
              { type: 'pool', name: 'Bulawayo Investment Collective', status: 'Active', lastUpdate: '4 hours ago', access: 'Limited' },
              { type: 'opportunity', name: 'GreenEnergy Innovations', status: 'Funded', lastUpdate: '1 day ago', access: 'Full' },
              { type: 'pool', name: 'Tech Syndicate Alpha', status: 'Active', lastUpdate: '2 days ago', access: 'Full' }
            ].map((entity, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h3 className="font-medium">{entity.name}</h3>
                  <p className="text-sm text-gray-600">Last updated: {entity.lastUpdate}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">
                      {entity.type === 'opportunity' ? 'Opportunity' : 'Pool'}
                    </Badge>
                    <Badge variant={entity.status === 'Active' ? 'default' : 'secondary'}>
                      {entity.status}
                    </Badge>
                    <Badge variant={entity.access === 'Full' ? 'default' : 'outline'}>
                      {entity.access} Access
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates from observed entities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { entity: 'TechStart Solutions', activity: 'Milestone completed: Product Beta Launch', time: '2 hours ago', type: 'milestone' },
              { entity: 'Bulawayo Investment Collective', activity: 'New investment proposal submitted', time: '4 hours ago', type: 'proposal' },
              { entity: 'GreenEnergy Innovations', activity: 'Quarterly report published', time: '1 day ago', type: 'report' },
              { entity: 'Tech Syndicate Alpha', activity: 'Leadership election scheduled', time: '2 days ago', type: 'governance' }
            ].map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <h4 className="font-medium">{activity.entity}</h4>
                  <p className="text-sm text-gray-600">{activity.activity}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {activity.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Access Information */}
      <Card>
        <CardHeader>
          <CardTitle>Access Information</CardTitle>
          <CardDescription>Your observer permissions and restrictions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900">Full Access Entities</h4>
              <p className="text-sm text-blue-700 mt-1">
                You have comprehensive read-only access to financial data, documents, communications, and strategic information.
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-900">Limited Access Entities</h4>
              <p className="text-sm text-yellow-700 mt-1">
                You can view basic information, progress updates, and public documents only.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">Observer Guidelines</h4>
              <ul className="text-sm text-gray-700 mt-1 space-y-1">
                <li>• All accessed information is confidential</li>
                <li>• No modification or editing permissions</li>
                <li>• Regular access logs are maintained</li>
                <li>• Report any concerns through proper channels</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
