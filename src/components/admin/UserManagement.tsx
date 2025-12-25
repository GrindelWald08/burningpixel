import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  ShieldCheck, 
  ShieldX, 
  Search, 
  UserPlus,
  Trash2,
  Loader2
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type AppRole = 'admin' | 'moderator' | 'user';

interface UserWithRoles {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  roles: AppRole[];
}

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [addingRoleFor, setAddingRoleFor] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all profiles with their roles
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Combine profiles with their roles
      const usersWithRoles: UserWithRoles[] = (profiles || []).map((profile) => ({
        id: profile.id,
        user_id: profile.user_id,
        email: profile.email,
        full_name: profile.full_name,
        created_at: profile.created_at,
        roles: (roles || [])
          .filter((r) => r.user_id === profile.user_id)
          .map((r) => r.role as AppRole),
      }));

      return usersWithRoles;
    },
  });

  // Add role mutation
  const addRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'Role added successfully' });
      setAddingRoleFor(null);
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Failed to add role', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  // Remove role mutation
  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'Role removed successfully' });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Failed to remove role', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const filteredUsers = users?.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.email?.toLowerCase().includes(searchLower) ||
      user.full_name?.toLowerCase().includes(searchLower)
    );
  });

  const getRoleBadgeVariant = (role: AppRole) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'moderator':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const availableRoles: AppRole[] = ['admin', 'moderator', 'user'];

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search users by email or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredUsers && filteredUsers.length > 0 ? (
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-card border border-border rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-foreground truncate">
                      {user.full_name || 'No name'}
                    </h3>
                    {user.roles.includes('admin') && (
                      <ShieldCheck className="w-4 h-4 text-destructive flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {user.email}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Joined {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {/* Current Roles */}
                  <div className="flex flex-wrap gap-1 justify-end">
                    {user.roles.length > 0 ? (
                      user.roles.map((role) => (
                        <div key={role} className="flex items-center gap-1">
                          <Badge variant={getRoleBadgeVariant(role)}>
                            {role}
                          </Badge>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button className="p-1 hover:bg-destructive/10 rounded transition-colors">
                                <Trash2 className="w-3 h-3 text-destructive" />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Role</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove the "{role}" role from {user.email}?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => removeRoleMutation.mutate({ userId: user.user_id, role })}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ))
                    ) : (
                      <Badge variant="outline">No roles</Badge>
                    )}
                  </div>

                  {/* Add Role */}
                  {addingRoleFor === user.user_id ? (
                    <div className="flex items-center gap-1">
                      {availableRoles
                        .filter((role) => !user.roles.includes(role))
                        .map((role) => (
                          <Button
                            key={role}
                            size="sm"
                            variant="outline"
                            onClick={() => addRoleMutation.mutate({ userId: user.user_id, role })}
                            disabled={addRoleMutation.isPending}
                          >
                            {role}
                          </Button>
                        ))}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setAddingRoleFor(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setAddingRoleFor(user.user_id)}
                      className="text-xs"
                    >
                      <UserPlus className="w-3 h-3 mr-1" />
                      Add Role
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {searchTerm ? 'No users found' : 'No users yet'}
          </h3>
          <p className="text-muted-foreground">
            {searchTerm ? 'Try a different search term' : 'Users will appear here after they sign up'}
          </p>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
