import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function InventoryMovementForm({ open, onOpenChange, products, locations }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    product_id: "",
    quantity: "",
    from_location_id: "",
    to_location_id: "",
    movement_type: "transfer",
    notes: ""
  });

  const createMovement = useMutation({
    mutationFn: async (data) => {
      // Create movement record
      const movement = await base44.entities.InventoryMovement.create(data);
      
      // Update product stock levels at locations
      const product = products.find(p => p.id === data.product_id);
      if (product) {
        // Update total stock
        const newStock = (product.current_stock || 0) + (data.movement_type === 'purchase' ? data.quantity : 0) - (data.movement_type === 'sale' ? data.quantity : 0);
        await base44.entities.Product.update(product.id, {
          current_stock: Math.max(0, newStock)
        });

        // Update location stocks
        if (data.from_location_id) {
          const fromStocks = await base44.entities.ProductLocationStock.filter({
            product_id: product.id,
            location_id: data.from_location_id
          });
          if (fromStocks.length > 0) {
            await base44.entities.ProductLocationStock.update(fromStocks[0].id, {
              quantity: Math.max(0, (fromStocks[0].quantity || 0) - data.quantity)
            });
          }
        }

        if (data.to_location_id) {
          const toStocks = await base44.entities.ProductLocationStock.filter({
            product_id: product.id,
            location_id: data.to_location_id
          });
          if (toStocks.length > 0) {
            await base44.entities.ProductLocationStock.update(toStocks[0].id, {
              quantity: (toStocks[0].quantity || 0) + data.quantity
            });
          } else {
            await base44.entities.ProductLocationStock.create({
              product_id: product.id,
              sku: product.sku,
              location_id: data.to_location_id,
              quantity: data.quantity
            });
          }
        }
      }
      
      return movement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["location-stocks"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-movements"] });
      toast.success("Inventory movement recorded");
      setFormData({
        product_id: "",
        quantity: "",
        from_location_id: "",
        to_location_id: "",
        movement_type: "transfer",
        notes: ""
      });
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to record movement");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const product = products.find(p => p.id === formData.product_id);
    
    createMovement.mutate({
      ...formData,
      sku: product?.sku,
      quantity: parseFloat(formData.quantity),
      from_location_id: formData.from_location_id || undefined,
      to_location_id: formData.to_location_id || undefined
    });
  };

  const selectedProduct = products.find(p => p.id === formData.product_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-900">Record Inventory Movement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="product">Product *</Label>
            <Select value={formData.product_id} onValueChange={(v) => setFormData({...formData, product_id: v})}>
              <SelectTrigger>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {products.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProduct && (
              <p className="text-xs text-slate-500">Current stock: {selectedProduct.current_stock || 0}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="movement_type">Movement Type *</Label>
            <Select value={formData.movement_type} onValueChange={(v) => setFormData({...formData, movement_type: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transfer">Transfer Between Locations</SelectItem>
                <SelectItem value="production">Production (Materials → Product)</SelectItem>
                <SelectItem value="purchase">Purchase/Receive</SelectItem>
                <SelectItem value="sale">Sale/Ship Out</SelectItem>
                <SelectItem value="adjustment">Adjustment/Count</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              min="0.01"
              step="0.01"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              placeholder="0"
              required
            />
          </div>

          {(formData.movement_type === 'transfer' || formData.movement_type === 'production' || formData.movement_type === 'sale') && (
            <div className="space-y-2">
              <Label htmlFor="from_location">From Location</Label>
              <Select value={formData.from_location_id} onValueChange={(v) => setFormData({...formData, from_location_id: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.filter(l => l.is_active).map(l => (
                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(formData.movement_type === 'transfer' || formData.movement_type === 'production' || formData.movement_type === 'purchase') && (
            <div className="space-y-2">
              <Label htmlFor="to_location">To Location</Label>
              <Select value={formData.to_location_id} onValueChange={(v) => setFormData({...formData, to_location_id: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.filter(l => l.is_active).map(l => (
                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Add notes about this movement..."
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createMovement.isPending || !formData.product_id || !formData.quantity}
              className="flex-1 bg-slate-900 hover:bg-slate-800"
            >
              {createMovement.isPending ? "Recording..." : "Record Movement"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}