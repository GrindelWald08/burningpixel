import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ExternalLink,
  Copy,
  User,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  Hash,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { generateInvoicePDF } from '@/lib/invoiceGenerator';

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  package_name: string;
  package_id: string | null;
  amount: number;
  status: string;
  payment_method: string | null;
  xendit_invoice_id: string | null;
  xendit_invoice_url: string | null;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  expired_at: string | null;
}

const statusConfig: Record<string, { label: string; icon: React.ReactNode; variant: 'default' | 'secondary' | 'destructive' | 'outline'; color: string }> = {
  pending: { label: 'Menunggu Pembayaran', icon: <Clock className="w-4 h-4" />, variant: 'secondary', color: 'text-yellow-600' },
  paid: { label: 'Pembayaran Berhasil', icon: <CheckCircle className="w-4 h-4" />, variant: 'default', color: 'text-green-600' },
  expired: { label: 'Kedaluwarsa', icon: <AlertCircle className="w-4 h-4" />, variant: 'outline', color: 'text-muted-foreground' },
  failed: { label: 'Gagal', icon: <XCircle className="w-4 h-4" />, variant: 'destructive', color: 'text-destructive' },
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const OrderDetail = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order-detail', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();

      if (error) throw error;
      return data as Order | null;
    },
    enabled: !!orderId && !!user,
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} berhasil disalin`);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Skeleton className="h-8 w-32 mb-6" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32 mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" onClick={() => navigate('/account')} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <Card>
            <CardContent className="py-16 text-center">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Order Tidak Ditemukan</h2>
              <p className="text-muted-foreground mb-6">
                Order yang Anda cari tidak ditemukan atau Anda tidak memiliki akses.
              </p>
              <Button asChild>
                <Link to="/account">Lihat Semua Order</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const status = statusConfig[order.status] || statusConfig.pending;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/account')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Akun
        </Button>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <CardTitle className="text-xl">Detail Order</CardTitle>
                <CardDescription className="mt-1">
                  Dibuat pada {format(new Date(order.created_at), 'dd MMMM yyyy, HH:mm')}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => generateInvoicePDF(order)}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Invoice
                </Button>
                <Badge variant={status.variant} className="flex items-center gap-1.5 w-fit text-sm py-1.5 px-3">
                  {status.icon}
                  {status.label}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Order ID */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Hash className="w-4 h-4" />
                  <span>Order ID</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => copyToClipboard(order.id, 'Order ID')}
                  className="h-8"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Salin
                </Button>
              </div>
              <p className="font-mono text-sm mt-1 break-all">{order.id}</p>
            </div>

            <Separator />

            {/* Package Info */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Informasi Paket
              </h3>
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-muted-foreground">Nama Paket</span>
                  <span className="font-medium text-right max-w-[60%]">{order.package_name}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Pembayaran</span>
                  <span className="text-xl font-bold text-primary">{formatCurrency(order.amount)}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Customer Info */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Informasi Pelanggan
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>{order.customer_name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{order.customer_email}</span>
                </div>
                {order.customer_phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{order.customer_phone}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Payment Info */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Informasi Pembayaran
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`font-medium ${status.color}`}>{status.label}</span>
                </div>
                {order.payment_method && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Metode Pembayaran</span>
                    <span className="font-medium">{order.payment_method}</span>
                  </div>
                )}
                {order.xendit_invoice_id && (
                  <div className="flex justify-between items-start">
                    <span className="text-muted-foreground">Transaction ID</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-right max-w-[180px] truncate">{order.xendit_invoice_id}</span>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(order.xendit_invoice_id!, 'Transaction ID')}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Timeline */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Timeline
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Dibuat</span>
                  <span>{format(new Date(order.created_at), 'dd MMM yyyy, HH:mm')}</span>
                </div>
                {order.paid_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pembayaran Diterima</span>
                    <span className="text-green-600 font-medium">
                      {format(new Date(order.paid_at), 'dd MMM yyyy, HH:mm')}
                    </span>
                  </div>
                )}
                {order.expired_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kedaluwarsa</span>
                    <span>{format(new Date(order.expired_at), 'dd MMM yyyy, HH:mm')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Terakhir Diperbarui</span>
                  <span>{format(new Date(order.updated_at), 'dd MMM yyyy, HH:mm')}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {order.status === 'pending' && order.xendit_invoice_url && (
              <>
                <Separator />
                <div className="pt-2">
                  <Button asChild className="w-full" size="lg">
                    <a 
                      href={order.xendit_invoice_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Bayar Sekarang
                    </a>
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Anda akan diarahkan ke halaman pembayaran Midtrans
                  </p>
                </div>
              </>
            )}

            {order.status === 'paid' && (
              <>
                <Separator />
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-green-800 dark:text-green-200 font-medium">Pembayaran Berhasil</p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Terima kasih! Pesanan Anda sedang diproses.
                  </p>
                </div>
              </>
            )}

            {order.status === 'failed' && (
              <>
                <Separator />
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
                  <XCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
                  <p className="text-destructive font-medium">Pembayaran Gagal</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Silakan buat order baru untuk melanjutkan pembelian.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderDetail;