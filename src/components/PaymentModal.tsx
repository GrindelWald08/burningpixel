import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMidtransPayment } from '@/hooks/useMidtransPayment';
import { Loader2, CreditCard, CheckCircle } from 'lucide-react';

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
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  });
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

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
    setFormData({ customerName: '', customerEmail: '', customerPhone: '' });
    setRedirectUrl(null);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

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

        {!redirectUrl ? (
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
              />
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
