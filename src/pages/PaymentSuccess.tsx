import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    // Log page view
    console.log('Payment success for order:', orderId);
  }, [orderId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Pembayaran Berhasil!
          </h1>
          <p className="text-muted-foreground">
            Terima kasih atas pembayaran Anda. Kami akan segera memproses pesanan Anda.
          </p>
        </div>

        {orderId && (
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Order ID</p>
            <p className="font-mono text-sm">{orderId}</p>
          </div>
        )}

        <div className="space-y-3">
          <Button onClick={() => navigate('/')} className="w-full">
            Kembali ke Beranda
          </Button>
          <p className="text-xs text-muted-foreground">
            Detail pembayaran akan dikirim ke email Anda
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
