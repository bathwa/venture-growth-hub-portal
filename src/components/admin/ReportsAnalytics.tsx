import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Download, Filter, Calendar, TrendingUp, Users, DollarSign } from 'lucide-react';

// Mock data for charts
const investmentData = [
  { month: 'Jan', amount: 120000, count: 8 },
  { month: 'Feb', amount: 150000, count: 12 },
  { month: 'Mar', amount: 180000, count: 15 },
  { month: 'Apr', amount: 220000, count: 18 },
  { month: 'May', amount: 190000, count: 14 },
  { month: 'Jun', amount: 250000, count: 20 },
];

const industryData = [
  { name: 'Technology', value: 45, color: '#0088FE' },
  { name: 'Healthcare', value: 25, color: '#00C49F' },
  { name: 'Finance', value: 15, color: '#FFBB28' },
  { name: 'Energy', value: 10, color: '#FF8042' },
  { name: 'Other', value: 5, color: '#8884D8' },
];

const userGrowthData = [
  { month: 'Jan', entrepreneurs: 45, investors: 30, pools: 5 },
  { month: 'Feb', entrepreneurs: 52, investors: 35, pools: 7 },
  { month: 'Mar', entrepreneurs: 61, investors: 42, pools: 8 },
  { month: 'Apr', entrepreneurs: 68, investors: 48, pools: 10 },
  { month: 'May', entrepreneurs: 75, investors: 55, pools: 12 },
  { month: 'Jun', entrepreneurs: 82, investors: 62, pools: 15 },
];

export function ReportsAnalytics() {
  const [dateRange, setDateRange] = useState('last_6_months');
  const [reportType, setReportType] = useState('overview');

  const handleExportReport = () => {
    // Export functionality would be implemented here
    console.log('Exporting report...');
  };

  const handleApplyFilters = () => {
    // Filter application logic would be implemented here
    console.log('Applying filters...');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Reports & Analytics</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </Button>
          <Button variant="outline" onClick={handleApplyFilters}>
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,234,567</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">159</div>
            <p className="text-xs text-muted-foreground">
              +15.3% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opportunities</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87</div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">73%</div>
            <p className="text-xs text-muted-foreground">
              +5.2% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div>
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview</SelectItem>
                  <SelectItem value="investments">Investments</SelectItem>
                  <SelectItem value="users">User Analytics</SelectItem>
                  <SelectItem value="opportunities">Opportunities</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date-range">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                  <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                  <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                  <SelectItem value="last_6_months">Last 6 Months</SelectItem>
                  <SelectItem value="last_year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Investment Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Investment Trends</CardTitle>
            <CardDescription>Monthly investment amounts and counts</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={investmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" fill="#8884d8" name="Amount ($)" />
                <Bar dataKey="count" fill="#82ca9d" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Industry Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Industry Distribution</CardTitle>
            <CardDescription>Investment distribution by industry</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={industryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {industryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Growth */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>Growth in different user types over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="entrepreneurs" stroke="#8884d8" name="Entrepreneurs" />
                <Line type="monotone" dataKey="investors" stroke="#82ca9d" name="Investors" />
                <Line type="monotone" dataKey="pools" stroke="#ffc658" name="Pools" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
