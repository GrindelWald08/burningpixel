import { Activity, User, LogIn, Settings, Key, UserPlus, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { formatDistanceToNow } from 'date-fns';

const actionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  login: LogIn,
  signup: UserPlus,
  profile_update: Settings,
  password_change: Key,
  default: Activity,
};

const actionColors: Record<string, string> = {
  login: 'bg-green-500/10 text-green-600',
  signup: 'bg-blue-500/10 text-blue-600',
  profile_update: 'bg-purple-500/10 text-purple-600',
  password_change: 'bg-orange-500/10 text-orange-600',
  default: 'bg-muted text-muted-foreground',
};

export function ActivityLogs() {
  const { data: logs, isLoading, refetch } = useActivityLogs(50);

  const getIcon = (action: string) => {
    return actionIcons[action] || actionIcons.default;
  };

  const getColor = (action: string) => {
    return actionColors[action] || actionColors.default;
  };

  const formatAction = (action: string) => {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="w-5 h-5 text-primary" />
          User Activity Logs
        </CardTitle>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {logs && logs.length > 0 ? (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {logs.map((log) => {
              const Icon = getIcon(log.action);
              return (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className={`p-2 rounded-full ${getColor(log.action)}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {formatAction(log.action)}
                      </Badge>
                      {log.user_email && (
                        <span className="text-sm font-medium text-foreground flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {log.user_email}
                        </span>
                      )}
                    </div>
                    {log.description && (
                      <p className="text-sm text-muted-foreground mt-1">{log.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No activity logs yet</h3>
            <p className="text-muted-foreground text-sm">
              User actions will appear here as they occur
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
