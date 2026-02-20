import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Package } from "lucide-react";
import { toast } from "sonner";

export default function LocationTransferForm() {
  const [formData, setFormData] = useState({
    sku: "",
    from_location_id: "",
    to_location_id: "",
    quantity: 0,
    notes: ""
  });

  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => base44.entities.InventoryLocation.list(),
  });

  const { data: stockByLocation = [] } = useQuery({
    queryKey: ['stockByLocation'],
    queryFn: () => base44.entities.ProductLocationStock.list(),
  });

  const transferStock = useMutation({
    mutationFn: async (data) => {
      const product = products.find(p => p.sku === data.sku);
      if (!product) throw new Error("Product not found");

      // Create movement record
      await base44.entities.InventoryMovement.create({
        product_id: product.id,
        sku: data.sku,
        quantity: data.quantity,
        from_location_id: data.from_location_id,
        to_location_id: data.to_location_id,
        movement_type: "transfer",
        notes: data.notes
      });

      // Update from location stock
      const fromStock = stockByLocation.find(
        s => s.sku === data.sku && s.location_id === data.from_location_id
      );
      if (fromStock) {
        await base44.entities.ProductLocationStock.update(fromStock.id, {
          quantity: (fromStock.quantity || 0) - data.quantity
        });
      }

      // Update to location stock
      const toStock = stockByLocation.find(
        s => s.sku === data.sku && s.location_id === data.to_location_id
      );
      if (toStock) {
        await base44.entities.ProductLocationStock.update(toStock.id, {
          quantity: (toStock.quantity || 0) + data.quantity
        });
      } else {
        await base44.entities.ProductLocationStock.create({
          product_id: product.id,
          sku: data.sku,
          location_id: data.to_location_id,
          quantity: data.quantity
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['stockByLocation']);
      queryClient.invalidateQueries(['inventoryMovements']);
      toast.success("Stock transferred successfully");
      setFormData({
        sku: "",
        from_location_id: "",
        to_location_id: "",
        quantity: 0,
        notes: ""
      });
    },
    onError: (error) => {
      toast.error(error.message || "Transfer failed");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.from_location_id === formData.to_location_id) {
      toast.error("Source and destination locations must be different");
      return;
    }

    const fromStock = stockByLocation.find(
      s => s.sku === formData.sku && s.location_id === formData.from_location_id
    );

    if (!fromStock || fromStock.quantity < formData.quantity) {
      toast.error("Insufficient stock at source location");
      return;
    }

    transferStock.mutate(formData);
  };

  const selectedProduct = products.find(p => p.sku === formData.sku);
  const availableStock = formData.from_location_id
    ? stockByLocation.find(
        s => s.sku === formData.sku && s.location_id === formData.from_location_id
      )?.quantity || 0
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Transfer Stock Between Locations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Product *</Label>
            <Select
              value={formData.sku}
              onValueChange={(value) => setFormData({ ...formData, sku: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {products.map(product => (
                  <SelectItem key={product.id} value={product.sku}>
                    {product.name} ({product.sku})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <Label>From Location *</Label>
              <Select
                value={formData.from_location_id}
                onValueChange={(value) => setFormData({ ...formData, from_location_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(loc => (
                    <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.from_location_id && (
                <p className="text-xs text-slate-500 mt-1">
                  Available: {availableStock} units
                </p>
              )}
            </div>

            <div className="flex justify-center">
              <ArrowRight className="h-6 w-6 text-slate-400" />
            </div>

            <div>
              <Label>To Location *</Label>
              <Select
                value={formData.to_location_id}
                onValueChange={(value) => setFormData({ ...formData, to_location_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Destination" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(loc => (
                    <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Quantity to Transfer *</Label>
            <Input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
              max={availableStock}
              required
            />
          </div>

          <div>
            <Label>Notes</Label>
            <Input
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Optional transfer notes"
            />
          </div>

          <Button 
            type="submit" 
            disabled={transferStock.isPending || !formData.sku || !formData.from_location_id || !formData.to_location_id}
            className="w-full"
          >
            {transferStock.isPending ? "Transferring..." : "Transfer Stock"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}