
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { DRBE, OpportunityType, OpportunityStatus } from '@/lib/drbe';
import { getRiskScore } from '@/lib/ai';

export function CreateOpportunity() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'going_concern' as OpportunityType,
    equity_offered: '',
    order_details: '',
    partner_roles: '',
    target_amount: '',
    location: '',
    industry: ''
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [riskScore, setRiskScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const opportunityTypes = [
    { value: "going_concern", label: "Going Concern Private Equity Investment" },
    { value: "order_fulfillment", label: "Order Fulfillment Short Term Investment" },
    { value: "project_partnership", label: "Project Partnership Short Term Investment" },
  ];

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Real Estate', 'Energy', 
    'Manufacturing', 'Retail', 'Education', 'Transportation', 'Other'
  ];

  const validateOpportunity = async () => {
    const opportunity = {
      id: 'temp',
      title: formData.title,
      type: formData.type,
      status: 'draft' as OpportunityStatus,
      fields: {
        equity_offered: formData.equity_offered,
        order_details: formData.order_details,
        partner_roles: formData.partner_roles,
      },
    };

    // DRBE validation
    const { valid, errors } = DRBE.validateOpportunity(opportunity);
    setValidationErrors(errors);

    if (!valid) return false;

    // AI risk scoring
    try {
      const input = [parseFloat(formData.equity_offered) || 0];
      const score = await getRiskScore(input);
      const validatedScore = DRBE.validateAIOutput('risk_score', score);
      setRiskScore(validatedScore);
      return true;
    } catch (e) {
      toast.error('AI risk scoring failed');
      return false;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const isValid = await validateOpportunity();
      if (!isValid) {
        setIsLoading(false);
        return;
      }

      // TODO: Submit to database
      console.log('Creating opportunity:', formData);
      toast.success('Opportunity created successfully');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        type: 'going_concern',
        equity_offered: '',
        order_details: '',
        partner_roles: '',
        target_amount: '',
        location: '',
        industry: ''
      });
      setValidationErrors([]);
      setRiskScore(null);
    } catch (error) {
      console.error('Error creating opportunity:', error);
      toast.error('Failed to create opportunity');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Opportunity</CardTitle>
          <CardDescription>
            Create a new investment opportunity for potential investors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Opportunity title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {opportunityTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Detailed description of the opportunity"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="target_amount">Target Amount</Label>
                <Input
                  id="target_amount"
                  type="number"
                  value={formData.target_amount}
                  onChange={(e) => handleInputChange('target_amount', e.target.value)}
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => handleInputChange('industry', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, Country"
                required
              />
            </div>

            {/* Conditional fields based on type */}
            {formData.type === 'going_concern' && (
              <div>
                <Label htmlFor="equity_offered">Equity Offered (%)</Label>
                <Input
                  id="equity_offered"
                  type="number"
                  value={formData.equity_offered}
                  onChange={(e) => handleInputChange('equity_offered', e.target.value)}
                  placeholder="e.g. 10"
                  min="0"
                  max="100"
                />
              </div>
            )}

            {formData.type === 'order_fulfillment' && (
              <div>
                <Label htmlFor="order_details">Order Details</Label>
                <Textarea
                  id="order_details"
                  value={formData.order_details}
                  onChange={(e) => handleInputChange('order_details', e.target.value)}
                  placeholder="Order details and requirements"
                  rows={3}
                />
              </div>
            )}

            {formData.type === 'project_partnership' && (
              <div>
                <Label htmlFor="partner_roles">Partner Roles</Label>
                <Textarea
                  id="partner_roles"
                  value={formData.partner_roles}
                  onChange={(e) => handleInputChange('partner_roles', e.target.value)}
                  placeholder="Define partner roles and responsibilities"
                  rows={3}
                />
              </div>
            )}

            {validationErrors.length > 0 && (
              <div className="text-red-600 space-y-1">
                <p className="font-semibold">Validation Errors:</p>
                <ul className="list-disc list-inside">
                  {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              </div>
            )}

            {riskScore !== null && (
              <div className="text-blue-700 font-semibold">
                AI Risk Score: {riskScore.toFixed(2)}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  setFormData({
                    title: '',
                    description: '',
                    type: 'going_concern',
                    equity_offered: '',
                    order_details: '',
                    partner_roles: '',
                    target_amount: '',
                    location: '',
                    industry: ''
                  });
                  setValidationErrors([]);
                  setRiskScore(null);
                }}
              >
                Reset
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Opportunity'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
