import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  BarChart3,
  CheckCircle,
  Star,
  Award,
  Globe,
  Lock,
  Clock,
  Target,
  Lightbulb,
  Sun,
  Moon,
  Menu,
  X
} from "lucide-react";
import { useTheme } from 'next-themes';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { canInstall, installPWA, isOnline } = usePWA();
  const { theme, setTheme } = useTheme();

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center">
                  <Target className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
                  <span className="ml-2 text-lg sm:text-xl font-bold text-gray-900">Venture Growth Hub</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
                variant="ghost"
                size="sm"
                className="text-gray-700 hover:text-indigo-600"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button 
                onClick={() => navigate('/login')} 
                variant="ghost"
                size="sm"
                className="text-gray-700 hover:text-indigo-600 text-sm sm:text-base"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate('/signup')} 
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm sm:text-base"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 md:pt-20 pb-12 sm:pb-16">
          <div className="text-center">
            <div className="mb-6 sm:mb-8">
              <div className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full bg-indigo-100 text-indigo-800 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                <span className="hidden sm:inline">Trusted by 1000+ entrepreneurs and investors</span>
                <span className="sm:hidden">Trusted by 1000+ users</span>
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight px-2">
              The Future of
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 block sm:inline"> Investment</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed px-4">
              Connect entrepreneurs, investors, and service providers in a comprehensive investment ecosystem with 
              <span className="font-semibold text-indigo-600"> secure escrow</span>, 
              <span className="font-semibold text-purple-600"> AI-powered insights</span>, and 
              <span className="font-semibold text-green-600"> automated compliance</span>.
            </p>
            
            {!isOnline && (
              <div className="bg-orange-100 border border-orange-300 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 max-w-md mx-auto mx-4">
                <p className="text-orange-800 text-sm sm:text-base">You're currently offline. Limited functionality available.</p>
              </div>
            )}

            {canInstall && (
              <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 max-w-md mx-auto mx-4">
                <p className="text-blue-800 mb-2 text-sm sm:text-base">Install this app for the best experience!</p>
                <Button onClick={handleInstallApp} variant="outline" size="sm">
                  Install App
                </Button>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4">
              <Button 
                onClick={() => navigate('/signup')} 
                size="lg"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button 
                onClick={() => navigate('/login')} 
                size="lg"
                variant="outline"
                className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold border-2 hover:bg-gray-50"
              >
                Sign In
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto px-4">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-indigo-600">$50M+</div>
                <div className="text-gray-600 text-sm sm:text-base">Total Investments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600">500+</div>
                <div className="text-gray-600 text-sm sm:text-base">Opportunities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-600">1000+</div>
                <div className="text-gray-600 text-sm sm:text-base">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">99.9%</div>
                <div className="text-gray-600 text-sm sm:text-base">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Types Section */}
      <div className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Built for Everyone</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Whether you're an entrepreneur seeking funding, an investor looking for opportunities, 
              or a service provider offering expertise, we have the tools you need.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg" onClick={() => handleQuickAction('create-opportunity')}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                  <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Entrepreneurs</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Create opportunities and manage investments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-xs sm:text-sm text-gray-600 space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Create investment opportunities</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Manage milestones & progress</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Generate detailed reports</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Access AI insights</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg" onClick={() => handleQuickAction('browse-opportunities')}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                  <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Investors & Pools</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Discover and invest in opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-xs sm:text-sm text-gray-600 space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 mr-2 flex-shrink-0" />
                    <span>Browse curated opportunities</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 mr-2 flex-shrink-0" />
                    <span>Make secure investments</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 mr-2 flex-shrink-0" />
                    <span>Track portfolio performance</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 mr-2 flex-shrink-0" />
                    <span>Access AI risk analysis</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Service Providers</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Offer professional services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-xs sm:text-sm text-gray-600 space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500 mr-2 flex-shrink-0" />
                    <span>Manage service requests</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500 mr-2 flex-shrink-0" />
                    <span>Upload credentials securely</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500 mr-2 flex-shrink-0" />
                    <span>Track earnings & payments</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500 mr-2 flex-shrink-0" />
                    <span>Provide endorsements</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                  <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-gray-600" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Administrators</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Manage the entire platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-xs sm:text-sm text-gray-600 space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 mr-2 flex-shrink-0" />
                    <span>Comprehensive user management</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 mr-2 flex-shrink-0" />
                    <span>Payment oversight & escrow</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 mr-2 flex-shrink-0" />
                    <span>Platform settings & security</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 mr-2 flex-shrink-0" />
                    <span>Analytics & reporting</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Platform Features Section */}
      <div className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Powerful Platform Features</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Advanced tools and features designed to streamline your investment process and maximize success.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg bg-white" onClick={() => handleQuickAction('escrow')}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg">Secure Escrow</CardTitle>
                    <CardDescription className="text-sm">Protected fund holding</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-gray-600">
                  Automated release conditions, dispute resolution, and secure fund management for all transactions.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg bg-white" onClick={() => handleQuickAction('pools')}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg">Investment Pools</CardTitle>
                    <CardDescription className="text-sm">Collective opportunities</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-gray-600">
                  Pool resources with other investors, vote on opportunities, and benefit from automated distributions.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg bg-white">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg">AI Insights</CardTitle>
                    <CardDescription className="text-sm">Machine learning powered</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-gray-600">
                  Advanced risk assessment, investment recommendations, and market analysis powered by AI.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg bg-white" onClick={() => handleQuickAction('documents')}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg">Smart Documents</CardTitle>
                    <CardDescription className="text-sm">Automated generation</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-gray-600">
                  Customizable templates, e-signatures, and automated document generation for all agreements.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg bg-white">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg">Observer System</CardTitle>
                    <CardDescription className="text-sm">Stakeholder monitoring</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-gray-600">
                  Invite stakeholders to monitor progress with controlled access permissions and real-time updates.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg bg-white" onClick={() => handleQuickAction('reports')}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg">Analytics</CardTitle>
                    <CardDescription className="text-sm">Comprehensive reporting</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-gray-600">
                  Detailed performance tracking, insights, and analytics for informed decision-making.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Why Choose Venture Growth Hub?</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              We're not just another investment platform. We're your complete ecosystem for growth and success.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Bank-Level Security</h3>
              <p className="text-sm sm:text-base text-gray-600 px-2">
                Enterprise-grade security with encryption, secure escrow, and compliance with financial regulations.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">24/7 Availability</h3>
              <p className="text-sm sm:text-base text-gray-600 px-2">
                Access your investments anytime, anywhere with our mobile-optimized platform and PWA support.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <Lightbulb className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">AI-Powered Insights</h3>
              <p className="text-sm sm:text-base text-gray-600 px-2">
                Make informed decisions with our advanced AI that analyzes market trends and investment opportunities.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Global Network</h3>
              <p className="text-sm sm:text-base text-gray-600 px-2">
                Connect with entrepreneurs and investors worldwide through our extensive network and partnerships.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <Award className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Proven Track Record</h3>
              <p className="text-sm sm:text-base text-gray-600 px-2">
                Trusted by thousands of users with millions in successful investments and growing.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <Target className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Focused on Growth</h3>
              <p className="text-sm sm:text-base text-gray-600 px-2">
                Every feature is designed to help you grow your business and maximize your investment returns.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
            Ready to Start Your Investment Journey?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-indigo-100 mb-6 sm:mb-8 px-4">
            Join thousands of entrepreneurs and investors who are already growing with us.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button 
              onClick={() => navigate('/signup')} 
              size="lg"
              className="bg-white text-indigo-600 hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button 
              onClick={() => navigate('/login')} 
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-indigo-600 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <div className="flex items-center mb-3 sm:mb-4">
                <Target className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-400" />
                <span className="ml-2 text-lg sm:text-xl font-bold">Venture Growth Hub</span>
              </div>
              <p className="text-sm sm:text-base text-gray-400">
                The future of investment is here. Connect, grow, and succeed with our comprehensive platform.
              </p>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Platform</h3>
              <ul className="space-y-2 text-sm sm:text-base text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Support</h3>
              <ul className="space-y-2 text-sm sm:text-base text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Company</h3>
              <ul className="space-y-2 text-sm sm:text-base text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-sm sm:text-base text-gray-400">
            <p>&copy; 2024 Venture Growth Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
