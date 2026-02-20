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
import { Package, Plus, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO, isAfter } from "date-fns";

export default function BatchLotManager({ productId, sku }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    batch_number: "",
    location_id: "",
    quantity: 0,
    manufacture_date: "",
    expiry_date: "",
    supplier: "",
    cost_per_unit: 0,
    notes: ""
  });

  const queryClient = useQueryClient();

  const { data: batches = [] } = useQuery({
    queryKey: ['batches', sku],
    queryFn: () => base44.entities.BatchLot.filter({ sku }),
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => base44.entities.InventoryLocation.list(),
  });

  const createBatch = useMutation({
    mutationFn: (data) => base44.entities.BatchLot.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['batches']);
      toast.success("Batch created successfully");
      setShowForm(false);
      setFormData({
        batch_number: "",
        location_id: "",
        quantity: 0,
        manufacture_date: "",
        expiry_date: "",
        supplier: "",
        cost_per_unit: 0,
        notes: ""
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createBatch.mutate({
      product_id: productId,
      sku,
      ...formData,
      quantity: parseFloat(formData.quantity),
      cost_per_unit: parseFloat(formData.cost_per_unit)
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'quarantine': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'depleted': return 'bg-slate-100 text-slate-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = parseISO(expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return isAfter(thirtyDaysFromNow, expiry) && isAfter(expiry, new Date());
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Batch/Lot Tracking</h3>
        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Batch
        </Button>
      </div>

      <div className="space-y-3">
        {batches.map((batch) => (
          <Card key={batch.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="h-4 w-4 text-slate-600" />
                    <span className="font-semibold">Batch: {batch.batch_number}</span>
                    <Badge className={getStatusColor(batch.status)}>
                      {batch.status}
                    </Badge>
                    {batch.expiry_date && isExpiringSoon(batch.expiry_date) && (
                      <Badge className="bg-orange-100 text-orange-800">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Expiring Soon
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">
                    {locations.find(l => l.id === batch.location_id)?.name || 'Unknown Location'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">{batch.quantity}</div>
                  <div className="text-xs text-slate-500">units</div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                {batch.manufacture_date && (
                  <div>
                    <p className="text-slate-500">Manufactured</p>
                    <p className="font-medium">{format(parseISO(batch.manufacture_date), 'MMM d, yyyy')}</p>
                  </div>
                )}
                {batch.expiry_date && (
                  <div>
                    <p className="text-slate-500">Expires</p>
                    <p className="font-medium">{format(parseISO(batch.expiry_date), 'MMM d, yyyy')}</p>
                  </div>
                )}
                {batch.supplier && (
                  <div>
                    <p className="text-slate-500">Supplier</p>
                    <p className="font-medium">{batch.supplier}</p>
                  </div>
                )}
                {batch.cost_per_unit > 0 && (
                  <div>
                    <p className="text-slate-500">Cost/Unit</p>
                    <p className="font-medium">${batch.cost_per_unit}</p>
                  </div>
                )}
              </div>

              {batch.notes && (
                <p className="text-sm text-slate-600 mt-3 pt-3 border-t">{batch.notes}</p>
              )}
            </CardContent>
          </Card>
        ))}

        {batches.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <Package className="h-12 w-12 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">No batches tracked for this product</p>
          </div>
        )}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Batch/Lot</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Batch Number *</Label>
                <Input
                  value={formData.batch_number}
                  onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
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
                <Label>Quantity *</Label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Cost per Unit</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.cost_per_unit}
                  onChange={(e) => setFormData({ ...formData, cost_per_unit: e.target.value })}
                />
              </div>
              <div>
                <Label>Manufacture Date</Label>
                <Input
                  type="date"
                  value={formData.manufacture_date}
                  onChange={(e) => setFormData({ ...formData, manufacture_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Expiry Date</Label>
                <Input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Supplier</Label>
                <Input
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                />
              </div>
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
              <Button type="submit" disabled={createBatch.isPending}>
                Create Batch
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}