import React, { useState, useEffect } from 'react';
import { Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { OpportunityService, Opportunity } from '@/lib/opportunities';
import { KYCService } from '@/lib/kyc';
import { NotificationService, Notification } from '@/lib/notifications';
import { PoolService, Pool } from '@/lib/pools';
import { toast } from 'sonner';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  FileText, 
  Search, 
  Eye, 
  Clock,
  CheckCircle,
  AlertCircle,
  Bell,
  Building
} from 'lucide-react';
import { Link } from 'react-router-dom';
import InvestorDocumentWorkspace from "@/components/investor/InvestorDocumentWorkspace";
import { InvestorSidebar } from "@/components/investor/InvestorSidebar";
import ObserverManagement from "@/components/ui/observer-management";

const InvestorDashboard = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [pools, setPools] = useState<Pool[]>([]);
  const [kycStatus, setKycStatus] = useState<string>('not_submitted');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load all published opportunities
      const allOpportunities = await OpportunityService.getOpportunities('all');
      const publishedOpportunities = allOpportunities.filter(opp => opp.status === 'published');
      setOpportunities(publishedOpportunities);

      // Load investment pools
      const allPools = await PoolService.getPools();
      setPools(allPools);

      // Load KYC status
      const status = await KYCService.getKycStatus(user!.id);
      setKycStatus(status);

      // Load notifications
      const userNotifications = await NotificationService.getNotifications(user!.id);
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getKycStatusText = (status: string) => {
    switch (status) {
      case 'verified': return 'Verified';
      case 'pending': return 'Pending Review';
      case 'rejected': return 'Rejected';
      default: return 'Not Submitted';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'going_concern': return 'Going Concern';
      case 'order_fulfillment': return 'Order Fulfillment';
      case 'project_partnership': return 'Project Partnership';
      default: return type;
    }
  };

  const totalInvestmentOpportunities = opportunities.length;
  const totalPools = pools.length;
  const averageRiskScore = opportunities.length > 0 
    ? opportunities.reduce((sum, opp) => sum + (opp.risk_score || 0), 0) / opportunities.length 
    : 0;

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
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <InvestorSidebar />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-6 bg-gray-50">
            <Routes>
              <Route index element={<InvestorOverview />} />
              <Route path="documents" element={<InvestorDocumentWorkspace />} />
              <Route 
                path="observers" 
                element={
                  <ObserverManagement
                    userId={user!.id}
                    entityId={user!.id}
                    entityType="investment"
                    entityName={user!.name}
                  />
                } 
              />
              <Route path="portfolio" element={<div>Portfolio Management</div>} />
              <Route path="due-diligence" element={<div>Due Diligence</div>} />
              <Route path="reports" element={<div>Investment Reports</div>} />
              <Route path="profile" element={<div>Profile Management</div>} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

const InvestorOverview = () => {
  const [riskScores, setRiskScores] = useState<{ [id: string]: number | null }>({});
  const [validationErrors, setValidationErrors] = useState<{ [id: string]: string[] }>({});
  const [aiError, setAiError] = useState<string | null>(null);

  async function handleScore(opp: Opportunity) {
    const { valid, errors } = OpportunityService.validateOpportunity(opp);
    setValidationErrors((prev) => ({ ...prev, [opp.id]: errors }));
    if (!valid) return;
    const input = [parseFloat(opp.fields.equity_offered) || 0];
    const score = await OpportunityService.getRiskScore(input);
    setRiskScores((prev) => ({ ...prev, [opp.id]: OpportunityService.validateAIOutput('risk_score', score) }));
    setAiError(null);
  }

  function getMilestoneStatus(milestone: Milestone): MilestoneStatus {
    return OpportunityService.evaluateMilestoneStatus(milestone);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Investor Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Investment Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {opportunities.map((opp) => (
              <div key={opp.id} className="p-4 border rounded-lg mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{opp.title}</h4>
                  <span className="text-xs px-2 py-1 rounded bg-gray-200">{opp.type}</span>
                </div>
                <div className="mb-2">Status: <span className="font-semibold">{opp.status}</span></div>
                <Button variant="outline" onClick={() => handleScore(opp)}>
                  Validate & Score
                </Button>
                {validationErrors[opp.id] && validationErrors[opp.id].length > 0 && (
                  <div className="mt-2 text-red-600">
                    <ul>
                      {validationErrors[opp.id].map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                    <span className="font-bold">🚩 Red Flag</span>
                  </div>
                )}
                {riskScores[opp.id] !== undefined && riskScores[opp.id] !== null && (
                  <div className="mt-2 text-blue-700 font-semibold">AI Risk Score: {riskScores[opp.id]?.toFixed(2)}</div>
                )}
                {aiError && (
                  <div className="mt-2 text-red-600">{aiError}</div>
                )}
                {/* Milestones for this opportunity */}
                <div className="mt-4">
                  <div className="font-semibold mb-2">Milestones</div>
                  <div className="space-y-2">
                    {opp.milestones.map((milestone, idx) => {
                      const status = getMilestoneStatus(milestone);
                      return (
                        <div key={idx} className="flex items-center gap-4 p-2 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{milestone.title}</div>
                            <div className="text-sm text-gray-600">Target: {new Date(milestone.target_date).toLocaleDateString()}</div>
                            <div className="text-sm text-gray-600">Last update: {new Date(milestone.last_update).toLocaleDateString()}</div>
                          </div>
                          <span className={`px-2 py-1 rounded ${status === 'overdue' ? 'bg-red-200 text-red-800' : status === 'completed' ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                            {status === 'overdue' ? 'Overdue 🚩' : status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestorDashboard;
