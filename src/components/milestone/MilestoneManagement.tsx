
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Milestone {
  id: string;
  opportunity_id: string;
  title: string;
  description: string;
  due_date: string;
  status: string;
  completion_criteria: string;
  completed_at: string | null;
  completed_by: string | null;
  created_at: string;
}

interface MilestoneTemplate {
  id: string;
  milestone_name: string;
  description: string;
  suggested_timeline_days: number;
  is_payment_trigger: boolean;
}

const statusColors = {
  'pending': 'bg-yellow-100 text-yellow-800',
  'in_progress': 'bg-blue-100 text-blue-800',
  'completed': 'bg-green-100 text-green-800',
  'overdue': 'bg-red-100 text-red-800'
};

const statusIcons = {
  'pending': Clock,
  'in_progress': Clock,
  'completed': CheckCircle,
  'overdue': AlertCircle
};

export function MilestoneManagement({ opportunityId }: { opportunityId: string }) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [templates, setTemplates] = useState<MilestoneTemplate[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: null as Date | null,
    completion_criteria: '',
    template_id: ''
  });

  useEffect(() => {
    if (opportunityId) {
      fetchMilestones();
      fetchTemplates();
    }
  }, [opportunityId]);

  const fetchMilestones = async () => {
    try {
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .eq('opportunity_id', opportunityId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setMilestones(data || []);
    } catch (error) {
      console.error('Error fetching milestones:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data } = await supabase
        .from('milestone_templates')
        .select('*')
        .order('milestone_name');

      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        title: template.milestone_name,
        description: template.description || '',
        template_id: templateId,
        due_date: template.suggested_timeline_days 
          ? new Date(Date.now() + template.suggested_timeline_days * 24 * 60 * 60 * 1000)
          : null
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.due_date) return;

    try {
      const { error } = await supabase
        .from('milestones')
        .insert([{
          opportunity_id: opportunityId,
          title: formData.title,
          description: formData.description,
          due_date: formData.due_date.toISOString(),
          completion_criteria: formData.completion_criteria,
          status: 'pending'
        }]);

      if (error) throw error;

      toast.success('Milestone created successfully');
      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        due_date: null,
        completion_criteria: '',
        template_id: ''
      });
      await fetchMilestones();
    } catch (error) {
      toast.error('Failed to create milestone');
      console.error('Error creating milestone:', error);
    }
  };

  const updateMilestoneStatus = async (milestoneId: string, status: string) => {
    try {
      const updates: any = { status };
      
      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
        updates.completed_by = user?.id;
      }

      const { error } = await supabase
        .from('milestones')
        .update(updates)
        .eq('id', milestoneId);

      if (error) throw error;

      toast.success('Milestone updated successfully');
      await fetchMilestones();
    } catch (error) {
      toast.error('Failed to update milestone');
      console.error('Error updating milestone:', error);
    }
  };

  if (loading) {
    return <div>Loading milestones...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Milestones</h2>
        <Button onClick={() => setShowCreateForm(true)}>
          Add Milestone
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Milestone</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Use Template (Optional)</Label>
                <Select value={formData.template_id} onValueChange={applyTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a milestone template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.milestone_name}
                        {template.is_payment_trigger && (
                          <Badge variant="secondary" className="ml-2">Payment</Badge>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div>
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.due_date ? format(formData.due_date, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.due_date}
                      onSelect={(date) => setFormData(prev => ({ ...prev, due_date: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="criteria">Completion Criteria</Label>
                <Textarea
                  id="criteria"
                  value={formData.completion_criteria}
                  onChange={(e) => setFormData(prev => ({ ...prev, completion_criteria: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">Create Milestone</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {milestones.map((milestone) => {
          const StatusIcon = statusIcons[milestone.status as keyof typeof statusIcons];
          const dueDate = new Date(milestone.due_date);
          const isOverdue = dueDate < new Date() && milestone.status !== 'completed';
          const effectiveStatus = isOverdue ? 'overdue' : milestone.status;

          return (
            <Card key={milestone.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <StatusIcon className="h-5 w-5 mt-1" />
                    <div>
                      <CardTitle className="text-lg">{milestone.title}</CardTitle>
                      {milestone.description && (
                        <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                      )}
                    </div>
                  </div>
                  <Badge className={statusColors[effectiveStatus as keyof typeof statusColors]}>
                    {effectiveStatus.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <p>Due: {format(dueDate, 'PPP')}</p>
                    {milestone.completion_criteria && (
                      <p className="mt-1">Criteria: {milestone.completion_criteria}</p>
                    )}
                    {milestone.completed_at && (
                      <p className="mt-1 text-green-600">
                        Completed: {format(new Date(milestone.completed_at), 'PPP')}
                      </p>
                    )}
                  </div>
                  
                  {milestone.status !== 'completed' && (
                    <div className="flex gap-2">
                      {milestone.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateMilestoneStatus(milestone.id, 'in_progress')}
                        >
                          Start
                        </Button>
                      )}
                      {milestone.status === 'in_progress' && (
                        <Button
                          size="sm"
                          onClick={() => updateMilestoneStatus(milestone.id, 'completed')}
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {milestones.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No milestones created yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
