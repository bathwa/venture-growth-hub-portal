
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, DollarSign, PieChart, Activity } from "lucide-react";
import { useOpportunities } from "@/hooks/useOpportunities";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const InvestorDashboard = () => {
  const { opportunities, loading: opportunitiesLoading } = useOpportunities();
  const { user } = useAuth();
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
            opportunities (
              title,
              entrepreneur_id,
              target_amount,
              equity_offered
            )
          `)
          .eq('investor_id', user.id);

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

  const publishedOpportunities = opportunities.filter(opp => opp.status === 'published');
  const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const activeInvestments = investments.filter(inv => inv.status === 'completed').length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Investor Dashboard</h1>
        <p className="text-gray-600 mt-2">Track your investments and discover new opportunities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalInvested.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all investments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeInvestments}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Opportunities</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedOpportunities.length}</div>
            <p className="text-xs text-muted-foreground">Ready for investment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Diversity</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{investments.length}</div>
            <p className="text-xs text-muted-foreground">Total investments</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Opportunities</CardTitle>
            <CardDescription>Latest investment opportunities available</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {publishedOpportunities.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No opportunities available at the moment.</p>
              ) : (
                publishedOpportunities.slice(0, 5).map((opportunity) => (
                  <div key={opportunity.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{opportunity.title}</h3>
                      <p className="text-sm text-gray-600">{opportunity.industry} • {opportunity.location}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline">{opportunity.businessStage}</Badge>
                        <Badge variant="outline">{opportunity.equityOffered}% equity</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${opportunity.targetAmount.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Target</p>
                      <Button size="sm" className="mt-2">View Details</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Investments</CardTitle>
            <CardDescription>Your current investment portfolio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {investments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No investments yet. Start exploring opportunities!</p>
              ) : (
                investments.map((investment) => (
                  <div key={investment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{investment.opportunities?.title || 'Investment'}</h3>
                      <p className="text-sm text-gray-600">
                        Invested: ${Number(investment.amount).toLocaleString()}
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
                        {investment.equity_percentage && `${investment.equity_percentage}% equity`}
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

export default InvestorDashboard;
