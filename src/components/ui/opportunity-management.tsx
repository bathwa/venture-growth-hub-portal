import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Download, 
  Upload, 
  Save,
  Filter,
  Search,
  MoreVertical,
  ExternalLink
} from 'lucide-react';
import { 
  DRBE, 
  OpportunityType, 
  OpportunityStatus 
} from '@/lib/drbe';
import { getRiskScore } from '@/lib/ai';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/drbe';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { supabase } from '@/integrations/supabase/client';

interface OpportunityManagementProps {
  userId: string;
  userRole: string;
  className?: string;
}

interface DatabaseOpportunity {
  id: string;
  title: string;
  description: string;
  entrepreneur_id: string;
  target_amount: number;
  equity_offered: number;
  min_investment: number;
  max_investment?: number;
  funding_type: 'equity' | 'debt' | 'convertible_note' | 'revenue_sharing';
  business_stage: 'idea' | 'startup' | 'growth' | 'established' | 'expansion';
  status: 'draft' | 'pending' | 'published' | 'funded' | 'closed' | 'cancelled';
  location: string;
  industry: string;
  website?: string;
  linkedin?: string;
  pitch_deck_url?: string;
  use_of_funds?: string;
  expected_return?: number;
  timeline?: number;
  team_size?: number;
  founded_year?: number;
  tags?: string[];
  views: number;
  interested_investors: number;
  total_raised: number;
  risk_score?: number;
  published_at?: string;
  closed_at?: string;
  created_at: string;
  updated_at: string;
  metadata?: any;
}

interface Opportunity {
  id: string;
  title: string;
  description: string;
  type: OpportunityType;
  status: OpportunityStatus;
  target_amount: number;
  equity_offered: number;
  min_investment: number;
  max_investment?: number;
  location: string;
  industry: string;
  entrepreneur_id: string;
  currency: string;
  created_by: string;
  attachments: string[];
  website?: string;
  linkedin?: string;
  pitch_deck_url?: string;
  use_of_funds?: string;
  expected_return?: number;
  timeline?: number;
  team_size?: number;
  founded_year?: number;
  tags?: string[];
  views: number;
  interested_investors: number;
  total_raised: number;
  risk_score?: number;
  published_at?: string;
  closed_at?: string;
  created_at: string;
  updated_at: string;
  metadata?: any;
}

