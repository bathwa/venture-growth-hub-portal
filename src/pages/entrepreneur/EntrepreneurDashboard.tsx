
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, DollarSign, Users, Eye, Plus } from "lucide-react";
import { useOpportunities } from "@/hooks/useOpportunities";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const EntrepreneurDashboard = () => {
  const { opportunities, loading: opportunitiesLoading } = useOpportunities();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvestments = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('investments')
          .select(`
            *,
            opportunities!inner (
              entrepreneur_id
            )
          `)
          .eq('opportunities.entrepreneur_id', user.id);

        if (error) throw error;
        setInvestments(data || []);
      } catch (err) {
        console.error('Error fetching investments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvestments();
  }, [user]);

  if (loading || opportunitiesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const myOpportunities = opportunities.filter(opp => opp.entrepreneurId === user?.id);
  const publishedOpportunities = myOpportunities.filter(opp => opp.status === 'published');
  const totalFundingRaised = myOpportunities.reduce((sum, opp) => sum + opp.totalRaised, 0);
  const totalViews = myOpportunities.reduce((sum, opp) => sum + opp.views, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Entrepreneur Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your opportunities and track investor interest</p>
        </div>
        <Button onClick={() => navigate('/entrepreneur/opportunities/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Opportunity
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalFundingRaised.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all opportunities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Opportunities</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedOpportunities.length}</div>
            <p className="text-xs text-muted-foreground">Currently published</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{investments.length}</div>
            <p className="text-xs text-muted-foreground">Across all opportunities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
            <p className="text-xs text-muted-foreground">Total opportunity views</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Opportunities</CardTitle>
            <CardDescription>Your published investment opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myOpportunities.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No opportunities created yet.</p>
                  <Button onClick={() => navigate('/entrepreneur/opportunities/create')}>
                    Create Your First Opportunity
                  </Button>
                </div>
              ) : (
                myOpportunities.slice(0, 5).map((opportunity) => (
                  <div key={opportunity.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{opportunity.title}</h3>
                      <p className="text-sm text-gray-600">{opportunity.industry} • {opportunity.location}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge 
                          className={
                            opportunity.status === 'published' ? 'bg-green-100 text-green-800' :
                            opportunity.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }
                        >
                          {opportunity.status}
                        </Badge>
                        <Badge variant="outline">{opportunity.views} views</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${opportunity.targetAmount.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Target</p>
                      <p className="text-sm text-green-600">${opportunity.totalRaised.toLocaleString()} raised</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Investments</CardTitle>
            <CardDescription>Latest investments in your opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {investments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No investments received yet.</p>
              ) : (
                investments.slice(0, 5).map((investment) => (
                  <div key={investment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Investment Received</h3>
                      <p className="text-sm text-gray-600">
                        Amount: ${Number(investment.amount).toLocaleString()}
                      </p>
                      <Badge 
                        className={
                          investment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          investment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }
                      >
                        {investment.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {new Date(investment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EntrepreneurDashboard;
