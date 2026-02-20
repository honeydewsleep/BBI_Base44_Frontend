import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function LocationForm({ open, onOpenChange, onSubmit, location, isLoading }) {
  const [formData, setFormData] = useState({
    name: "",
    type: "warehouse",
    address: "",
    manager: "",
    is_active: true
  });

  useEffect(() => {
    if (location) {
      setFormData({
        name: location.name || "",
        type: location.type || "warehouse",
        address: location.address || "",
        manager: location.manager || "",
        is_active: location.is_active !== false
      });
    } else {
      setFormData({
        name: "",
        type: "warehouse",
        address: "",
        manager: "",
        is_active: true
      });
    }
  }, [location, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-900">
            {location ? 'Edit Location' : 'Add New Location'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Location Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Main Warehouse, Production Floor, etc."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="warehouse">Warehouse</SelectItem>
                <SelectItem value="production">Production</SelectItem>
                <SelectItem value="stock">Finished Stock</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              placeholder="Physical address..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manager">Manager</Label>
            <Input
              id="manager"
              value={formData.manager}
              onChange={(e) => setFormData({...formData, manager: e.target.value})}
              placeholder="Manager name"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <Label htmlFor="is_active" className="text-sm font-medium">Active Location</Label>
              <p className="text-xs text-slate-500 mt-1">Inactive locations can't receive inventory</p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !formData.name}
              className="flex-1 bg-slate-900 hover:bg-slate-800"
            >
              {isLoading ? "Saving..." : location ? "Update Location" : "Add Location"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}