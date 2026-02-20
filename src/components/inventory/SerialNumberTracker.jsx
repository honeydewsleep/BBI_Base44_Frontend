import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Hash, Plus, Search } from "lucide-react";
import { toast } from "sonner";

export default function SerialNumberTracker({ productId, sku }) {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    serial_number: "",
    batch_number: "",
    location_id: "",
    warranty_expiry: "",
    notes: ""
  });

  const queryClient = useQueryClient();

  const { data: serials = [] } = useQuery({
    queryKey: ['serials', sku],
    queryFn: () => base44.entities.SerialNumber.filter({ sku }),
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => base44.entities.InventoryLocation.list(),
  });

  const createSerial = useMutation({
    mutationFn: (data) => base44.entities.SerialNumber.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['serials']);
      toast.success("Serial number added successfully");
      setShowForm(false);
      setFormData({
        serial_number: "",
        batch_number: "",
        location_id: "",
        warranty_expiry: "",
        notes: ""
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createSerial.mutate({
      product_id: productId,
      sku,
      ...formData
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_stock': return 'bg-green-100 text-green-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      case 'reserved': return 'bg-yellow-100 text-yellow-800';
      case 'damaged': return 'bg-red-100 text-red-800';
      case 'returned': return 'bg-purple-100 text-purple-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const filteredSerials = serials.filter(s => 
    s.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.batch_number && s.batch_number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Serial Number Tracking</h3>
        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Serial
        </Button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search serial numbers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        {filteredSerials.map((serial) => (
          <div key={serial.id} className="border rounded-lg p-3 hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Hash className="h-4 w-4 text-slate-600" />
                <div>
                  <p className="font-mono font-semibold text-slate-900">{serial.serial_number}</p>
                  <p className="text-xs text-slate-500">
                    {locations.find(l => l.id === serial.location_id)?.name || 'Unknown Location'}
                    {serial.batch_number && ` • Batch: ${serial.batch_number}`}
                  </p>
                </div>
              </div>
              <Badge className={getStatusColor(serial.status)}>
                {serial.status.replace('_', ' ')}
              </Badge>
            </div>
            {serial.notes && (
              <p className="text-sm text-slate-600 mt-2">{serial.notes}</p>
            )}
          </div>
        ))}

        {filteredSerials.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <Hash className="h-12 w-12 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">
              {searchTerm ? 'No matching serial numbers' : 'No serial numbers tracked for this product'}
            </p>
          </div>
        )}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Serial Number</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Serial Number *</Label>
              <Input
                value={formData.serial_number}
                onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Location *</Label>
              <Select
                value={formData.location_id}
                onValueChange={(value) => setFormData({ ...formData, location_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(loc => (
                    <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Batch Number (Optional)</Label>
              <Input
                value={formData.batch_number}
                onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
              />
            </div>
            <div>
              <Label>Warranty Expiry</Label>
              <Input
                type="date"
                value={formData.warranty_expiry}
                onChange={(e) => setFormData({ ...formData, warranty_expiry: e.target.value })}
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createSerial.isPending}>
                Add Serial
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}