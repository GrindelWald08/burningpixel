import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export const usePortfolioItems = () => {
  return useQuery({
    queryKey: ['portfolio-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_items')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as PortfolioItem[];
    },
  });
};

export const useAllPortfolioItems = () => {
  return useQuery({
    queryKey: ['portfolio-items-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_items')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as PortfolioItem[];
    },
  });
};

export const useUpdatePortfolioItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Partial<PortfolioItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('portfolio_items')
        .update(item)
        .eq('id', item.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-items'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-items-all'] });
    },
  });
};

export const useCreatePortfolioItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Omit<PortfolioItem, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('portfolio_items')
        .insert(item)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-items'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-items-all'] });
    },
  });
};

export const useDeletePortfolioItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('portfolio_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-items'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-items-all'] });
    },
  });
};

export const uploadPortfolioImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('portfolio')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('portfolio')
    .getPublicUrl(fileName);

  return data.publicUrl;
};

export const deletePortfolioImage = async (imageUrl: string) => {
  const fileName = imageUrl.split('/').pop();
  if (!fileName) return;

  await supabase.storage
    .from('portfolio')
    .remove([fileName]);
};