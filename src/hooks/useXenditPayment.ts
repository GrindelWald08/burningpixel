import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateInvoiceParams {
  packageId?: string;
  packageName: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
}

interface InvoiceResponse {
  orderId: string;
  invoiceId: string;
  invoiceUrl: string;
  expiryDate: string;
}

export const useXenditPayment = () => {
  const [isLoading, setIsLoading] = useState(false);

  const createInvoice = async (params: CreateInvoiceParams): Promise<InvoiceResponse | null> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-xendit-invoice', {
        body: params,
      });

      if (error) {
        console.error('Invoice creation error:', error);
        toast.error('Gagal membuat invoice pembayaran');
        return null;
      }

      return data as InvoiceResponse;
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Terjadi kesalahan saat memproses pembayaran');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createInvoice,
    isLoading,
  };
};
