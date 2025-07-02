
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Users, Vote, Crown, Plus } from 'lucide-react';
import { PoolManagement } from '@/components/pool/PoolManagement';
import { useAuth } from '@/contexts/AuthContext';

export function PoolOverview() {
  const { user } = useAuth();
  const [activePoolId, setActivePoolId] = useState<string>('pool-1'); // This would come from actual pool data

  return (
    <div className="space-y-6">
      {/* Pool Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+2 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Committed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2.4M</div>
            <p className="text-xs text-muted-foreground">$500K invested</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">3 pending votes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18.5%</div>
            <p className="text-xs text-muted-foreground">Average return</p>
          </CardContent>
        </Card>
      </div>

      {/* Pool Management Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pool Management</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Invite Members
              </Button>
              <Button variant="outline" size="sm">
                <Vote className="h-4 w-4 mr-2" />
                Start Election
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <PoolManagement poolId={activePoolId} />
        </CardContent>
      </Card>

      {/* Recent Pool Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Pool Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">New investment proposal: TechCorp Series A</p>
                <p className="text-xs text-gray-500">Proposed by John Investor • 2 hours ago</p>
              </div>
              <Button size="sm" variant="outline">
                <Vote className="h-4 w-4 mr-2" />
                Vote
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">Confidence vote completed for Pool Manager</p>
                <p className="text-xs text-gray-500">Sarah Manager retained • 1 day ago</p>
              </div>
              <div className="text-sm text-green-600 font-medium">Retained</div>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">New member joined the pool</p>
                <p className="text-xs text-gray-500">Mike Investor • 3 days ago</p>
              </div>
              <div className="text-sm text-blue-600 font-medium">Welcome</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
