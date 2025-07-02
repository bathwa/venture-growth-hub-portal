
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PaymentRequestFormProps {
  investmentId?: string;
  milestoneId?: string;
  requestType: 'capital_request' | 'return_payment' | 'service_payment';
  onClose: () => void;
  onSuccess?: () => void;
}

export function PaymentRequestForm({
  investmentId,
  milestoneId,
  requestType,
  onClose,
  onSuccess
}: PaymentRequestFormProps) {
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    bank_name: '',
    account_name: '',
    account_number: '',
    routing_number: '',
    swift_code: '',
    additional_details: '',
    proof_of_payment_url: ''
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('payment_requests')
        .insert([{
          requester_id: user.id,
          investment_id: investmentId,
          milestone_id: milestoneId,
          amount: parseFloat(formData.amount),
          currency: formData.currency,
          request_type: requestType,
          banking_details: {
            bank_name: formData.bank_name,
            account_name: formData.account_name,
            account_number: formData.account_number,
            routing_number: formData.routing_number,
            swift_code: formData.swift_code,
            additional_details: formData.additional_details
          },
          proof_of_payment_url: formData.proof_of_payment_url || null
        }]);

      if (error) throw error;

      toast.success('Payment request submitted successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error('Failed to submit payment request');
      console.error('Error creating payment request:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRequestTypeTitle = () => {
    switch (requestType) {
      case 'capital_request':
        return 'Request Investment Capital';
      case 'return_payment':
        return 'Request Return Payment';
      case 'service_payment':
        return 'Request Service Payment';
      default:
        return 'Payment Request';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          {getRequestTypeTitle()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={formData.currency} onValueChange={(value) =>
                setFormData(prev => ({ ...prev, currency: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="ZWL">ZWL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Banking Details</h3>
            
            <div>
              <Label htmlFor="bank_name">Bank Name</Label>
              <Input
                id="bank_name"
                value={formData.bank_name}
                onChange={(e) => setFormData(prev => ({ ...prev, bank_name: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="account_name">Account Name</Label>
              <Input
                id="account_name"
                value={formData.account_name}
                onChange={(e) => setFormData(prev => ({ ...prev, account_name: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="account_number">Account Number</Label>
              <Input
                id="account_number"
                value={formData.account_number}
                onChange={(e) => setFormData(prev => ({ ...prev, account_number: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="routing_number">Routing Number</Label>
                <Input
                  id="routing_number"
                  value={formData.routing_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, routing_number: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="swift_code">SWIFT Code</Label>
                <Input
                  id="swift_code"
                  value={formData.swift_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, swift_code: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="additional_details">Additional Details</Label>
              <Textarea
                id="additional_details"
                value={formData.additional_details}
                onChange={(e) => setFormData(prev => ({ ...prev, additional_details: e.target.value }))}
                rows={3}
                placeholder="Any additional banking information or instructions..."
              />
            </div>
          </div>

          {requestType !== 'capital_request' && (
            <div>
              <Label htmlFor="proof_url">Proof of Payment URL (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="proof_url"
                  type="url"
                  placeholder="https://..."
                  value={formData.proof_of_payment_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, proof_of_payment_url: e.target.value }))}
                />
                <Button type="button" variant="outline" size="icon">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
