import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Briefcase, 
  FileText, 
  BarChart3, 
  PieChart, 
  Download, 
  Calendar,
  RefreshCw,
  Eye,
  EyeOff,
  Filter,
  Search,
  Download as DownloadIcon,
  Share2,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import { toast } from "sonner";

// Mock data - replace with actual API calls
interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalOpportunities: number;
    totalInvestments: number;
    totalRevenue: number;
    growthRate: number;
  };
  userMetrics: {
    registrations: { date: string; count: number }[];
    activeUsers: { date: string; count: number }[];
    userTypes: { type: string; count: number }[];
    kycStatus: { status: string; count: number }[];
  };
  opportunityMetrics: {
    created: { date: string; count: number }[];
    published: { date: string; count: number }[];
    funded: { date: string; count: number }[];
    categories: { category: string; count: number }[];
    fundingRanges: { range: string; count: number }[];
  };
  investmentMetrics: {
    totalInvested: { date: string; amount: number }[];
    averageInvestment: { date: string; amount: number }[];
    investmentTypes: { type: string; amount: number }[];
    investorActivity: { investor: string; investments: number; amount: number }[];
  };
  financialMetrics: {
    revenue: { date: string; amount: number }[];
    fees: { date: string; amount: number }[];
    escrowBalance: { date: string; amount: number }[];
    paymentStatus: { status: string; count: number }[];
  };
  performanceMetrics: {
    conversionRates: { stage: string; rate: number }[];
    timeToFund: { category: string; days: number }[];
    userRetention: { period: string; rate: number }[];
    platformHealth: { metric: string; value: number; status: string }[];
  };
}

const mockAnalyticsData: AnalyticsData = {
  overview: {
    totalUsers: 1247,
    activeUsers: 892,
    totalOpportunities: 89,
    totalInvestments: 156,
    totalRevenue: 2450000,
    growthRate: 12.5
  },
  userMetrics: {
    registrations: [
      { date: '2024-01', count: 45 },
      { date: '2024-02', count: 67 },
      { date: '2024-03', count: 89 },
      { date: '2024-04', count: 123 },
      { date: '2024-05', count: 156 },
      { date: '2024-06', count: 178 }
    ],
    activeUsers: [
      { date: '2024-01', count: 234 },
      { date: '2024-02', count: 289 },
      { date: '2024-03', count: 345 },
      { date: '2024-04', count: 412 },
      { date: '2024-05', count: 478 },
      { date: '2024-06', count: 523 }
    ],
    userTypes: [
      { type: 'Entrepreneurs', count: 456 },
      { type: 'Investors', count: 234 },
      { type: 'Service Providers', count: 123 },
      { type: 'Pool Managers', count: 67 },
      { type: 'Observers', count: 89 }
    ],
    kycStatus: [
      { status: 'Verified', count: 892 },
      { status: 'Pending', count: 234 },
      { status: 'Rejected', count: 45 },
      { status: 'Not Started', count: 76 }
    ]
  },
  opportunityMetrics: {
    created: [
      { date: '2024-01', count: 12 },
      { date: '2024-02', count: 18 },
      { date: '2024-03', count: 23 },
      { date: '2024-04', count: 31 },
      { date: '2024-05', count: 28 },
      { date: '2024-06', count: 35 }
    ],
    published: [
      { date: '2024-01', count: 8 },
      { date: '2024-02', count: 14 },
      { date: '2024-03', count: 19 },
      { date: '2024-04', count: 26 },
      { date: '2024-05', count: 24 },
      { date: '2024-06', count: 31 }
    ],
    funded: [
      { date: '2024-01', count: 3 },
      { date: '2024-02', count: 7 },
      { date: '2024-03', count: 12 },
      { date: '2024-04', count: 18 },
      { date: '2024-05', count: 15 },
      { date: '2024-06', count: 22 }
    ],
    categories: [
      { category: 'Technology', count: 34 },
      { category: 'Healthcare', count: 18 },
      { category: 'Finance', count: 15 },
      { category: 'Education', count: 12 },
      { category: 'Other', count: 10 }
    ],
    fundingRanges: [
      { range: '$10K - $50K', count: 25 },
      { range: '$50K - $100K', count: 18 },
      { range: '$100K - $500K', count: 23 },
      { range: '$500K - $1M', count: 15 },
      { range: '$1M+', count: 8 }
    ]
  },
  investmentMetrics: {
    totalInvested: [
      { date: '2024-01', amount: 125000 },
      { date: '2024-02', amount: 234000 },
      { date: '2024-03', amount: 345000 },
      { date: '2024-04', amount: 456000 },
      { date: '2024-05', amount: 567000 },
      { date: '2024-06', amount: 678000 }
    ],
    averageInvestment: [
      { date: '2024-01', amount: 41667 },
      { date: '2024-02', amount: 33429 },
      { date: '2024-03', amount: 28750 },
      { date: '2024-04', amount: 25333 },
      { date: '2024-05', amount: 37800 },
      { date: '2024-06', amount: 30818 }
    ],
    investmentTypes: [
      { type: 'Equity', amount: 1450000 },
      { type: 'Debt', amount: 567000 },
      { type: 'Convertible Note', amount: 234000 },
      { type: 'Revenue Share', amount: 203000 }
    ],
    investorActivity: [
      { investor: 'Angel Investor LLC', investments: 12, amount: 450000 },
      { investor: 'Venture Capital Fund', investments: 8, amount: 320000 },
      { investor: 'Individual Investor', investments: 15, amount: 280000 },
      { investor: 'Pool Investment Group', investments: 6, amount: 180000 }
    ]
  },
  financialMetrics: {
    revenue: [
      { date: '2024-01', amount: 12500 },
      { date: '2024-02', amount: 23400 },
      { date: '2024-03', amount: 34500 },
      { date: '2024-04', amount: 45600 },
      { date: '2024-05', amount: 56700 },
      { date: '2024-06', amount: 67800 }
    ],
    fees: [
      { date: '2024-01', amount: 2500 },
      { date: '2024-02', amount: 4680 },
      { date: '2024-03', amount: 6900 },
      { date: '2024-04', amount: 9120 },
      { date: '2024-05', amount: 11340 },
      { date: '2024-06', amount: 13560 }
    ],
    escrowBalance: [
      { date: '2024-01', amount: 450000 },
      { date: '2024-02', amount: 520000 },
      { date: '2024-03', amount: 610000 },
      { date: '2024-04', amount: 720000 },
      { date: '2024-05', amount: 830000 },
      { date: '2024-06', amount: 950000 }
    ],
    paymentStatus: [
      { status: 'Completed', count: 134 },
      { status: 'Pending', count: 23 },
      { status: 'Failed', count: 8 },
      { status: 'Refunded', count: 3 }
    ]
  },
  performanceMetrics: {
    conversionRates: [
      { stage: 'Registration to KYC', rate: 78.5 },
      { stage: 'KYC to Active', rate: 92.3 },
      { stage: 'Opportunity Creation to Publication', rate: 85.7 },
      { stage: 'Publication to Funding', rate: 23.4 },
      { stage: 'Funding to Completion', rate: 96.8 }
    ],
    timeToFund: [
      { category: 'Technology', days: 45 },
      { category: 'Healthcare', days: 67 },
      { category: 'Finance', days: 34 },
      { category: 'Education', days: 56 },
      { category: 'Other', days: 52 }
    ],
    userRetention: [
      { period: '1 Month', rate: 85.2 },
      { period: '3 Months', rate: 72.8 },
      { period: '6 Months', rate: 64.3 },
      { period: '12 Months', rate: 58.7 }
    ],
    platformHealth: [
      { metric: 'Uptime', value: 99.8, status: 'excellent' },
      { metric: 'Response Time', value: 245, status: 'good' },
      { metric: 'Error Rate', value: 0.2, status: 'excellent' },
      { metric: 'User Satisfaction', value: 4.6, status: 'good' }
    ]
  }
};

