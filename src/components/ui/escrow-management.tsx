import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Textarea } from './textarea';
import { Badge } from './badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Alert, AlertDescription } from './alert';
import { Progress } from './progress';
import { Separator } from './separator';
import { 
  Wallet, 
  ArrowUpDown, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Plus,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';
import { 
  EscrowAccount, 
  EscrowTransaction, 
  EscrowReleaseCondition,
  createEscrowAccount,
  getEscrowAccountsByUser,
  fundEscrowAccount,
  releaseEscrowFunds,
  getEscrowTransactions,
  addReleaseCondition,
  markReleaseConditionMet,
  getReleaseConditions,
  validateEscrowRelease,
  calculateEscrowFee,
  getEscrowStats
} from '@/lib/escrow';

interface EscrowManagementProps {
  userId: string;
  userRole: 'investor' | 'entrepreneur';
}

export function EscrowManagement({ userId, userRole }: EscrowManagementProps) {
  const [accounts, setAccounts] = useState<EscrowAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<EscrowAccount | null>(null);
  const [transactions, setTransactions] = useState<EscrowTransaction[]>([]);
  const [releaseConditions, setReleaseConditions] = useState<EscrowReleaseCondition[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showFundDialog, setShowFundDialog] = useState(false);
  const [showReleaseDialog, setShowReleaseDialog] = useState(false);
  const [showConditionDialog, setShowConditionDialog] = useState(false);

  // Create account form
  const [createForm, setCreateForm] = useState({
    opportunityId: '',
    investorId: '',
    entrepreneurId: '',
    type: 'investment' as const,
    amount: '',
    currency: 'USD',
    releaseConditions: [] as string[]
  });

  // Fund account form
  const [fundForm, setFundForm] = useState({
    amount: '',
    reference: ''
  });

  // Release funds form
  const [releaseForm, setReleaseForm] = useState({
    amount: '',
    recipientId: '',
    reason: ''
  });

  // Add condition form
  const [conditionForm, setConditionForm] = useState({
    conditionType: 'milestone_completion',
    description: '',
    dueDate: ''
  });

  useEffect(() => {
    loadEscrowData();
  }, [userId, userRole]);

  const loadEscrowData = async () => {
    try {
      setLoading(true);
      const [accountsData, statsData] = await Promise.all([
        getEscrowAccountsByUser(userId, userRole),
        getEscrowStats(userId, userRole)
      ]);
      
      setAccounts(accountsData);
      setStats(statsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load escrow data');
    } finally {
      setLoading(false);
    }
  };

  const loadAccountDetails = async (accountId: string) => {
    try {
      const [transactionsData, conditionsData] = await Promise.all([
        getEscrowTransactions(accountId),
        getReleaseConditions(accountId)
      ]);
      
      setTransactions(transactionsData);
      setReleaseConditions(conditionsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load account details');
    }
  };

  const handleCreateAccount = async () => {
    try {
      const account = await createEscrowAccount({
        opportunityId: createForm.opportunityId,
        investorId: createForm.investorId,
        entrepreneurId: createForm.entrepreneurId,
        type: createForm.type,
        amount: parseFloat(createForm.amount),
        currency: createForm.currency,
        releaseConditions: createForm.releaseConditions
      });
      
      setAccounts([account, ...accounts]);
      setShowCreateDialog(false);
      setCreateForm({
        opportunityId: '',
        investorId: '',
        entrepreneurId: '',
        type: 'investment',
        amount: '',
        currency: 'USD',
        releaseConditions: []
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create escrow account');
    }
  };

  const handleFundAccount = async () => {
    if (!selectedAccount) return;
    
    try {
      await fundEscrowAccount(
        selectedAccount.id,
        parseFloat(fundForm.amount),
        fundForm.reference
      );
      
      await loadEscrowData();
      await loadAccountDetails(selectedAccount.id);
      setShowFundDialog(false);
      setFundForm({ amount: '', reference: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fund account');
    }
  };

  const handleReleaseFunds = async () => {
    if (!selectedAccount) return;
    
    try {
      await releaseEscrowFunds(
        selectedAccount.id,
        parseFloat(releaseForm.amount),
        releaseForm.recipientId,
        releaseForm.reason
      );
      
      await loadEscrowData();
      await loadAccountDetails(selectedAccount.id);
      setShowReleaseDialog(false);
      setReleaseForm({ amount: '', recipientId: '', reason: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to release funds');
    }
  };

  const handleAddCondition = async () => {
    if (!selectedAccount) return;
    
    try {
      await addReleaseCondition(
        selectedAccount.id,
        conditionForm.conditionType,
        conditionForm.description,
        conditionForm.dueDate || undefined
      );
      
      await loadAccountDetails(selectedAccount.id);
      setShowConditionDialog(false);
      setConditionForm({
        conditionType: 'milestone_completion',
        description: '',
        dueDate: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add condition');
    }
  };

  const handleMarkConditionMet = async (conditionId: string) => {
    try {
      await markReleaseConditionMet(conditionId);
      if (selectedAccount) {
        await loadAccountDetails(selectedAccount.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark condition as met');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'funded': return 'bg-green-100 text-green-800';
      case 'released': return 'bg-gray-100 text-gray-800';
      case 'disputed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'investment': return 'bg-purple-100 text-purple-800';
      case 'payment': return 'bg-blue-100 text-blue-800';
      case 'milestone': return 'bg-green-100 text-green-800';
      case 'security': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Escrow Management</h2>
          <p className="text-gray-600">Manage secure fund holding for investment transactions</p>
        </div>
        <Button onClick={loadEscrowData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAccounts}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeAccounts} active
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                ${stats.availableBalance.toLocaleString()} available
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Held Amount</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.heldAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                In escrow
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disputed</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.disputedAccounts}</div>
              <p className="text-xs text-muted-foreground">
                Require attention
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="accounts">Escrow Accounts</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="conditions">Release Conditions</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Escrow Accounts</h3>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Account
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create Escrow Account</DialogTitle>
                  <DialogDescription>
                    Create a new escrow account for secure fund holding.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="opportunityId" className="text-right">
                      Opportunity ID
                    </Label>
                    <Input
                      id="opportunityId"
                      value={createForm.opportunityId}
                      onChange={(e) => setCreateForm({...createForm, opportunityId: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Type
                    </Label>
                    <Select 
                      value={createForm.type} 
                      onValueChange={(value) => setCreateForm({...createForm, type: value as any})}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="investment">Investment</SelectItem>
                        <SelectItem value="payment">Payment</SelectItem>
                        <SelectItem value="milestone">Milestone</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">
                      Amount
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      value={createForm.amount}
                      onChange={(e) => setCreateForm({...createForm, amount: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="currency" className="text-right">
                      Currency
                    </Label>
                    <Select 
                      value={createForm.currency} 
                      onValueChange={(value) => setCreateForm({...createForm, currency: value})}
                    >
                      <SelectTrigger className="col-span-3">
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
                <DialogFooter>
                  <Button type="submit" onClick={handleCreateAccount}>
                    Create Account
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {accounts.map((account) => (
              <Card key={account.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      setSelectedAccount(account);
                      loadAccountDetails(account.id);
                    }}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {account.account_number}
                        <Badge className={getStatusColor(account.status)}>
                          {account.status}
                        </Badge>
                        <Badge className={getTypeColor(account.type)}>
                          {account.type}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Created {new Date(account.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        ${account.total_amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {account.currency}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Available</div>
                      <div className="text-green-600">${account.available_balance.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="font-medium">Held</div>
                      <div className="text-orange-600">${account.held_amount.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="font-medium">Utilization</div>
                      <Progress 
                        value={(account.available_balance / account.total_amount) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Transactions</h3>
            {selectedAccount && (
              <div className="flex gap-2">
                <Dialog open={showFundDialog} onOpenChange={setShowFundDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Fund Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Fund Escrow Account</DialogTitle>
                      <DialogDescription>
                        Add funds to the selected escrow account.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="fundAmount" className="text-right">
                          Amount
                        </Label>
                        <Input
                          id="fundAmount"
                          type="number"
                          value={fundForm.amount}
                          onChange={(e) => setFundForm({...fundForm, amount: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="reference" className="text-right">
                          Reference
                        </Label>
                        <Input
                          id="reference"
                          value={fundForm.reference}
                          onChange={(e) => setFundForm({...fundForm, reference: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleFundAccount}>Fund Account</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={showReleaseDialog} onOpenChange={setShowReleaseDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      Release Funds
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Release Funds</DialogTitle>
                      <DialogDescription>
                        Release funds from the escrow account.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="releaseAmount" className="text-right">
                          Amount
                        </Label>
                        <Input
                          id="releaseAmount"
                          type="number"
                          value={releaseForm.amount}
                          onChange={(e) => setReleaseForm({...releaseForm, amount: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="recipientId" className="text-right">
                          Recipient ID
                        </Label>
                        <Input
                          id="recipientId"
                          value={releaseForm.recipientId}
                          onChange={(e) => setReleaseForm({...releaseForm, recipientId: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="reason" className="text-right">
                          Reason
                        </Label>
                        <Textarea
                          id="reason"
                          value={releaseForm.reason}
                          onChange={(e) => setReleaseForm({...releaseForm, reason: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleReleaseFunds}>Release Funds</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>

          {selectedAccount && (
            <Card>
              <CardHeader>
                <CardTitle>Account: {selectedAccount.account_number}</CardTitle>
                <CardDescription>
                  Transaction history for this escrow account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {new Date(transaction.transaction_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{transaction.type}</Badge>
                        </TableCell>
                        <TableCell>
                          ${transaction.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>{transaction.reference}</TableCell>
                        <TableCell>
                          <Badge className={transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="conditions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Release Conditions</h3>
            {selectedAccount && (
              <Dialog open={showConditionDialog} onOpenChange={setShowConditionDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Condition
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Release Condition</DialogTitle>
                    <DialogDescription>
                      Add a condition that must be met before funds can be released.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="conditionType" className="text-right">
                        Type
                      </Label>
                      <Select 
                        value={conditionForm.conditionType} 
                        onValueChange={(value) => setConditionForm({...conditionForm, conditionType: value as any})}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="milestone_completion">Milestone Completion</SelectItem>
                          <SelectItem value="time_based">Time Based</SelectItem>
                          <SelectItem value="manual_approval">Manual Approval</SelectItem>
                          <SelectItem value="document_verification">Document Verification</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={conditionForm.description}
                        onChange={(e) => setConditionForm({...conditionForm, description: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="dueDate" className="text-right">
                        Due Date
                      </Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={conditionForm.dueDate}
                        onChange={(e) => setConditionForm({...conditionForm, dueDate: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddCondition}>Add Condition</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {selectedAccount && (
            <Card>
              <CardHeader>
                <CardTitle>Account: {selectedAccount.account_number}</CardTitle>
                <CardDescription>
                  Release conditions for this escrow account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {releaseConditions.map((condition) => (
                    <div key={condition.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {condition.is_met ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <div className="font-medium">{condition.description}</div>
                          <div className="text-sm text-gray-600">
                            Type: {condition.condition_type.replace('_', ' ')}
                            {condition.due_date && ` • Due: ${new Date(condition.due_date).toLocaleDateString()}`}
                          </div>
                        </div>
                      </div>
                      {!condition.is_met && (
                        <Button
                          size="sm"
                          onClick={() => handleMarkConditionMet(condition.id)}
                        >
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 