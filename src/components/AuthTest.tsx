
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const AuthTest = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading authentication...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Authentication Status</CardTitle>
          <CardDescription>Not authenticated</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Please log in to continue.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Authentication Status</CardTitle>
        <CardDescription>Successfully authenticated</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <div className="flex items-center gap-2">
            <strong>Role:</strong>
            <Badge variant="secondary">{user.role}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <strong>KYC Status:</strong>
            <Badge variant={user.kyc_status === 'verified' ? 'default' : 'secondary'}>
              {user.kyc_status}
            </Badge>
          </div>
          {user.phone && <p><strong>Phone:</strong> {user.phone}</p>}
          {user.company && <p><strong>Company:</strong> {user.company}</p>}
        </div>
        
        <div className="pt-4 border-t">
          <Button onClick={logout} variant="outline" className="w-full">
            Logout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