export function ReportsAnalytics() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('6m');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [data, setData] = useState<AnalyticsData>(mockAnalyticsData);
  const [showDetailedMetrics, setShowDetailedMetrics] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRefreshing(false);
    toast.success('Analytics data refreshed');
  };

  const handleExportReport = (type: string) => {
    // Implementation for exporting reports
    toast.success(`${type} report exported successfully`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-blue-600';
      case 'warning':
        return 'text-orange-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'good':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-gray-600">Comprehensive insights into platform performance and user activity</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last Month</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setShowDetailedMetrics(!showDetailedMetrics)}>
            {showDetailedMetrics ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showDetailedMetrics ? 'Hide Details' : 'Show Details'}
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{data.overview.growthRate}%</span> from last month
            </p>
            {showDetailedMetrics && (
              <div className="mt-2 text-xs text-gray-500">
                Active: {data.overview.activeUsers.toLocaleString()} ({((data.overview.activeUsers / data.overview.totalUsers) * 100).toFixed(1)}%)
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Opportunities</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalOpportunities}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8.2%</span> from last month
            </p>
            {showDetailedMetrics && (
              <div className="mt-2 text-xs text-gray-500">
                Published: {data.opportunityMetrics.published[data.opportunityMetrics.published.length - 1].count}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.overview.totalInvestments)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+15.3%</span> from last month
            </p>
            {showDetailedMetrics && (
              <div className="mt-2 text-xs text-gray-500">
                Count: {data.overview.totalInvestments} deals
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.overview.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+22.1%</span> from last month
            </p>
            {showDetailedMetrics && (
              <div className="mt-2 text-xs text-gray-500">
                Monthly: {formatCurrency(data.overview.totalRevenue / 6)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  User Growth
                  <Button variant="outline" size="sm" onClick={() => handleExportReport('user-growth')}>
                    <DownloadIcon className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">User Growth Chart</p>
                    <p className="text-sm text-gray-400">Registration and active user trends</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Investment Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Investment Trends
                  <Button variant="outline" size="sm" onClick={() => handleExportReport('investment-trends')}>
                    <DownloadIcon className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Investment Trends Chart</p>
                    <p className="text-sm text-gray-400">Total and average investment amounts</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Platform Health */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.performanceMetrics.platformHealth.map((metric, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(metric.status)}
                        <span className="text-sm font-medium">{metric.metric}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${getStatusColor(metric.status)}`}>
                          {metric.metric === 'Response Time' ? `${metric.value}ms` : 
                           metric.metric === 'User Satisfaction' ? `${metric.value}/5` :
                           metric.metric === 'Error Rate' ? `${metric.value}%` : `${metric.value}%`}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {metric.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" onClick={() => handleExportReport('comprehensive')}>
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Export Comprehensive Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => handleExportReport('executive')}>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Executive Summary
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => handleExportReport('custom')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Create Custom Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Registrations */}
            <Card>
              <CardHeader>
                <CardTitle>User Registrations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Registration Chart</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Types Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>User Types Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.userMetrics.userTypes.map((type, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{type.type}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(type.count / data.overview.totalUsers) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{type.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* KYC Status */}
            <Card>
              <CardHeader>
                <CardTitle>KYC Verification Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.userMetrics.kycStatus.map((status, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{status.status}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={status.status === 'Verified' ? 'default' : 'secondary'}>
                          {status.count}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {((status.count / data.overview.totalUsers) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* User Retention */}
            <Card>
              <CardHeader>
                <CardTitle>User Retention Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.performanceMetrics.userRetention.map((retention, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{retention.period}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${retention.rate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{retention.rate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Opportunity Creation Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Opportunity Creation Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Opportunity Trends Chart</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Opportunity Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Opportunity Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.opportunityMetrics.categories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{category.category}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ width: `${(category.count / data.overview.totalOpportunities) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{category.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Funding Ranges */}
            <Card>
              <CardHeader>
                <CardTitle>Funding Ranges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.opportunityMetrics.fundingRanges.map((range, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{range.range}</span>
                      <Badge variant="outline">{range.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Conversion Rates */}
            <Card>
              <CardHeader>
                <CardTitle>Conversion Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.performanceMetrics.conversionRates.map((rate, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{rate.stage}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-orange-600 h-2 rounded-full" 
                            style={{ width: `${rate.rate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{rate.rate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="investments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Investment Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Investment Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Investment Trends Chart</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Investment Types */}
            <Card>
              <CardHeader>
                <CardTitle>Investment Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.investmentMetrics.investmentTypes.map((type, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{type.type}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{formatCurrency(type.amount)}</span>
                        <span className="text-xs text-gray-500">
                          {((type.amount / data.overview.totalInvestments) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Investors */}
            <Card>
              <CardHeader>
                <CardTitle>Top Investors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.investmentMetrics.investorActivity.map((investor, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{investor.investor}</p>
                        <p className="text-xs text-gray-500">{investor.investments} investments</p>
                      </div>
                      <span className="text-sm font-medium">{formatCurrency(investor.amount)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Time to Fund */}
            <Card>
              <CardHeader>
                <CardTitle>Average Time to Fund</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.performanceMetrics.timeToFund.map((time, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{time.category}</span>
                      <Badge variant="outline">{time.days} days</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Revenue Chart</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Status */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.financialMetrics.paymentStatus.map((status, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{status.status}</span>
                      <Badge variant={status.status === 'Completed' ? 'default' : 'secondary'}>
                        {status.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Escrow Balance */}
            <Card>
              <CardHeader>
                <CardTitle>Escrow Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Escrow Balance Chart</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fee Structure */}
            <Card>
              <CardHeader>
                <CardTitle>Fee Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Platform Fee</span>
                    <span className="text-sm font-medium">2.5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Transaction Fee</span>
                    <span className="text-sm font-medium">1.0%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Escrow Fee</span>
                    <span className="text-sm font-medium">0.5%</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-sm">Total Average Fee</span>
                    <span className="text-sm">4.0%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platform Health */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Health Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.performanceMetrics.platformHealth.map((metric, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(metric.status)}
                        <div>
                          <p className="font-medium">{metric.metric}</p>
                          <p className="text-sm text-gray-500">Current performance</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${getStatusColor(metric.status)}`}>
                          {metric.metric === 'Response Time' ? `${metric.value}ms` : 
                           metric.metric === 'User Satisfaction' ? `${metric.value}/5` :
                           metric.metric === 'Error Rate' ? `${metric.value}%` : `${metric.value}%`}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {metric.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Conversion Funnel */}
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.performanceMetrics.conversionRates.map((rate, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{rate.stage}</span>
                        <span className="text-sm font-bold">{rate.rate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                          style={{ width: `${rate.rate}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* User Retention */}
            <Card>
              <CardHeader>
                <CardTitle>User Retention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Retention Chart</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertDescription>
                      User registration growth is strong at +12.5% month-over-month
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Platform uptime remains excellent at 99.8%
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Opportunity to funding conversion rate could be improved
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
