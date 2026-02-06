import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMidtransPayment } from '@/hooks/useMidtransPayment';
import { Loader2, CreditCard, CheckCircle, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageId: string;
  packageName: string;
  amount: number;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID').format(price);
};

const PaymentModal = ({ isOpen, onClose, packageId, packageName, amount }: PaymentModalProps) => {
  const { createTransaction, isLoading } = useMidtransPayment();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  });
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  // Pre-fill form with user data when authenticated
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        customerEmail: user.email || '',
        customerName: user.user_metadata?.full_name || prev.customerName,
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.customerEmail) {
      return;
    }

    const result = await createTransaction({
      packageId,
      packageName,
      amount,
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      customerPhone: formData.customerPhone || undefined,
    });

    if (result) {
      setRedirectUrl(result.redirectUrl);
    }
  };

  const handlePayNow = () => {
    if (redirectUrl) {
      window.open(redirectUrl, '_blank');
      onClose();
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({ 
      customerName: user?.user_metadata?.full_name || '', 
      customerEmail: user?.email || '', 
      customerPhone: '' 
    });
    setRedirectUrl(null);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const handleLoginRedirect = () => {
    onClose();
    navigate('/auth', { state: { returnTo: '/#harga' } });
  };

  // Show login prompt if not authenticated
  if (!authLoading && !user) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogIn className="w-5 h-5 text-primary" />
              Login Diperlukan
            </DialogTitle>
            <DialogDescription>
              Silakan login untuk melanjutkan pembelian paket {packageName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-center py-4">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Anda perlu login</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Untuk keamanan transaksi, silakan login atau buat akun terlebih dahulu.
              </p>
            </div>
            <div className="pt-4 border-t space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Paket</span>
                <span className="font-medium">{packageName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Harga</span>
                <span className="text-xl font-bold text-primary">Rp {formatPrice(amount)}</span>
              </div>
            </div>
            <Button onClick={handleLoginRedirect} className="w-full" variant="hero">
              <LogIn className="w-4 h-4 mr-2" />
              Login / Daftar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Pembayaran
          </DialogTitle>
          <DialogDescription>
            {packageName} - Rp {formatPrice(amount)}
          </DialogDescription>
        </DialogHeader>

        {authLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !redirectUrl ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Nama Lengkap *</Label>
              <Input
                id="customerName"
                placeholder="Masukkan nama lengkap"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email *</Label>
              <Input
                id="customerEmail"
                type="email"
                placeholder="email@example.com"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                required
                disabled={!!user?.email}
              />
              {user?.email && (
                <p className="text-xs text-muted-foreground">
                  Email terkait dengan akun Anda
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPhone">Nomor Telepon (Opsional)</Label>
              <Input
                id="customerPhone"
                type="tel"
                placeholder="08xxxxxxxxxx"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              />
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-4">
                <span className="text-muted-foreground">Total Pembayaran</span>
                <span className="text-xl font-bold text-primary">Rp {formatPrice(amount)}</span>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Lanjutkan Pembayaran'
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Transaksi Berhasil Dibuat</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Klik tombol di bawah untuk melanjutkan pembayaran
              </p>
            </div>
            <Button onClick={handlePayNow} className="w-full" variant="hero">
              Bayar Sekarang
            </Button>
            <p className="text-xs text-muted-foreground">
              Anda akan diarahkan ke halaman pembayaran Midtrans
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
