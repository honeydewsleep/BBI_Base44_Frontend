import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function CustomerForm({ open, onOpenChange, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    status: "active",
    channel: "d2c",
    tags: "",
    notes: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const tags = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    onSubmit({
      ...formData,
      tags
    });
    setFormData({
      name: "",
      email: "",
      company: "",
      status: "active",
      channel: "d2c",
      tags: "",
      notes: ""
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-900">Add Customer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-700">Name</Label>
            <Input
              id="name"
              placeholder="Customer name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="text-slate-700">Company (optional)</Label>
            <Input
              id="company"
              placeholder="Company name"
              value={formData.company}
              onChange={(e) => setFormData({...formData, company: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status" className="text-slate-700">Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="channel" className="text-slate-700">Channel</Label>
              <Select value={formData.channel} onValueChange={(v) => setFormData({...formData, channel: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wholesale">Wholesale</SelectItem>
                  <SelectItem value="d2c">D2C</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags" className="text-slate-700">Tags (optional)</Label>
            <Input
              id="tags"
              placeholder="VIP, Premium, Retail (comma separated)"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
            />
            <p className="text-xs text-slate-500">Separate multiple tags with commas</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-slate-700">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add notes about this customer..."
              className="resize-none"
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !formData.name || !formData.email}
              className="flex-1 bg-violet-600 hover:bg-violet-700"
            >
              {isLoading ? "Adding..." : "Add Customer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}