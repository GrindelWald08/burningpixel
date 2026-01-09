import { useSearchParams, useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PaymentFailed = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order_id');

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
          <XCircle className="w-10 h-10 text-destructive" />
        </div>
        
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Pembayaran Gagal
          </h1>
          <p className="text-muted-foreground">
            Maaf, pembayaran Anda tidak dapat diproses. Silakan coba lagi atau hubungi kami untuk bantuan.
          </p>
        </div>

        {orderId && (
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Order ID</p>
            <p className="font-mono text-sm">{orderId}</p>
          </div>
        )}

        <div className="space-y-3">
          <Button onClick={() => navigate('/#harga')} className="w-full">
            Coba Lagi
          </Button>
          <Button onClick={() => navigate('/')} variant="outline" className="w-full">
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