export default function OpportunityManagement({ userId, userRole }: OpportunityManagementProps) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const transformDatabaseOpportunity = (dbOpp: DatabaseOpportunity): Opportunity => {
    return {
      id: dbOpp.id,
      title: dbOpp.title,
      description: dbOpp.description,
      type: 'going_concern' as OpportunityType, // Default mapping
      status: dbOpp.status as OpportunityStatus,
      target_amount: dbOpp.target_amount,
      equity_offered: dbOpp.equity_offered,
      min_investment: dbOpp.min_investment,
      max_investment: dbOpp.max_investment,
      location: dbOpp.location,
      industry: dbOpp.industry,
      entrepreneur_id: dbOpp.entrepreneur_id,
      currency: 'USD', // Default currency
      created_by: dbOpp.entrepreneur_id,
      attachments: [], // Default empty array
      website: dbOpp.website,
      linkedin: dbOpp.linkedin,
      pitch_deck_url: dbOpp.pitch_deck_url,
      use_of_funds: dbOpp.use_of_funds,
      expected_return: dbOpp.expected_return,
      timeline: dbOpp.timeline,
      team_size: dbOpp.team_size,
      founded_year: dbOpp.founded_year,
      tags: dbOpp.tags,
      views: dbOpp.views,
      interested_investors: dbOpp.interested_investors,
      total_raised: dbOpp.total_raised,
      risk_score: dbOpp.risk_score,
      published_at: dbOpp.published_at,
      closed_at: dbOpp.closed_at,
      created_at: dbOpp.created_at,
      updated_at: dbOpp.updated_at,
      metadata: dbOpp.metadata
    };
  };

  const fetchOpportunities = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedData = (data || []).map(transformDatabaseOpportunity);
      setOpportunities(transformedData);
      setFilteredOpportunities(transformedData);
    } catch (err) {
      console.error('Error fetching opportunities:', err);
      setError('Failed to load opportunities');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [userId]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      const filtered = opportunities.filter(opp =>
        opp.title.toLowerCase().includes(query.toLowerCase()) ||
        opp.description.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredOpportunities(filtered);
    } else {
      setFilteredOpportunities(opportunities);
    }
  };

  const handleCreateOpportunity = async (formData: FormData) => {
    try {
      setIsSubmitting(true);
      
      const opportunityData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        equity_offered: parseFloat(formData.get('equity_offered') as string),
        target_amount: parseFloat(formData.get('target_amount') as string),
        min_investment: parseFloat(formData.get('min_investment') as string),
        max_investment: parseFloat(formData.get('max_investment') as string) || null,
        location: formData.get('location') as string,
        industry: formData.get('industry') as string,
        entrepreneur_id: userId,
        funding_type: 'equity' as const,
        business_stage: 'startup' as const,
        status: 'draft' as const,
        use_of_funds: formData.get('use_of_funds') as string,
        expected_return: parseFloat(formData.get('expected_return') as string) || null,
        timeline: parseInt(formData.get('timeline') as string) || null,
        team_size: parseInt(formData.get('team_size') as string) || null,
        founded_year: parseInt(formData.get('founded_year') as string) || null,
        website: formData.get('website') as string || null,
        linkedin: formData.get('linkedin') as string || null,
        views: 0,
        interested_investors: 0,
        total_raised: 0
      };

      const { data, error } = await supabase
        .from('opportunities')
        .insert([opportunityData])
        .select()
        .single();

      if (error) throw error;

      const newOpportunity = transformDatabaseOpportunity(data);
      setOpportunities(prev => [newOpportunity, ...prev]);
      setFilteredOpportunities(prev => [newOpportunity, ...prev]);
      setIsCreateModalOpen(false);
      toast.success('Opportunity created successfully!');
    } catch (err) {
      console.error('Error creating opportunity:', err);
      toast.error('Failed to create opportunity');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateOpportunity = async (id: string, updates: Partial<Opportunity>) => {
    try {
      const dbUpdates = {
        title: updates.title,
        description: updates.description,
        equity_offered: updates.equity_offered,
        target_amount: updates.target_amount,
        min_investment: updates.min_investment,
        max_investment: updates.max_investment,
        location: updates.location,
        industry: updates.industry,
        status: updates.status as 'draft' | 'pending' | 'published' | 'funded' | 'closed' | 'cancelled',
        use_of_funds: updates.use_of_funds,
        expected_return: updates.expected_return,
        timeline: updates.timeline,
        team_size: updates.team_size,
        founded_year: updates.founded_year,
        website: updates.website,
        linkedin: updates.linkedin,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('opportunities')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedOpportunity = transformDatabaseOpportunity(data);
      setOpportunities(prev => prev.map(opp => opp.id === id ? updatedOpportunity : opp));
      setFilteredOpportunities(prev => prev.map(opp => opp.id === id ? updatedOpportunity : opp));
      toast.success('Opportunity updated successfully!');
    } catch (err) {
      console.error('Error updating opportunity:', err);
      toast.error('Failed to update opportunity');
    }
  };

  const handleDeleteOpportunity = async (id: string) => {
    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setOpportunities(prev => prev.filter(opp => opp.id !== id));
      setFilteredOpportunities(prev => prev.filter(opp => opp.id !== id));
      toast.success('Opportunity deleted successfully!');
    } catch (err) {
      console.error('Error deleting opportunity:', err);
      toast.error('Failed to delete opportunity');
    }
  };

  const handleStatusChange = async (id: string, newStatus: OpportunityStatus) => {
    const statusMapping: Record<OpportunityStatus, 'draft' | 'pending' | 'published' | 'funded' | 'closed' | 'cancelled'> = {
      'draft': 'draft',
      'pending': 'pending', 
      'published': 'published',
      'funded': 'funded',
      'closed': 'closed',
      'under_review': 'pending'
    };

    await handleUpdateOpportunity(id, { status: newStatus });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">My Opportunities</h2>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          Create Opportunity
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-500" />
        <Input
          type="text"
          placeholder="Search opportunities..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full max-w-md"
        />
      </div>

      {isLoading ? (
        <p>Loading opportunities...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities.map((opportunity) => (
            <Card key={opportunity.id} className="bg-white shadow-md rounded-lg overflow-hidden">
              <CardHeader className="px-4 py-3">
                <CardTitle className="text-lg font-semibold">{opportunity.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-gray-600">
                  <p>{opportunity.description}</p>
                  <Separator className="my-2" />
                  <p>
                    <strong>Target:</strong> {formatCurrency(opportunity.target_amount, opportunity.currency)}
                  </p>
                  <p>
                    <strong>Equity Offered:</strong> {opportunity.equity_offered}%
                  </p>
                  <p>
                    <strong>Min. Investment:</strong> {formatCurrency(opportunity.min_investment, opportunity.currency)}
                  </p>
                  {opportunity.max_investment && (
                    <p>
                      <strong>Max. Investment:</strong> {formatCurrency(opportunity.max_investment, opportunity.currency)}
                    </p>
                  )}
                  <p>
                    <strong>Location:</strong> {opportunity.location}
                  </p>
                  <p>
                    <strong>Industry:</strong> {opportunity.industry}
                  </p>
                  <p>
                    <strong>Status:</strong> {opportunity.status}
                  </p>
                </div>
                <div className="flex justify-end mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedOpportunity(opportunity);
                      setIsEditModalOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteOpportunity(opportunity.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Opportunity Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Opportunity</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new investment opportunity.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              await handleCreateOpportunity(formData);
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" type="text" required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="equity_offered">Equity Offered (%)</Label>
                <Input
                  id="equity_offered"
                  name="equity_offered"
                  type="number"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <Label htmlFor="target_amount">Target Amount</Label>
                <Input
                  id="target_amount"
                  name="target_amount"
                  type="number"
                  step="0.01"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min_investment">Min. Investment</Label>
                <Input
                  id="min_investment"
                  name="min_investment"
                  type="number"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <Label htmlFor="max_investment">Max. Investment (Optional)</Label>
                <Input
                  id="max_investment"
                  name="max_investment"
                  type="number"
                  step="0.01"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" type="text" required />
            </div>
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input id="industry" name="industry" type="text" required />
            </div>
             <div>
              <Label htmlFor="use_of_funds">Use of Funds</Label>
              <Textarea id="use_of_funds" name="use_of_funds" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expected_return">Expected Return (%)</Label>
                <Input
                  id="expected_return"
                  name="expected_return"
                  type="number"
                  step="0.01"
                />
              </div>
              <div>
                <Label htmlFor="timeline">Timeline (Months)</Label>
                <Input
                  id="timeline"
                  name="timeline"
                  type="number"
                  step="1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="team_size">Team Size</Label>
                <Input
                  id="team_size"
                  name="team_size"
                  type="number"
                  step="1"
                />
              </div>
              <div>
                <Label htmlFor="founded_year">Founded Year</Label>
                <Input
                  id="founded_year"
                  name="founded_year"
                  type="number"
                  step="1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input id="website" name="website" type="url" />
            </div>
            <div>
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input id="linkedin" name="linkedin" type="url" />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Opportunity"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Opportunity Modal */}
      <Dialog open={isEditModalOpen && selectedOpportunity !== null} onOpenChange={() => setIsEditModalOpen(false)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Opportunity</DialogTitle>
            <DialogDescription>
              Edit the details of the selected investment opportunity.
            </DialogDescription>
          </DialogHeader>
          {selectedOpportunity && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const updates = {
                  title: formData.get('title') as string,
                  description: formData.get('description') as string,
                  equity_offered: parseFloat(formData.get('equity_offered') as string),
                  target_amount: parseFloat(formData.get('target_amount') as string),
                  min_investment: parseFloat(formData.get('min_investment') as string),
                  max_investment: parseFloat(formData.get('max_investment') as string) || undefined,
                  location: formData.get('location') as string,
                  industry: formData.get('industry') as string,
                  use_of_funds: formData.get('use_of_funds') as string,
                  expected_return: parseFloat(formData.get('expected_return') as string) || undefined,
                  timeline: parseInt(formData.get('timeline') as string) || undefined,
                  team_size: parseInt(formData.get('team_size') as string) || undefined,
                  founded_year: parseInt(formData.get('founded_year') as string) || undefined,
                  website: formData.get('website') as string || undefined,
                  linkedin: formData.get('linkedin') as string || undefined,
                };
                await handleUpdateOpportunity(selectedOpportunity.id, updates as any);
                setIsEditModalOpen(false);
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  defaultValue={selectedOpportunity.title}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={selectedOpportunity.description}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="equity_offered">Equity Offered (%)</Label>
                  <Input
                    id="equity_offered"
                    name="equity_offered"
                    type="number"
                    step="0.01"
                    defaultValue={selectedOpportunity.equity_offered}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="target_amount">Target Amount</Label>
                  <Input
                    id="target_amount"
                    name="target_amount"
                    type="number"
                    step="0.01"
                    defaultValue={selectedOpportunity.target_amount}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min_investment">Min. Investment</Label>
                  <Input
                    id="min_investment"
                    name="min_investment"
                    type="number"
                    step="0.01"
                    defaultValue={selectedOpportunity.min_investment}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="max_investment">Max. Investment (Optional)</Label>
                  <Input
                    id="max_investment"
                    name="max_investment"
                    type="number"
                    step="0.01"
                    defaultValue={selectedOpportunity.max_investment || ""}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  type="text"
                  defaultValue={selectedOpportunity.location}
                  required
                />
              </div>
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  name="industry"
                  type="text"
                  defaultValue={selectedOpportunity.industry}
                  required
                />
              </div>
              <div>
                <Label htmlFor="use_of_funds">Use of Funds</Label>
                <Textarea
                  id="use_of_funds"
                  name="use_of_funds"
                  defaultValue={selectedOpportunity.use_of_funds || ""}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expected_return">Expected Return (%)</Label>
                  <Input
                    id="expected_return"
                    name="expected_return"
                    type="number"
                    step="0.01"
                    defaultValue={selectedOpportunity.expected_return || ""}
                  />
                </div>
                <div>
                  <Label htmlFor="timeline">Timeline (Months)</Label>
                  <Input
                    id="timeline"
                    name="timeline"
                    type="number"
                    step="1"
                    defaultValue={selectedOpportunity.timeline || ""}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="team_size">Team Size</Label>
                  <Input
                    id="team_size"
                    name="team_size"
                    type="number"
                    step="1"
                    defaultValue={selectedOpportunity.team_size || ""}
                  />
                </div>
                <div>
                  <Label htmlFor="founded_year">Founded Year</Label>
                  <Input
                    id="founded_year"
                    name="founded_year"
                    type="number"
                    step="1"
                    defaultValue={selectedOpportunity.founded_year || ""}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  defaultValue={selectedOpportunity.website || ""}
                />
              </div>
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  name="linkedin"
                  type="url"
                  defaultValue={selectedOpportunity.linkedin || ""}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Opportunity"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
