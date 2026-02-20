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
import { ClipboardCheck, Plus, AlertTriangle, Check } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function StockCountManager() {
  const [showForm, setShowForm] = useState(false);
  const [selectedCount, setSelectedCount] = useState(null);
  const [formData, setFormData] = useState({
    location_id: "",
    count_date: new Date().toISOString().split('T')[0],
    notes: ""
  });

  const queryClient = useQueryClient();

  const { data: stockCounts = [] } = useQuery({
    queryKey: ['stockCounts'],
    queryFn: () => base44.entities.StockCount.list('-count_date', 50),
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => base44.entities.InventoryLocation.list(),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const { data: stockByLocation = [] } = useQuery({
    queryKey: ['stockByLocation'],
    queryFn: () => base44.entities.ProductLocationStock.list(),
  });

  const createCount = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.StockCount.create({
        ...data,
        counted_by: user.email,
        total_items_counted: 0,
        discrepancies_found: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['stockCounts']);
      toast.success("Stock count created");
      setShowForm(false);
    },
  });

  const handleCreateCount = (e) => {
    e.preventDefault();
    createCount.mutate(formData);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'reviewed': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Stock Counts</h2>
          <p className="text-slate-500">Perform and track inventory stock counts</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Stock Count
        </Button>
      </div>

      <div className="grid gap-4">
        {stockCounts.map((count) => {
          const location = locations.find(l => l.id === count.location_id);
          return (
            <Card key={count.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <ClipboardCheck className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{location?.name || 'Unknown Location'}</h3>
                      <p className="text-sm text-slate-500">
                        {format(new Date(count.count_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(count.status)}>
                    {count.status.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Items Counted</p>
                    <p className="text-lg font-semibold">{count.total_items_counted || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Discrepancies</p>
                    <p className="text-lg font-semibold text-orange-600">
                      {count.discrepancies_found || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Counted By</p>
                    <p className="text-sm font-medium">{count.counted_by || 'N/A'}</p>
                  </div>
                </div>

                {count.notes && (
                  <p className="text-sm text-slate-600 mt-3 pt-3 border-t">{count.notes}</p>
                )}
              </CardContent>
            </Card>
          );
        })}

        {stockCounts.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-slate-500">
              <ClipboardCheck className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p>No stock counts performed yet</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Stock Count</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCount} className="space-y-4">
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
              <Label>Count Date *</Label>
              <Input
                type="date"
                value={formData.count_date}
                onChange={(e) => setFormData({ ...formData, count_date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional notes about this count"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createCount.isPending}>
                Start Count
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}