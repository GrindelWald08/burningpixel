import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Analytics {
  totalUsers: number;
  totalPortfolioItems: number;
  totalPricingPackages: number;
  pendingInvitations: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  portfolioByCategory: { category: string; count: number }[];
  recentSignups: { email: string; created_at: string }[];
}

export function useAnalytics() {
  return useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async (): Promise<Analytics> => {
      // Get total users count
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get total portfolio items
      const { count: totalPortfolioItems } = await supabase
        .from('portfolio_items')
        .select('*', { count: 'exact', head: true });

      // Get total pricing packages
      const { count: totalPricingPackages } = await supabase
        .from('pricing_packages')
        .select('*', { count: 'exact', head: true });

      // Get pending invitations
      const { count: pendingInvitations } = await supabase
        .from('invitations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get new users this week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const { count: newUsersThisWeek } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneWeekAgo.toISOString());

      // Get new users this month
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const { count: newUsersThisMonth } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneMonthAgo.toISOString());

      // Get portfolio items by category
      const { data: portfolioData } = await supabase
        .from('portfolio_items')
        .select('category');
      
      const categoryCount: Record<string, number> = {};
      portfolioData?.forEach(item => {
        categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
      });
      const portfolioByCategory = Object.entries(categoryCount).map(([category, count]) => ({
        category,
        count,
      }));

      // Get recent signups (last 5)
      const { data: recentSignupsData } = await supabase
        .from('profiles')
        .select('email, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      return {
        totalUsers: totalUsers || 0,
        totalPortfolioItems: totalPortfolioItems || 0,
        totalPricingPackages: totalPricingPackages || 0,
        pendingInvitations: pendingInvitations || 0,
        newUsersThisWeek: newUsersThisWeek || 0,
        newUsersThisMonth: newUsersThisMonth || 0,
        portfolioByCategory,
        recentSignups: recentSignupsData?.map(s => ({
          email: s.email || 'Unknown',
          created_at: s.created_at,
        })) || [],
      };
    },
  });
}
