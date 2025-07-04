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
  Users, 
  DollarSign, 
  TrendingUp, 
  Target,
  Plus,
  Vote,
  Eye,
  Download,
  RefreshCw,
  UserPlus,
  BarChart3,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  Upload,
  X,
  Edit,
  Trash2
} from 'lucide-react';
import {
  InvestmentPool,
  PoolMember,
  PoolInvestment,
  PoolVote,
  createInvestmentPool,
  getPoolsByUser,
  getPoolsWhereMember,
  getInvestmentPool,
  getPoolMembers,
  addPoolMember,
  getPoolInvestments,
  voteOnInvestment,
  getInvestmentVotes,
  executeInvestment,
  getPoolStats,
  activatePool,
  closePool,
  proposeInvestment
} from '@/lib/pools';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface PoolManagementProps {
  userId: string;
  userRole: 'investor' | 'entrepreneur' | 'admin';
}

export function PoolManagement({ userId, userRole }: PoolManagementProps) {
  const [pools, setPools] = useState<InvestmentPool[]>([]);
  const [memberPools, setMemberPools] = useState<InvestmentPool[]>([]);
  const [selectedPool, setSelectedPool] = useState<InvestmentPool | null>(null);
  const [members, setMembers] = useState<PoolMember[]>([]);
  const [investments, setInvestments] = useState<PoolInvestment[]>([]);
  const [votes, setVotes] = useState<PoolVote[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showMemberDialog, setShowMemberDialog] = useState(false);
  const [showInvestmentDialog, setShowInvestmentDialog] = useState(false);
  const [showVoteDialog, setShowVoteDialog] = useState(false);

  // Create pool form
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    type: 'syndicate' as const,
    targetAmount: '',
    minimumInvestment: '',
    maximumInvestment: '',
    currency: 'USD',
    investmentStrategy: '',
    riskProfile: 'moderate' as const,
    termLength: '',
    managementFee: '',
    performanceFee: '',
    autoApprove: false,
    requireVote: true,
    maxMembers: '',
    investment_focus: 'general',
    minimum_investment: 1000,
    target_amount: 100000,
    management_fee: 2,
    carried_interest: 20,
    is_active: true,
    is_public: true
  });

  // Add member form
  const [memberForm, setMemberForm] = useState({
    userId: '',
    role: 'investor' as const,
    committedAmount: ''
  });

  // Propose investment form
  const [investmentForm, setInvestmentForm] = useState({
    opportunityId: '',
    amount: '',
    currency: 'USD',
    notes: ''
  });

  // Vote form
  const [voteForm, setVoteForm] = useState({
    voteType: 'approve' as const,
    comments: ''
  });

  const [isCreatingPool, setIsCreatingPool] = useState(false);
  const [isEditingPool, setIsEditingPool] = useState(false);
  const [editingPool, setEditingPool] = useState<InvestmentPool | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  useEffect(() => {
    loadPoolData();
  }, [userId, userRole]);

  const loadPoolData = async () => {
    try {
      setLoading(true);
      const [poolsData, memberPoolsData] = await Promise.all([
        getPoolsByUser(userId),
        getPoolsWhereMember(userId)
      ]);
      
      setPools(poolsData);
      setMemberPools(memberPoolsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pool data');
    } finally {
      setLoading(false);
    }
  };

  const loadPoolDetails = async (poolId: string) => {
    try {
      const [poolData, membersData, investmentsData, statsData] = await Promise.all([
        getInvestmentPool(poolId),
        getPoolMembers(poolId),
        getPoolInvestments(poolId),
        getPoolStats(poolId)
      ]);
      
      setSelectedPool(poolData);
      setMembers(membersData);
      setInvestments(investmentsData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pool details');
    }
  };

  const handleCreatePool = async () => {
    try {
      if (!createForm.name?.trim()) {
        toast.error("Pool name is required");
        return;
      }
      if (!createForm.description?.trim()) {
        toast.error("Pool description is required");
        return;
      }
      if (!createForm.targetAmount || parseFloat(createForm.targetAmount) <= 0) {
        toast.error("Target amount must be positive");
        return;
      }

      const createdPool = await createInvestmentPool({
        name: createForm.name,
        description: createForm.description,
        type: createForm.type,
        target_amount: parseFloat(createForm.targetAmount),
        minimum_investment: parseFloat(createForm.minimumInvestment),
        maximum_investment: parseFloat(createForm.maximumInvestment),
        currency: createForm.currency,
        created_by: userId,
        manager_id: userId,
        investment_strategy: createForm.investmentStrategy,
        risk_profile: createForm.riskProfile,
        term_length_months: parseInt(createForm.termLength),
        management_fee_percentage: parseFloat(createForm.managementFee),
        performance_fee_percentage: parseFloat(createForm.performanceFee),
        auto_approve_investments: createForm.autoApprove,
        require_majority_vote: createForm.requireVote,
        max_members: parseInt(createForm.maxMembers)
      });

      setPools([createdPool, ...pools]);
      setShowCreateDialog(false);
      // Reset form
      setCreateForm({
        name: '',
        description: '',
        type: 'syndicate',
        targetAmount: '',
        minimumInvestment: '',
        maximumInvestment: '',
        currency: 'USD',
        investmentStrategy: '',
        riskProfile: 'moderate',
        termLength: '',
        managementFee: '',
        performanceFee: '',
        autoApprove: false,
        requireVote: true,
        maxMembers: '',
        investment_focus: 'general',
        minimum_investment: 1000,
        target_amount: 100000,
        management_fee: 2,
        carried_interest: 20,
        is_active: true,
        is_public: true
      });
      setLogoFile(null);
      setLogoPreview('');
      toast.success("Pool created successfully");
    } catch (error) {
      toast.error("Failed to create pool");
      console.error(error);
    }
  };

  const handleAddMember = async () => {
    if (!selectedPool) return;
    
    try {
      await addPoolMember(selectedPool.id, {
        user_id: memberForm.userId,
        role: memberForm.role,
        committed_amount: parseFloat(memberForm.committedAmount)
      });
      
      await loadPoolDetails(selectedPool.id);
      setShowMemberDialog(false);
      setMemberForm({
        userId: '',
        role: 'investor',
        committedAmount: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member');
    }
  };

  const handleProposeInvestment = async () => {
    if (!selectedPool) return;
    
    try {
      await proposeInvestment(selectedPool.id, {
        opportunity_id: investmentForm.opportunityId,
        amount: parseFloat(investmentForm.amount),
        currency: investmentForm.currency,
        proposed_by: userId,
        notes: investmentForm.notes
      });
      
      await loadPoolDetails(selectedPool.id);
      setShowInvestmentDialog(false);
      setInvestmentForm({
        opportunityId: '',
        amount: '',
        currency: 'USD',
        notes: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to propose investment');
    }
  };

  const handleVote = async (investmentId: string) => {
    try {
      await voteOnInvestment(investmentId, userId, voteForm.voteType);
      
      if (selectedPool) {
        await loadPoolDetails(selectedPool.id);
      }
      setShowVoteDialog(false);
      setVoteForm({
        voteType: 'approve',
        comments: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit vote');
    }
  };

  const handleExecuteInvestment = async (investmentId: string) => {
    try {
      await executeInvestment(investmentId);
      if (selectedPool) {
        await loadPoolDetails(selectedPool.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute investment');
    }
  };

  const handleActivatePool = async (poolId: string) => {
    try {
      await activatePool(poolId);
      await loadPoolData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to activate pool');
    }
  };

  const handleUpdatePool = async () => {
    if (!editingPool) return;

    try {
      const { error } = await supabase
        .from('investment_pools')
        .update({
          name: editingPool.name,
          description: editingPool.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingPool.id);

      if (error) throw error;

      setPools(pools.map((pool) => pool.id === editingPool.id ? editingPool : pool));
      setIsEditingPool(false);
      setEditingPool(null);
      setLogoFile(null);
      setLogoPreview('');
      toast.success("Pool updated successfully");
    } catch (error) {
      toast.error("Failed to update pool");
      console.error(error);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
    if (editingPool) {
      setEditingPool({ ...editingPool });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'forming': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'investing': return 'bg-blue-100 text-blue-800';
      case 'distributing': return 'bg-purple-100 text-purple-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'syndicate': return 'bg-purple-100 text-purple-800';
      case 'fund': return 'bg-blue-100 text-blue-800';
      case 'collective': return 'bg-green-100 text-green-800';
      case 'angel_group': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'conservative': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'aggressive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInvestmentFocusColor = (focus: string) => {
    switch (focus) {
      case 'technology': return 'bg-blue-100 text-blue-800';
      case 'healthcare': return 'bg-green-100 text-green-800';
      case 'real_estate': return 'bg-purple-100 text-purple-800';
      case 'energy': return 'bg-yellow-100 text-yellow-800';
      case 'finance': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
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
          <h2 className="text-2xl font-bold">Investment Pool Management</h2>
          <p className="text-gray-600">Manage collective investment opportunities and syndicates</p>
        </div>
        <Button onClick={loadPoolData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMembers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeMembers} active
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Committed</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalCommitted.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                ${stats.totalInvested.toLocaleString()} invested
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Investments</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.investmentCount}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeInvestments} active
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilization</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.fundUtilization.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Fund utilization
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="pools" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pools">My Pools</TabsTrigger>
          <TabsTrigger value="member">Member Pools</TabsTrigger>
          <TabsTrigger value="details">Pool Details</TabsTrigger>
        </TabsList>

        <TabsContent value="pools" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">My Investment Pools</h3>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Pool
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create Investment Pool</DialogTitle>
                  <DialogDescription>
                    Create a new investment pool for collective investments.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Pool Name</Label>
                      <Input
                        id="name"
                        value={createForm.name}
                        onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Pool Type</Label>
                      <Select 
                        value={createForm.type} 
                        onValueChange={(value) => setCreateForm({...createForm, type: value as any})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="syndicate">Syndicate</SelectItem>
                          <SelectItem value="fund">Fund</SelectItem>
                          <SelectItem value="collective">Collective</SelectItem>
                          <SelectItem value="angel_group">Angel Group</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={createForm.description}
                      onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="targetAmount">Target Amount</Label>
                      <Input
                        id="targetAmount"
                        type="number"
                        value={createForm.targetAmount}
                        onChange={(e) => setCreateForm({...createForm, targetAmount: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="minInvestment">Min Investment</Label>
                      <Input
                        id="minInvestment"
                        type="number"
                        value={createForm.minimumInvestment}
                        onChange={(e) => setCreateForm({...createForm, minimumInvestment: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxInvestment">Max Investment</Label>
                      <Input
                        id="maxInvestment"
                        type="number"
                        value={createForm.maximumInvestment}
                        onChange={(e) => setCreateForm({...createForm, maximumInvestment: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="riskProfile">Risk Profile</Label>
                      <Select 
                        value={createForm.riskProfile} 
                        onValueChange={(value) => setCreateForm({...createForm, riskProfile: value as any})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="conservative">Conservative</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="aggressive">Aggressive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="maxMembers">Max Members</Label>
                      <Input
                        id="maxMembers"
                        type="number"
                        value={createForm.maxMembers}
                        onChange={(e) => setCreateForm({...createForm, maxMembers: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="investmentFocus">Investment Focus</Label>
                    <Select 
                      value={createForm.investment_focus} 
                      onValueChange={(value) => setCreateForm({...createForm, investment_focus: value as any})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="real_estate">Real Estate</SelectItem>
                        <SelectItem value="energy">Energy</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreatePool}>Create Pool</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {pools.map((pool) => (
              <Card key={pool.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => loadPoolDetails(pool.id)}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {pool.name}
                        <Badge className={getStatusColor(pool.status)}>
                          {pool.status}
                        </Badge>
                        <Badge className={getTypeColor(pool.type)}>
                          {pool.type}
                        </Badge>
                        <Badge className={getRiskColor(pool.risk_profile)}>
                          {pool.risk_profile}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {pool.description}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        ${pool.target_amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        Target
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Members</div>
                      <div>{pool.current_members}/{pool.max_members}</div>
                    </div>
                    <div>
                      <div className="font-medium">Committed</div>
                      <div>${pool.total_committed.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="font-medium">Invested</div>
                      <div>${pool.total_invested.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="font-medium">Progress</div>
                      <Progress 
                        value={(pool.total_committed / pool.target_amount) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                  {pool.status === 'forming' && pool.total_committed >= pool.target_amount * 0.5 && (
                    <div className="mt-4">
                      <Button 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActivatePool(pool.id);
                        }}
                      >
                        Activate Pool
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="member" className="space-y-4">
          <h3 className="text-lg font-semibold">Pools I'm a Member Of</h3>
          <div className="grid gap-4">
            {memberPools.map((pool) => (
              <Card key={pool.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => loadPoolDetails(pool.id)}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {pool.name}
                        <Badge className={getStatusColor(pool.status)}>
                          {pool.status}
                        </Badge>
                        <Badge className={getTypeColor(pool.type)}>
                          {pool.type}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {pool.description}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        ${pool.total_committed.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total Committed
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="font-medium">My Commitment</div>
                      <div>$0</div>
                    </div>
                    <div>
                      <div className="font-medium">Investments</div>
                      <div>{pool.total_invested > 0 ? 'Active' : 'None'}</div>
                    </div>
                    <div>
                      <div className="font-medium">Returns</div>
                      <div>${pool.total_distributed.toLocaleString()}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {selectedPool ? (
            <div className="space-y-6">
              {/* Pool Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {selectedPool.name}
                    <Badge className={getStatusColor(selectedPool.status)}>
                      {selectedPool.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{selectedPool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-600">Target Amount</div>
                      <div className="text-lg font-semibold">${selectedPool.target_amount.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-600">Total Committed</div>
                      <div className="text-lg font-semibold">${selectedPool.total_committed.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-600">Total Invested</div>
                      <div className="text-lg font-semibold">${selectedPool.total_invested.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-600">Members</div>
                      <div className="text-lg font-semibold">{selectedPool.current_members}/{selectedPool.max_members}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-2">
                <Dialog open={showMemberDialog} onOpenChange={setShowMemberDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Pool Member</DialogTitle>
                      <DialogDescription>
                        Add a new member to the investment pool.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label htmlFor="memberUserId">User ID</Label>
                        <Input
                          id="memberUserId"
                          value={memberForm.userId}
                          onChange={(e) => setMemberForm({...memberForm, userId: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="memberRole">Role</Label>
                        <Select 
                          value={memberForm.role} 
                          onValueChange={(value) => setMemberForm({...memberForm, role: value as any})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="investor">Investor</SelectItem>
                            <SelectItem value="advisor">Advisor</SelectItem>
                            <SelectItem value="observer">Observer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="committedAmount">Committed Amount</Label>
                        <Input
                          id="committedAmount"
                          type="number"
                          value={memberForm.committedAmount}
                          onChange={(e) => setMemberForm({...memberForm, committedAmount: e.target.value})}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddMember}>Add Member</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={showInvestmentDialog} onOpenChange={setShowInvestmentDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Propose Investment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Propose Investment</DialogTitle>
                      <DialogDescription>
                        Propose a new investment opportunity to the pool.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label htmlFor="opportunityId">Opportunity ID</Label>
                        <Input
                          id="opportunityId"
                          value={investmentForm.opportunityId}
                          onChange={(e) => setInvestmentForm({...investmentForm, opportunityId: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="investmentAmount">Amount</Label>
                        <Input
                          id="investmentAmount"
                          type="number"
                          value={investmentForm.amount}
                          onChange={(e) => setInvestmentForm({...investmentForm, amount: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="investmentNotes">Notes</Label>
                        <Textarea
                          id="investmentNotes"
                          value={investmentForm.notes}
                          onChange={(e) => setInvestmentForm({...investmentForm, notes: e.target.value})}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleProposeInvestment}>Propose Investment</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Members */}
              <Card>
                <CardHeader>
                  <CardTitle>Pool Members</CardTitle>
                  <CardDescription>
                    Current members and their commitments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User ID</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Committed</TableHead>
                        <TableHead>Invested</TableHead>
                        <TableHead>Voting Power</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>{member.user_id}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{member.role}</Badge>
                          </TableCell>
                          <TableCell>${member.committed_amount.toLocaleString()}</TableCell>
                          <TableCell>${member.invested_amount.toLocaleString()}</TableCell>
                          <TableCell>{member.voting_power}</TableCell>
                          <TableCell>
                            <Badge className={member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                              {member.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Investments */}
              <Card>
                <CardHeader>
                  <CardTitle>Pool Investments</CardTitle>
                  <CardDescription>
                    Investment proposals and their status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Opportunity</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Proposed</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {investments.map((investment) => (
                        <TableRow key={investment.id}>
                          <TableCell>{investment.opportunity_id}</TableCell>
                          <TableCell>${investment.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className={
                              investment.status === 'approved' ? 'bg-green-100 text-green-800' :
                              investment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              investment.status === 'invested' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }>
                              {investment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(investment.proposed_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {investment.status === 'approved' && (
                              <Button
                                size="sm"
                                onClick={() => handleExecuteInvestment(investment.id)}
                              >
                                Execute
                              </Button>
                            )}
                            {investment.status === 'voting' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowVoteDialog(true)}
                              >
                                Vote
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Select a pool to view details
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Vote Dialog */}
      <Dialog open={showVoteDialog} onOpenChange={setShowVoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vote on Investment</DialogTitle>
            <DialogDescription>
              Cast your vote on the proposed investment.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="voteType">Vote</Label>
              <Select 
                value={voteForm.voteType} 
                onValueChange={(value) => setVoteForm({...voteForm, voteType: value as any})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approve">Approve</SelectItem>
                  <SelectItem value="reject">Reject</SelectItem>
                  <SelectItem value="abstain">Abstain</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="voteComments">Comments</Label>
              <Textarea
                id="voteComments"
                value={voteForm.comments}
                onChange={(e) => setVoteForm({...voteForm, comments: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => handleVote('temp-id')}>Submit Vote</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Pool Dialog */}
      <Dialog open={isEditingPool} onOpenChange={setIsEditingPool}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Pool</DialogTitle>
            <DialogDescription>
              Update pool information and settings
            </DialogDescription>
          </DialogHeader>
          {editingPool && (
            <div className="space-y-4">
              <div>
                <Label>Pool Name</Label>
                <Input 
                  value={editingPool.name}
                  onChange={(e) => setEditingPool({ ...editingPool, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea 
                  value={editingPool.description}
                  onChange={(e) => setEditingPool({ ...editingPool, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label>Pool Logo</Label>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="edit-logo-upload"
                    />
                    <Label htmlFor="edit-logo-upload" className="cursor-pointer">
                      <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors">
                        {(logoPreview || editingPool.logo_url) ? (
                          <img 
                            src={logoPreview || editingPool.logo_url} 
                            alt="Logo preview" 
                            className="w-full h-full object-cover rounded-lg" 
                          />
                        ) : (
                          <Upload className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                    </Label>
                  </div>
                  {(logoPreview || editingPool.logo_url) && (
                    <Button variant="outline" size="sm" onClick={removeLogo}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Management Fee (%)</Label>
                  <Input 
                    type="number"
                    value={editingPool.management_fee}
                    onChange={(e) => setEditingPool({ ...editingPool, management_fee: parseFloat(e.target.value) })}
                    min="0"
                    max="10"
                    step="0.1"
                  />
                </div>
                <div>
                  <Label>Carried Interest (%)</Label>
                  <Input 
                    type="number"
                    value={editingPool.carried_interest}
                    onChange={(e) => setEditingPool({ ...editingPool, carried_interest: parseFloat(e.target.value) })}
                    min="0"
                    max="50"
                    step="0.1"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={editingPool.is_active}
                  onCheckedChange={(checked) => setEditingPool({ ...editingPool, is_active: checked })}
                />
                <Label>Active Pool</Label>
              </div>
              <Button onClick={handleUpdatePool} className="w-full">
                Update Pool
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
