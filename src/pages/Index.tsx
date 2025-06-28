import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { usePWA } from "@/contexts/PWAContext";
import { toast } from "sonner";
import { 
  Plus, 
  Search, 
  FileText, 
  Users, 
  TrendingUp, 
  Shield, 
  Zap,
  ArrowRight,
  Briefcase,
  DollarSign,
  Settings,
  BarChart3
} from "lucide-react";

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

  const handleQuickAction = (action: string) => {
    if (!isAuthenticated) {
      toast.info("Please log in to access this feature");
      navigate('/login');
      return;
    }
    
    switch (action) {
      case 'create-opportunity':
        navigate('/entrepreneur/create-opportunity');
        break;
      case 'browse-opportunities':
        navigate('/investor');
        break;
      case 'documents':
        navigate('/entrepreneur/documents');
        break;
      case 'escrow':
        navigate('/admin/escrow');
        break;
      case 'pools':
        navigate('/admin/pools');
        break;
      case 'reports':
        navigate('/admin/reports');
        break;
      default:
        break;
    }
  };

  if (isAuthenticated) {
    return null; // Will redirect above
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="flex items-center justify-center p-4 pt-16">
        <div className="w-full max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              Investment Portal
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect entrepreneurs, investors, and service providers in a comprehensive investment ecosystem with secure escrow, AI-powered insights, and automated compliance.
            </p>
            
            {!isOnline && (
              <div className="bg-orange-100 border border-orange-300 rounded-lg p-4 mb-6 max-w-md mx-auto">
                <p className="text-orange-800">You're currently offline. Limited functionality available.</p>
              </div>
            )}

            {canInstall && (
              <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-6 max-w-md mx-auto">
                <p className="text-blue-800 mb-2">Install this app for the best experience!</p>
                <Button onClick={handleInstallApp} variant="outline">
                  Install App
                </Button>
              </div>
            )}

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Button 
                onClick={() => handleQuickAction('create-opportunity')}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create Opportunity
              </Button>
              <Button 
                onClick={() => handleQuickAction('browse-opportunities')}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
              >
                <Search className="mr-2 h-5 w-5" />
                Browse Opportunities
              </Button>
              <Button 
                onClick={() => handleQuickAction('documents')}
                size="lg"
                variant="outline"
                className="px-6 py-3"
              >
                <FileText className="mr-2 h-5 w-5" />
                View Documents
              </Button>
            </div>

            <Button 
              onClick={() => navigate('/login')} 
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <div className="mt-4 flex gap-4 justify-center">
              <Button 
                onClick={() => navigate('/login')} 
                variant="outline"
                size="lg"
                className="px-6 py-3"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate('/signup')} 
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleQuickAction('create-opportunity')}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-6 w-6 text-green-600" />
                  <CardTitle className="text-lg">Entrepreneurs</CardTitle>
                </div>
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

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleQuickAction('browse-opportunities')}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                  <CardTitle className="text-lg">Investors & Pools</CardTitle>
                </div>
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

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-purple-600" />
                  <CardTitle className="text-lg">Service Providers</CardTitle>
                </div>
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

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings className="h-6 w-6 text-gray-600" />
                  <CardTitle className="text-lg">Administrators</CardTitle>
                </div>
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

          {/* Platform Features */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Platform Features</h2>
            <p className="text-gray-600 mb-8">Advanced tools and features to streamline your investment process</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleQuickAction('escrow')}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-green-600" />
                  <CardTitle className="text-lg">Secure Escrow</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Protected fund holding with automated release conditions and dispute resolution.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleQuickAction('pools')}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                  <CardTitle className="text-lg">Investment Pools</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Collective investment opportunities with voting systems and automated distributions.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="h-6 w-6 text-yellow-600" />
                  <CardTitle className="text-lg">AI Insights</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Machine learning-powered risk assessment and investment recommendations.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleQuickAction('documents')}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-purple-600" />
                  <CardTitle className="text-lg">Smart Documents</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Automated document generation with customizable templates and e-signatures.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-indigo-600" />
                  <CardTitle className="text-lg">Observer System</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Invite stakeholders to monitor progress with controlled access permissions.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleQuickAction('reports')}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-red-600" />
                  <CardTitle className="text-lg">Analytics</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Comprehensive reporting and analytics for performance tracking and insights.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
