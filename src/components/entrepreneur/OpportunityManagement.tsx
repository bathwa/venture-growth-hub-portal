import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DRBE, OpportunityType, OpportunityStatus } from "@/lib/drbe";
import { getRiskScore } from "@/lib/ai";
import { useState } from "react";

const mockOpportunities = [
  {
    id: 1,
    title: "Green Energy Startup",
    type: "going_concern" as OpportunityType,
    status: "published" as OpportunityStatus,
    fields: { equity_offered: "10" },
  },
  {
    id: 2,
    title: "AI Healthcare Platform",
    type: "order_fulfillment" as OpportunityType,
    status: "published" as OpportunityStatus,
    fields: { order_details: "1000 units" },
  },
  {
    id: 3,
    title: "Sustainable Fashion Brand",
    type: "project_partnership" as OpportunityType,
    status: "draft" as OpportunityStatus,
    fields: { partner_roles: "Designer, Marketer" },
  },
];

export function OpportunityManagement() {
  const [riskScores, setRiskScores] = useState<{ [id: number]: number | null }>({});
  const [validationErrors, setValidationErrors] = useState<{ [id: number]: string[] }>({});
  const [aiError, setAiError] = useState<string | null>(null);

  async function handleValidateAndScore(opp: typeof mockOpportunities[0]) {
    // DRBE validation
    const { valid, errors } = DRBE.validateOpportunity(opp);
    setValidationErrors((prev) => ({ ...prev, [opp.id]: errors }));
    if (!valid) return;
    // AI risk scoring
    try {
      const input = [parseFloat(opp.fields.equity_offered) || 0];
      const score = await getRiskScore(input);
      setRiskScores((prev) => ({ ...prev, [opp.id]: DRBE.validateAIOutput('risk_score', score) }));
      setAiError(null);
    } catch (e) {
      setAiError('AI risk scoring failed.');
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">My Opportunities</h2>
      <Card>
        <CardHeader>
          <CardTitle>Opportunity Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockOpportunities.map((opp) => (
              <div key={opp.id} className="p-4 border rounded-lg mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{opp.title}</h4>
                  <span className="text-xs px-2 py-1 rounded bg-gray-200">{opp.type}</span>
                </div>
                <div className="mb-2">Status: <span className="font-semibold">{opp.status}</span></div>
                <Button variant="outline" onClick={() => handleValidateAndScore(opp)}>
                  Validate & Score
                </Button>
                {/* Show DRBE validation errors */}
                {validationErrors[opp.id] && validationErrors[opp.id].length > 0 && (
                  <div className="mt-2 text-red-600">
                    <ul>
                      {validationErrors[opp.id].map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                  </div>
                )}
                {/* Show AI risk score */}
                {riskScores[opp.id] !== undefined && riskScores[opp.id] !== null && (
                  <div className="mt-2 text-blue-700 font-semibold">AI Risk Score: {riskScores[opp.id]?.toFixed(2)}</div>
                )}
                {aiError && (
                  <div className="mt-2 text-red-600">{aiError}</div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
