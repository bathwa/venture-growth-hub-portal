import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { DRBE, OpportunityType } from "@/lib/drbe";
import { getRiskScore } from "@/lib/ai";

const opportunityTypes = [
  { value: "going_concern", label: "Going Concern Private Equity Investment" },
  { value: "order_fulfillment", label: "Order Fulfillment Short Term Investment" },
  { value: "project_partnership", label: "Project Partnership Short Term Investment" },
];

export function CreateOpportunity() {
  const form = useForm({
    defaultValues: {
      title: "",
      type: "going_concern" as OpportunityType,
      equity_offered: "",
      order_details: "",
      partner_roles: "",
    },
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [riskScore, setRiskScore] = useState<number|null>(null);
  const [aiError, setAiError] = useState<string|null>(null);

  async function onSubmit(values: any) {
    // Build opportunity object for DRBE
    const opportunity = {
      title: values.title,
      type: values.type,
      status: 'draft',
      fields: {
        equity_offered: values.equity_offered,
        order_details: values.order_details,
        partner_roles: values.partner_roles,
      },
    };
    // DRBE validation
    const { valid, errors } = DRBE.validateOpportunity(opportunity);
    setValidationErrors(errors);
    if (!valid) return;
    // AI risk scoring
    try {
      // Example: use equity_offered as a feature (real model would use more)
      const input = [parseFloat(values.equity_offered) || 0];
      const score = await getRiskScore(input);
      setRiskScore(DRBE.validateAIOutput('risk_score', score));
      setAiError(null);
    } catch (e) {
      setAiError('AI risk scoring failed.');
    }
    // Here you would continue to submit to backend if needed
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Create New Opportunity</h2>
      <Card>
        <CardHeader>
          <CardTitle>Opportunity Creation</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Opportunity Title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {opportunityTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Conditional fields based on type */}
              {form.watch('type') === 'going_concern' && (
                <FormField
                  control={form.control}
                  name="equity_offered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Equity Offered (%)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {form.watch('type') === 'order_fulfillment' && (
                <FormField
                  control={form.control}
                  name="order_details"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Details</FormLabel>
                      <FormControl>
                        <Input placeholder="Order details" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {form.watch('type') === 'project_partnership' && (
                <FormField
                  control={form.control}
                  name="partner_roles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Partner Roles</FormLabel>
                      <FormControl>
                        <Input placeholder="Partner roles" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <Button type="submit">Validate & Score</Button>
            </form>
          </Form>
          {/* Show DRBE validation errors */}
          {validationErrors.length > 0 && (
            <div className="mt-4 text-red-600">
              <ul>
                {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          )}
          {/* Show AI risk score */}
          {riskScore !== null && (
            <div className="mt-4 text-blue-700 font-semibold">AI Risk Score: {riskScore.toFixed(2)}</div>
          )}
          {aiError && (
            <div className="mt-4 text-red-600">{aiError}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
