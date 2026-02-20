import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail } from "lucide-react";

export default function InviteUserForm({ open, onOpenChange, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    email: "",
    role: "user"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ email: "", role: "user" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Invite User
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
            <p className="text-xs text-slate-500">They'll receive an invitation email</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select value={formData.role} onValueChange={(v) => setFormData({...formData, role: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  <div>
                    <div className="font-medium">Admin</div>
                    <div className="text-xs text-slate-500">Full access to everything</div>
                  </div>
                </SelectItem>
                <SelectItem value="executive">
                  <div>
                    <div className="font-medium">Executive</div>
                    <div className="text-xs text-slate-500">Dashboard & financial reports</div>
                  </div>
                </SelectItem>
                <SelectItem value="warehouse">
                  <div>
                    <div className="font-medium">Warehouse</div>
                    <div className="text-xs text-slate-500">Product & inventory management</div>
                  </div>
                </SelectItem>
                <SelectItem value="fulfillment">
                  <div>
                    <div className="font-medium">Fulfillment</div>
                    <div className="text-xs text-slate-500">View-only inventory access</div>
                  </div>
                </SelectItem>
                <SelectItem value="user">
                  <div>
                    <div className="font-medium">User</div>
                    <div className="text-xs text-slate-500">No access (assign role later)</div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !formData.email}
              className="flex-1 bg-slate-900 hover:bg-slate-800"
            >
              {isLoading ? "Sending..." : "Send Invitation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}