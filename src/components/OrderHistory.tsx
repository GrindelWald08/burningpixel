import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Clock, CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  package_name: string;
  amount: number;
  status: string;
  payment_method: string | null;
  xendit_invoice_url: string | null;
  created_at: string;
  paid_at: string | null;
}

const statusConfig: Record<string, { label: string; icon: React.ReactNode; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pending', icon: <Clock className="w-3 h-3" />, variant: 'secondary' },
  paid: { label: 'Paid', icon: <CheckCircle className="w-3 h-3" />, variant: 'default' },
  expired: { label: 'Expired', icon: <AlertCircle className="w-3 h-3" />, variant: 'outline' },
  failed: { label: 'Failed', icon: <XCircle className="w-3 h-3" />, variant: 'destructive' },
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const OrderHistory = () => {
  const { user } = useAuth();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['user-orders', user?.id],
    queryFn: async () => {
      if (!user?.id && !user?.email) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>Your payment transactions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>Your payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No orders yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your order history will appear here after you make a purchase
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
        <CardDescription>Your payment transactions ({orders.length} orders)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {orders.map((order) => {
          const status = statusConfig[order.status] || statusConfig.pending;
          
          return (
            <div 
              key={order.id} 
              className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground truncate">{order.package_name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(order.created_at), 'dd MMM yyyy, HH:mm')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end gap-4">
                <div className="text-right">
                  <p className="font-semibold text-foreground">{formatCurrency(order.amount)}</p>
                  {order.paid_at && (
                    <p className="text-xs text-muted-foreground">
                      Paid {format(new Date(order.paid_at), 'dd MMM yyyy')}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={status.variant} className="flex items-center gap-1">
                    {status.icon}
                    {status.label}
                  </Badge>
                  
                  {order.status === 'pending' && order.xendit_invoice_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a 
                        href={order.xendit_invoice_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Pay
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default OrderHistory;
