
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AppLayout } from '@/components/layout/AppLayout';
import { EntrepreneurSidebar } from '@/components/entrepreneur/EntrepreneurSidebar';
import { EntrepreneurHeader } from '@/components/entrepreneur/EntrepreneurHeader';
import { ArrowLeft, Save, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const opportunityTypes = [
  { value: 'going_concern', label: 'Going Concern' },
  { value: 'order_fulfillment', label: 'Order Fulfillment Partnership' },
  { value: 'project_partnership', label: 'Project Partnership' }
];

const businessStages = [
  { value: 'startup', label: 'Startup' },
  { value: 'seed', label: 'Seed' },
  { value: 'series_a', label: 'Series A' },
  { value: 'series_b', label: 'Series B' },
  { value: 'growth', label: 'Growth' },
  { value: 'mature', label: 'Mature' }
];

const fundingTypes = [
  { value: 'equity', label: 'Equity' },
  { value: 'debt', label: 'Debt' },
  { value: 'convertible', label: 'Convertible' },
  { value: 'revenue_share', label: 'Revenue Share' }
];

export default function CreateOpportunity() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    industry: '',
    location: '',
    business_stage: '',
    funding_type: '',
    target_amount: '',
    min_investment: '',
    max_investment: '',
    equity_offered: '',
    use_of_funds: '',
    website: '',
    linkedin: '',
    pitch_deck_url: '',
    founded_year: '',
    team_size: '',
    timeline: '',
    expected_return: '',
    tags: [] as string[],
    opportunity_type: 'going_concern'
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ 
      ...prev, 
      tags: prev.tags.filter(tag => tag !== tagToRemove) 
    }));
  };

  const saveDraft = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('opportunities')
        .insert([{
          ...formData,
          entrepreneur_id: user.id,
          target_amount: parseFloat(formData.target_amount) || 0,
          min_investment: parseFloat(formData.min_investment) || 0,
          max_investment: parseFloat(formData.max_investment) || null,
          equity_offered: parseFloat(formData.equity_offered) || 0,
          founded_year: parseInt(formData.founded_year) || null,
          team_size: parseInt(formData.team_size) || null,
          timeline: parseInt(formData.timeline) || null,
          expected_return: parseFloat(formData.expected_return) || null,
          status: 'draft'
        }]);

      if (error) throw error;

      toast.success('Opportunity saved as draft');
      navigate('/entrepreneur-dashboard');
    } catch (error) {
      toast.error('Failed to save opportunity');
      console.error('Error saving opportunity:', error);
    } finally {
      setLoading(false);
    }
  };

  const publishOpportunity = async () => {
    if (!user) return;
    
    // Basic validation
    if (!formData.title || !formData.description || !formData.target_amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('opportunities')
        .insert([{
          ...formData,
          entrepreneur_id: user.id,
          target_amount: parseFloat(formData.target_amount),
          min_investment: parseFloat(formData.min_investment) || 0,
          max_investment: parseFloat(formData.max_investment) || null,
          equity_offered: parseFloat(formData.equity_offered) || 0,
          founded_year: parseInt(formData.founded_year) || null,
          team_size: parseInt(formData.team_size) || null,
          timeline: parseInt(formData.timeline) || null,
          expected_return: parseFloat(formData.expected_return) || null,
          status: 'published',
          published_at: new Date().toISOString()
        }]);

      if (error) throw error;

      toast.success('Opportunity published successfully');
      navigate('/entrepreneur-dashboard');
    } catch (error) {
      toast.error('Failed to publish opportunity');
      console.error('Error publishing opportunity:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout
      sidebar={<EntrepreneurSidebar />}
      header={<EntrepreneurHeader />}
    >
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/entrepreneur-dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Create Investment Opportunity</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="financial">Financial Details</TabsTrigger>
            <TabsTrigger value="business">Business Info</TabsTrigger>
            <TabsTrigger value="additional">Additional Info</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="opportunity_type">Opportunity Type</Label>
                  <Select value={formData.opportunity_type} onValueChange={(value) => handleInputChange('opportunity_type', value)}>
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

                <div>
                  <Label htmlFor="title">Opportunity Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter a compelling title for your opportunity"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your business opportunity in detail..."
                    rows={6}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      value={formData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      placeholder="e.g., Technology, Healthcare, Finance"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="e.g., Bulawayo, Zimbabwe"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="business_stage">Business Stage</Label>
                    <Select value={formData.business_stage} onValueChange={(value) => handleInputChange('business_stage', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select business stage" />
                      </SelectTrigger>
                      <SelectContent>
                        {businessStages.map((stage) => (
                          <SelectItem key={stage.value} value={stage.value}>
                            {stage.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="funding_type">Funding Type</Label>
                    <Select value={formData.funding_type} onValueChange={(value) => handleInputChange('funding_type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select funding type" />
                      </SelectTrigger>
                      <SelectContent>
                        {fundingTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="target_amount">Target Investment Amount *</Label>
                  <Input
                    id="target_amount"
                    type="number"
                    step="0.01"
                    value={formData.target_amount}
                    onChange={(e) => handleInputChange('target_amount', e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="min_investment">Minimum Investment</Label>
                    <Input
                      id="min_investment"
                      type="number"
                      step="0.01"
                      value={formData.min_investment}
                      onChange={(e) => handleInputChange('min_investment', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_investment">Maximum Investment</Label>
                    <Input
                      id="max_investment"
                      type="number"
                      step="0.01"
                      value={formData.max_investment}
                      onChange={(e) => handleInputChange('max_investment', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="equity_offered">Equity Offered (%)</Label>
                    <Input
                      id="equity_offered"
                      type="number"
                      step="0.01"
                      value={formData.equity_offered}
                      onChange={(e) => handleInputChange('equity_offered', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expected_return">Expected Return (%)</Label>
                    <Input
                      id="expected_return"
                      type="number"
                      step="0.01"
                      value={formData.expected_return}
                      onChange={(e) => handleInputChange('expected_return', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="use_of_funds">Use of Funds</Label>
                  <Textarea
                    id="use_of_funds"
                    value={formData.use_of_funds}
                    onChange={(e) => handleInputChange('use_of_funds', e.target.value)}
                    placeholder="Explain how the investment will be used..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="business" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="founded_year">Founded Year</Label>
                    <Input
                      id="founded_year"
                      type="number"
                      value={formData.founded_year}
                      onChange={(e) => handleInputChange('founded_year', e.target.value)}
                      placeholder="2024"
                    />
                  </div>
                  <div>
                    <Label htmlFor="team_size">Team Size</Label>
                    <Input
                      id="team_size"
                      type="number"
                      value={formData.team_size}
                      onChange={(e) => handleInputChange('team_size', e.target.value)}
                      placeholder="5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="timeline">Timeline (months)</Label>
                    <Input
                      id="timeline"
                      type="number"
                      value={formData.timeline}
                      onChange={(e) => handleInputChange('timeline', e.target.value)}
                      placeholder="12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      type="url"
                      value={formData.linkedin}
                      onChange={(e) => handleInputChange('linkedin', e.target.value)}
                      placeholder="https://linkedin.com/company/example"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="pitch_deck_url">Pitch Deck URL</Label>
                  <Input
                    id="pitch_deck_url"
                    type="url"
                    value={formData.pitch_deck_url}
                    onChange={(e) => handleInputChange('pitch_deck_url', e.target.value)}
                    placeholder="https://drive.google.com/..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="additional" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder="Add tags (press Enter)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const target = e.target as HTMLInputElement;
                        addTag(target.value);
                        target.value = '';
                      }
                    }}
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Add relevant tags to help investors find your opportunity
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-8">
          <div className="flex gap-2">
            {activeTab !== 'basic' && (
              <Button
                variant="outline"
                onClick={() => {
                  const tabs = ['basic', 'financial', 'business', 'additional'];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex > 0) {
                    setActiveTab(tabs[currentIndex - 1]);
                  }
                }}
              >
                Previous
              </Button>
            )}
            {activeTab !== 'additional' && (
              <Button
                onClick={() => {
                  const tabs = ['basic', 'financial', 'business', 'additional'];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex < tabs.length - 1) {
                    setActiveTab(tabs[currentIndex + 1]);
                  }
                }}
              >
                Next
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={saveDraft}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Draft
            </Button>
            <Button
              onClick={publishOpportunity}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Publish Opportunity
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
