
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  getObserversByUser,
  getPendingInvitations,
  getObserverStats,
  getObserverAccessLog,
  logObserverAccess,
  getAvailablePermissions,
  getRelationshipOptions,
  Observer,
  ObserverPermission,
  ObserverInvitation,
  PermissionInfo,
  RelationshipOption
} from '@/lib/observers';
import { toast } from 'sonner';
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const ObserverDashboard = () => {
  const { user } = useAuth();
  const [observer, setObserver] = useState<Observer | null>(null);
  const [observers, setObservers] = useState<Observer[]>([]);
  const [invitations, setInvitations] = useState<ObserverInvitation[]>([]);
  const [stats, setStats] = useState<{
    totalObservers: number;
    activeObservers: number;
    pendingInvitations: number;
    revokedObservers: number;
  }>({
    totalObservers: 0,
    activeObservers: 0,
    pendingInvitations: 0,
    revokedObservers: 0
  });
  const [accessLog, setAccessLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [availablePermissions, setAvailablePermissions] = useState<PermissionInfo[]>([]);
  const [relationshipOptions, setRelationshipOptions] = useState<RelationshipOption[]>([]);
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [observersData, invitationsData, statsData, accessLogData] = await Promise.all([
          getObserversByUser(user.id),
          getPendingInvitations(user.id),
          getObserverStats(user.id),
          getObserverAccessLog(user.id)
        ]);

        setObservers(observersData);
        setInvitations(invitationsData);
        setStats(statsData);
        setAccessLog(accessLogData);

        // Set permissions and relationship options directly
        const permissions = await getAvailablePermissions();
        const relationships = await getRelationshipOptions();
        setAvailablePermissions(permissions);
        setRelationshipOptions(relationships);
      } catch (error) {
        console.error('Error fetching observer data:', error);
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    const fetchObserverData = async () => {
      if (!user) return;

      try {
        // Mock observer data with proper permission parsing
        const mockObserver: Observer = {
          id: '1',
          name: user.email || 'Observer',
          email: user.email || '',
          relationship: 'advisor',
          entity_id: '1',
          entity_type: 'opportunity',
          permissions: ['read', 'comment'] as ObserverPermission[],
          status: 'active',
          granted_by: 'admin-1',
          granted_by_role: 'admin',
          access_expiry: '2024-12-31T23:59:59Z',
          last_accessed: '2024-01-15T10:30:00Z',
          created_at: '2024-01-01T00:00:00Z',
          metadata: {}
        };
        
        setObserver(mockObserver);

        // Mock permissions data  
        const availablePermissions = [
          { type: 'read', description: 'View documents and information' },
          { type: 'comment', description: 'Add comments and feedback' },
          { type: 'download', description: 'Download documents' }
        ];
        setAvailablePermissions(availablePermissions);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching observer data:', error);
        setLoading(false);
      }
    };

    fetchObserverData();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!observer) {
    return <div>No observer data found.</div>;
  }

  const renderPermissionBadge = (permission: ObserverPermission) => {
    const permissionLabels = {
      'read': 'Read',
      'comment': 'Comment', 
      'download': 'Download'
    };
    
    return (
      <Badge key={permission} variant="secondary" className="text-xs">
        {permissionLabels[permission] || permission}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Observer Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Observer Profile */}
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Observer Profile</h2>
          <p><strong>Name:</strong> {observer.name}</p>
          <p><strong>Email:</strong> {observer.email}</p>
          <p><strong>Relationship:</strong> {observer.relationship}</p>
          <p><strong>Permissions:</strong> {observer.permissions.map(renderPermissionBadge)}</p>
          <p><strong>Status:</strong> {observer.status}</p>
          <p><strong>Access Expiry:</strong> {observer.access_expiry}</p>
        </div>

        {/* Observer Statistics */}
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Statistics</h2>
          <p><strong>Total Observers:</strong> {stats.totalObservers}</p>
          <p><strong>Active Observers:</strong> {stats.activeObservers}</p>
          <p><strong>Pending Invitations:</strong> {stats.pendingInvitations}</p>
          <p><strong>Revoked Observers:</strong> {stats.revokedObservers}</p>
        </div>
      </div>

      {/* Access Log */}
      <div className="bg-white shadow rounded-lg p-4 mt-6">
        <h2 className="text-lg font-semibold mb-2">Access Log</h2>
        <ul>
          {accessLog.map(log => (
            <li key={log.id} className="py-2 border-b">
              <strong>Action:</strong> {log.action}, <strong>Resource:</strong> {log.resource}, <strong>Accessed At:</strong> {log.accessed_at}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ObserverDashboard;
