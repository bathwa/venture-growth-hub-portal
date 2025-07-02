
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, DollarSign, PieChart, Users, Eye } from 'lucide-react';

export function InvestorOverview() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Investment Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor your portfolio and discover new opportunities</p>
        </div>
        <Button>Browse Opportunities</Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$125,000</div>
            <p className="text-xs text-green-600 font-medium">+12% this month</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-blue-600 font-medium">3 new this quarter</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pool Memberships</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-purple-600 font-medium">2 leadership roles</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Return</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15.3%</div>
            <p className="text-xs text-green-600 font-medium">Above benchmark</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Investment Opportunities</CardTitle>
          <CardDescription>New opportunities matching your interests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((opportunity) => (
              <div key={opportunity} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <h3 className="font-medium">Tech Startup Alpha - Series A</h3>
                  <p className="text-sm text-gray-600 mt-1">Seeking $2M for AI-powered logistics platform</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">Technology</Badge>
                    <Badge variant="outline">Series A</Badge>
                    <Badge variant={opportunity === 1 ? "default" : "secondary"}>
                      {opportunity === 1 ? "New" : "Updated"}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">$2,000,000</p>
                  <p className="text-sm text-gray-600">Target Amount</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* My Investments */}
      <Card>
        <CardHeader>
          <CardTitle>My Active Investments</CardTitle>
          <CardDescription>Monitor your current investment portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((investment) => (
              <div key={investment} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h3 className="font-medium">Green Energy Solutions #{investment}</h3>
                  <p className="text-sm text-gray-600">Invested: $25,000 • Equity: 2.5%</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={investment === 1 ? "default" : "secondary"}>
                      {investment === 1 ? "Performing Well" : "On Track"}
                    </Badge>
                    <Badge variant="outline">Clean Energy</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-600 font-medium">+18.2%</p>
                  <p className="text-sm text-gray-600">Current Return</p>
                  <Button variant="ghost" size="sm" className="mt-2">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
