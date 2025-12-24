import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, LogOut, Package, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminLogin from '@/components/admin/AdminLogin';
import PricingEditor from '@/components/admin/PricingEditor';
import AddPackageForm from '@/components/admin/AddPackageForm';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { usePricingPackages } from '@/hooks/usePricingPackages';

const Admin = () => {
  const { isAuthenticated, isLoading: authLoading, login, logout } = useAdminAuth();
  const { data: packages, isLoading: packagesLoading, refetch } = usePricingPackages();
  const [showAddForm, setShowAddForm] = useState(false);

  if (authLoading) {
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
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Pricing Packages</h2>
                <p className="text-sm text-muted-foreground">
                  Manage your pricing, discounts, and package features
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button size="sm" onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Package
              </Button>
            </div>
          </div>

          {/* Add Package Form */}
          {showAddForm && (
            <div className="mb-6">
              <AddPackageForm onClose={() => setShowAddForm(false)} />
            </div>
          )}

          {/* Packages List */}
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
                Create your first pricing package to get started
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Package
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;