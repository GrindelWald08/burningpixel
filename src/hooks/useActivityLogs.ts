import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

interface ActivityLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action: string;
  description: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

export function useActivityLogs(limit = 50) {
  return useQuery({
    queryKey: ['activity-logs', limit],
    queryFn: async (): Promise<ActivityLog[]> => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      return (data || []).map(log => ({
        ...log,
        metadata: (log.metadata as Record<string, unknown>) || {},
      }));
    },
  });
}

export async function logActivity(
  action: string,
  description?: string,
  metadata?: Record<string, unknown>
) {
  const { data: { user } } = await supabase.auth.getUser();
  
  await supabase.from('activity_logs').insert([{
    user_id: user?.id || null,
    user_email: user?.email || null,
    action,
    description,
    metadata: (metadata || {}) as Json,
  }]);
}
