import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, LogOut, Package, RefreshCw, Image as ImageIcon, Shield, Users, Mail, BarChart3, Activity, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLogin from '@/components/admin/AdminLogin';
import PricingEditor from '@/components/admin/PricingEditor';
import AddPackageForm from '@/components/admin/AddPackageForm';
import PortfolioEditor from '@/components/admin/PortfolioEditor';
import AddPortfolioForm from '@/components/admin/AddPortfolioForm';
import UserManagement from '@/components/admin/UserManagement';
import { InvitationManager } from '@/components/admin/InvitationManager';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';
import { ActivityLogs } from '@/components/admin/ActivityLogs';
import { OrderManagement } from '@/components/admin/OrderManagement';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAdminRole } from '@/hooks/useAdminRole';
import { useAuth } from '@/hooks/useAuth';
import { usePricingPackages } from '@/hooks/usePricingPackages';
import { useAllPortfolioItems } from '@/hooks/usePortfolioItems';

const Admin = () => {
  const { isAuthenticated: isPasswordAuth, isLoading: passwordAuthLoading, login, logout: passwordLogout } = useAdminAuth();
  const { isAdmin, isLoading: roleLoading, user } = useAdminRole();
  const { signOut } = useAuth();
  const { data: packages, isLoading: packagesLoading, refetch: refetchPackages } = usePricingPackages();
  const { data: portfolioItems, isLoading: portfolioLoading, refetch: refetchPortfolio } = useAllPortfolioItems();
  const [showAddPackageForm, setShowAddPackageForm] = useState(false);
  const [showAddPortfolioForm, setShowAddPortfolioForm] = useState(false);

  // Check if user is authenticated either by password or by role
  const isAuthenticated = isPasswordAuth || isAdmin;
  const isLoading = passwordAuthLoading || roleLoading;

  const handleLogout = async () => {
    passwordLogout();
    await signOut();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={login} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Site
                </Button>
              </Link>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
              {isAdmin && user && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                  <Shield className="w-3 h-3" />
                  {user.email}
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="analytics" className="w-full">
            <TabsList className="grid w-full grid-cols-7 mb-6">
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span className="hidden sm:inline">Orders</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">Activity</span>
              </TabsTrigger>
              <TabsTrigger value="pricing" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline">Pricing</span>
              </TabsTrigger>
              <TabsTrigger value="portfolio" className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Portfolio</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Users</span>
              </TabsTrigger>
              <TabsTrigger value="invitations" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span className="hidden sm:inline">Invites</span>
              </TabsTrigger>
            </TabsList>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Analytics Overview</h2>
                  <p className="text-sm text-muted-foreground">
                    System statistics and metrics
                  </p>
                </div>
              </div>
              <AnalyticsDashboard />
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Order Management</h2>
                  <p className="text-sm text-muted-foreground">
                    View and manage payment orders
                  </p>
                </div>
              </div>
              <OrderManagement />
            </TabsContent>

            {/* Activity Logs Tab */}
            <TabsContent value="activity">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Activity Logs</h2>
                  <p className="text-sm text-muted-foreground">
                    Track user actions and events
                  </p>
                </div>
              </div>
              <ActivityLogs />
            </TabsContent>

            {/* Pricing Tab */}
            <TabsContent value="pricing">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Pricing Packages</h2>
                    <p className="text-sm text-muted-foreground">
                      Manage pricing, discounts, and features
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => refetchPackages()}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button size="sm" onClick={() => setShowAddPackageForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Package
                  </Button>
                </div>
              </div>

              {showAddPackageForm && (
                <div className="mb-6">
                  <AddPackageForm onClose={() => setShowAddPackageForm(false)} />
                </div>
              )}

              {packagesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
                </div>
              ) : packages && packages.length > 0 ? (
                <div className="space-y-4">
                  {packages.map((pkg) => (
                    <PricingEditor key={pkg.id} pkg={pkg} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-card rounded-xl border border-border">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No packages yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first pricing package
                  </p>
                  <Button onClick={() => setShowAddPackageForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Package
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Portfolio Tab */}
            <TabsContent value="portfolio">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Portfolio Items</h2>
                    <p className="text-sm text-muted-foreground">
                      Manage your project showcase
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => refetchPortfolio()}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button size="sm" onClick={() => setShowAddPortfolioForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </div>

              {showAddPortfolioForm && (
                <div className="mb-6">
                  <AddPortfolioForm onClose={() => setShowAddPortfolioForm(false)} />
                </div>
              )}

              {portfolioLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
                </div>
              ) : portfolioItems && portfolioItems.length > 0 ? (
                <div className="space-y-4">
                  {portfolioItems.map((item) => (
                    <PortfolioEditor key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-card rounded-xl border border-border">
                  <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No portfolio items yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first project to showcase
                  </p>
                  <Button onClick={() => setShowAddPortfolioForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">User Management</h2>
                  <p className="text-sm text-muted-foreground">
                    Manage user roles and permissions
                  </p>
                </div>
              </div>

              <UserManagement />
            </TabsContent>

            {/* Invitations Tab */}
            <TabsContent value="invitations">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Email Invitations</h2>
                  <p className="text-sm text-muted-foreground">
                    Invite new users via email
                  </p>
                </div>
              </div>

              <InvitationManager />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Admin;
