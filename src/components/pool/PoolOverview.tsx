
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, Users, TrendingUp, DollarSign, Vote } from 'lucide-react';

export function PoolOverview() {
  return (
    <div className="space-y-6">
      {/* Pool Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="" />
            <AvatarFallback className="bg-purple-100 text-purple-600 text-xl font-bold">
              BC
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bulawayo Collective</h1>
            <p className="text-gray-600 mt-1">Technology Investment Syndicate</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">Syndicate</Badge>
              <Badge variant="default">Active</Badge>
              <Badge variant="secondary">{12} Members</Badge>
            </div>
          </div>
        </div>
        <div className="text-right">
          <Button className="mb-2">New Investment Proposal</Button>
          <p className="text-sm text-gray-600">Founded: Jan 2024</p>
        </div>
      </div>

      {/* Pool Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capital</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$450,000</div>
            <p className="text-xs text-green-600 font-medium">+8% this month</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-blue-600 font-medium">2 pending approval</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pool Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-purple-600 font-medium">Max: 20 members</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">22.4%</div>
            <p className="text-xs text-green-600 font-medium">Annual return</p>
          </CardContent>
        </Card>
      </div>

      {/* Leadership Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-600" />
            Pool Leadership
          </CardTitle>
          <CardDescription>Current leadership team and their mandates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { role: 'Chairperson', name: 'Sarah Ndlovu', mandate: 'Overall pool governance', rating: 4.8 },
              { role: 'Investments Officer', name: 'Michael Sibanda', mandate: 'Deal sourcing & analysis', rating: 4.6 },
              { role: 'Treasurer', name: 'Grace Moyo', mandate: 'Financial management', rating: 4.9 },
              { role: 'Secretary', name: 'David Mpofu', mandate: 'Documentation & compliance', rating: 4.7 }
            ].map((leader) => (
              <div key={leader.role} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{leader.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{leader.name}</h4>
                    <p className="text-sm text-gray-600">{leader.role}</p>
                    <p className="text-xs text-gray-500">{leader.mandate}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm font-medium">{leader.rating}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs">
                    <Vote className="h-3 w-3 mr-1" />
                    Rate
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Pool Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Pool Activity</CardTitle>
          <CardDescription>Latest votes, investments, and discussions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { type: 'vote', title: 'Investment Proposal: AgriTech Solutions', status: 'Approved', time: '2 hours ago' },
              { type: 'discussion', title: 'Q3 Performance Review Meeting', status: 'Scheduled', time: '1 day ago' },
              { type: 'investment', title: 'CleanEnergy Ltd - Payment Processed', status: 'Completed', time: '3 days ago' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="font-medium">{activity.title}</h4>
                  <p className="text-sm text-gray-600">{activity.time}</p>
                </div>
                <Badge variant={activity.status === 'Approved' || activity.status === 'Completed' ? 'default' : 'secondary'}>
                  {activity.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pool Members */}
      <Card>
        <CardHeader>
          <CardTitle>Pool Members</CardTitle>
          <CardDescription>Active members and their contributions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <Avatar>
                  <AvatarFallback>M{i + 1}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">Member {i + 1}</h4>
                  <p className="text-sm text-gray-600">Contributed: ${(Math.random() * 50000 + 10000).toFixed(0)}</p>
                  <p className="text-xs text-gray-500">Joined: {new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
