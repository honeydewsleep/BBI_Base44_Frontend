import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Users, Mail, Shield } from "lucide-react";
import { toast } from "sonner";

import InviteUserForm from "@/components/users/InviteUserForm";
import UserList from "@/components/users/UserList";

export default function UserManagement() {
  const queryClient = useQueryClient();
  const [showInviteForm, setShowInviteForm] = useState(false);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => base44.entities.User.list("-created_date")
  });

  const updateUserRole = useMutation({
    mutationFn: ({ userId, role }) => base44.entities.User.update(userId, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User role updated");
    },
    onError: () => {
      toast.error("Failed to update user role");
    }
  });

  const inviteUser = useMutation({
    mutationFn: ({ email, role }) => base44.users.inviteUser(email, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setShowInviteForm(false);
      toast.success("User invited successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to invite user");
    }
  });

  const roleStats = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">User Management</h1>
            <p className="text-slate-500 mt-1">Invite users and manage access levels</p>
          </div>
          <Button onClick={() => setShowInviteForm(true)} className="bg-slate-900 hover:bg-slate-800">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite User
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Users</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{users.length}</p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Admins</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{roleStats.admin || 0}</p>
                </div>
                <div className="p-3 bg-rose-100 rounded-lg">
                  <Shield className="h-6 w-6 text-rose-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Executives</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{roleStats.executive || 0}</p>
                </div>
                <div className="p-3 bg-violet-100 rounded-lg">
                  <Users className="h-6 w-6 text-violet-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Warehouse</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {(roleStats.warehouse || 0) + (roleStats.fulfillment || 0)}
                  </p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <Users className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Role Guide */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Role Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
                <Badge className="bg-rose-600 mb-2">Admin</Badge>
                <p className="text-sm text-slate-600">Full access to all features and user management</p>
              </div>
              <div className="p-4 bg-violet-50 border border-violet-200 rounded-lg">
                <Badge className="bg-violet-600 mb-2">Executive</Badge>
                <p className="text-sm text-slate-600">Dashboard, financial reports, and analytics</p>
              </div>
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <Badge className="bg-indigo-600 mb-2">Warehouse</Badge>
                <p className="text-sm text-slate-600">Product management and full inventory control</p>
              </div>
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <Badge className="bg-emerald-600 mb-2">Fulfillment</Badge>
                <p className="text-sm text-slate-600">View-only access to warehouse inventory</p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <Badge variant="outline" className="mb-2">User</Badge>
                <p className="text-sm text-slate-600">Default role with no access (assign a role)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User List */}
        <UserList 
          users={users}
          isLoading={isLoading}
          onRoleChange={(userId, role) => updateUserRole.mutate({ userId, role })}
        />

        {/* Invite Form */}
        <InviteUserForm
          open={showInviteForm}
          onOpenChange={setShowInviteForm}
          onSubmit={(data) => inviteUser.mutate(data)}
          isLoading={inviteUser.isPending}
        />
      </div>
    </div>
  );
}