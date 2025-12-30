import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { pricingPackageSchema } from '@/lib/validation';

export interface PricingPackage {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string | null;
  features: string[];
  is_popular: boolean;
  discount_percentage: number;
  discount_label: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const usePricingPackages = () => {
  return useQuery({
    queryKey: ['pricing-packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_packages')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as PricingPackage[];
    },
  });
};

export const useUpdatePricingPackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pkg: Partial<PricingPackage> & { id: string }) => {
      // Validate input (partial validation for updates)
      const validationResult = pricingPackageSchema.partial().safeParse(pkg);
      if (!validationResult.success) {
        throw new Error(validationResult.error.errors[0]?.message || 'Validation failed');
      }
      
      const { data, error } = await supabase
        .from('pricing_packages')
        .update(pkg)
        .eq('id', pkg.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-packages'] });
    },
  });
};

export const useCreatePricingPackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pkg: Omit<PricingPackage, 'id' | 'created_at' | 'updated_at'>) => {
      // Validate input
      const validationResult = pricingPackageSchema.safeParse(pkg);
      if (!validationResult.success) {
        throw new Error(validationResult.error.errors[0]?.message || 'Validation failed');
      }
      
      const { data, error } = await supabase
        .from('pricing_packages')
        .insert(pkg)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-packages'] });
    },
  });
};

export const useDeletePricingPackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pricing_packages')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-packages'] });
    },
  });
};