
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useServiceRequests } from '@/hooks/useServiceRequests';
import { toast } from 'sonner';

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
}

interface ServiceRequestFormProps {
  associatedEntityId?: string;
  associatedEntityType?: 'opportunity' | 'investment' | 'pool';
  onClose: () => void;
  onSuccess?: () => void;
}

export function ServiceRequestForm({ 
  associatedEntityId, 
  associatedEntityType, 
  onClose, 
  onSuccess 
}: ServiceRequestFormProps) {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [formData, setFormData] = useState({
    service_category_id: '',
    scope_description: '',
    deliverables: [''],
    start_date: null as Date | null,
    end_date: null as Date | null,
    proposed_budget: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { createServiceRequest } = useServiceRequests();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from('service_categories')
        .select('*')
        .eq('is_active', true);
      
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const addDeliverable = () => {
    setFormData(prev => ({
      ...prev,
      deliverables: [...prev.deliverables, '']
    }));
  };

  const removeDeliverable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index)
    }));
  };

  const updateDeliverable = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.map((item, i) => i === index ? value : item)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createServiceRequest({
        associated_entity_id: associatedEntityId,
        associated_entity_type: associatedEntityType,
        service_category_id: formData.service_category_id || undefined,
        scope_description: formData.scope_description,
        deliverables: formData.deliverables.filter(d => d.trim()),
        start_date: formData.start_date?.toISOString().split('T')[0],
        end_date: formData.end_date?.toISOString().split('T')[0],
        proposed_budget: formData.proposed_budget ? parseFloat(formData.proposed_budget) : undefined
      });

      toast.success('Service request created successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error('Failed to create service request');
      console.error('Error creating service request:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Service Request</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="category">Service Category</Label>
            <Select value={formData.service_category_id} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, service_category_id: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select a service category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="scope">Scope Description</Label>
            <Textarea
              id="scope"
              placeholder="Describe the work you need done..."
              value={formData.scope_description}
              onChange={(e) => setFormData(prev => ({ ...prev, scope_description: e.target.value }))}
              rows={4}
              required
            />
          </div>

          <div>
            <Label>Deliverables</Label>
            {formData.deliverables.map((deliverable, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  placeholder="Expected deliverable"
                  value={deliverable}
                  onChange={(e) => updateDeliverable(index, e.target.value)}
                />
                {formData.deliverables.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeDeliverable(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addDeliverable}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Deliverable
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.start_date ? format(formData.start_date, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.start_date}
                    onSelect={(date) => setFormData(prev => ({ ...prev, start_date: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.end_date ? format(formData.end_date, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.end_date}
                    onSelect={(date) => setFormData(prev => ({ ...prev, end_date: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <Label htmlFor="budget">Proposed Budget (Optional)</Label>
            <Input
              id="budget"
              type="number"
              step="0.01"
              placeholder="Enter budget amount"
              value={formData.proposed_budget}
              onChange={(e) => setFormData(prev => ({ ...prev, proposed_budget: e.target.value }))}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Request'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
