
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, Edit, Trash2, Plus, Search, Filter, AlertCircle, TrendingUp, Users, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DRBE, OpportunityType } from '@/lib/drbe';

// Opportunity interface matching the database schema
interface Opportunity {
  id: string;
  title: string;
  description: string;
  type: OpportunityType;
  status: string;
  equity_offered: number;
  target_amount: number;
  min_investment: number;
  max_investment?: number;
  location: string;
  industry: string;
  entrepreneur_id: string;
  currency: string;
  created_by: string;
  attachments: string[];
  created_at: string;
  updated_at: string;
  views: number;
  interested_investors: number;
}

// Database type for the opportunities table
interface DatabaseOpportunity {
  id: string;
  title: string;
  description: string;
  funding_type: 'equity' | 'debt' | 'convertible';
  business_stage: 'idea' | 'startup' | 'growth' | 'established' | 'expansion';
  status: string;
  equity_offered: number;
  target_amount: number;
  min_investment: number;
  max_investment?: number;
  location: string;
  industry: string;
  entrepreneur_id: string;
  created_at: string;
  updated_at: string;
  views: number;
  interested_investors: number;
  total_raised?: number;
  expected_return?: number;
  timeline?: number;
  website?: string;
  linkedin?: string;
  pitch_deck_url?: string;
  tags?: string[];
  use_of_funds?: string;
  founded_year?: number;
  team_size?: number;
  risk_score?: number;
  published_at?: string;
  closed_at?: string;
  metadata?: any;
}

const opportunityTypes: OpportunityType[] = ['going_concern', 'order_fulfillment', 'project_partnership'];
const opportunityStatuses = ['draft', 'pending', 'published', 'funded', 'closed', 'under_review'];

interface OpportunityManagementProps {
  userRole: 'admin' | 'entrepreneur';
  userId?: string;
}

