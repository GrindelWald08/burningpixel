import { Users, Image, Package, Mail, TrendingUp, Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAnalytics } from '@/hooks/useAnalytics';
import { formatDistanceToNow } from 'date-fns';

export function AnalyticsDashboard() {
  const { data: analytics, isLoading } = useAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const stats = [
    {
      title: 'Total Users',
      value: analytics.totalUsers,
      icon: Users,
      description: `+${analytics.newUsersThisWeek} this week`,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Portfolio Items',
      value: analytics.totalPortfolioItems,
      icon: Image,
      description: `${analytics.portfolioByCategory.length} categories`,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Pricing Packages',
      value: analytics.totalPricingPackages,
      icon: Package,
      description: 'Active packages',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Pending Invitations',
      value: analytics.pendingInvitations,
      icon: Mail,
      description: 'Awaiting response',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
              User Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">This Week</span>
                </div>
                <span className="text-lg font-semibold text-foreground">+{analytics.newUsersThisWeek}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">This Month</span>
                </div>
                <span className="text-lg font-semibold text-foreground">+{analytics.newUsersThisMonth}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Image className="w-5 h-5 text-primary" />
              Portfolio by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.portfolioByCategory.length > 0 ? (
              <div className="space-y-3">
                {analytics.portfolioByCategory.map((cat) => (
                  <div key={cat.category} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground capitalize">{cat.category}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${(cat.count / analytics.totalPortfolioItems) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-foreground w-6 text-right">{cat.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No portfolio items yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Signups */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5 text-primary" />
            Recent Signups
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.recentSignups.length > 0 ? (
            <div className="space-y-3">
              {analytics.recentSignups.map((signup, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{signup.email}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(signup.created_at), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No recent signups</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
