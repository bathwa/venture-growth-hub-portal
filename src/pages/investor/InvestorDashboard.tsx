
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DRBE, OpportunityType, OpportunityStatus, Milestone, MilestoneStatus } from "@/lib/drbe";
import { getRiskScore } from "@/lib/ai";
import { useState } from "react";

const mockOpportunities = [
  {
    id: "1",
    title: "Green Energy Startup",
    type: "going_concern" as OpportunityType,
    status: "published" as OpportunityStatus,
    fields: { equity_offered: "10" },
    milestones: [
      {
        title: "Product Development",
        target_date: new Date(Date.now() - 86400000 * 2).toISOString(),
        status: "pending" as MilestoneStatus,
        last_update: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        title: "Market Research",
        target_date: new Date(Date.now() + 86400000 * 3).toISOString(),
        status: "pending" as MilestoneStatus,
        last_update: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
  },
  {
    id: "2",
    title: "AI Healthcare Platform",
    type: "order_fulfillment" as OpportunityType,
    status: "published" as OpportunityStatus,
    fields: { order_details: "1000 units" },
    milestones: [
      {
        title: "Legal Review",
        target_date: new Date(Date.now() - 86400000 * 1).toISOString(),
        status: "completed" as MilestoneStatus,
        last_update: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
    ],
  },
];

const InvestorDashboard = () => {
  const [riskScores, setRiskScores] = useState<{ [id: string]: number | null }>({});
  const [validationErrors, setValidationErrors] = useState<{ [id: string]: string[] }>({});
  const [aiError, setAiError] = useState<string | null>(null);

  async function handleScore(opp: typeof mockOpportunities[0]) {
    const { valid, errors } = DRBE.validateOpportunity(opp);
    setValidationErrors((prev) => ({ ...prev, [opp.id]: errors }));
    if (!valid) return;
    const input = [parseFloat(opp.fields.equity_offered) || 0];
    const score = await getRiskScore(input);
    setRiskScores((prev) => ({ ...prev, [opp.id]: DRBE.validateAIOutput('risk_score', score) }));
    setAiError(null);
  }

  function getMilestoneStatus(milestone: Milestone): MilestoneStatus {
    return DRBE.evaluateMilestoneStatus(milestone);
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <div className="flex-1 p-6">
          <h1 className="text-3xl font-bold mb-6">Investor Dashboard</h1>
          <Card>
            <CardHeader>
              <CardTitle>Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockOpportunities.map((opp) => (
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
      </div>
    </SidebarProvider>
  );
};

export default InvestorDashboard;
