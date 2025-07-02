
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Vote, Crown, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface PoolMember {
  id: string;
  user_id: string;
  role: string;
  committed_amount: number;
  invested_amount: number;
  voting_power: number;
  status: string;
  users: {
    name: string;
    email: string;
  };
}

interface PoolLeader {
  id: string;
  role_id: string;
  member_id: string;
  performance_rating: number;
  is_active: boolean;
  pool_leadership_roles: {
    role_name: string;
    role_description: string;
  };
  pool_members: {
    users: {
      name: string;
    };
  };
}

interface PoolElection {
  id: string;
  status: string;
  role_id: string;
  nomination_deadline: string;
  voting_start: string;
  voting_end: string;
  pool_leadership_roles: {
    role_name: string;
  };
}

export function PoolManagement({ poolId }: { poolId: string }) {
  const [members, setMembers] = useState<PoolMember[]>([]);
  const [leaders, setLeaders] = useState<PoolLeader[]>([]);
  const [elections, setElections] = useState<PoolElection[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (poolId) {
      fetchPoolData();
    }
  }, [poolId]);

  const fetchPoolData = async () => {
    try {
      setLoading(true);
      
      // Fetch members
      const { data: membersData } = await supabase
        .from('pool_members')
        .select(`
          *,
          users (name, email)
        `)
        .eq('pool_id', poolId);

      // Fetch leaders
      const { data: leadersData } = await supabase
        .from('pool_leaders')
        .select(`
          *,
          pool_leadership_roles (role_name, role_description),
          pool_members (users (name))
        `)
        .eq('pool_id', poolId)
        .eq('is_active', true);

      // Fetch active elections
      const { data: electionsData } = await supabase
        .from('pool_leadership_elections')
        .select(`
          *,
          pool_leadership_roles (role_name)
        `)
        .eq('pool_id', poolId)
        .in('status', ['nomination', 'campaign', 'voting']);

      setMembers(membersData || []);
      setLeaders(leadersData || []);
      setElections(electionsData || []);
    } catch (error) {
      console.error('Error fetching pool data:', error);
    } finally {
      setLoading(false);
    }
  };

  const initiateConfidenceVote = async (leaderId: string) => {
    try {
      const userMember = members.find(m => m.user_id === user?.id);
      if (!userMember) return;

      const { error } = await supabase
        .from('pool_confidence_votes')
        .insert([{
          pool_id: poolId,
          leader_id: leaderId,
          initiated_by: userMember.id,
          voting_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          reason: 'Performance concerns raised by pool member'
        }]);

      if (error) throw error;
      
      await fetchPoolData();
    } catch (error) {
      console.error('Error initiating confidence vote:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading pool management..." />;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="leadership">Leadership</TabsTrigger>
          <TabsTrigger value="elections">Elections</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Pool Members ({members.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{member.users.name}</h4>
                      <p className="text-sm text-gray-600">{member.users.email}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-2">
                        {member.role}
                      </Badge>
                      <div className="text-sm text-gray-600">
                        <p>Committed: ${member.committed_amount.toLocaleString()}</p>
                        <p>Invested: ${member.invested_amount.toLocaleString()}</p>
                        <p>Voting Power: {member.voting_power}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leadership" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Current Leadership
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaders.map((leader) => (
                  <div key={leader.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">
                        {leader.pool_members.users.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {leader.pool_leadership_roles.role_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {leader.pool_leadership_roles.role_description}
                      </p>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm">
                          Rating: {leader.performance_rating}/5.0
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => initiateConfidenceVote(leader.id)}
                      >
                        <Vote className="h-4 w-4 mr-2" />
                        Confidence Vote
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="elections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Elections</CardTitle>
            </CardHeader>
            <CardContent>
              {elections.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No active elections</p>
              ) : (
                <div className="space-y-4">
                  {elections.map((election) => (
                    <div key={election.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">
                          {election.pool_leadership_roles.role_name} Election
                        </h4>
                        <Badge variant="outline">
                          {election.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        {election.nomination_deadline && (
                          <p>Nomination Deadline: {new Date(election.nomination_deadline).toLocaleDateString()}</p>
                        )}
                        {election.voting_start && (
                          <p>Voting: {new Date(election.voting_start).toLocaleDateString()} - {new Date(election.voting_end).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <h3 className="text-2xl font-bold text-green-600">
                    ${members.reduce((sum, m) => sum + m.invested_amount, 0).toLocaleString()}
                  </h3>
                  <p className="text-sm text-gray-600">Total Invested</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <h3 className="text-2xl font-bold text-blue-600">
                    {members.length}
                  </h3>
                  <p className="text-sm text-gray-600">Active Members</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <h3 className="text-2xl font-bold text-purple-600">
                    {leaders.length}
                  </h3>
                  <p className="text-sm text-gray-600">Leadership Roles</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
