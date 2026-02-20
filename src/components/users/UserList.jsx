import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Calendar, Shield } from "lucide-react";
import { format } from "date-fns";

const ROLE_COLORS = {
  admin: "bg-rose-600",
  executive: "bg-violet-600",
  warehouse: "bg-indigo-600",
  fulfillment: "bg-emerald-600",
  user: "bg-slate-400"
};

export default function UserList({ users, isLoading, onRoleChange }) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-slate-500">
          Loading users...
        </CardContent>
      </Card>
    );
  }

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Shield className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No users yet</h3>
          <p className="text-slate-500">Invite your first user to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="p-2 bg-slate-100 rounded-lg flex-shrink-0">
                  <Shield className="h-5 w-5 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900 truncate">{user.full_name}</h3>
                    <Badge className={`${ROLE_COLORS[user.role]} text-white capitalize`}>
                      {user.role}
                    </Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    {user.created_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Joined {format(new Date(user.created_date), 'MMM d, yyyy')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Select
                  value={user.role}
                  onValueChange={(newRole) => onRoleChange(user.id, newRole)}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                    <SelectItem value="warehouse">Warehouse</SelectItem>
                    <SelectItem value="fulfillment">Fulfillment</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}