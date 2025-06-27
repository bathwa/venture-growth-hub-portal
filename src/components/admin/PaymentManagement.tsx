
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { validatePayment, PaymentStatus, formatCurrency } from "@/lib/drbe";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  reference_number: string;
  proof_file?: string;
  status: PaymentStatus;
  from_user_name: string;
  to_user_name: string;
  created_at: string;
  investment_title?: string;
}

export function PaymentManagement() {
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: '1',
      amount: 50000,
      currency: 'USD',
      reference_number: 'REF001',
      proof_file: 'payment_proof_1.pdf',
      status: 'awaiting_admin',
      from_user_name: 'John Investor',
      to_user_name: 'Green Energy Startup',
      created_at: '2024-01-15T10:30:00Z',
      investment_title: 'Green Energy Investment'
    },
    {
      id: '2',
      amount: 25000,
      currency: 'USD',
      reference_number: 'REF002',
      proof_file: 'payment_proof_2.jpg',
      status: 'awaiting_admin',
      from_user_name: 'Investment Pool A',
      to_user_name: 'AI Healthcare Platform',
      created_at: '2024-01-16T14:20:00Z',
      investment_title: 'AI Healthcare Investment'
    },
    {
      id: '3',
      amount: 5000,
      currency: 'USD',
      reference_number: 'REF003',
      status: 'scheduled',
      from_user_name: 'Fashion Startup',
      to_user_name: 'Legal Services Pro',
      created_at: '2024-01-17T09:15:00Z',
      investment_title: 'Service Payment'
    }
  ]);

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [bankingDetails, setBankingDetails] = useState('');

  const pendingPayments = payments.filter(p => p.status === 'awaiting_admin');
  const scheduledPayments = payments.filter(p => p.status === 'scheduled');

  const handleApprovePayment = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;

    const validation = validatePayment(payment);
    if (!validation.valid) {
      toast.error(`Cannot approve payment: ${validation.errors.join(', ')}`);
      return;
    }

    setPayments(payments.map(p => 
      p.id === paymentId 
        ? { ...p, status: 'scheduled' as PaymentStatus }
        : p
    ));
    toast.success("Payment approved and scheduled for processing");
  };

  const handleCompletePayment = (paymentId: string) => {
    if (!bankingDetails.trim()) {
      toast.error("Please enter banking details confirmation");
      return;
    }

    setPayments(payments.map(p => 
      p.id === paymentId 
        ? { ...p, status: 'completed' as PaymentStatus }
        : p
    ));
    setBankingDetails('');
    setSelectedPayment(null);
    toast.success("Payment marked as completed");
  };

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'awaiting_admin': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Payment Management</h2>
      
      {/* Payment Approval Queue */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Approval Queue ({pendingPayments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingPayments.length === 0 ? (
            <p className="text-gray-500">No payments awaiting approval</p>
          ) : (
            <div className="space-y-4">
              {pendingPayments.map((payment) => (
                <div key={payment.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium">{formatCurrency(payment.amount, payment.currency)}</h4>
                      <p className="text-sm text-gray-600">
                        From: {payment.from_user_name} → To: {payment.to_user_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Reference: {payment.reference_number}
                      </p>
                      {payment.investment_title && (
                        <p className="text-sm text-blue-600">{payment.investment_title}</p>
                      )}
                    </div>
                    <Badge className={getStatusColor(payment.status)}>
                      {payment.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  {payment.proof_file && (
                    <div className="mb-3">
                      <p className="text-sm font-medium">Proof of Payment:</p>
                      <a 
                        href={`/files/${payment.proof_file}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View {payment.proof_file}
                      </a>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleApprovePayment(payment.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Approve & Schedule
                    </Button>
                    <Button variant="outline">
                      Request More Info
                    </Button>
                    <Button variant="destructive">
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scheduled Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Payments ({scheduledPayments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {scheduledPayments.length === 0 ? (
            <p className="text-gray-500">No scheduled payments</p>
          ) : (
            <div className="space-y-4">
              {scheduledPayments.map((payment) => (
                <div key={payment.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium">{formatCurrency(payment.amount, payment.currency)}</h4>
                      <p className="text-sm text-gray-600">
                        To: {payment.to_user_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Reference: {payment.reference_number}
                      </p>
                    </div>
                    <Badge className={getStatusColor(payment.status)}>
                      {payment.status}
                    </Badge>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => setSelectedPayment(payment)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Process Payment
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Process Payment</DialogTitle>
                        <DialogDescription>
                          Confirm payment execution and upload proof
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <p><strong>Amount:</strong> {formatCurrency(payment.amount, payment.currency)}</p>
                          <p><strong>To:</strong> {payment.to_user_name}</p>
                          <p><strong>Reference:</strong> {payment.reference_number}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Banking Details Confirmation
                          </label>
                          <Input
                            placeholder="Enter banking details used for payment"
                            value={bankingDetails}
                            onChange={(e) => setBankingDetails(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleCompletePayment(payment.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Mark as Completed
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setSelectedPayment(null);
                              setBankingDetails('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600">
              {pendingPayments.length}
            </div>
            <p className="text-sm text-gray-600">Awaiting Approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-orange-600">
              {scheduledPayments.length}
            </div>
            <p className="text-sm text-gray-600">Scheduled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">
              {payments.filter(p => p.status === 'completed').length}
            </div>
            <p className="text-sm text-gray-600">Completed</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
