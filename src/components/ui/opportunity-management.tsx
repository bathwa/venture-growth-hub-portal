
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Upload, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DRBE, OpportunityType, OpportunityStatus } from '@/lib/drbe';
import { getRiskScore } from '@/lib/ai';

// Use the database schema types from Supabase
type DatabaseOpportunity = {
  id: string;
  title: string;
  description: string;
  industry: string;
  location: string;
  target_amount: number;
  equity_offered: number;
  min_investment: number;
  max_investment?: number;
  funding_type: 'equity' | 'debt' | 'convertible';
  business_stage: 'idea' | 'startup' | 'growth' | 'established' | 'expansion';
  status: 'draft' | 'published' | 'funded' | 'closed';
  use_of_funds?: string;
  website?: string;
  linkedin?: string;
  pitch_deck_url?: string;
  views: number;
  interested_investors: number;
  total_raised: number;
  risk_score?: number;
  expected_return?: number;
  timeline?: number;
  team_size?: number;
  founded_year?: number;
  tags?: string[];
  entrepreneur_id: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  closed_at?: string;
  metadata?: any;
};

// Map database opportunity to display opportunity
interface Opportunity {
  id: string;
  title: string;
  description: string;
  type: OpportunityType;
  status: OpportunityStatus;
  equity_offered?: string;
  order_details?: string;
  partner_roles?: string;
  target_amount: number;
  currency: string;
  location: string;
  industry: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  attachments: string[];
  risk_score?: number;
  views: number;
  interested_investors: number;
}

interface OpportunityManagementProps {
  userId: string;
  userRole: string;
  initialOpportunities?: Opportunity[];
  onOpportunityUpdate?: (opportunities: Opportunity[]) => void;
}

export function OpportunityManagement({
  userId,
  userRole,
  initialOpportunities = [],
  onOpportunityUpdate
}: OpportunityManagementProps) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(initialOpportunities);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [riskScore, setRiskScore] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'going_concern' as OpportunityType,
    equity_offered: '',
    order_details: '',
    partner_roles: '',
    target_amount: '',
    currency: 'USD',
    location: '',
    industry: ''
  });

  const opportunityTypes = [
    { value: "going_concern", label: "Going Concern Private Equity Investment" },
    { value: "order_fulfillment", label: "Order Fulfillment Short Term Investment" },
    { value: "project_partnership", label: "Project Partnership Short Term Investment" },
  ];

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Real Estate', 'Energy', 
    'Manufacturing', 'Retail', 'Education', 'Transportation', 'Other'
  ];

  // Map database opportunity to display format
  const mapDatabaseOpportunity = (dbOpp: DatabaseOpportunity): Opportunity => ({
    id: dbOpp.id,
    title: dbOpp.title,
    description: dbOpp.description,
    type: 'going_concern', // Default type for now
    status: dbOpp.status as OpportunityStatus,
    target_amount: dbOpp.target_amount,
    currency: 'USD', // Default currency
    location: dbOpp.location,
    industry: dbOpp.industry,
    created_by: dbOpp.entrepreneur_id,
    created_at: dbOpp.created_at,
    updated_at: dbOpp.updated_at,
    attachments: [], // Default empty array
    risk_score: dbOpp.risk_score,
    views: dbOpp.views,
    interested_investors: dbOpp.interested_investors,
    equity_offered: dbOpp.equity_offered.toString()
  });

  // Load opportunities from database
  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('entrepreneur_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading opportunities:', error);
        return;
      }

      if (data) {
        const mappedOpportunities = data.map(mapDatabaseOpportunity);
        setOpportunities(mappedOpportunities);
        onOpportunityUpdate?.(mappedOpportunities);
      }
    } catch (error) {
      console.error('Error loading opportunities:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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

  const handleCreate = async () => {
    setIsLoading(true);

    try {
      const isValid = await validateOpportunity();
      if (!isValid) {
        setIsLoading(false);
        return;
      }

      const newOpportunity = {
        title: formData.title,
        description: formData.description,
        industry: formData.industry,
        location: formData.location,
        target_amount: parseFloat(formData.target_amount) || 0,
        equity_offered: parseFloat(formData.equity_offered) || 0,
        min_investment: 1000, // Default minimum
        funding_type: 'equity' as const,
        business_stage: 'startup' as const,
        status: 'draft' as const,
        use_of_funds: formData.order_details || formData.partner_roles,
        website: '',
        entrepreneur_id: userId,
        views: 0,
        interested_investors: 0,
        total_raised: 0,
        risk_score: riskScore || undefined
      };

      const { data, error } = await supabase
        .from('opportunities')
        .insert(newOpportunity)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        const mappedOpportunity = mapDatabaseOpportunity(data);
        const updatedOpportunities = [mappedOpportunity, ...opportunities];
        setOpportunities(updatedOpportunities);
        onOpportunityUpdate?.(updatedOpportunities);
      }
      
      setIsCreating(false);
      resetForm();
      toast.success('Opportunity created successfully');
    } catch (error) {
      console.error('Create opportunity error:', error);
      toast.error('Failed to create opportunity');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'going_concern',
      equity_offered: '',
      order_details: '',
      partner_roles: '',
      target_amount: '',
      currency: 'USD',
      location: '',
      industry: ''
    });
    setAttachments([]);
    setValidationErrors([]);
    setRiskScore(null);
  };

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || opp.status === statusFilter;
    const matchesType = typeFilter === 'all' || opp.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: OpportunityStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'published': return 'bg-green-100 text-green-800';
      case 'funded': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: OpportunityType) => {
    return opportunityTypes.find(t => t.value === type)?.label || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Opportunity Management</h2>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Opportunity
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Opportunity</DialogTitle>
              <DialogDescription>
                Create a new investment opportunity with all required details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Opportunity title"
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
                  rows={3}
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
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => handleInputChange('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="ZAR">ZAR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="City, Country"
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
                    rows={2}
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
                    rows={2}
                  />
                </div>
              )}

              {validationErrors.length > 0 && (
                <div className="text-red-600">
                  <ul>
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
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Opportunity'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search opportunities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="funded">Funded</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opportunities Table */}
      <Card>
        <CardHeader>
          <CardTitle>Opportunities ({filteredOpportunities.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Target Amount</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOpportunities.map((opportunity) => (
                <TableRow key={opportunity.id}>
                  <TableCell className="font-medium">{opportunity.title}</TableCell>
                  <TableCell>{getTypeLabel(opportunity.type)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(opportunity.status)}>
                      {opportunity.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {opportunity.currency} {opportunity.target_amount.toLocaleString()}
                  </TableCell>
                  <TableCell>{opportunity.industry}</TableCell>
                  <TableCell>
                    {opportunity.risk_score ? opportunity.risk_score.toFixed(2) : 'N/A'}
                  </TableCell>
                  <TableCell>{opportunity.views}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