export function OpportunityManagement({ userRole, userId }: OpportunityManagementProps) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [allOpportunities, setAllOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'going_concern' as OpportunityType,
    equity_offered: '',
    order_details: '',
    partner_roles: '',
    target_amount: 0,
    min_investment: 0,
    max_investment: 0,
    location: '',
    industry: '',
  });

  useEffect(() => {
    fetchOpportunities();
  }, [userRole, userId]);

  const convertDatabaseToOpportunity = (dbOpp: DatabaseOpportunity): Opportunity => {
    return {
      id: dbOpp.id,
      title: dbOpp.title,
      description: dbOpp.description,
      type: 'going_concern', // Default since database uses different funding_type
      status: dbOpp.status,
      equity_offered: dbOpp.equity_offered,
      target_amount: dbOpp.target_amount,
      min_investment: dbOpp.min_investment,
      max_investment: dbOpp.max_investment,
      location: dbOpp.location,
      industry: dbOpp.industry,
      entrepreneur_id: dbOpp.entrepreneur_id,
      currency: 'USD', // Default currency
      created_by: dbOpp.entrepreneur_id,
      attachments: [], // Default empty array
      created_at: dbOpp.created_at,
      updated_at: dbOpp.updated_at,
      views: dbOpp.views || 0,
      interested_investors: dbOpp.interested_investors || 0,
    };
  };

  const fetchOpportunities = async () => {
    try {
      setIsLoading(true);
      let query = supabase.from('opportunities').select('*');
      
      if (userRole === 'entrepreneur' && userId) {
        query = query.eq('entrepreneur_id', userId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching opportunities:', error);
        toast.error('Failed to load opportunities');
        return;
      }

      const convertedOpportunities = data?.map(convertDatabaseToOpportunity) || [];
      setOpportunities(convertedOpportunities);
      setAllOpportunities(convertedOpportunities);
    } catch (error) {
      console.error('Error in fetchOpportunities:', error);
      toast.error('Failed to load opportunities');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    filterOpportunities(term, filterStatus, filterType);
  };

  const handleStatusFilter = (status: string) => {
    setFilterStatus(status);
    filterOpportunities(searchTerm, status, filterType);
  };

  const handleTypeFilter = (type: string) => {
    setFilterType(type);
    filterOpportunities(searchTerm, filterStatus, type);
  };

  const filterOpportunities = (search: string, status: string, type: string) => {
    let filtered = allOpportunities;

    if (search) {
      filtered = filtered.filter(opp =>
        opp.title.toLowerCase().includes(search.toLowerCase()) ||
        opp.description.toLowerCase().includes(search.toLowerCase()) ||
        opp.industry.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status !== 'all') {
      filtered = filtered.filter(opp => opp.status === status);
    }

    if (type !== 'all') {
      filtered = filtered.filter(opp => opp.type === type);
    }

    setOpportunities(filtered);
  };

  const handleCreateOpportunity = async () => {
    if (!userId) {
      toast.error('User ID is required to create an opportunity');
      return;
    }

    const validation = DRBE.validateOpportunity({
      id: 'temp',
      title: formData.title,
      type: formData.type,
      status: 'draft',
      fields: {
        equity_offered: formData.equity_offered,
        order_details: formData.order_details,
        partner_roles: formData.partner_roles,
      }
    });

    if (!validation.valid) {
      toast.error(`Validation failed: ${validation.errors.join(', ')}`);
      return;
    }

    try {
      const newOpportunityData = {
        title: formData.title,
        description: formData.description,
        equity_offered: parseFloat(formData.equity_offered) || 0,
        target_amount: formData.target_amount,
        min_investment: formData.min_investment,
        max_investment: formData.max_investment || null,
        location: formData.location,
        industry: formData.industry,
        entrepreneur_id: userId,
        status: 'draft',
        funding_type: 'equity' as const,
        business_stage: 'startup' as const,
        views: 0,
        interested_investors: 0,
      };

      const { data, error } = await supabase
        .from('opportunities')
        .insert([newOpportunityData])
        .select()
        .single();

      if (error) {
        console.error('Error creating opportunity:', error);
        toast.error('Failed to create opportunity');
        return;
      }

      const newOpportunity = convertDatabaseToOpportunity(data);
      setOpportunities(prev => [newOpportunity, ...prev]);
      setAllOpportunities(prev => [newOpportunity, ...prev]);
      setIsCreateDialogOpen(false);
      resetFormData();
      toast.success('Opportunity created successfully');
    } catch (error) {
      console.error('Error in handleCreateOpportunity:', error);
      toast.error('Failed to create opportunity');
    }
  };

  const handleEditOpportunity = async () => {
    if (!selectedOpportunity) return;

    const validation = DRBE.validateOpportunity({
      id: selectedOpportunity.id,
      title: formData.title,
      type: formData.type,
      status: selectedOpportunity.status,
      fields: {
        equity_offered: formData.equity_offered,
        order_details: formData.order_details,
        partner_roles: formData.partner_roles,
      }
    });

    if (!validation.valid) {
      toast.error(`Validation failed: ${validation.errors.join(', ')}`);
      return;
    }

    try {
      const updateData = {
        title: formData.title,
        description: formData.description,
        equity_offered: parseFloat(formData.equity_offered) || 0,
        target_amount: formData.target_amount,
        min_investment: formData.min_investment,
        max_investment: formData.max_investment || null,
        location: formData.location,
        industry: formData.industry,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('opportunities')
        .update(updateData)
        .eq('id', selectedOpportunity.id);

      if (error) {
        console.error('Error updating opportunity:', error);
        toast.error('Failed to update opportunity');
        return;
      }

      // Update local state
      const updatedOpportunity = { ...selectedOpportunity, ...updateData };
      const convertedOpportunity = convertDatabaseToOpportunity(updatedOpportunity as any);
      
      setOpportunities(prev => prev.map(opp => 
        opp.id === selectedOpportunity.id ? convertedOpportunity : opp
      ));
      setAllOpportunities(prev => prev.map(opp => 
        opp.id === selectedOpportunity.id ? convertedOpportunity : opp
      ));
      
      setIsEditDialogOpen(false);
      setSelectedOpportunity(null);
      resetFormData();
      toast.success('Opportunity updated successfully');
    } catch (error) {
      console.error('Error in handleEditOpportunity:', error);
      toast.error('Failed to update opportunity');
    }
  };

  const handleDeleteOpportunity = async (opportunityId: string) => {
    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', opportunityId);

      if (error) {
        console.error('Error deleting opportunity:', error);
        toast.error('Failed to delete opportunity');
        return;
      }

      setOpportunities(prev => prev.filter(opp => opp.id !== opportunityId));
      setAllOpportunities(prev => prev.filter(opp => opp.id !== opportunityId));
      toast.success('Opportunity deleted successfully');
    } catch (error) {
      console.error('Error in handleDeleteOpportunity:', error);
      toast.error('Failed to delete opportunity');
    }
  };

  const handleStatusChange = async (opportunityId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('opportunities')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', opportunityId);

      if (error) {
        console.error('Error updating status:', error);
        toast.error('Failed to update status');
        return;
      }

      setOpportunities(prev => prev.map(opp =>
        opp.id === opportunityId ? { ...opp, status: newStatus } : opp
      ));
      setAllOpportunities(prev => prev.map(opp =>
        opp.id === opportunityId ? { ...opp, status: newStatus } : opp
      ));
      
      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error in handleStatusChange:', error);
      toast.error('Failed to update status');
    }
  };

  const resetFormData = () => {
    setFormData({
      title: '',
      description: '',
      type: 'going_concern',
      equity_offered: '',
      order_details: '',
      partner_roles: '',
      target_amount: 0,
      min_investment: 0,
      max_investment: 0,
      location: '',
      industry: '',
    });
  };

  const openEditDialog = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setFormData({
      title: opportunity.title,
      description: opportunity.description,
      type: opportunity.type,
      equity_offered: opportunity.equity_offered.toString(),
      order_details: '',
      partner_roles: '',
      target_amount: opportunity.target_amount,
      min_investment: opportunity.min_investment,
      max_investment: opportunity.max_investment || 0,
      location: opportunity.location,
      industry: opportunity.industry,
    });
    setIsEditDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'funded': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: opportunities.length,
    published: opportunities.filter(o => o.status === 'published').length,
    draft: opportunities.filter(o => o.status === 'draft').length,
    funded: opportunities.filter(o => o.status === 'funded').length,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {userRole === 'admin' ? 'All Opportunities' : 'My Opportunities'}
        </h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Opportunity
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium">Published</p>
                <p className="text-2xl font-bold text-green-600">{stats.published}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Edit className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium">Draft</p>
                <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium">Funded</p>
                <p className="text-2xl font-bold text-blue-600">{stats.funded}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search opportunities..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {opportunityStatuses.map(status => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={handleTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {opportunityTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Opportunities List */}
      <div className="grid gap-4">
        {opportunities.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating your first opportunity.'}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Opportunity
              </Button>
            </CardContent>
          </Card>
        ) : (
          opportunities.map((opportunity) => (
            <Card key={opportunity.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{opportunity.title}</h3>
                      <Badge className={getStatusColor(opportunity.status)}>
                        {opportunity.status}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-3 line-clamp-2">{opportunity.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span>Industry: {opportunity.industry}</span>
                      <span>Location: {opportunity.location}</span>
                      <span>Target: ${opportunity.target_amount.toLocaleString()}</span>
                      <span>Min Investment: ${opportunity.min_investment.toLocaleString()}</span>
                      <span>Views: {opportunity.views}</span>
                      <span>Interested: {opportunity.interested_investors}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(opportunity)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {userRole === 'admin' && (
                      <Select
                        value={opportunity.status}
                        onValueChange={(value) => handleStatusChange(opportunity.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {opportunityStatuses.map(status => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteOpportunity(opportunity.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Opportunity</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new investment opportunity.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter opportunity title"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your opportunity"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: OpportunityType) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {opportunityTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="e.g., Technology"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="target_amount">Target Amount ($)</Label>
                <Input
                  id="target_amount"
                  type="number"
                  value={formData.target_amount}
                  onChange={(e) => setFormData({ ...formData, target_amount: Number(e.target.value) })}
                  placeholder="500000"
                />
              </div>
              <div>
                <Label htmlFor="min_investment">Minimum Investment ($)</Label>
                <Input
                  id="min_investment"
                  type="number"
                  value={formData.min_investment}
                  onChange={(e) => setFormData({ ...formData, min_investment: Number(e.target.value) })}
                  placeholder="10000"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, Country"
                />
              </div>
              <div>
                <Label htmlFor="equity_offered">Equity Offered (%)</Label>
                <Input
                  id="equity_offered"
                  value={formData.equity_offered}
                  onChange={(e) => setFormData({ ...formData, equity_offered: e.target.value })}
                  placeholder="15"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateOpportunity}>
                Create Opportunity
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Opportunity</DialogTitle>
            <DialogDescription>
              Update the opportunity details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Same form fields as create dialog */}
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter opportunity title"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your opportunity"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: OpportunityType) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {opportunityTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-industry">Industry</Label>
                <Input
                  id="edit-industry"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="e.g., Technology"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-target_amount">Target Amount ($)</Label>
                <Input
                  id="edit-target_amount"
                  type="number"
                  value={formData.target_amount}
                  onChange={(e) => setFormData({ ...formData, target_amount: Number(e.target.value) })}
                  placeholder="500000"
                />
              </div>
              <div>
                <Label htmlFor="edit-min_investment">Minimum Investment ($)</Label>
                <Input
                  id="edit-min_investment"
                  type="number"
                  value={formData.min_investment}
                  onChange={(e) => setFormData({ ...formData, min_investment: Number(e.target.value) })}
                  placeholder="10000"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, Country"
                />
              </div>
              <div>
                <Label htmlFor="edit-equity_offered">Equity Offered (%)</Label>
                <Input
                  id="edit-equity_offered"
                  value={formData.equity_offered}
                  onChange={(e) => setFormData({ ...formData, equity_offered: e.target.value })}
                  placeholder="15"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditOpportunity}>
                Update Opportunity
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
