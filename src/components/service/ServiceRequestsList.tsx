
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Calendar, DollarSign } from 'lucide-react';
import { useServiceRequests } from '@/hooks/useServiceRequests';
import { format } from 'date-fns';
import LoadingSpinner from '@/components/ui/loading-spinner';

const statusColors = {
  'pending_acceptance': 'bg-yellow-100 text-yellow-800',
  'accepted': 'bg-green-100 text-green-800',
  'declined': 'bg-red-100 text-red-800',
  'negotiating': 'bg-blue-100 text-blue-800',
  'cancelled': 'bg-gray-100 text-gray-800',
  'completed': 'bg-green-100 text-green-800'
};

export function ServiceRequestsList() {
  const { requests, loading, error } = useServiceRequests();

  if (loading) {
    return <LoadingSpinner text="Loading service requests..." />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-600">Error loading service requests: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No service requests found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card key={request.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">
                  {request.service_categories?.name || 'Service Request'}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {request.scope_description.substring(0, 100)}
                  {request.scope_description.length > 100 ? '...' : ''}
                </p>
              </div>
              <Badge className={statusColors[request.status as keyof typeof statusColors]}>
                {request.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {request.start_date && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Start: {format(new Date(request.start_date), 'MMM dd, yyyy')}
                </div>
              )}
              {request.end_date && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  End: {format(new Date(request.end_date), 'MMM dd, yyyy')}
                </div>
              )}
              {request.proposed_budget && (
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Budget: ${request.proposed_budget.toLocaleString()}
                </div>
              )}
            </div>

            {request.deliverables.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Deliverables:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {request.deliverables.map((deliverable, index) => (
                    <li key={index}>{deliverable}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
