
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { usePWA } from "@/contexts/PWAContext";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { canInstall, installPWA, isOnline } = usePWA();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect to appropriate dashboard based on user role
      switch (user.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'entrepreneur':
          navigate('/entrepreneur');
          break;
        case 'investor':
        case 'pool':
          navigate('/investor');
          break;
        case 'service_provider':
          navigate('/service-provider');
          break;
        default:
          break;
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleInstallApp = () => {
    installPWA();
  };

  if (isAuthenticated) {
    return null; // Will redirect above
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Investment Portal
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Connect entrepreneurs, investors, and service providers in a comprehensive investment ecosystem
          </p>
          
          {!isOnline && (
            <div className="bg-orange-100 border border-orange-300 rounded-lg p-4 mb-6">
              <p className="text-orange-800">You're currently offline. Limited functionality available.</p>
            </div>
          )}

          {canInstall && (
            <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-6">
              <p className="text-blue-800 mb-2">Install this app for the best experience!</p>
              <Button onClick={handleInstallApp} variant="outline">
                Install App
              </Button>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Entrepreneurs</CardTitle>
              <CardDescription>
                Create opportunities and manage investments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Create investment opportunities</li>
                <li>• Manage milestones</li>
                <li>• Track progress</li>
                <li>• Generate reports</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Investors & Pools</CardTitle>
              <CardDescription>
                Discover and invest in opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Browse opportunities</li>
                <li>• Make investment offers</li>
                <li>• Track investments</li>
                <li>• Access AI insights</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Service Providers</CardTitle>
              <CardDescription>
                Offer professional services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Manage service requests</li>
                <li>• Upload credentials</li>
                <li>• Track earnings</li>
                <li>• Provide endorsements</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Administrators</CardTitle>
              <CardDescription>
                Manage the entire platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• User management</li>
                <li>• Payment oversight</li>
                <li>• Platform settings</li>
                <li>• Analytics & reports</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button 
            onClick={() => navigate('/login')} 
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
