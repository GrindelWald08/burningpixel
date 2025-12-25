import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, LogOut, Package, RefreshCw, Image as ImageIcon, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLogin from '@/components/admin/AdminLogin';
import PricingEditor from '@/components/admin/PricingEditor';
import AddPackageForm from '@/components/admin/AddPackageForm';
import PortfolioEditor from '@/components/admin/PortfolioEditor';
import AddPortfolioForm from '@/components/admin/AddPortfolioForm';
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
          <Tabs defaultValue="pricing" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="pricing" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Pricing
              </TabsTrigger>
              <TabsTrigger value="portfolio" className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Portfolio
              </TabsTrigger>
            </TabsList>

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
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Admin;
