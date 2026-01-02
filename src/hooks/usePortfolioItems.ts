import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { portfolioItemSchema, sanitizeUrl } from '@/lib/validation';
import { compressImage } from '@/lib/imageCompression';
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
      // Validate input (partial validation for updates)
      const validationResult = portfolioItemSchema.partial().safeParse(item);
      if (!validationResult.success) {
        throw new Error(validationResult.error.errors[0]?.message || 'Validation failed');
      }
      
      // Sanitize URLs if provided
      const sanitizedItem = {
        ...item,
        ...(item.image_url !== undefined && { image_url: item.image_url ? sanitizeUrl(item.image_url) : null }),
        ...(item.link_url !== undefined && { link_url: item.link_url ? sanitizeUrl(item.link_url) : null }),
      };
      
      const { data, error } = await supabase
        .from('portfolio_items')
        .update(sanitizedItem)
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
      // Validate input
      const validationResult = portfolioItemSchema.safeParse(item);
      if (!validationResult.success) {
        throw new Error(validationResult.error.errors[0]?.message || 'Validation failed');
      }
      
      // Sanitize URLs
      const sanitizedItem = {
        ...item,
        image_url: item.image_url ? sanitizeUrl(item.image_url) : null,
        link_url: item.link_url ? sanitizeUrl(item.link_url) : null,
      };
      
      const { data, error } = await supabase
        .from('portfolio_items')
        .insert(sanitizedItem)
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
  // Compress image before uploading (max 1200px, 80% quality)
  const compressedFile = await compressImage(file, 1200, 1200, 0.8);
  
  const fileExt = compressedFile.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('portfolio')
    .upload(fileName, compressedFile);

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