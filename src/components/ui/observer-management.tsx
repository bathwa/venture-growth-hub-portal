
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Eye, 
  UserPlus, 
  Users, 
  Mail, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Settings,
  AlertCircle,
  Copy,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { 
  Observer, 
  ObserverInvitation, 
  ObserverPermission,
  PermissionInfo,
  RelationshipOption,
  getObserversByUser,
  getPendingInvitations,
  inviteObserver,
  revokeObserver,
  getAvailablePermissions,
  getRelationshipOptions,
  getObserverStats
} from '@/lib/observers';

interface ObserverManagementProps {
  userId: string;
  entityId: string;
  entityType: 'opportunity' | 'investment' | 'pool' | 'company';
  entityName: string;
  onInvitationSent?: (invitation: ObserverInvitation) => void;
  onObserverRevoked?: (observerId: string) => void;
  className?: string;
}

export default function ObserverManagement({
  userId,
  entityId,
  entityType,
  entityName,
  onInvitationSent,
  onObserverRevoked,
  className
}: ObserverManagementProps) {
  const [activeTab, setActiveTab] = useState('observers');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    name: '',
    relationship: '',
    permissions: [] as string[]
  });
  
  // Data states
  const [observers, setObservers] = useState<Observer[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<ObserverInvitation[]>([]);
  const [stats, setStats] = useState({
    totalObservers: 0,
    activeObservers: 0,
    pendingInvitations: 0,
    revokedObservers: 0
  });
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Error and success states
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Get static data
  const availablePermissions = getAvailablePermissions();
  const relationshipOptions = getRelationshipOptions();

  // Fetch data on component mount and when userId/entityId changes
  useEffect(() => {
    fetchData();
  }, [userId, entityId, entityType]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch all data in parallel
      const [observersData, invitationsData, statsData] = await Promise.all([
        getObserversByUser(userId, entityId, entityType),
        getPendingInvitations(userId, entityId, entityType),
        getObserverStats(userId, entityId, entityType)
      ]);
      
      setObservers(observersData);
      setPendingInvitations(invitationsData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load observer data');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate form
      if (!inviteForm.email || !inviteForm.name || !inviteForm.relationship) {
        throw new Error('Please fill in all required fields');
      }

      if (inviteForm.permissions.length === 0) {
        throw new Error('Please select at least one permission');
      }

      // Convert permission strings to permission objects
      const permissions: PermissionInfo[] = inviteForm.permissions.map(permType => {
        const perm = availablePermissions.find(p => p.type === permType);
        return perm!;
      });

      // Create invitation using the fixed function signature
      const invitation = await inviteObserver({
        email: inviteForm.email,
        name: inviteForm.name,
        relationship: inviteForm.relationship,
        entityId,
        entityType,
        permissions,
        inviterId: userId
      });

      setSuccess(`Invitation sent to ${inviteForm.name}`);
      setInviteForm({ email: '', name: '', relationship: '', permissions: [] });
      setShowInviteForm(false);

      // Refresh data to show new invitation
      await fetchData();

      if (onInvitationSent) {
        onInvitationSent(invitation);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeObserver = async (observerId: string) => {
    try {
      setError(null);
      await revokeObserver(observerId, userId);
      
      if (onObserverRevoked) {
        onObserverRevoked(observerId);
      }
      setSuccess('Observer access revoked successfully');
      
      // Refresh data to show updated status
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke observer access');
    }
  };

  const copyInvitationLink = (invitation: ObserverInvitation) => {
    const link = `${window.location.origin}/observer/invite/${invitation.token}`;
    navigator.clipboard.writeText(link);
    setSuccess('Invitation link copied to clipboard');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'revoked':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'revoked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPermissionLabel = (permission: ObserverPermission): string => {
    const permInfo = availablePermissions.find(p => p.type === permission);
    return permInfo?.description || permission;
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Observer Management</h2>
          <p className="text-muted-foreground">
            Manage who can view {entityName} information
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={refreshData}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            onClick={() => setShowInviteForm(true)}
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Invite Observer
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Observers</p>
                <p className="text-2xl font-bold">{stats.totalObservers}</p>
              </div>
              <Users className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{stats.activeObservers}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pendingInvitations}</p>
              </div>
              <Clock className="h-6 w-6 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revoked</p>
                <p className="text-2xl font-bold">{stats.revokedObservers}</p>
              </div>
              <XCircle className="h-6 w-6 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="observers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Active Observers
          </TabsTrigger>
          <TabsTrigger value="invitations" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Pending Invitations
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="observers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Observers</CardTitle>
            </CardHeader>
            <CardContent>
              {observers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No observers yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Invite people to view {entityName} information.
                  </p>
                  <Button onClick={() => setShowInviteForm(true)}>
                    Invite Observer
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {observers.map((observer) => (
                    <div
                      key={observer.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(observer.status)}
                        <div>
                          <h4 className="font-medium">{observer.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {observer.email} • {observer.relationship}
                          </p>
                          <div className="flex gap-1 mt-1">
                            {observer.permissions.map((perm, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {getPermissionLabel(perm)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(observer.status)}>
                          {observer.status}
                        </Badge>
                        {observer.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRevokeObserver(observer.id)}
                          >
                            Revoke
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingInvitations.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No pending invitations</h3>
                  <p className="text-muted-foreground">
                    All invitations have been accepted or expired.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingInvitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{invitation.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {invitation.email} • {invitation.relationship}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Expires: {invitation.expires_at ? new Date(invitation.expires_at).toLocaleDateString() : 'No expiry'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyInvitationLink(invitation)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/observer/invite/${invitation.token}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Observer Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Available Permissions</h4>
                  <div className="space-y-2">
                    {availablePermissions.map((permission) => (
                      <div key={permission.type} className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{permission.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Relationship Types</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {relationshipOptions.map((option) => (
                      <div key={option.value} className="text-sm text-muted-foreground">
                        • {option.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invite Form Modal */}
      {showInviteForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Invite Observer</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInviteSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="observer@example.com"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={inviteForm.name}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="John Doe"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="relationship">Relationship *</Label>
                  <Select
                    value={inviteForm.relationship}
                    onValueChange={(value) => setInviteForm(prev => ({ ...prev, relationship: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      {relationshipOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Permissions *</Label>
                  <div className="space-y-2 mt-2">
                    {availablePermissions.map((permission) => (
                      <div key={permission.type} className="flex items-center space-x-2">
                        <Checkbox
                          id={permission.type}
                          checked={inviteForm.permissions.includes(permission.type)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setInviteForm(prev => ({
                                ...prev,
                                permissions: [...prev.permissions, permission.type]
                              }));
                            } else {
                              setInviteForm(prev => ({
                                ...prev,
                                permissions: prev.permissions.filter(p => p !== permission.type)
                              }));
                            }
                          }}
                        />
                        <Label htmlFor={permission.type} className="text-sm">
                          {permission.description}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowInviteForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Invitation'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
