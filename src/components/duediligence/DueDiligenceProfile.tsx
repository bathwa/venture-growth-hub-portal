
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface DueDiligenceProfile {
  id: string;
  user_id: string;
  debt_profile: any;
  credit_score: number | null;
  financial_statements: any[];
  risk_assessment: any;
  compliance_status: string;
  last_updated: string;
}

export function DueDiligenceProfile() {
  const [profile, setProfile] = useState<DueDiligenceProfile | null>(null);
  const [debtProfile, setDebtProfile] = useState({
    total_debt: '',
    monthly_obligations: '',
    debt_to_income_ratio: '',
    credit_utilization: '',
    payment_history: '',
    outstanding_loans: '',
    guarantees_provided: ''
  });
  const [riskAssessment, setRiskAssessment] = useState({
    financial_stability: '',
    business_experience: '',
    market_knowledge: '',
    regulatory_compliance: '',
    operational_risks: '',
    overall_risk_score: ''
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('due_diligence_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProfile(data);
        setDebtProfile(data.debt_profile || {});
        setRiskAssessment(data.risk_assessment || {});
      }
    } catch (error) {
      console.error('Error fetching due diligence profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    try {
      const profileData = {
        user_id: user.id,
        debt_profile: debtProfile,
        risk_assessment: riskAssessment,
        credit_score: riskAssessment.overall_risk_score ? parseInt(riskAssessment.overall_risk_score) : null,
        last_updated: new Date().toISOString()
      };

      if (profile) {
        const { error } = await supabase
          .from('due_diligence_profiles')
          .update(profileData)
          .eq('id', profile.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('due_diligence_profiles')
          .insert([profileData]);

        if (error) throw error;
      }

      await fetchProfile();
      toast.success('Due diligence profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Error saving profile:', error);
    }
  };

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevel = (score: string) => {
    const numScore = parseInt(score);
    if (numScore >= 750) return { level: 'Low', color: 'text-green-600' };
    if (numScore >= 650) return { level: 'Medium', color: 'text-yellow-600' };
    return { level: 'High', color: 'text-red-600' };
  };

  if (loading) {
    return <div>Loading due diligence profile...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Due Diligence Profile
            </CardTitle>
            {profile && (
              <Badge className={getComplianceStatusColor(profile.compliance_status)}>
                {profile.compliance_status.toUpperCase()}
              </Badge>
            )}
          </div>
          {profile?.last_updated && (
            <p className="text-sm text-gray-600">
              Last updated: {new Date(profile.last_updated).toLocaleDateString()}
            </p>
          )}
        </CardHeader>
      </Card>

      <Tabs defaultValue="debt" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="debt">
            <TrendingUp className="h-4 w-4 mr-2" />
            Debt Profile
          </TabsTrigger>
          <TabsTrigger value="risk">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Risk Assessment
          </TabsTrigger>
          <TabsTrigger value="compliance">
            <CheckCircle className="h-4 w-4 mr-2" />
            Compliance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="debt" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Debt & Financial Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="total_debt">Total Outstanding Debt</Label>
                  <Input
                    id="total_debt"
                    type="number"
                    value={debtProfile.total_debt}
                    onChange={(e) => setDebtProfile(prev => ({ ...prev, total_debt: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="monthly_obligations">Monthly Debt Obligations</Label>
                  <Input
                    id="monthly_obligations"
                    type="number"
                    value={debtProfile.monthly_obligations}
                    onChange={(e) => setDebtProfile(prev => ({ ...prev, monthly_obligations: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="debt_to_income">Debt-to-Income Ratio (%)</Label>
                  <Input
                    id="debt_to_income"
                    type="number"
                    step="0.01"
                    value={debtProfile.debt_to_income_ratio}
                    onChange={(e) => setDebtProfile(prev => ({ ...prev, debt_to_income_ratio: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="credit_utilization">Credit Utilization (%)</Label>
                  <Input
                    id="credit_utilization"
                    type="number"
                    step="0.01"
                    value={debtProfile.credit_utilization}
                    onChange={(e) => setDebtProfile(prev => ({ ...prev, credit_utilization: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="payment_history">Payment History Summary</Label>
                <Textarea
                  id="payment_history"
                  value={debtProfile.payment_history}
                  onChange={(e) => setDebtProfile(prev => ({ ...prev, payment_history: e.target.value }))}
                  rows={3}
                  placeholder="Describe your payment history, any defaults, late payments, etc."
                />
              </div>

              <div>
                <Label htmlFor="outstanding_loans">Outstanding Loans & Credit Facilities</Label>
                <Textarea
                  id="outstanding_loans"
                  value={debtProfile.outstanding_loans}
                  onChange={(e) => setDebtProfile(prev => ({ ...prev, outstanding_loans: e.target.value }))}
                  rows={3}
                  placeholder="List all current loans, credit cards, and other financial obligations"
                />
              </div>

              <div>
                <Label htmlFor="guarantees">Personal Guarantees Provided</Label>
                <Textarea
                  id="guarantees"
                  value={debtProfile.guarantees_provided}
                  onChange={(e) => setDebtProfile(prev => ({ ...prev, guarantees_provided: e.target.value }))}
                  rows={3}
                  placeholder="List any personal guarantees you have provided for business or other loans"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="financial_stability">Financial Stability Score (1-10)</Label>
                <Input
                  id="financial_stability"
                  type="number"
                  min="1"
                  max="10"
                  value={riskAssessment.financial_stability}
                  onChange={(e) => setRiskAssessment(prev => ({ ...prev, financial_stability: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="business_experience">Business Experience Score (1-10)</Label>
                <Input
                  id="business_experience"
                  type="number"
                  min="1"
                  max="10"
                  value={riskAssessment.business_experience}
                  onChange={(e) => setRiskAssessment(prev => ({ ...prev, business_experience: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="market_knowledge">Market Knowledge Score (1-10)</Label>
                <Input
                  id="market_knowledge"
                  type="number"
                  min="1"
                  max="10"
                  value={riskAssessment.market_knowledge}
                  onChange={(e) => setRiskAssessment(prev => ({ ...prev, market_knowledge: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="regulatory_compliance">Regulatory Compliance</Label>
                <Textarea
                  id="regulatory_compliance"
                  value={riskAssessment.regulatory_compliance}
                  onChange={(e) => setRiskAssessment(prev => ({ ...prev, regulatory_compliance: e.target.value }))}
                  rows={3}
                  placeholder="Describe your compliance with relevant regulations and any violations"
                />
              </div>

              <div>
                <Label htmlFor="operational_risks">Operational Risk Factors</Label>
                <Textarea
                  id="operational_risks"
                  value={riskAssessment.operational_risks}
                  onChange={(e) => setRiskAssessment(prev => ({ ...prev, operational_risks: e.target.value }))}
                  rows={3}
                  placeholder="Identify key operational risks in your business or investment approach"
                />
              </div>

              <div>
                <Label htmlFor="overall_risk_score">Overall Risk Score (300-850)</Label>
                <Input
                  id="overall_risk_score"
                  type="number"
                  min="300"
                  max="850"
                  value={riskAssessment.overall_risk_score}
                  onChange={(e) => setRiskAssessment(prev => ({ ...prev, overall_risk_score: e.target.value }))}
                />
                {riskAssessment.overall_risk_score && (
                  <div className="mt-2">
                    <span className="text-sm">
                      Risk Level: <span className={getRiskLevel(riskAssessment.overall_risk_score).color}>
                        {getRiskLevel(riskAssessment.overall_risk_score).level}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">KYC Verification</h4>
                    <p className="text-sm text-gray-600">Know Your Customer verification status</p>
                  </div>
                  <Badge className={getComplianceStatusColor(profile?.compliance_status || 'pending')}>
                    {profile?.compliance_status || 'Pending'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Financial Statements</h4>
                    <p className="text-sm text-gray-600">Audited financial statements verification</p>
                  </div>
                  <Badge className="bg-gray-100 text-gray-800">
                    Not Submitted
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Credit Report</h4>
                    <p className="text-sm text-gray-600">Third-party credit report verification</p>
                  </div>
                  <Badge className="bg-gray-100 text-gray-800">
                    Not Submitted
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">References</h4>
                    <p className="text-sm text-gray-600">Professional and financial references</p>
                  </div>
                  <Badge className="bg-gray-100 text-gray-800">
                    Not Submitted
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={saveProfile}>
          Save Due Diligence Profile
        </Button>
      </div>
    </div>
  );
}
