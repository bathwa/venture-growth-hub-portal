
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, FileText, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Negotiation {
  id: string;
  opportunity_id: string;
  investor_id: string;
  entrepreneur_id: string;
  terms: any;
  status: string;
  expires_at: string | null;
  created_at: string;
}

interface NegotiationMessage {
  id: string;
  sender_id: string;
  message: string;
  proposed_changes: any;
  created_at: string;
  users: {
    name: string;
  };
}

export function NegotiationInterface({ 
  opportunityId, 
  negotiationId 
}: { 
  opportunityId: string;
  negotiationId?: string;
}) {
  const [negotiation, setNegotiation] = useState<Negotiation | null>(null);
  const [messages, setMessages] = useState<NegotiationMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [terms, setTerms] = useState({
    investment_amount: '',
    equity_percentage: '',
    valuation: '',
    board_seats: '',
    liquidation_preference: '',
    anti_dilution: '',
    exclusivity_period: '',
    due_diligence_period: '',
    closing_conditions: ''
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (negotiationId) {
      fetchNegotiation();
      fetchMessages();
    }
  }, [negotiationId]);

  const fetchNegotiation = async () => {
    if (!negotiationId) return;

    try {
      const { data, error } = await supabase
        .from('negotiations')
        .select('*')
        .eq('id', negotiationId)
        .single();

      if (error) throw error;
      
      setNegotiation(data);
      setTerms(data.terms || {});
    } catch (error) {
      console.error('Error fetching negotiation:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!negotiationId) return;

    try {
      const { data, error } = await supabase
        .from('negotiation_messages')
        .select(`
          *,
          users (name)
        `)
        .eq('negotiation_id', negotiationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !negotiationId || !newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('negotiation_messages')
        .insert([{
          negotiation_id: negotiationId,
          sender_id: user.id,
          message: newMessage,
          proposed_changes: null
        }]);

      if (error) throw error;

      setNewMessage('');
      await fetchMessages();
      toast.success('Message sent');
    } catch (error) {
      toast.error('Failed to send message');
      console.error('Error sending message:', error);
    }
  };

  const proposeTerms = async () => {
    if (!user || !negotiationId) return;

    try {
      const { error: messageError } = await supabase
        .from('negotiation_messages')
        .insert([{
          negotiation_id: negotiationId,
          sender_id: user.id,
          message: 'Proposed new terms',
          proposed_changes: terms
        }]);

      if (messageError) throw messageError;

      await fetchMessages();
      toast.success('Terms proposed');
    } catch (error) {
      toast.error('Failed to propose terms');
      console.error('Error proposing terms:', error);
    }
  };

  const acceptNegotiation = async () => {
    if (!negotiationId) return;

    try {
      const { error } = await supabase
        .from('negotiations')
        .update({ 
          status: 'accepted',
          terms: terms
        })
        .eq('id', negotiationId);

      if (error) throw error;

      await fetchNegotiation();
      toast.success('Negotiation accepted');
    } catch (error) {
      toast.error('Failed to accept negotiation');
      console.error('Error accepting negotiation:', error);
    }
  };

  if (loading) {
    return <div>Loading negotiation...</div>;
  }

  if (!negotiation) {
    return <div>Negotiation not found</div>;
  }

  const statusColors = {
    'active': 'bg-blue-100 text-blue-800',
    'accepted': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'expired': 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Investment Negotiation</CardTitle>
            <Badge className={statusColors[negotiation.status as keyof typeof statusColors]}>
              {negotiation.status.toUpperCase()}
            </Badge>
          </div>
          {negotiation.expires_at && (
            <p className="text-sm text-gray-600">
              <Clock className="inline h-4 w-4 mr-1" />
              Expires: {new Date(negotiation.expires_at).toLocaleDateString()}
            </p>
          )}
        </CardHeader>
      </Card>

      <Tabs defaultValue="terms" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="terms">
            <FileText className="h-4 w-4 mr-2" />
            Terms
          </TabsTrigger>
          <TabsTrigger value="messages">
            <MessageSquare className="h-4 w-4 mr-2" />
            Messages ({messages.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="terms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Investment Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="investment_amount">Investment Amount</Label>
                  <Input
                    id="investment_amount"
                    type="number"
                    value={terms.investment_amount}
                    onChange={(e) => setTerms(prev => ({ ...prev, investment_amount: e.target.value }))}
                    disabled={negotiation.status !== 'active'}
                  />
                </div>
                <div>
                  <Label htmlFor="equity_percentage">Equity Percentage</Label>
                  <Input
                    id="equity_percentage"
                    type="number"
                    step="0.01"
                    value={terms.equity_percentage}
                    onChange={(e) => setTerms(prev => ({ ...prev, equity_percentage: e.target.value }))}
                    disabled={negotiation.status !== 'active'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valuation">Pre-Money Valuation</Label>
                  <Input
                    id="valuation"
                    type="number"
                    value={terms.valuation}
                    onChange={(e) => setTerms(prev => ({ ...prev, valuation: e.target.value }))}
                    disabled={negotiation.status !== 'active'}
                  />
                </div>
                <div>
                  <Label htmlFor="board_seats">Board Seats</Label>
                  <Input
                    id="board_seats"
                    type="number"
                    value={terms.board_seats}
                    onChange={(e) => setTerms(prev => ({ ...prev, board_seats: e.target.value }))}
                    disabled={negotiation.status !== 'active'}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="liquidation_preference">Liquidation Preference</Label>
                <Input
                  id="liquidation_preference"
                  value={terms.liquidation_preference}
                  onChange={(e) => setTerms(prev => ({ ...prev, liquidation_preference: e.target.value }))}
                  disabled={negotiation.status !== 'active'}
                />
              </div>

              <div>
                <Label htmlFor="anti_dilution">Anti-Dilution Protection</Label>
                <Input
                  id="anti_dilution"
                  value={terms.anti_dilution}
                  onChange={(e) => setTerms(prev => ({ ...prev, anti_dilution: e.target.value }))}
                  disabled={negotiation.status !== 'active'}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="exclusivity_period">Exclusivity Period (days)</Label>
                  <Input
                    id="exclusivity_period"
                    type="number"
                    value={terms.exclusivity_period}
                    onChange={(e) => setTerms(prev => ({ ...prev, exclusivity_period: e.target.value }))}
                    disabled={negotiation.status !== 'active'}
                  />
                </div>
                <div>
                  <Label htmlFor="due_diligence_period">Due Diligence Period (days)</Label>
                  <Input
                    id="due_diligence_period"
                    type="number"
                    value={terms.due_diligence_period}
                    onChange={(e) => setTerms(prev => ({ ...prev, due_diligence_period: e.target.value }))}
                    disabled={negotiation.status !== 'active'}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="closing_conditions">Closing Conditions</Label>
                <Textarea
                  id="closing_conditions"
                  value={terms.closing_conditions}
                  onChange={(e) => setTerms(prev => ({ ...prev, closing_conditions: e.target.value }))}
                  rows={3}
                  disabled={negotiation.status !== 'active'}
                />
              </div>

              {negotiation.status === 'active' && (
                <div className="flex gap-2">
                  <Button onClick={proposeTerms}>
                    Propose Terms
                  </Button>
                  <Button onClick={acceptNegotiation} variant="outline">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept Terms
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Negotiation Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-lg ${
                      message.sender_id === user?.id
                        ? 'bg-blue-100 ml-8'
                        : 'bg-gray-100 mr-8'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">
                        {message.users.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm">{message.message}</p>
                    {message.proposed_changes && (
                      <div className="mt-2 p-2 bg-white rounded border">
                        <p className="text-xs font-medium text-gray-600 mb-1">
                          Proposed Changes:
                        </p>
                        <pre className="text-xs text-gray-700">
                          {JSON.stringify(message.proposed_changes, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {negotiation.status === 'active' && (
                <form onSubmit={sendMessage} className="mt-4">
                  <div className="flex gap-2">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      rows={2}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={!newMessage.trim()}>
                      Send
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
