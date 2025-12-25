import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Mail, Send, Clock, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

type AppRole = 'admin' | 'moderator' | 'user';

interface Invitation {
  id: string;
  email: string;
  role: AppRole;
  status: string;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
}

export const InvitationManager = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AppRole>('user');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: invitations, isLoading } = useQuery({
    queryKey: ['invitations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Invitation[];
    },
  });

  const sendInvitationMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: AppRole }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('send-invitation', {
        body: { email, role },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to send invitation');
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Invitation sent',
        description: `Invitation email sent to ${email}`,
      });
      setEmail('');
      setRole('user');
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to send invitation',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', invitationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Invitation deleted',
        description: 'The invitation has been removed',
      });
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
    onError: () => {
      toast({
        title: 'Failed to delete invitation',
        description: 'Could not delete the invitation',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    sendInvitationMutation.mutate({ email, role });
  };

  const getStatusBadge = (status: string, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date();
    
    if (status === 'accepted') {
      return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Accepted</Badge>;
    }
    if (isExpired || status === 'expired') {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Expired</Badge>;
    }
    return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
  };

  const getRoleBadgeVariant = (role: AppRole) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'moderator': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Send Invitation
          </CardTitle>
          <CardDescription>
            Invite new users to join the platform via email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="w-full sm:w-40 space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(value: AppRole) => setRole(value)}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                type="submit" 
                disabled={sendInvitationMutation.isPending || !email}
                className="w-full sm:w-auto"
              >
                <Send className="w-4 h-4 mr-2" />
                {sendInvitationMutation.isPending ? 'Sending...' : 'Send Invite'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sent Invitations</CardTitle>
          <CardDescription>
            Track the status of all sent invitations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading invitations...</div>
          ) : !invitations || invitations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No invitations sent yet</div>
          ) : (
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{invitation.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Sent {format(new Date(invitation.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={getRoleBadgeVariant(invitation.role)}>
                      {invitation.role}
                    </Badge>
                    {getStatusBadge(invitation.status, invitation.expires_at)}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteInvitationMutation.mutate(invitation.id)}
                      disabled={deleteInvitationMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
