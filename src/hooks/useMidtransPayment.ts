import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateTransactionParams {
  packageId?: string;
  packageName: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
}

interface TransactionResponse {
  orderId: string;
  token: string;
  redirectUrl: string;
}

export const useMidtransPayment = () => {
  const [isLoading, setIsLoading] = useState(false);

  const createTransaction = async (params: CreateTransactionParams): Promise<TransactionResponse | null> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-midtrans-transaction', {
        body: params,
      });

      if (error) {
        console.error('Transaction creation error:', error);
        toast.error('Gagal membuat transaksi pembayaran');
        return null;
      }

      return data as TransactionResponse;
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Terjadi kesalahan saat memproses pembayaran');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createTransaction,
    isLoading,
  };
};
